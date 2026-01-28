"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InviteMember from "@/components/challenges/InviteMember";
import BackfillCheckinModal from "@/components/challenges/BackfillCheckinModal";
import { useChallengeDetail } from "@/lib/hooks/challenges/useChallengeDetail";

function ChallengeDetailContent() {
  const { id } = useParams();
  const [showBackfill, setShowBackfill] = useState(false);

  const {
    challenge,
    memberStats,
    isOwner,
    loading,
    error,
    globalProgress,
    elapsedDays,
    totalDays,
    doneToday,
    myCheckinDates,
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in pb-20">
      {/* Header Card */}
      <section className="glass rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{challenge.name}</h1>
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
        {/* Check-in Card */}
        <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6">
          <h2 className="text-lg font-semibold text-gray-300">Daily Check-in</h2>

          <button
            onClick={checkInToday}
            disabled={doneToday}
            className={`
              relative w-40 h-40 rounded-full flex items-center justify-center
              transition-all duration-300 group
              ${doneToday
                ? "bg-emerald-500/20 text-emerald-400 cursor-default ring-4 ring-emerald-500/20"
                : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/40 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-emerald-500/30 hover:ring-emerald-400/50"
              }
            `}
          >
            {doneToday ? (
              <div className="flex flex-col items-center animate-fade-in">
                <span className="text-5xl mb-2">✅</span>
                <span className="font-bold">Done!</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">⚡</span>
                <span className="font-bold text-lg">I did it</span>
              </div>
            )}
          </button>

          <button
            onClick={() => setShowBackfill(true)}
            className="text-sm text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <span>Forgot previous days?</span>
            <span className="underline decoration-dotted">Backfill</span>
          </button>
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
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-white truncate">
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

                {/* Progress Mini Bar */}
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-grow h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${m.percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-emerald-400 font-mono min-w-[3ch] text-right">
                    {m.percent}%
                  </span>
                </div>

                <div className="mt-1 flex gap-4 text-xs text-gray-500">
                  <span>✅ {m.completed} days</span>
                  <span>❌ {m.missed} days</span>
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
          existingDates={myCheckinDates}
          onSave={async (date) => {
            await addCheckinForDate(date);
            refetch();
          }}
          onClose={() => setShowBackfill(false)}
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
