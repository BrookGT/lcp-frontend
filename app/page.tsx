"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
    const { data: session } = useSession();
    const authed = Boolean(session?.accessToken);

    return (
        <main className="h-dvh w-full relative flex items-center justify-center p-4 md:p-6">
            <div className="lcp-bg" />
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 text-white">
                <header className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-6 shadow-lg">
                    <h1 className="text-3xl md:text-4xl font-semibold drop-shadow">
                        Live Communication Platform
                    </h1>
                    <p className="text-white/80 mt-2">
                        Modern 1:1 video calls with glassy UI.
                    </p>
                </header>
                <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-lg">
                    <p className="mb-4">
                        Welcome! Create a room and start communicating
                        instantly.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                        {authed ? (
                            <>
                                <Link
                                    href="/communication"
                                    className="rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2"
                                >
                                    Go to Communication
                                </Link>
                                <button
                                    className="rounded-md bg-white/20 hover:bg-white/30 px-4 py-2"
                                    onClick={() =>
                                        signOut({ callbackUrl: "/" })
                                    }
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/signin"
                                    className="rounded-md bg-blue-600 hover:bg-blue-500 px-4 py-2"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/auth/signin"
                                    className="rounded-md bg-white/20 hover:bg-white/30 px-4 py-2"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                    {authed && (
                        <div className="mt-6 rounded-xl bg-black/40 border border-white/10 p-4">
                            <h2 className="font-semibold text-white mb-2">
                                Profile
                            </h2>
                            <p className="text-white/80 text-sm">
                                Username: {session?.user?.name ?? "-"}
                            </p>
                            <p className="text-white/80 text-sm">
                                Email: {session?.user?.email ?? "-"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
