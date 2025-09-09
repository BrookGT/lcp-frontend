import React from "react";

export type Contact = {
    id: string;
    username: string;
    email: string;
    status: "ONLINE" | "BUSY" | "OFFLINE";
    lastCallAt?: string;
};

export default function ContactList({
    contacts,
    onSelect,
    onCall,
    variant = "default",
    onClose,
}: {
    contacts: Contact[];
    onSelect?: (id: string) => void;
    onCall?: (id: string) => void;
    variant?: "default" | "mobileOverlay";
    onClose?: () => void;
}) {
    const base = "flex flex-col p-4 gap-2 glass-card h-full overflow-hidden";
    const containerClasses =
        variant === "mobileOverlay"
            ? "fixed inset-0 z-50 bg-black/70 backdrop-blur-md p-4 animate-fade-in"
            : "w-72 min-w-60 max-w-xs";
    return (
        <aside
            className={`${containerClasses} ${base}`}
            aria-label="Contact list"
            role="navigation"
        >
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold">Contacts</h2>
                {variant === "mobileOverlay" && (
                    <button
                        aria-label="Close contacts"
                        className="md:hidden text-white/70 hover:text-white text-xl leading-none"
                        onClick={onClose}
                    >
                        ×
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain pr-1 -mr-1">
                {contacts.length === 0 ? (
                    <div className="text-white/60 text-sm">No contacts yet</div>
                ) : (
                    <ul className="space-y-2">
                        {contacts.map((c) => {
                            const canCall = c.status === "ONLINE";
                            return (
                                <li
                                    key={c.id}
                                    className={`group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition hover:bg-white/10 ${
                                        c.status === "ONLINE"
                                            ? "border-l-4 border-teal-400"
                                            : c.status === "BUSY"
                                            ? "border-l-4 border-yellow-400"
                                            : "border-l-4 border-gray-400"
                                    }`}
                                    onClick={() => onSelect?.(c.id)}
                                >
                                    <div
                                        className={`size-4 shrink-0 rounded-full ${
                                            c.status === "ONLINE"
                                                ? "bg-teal-400"
                                                : c.status === "BUSY"
                                                ? "bg-yellow-400"
                                                : "bg-gray-400"
                                        }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-white truncate">
                                            {c.username}
                                        </div>
                                        <div className="text-xs text-white/60 truncate">
                                            {c.email}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="hidden sm:inline text-xs text-white/50">
                                            {c.status}
                                        </span>
                                        <button
                                            type="button"
                                            title={
                                                canCall
                                                    ? "Call"
                                                    : "User not available"
                                            }
                                            disabled={!canCall}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (canCall) onCall?.(c.id);
                                            }}
                                            className={`size-8 rounded-full grid place-items-center transition text-xs font-medium border border-white/20 shadow ${
                                                canCall
                                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white"
                                                    : "bg-white/10 text-white/40 cursor-not-allowed"
                                            }`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="size-4"
                                            >
                                                <path d="M6.62 10.79a15.05 15.05 0 0 1 10.59 0l1.06.44a2 2 0 0 1 1.2 2.58l-.66 1.66a2 2 0 0 1-2.39 1.2l-2.04-.58a2 2 0 0 1-1.38-1.26l-.19-.57a11.05 11.05 0 0 0-2.03 0l-.19.57a2 2 0 0 1-1.38 1.26l-2.04.58a2 2 0 0 1-2.39-1.2l-.66-1.66a2 2 0 0 1 1.2-2.58l1.06-.44Z" />
                                            </svg>
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
}
