"use client";
import VideoChat from "@/components/VideoChat";
import { useSession } from "next-auth/react";

export default function CommunicationPage() {
    const { data: session } = useSession();
    const displayName = session?.user?.name || session?.user?.email || "You";
    return (
        <main className="h-dvh w-full relative flex items-center justify-center p-4 md:p-6">
            <div className="lcp-bg" />
            <div className="w-full max-w-6xl mx-auto flex flex-col gap-4">
                <header className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-4 shadow-lg">
                    <h1 className="text-2xl md:text-3xl font-semibold text-white drop-shadow">
                        Communication
                    </h1>
                    <p className="text-white/80 mt-1">
                        Create a room and start a 1:1 call.
                    </p>
                </header>
                <VideoChat selfName={displayName} />
            </div>
        </main>
    );
}
