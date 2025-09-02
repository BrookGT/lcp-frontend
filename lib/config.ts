// Centralized environment & URL helpers

function trimTrailingSlash(url: string) {
    return url.endsWith("/") ? url.slice(0, -1) : url;
}

// Canonical public API base (e.g. https://api.example.com)
export const API_BASE = trimTrailingSlash(
    process.env.NEXT_PUBLIC_API_BASE ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        // Legacy fallback (will be removed):
        (process.env as Record<string, string | undefined>)["BACKEND_BASE"] ||
        "http://localhost:4000"
);

// Socket endpoint: allow explicit override, else derive protocol swap
export const SOCKET_URL = (() => {
    const explicit = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (explicit) return trimTrailingSlash(explicit);
    try {
        const u = new URL(API_BASE);
        const proto = u.protocol === "https:" ? "wss:" : "ws:";
        return `${proto}//${u.host}`; // same host/port, no trailing slash
    } catch {
        return "ws://localhost:4000";
    }
})();

export const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const isDev = process.env.NODE_ENV !== "production";
