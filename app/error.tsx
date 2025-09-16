"use client";
import React from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="min-h-dvh flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-card rounded-3xl p-8 text-center text-white animate-fade-in">
                <h1 className="text-3xl font-bold mb-3">
                    Something went wrong
                </h1>
                <p className="text-white/80 text-sm mb-6 break-words">
                    {error?.message || "An unexpected error occurred."}
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-base font-semibold px-5 py-3 shadow-lg"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2"
                    >
                        Go home
                    </button>
                    {process.env.NODE_ENV !== "production" && error?.digest && (
                        <code className="text-xs text-white/50 mt-2 block">
                            digest: {error.digest}
                        </code>
                    )}
                </div>
            </div>
        </main>
    );
}
