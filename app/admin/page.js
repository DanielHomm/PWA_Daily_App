'use client';

import Link from 'next/link';

export default function AdminHubPage() {
    return (
        <div className="max-w-4xl mx-auto p-6 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Admin Hub</h1>
                <p className="text-gray-400">Manage application content and settings</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add Common Item Card */}
                <Link href="/admin/common-items" className="group">
                    <div className="glass p-6 rounded-3xl border border-white/10 hover:bg-white/5 transition-all duration-300 h-full flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                            ➕
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Add Common Item</h2>
                        <p className="text-sm text-gray-400">Add new items to the global database with English and German names.</p>
                    </div>
                </Link>

                {/* Placeholder for future actions */}
                <div className="glass p-6 rounded-3xl border border-white/10 opacity-50 cursor-not-allowed h-full flex flex-col items-center text-center grayscale">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-3xl mb-4">
                        📊
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Analytics</h2>
                    <p className="text-sm text-gray-400">Coming soon...</p>
                </div>
            </div>
        </div>
    );
}
