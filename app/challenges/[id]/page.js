"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../lib/AuthContext";
import { supabase } from "../../../lib/supabaseClient";
import InviteMember from "../../../components/challenges/InviteMember";

export default function ChallengeDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, loading: loadingUser } = useAuth();

  const [challenge, setChallenge] = useState(null);
  const [members, setMembers] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [loadingUser, user, router]);

  // Utility to load members and merge with profiles
  async function loadMembers(memData = null) {
    try {
      // 1️⃣ Use provided memData or fetch from Supabase
      let mem = memData;
      if (!mem) {
        const { data, error } = await supabase
          .from("challenge_members")
          .select("user_id, role")
          .eq("challenge_id", id)
          .order("role", { ascending: false });
        console.log("Members data:", data, error);
        if (error) throw error;
        mem = data || [];
      }

      if (!Array.isArray(mem)) mem = [];

      // 2️⃣ Fetch profiles for members
      const userIds = mem.map((m) => m.user_id);
      let profiles = [];
      if (userIds.length > 0) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, user_name")
          .in("id", userIds);

        profiles = prof || [];
      }

      // 3️⃣ Merge members + profiles
      const mergedMembers = mem.map((m) => ({
        ...m,
        displayName:
          profiles.find((p) => p.id === m.user_id)?.user_name || m.user_id,
      }));

      setMembers(mergedMembers);
    } catch (err) {
      setError(err.message || "Failed to load members");
    }
  }

  // Load challenge, members, and check-ins
  useEffect(() => {
    if (!user || !id) return;

    async function loadData() {
      setLoadingData(true);
      setError(null);

      try {
        // 1️⃣ Challenge info
        const { data: ch, error: chError } = await supabase
          .from("challenges")
          .select("*")
          .eq("id", id)
          .single();

        if (chError) throw chError;
        setChallenge(ch);

        // 2️⃣ Members
        await loadMembers();

        // 3️⃣ Check-ins for current user
        const { data: ci, error: ciError } = await supabase
          .from("challenge_checkins")
          .select("*")
          .eq("challenge_id", id)
          .eq("user_id", user.id);

        if (ciError) throw ciError;
        setCheckins(ci || []);
      } catch (err) {
        setError(err.message || "Failed to load challenge");
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [id, user]);

  // Check if already done today
  const doneToday = checkins.some(
    (c) => new Date(c.date).toDateString() === new Date().toDateString()
  );

  // Handle check-in
  async function handleCheckin() {
    if (doneToday) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("challenge_checkins")
        .insert({ challenge_id: id, user_id: user.id });

      if (error) throw error;

      setCheckins((prev) => [
        ...prev,
        { challenge_id: id, user_id: user.id, date: new Date().toISOString() },
      ]);
    } catch (err) {
      setError(err.message || "Failed to check in");
    } finally {
      setSubmitting(false);
    }
  }

  // Loading / error states
  if (loadingUser || loadingData) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!challenge) return <p>Challenge not found</p>;

  // Progress calculation
  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const totalDays = Math.max(
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1,
    1
  );
  const doneDays = checkins.length;
  const progressPercent = Math.min((doneDays / totalDays) * 100, 100).toFixed(0);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{challenge.name}</h1>
      {challenge.description && <p className="mb-4">{challenge.description}</p>}

      <p className="mb-2 text-sm text-gray-600">
        {startDate.toLocaleDateString()} – {endDate.toLocaleDateString()}
      </p>

      {/* Progress */}
      <div className="mb-4">
        <p className="mb-1">
          Progress: {doneDays}/{totalDays} days
        </p>
        <div className="w-full h-4 bg-gray-300 rounded">
          <div
            className="h-4 bg-green-500 rounded"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Check-in */}
      <button
        onClick={handleCheckin}
        disabled={doneToday || submitting}
        className={`w-full py-2 rounded text-white mb-4 ${
          doneToday ? "bg-gray-400" : "bg-green-600"
        }`}
      >
        {doneToday
          ? "Done Today ✅"
          : submitting
          ? "Submitting…"
          : "Mark Done Today"}
      </button>

      {/* Members */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Members</h2>
        </div>

        <ul className="list-disc list-inside mb-2">
          {members.map((m) => (
            <li key={m.user_id}>
              {m.displayName} {m.role === "owner" && "(Owner)"}
            </li>
          ))}
        </ul>

        {/* Invite component */}
        <InviteMember
          challengeId={id}
          members={members}
          refreshMembers={loadMembers} // <-- refresh after adding
        />
      </div>
    </div>
  );
}
