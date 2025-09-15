import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "./socket";
import { API_BASE } from "./config";

export type ContactStatus = "ONLINE" | "BUSY" | "OFFLINE";
export interface ContactItem {
    id: string;
    username: string;
    email: string;
    status: ContactStatus;
    lastCallAt?: string | null;
}

interface UseContactsOptions {
    userId: string;
    displayName: string;
    accessToken?: string;
}

interface IncomingInvite {
    fromUserId: string;
    fromName: string;
    roomId: string;
}

export function useContacts({
    userId,
    displayName,
    accessToken,
}: UseContactsOptions) {
    const [contacts, setContacts] = useState<ContactItem[]>([]);
    const [usingRoster, setUsingRoster] = useState(false);
    const [incomingInvite, setIncomingInvite] = useState<IncomingInvite | null>(
        null
    );
    const [pendingInviteRoom, setPendingInviteRoom] = useState<string | null>(
        null
    );
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [autoJoinTick, setAutoJoinTick] = useState(0);
    const remoteUserRef = useRef<string | null>(null);

    // Fetch initial contacts
    const refreshContacts = useCallback(() => {
        if (!accessToken || !userId) {
            console.warn("[useContacts] Skipping contacts fetch: missing", {
                hasAccessToken: !!accessToken,
                userId,
            });
            return;
        }
        const url = `${API_BASE}/users/contacts`;
        fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then(async (r) => {
                if (!r.ok) {
                    console.warn(
                        "[useContacts] contacts fetch non-OK",
                        r.status,
                        await r.text()
                    );
                    return [] as unknown;
                }
                return r.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setContacts(data);
                    setUsingRoster(false);
                    if (data.length === 0) {
                        console.info(
                            "[useContacts] contacts fetch succeeded but empty array returned"
                        );
                        // Fallback: load roster so user can initiate first call
                        fetch(`${API_BASE}/users/roster`, {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        })
                            .then((r) => (r.ok ? r.json() : []))
                            .then((roster) => {
                                if (
                                    Array.isArray(roster) &&
                                    roster.length > 0
                                ) {
                                    setContacts(roster);
                                    setUsingRoster(true);
                                }
                            })
                            .catch(() => void 0);
                    }
                } else {
                    console.warn(
                        "[useContacts] contacts response not an array",
                        data
                    );
                }
            })
            .catch((err) => {
                console.error("[useContacts] contacts fetch error", err);
            });
    }, [accessToken, userId]);

    useEffect(() => {
        refreshContacts();
    }, [refreshContacts]);

    // Presence subscription
    useEffect(() => {
        if (!userId) return;
        const socket = getSocket();
        socket.emit("presence:update", { userId, status: "ONLINE" });
        const onPresence = (p: { userId: string; status: ContactStatus }) => {
            setContacts((prev) =>
                prev.map((c) =>
                    c.id === p.userId ? { ...c, status: p.status } : c
                )
            );
        };
        socket.on("presence", onPresence);
        const off = () =>
            socket.emit("presence:update", { userId, status: "OFFLINE" });
        window.addEventListener("beforeunload", off);
        return () => {
            off();
            socket.off("presence", onPresence);
            window.removeEventListener("beforeunload", off);
        };
    }, [userId]);

    // Call / invitation events
    useEffect(() => {
        const socket = getSocket();
        const handleIncoming = (p: IncomingInvite) => {
            setIncomingInvite(p);
            remoteUserRef.current = p.fromUserId;
        };
        const handleAccepted = (p: { roomId: string; toUserId?: string }) => {
            // Only react if this client originated the invite
            if (p.roomId === pendingInviteRoom) {
                setActiveRoom(p.roomId);
                setAutoJoinTick(Date.now());
                setPendingInviteRoom(null);
                // Mark remote busy optimistically
                if (remoteUserRef.current) {
                    setContacts((prev) =>
                        prev.map((c) =>
                            c.id === remoteUserRef.current
                                ? { ...c, status: "BUSY" }
                                : c
                        )
                    );
                }
                // Refresh contacts so new call updates recency/order or adds new contact
                refreshContacts();
            }
        };
        const handleRejected = () => {
            setPendingInviteRoom(null);
        };
        const handleUnavailable = () => {
            setPendingInviteRoom(null);
            alert("User unavailable");
        };
        const handleCanceled = () => {
            setIncomingInvite(null);
        };
        socket.on("call:incoming", handleIncoming);
        socket.on("call:accepted", handleAccepted);
        socket.on("call:rejected", handleRejected);
        socket.on("call:unavailable", handleUnavailable);
        socket.on("call:canceled", handleCanceled);
        // contact:update push from server after first accepted call
        const handleContactUpdate = (p: {
            id: string;
            lastCallAt?: string;
        }) => {
            setContacts((prev) => {
                if (prev.some((c) => c.id === p.id)) {
                    return prev.map((c) =>
                        c.id === p.id
                            ? { ...c, lastCallAt: p.lastCallAt || c.lastCallAt }
                            : c
                    );
                }
                // If we don't know the contact yet we need to refetch full list to get username/email/status
                refreshContacts();
                return prev;
            });
        };
        socket.on("contact:update", handleContactUpdate);
        return () => {
            socket.off("call:incoming", handleIncoming);
            socket.off("call:accepted", handleAccepted);
            socket.off("call:rejected", handleRejected);
            socket.off("call:unavailable", handleUnavailable);
            socket.off("call:canceled", handleCanceled);
            socket.off("contact:update", handleContactUpdate);
        };
    }, [pendingInviteRoom, refreshContacts]);

    const invite = useCallback(
        (contactId: string) => {
            if (!userId) return;
            const roomId = `r-${userId}-${contactId}-${Date.now()}`;
            const socket = getSocket();
            setPendingInviteRoom(roomId);
            remoteUserRef.current = contactId;
            socket.emit("call:invite", {
                fromUserId: userId,
                fromName: displayName,
                toUserId: contactId,
                roomId,
            });
        },
        [userId, displayName]
    );

    const accept = useCallback(() => {
        if (!incomingInvite) return;
        const socket = getSocket();
        socket.emit("call:accept", {
            roomId: incomingInvite.roomId,
            fromUserId: incomingInvite.fromUserId,
            toUserId: userId,
        });
        setActiveRoom(incomingInvite.roomId);
        setAutoJoinTick(Date.now());
        setIncomingInvite(null);
        refreshContacts(); // ensure callee also sees contact recency / new contact
    }, [incomingInvite, userId, refreshContacts]);

    const reject = useCallback(() => {
        if (!incomingInvite) return;
        const socket = getSocket();
        socket.emit("call:reject", {
            fromUserId: incomingInvite.fromUserId,
            toUserId: userId,
        });
        setIncomingInvite(null);
    }, [incomingInvite, userId]);

    const endCall = useCallback(() => {
        if (!activeRoom) return;
        const socket = getSocket();
        const remote = remoteUserRef.current;
        if (remote) {
            socket.emit("call:end", { userIds: [userId, remote] });
            // revert statuses optimistically
            setContacts((prev) =>
                prev.map((c) =>
                    c.id === remote ? { ...c, status: "ONLINE" } : c
                )
            );
        } else {
            socket.emit("call:end", { userIds: [userId] });
        }
        setActiveRoom(null);
        setAutoJoinTick(Date.now());
        // Refresh contacts to pull updated lastCallAt
        refreshContacts();
    }, [activeRoom, userId, refreshContacts]);

    const sortedContacts = useMemo(() => {
        return [...contacts].sort((a, b) => {
            const at = a.lastCallAt ? new Date(a.lastCallAt).getTime() : 0;
            const bt = b.lastCallAt ? new Date(b.lastCallAt).getTime() : 0;
            return bt - at;
        });
    }, [contacts]);

    return {
        contacts: sortedContacts,
        invite,
        accept,
        reject,
        endCall,
        incomingInvite,
        pendingInviteRoom,
        activeRoom,
        autoJoinTick,
        setActiveRoom,
        refreshContacts,
        usingRoster,
    };
}
