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
      <div className="max-w-xl mx-auto p-6 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-[88px] bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-600 text-center mt-10">
        {error.message}
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Challenges</h1>
        <button
          onClick={() => router.push("/challenges/new")}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          + New Challenge
        </button>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center text-gray-600 mt-10 space-y-3">
          <p>You don’t have any challenges yet.</p>
          <button
            onClick={() => router.push("/challenges/new")}
            className="text-green-600 font-medium underline"
          >
            Create your first challenge
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
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
        </ul>
      )}
    </div>
  );
}
