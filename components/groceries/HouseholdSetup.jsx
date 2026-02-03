"use client";

import { useState } from "react";
import { useHouseholds } from "@/lib/hooks/groceries/useHouseholds";
import toast from "react-hot-toast";

export default function HouseholdSetup() {
    const { createHousehold, joinHousehold, isCreating } = useHouseholds();
    const [name, setName] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [view, setView] = useState("create"); // 'create' | 'join'

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            await createHousehold(name);
            toast.success("Household created!");
        } catch (err) {
            toast.error(err.message || "Failed to create household");
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        if (joinCode.length < 6) return;

        try {
            await joinHousehold(joinCode);
            toast.success("Joined household!");
        } catch (err) {
            toast.error(err.message || "Failed to join. Check code.");
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 mt-10">
            <div className="text-center mb-8">
                <div className="text-6xl mb-4">🏡</div>
                <h1 className="text-2xl font-bold text-white mb-2">Setup Your Home</h1>
                <p className="text-gray-400">
                    Create a household to start tracking groceries and sharing lists.
                </p>
            </div>

            <div className="glass rounded-3xl p-6">
                <div className="flex gap-4 border-b border-white/10 mb-6 pb-2">
                    <button
                        onClick={() => setView("create")}
                        className={`flex-1 pb-2 text-sm font-medium transition-colors ${view === "create" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        Create New
                    </button>
                    <button
                        onClick={() => setView("join")}
                        className={`flex-1 pb-2 text-sm font-medium transition-colors ${view === "join" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        Join Existing
                    </button>
                </div>

                {view === "create" ? (
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Household Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. The Smiths, Apartment 404"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!name.trim() || isCreating}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                        >
                            {isCreating ? "Creating..." : "Create Household"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleJoin} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Invite Code</label>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="e.g. A1B2C3"
                                maxLength={6}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors tracking-widest uppercase font-mono text-center text-lg"
                                autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">Ask a member for their code from Household Settings</p>
                        </div>

                        <button
                            type="submit"
                            disabled={joinCode.length < 6 || isCreating}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                        >
                            {isCreating ? "Joining..." : "Join Household"}
                        </button>
                    </form>
                )}
            </div >
        </div >
    );
}
