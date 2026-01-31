"use client";

import { useState } from "react";

export default function TransferOwnershipModal({
    members,
    currentUserId,
    onConfirm,
    onCancel,
}) {
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const eligibleMembers = members.filter(m => m.user_id !== currentUserId);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass bg-[#0f172a] rounded-3xl p-6 w-full max-w-sm space-y-6 border border-white/10 shadow-2xl">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white mb-2">
                        Transfer Ownership
                    </h2>
                    <p className="text-sm text-gray-400">
                        You must assign a new owner before you can leave this challenge.
                    </p>
                </div>

                {eligibleMembers.length === 0 ? (
                    <div className="text-center py-4 text-yellow-500 bg-yellow-500/10 rounded-xl px-4">
                        <p className="text-sm">There are no other members to transfer to.</p>
                        <p className="text-xs mt-2 text-gray-400">Invite someone first or delete the challenge.</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {eligibleMembers.map((m) => (
                            <button
                                key={m.user_id}
                                onClick={() => setSelectedMemberId(m.user_id)}
                                className={`w-full flex items-center p-3 rounded-xl transition-all border ${selectedMemberId === m.user_id
                                        ? "bg-emerald-500/20 border-emerald-500 text-white"
                                        : "bg-white/5 border-white/5 hover:bg-white/10 text-gray-300"
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold mr-3">
                                    {m.displayName.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium truncate">{m.displayName}</span>
                                {selectedMemberId === m.user_id && (
                                    <span className="ml-auto text-emerald-400">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={!selectedMemberId}
                        onClick={() => onConfirm(selectedMemberId)}
                        className="
              flex-[2] py-2 rounded-xl bg-red-500 hover:bg-red-600 
              text-white text-sm font-bold shadow-lg shadow-red-500/20 
              disabled:opacity-50 disabled:cursor-not-allowed transition-all
            "
                    >
                        Promote & Leave
                    </button>
                </div>
            </div>
        </div>
    );
}
