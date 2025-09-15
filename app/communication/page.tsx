"use client";
import VideoChat from "@/components/VideoChat";
import ContactList from "@/components/ContactList";
import ProfilePanel from "@/components/ProfilePanel";
import InvitationModal from "@/components/InvitationModal";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useContacts } from "@/lib/useContacts";

export default function CommunicationPage() {
    const { data: session } = useSession();
    const displayName = session?.user?.name || session?.user?.email || "You";
    interface SessionUser {
        id?: string;
        name?: string;
        email?: string;
    }
    const userId = (session?.user as SessionUser)?.id || "";
    const [showProfile, setShowProfile] = useState(false);
    const [showContactsMobile, setShowContactsMobile] = useState(false);
    const [remoteConnected, setRemoteConnected] = useState(false);
    const {
        contacts,
        invite,
        accept,
        reject,
        endCall,
        incomingInvite,
        pendingInviteRoom,
        activeRoom,
        autoJoinTick,
        usingRoster,
    } = useContacts({
        userId,
        displayName,
        accessToken: session?.accessToken as string | undefined,
    });
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

    // Wrapper for invitation actions
    const startInvite = useCallback(
        (contactId: string) => {
            invite(contactId);
        },
        [invite]
    );

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
                                    : "Invite a contact to start a 1:1 call."}
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
                            endCall();
                            setRemoteConnected(false);
                        }}
                        onRemoteConnected={() => setRemoteConnected(true)}
                    />
                </div>
                {/* Desktop / tablet contact list: show until remote connects */}
                {!activeRoom && !remoteConnected && (
                    <div className="hidden md:block shrink-0 h-full">
                        <ContactList
                            contacts={contacts}
                            onInvite={startInvite}
                            pendingContactId={
                                pendingInviteRoom
                                    ? pendingInviteRoom.split("-")[2]
                                    : null
                            }
                            usingRoster={usingRoster}
                        />
                    </div>
                )}
            </div>
            {/* Mobile overlay contact list */}
            {showContactsMobile && !activeRoom && !remoteConnected && (
                <ContactList
                    contacts={contacts}
                    onInvite={(id) => {
                        startInvite(id);
                        setShowContactsMobile(false);
                    }}
                    pendingContactId={
                        pendingInviteRoom
                            ? pendingInviteRoom.split("-")[2]
                            : null
                    }
                    variant="mobileOverlay"
                    onClose={() => setShowContactsMobile(false)}
                    usingRoster={usingRoster}
                />
            )}
            {incomingInvite && (
                <InvitationModal
                    fromName={incomingInvite.fromName}
                    onAccept={accept}
                    onReject={reject}
                />
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
