"use client";

import { X, Copy, Check, Users, LogOut } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { useHouseholds } from "@/lib/hooks/groceries/useHouseholds";

export default function HouseholdSettingsModal({ household, onClose }) {
    const { households, switchHousehold } = useHouseholds();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(household.invite_code);
        setCopied(true);
        toast.success("Code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Users size={20} className="text-emerald-400" />
                    Household Settings
                </h2>

                <div className="space-y-6">
                    {/* Switcher */}
                    <div>
                        <h3 className="text-sm font-bold text-white mb-2">My Households</h3>
                        <div className="space-y-2">
                            {households.map(h => (
                                <button
                                    key={h.id}
                                    onClick={() => { switchHousehold(h.id); onClose(); }}
                                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors ${h.id === household.id ? "bg-emerald-500/20 border border-emerald-500/50" : "bg-white/5 hover:bg-white/10"}`}
                                >
                                    <span className={`font-medium ${h.id === household.id ? "text-emerald-400" : "text-white"}`}>{h.name}</span>
                                    {h.id === household.id && <Check size={16} className="text-emerald-400" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-white/10"></div>

                    {/* Invite Code */}
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Invite Code (Current)</label>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-black/30 p-3 rounded-lg text-center font-mono text-xl tracking-widest text-emerald-400 font-bold select-all">
                                    {household.invite_code || "LOADING"}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                                >
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">Share this code to let others join.</p>
                        </div>
                    </div>

                    {/* Members List */}
                    <div>
                        <h3 className="text-sm font-bold text-white mb-2">Members</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {household.household_members?.map(m => (
                                <div key={m.user_id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                                    <span className="text-sm text-gray-300">User {m.user_id.slice(0, 4)}...</span>
                                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-gray-400 capitalize">{m.role}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Leave Button */}
                    <button
                        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        onClick={() => toast("Leaving not implemented yet")}
                    >
                        <LogOut size={18} /> Leave Household
                    </button>

                    <button
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded-xl transition-colors text-sm"
                        onClick={() => {
                            // Logic to trigger Join Modal?
                            // Ideally we navigate to a Join page or open the Setup modal.
                            // For now, let's just instruct user.
                            toast("Go to home screen to create/join new");
                        }}
                    >
                        + Join Another Household
                    </button>
                </div>
            </div>
        </div>
    );
}
