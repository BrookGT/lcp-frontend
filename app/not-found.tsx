"use client";
import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-dvh flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-card rounded-3xl p-8 text-center text-white">
                <h1 className="text-3xl font-bold mb-2">Page not found</h1>
                <p className="text-white/85 mb-6">
                    Sorry, we couldn’t find that page.
                </p>
                <Link
                    href="/"
                    className="inline-block rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-base font-semibold px-5 py-3 shadow-md"
                >
                    Go home
                </Link>
            </div>
        </main>
    );
}
