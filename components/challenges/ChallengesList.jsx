"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useChallengesList } from "@/lib/hooks/challenges/useChallengesList";
import ChallengeListItem from "./ChallengeListItem";

export default function ChallengesList() {
  const router = useRouter();

  const {
    challenges,
    loading,
    error,
    deleteChallenge,
    isDeleting,
    deletingId,
  } = useChallengesList();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    try {
      await deleteChallenge(id);
      toast.success("Challenge deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete challenge");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-white/5 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <p className="text-red-500 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Your Challenges
          </h1>
          <p className="text-gray-400 mt-1">Manage and track your active challenges</p>
        </div>

        <button
          onClick={() => router.push("/challenges/new")}
          className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          + New Challenge
        </button>
      </div>

      {challenges.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border-dashed border-2 border-white/10 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Challenges Yet</h2>
          <p className="text-gray-400 mb-8 max-w-sm">
            Start your journey by creating a challenge and inviting your friends!
          </p>
          <button
            onClick={() => router.push("/challenges/new")}
            className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline text-lg"
          >
            Create your first challenge →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <ChallengeListItem
              key={challenge.id}
              challenge={challenge}
              onOpen={(id) => router.push(`/challenges/${id}`)}
              onDelete={handleDelete}
              isDeleting={isDeleting}
              deletingId={deletingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
