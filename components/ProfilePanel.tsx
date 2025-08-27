import React from "react";
import { signOut } from "next-auth/react";

export default function ProfilePanel({
    user,
    onClose,
}: {
    user: { username?: string; email?: string };
    onClose?: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="glass-card p-8 rounded-2xl w-full max-w-sm text-white relative">
                <button
                    className="absolute top-3 right-3 text-white/70 hover:text-white text-xl"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>
                <h2 className="text-2xl font-semibold mb-4">Profile</h2>
                <div className="mb-2">
                    <span className="font-medium">Username:</span>
                    <span className="ml-2 text-white/80">
                        {user.username ?? "-"}
                    </span>
                </div>
                <div className="mb-6">
                    <span className="font-medium">Email:</span>
                    <span className="ml-2 text-white/80">
                        {user.email ?? "-"}
                    </span>
                </div>
                <button
                    className="w-full rounded-xl bg-teal-500 hover:bg-teal-400 py-3 font-medium glow-btn"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
