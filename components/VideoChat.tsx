"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "../lib/socket";

const ICE_CONFIG: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoChat({
    selfName,
    externalRoom,
    autoJoin,
    onLeave,
    onRemoteConnected,
}: {
    selfName: string;
    externalRoom?: string | null;
    /** change this value (e.g. timestamp) to force auto-join re-attempt */
    autoJoin?: unknown;
    onLeave?: () => void;
    onRemoteConnected?: () => void;
}) {
    const [room, setRoom] = useState("room-1");
    const [joined, setJoined] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [peerName, setPeerName] = useState<string>("Peer");
    const [remoteStatus, setRemoteStatus] = useState<
        "idle" | "connecting" | "connected" | "left"
    >("idle");
    const [chatOpen, setChatOpen] = useState(false);
    interface ChatMessage {
        id: string;
        roomId: string;
        text: string;
        fromUserId: string;
        fromName: string;
        ts: number;
    }
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const update = () => setIsMobile(mq.matches);
        update();
        try {
            mq.addEventListener("change", update);
        } catch {
            // Safari fallback
            mq.addListener(update);
        }
        return () => {
            try {
                mq.removeEventListener("change", update);
            } catch {
                mq.removeListener(update);
            }
        };
    }, []);

    const socket = useMemo(() => getSocket(), []);

    useEffect(() => {
        function handleJoin() {
            // If the other peer joined, caller creates offer
            if (pcRef.current && pcRef.current.signalingState === "stable") {
                makeOffer();
            }
            setRemoteStatus("connecting");
            // Send our display name to the newly joined peer
            try {
                socket.emit("name", selfName);
            } catch {}
        }

        async function handleOffer(offer: RTCSessionDescriptionInit) {
            await ensurePC();
            await pcRef.current!.setRemoteDescription(
                new RTCSessionDescription(offer)
            );
            const answer = await pcRef.current!.createAnswer();
            await pcRef.current!.setLocalDescription(answer);
            socket.emit("answer", answer);
        }

        async function handleAnswer(answer: RTCSessionDescriptionInit) {
            if (!pcRef.current) return;
            await pcRef.current.setRemoteDescription(
                new RTCSessionDescription(answer)
            );
        }

        async function handleCandidate(candidate: RTCIceCandidateInit) {
            if (!pcRef.current) return;
            try {
                await pcRef.current.addIceCandidate(
                    new RTCIceCandidate(candidate)
                );
            } catch (e) {
                console.error("Failed to add ICE candidate", e);
            }
        }

        function handlePeerDisconnected(msg: string) {
            console.log(msg);
            // Clear only remote media so the host keeps self-view
            try {
                pcRef.current?.getReceivers().forEach((r) => r.track?.stop());
            } catch {}
            if (remoteVideoRef.current) {
                try {
                    const src = remoteVideoRef.current
                        .srcObject as MediaStream | null;
                    src?.getTracks().forEach((t) => t.stop());
                } catch {}
                remoteVideoRef.current.srcObject = null;
            }
            setRemoteStatus("left");
        }

        socket.on("join", handleJoin);
        socket.on("offer", handleOffer);
        socket.on("answer", handleAnswer);
        socket.on("candidate", handleCandidate);
        socket.on("roomFull", (r: string) => alert(`Room ${r} is full`));
        socket.on("roomClosed", (r: string) => {
            console.log("Room closed", r);
            try {
                alert("The meeting was closed by the host");
            } catch {}
            cleanupPeer();
            setJoined(false);
            setRemoteStatus("idle");
        });
        socket.on("peerDisconnected", handlePeerDisconnected);
        socket.on("name", (n: string) => {
            if (n && typeof n === "string") setPeerName(n);
        });
        socket.on("chat:message", (m: ChatMessage) => {
            setMessages((prev) => [...prev.slice(-199), m]);
        });

        return () => {
            socket.off("join", handleJoin);
            socket.off("offer", handleOffer);
            socket.off("answer", handleAnswer);
            socket.off("candidate", handleCandidate);
            socket.off("roomFull");
            socket.off("roomClosed");
            socket.off("peerDisconnected", handlePeerDisconnected);
            socket.off("name");
            socket.off("chat:message");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, selfName]);

    async function ensurePC() {
        if (pcRef.current) return pcRef.current;
        const pc = new RTCPeerConnection(ICE_CONFIG);
        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("candidate", e.candidate.toJSON());
            }
        };
        pc.ontrack = (e) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = e.streams[0];
            }
            setRemoteStatus("connected");
            onRemoteConnected?.();
        };

        // Get mic+camera (always acquire both, then toggle via enabled flags)
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        localStreamRef.current
            .getAudioTracks()
            .forEach((t) => (t.enabled = micOn));
        localStreamRef.current
            .getVideoTracks()
            .forEach((t) => (t.enabled = camOn));
        localStreamRef.current
            .getTracks()
            .forEach((t) => pc.addTrack(t, localStreamRef.current!));
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
        }

        pcRef.current = pc;
        return pc;
    }

    async function makeOffer() {
        await ensurePC();
        const offer = await pcRef.current!.createOffer();
        await pcRef.current!.setLocalDescription(offer);
        socket.emit("offer", offer);
    }

    function cleanupPeer() {
        pcRef.current?.getSenders().forEach((s) => {
            try {
                s.track?.stop();
            } catch {}
        });
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        pcRef.current?.close();
        pcRef.current = null;
        localStreamRef.current = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    }

    async function handleJoinRoom() {
        setJoined(true);
        await ensurePC();
        socket.emit("join", room);
        // Share our name to remote right after joining
        socket.emit("name", selfName);
        setRemoteStatus("connecting");
    }

    function handleLeave() {
        setJoined(false);
        socket.emit("leave");
        cleanupPeer();
        onLeave?.();
    }

    function sendChat() {
        if (!chatInput.trim()) return;
        socket.emit("chat:message", {
            text: chatInput.trim(),
            fromName: selfName,
        });
        setChatInput("");
    }

    // Ensure room slot is freed even if tab closes/navigates
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (joined) socket.emit("leave");
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            if (joined) socket.emit("leave");
        };
    }, [joined, socket]);

    function toggleMic() {
        setMicOn((prev) => {
            const next = !prev;
            localStreamRef.current
                ?.getAudioTracks()
                .forEach((t) => (t.enabled = next));
            return next;
        });
    }

    function toggleCam() {
        setCamOn((prev) => {
            const next = !prev;
            localStreamRef.current
                ?.getVideoTracks()
                .forEach((t) => (t.enabled = next));
            return next;
        });
    }

    // Auto join when externalRoom provided
    useEffect(() => {
        if (externalRoom && !joined) {
            setRoom(externalRoom);
            // slight delay to ensure state updates
            setTimeout(() => {
                if (!joined) handleJoinRoom();
            }, 50);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [externalRoom, autoJoin]);

    return (
        <div className="w-full min-h-0 flex flex-col">
            {!joined ? (
                <div className="max-w-xl mx-auto bg-white/70 dark:bg-black/40 backdrop-blur rounded-xl p-4 shadow-lg flex flex-col gap-3">
                    <h2 className="text-lg font-semibold">Join a room</h2>
                    <div className="flex gap-2">
                        <input
                            className="flex-1 border border-white/20 bg-white/60 dark:bg-white/10 px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            placeholder="Room name"
                        />
                        <button
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium"
                            onClick={handleJoinRoom}
                        >
                            Join
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative mx-auto w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl sm:aspect-video min-h-[55vh] sm:min-h-[260px]">
                    {/* Liquid glass gradient border */}
                    <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-br from-white/50 via-white/20 to-white/5 pointer-events-none" />
                    <div className="absolute inset-[2px] rounded-3xl border border-white/15 bg-black/70 backdrop-blur-xl overflow-hidden">
                        {/* Remote video fills the stage */}
                        <video
                            ref={remoteVideoRef}
                            className="absolute inset-0 w-full h-full object-cover"
                            autoPlay
                            playsInline
                        />

                        {/* Remote peer name label */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 border border-white/20 text-white text-sm shadow">
                            {peerName}
                        </div>

                        {/* Remote status overlay */}
                        {remoteStatus !== "connected" && (
                            <div className="absolute inset-0 grid place-items-center">
                                <div className="px-4 py-2 rounded-xl bg-black/50 backdrop-blur-md text-white border border-white/20 shadow-lg">
                                    {remoteStatus === "connecting" &&
                                        "Connecting to peer..."}
                                    {remoteStatus === "idle" &&
                                        "Waiting for a participant..."}
                                    {remoteStatus === "left" &&
                                        "Peer left the meeting"}
                                </div>
                            </div>
                        )}

                        {/* Local self-view as PiP bottom-right */}
                        <div className="absolute bottom-3 right-3 w-32 h-20 xs:w-36 xs:h-24 sm:bottom-4 sm:right-4 sm:w-40 sm:h-28 md:w-56 md:h-36 rounded-xl overflow-hidden shadow-xl border border-white/20 bg-black/60">
                            <video
                                ref={localVideoRef}
                                className="w-full h-full object-cover"
                                autoPlay
                                playsInline
                                muted
                            />
                            {/* Self name label */}
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/60 border border-white/20 text-white text-xs">
                                {selfName}
                            </div>
                            {!camOn && (
                                <div className="absolute inset-0 grid place-items-center bg-black/70 text-white text-sm">
                                    Camera off
                                </div>
                            )}
                        </div>

                        {/* Controls bar */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 sm:bottom-4 flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-xl saturate-150 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border border-white/20 shadow-xl">
                            <button
                                onClick={toggleMic}
                                title={micOn ? "Mute" : "Unmute"}
                                aria-label={
                                    micOn
                                        ? "Mute microphone"
                                        : "Unmute microphone"
                                }
                                className={`size-10 sm:size-12 rounded-full grid place-items-center shadow-md transition ring-1 ${
                                    micOn
                                        ? "bg-white text-black ring-black/10 hover:bg-white"
                                        : "bg-red-600 text-white ring-red-700/50 hover:bg-red-500"
                                }`}
                            >
                                {micOn ? (
                                    // Mic on icon
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="size-6"
                                    >
                                        <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm-1 2.917V20h2v-3.083A7.002 7.002 0 0 0 19 10h-2a5 5 0 0 1-10 0H5a7.002 7.002 0 0 0 6 6.917Z" />
                                    </svg>
                                ) : (
                                    // Mic off icon
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="size-6"
                                    >
                                        <path d="M3.28 2.22 2.22 3.28l18.5 18.5 1.06-1.06-5.102-5.102A6.97 6.97 0 0 0 19 10h-2a5 5 0 0 1-.975 2.957l-1.473-1.473A3.98 3.98 0 0 0 15 11V6a3 3 0 1 0-6 0v.586L3.28 2.22Zm8.72 12.78a3 3 0 0 0 3-3v-.586l-4.414-4.414A1 1 0 0 0 10 6v5a3 3 0 0 0 2 2.816V20h-2v-3.083A7.002 7.002 0 0 1 5 10H3a9.002 9.002 0 0 0 7 8.717V22h4v-3.283c.734-.175 1.428-.44 2.068-.783l-2.07-2.07A6.97 6.97 0 0 1 12 15Z" />
                                    </svg>
                                )}
                            </button>

                            <button
                                onClick={toggleCam}
                                title={
                                    camOn ? "Turn camera off" : "Turn camera on"
                                }
                                aria-label={
                                    camOn ? "Turn camera off" : "Turn camera on"
                                }
                                className={`size-10 sm:size-12 rounded-full grid place-items-center shadow-md transition ring-1 ${
                                    camOn
                                        ? "bg-white text-black ring-black/10 hover:bg-white"
                                        : "bg-red-600 text-white ring-red-700/50 hover:bg-red-500"
                                }`}
                            >
                                {camOn ? (
                                    // Camera on icon
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="size-6"
                                    >
                                        <path d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4V6.5l-4 4Z" />
                                    </svg>
                                ) : (
                                    // Camera off icon
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="size-6"
                                    >
                                        <path d="M2.22 3.28 3.28 2.22l18.5 18.5-1.06 1.06-3.72-3.72V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7c0-.26.05-.51.146-.74L2.22 3.28ZM19 8.5l4-4v11l-4-4V17a4 4 0 0 1-.152 1.093l-1.977-1.977V7a2 2 0 0 0-2-2H7.884l-2-2H15a4 4 0 0 1 4 4v1.5Z" />
                                    </svg>
                                )}
                            </button>

                            <button
                                onClick={handleLeave}
                                title="Leave"
                                aria-label="Leave call"
                                className="size-10 sm:size-12 rounded-full grid place-items-center bg-red-600 hover:bg-red-500 text-white shadow-md ring-1 ring-red-700/50"
                            >
                                {/* Phone hang-up icon */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="size-6 rotate-45"
                                >
                                    <path d="M6.62 10.79a15.05 15.05 0 0 1 10.59 0l1.06.44a2 2 0 0 1 1.2 2.58l-.66 1.66a2 2 0 0 1-2.39 1.2l-2.04-.58a2 2 0 0 1-1.38-1.26l-.19-.57a11.05 11.05 0 0 0-2.03 0l-.19.57a2 2 0 0 1-1.38 1.26l-2.04.58a2 2 0 0 1-2.39-1.2l-.66-1.66a2 2 0 0 1 1.2-2.58l1.06-.44Z" />
                                </svg>
                            </button>

                            <button
                                onClick={() => setChatOpen((p) => !p)}
                                title="Toggle chat"
                                aria-label="Toggle chat"
                                className={`size-10 sm:size-12 rounded-full grid place-items-center shadow-md transition ring-1 bg-white text-black ring-black/10 hover:bg-white ${
                                    chatOpen ? "outline outline-teal-400" : ""
                                }`}
                            >
                                {/* Chat icon */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="size-6"
                                >
                                    <path d="M4 4h16v12H7.17L4 19.17V4Zm2 2v8.83L7.83 13H18V6H6Zm3 3h2v2H9V9Zm6 0h-4v2h4V9Z" />
                                </svg>
                            </button>
                        </div>

                        {/* Room label */}
                        <div className="absolute top-4 left-4 text-white/90 text-sm bg-black/40 px-2 py-1 rounded-full border border-white/20">
                            Room: {room}
                        </div>
                    </div>
                    {chatOpen && !isMobile && (
                        <div className="absolute top-4 right-4 w-72 h-[60%] flex flex-col bg-black/70 backdrop-blur-xl rounded-xl border border-white/15 shadow-2xl overflow-hidden">
                            <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                                <span className="text-sm font-medium text-white/80">
                                    Chat
                                </span>
                                <button
                                    onClick={() => setChatOpen(false)}
                                    className="text-white/50 hover:text-white text-xs"
                                >
                                    Close
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
                                {messages.length === 0 && (
                                    <div className="text-white/40 text-xs">
                                        No messages yet
                                    </div>
                                )}
                                {messages.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex flex-col gap-0.5"
                                    >
                                        <div className="text-[11px] uppercase tracking-wide text-white/40">
                                            {m.fromName}{" "}
                                            <span className="text-white/30">
                                                •{" "}
                                                {new Date(
                                                    m.ts
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        <div className="text-white/90 leading-snug break-words">
                                            {m.text}
                                        </div>
                                    </div>
                                ))}
                                <div id="chat-bottom" />
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendChat();
                                }}
                                className="p-2 border-t border-white/10 flex items-center gap-2 bg-black/40"
                            >
                                <input
                                    value={chatInput}
                                    onChange={(e) =>
                                        setChatInput(e.target.value)
                                    }
                                    placeholder="Type a message"
                                    className="flex-1 bg-white/10 focus:bg-white/15 text-white placeholder-white/40 px-3 py-2 rounded-md text-xs outline-none focus:ring-2 focus:ring-teal-400/60"
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim()}
                                    className="px-3 py-2 rounded-md bg-teal-500 disabled:opacity-40 hover:bg-teal-400 text-white text-xs font-medium shadow"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    )}
                    {chatOpen && isMobile && (
                        <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-md sheet-shadow animate-slide-up">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                                <h3 className="text-base font-medium text-white">
                                    Chat
                                </h3>
                                <button
                                    onClick={() => setChatOpen(false)}
                                    aria-label="Close chat"
                                    className="text-white/60 hover:text-white text-lg leading-none"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                                {messages.length === 0 && (
                                    <div className="text-white/40 text-xs text-center pt-4">
                                        No messages yet
                                    </div>
                                )}
                                {messages.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex flex-col gap-0.5"
                                    >
                                        <div className="text-[11px] font-semibold tracking-wide text-white/50">
                                            {m.fromName}{" "}
                                            <span className="text-white/30 font-normal">
                                                •{" "}
                                                {new Date(
                                                    m.ts
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        <div className="text-white/90 leading-snug break-words whitespace-pre-wrap">
                                            {m.text}
                                        </div>
                                    </div>
                                ))}
                                <div id="chat-bottom" />
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendChat();
                                }}
                                className="p-3 border-t border-white/10 flex items-center gap-2 bg-black/60"
                            >
                                <input
                                    value={chatInput}
                                    onChange={(e) =>
                                        setChatInput(e.target.value)
                                    }
                                    placeholder="Message"
                                    className="flex-1 bg-white/10 focus:bg-white/15 text-white placeholder-white/40 px-4 py-3 rounded-full text-sm outline-none focus:ring-2 focus:ring-teal-400/60"
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim()}
                                    className="px-5 py-3 rounded-full bg-teal-500 disabled:opacity-40 hover:bg-teal-400 text-white text-sm font-medium shadow"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
