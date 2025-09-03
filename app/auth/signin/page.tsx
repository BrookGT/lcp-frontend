"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setError(null);
        // Basic client validation
        if (!email.trim() || !password.trim()) {
            setError("Email & password required");
            return;
        }
        if (mode === "signup") {
            if (!username.trim()) {
                setError("Username required");
                return;
            }
            if (username.trim().length < 3) {
                setError("Username must be at least 3 chars");
                return;
            }
            if (password.length < 6) {
                setError("Password must be at least 6 chars");
                return;
            }
        }
        setLoading(true);
        try {
            const res = await signIn("credentials", {
                redirect: false, // manual navigation so we can show errors correctly
                email: email.trim().toLowerCase(),
                password,
                mode,
                username: mode === "signup" ? username.trim() : undefined,
            });
            if (res?.error) {
                setError(res.error);
            } else {
                router.push("/communication");
            }
        } catch (err) {
            setError((err as Error).message || "Authentication failed");
        } finally {
            setLoading(false);
        }
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
                        disabled={loading}
                        className="w-full rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed py-3 font-medium glow-btn flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <span className="inline-block size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        )}
                        {mode === "signin"
                            ? loading
                                ? "Signing in"
                                : "Sign in"
                            : loading
                            ? "Creating"
                            : "Create account"}
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
