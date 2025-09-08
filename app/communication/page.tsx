"use client";
import VideoChat from "@/components/VideoChat";
import ContactList, { Contact } from "@/components/ContactList";
import ProfilePanel from "@/components/ProfilePanel";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";

export default function CommunicationPage() {
    const { data: session } = useSession();
    const displayName = session?.user?.name || session?.user?.email || "You";
    interface SessionUser {
        id?: string;
        name?: string;
        email?: string;
    }
    const userId = (session?.user as SessionUser)?.id || "";
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [showProfile, setShowProfile] = useState(false);
    const [incomingCall, setIncomingCall] = useState<{
        fromUserId: string;
        fromName: string;
        roomId: string;
    } | null>(null);
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [showContactsMobile, setShowContactsMobile] = useState(false);
    const [autoJoinTick, setAutoJoinTick] = useState<number>(0);
    const [remoteConnected, setRemoteConnected] = useState(false);
    // For future auto-join functionality we could track a target room
    // const [pendingRoom, setPendingRoom] = useState<string | null>(null);

    // Scope image background only on this page
    useEffect(() => {
        document.body.classList.add("meeting-bg");
        return () => {
            document.body.classList.remove("meeting-bg");
        };
    }, []);

    // Set meeting background body class when on this page
    useEffect(() => {
        document.body.classList.add("meeting-bg");
        return () => document.body.classList.remove("meeting-bg");
    }, []);

    // Fetch contacts
    useEffect(() => {
        if (!session?.accessToken) return;
        fetch("/users/contacts", {
            headers: { Authorization: `Bearer ${session.accessToken}` },
        })
            .then((r) => r.json())
            .then((data) => {
                setContacts(Array.isArray(data) ? data : []);
            })
            .catch(() => setContacts([]));
    }, [session?.accessToken]);

    // Socket presence
    useEffect(() => {
        if (!userId) return;
        const socket = getSocket();
        socket.emit("presence:update", { userId, status: "ONLINE" });
        const handlePresence = (payload: {
            userId: string;
            status: string;
        }) => {
            setContacts((prev) =>
                prev.map((c) =>
                    c.id === payload.userId
                        ? { ...c, status: payload.status as Contact["status"] }
                        : c
                )
            );
        };
        socket.on("presence", handlePresence);
        window.addEventListener("beforeunload", () => {
            socket.emit("presence:update", { userId, status: "OFFLINE" });
        });
        return () => {
            socket.emit("presence:update", { userId, status: "OFFLINE" });
            socket.off("presence", handlePresence);
        };
    }, [userId]);

    // Socket call events
    useEffect(() => {
        const socket = getSocket();
        const handleIncoming = (p: {
            fromUserId: string;
            fromName: string;
            roomId: string;
        }) => {
            setIncomingCall(p);
        };
        const handleAccepted = (p: { roomId: string }) => {
            setActiveRoom(p.roomId);
            setAutoJoinTick(Date.now());
        };
        const handleRejected = () => {
            /* setPendingRoom(null); */
        };
        const handleUnavailable = () => {
            /* setPendingRoom(null); */
            alert("User unavailable");
        };
        socket.on("call:incoming", handleIncoming);
        socket.on("call:accepted", handleAccepted);
        socket.on("call:rejected", handleRejected);
        socket.on("call:unavailable", handleUnavailable);
        socket.on("call:canceled", handleRejected);
        return () => {
            socket.off("call:incoming", handleIncoming);
            socket.off("call:accepted", handleAccepted);
            socket.off("call:rejected", handleRejected);
            socket.off("call:unavailable", handleUnavailable);
            socket.off("call:canceled", handleRejected);
        };
    }, []);

    function startCall(contactId: string) {
        if (!userId) return;
        const roomId = `r-${userId}-${contactId}-${Date.now()}`;
        setActiveRoom(roomId);
        setAutoJoinTick(Date.now());
        const socket = getSocket();
        const contact = contacts.find((c) => c.id === contactId);
        socket.emit("call:invite", {
            fromUserId: userId,
            fromName: displayName,
            toUserId: contactId,
            roomId,
        });
        if (contact) {
            // optimistic busy state
            setContacts((prev) =>
                prev.map((c) =>
                    c.id === contactId ? { ...c, status: "BUSY" } : c
                )
            );
        }
    }

    function acceptCall() {
        if (!incomingCall) return;
        const socket = getSocket();
        socket.emit("call:accept", {
            roomId: incomingCall.roomId,
            fromUserId: incomingCall.fromUserId,
            toUserId: userId,
        });
        setActiveRoom(incomingCall.roomId);
        setAutoJoinTick(Date.now());
        setIncomingCall(null);
    }

    function rejectCall() {
        if (!incomingCall) return;
        const socket = getSocket();
        socket.emit("call:reject", {
            fromUserId: incomingCall.fromUserId,
            toUserId: userId,
        });
        setIncomingCall(null);
    }

    // Profile info
    const handleProfileClick = useCallback(() => setShowProfile(true), []);
    const handleProfileClose = useCallback(() => setShowProfile(false), []);

    return (
        <main className="h-dvh w-full relative flex items-center justify-center p-2 sm:p-4 md:p-6">
            <div className="lcp-bg" />
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6 h-[88vh] md:h-[80vh]">
                <div className="flex-1 flex flex-col gap-4 min-h-0">
                    <header className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-4 shadow-lg flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold text-white drop-shadow">
                                Communication
                            </h1>
                            <p className="text-white/80 mt-1">
                                {activeRoom
                                    ? "In call"
                                    : "Create a room and start a 1:1 call."}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="md:hidden rounded-full bg-white/20 hover:bg-white/30 px-4 py-2 text-white font-medium shadow"
                                onClick={() => setShowContactsMobile(true)}
                                aria-label="Open contacts"
                            >
                                Contacts
                            </button>
                            <button
                                className="rounded-full bg-white/20 hover:bg-white/30 px-4 py-2 text-white font-medium shadow"
                                onClick={handleProfileClick}
                            >
                                Profile
                            </button>
                        </div>
                    </header>
                    <VideoChat
                        selfName={displayName}
                        externalRoom={activeRoom}
                        autoJoin={autoJoinTick}
                        onLeave={() => {
                            // Emit call end so statuses revert
                            if (activeRoom) {
                                const socket = getSocket();
                                // naive parse user ids from room naming convention if present
                                socket.emit("call:end", {
                                    userIds: [userId],
                                });
                            }
                            setActiveRoom(null);
                            setRemoteConnected(false);
                        }}
                        onRemoteConnected={() => setRemoteConnected(true)}
                    />
                </div>
                {/* Desktop / tablet contact list: show until remote connects */}
                {!activeRoom && !remoteConnected && (
                    <div className="hidden md:block shrink-0 h-full">
                        <ContactList contacts={contacts} onCall={startCall} />
                    </div>
                )}
            </div>
            {/* Mobile overlay contact list */}
            {showContactsMobile && !activeRoom && !remoteConnected && (
                <ContactList
                    contacts={contacts}
                    onCall={(id) => {
                        startCall(id);
                        setShowContactsMobile(false);
                    }}
                    variant="mobileOverlay"
                    onClose={() => setShowContactsMobile(false)}
                />
            )}
            {incomingCall && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="glass-card p-6 rounded-2xl w-full max-w-sm text-white flex flex-col gap-4">
                        <h3 className="text-xl font-semibold">Incoming Call</h3>
                        <p>
                            {incomingCall.fromName || "Contact"} is calling you.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium"
                                onClick={rejectCall}
                            >
                                Reject
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-white font-medium"
                                onClick={acceptCall}
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showProfile && (
                <ProfilePanel
                    user={{
                        username: session?.user?.name ?? undefined,
                        email: session?.user?.email ?? undefined,
                    }}
                    onClose={handleProfileClose}
                />
            )}
        </main>
    );
}
