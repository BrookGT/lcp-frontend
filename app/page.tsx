"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
    const { data: session } = useSession();
    const authed = Boolean(session?.accessToken);

    return (
        <main className="min-h-dvh w-full flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-black">
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 px-4 py-10">
                {/* Header */}
                <header className="rounded-3xl bg-white px-6 py-8 shadow-2xl border border-gray-200 animate-fade-in text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-3 tracking-tight">
                        Live Communication
                    </h1>
                    <p className="text-black/80 text-lg md:text-xl font-light max-w-md mx-auto">
                        Experience modern, secure, and beautiful 1:1 video calls
                        —{" "}
                        <span className="text-green-600 font-semibold">
                            powered by GCME lcp
                        </span>
                        .
                    </p>
                </header>

                {/* Auth Card */}
                <div className="rounded-3xl bg-white p-8 shadow-2xl border border-gray-200 animate-fade-in flex flex-col gap-6">
                    <p className="text-black/80 text-lg font-medium text-center">
                        {authed
                            ? "Welcome back! You're ready to connect instantly."
                            : "Join us today — communicate seamlessly with just one click."}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        {authed ? (
                            <>
                                <Link
                                    href="/communication"
                                    className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-lg font-semibold px-6 py-3 shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400/60"
                                >
                                    Go to Communication
                                </Link>
                                <button
                                    className="w-full sm:w-auto rounded-2xl bg-black/5 hover:bg-black/10 text-black text-lg font-semibold px-6 py-3 shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300/40"
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
                                    className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-lg font-semibold px-6 py-3 shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400/60"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/auth/signin"
                                    className="w-full sm:w-auto rounded-2xl bg-black/5 hover:bg-black/10 text-black text-lg font-semibold px-6 py-3 shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300/40"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Profile Card */}
                    {authed && (
                        <div className="mt-6 rounded-2xl bg-white border border-gray-200 p-6 shadow-xl animate-fade-in text-black">
                            <h2 className="font-semibold text-green-600 mb-3 text-xl">
                                Your Profile
                            </h2>
                            <div className="flex flex-col gap-2 text-black/80 text-sm">
                                <span>
                                    <strong className="text-green-600">
                                        Username:
                                    </strong>{" "}
                                    {session?.user?.name ?? "-"}
                                </span>
                                <span>
                                    <strong className="text-green-600">
                                        Email:
                                    </strong>{" "}
                                    {session?.user?.email ?? "-"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="text-center text-black/70 text-sm animate-fade-in bg-white/70 rounded-xl py-3">
                    © {new Date().getFullYear()} Live Communication Platform —
                    All rights reserved.
                </footer>
            </div>
        </main>
    );
}
