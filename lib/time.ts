export function formatRelativeTime(dateIso?: string | null): string {
    if (!dateIso) return "";
    const date = new Date(dateIso);
    if (isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 45) return "just now";
    const min = Math.floor(sec / 60);
    if (min < 2) return "1 min ago";
    if (min < 60) return `${min} mins ago`;
    const hr = Math.floor(min / 60);
    if (hr < 2) return "1 hr ago";
    if (hr < 24) return `${hr} hrs ago`;
    const day = Math.floor(hr / 24);
    if (day === 1) return "yesterday";
    if (day < 7) return `${day} days ago`;
    const week = Math.floor(day / 7);
    if (week < 5) return `${week} wk${week > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
}
