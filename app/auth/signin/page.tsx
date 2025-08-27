"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const res = await signIn("credentials", {
            redirect: true,
            callbackUrl: "/communication",
            email,
            password,
            mode,
            username: mode === "signup" ? username : undefined,
        });
        if (res?.error) setError(res.error);
    };

    return (
        <main className="min-h-dvh flex items-center justify-center p-4 relative">
            <div className="lcp-bg" />
            <div className="w-full max-w-md rounded-3xl glass-card p-6 md:p-8 text-white">
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {mode === "signin" ? "Welcome back" : "Create account"}
                    </h1>
                    <p className="text-white/80 mt-1 text-sm">
                        Enter your{" "}
                        {mode === "signin" ? "credentials" : "details"} to
                        continue
                    </p>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    {mode === "signup" && (
                        <div className="floating-label">
                            <input
                                className="w-full rounded-xl bg-white/20 px-3 py-3 outline-none placeholder-transparent focus:ring-2 ring-teal-400/70"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <label>Username</label>
                        </div>
                    )}
                    <div className="floating-label">
                        <input
                            type="email"
                            className="w-full rounded-xl bg-white/20 px-3 py-3 outline-none placeholder-transparent focus:ring-2 ring-teal-400/70"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label>Email</label>
                    </div>
                    <div className="floating-label">
                        <input
                            type="password"
                            className="w-full rounded-xl bg-white/20 px-3 py-3 outline-none placeholder-transparent focus:ring-2 ring-teal-400/70"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label>Password</label>
                    </div>
                    {error && (
                        <p className="text-red-300 text-sm border border-red-300/30 bg-red-900/30 rounded-md px-3 py-2">
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        className="w-full rounded-xl bg-teal-500 hover:bg-teal-400 py-3 font-medium glow-btn"
                    >
                        {mode === "signin" ? "Sign in" : "Create account"}
                    </button>
                </form>
                <div className="mt-5 text-sm text-white/80">
                    {mode === "signin" ? (
                        <span>
                            No account?{" "}
                            <button
                                className="underline"
                                onClick={() => setMode("signup")}
                            >
                                Sign up
                            </button>
                        </span>
                    ) : (
                        <span>
                            Have an account?{" "}
                            <button
                                className="underline"
                                onClick={() => setMode("signin")}
                            >
                                Sign in
                            </button>
                        </span>
                    )}
                </div>
                <div className="mt-2 text-xs text-white/60">
                    <Link href="/">Back to home</Link>
                </div>
            </div>
        </main>
    );
}
