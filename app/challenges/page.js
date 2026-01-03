"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

export default function ChallengesPage() {
  const router = useRouter();
  const { user, loading: loadingUser } = useAuth();

  const [challenges, setChallenges] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null); // store id being deleted

  // Redirect if not logged in
  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [loadingUser, user, router]);

  // Load all challenges for this user
  async function loadChallenges() {
    if (!user) return;

    setLoadingData(true);
    setError(null);

    try {
      // 1️⃣ Get challenges the user is a member of
      const { data: mems, error: memError } = await supabase
        .from("challenge_members")
        .select("challenge_id, role")
        .eq("user_id", user.id);

      if (memError) throw memError;

      const challengeIds = mems.map((m) => m.challenge_id);

      if (challengeIds.length === 0) {
        setChallenges([]);
        return;
      }

      // 2️⃣ Fetch challenge details
      const { data: chData, error: chError } = await supabase
        .from("challenges")
        .select("*")
        .in("id", challengeIds)
        .order("created_at", { ascending: false });

      if (chError) throw chError;

      // 3️⃣ Merge role info for convenience
      const merged = chData.map((ch) => {
        const member = mems.find((m) => m.challenge_id === ch.id);
        return { ...ch, userRole: member?.role || "member" };
      });

      setChallenges(merged);
    } catch (err) {
      setError(err.message || "Failed to load challenges");
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    loadChallenges();
  }, [user]);

  // Delete challenge (owner only)
  async function handleDelete(challengeId) {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    setDeleting(challengeId);
    try {
      // Delete challenge and cascade to members & check-ins
      const { error } = await supabase
        .from("challenges")
        .delete()
        .eq("id", challengeId);

      if (error) throw error;

      toast.success("Challenge deleted");
      loadChallenges(); // reload list
    } catch (err) {
      toast.error("Failed to delete challenge: " + err.message);
    } finally {
      setDeleting(null);
    }
  }

  if (loadingUser || loadingData) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

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
              className="p-4 border rounded flex justify-between items-center hover:shadow cursor-pointer"
            >
              <div onClick={() => router.push(`/challenges/${ch.id}`)}>
                <p className="font-semibold">{ch.name}</p>
                {ch.description && (
                  <p className="text-sm text-gray-600">{ch.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  Role: {ch.userRole}
                </p>
              </div>
              {ch.userRole === "owner" && (
                <button
                  onClick={() => handleDelete(ch.id)}
                  disabled={deleting === ch.id}
                  className="ml-4 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  {deleting === ch.id ? "Deleting…" : "Delete"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
