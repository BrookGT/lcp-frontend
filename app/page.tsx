"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
    const { data: session } = useSession();
    const authed = Boolean(session?.accessToken);

    return (
        <main className="min-h-dvh w-full flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6">
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 px-4 py-10">
                {/* Header */}
                <header className="rounded-3xl bg-white/10 backdrop-blur-xl px-6 py-8 shadow-2xl border border-white/20 animate-fade-in text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg">
                        Live Communication
                    </h1>
                    <p className="text-white/90 text-lg md:text-xl font-light max-w-md mx-auto">
                        Experience modern, secure, and beautiful 1:1 video calls
                        —{" "}
                        <span className="text-green-300 font-semibold">
                            powered by trust
                        </span>
                        .
                    </p>
                </header>

                {/* Auth Card */}
                <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-8 shadow-2xl border border-white/20 animate-fade-in flex flex-col gap-6">
                    <p className="text-white/90 text-lg font-medium text-center">
                        {authed
                            ? "Welcome back! You're ready to connect instantly."
                            : "Join us today — communicate seamlessly with just one click."}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        {authed ? (
                            <>
                                <Link
                                    href="/communication"
                                    className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-lg font-semibold px-6 py-3 shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400/60"
                                >
                                    Go to Communication
                                </Link>
                                <button
                                    className="w-full sm:w-auto rounded-2xl bg-white/20 hover:bg-white/30 text-white text-lg font-semibold px-6 py-3 shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300/40"
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
                                    className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-lg font-semibold px-6 py-3 shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400/60"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/auth/signin"
                                    className="w-full sm:w-auto rounded-2xl bg-white/20 hover:bg-white/30 text-white text-lg font-semibold px-6 py-3 shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300/40"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Profile Card */}
                    {authed && (
                        <div className="mt-6 rounded-2xl bg-white/10 border border-white/20 p-6 shadow-xl animate-fade-in">
                            <h2 className="font-semibold text-green-400 mb-3 text-xl">
                                Your Profile
                            </h2>
                            <div className="flex flex-col gap-2 text-white/90 text-sm">
                                <span>
                                    <strong className="text-green-300">
                                        Username:
                                    </strong>{" "}
                                    {session?.user?.name ?? "-"}
                                </span>
                                <span>
                                    <strong className="text-green-300">
                                        Email:
                                    </strong>{" "}
                                    {session?.user?.email ?? "-"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="text-center text-white/70 text-sm animate-fade-in">
                    © {new Date().getFullYear()} Live Communication Platform —
                    All rights reserved.
                </footer>
            </div>
        </main>
    );
}
