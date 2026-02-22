"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchFullChallengeData } from "@/lib/data/challenge/challenge.queries";
import { updateChallenge, upsertSubChallenges, deleteSubChallenge } from "@/lib/data/challenge/challenge.updates";
import { askForPushPermissionsAndSubscribe } from "@/lib/push";

export default function EditChallengePage() {
    const router = useRouter();
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const queryClient = useQueryClient();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // subChallenges state: Array of objects
    // { id: string | null, title: string, frequency: string, isNew: boolean, deleted: boolean }
    const [subChallenges, setSubChallenges] = useState([]);
    const [loadingConfig, setLoadingConfig] = useState(true);

    // Fetch Data
    const { data, isLoading } = useQuery({
        queryKey: ["challenge-detail", id, user?.id],
        enabled: !!id && !!user,
        queryFn: () => fetchFullChallengeData({ challengeId: id, userId: user.id }),
    });

    useEffect(() => {
        if (data?.challenge) {
            const c = data.challenge;
            setName(c.name);
            setDescription(c.description || "");
            setStartDate(c.start_date);
            setEndDate(c.end_date);

            // Check owner
            const isOwner = data.members.some(m => m.user_id === user.id && m.role === 'owner');
            if (!isOwner) {
                toast.error("Access denied");
                router.push(`/challenges/${id}`);
            }
        }

        if (data?.subChallenges) {
            setSubChallenges(data.subChallenges.map(sc => ({
                id: sc.id,
                title: sc.title,
                frequency: sc.frequency,
                reminders_active: sc.reminders_active || false,
                isNew: false
            })));
        }

        if (data) setLoadingConfig(false);
    }, [data, user, id, router]);


    // ---------- Actions ----------

    const addSubChallenge = () => {
        setSubChallenges([
            ...subChallenges,
            { id: null, title: "", frequency: "daily", reminders_active: false, isNew: true }
        ]);
    };

    const removeSubChallenge = async (index) => {
        const sc = subChallenges[index];

        if (sc.isNew) {
            // Just remove from state
            setSubChallenges(subChallenges.filter((_, i) => i !== index));
        } else {
            // Mark for deletion or delete immediately?
            // Immediate deletion is risky but simpler for now. 
            // Better: Confirm dialog.
            if (confirm("Wait! Deleting this task will DELETE ALL CHECK-INS associated with it. Are you sure?")) {
                try {
                    await deleteSubChallenge(sc.id);
                    setSubChallenges(subChallenges.filter((_, i) => i !== index));
                    toast.success("Task deleted");
                } catch (err) {
                    toast.error("Failed to delete task");
                }
            }
        }
    };

    const updateSubChallenge = async (index, field, value) => {
        if (field === "reminders_active" && value === true) {
            if (user) {
                toast.promise(
                    askForPushPermissionsAndSubscribe(user.id),
                    {
                        loading: "Setting up push notifications...",
                        success: "Push notifications enabled!",
                        error: "Failed to enable notifications.",
                    }
                );
            }
        }
        const updated = [...subChallenges];
        updated[index] = { ...updated[index], [field]: value };
        setSubChallenges(updated);
    };

    // ---------- Mutation ----------
    const saveMutation = useMutation({
        mutationFn: async () => {
            // 1. Update Core
            await updateChallenge(id, {
                name,
                description,
                start_date: startDate,
                end_date: endDate
            });

            // 2. Upsert Sub-Challenges (New & Modified)
            const toUpsert = subChallenges.map(sc => ({
                id: sc.isNew ? undefined : sc.id, // undefined tells Supabase to generate ID
                challenge_id: id,
                title: sc.title,
                frequency: sc.frequency,
                reminders_active: sc.reminders_active || false
            }));

            if (toUpsert.length > 0) {
                await upsertSubChallenges(toUpsert);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["challenge-detail", id]);
            toast.success("Changes saved!");
            router.push(`/challenges/${id}`);
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    if (authLoading || isLoading || loadingConfig) {
        return <div className="p-10 text-center text-gray-500">Loading...</div>;
    }

    return (
        <div className="max-w-xl mx-auto p-6 animate-fade-in mb-20 text-white">
            <div className="glass rounded-3xl p-8 relative overflow-hidden">
                <h1 className="text-3xl font-bold mb-6">Edit Challenge</h1>

                <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-6">

                    {/* Basic Fields */}
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">Start</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">End</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white" />
                        </div>
                    </div>

                    <hr className="border-white/10 my-6" />

                    {/* Sub Challenges */}
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
                                Challenge Tasks
                            </label>
                            <button
                                type="button"
                                onClick={addSubChallenge}
                                className="text-xs text-emerald-400 font-bold hover:text-emerald-300 uppercase tracking-wider"
                            >
                                + Add New
                            </button>
                        </div>

                        <div className="space-y-3">
                            {subChallenges.map((sc, index) => (
                                <div key={sc.id || `new-${index}`} className="flex gap-2">
                                    <div className="flex flex-col gap-2 flex-[2]">
                                        <input
                                            type="text"
                                            value={sc.title}
                                            onChange={(e) => updateSubChallenge(index, "title", e.target.value)}
                                            placeholder="Task Name"
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                                        />
                                        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer w-fit pl-1">
                                            <input
                                                type="checkbox"
                                                checked={sc.reminders_active || false}
                                                onChange={(e) => updateSubChallenge(index, "reminders_active", e.target.checked)}
                                                className="rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500/20"
                                            />
                                            Enable Reminders (4h before reset)
                                        </label>
                                    </div>

                                    {/* Frequency: Disabled if not new */}
                                    <div className="flex-1 relative">
                                        <select
                                            value={sc.frequency}
                                            disabled={!sc.isNew} // RESTRICTION APPLIED
                                            onChange={(e) => updateSubChallenge(index, "frequency", e.target.value)}
                                            className={`
                            w-full h-full rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-white text-sm focus:outline-none
                            ${!sc.isNew ? 'opacity-50 cursor-not-allowed' : 'focus:border-emerald-500/50'}
                        `}
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="every_other_day">Every other day</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                        {!sc.isNew && (
                                            <div className="absolute inset-0" title="Frequency cannot be changed for existing tasks (delete and recreate to change)"></div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeSubChallenge(index)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                                        title="Delete Task"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saveMutation.isPending}
                            className="flex-[2] py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all"
                        >
                            {saveMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
