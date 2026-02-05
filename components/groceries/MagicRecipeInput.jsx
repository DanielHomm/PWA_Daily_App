"use client";

import { useState } from "react";
import { Sparkles, Link as LinkIcon, Loader2 } from "lucide-react";
import { useRecipeImport } from "@/lib/hooks/groceries/useRecipeImport";

export default function MagicRecipeInput({ onImport }) {
    const [url, setUrl] = useState("");
    const { extractRecipe, isLoading } = useRecipeImport();

    const handleImport = async (e) => {
        e.preventDefault();
        if (!url) return;

        const data = await extractRecipe(url);
        if (data) {
            onImport(data);
            setUrl(""); // Clear after success
        }
    };

    return (
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3 text-indigo-400">
                <Sparkles size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Magic Import</h3>
            </div>

            <form onSubmit={handleImport} className="flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <LinkIcon size={16} />
                    </div>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste URL (Chefkoch, etc.)"
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:border-indigo-500 outline-none transition-colors"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !url}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Import"}
                </button>
            </form>
            <p className="text-[10px] text-gray-500 mt-2 pl-1">
                Currently supports public recipe websites. Spices will be separated automatically.
            </p>
        </div>
    );
}
