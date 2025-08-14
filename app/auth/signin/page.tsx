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
        const params: Record<string, string> = {
            redirect: "true",
            callbackUrl: "/communication",
            password,
            mode,
            email,
        };
        if (mode === "signup") params.username = username;
        const res = await signIn("credentials", params);
        if (res?.error) setError(res.error);
    };

    return (
        <main className="min-h-dvh flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-white">
                <h1 className="text-2xl font-semibold mb-4">
                    {mode === "signin" ? "Sign in" : "Sign up"}
                </h1>
                <form onSubmit={onSubmit} className="space-y-4">
                    {mode === "signup" && (
                        <input
                            className="w-full rounded-md bg-white/20 px-3 py-2 outline-none"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    )}
                    <input
                        type="email"
                        className="w-full rounded-md bg-white/20 px-3 py-2 outline-none"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        className="w-full rounded-md bg-white/20 px-3 py-2 outline-none"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-red-300 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full rounded-md bg-blue-600 hover:bg-blue-500 py-2 font-medium"
                    >
                        {mode === "signin" ? "Sign in" : "Create account"}
                    </button>
                </form>
                <div className="mt-4 text-sm text-white/80">
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
