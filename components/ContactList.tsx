import React, { useMemo, useState } from "react";
import { statusBorder, statusColor } from "@/lib/status";
import { formatRelativeTime } from "@/lib/time";

export type Contact = {
    id: string;
    username: string;
    email: string;
    status: "ONLINE" | "BUSY" | "OFFLINE";
    lastCallAt?: string | null;
};

export default function ContactList({
    contacts,
    onSelect,
    onInvite,
    pendingContactId,
    variant = "default",
    onClose,
    usingRoster,
}: {
    contacts: Contact[];
    onSelect?: (id: string) => void;
    onInvite?: (id: string) => void;
    pendingContactId?: string | null;
    variant?: "default" | "mobileOverlay";
    onClose?: () => void;
    usingRoster?: boolean;
}) {
    const [query, setQuery] = useState("");
    const filtered = useMemo(() => {
        if (!query.trim()) return contacts;
        const q = query.toLowerCase();
        return contacts.filter(
            (c) =>
                c.username.toLowerCase().includes(q) ||
                (c.email || "").toLowerCase().includes(q)
        );
    }, [contacts, query]);

    const base = "flex flex-col p-4 gap-3 glass-card h-full overflow-hidden";
    const containerClasses =
        variant === "mobileOverlay"
            ? "fixed inset-0 z-50 bg-black/70 backdrop-blur-md p-4 animate-fade-in"
            : "w-80 min-w-72 max-w-sm";

    return (
        <aside
            className={`${containerClasses} ${base}`}
            aria-label="Contact list"
            role="navigation"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
                    <span className="bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                        {usingRoster ? "Directory" : "Contacts"}
                    </span>
                    {usingRoster && (
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase tracking-wider text-teal-200 border border-white/10">
                            roster
                        </span>
                    )}
                </h2>
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
            <div>
                <div className="relative group">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Search ${
                            usingRoster ? "users" : "contacts"
                        }`}
                        className="w-full rounded-xl bg-white/10 focus:bg-white/15 border border-white/20 focus:border-teal-400/60 outline-none px-9 py-2 text-sm placeholder-white/40 transition shadow-inner"
                        aria-label="Search contacts"
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        fill="none"
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
                        />
                    </svg>
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            aria-label="Clear search"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-sm"
                        >
                            ×
                        </button>
                    )}
                </div>
                {usingRoster && (
                    <p className="mt-1 text-[10px] text-white/50 tracking-wide">
                        Start a first call to convert a user into a contact.
                    </p>
                )}
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain pr-1 -mr-1 custom-scroll">
                {filtered.length === 0 ? (
                    <div className="text-white/60 text-sm mt-6 flex flex-col items-center gap-2">
                        <span>No matches</span>
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70"
                            >
                                Reset search
                            </button>
                        )}
                    </div>
                ) : (
                    <ul className="space-y-2 mt-1">
                        {filtered.map((c) => {
                            const canCall = c.status === "ONLINE";
                            const isPending = pendingContactId === c.id;
                            const borderCls = statusBorder(c.status);
                            const dotCls = statusColor(c.status);
                            const last = formatRelativeTime(c.lastCallAt);
                            return (
                                <li
                                    key={c.id}
                                    className={`group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition border border-white/10 bg-white/5 hover:bg-white/[0.12] backdrop-blur-sm ${borderCls}`}
                                    onClick={() => onSelect?.(c.id)}
                                >
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600/60 to-slate-800/60 flex items-center justify-center text-sm font-semibold text-white/80 ring-1 ring-white/10 shadow-inner">
                                            {c.username
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </div>
                                        <span
                                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center ${dotCls}`}
                                        >
                                            {c.status === "BUSY" && (
                                                <span className="w-1.5 h-1.5 bg-slate-900 rounded-[2px] rotate-45" />
                                            )}
                                        </span>
                                    </div>
                                    {/* Main info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold tracking-wide text-sm text-white truncate">
                                                {c.username}
                                            </span>
                                            <span
                                                className={`text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 tracking-wide font-medium ${
                                                    c.status === "ONLINE"
                                                        ? "text-teal-300"
                                                        : c.status === "BUSY"
                                                        ? "text-amber-300"
                                                        : "text-white/40"
                                                }`}
                                            >
                                                {c.status.toLowerCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-white/50 truncate">
                                            <span className="truncate">
                                                {c.email}
                                            </span>
                                            {last && (
                                                <span className="text-white/30">
                                                    • {last}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Action */}
                                    <div className="flex flex-col items-end gap-1 w-16">
                                        <button
                                            type="button"
                                            title={
                                                isPending
                                                    ? "Inviting..."
                                                    : canCall
                                                    ? "Invite to call"
                                                    : "User not available"
                                            }
                                            disabled={!canCall || isPending}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (canCall && !isPending)
                                                    onInvite?.(c.id);
                                            }}
                                            className={`w-full h-8 px-2 rounded-xl flex items-center justify-center gap-1 text-xs font-semibold border shadow transition backdrop-blur-sm ${
                                                isPending
                                                    ? "border-yellow-400/40 bg-yellow-500/20 text-yellow-200 cursor-wait"
                                                    : canCall
                                                    ? "border-teal-400/40 bg-teal-500/20 hover:bg-teal-400/30 text-teal-50"
                                                    : "border-white/10 bg-white/5 text-white/30 cursor-not-allowed"
                                            }`}
                                        >
                                            {isPending ? (
                                                <>
                                                    <span className="inline-block size-2 rounded-full bg-yellow-300 animate-pulse" />
                                                    <span>Inviting</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        className="size-4"
                                                    >
                                                        <path d="M6.62 10.79a15.05 15.05 0 0 1 10.59 0l1.06.44a2 2 0 0 1 1.2 2.58l-.66 1.66a2 2 0 0 1-2.39 1.2l-2.04-.58a2 2 0 0 1-1.38-1.26l-.19-.57a11.05 11.05 0 0 0-2.03 0l-.19.57a2 2 0 0 1-1.38 1.26l-2.04.58a2 2 0 0 1-2.39-1.2l-.66-1.66a2 2 0 0 1 1.2-2.58l1.06-.44Z" />
                                                    </svg>
                                                    <span>Call</span>
                                                </>
                                            )}
                                        </button>
                                        {isPending && (
                                            <span className="text-[10px] text-yellow-300/80 tracking-wide">
                                                pending
                                            </span>
                                        )}
                                    </div>
                                    {/* Glow hover accent */}
                                    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_0_12px_-2px_rgba(45,212,191,0.25)]" />
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
}
