"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { askForPushPermissionsAndSubscribe } from "@/lib/push";

export default function CreateChallengePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formError, setFormError] = useState(null);

  // Sub-challenges state
  const [subChallenges, setSubChallenges] = useState([
    { title: "Daily Goal", frequency: "daily", reminders_active: false }
  ]);

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // ---------- Helpers ----------
  const addSubChallenge = () => {
    setSubChallenges([...subChallenges, { title: "", frequency: "daily", reminders_active: false }]);
  };

  const removeSubChallenge = (index) => {
    if (subChallenges.length <= 1) return;
    setSubChallenges(subChallenges.filter((_, i) => i !== index));
  };

  const updateSubChallenge = async (index, field, value) => {
    if (field === "reminders_active" && value === true) {
      if (user) {
        toast.promise(
          askForPushPermissionsAndSubscribe(user.id),
          {
            loading: "Setting up push notifications...",
            success: "Push notifications enabled!",
            error: "Failed to enable push notifications.",
          }
        );
      }
    }
    const updated = [...subChallenges];
    updated[index] = { ...updated[index], [field]: value };
    setSubChallenges(updated);
  };

  // ---------- Mutation ----------
  const createChallengeMutation = useMutation({
    mutationFn: async ({ name, description, startDate, endDate, subChallenges }) => {
      // 1️⃣ Create challenge
      const { data: challenge, error: challengeError } = await supabase
        .from("challenges")
        .insert({
          name,
          description: description || null,
          start_date: startDate,
          end_date: endDate,
          created_by: user.id,
        })
        .select()
        .single();

      if (challengeError) throw challengeError;

      // 2️⃣ Add current user as owner
      const { error: memberError } = await supabase
        .from("challenge_members")
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      // 3️⃣ Create Sub-challenges
      if (subChallenges.length > 0) {
        const subChallengesToInsert = subChallenges.map((sc) => ({
          challenge_id: challenge.id,
          title: sc.title || "Untitled Task",
          frequency: sc.frequency,
          reminders_active: sc.reminders_active || false,
        }));

        const { error: subErr } = await supabase
          .from("sub_challenges")
          .insert(subChallengesToInsert);

        if (subErr) throw subErr;
      }

      return challenge;
    },
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ["challenges", user.id] });
      toast.success("Challenge created successfully!");
      router.push(`/challenges/${challenge.id}`);
    },
    onError: (err) => {
      setFormError(err.message || "Something went wrong");
      toast.error("Failed to create challenge");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !startDate || !endDate) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setFormError("Start date must be before end date.");
      return;
    }

    if (subChallenges.some(sc => !sc.title.trim())) {
      setFormError("All sub-challenges must have a title.");
      return;
    }

    createChallengeMutation.mutate({
      name,
      description,
      startDate,
      endDate,
      subChallenges
    });
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-xl mx-auto p-6 animate-fade-in mb-20">
      <div className="glass rounded-3xl p-8 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />

        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6 relative z-10">
          Create New Challenge
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* ... Basic Fields ... */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">
              Challenge Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fit & Healthy"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this challenge about?"
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-1.5">
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
              />
            </div>
          </div>

          <hr className="border-white/10 my-6" />

          {/* Sub Challenges Section */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
                Challenge Tasks
              </label>
              <button
                type="button"
                onClick={addSubChallenge}
                className="text-xs text-emerald-400 font-bold hover:text-emerald-300 transition-colors uppercase tracking-wider"
              >
                + Add Task
              </button>
            </div>

            <div className="space-y-3">
              {subChallenges.map((sc, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex flex-col gap-2 flex-[2]">
                    <input
                      type="text"
                      value={sc.title}
                      onChange={(e) => updateSubChallenge(index, "title", e.target.value)}
                      placeholder="Task Name (e.g. Drink Water)"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none text-sm"
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
                  <select
                    value={sc.frequency}
                    onChange={(e) => updateSubChallenge(index, "frequency", e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-white text-sm focus:border-emerald-500/50 focus:outline-none h-[38px]"
                  >
                    <option value="daily">Daily</option>
                    <option value="every_other_day">Every other day</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  {subChallenges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubChallenge(index)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors h-[38px] flex items-center justify-center"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {formError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span> {formError}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={createChallengeMutation.isPending}
              className="
                w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500
                py-3.5 text-white font-bold
                hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]
                transition-all disabled:opacity-50 disabled:hover:scale-100
              "
            >
              {createChallengeMutation.isPending ? "Creating..." : "🚀 Launch Challenge"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full mt-3 text-gray-500 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
