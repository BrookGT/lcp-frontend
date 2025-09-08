"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
    const { data: session } = useSession();
    const authed = Boolean(session?.accessToken);

    return (
        <main className="min-h-dvh w-full flex items-center justify-center p-0">
            <div className="w-full max-w-lg mx-auto flex flex-col gap-6 px-2 sm:px-4 py-8">
                <header className="rounded-2xl glass-card px-5 py-6 shadow-lg animate-fade-in">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                        Live Communication Platform
                    </h1>
                    <p className="text-slate-700 dark:text-white/85 text-base sm:text-lg">
                        Modern 1:1 video calls with a beautiful, secure UI.
                    </p>
                </header>
                <div className="rounded-2xl glass-card p-5 shadow-lg animate-fade-in flex flex-col gap-6">
                    <div className="mb-2">
                        <p className="text-slate-800 dark:text-white/90 text-base sm:text-lg font-medium">
                            Welcome! Sign in to start communicating instantly.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        {authed ? (
                            <>
                                <Link
                                    href="/communication"
                                    className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold px-5 py-3 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    Go to Communication
                                </Link>
                                <button
                                    className="w-full sm:w-auto rounded-xl bg-white/20 hover:bg-white/30 text-slate-900 dark:text-white text-base font-semibold px-5 py-3 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                                    className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold px-5 py-3 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/auth/signin"
                                    className="w-full sm:w-auto rounded-xl bg-white/20 hover:bg-white/30 text-slate-900 dark:text-white text-base font-semibold px-5 py-3 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                    {authed && (
                        <div className="mt-4 rounded-xl glass-subtle border border-white/10 p-4 flex flex-col gap-2 animate-fade-in">
                            <h2 className="font-semibold text-slate-900 dark:text-white mb-2 text-lg">
                                Profile
                            </h2>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-700 dark:text-white/80 text-sm">
                                    Username: {session?.user?.name ?? "-"}
                                </span>
                                <span className="text-slate-700 dark:text-white/80 text-sm">
                                    Email: {session?.user?.email ?? "-"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
