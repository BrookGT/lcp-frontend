import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-dvh flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-card rounded-3xl p-8 text-center text-slate-900 dark:text-white">
                <h1 className="text-3xl font-bold mb-2">Page not found</h1>
                <p className="text-white/80 mb-6">
                    Sorry, we couldn’t find that page.
                </p>
                <Link
                    href="/"
                    className="inline-block rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold px-5 py-3 shadow-md"
                >
                    Go home
                </Link>
            </div>
        </main>
    );
}
