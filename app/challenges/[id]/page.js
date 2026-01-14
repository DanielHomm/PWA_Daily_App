"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InviteMember from "@/components/challenges/InviteMember";
import BackfillCheckinModal from "@/components/challenges/BackfillCheckinModal";
import { useChallengeDetail } from "@/lib/hooks/useChallengeDetail";

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

  if (loading) return <p>Loading challenge…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!challenge) return <p>Challenge not found</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{challenge.name}</h1>
        <p className="text-gray-600 mt-1">{challenge.description}</p>
        <p className="text-sm text-gray-500 mt-2">
          {new Date(challenge.start_date).toLocaleDateString()} –{" "}
          {new Date(challenge.end_date).toLocaleDateString()}
        </p>
      </div>

      {/* Overall Progress */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">Overall Progress</h2>
        <div className="w-full h-4 bg-gray-200 rounded">
          <div
            className="h-4 bg-blue-600 rounded"
            style={{ width: `${globalProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">
          {elapsedDays} / {totalDays} Tage · {globalProgress}%
        </p>
      </section>

      {/* Check-in today */}
      <button
        onClick={checkInToday}
        disabled={doneToday}
        className={`w-full py-3 rounded text-white font-medium ${
          doneToday ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {doneToday ? "Done Today ✅" : "Mark Done Today"}
      </button>

      {/* Backfill */}
      <button
        onClick={() => setShowBackfill(true)}
        className="w-full py-2 border rounded text-sm text-gray-700 hover:bg-gray-50"
      >
        📅 Check-in nachtragen
      </button>

      {/* Members */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Members</h2>

        {memberStats.map((m) => (
          <div key={m.user_id} className="border rounded p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {m.displayName}
                {m.role === "owner" && (
                  <span className="text-sm text-gray-500"> (Owner)</span>
                )}
              </span>

              {isOwner && m.role !== "owner" && (
                <button
                  onClick={() => removeMember(m.user_id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="w-full h-3 bg-gray-200 rounded">
              <div
                className="h-3 bg-green-500 rounded"
                style={{ width: `${m.percent}%` }}
              />
            </div>

            <p className="text-sm text-gray-600">
              ✅ {m.completed} completed · ❌ {m.missed} missed
            </p>
          </div>
        ))}

        {isOwner && (
          <InviteMember challengeId={id} refreshMembers={refetch} />
        )}
      </section>

      {/* Backfill Modal */}
      {showBackfill && (
        <BackfillCheckinModal
          challenge={challenge}
          existingDates={myCheckinDates}
          onSave={addCheckinForDate}
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
