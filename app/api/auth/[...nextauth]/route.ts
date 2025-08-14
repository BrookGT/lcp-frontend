import NextAuth, { type NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";

const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
                mode: { label: "mode", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials) return null;
                const { email, username, password, mode } =
                    credentials as Record<string, string>;
                const isSignup = mode === "signup";
                const url = isSignup
                    ? `${backendUrl}/auth/register`
                    : `${backendUrl}/auth/login`;
                const payload = isSignup
                    ? { username, email, password }
                    : { email, password };
                const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) return null;
                const data: {
                    access_token?: string;
                    user?: { id: string; username: string; email: string };
                } = await res.json();
                if (!data?.access_token) return null;
                const user = data.user || {
                    id: email!,
                    username: username || email!,
                    email: email!,
                };
                return {
                    id: user.id,
                    name: user.username,
                    email: user.email,
                    accessToken: data.access_token,
                } as unknown as {
                    id: string;
                    name: string;
                    email: string;
                    accessToken: string;
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (
                user &&
                (user as unknown as { accessToken?: string }).accessToken
            ) {
                type AppToken = JWT & {
                    accessToken?: string;
                    name?: string | null;
                    email?: string | null;
                    sub?: string;
                };
                const u = user as {
                    accessToken: string;
                    name?: string;
                    email?: string;
                    id?: string;
                };
                const t = token as AppToken;
                t.accessToken = u.accessToken;
                if (u.name !== undefined) t.name = u.name;
                if (u.email !== undefined) t.email = u.email;
                if (u.id !== undefined) t.sub = u.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (
                token &&
                (token as unknown as { accessToken?: string }).accessToken
            ) {
                type AppToken = JWT & {
                    accessToken?: string;
                    name?: string | null;
                    email?: string | null;
                    sub?: string;
                };
                type AppSession = typeof session & {
                    accessToken?: string;
                    user?: {
                        name?: string | null;
                        email?: string | null;
                        id?: string;
                    };
                };
                const t = token as AppToken;
                const s = session as AppSession;
                s.accessToken = t.accessToken;
                if (!s.user) s.user = {};
                s.user.name = t.name ?? s.user.name;
                s.user.email = t.email ?? s.user.email;
                s.user.id = t.sub ?? s.user.id;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
