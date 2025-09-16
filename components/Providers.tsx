"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
    if (process.env.NODE_ENV !== "production") {
        console.log("[Providers] rendering, child type:", typeof children);
    }
    return <SessionProvider>{children}</SessionProvider>;
}
