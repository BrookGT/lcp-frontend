import React from "react";

export interface InvitationModalProps {
    fromName: string;
    onAccept: () => void;
    onReject: () => void;
}

export function InvitationModal({
    fromName,
    onAccept,
    onReject,
}: InvitationModalProps) {
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="glass-card p-6 rounded-2xl w-full max-w-sm text-white flex flex-col gap-4">
                <h3 className="text-xl font-semibold">Incoming Call</h3>
                <p>{fromName || "Contact"} is calling you.</p>
                <div className="flex gap-3 justify-end">
                    <button
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold"
                        onClick={onReject}
                    >
                        Reject
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold"
                        onClick={onAccept}
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
export default InvitationModal;
