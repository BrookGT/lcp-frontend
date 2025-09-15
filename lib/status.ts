export type PresenceStatus = "ONLINE" | "BUSY" | "OFFLINE";

export function statusColor(status: PresenceStatus): string {
    switch (status) {
        case "ONLINE":
            return "bg-teal-400";
        case "BUSY":
            return "bg-yellow-400";
        default:
            return "bg-gray-400";
    }
}

export function statusBorder(status: PresenceStatus): string {
    switch (status) {
        case "ONLINE":
            return "border-teal-400";
        case "BUSY":
            return "border-yellow-400";
        default:
            return "border-gray-400";
    }
}

export function statusLabel(status: PresenceStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
}
