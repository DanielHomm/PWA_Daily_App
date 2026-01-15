"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useChallenges } from "@/lib/hooks/useChallenges";

function ChallengesContent() {
  const router = useRouter();
  const { challenges, loading, error, deleteChallenge } = useChallenges();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    try {
      await deleteChallenge(id);
      toast.success("Challenge deleted");
    } catch (err) {
      toast.error("Failed to delete challenge: " + err.message);
    }
  };

  if (loading) return <p>Loading challenges…</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Challenges</h1>
        <button
          onClick={() => router.push("/challenges/new")}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          + New Challenge
        </button>
      </div>

      {challenges.length === 0 ? (
        <p>You have no active challenges.</p>
      ) : (
        <ul className="space-y-3">
          {challenges.map((ch) => (
            <li
              key={ch.id}
              onClick={() => router.push(`/challenges/${ch.id}`)}
              className="p-4 border rounded flex justify-between items-center hover:shadow cursor-pointer"
            >
              <div>
                <p className="font-semibold">{ch.name}</p>
                {ch.description && (
                  <p className="text-sm text-gray-600">{ch.description}</p>
                )}
                <p className="text-xs text-gray-500">Role: {ch.userRole}</p>
              </div>

              {ch.userRole === "owner" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(ch.id);
                  }}
                  className="ml-4 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </li>

          ))}
        </ul>
      )}
    </div>
  );
}

export default function ChallengesPage() {
  return (
    <ProtectedRoute>
      <ChallengesContent />
    </ProtectedRoute>
  );
}
