"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InviteMember from "@/components/challenges/InviteMember";
import BackfillCheckinModal from "@/components/challenges/BackfillCheckinModal";
import TransferOwnershipModal from "@/components/challenges/TransferOwnershipModal";
import { useChallengeDetail } from "@/lib/hooks/challenges/useChallengeDetail";
import { leaveChallenge, transferOwnership } from "@/lib/data/challenge/challenge.members";
import { deleteChallengeById } from "@/lib/data/challenge/challengesList.mutations";
import toast from "react-hot-toast";

function ChallengeDetailContent() {
  const { id } = useParams();
  const [showBackfill, setShowBackfill] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const {
    challenge,
    subChallenges,
    memberStats,
    isOwner,
    loading,
    error,
    globalProgress,
    elapsedDays,
    totalDays,
    myCheckins,
    isTaskDoneOnDate,
    isCheckInAllowedForTask, // New helper
    isTaskCompletedForPeriod,
    checkInToday,
    addCheckinForDate,
    removeMember,
    refetch,
  } = useChallengeDetail(id);

  if (loading) return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="h-40 bg-white/5 rounded-3xl animate-pulse" />
      <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-[50vh] text-red-500 font-medium">
      {error}
    </div>
  );

  if (!challenge) return <p className="text-center mt-12 text-gray-500">Challenge not found</p>;

  // Format dates
  const startDate = new Date(challenge.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDate = new Date(challenge.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Fallback for challenges without sub-challenges (Legacy support)
  // Fallback for challenges without sub-challenges (Legacy support)
  const tasks = subChallenges.length > 0 ? subChallenges : [{ id: null, title: "Daily Goal", frequency: "daily" }];

  // ---------- Action Handlers ----------

  const handleLeaveChallenge = async () => {
    if (isOwner) {
      // Check if there are other members
      if (members.length <= 1) {
        if (confirm("You are the only member. Leaving will DELETE the challenge. Continue?")) {
          await deleteChallengeById(id);
          router.push("/challenges");
          toast.success("Challenge deleted");
        }
      } else {
        // Must transfer ownership first
        setShowTransfer(true);
      }
    } else {
      // Normal Member
      if (confirm("Are you sure you want to leave this challenge?")) {
        try {
          await leaveChallenge(id);
          toast.success("Left challenge");
          router.push("/challenges");
        } catch (err) {
          toast.error("Failed to leave");
        }
      }
    }
  };

  const handleTransferAndLeave = async (newOwnerId) => {
    try {
      const { data: { user } } = await import("@/lib/supabaseClient").then(m => m.supabase.auth.getUser());
      await transferOwnership(id, user.id, newOwnerId);
      // After transfer, we are now a 'member'. Now we leave.
      await leaveChallenge(id);

      setShowTransfer(false);
      router.push("/challenges");
      toast.success("Ownership transferred and challenge left successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to transfer ownership");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in pb-20">
      {/* Header Card */}
      <section className="glass rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">{challenge.name}</h1>
                {isOwner && (
                  <a
                    href={`/challenges/${id}/edit`}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 transition-colors"
                    title="Edit Challenge"
                  >
                    ⚙️
                  </a>
                )}
                <button
                  onClick={handleLeaveChallenge}
                  className="ml-auto md:ml-2 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-xs font-bold uppercase tracking-wider"
                  title="Leave Challenge"
                >
                  Leave
                </button>
              </div>
              <p className="text-gray-400 max-w-lg leading-relaxed">
                {challenge.description}
              </p>
            </div>
            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-400 whitespace-nowrap">
              📅 {startDate} – {endDate}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-300">Challenge Progress</span>
              <span className="text-emerald-400">{globalProgress}%</span>
            </div>
            <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              Day {elapsedDays} of {totalDays}
            </p>
          </div>
        </div>
      </section>

      {/* Main Action Area */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Check-ins Card */}
        <div className="glass rounded-3xl p-6 md:p-8 flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-300">Your Tasks</h2>
            <button
              onClick={() => setShowBackfill(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline decoration-dotted"
            >
              Backfill
            </button>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => {
              const dateStr = new Date().toLocaleDateString('en-CA');
              const isDone = isTaskDoneOnDate(dateStr, task.id);

              // Only check allowance if NOT done (if done, it's disabled anyway)
              // We pass 'new Date()' for today
              const isAllowed = isDone || isCheckInAllowedForTask(new Date(), task);
              const isPeriodDone = !isDone && isTaskCompletedForPeriod(new Date(), task);

              // Effective "Done" state for UI: Done today OR Done for period (weekly/monthly)
              const showAsDone = isDone || isPeriodDone;

              return (
                <div
                  key={task.id || 'legacy'}
                  className={`
                    group relative overflow-hidden rounded-2xl p-4 border transition-all duration-300
                    ${showAsDone
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : isAllowed
                        ? "bg-white/5 border-white/10 hover:border-emerald-500/30 hover:bg-white/10"
                        : "bg-black/20 border-white/5 opacity-60 cursor-not-allowed"
                    }
                  `}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <h3 className={`font-bold transition-colors ${showAsDone ? "text-emerald-400" : isAllowed ? "text-white" : "text-gray-500"}`}>
                        {task.title}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-gray-400 capitalize bg-white/5 inline-block px-2 py-0.5 rounded-lg">
                          {task.frequency.replace(/_/g, " ")}
                        </span>
                        {!isAllowed && !showAsDone && (
                          <span className="text-xs text-orange-400 bg-orange-400/10 inline-block px-2 py-0.5 rounded-lg">
                            Locked
                          </span>
                        )}
                        {isPeriodDone && (
                          <span className="text-xs text-emerald-400 bg-emerald-400/10 inline-block px-2 py-0.5 rounded-lg">
                            Done for period
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => isAllowed && !showAsDone && checkInToday(task.id)}
                      disabled={showAsDone || !isAllowed}
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                        ${showAsDone
                          ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110"
                          : isAllowed
                            ? "bg-white/10 text-gray-500 hover:bg-emerald-500 hover:text-white cursor-pointer"
                            : "bg-white/5 text-gray-600 cursor-not-allowed"
                        }
                      `}
                    >
                      {showAsDone ? "✓" : isAllowed ? "⚡" : "🔒"}
                    </button>
                  </div>

                  {/* Progress fill animation on complete */}
                  <div
                    className={`absolute inset-0 bg-emerald-500/5 transition-transform duration-500 origin-left ${showAsDone ? "scale-x-100" : "scale-x-0"}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Member / Stats Placeholder */}
        <div className="glass rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-300 mb-4">Top Performer</h2>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-xl">
                🥇
              </div>
              <div>
                <p className="font-bold text-white">
                  {/* Simplified selection of top performer for now */}
                  {memberStats[0]?.displayName || "TBD"}
                </p>
                <p className="text-xs text-gray-400">Leading the pack!</p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            Keep consistent to takeover the leaderboard!
          </div>
        </div>
      </section>

      {/* Members List */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold">Leaderboard</h2>
        </div>

        <div className="space-y-4">
          {memberStats.map((m, index) => (
            <div
              key={m.user_id}
              className="glass glass-hover rounded-xl p-4 flex items-center gap-4 group transition-all"
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold text-gray-500">
                #{index + 1}
              </div>

              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {m.displayName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-medium text-white truncate text-lg">
                    {m.displayName}
                    {m.role === "owner" && <span className="ml-2 text-xs text-yellow-500">👑</span>}
                  </span>

                  {isOwner && m.role !== "owner" && (
                    <button
                      onClick={() => removeMember(m.user_id)}
                      className="text-xs text-red-500 hover:bg-red-500/10 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Per-Task Progress Bars */}
                <div className="space-y-3">
                  {m.taskStats.map((stat) => (
                    <div key={stat.id} className="text-sm">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{stat.title}</span>
                        <span>{stat.percent}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${stat.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Stats (Optional checkmark count) */}
                <div className="mt-3 text-xs text-gray-500 text-right">
                  Total Check-ins: <span className="text-gray-300 font-mono">{m.completed}</span>
                </div>
              </div>
            </div>
          ))}

          {isOwner && (
            <div className="mt-6 p-4 border border-dashed border-white/10 rounded-xl bg-white/5">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Invite Friends</h3>
              <InviteMember challengeId={id} refreshMembers={refetch} />
            </div>
          )}
        </div>
      </section>

      {/* Backfill Modal */}
      {showBackfill && (
        <BackfillCheckinModal
          challenge={challenge}
          subChallenges={tasks}
          // Updated validation prop
          isTaskDoneOnDate={(dateStr, subId) => {
            // 1. Is it done?
            const done = isTaskDoneOnDate(dateStr, subId);
            if (done) return true; // Disabled because done

            // 2. Is it allowed by frequency?
            // Find task
            const task = tasks.find(t => t.id === subId);
            if (!task) return false;

            // If NOT allowed, we return TRUE (disabled)
            return !isCheckInAllowedForTask(new Date(dateStr), task);
          }}
          onSave={() => {
            refetch();
          }}
          onClose={() => setShowBackfill(false)}
        />
      )}

      {/* Transfer Ownership Modal */}
      {showTransfer && (
        <TransferOwnershipModal
          members={members}
          currentUserId={members.find(m => m.role === 'owner')?.user_id} // Rough check, assuming I am owner if modal is shown
          onConfirm={handleTransferAndLeave}
          onCancel={() => setShowTransfer(false)}
        />
      )}
    </div>
  );
}

export default function ChallengeDetailPage() {
  return (
    <ProtectedRoute>
      <ChallengeDetailContent />
    </ProtectedRoute>
  );
}
