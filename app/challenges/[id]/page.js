"use client";

import { useState, useEffect, useMemo } from "react";
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
  const [allCheckins, setAllCheckins] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* -------------------- Auth Redirect -------------------- */
  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [loadingUser, user, router]);

  /* -------------------- Load Members -------------------- */
  async function loadMembers() {
    const { data, error } = await supabase
      .from("challenge_members")
      .select("user_id, role")
      .eq("challenge_id", id)
      .order("role", { ascending: false });

    if (error) throw error;

    const userIds = data.map((m) => m.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, user_name")
      .in("id", userIds);

    const merged = data.map((m) => ({
      ...m,
      displayName:
        profiles?.find((p) => p.id === m.user_id)?.user_name || m.user_id,
    }));

    setMembers(merged);
  }

  /* -------------------- Load Data -------------------- */
  useEffect(() => {
    if (!user || !id) return;

    async function loadData() {
      setLoadingData(true);
      setError(null);

      try {
        const { data: ch } = await supabase
          .from("challenges")
          .select("*")
          .eq("id", id)
          .single();

        setChallenge(ch);

        await loadMembers();

        const { data: userCheckins } = await supabase
          .from("challenge_checkins")
          .select("*")
          .eq("challenge_id", id)
          .eq("user_id", user.id);

        setCheckins(userCheckins || []);

        const { data: all } = await supabase
          .from("challenge_checkins")
          .select("user_id, date")
          .eq("challenge_id", id);

        setAllCheckins(all || []);
      } catch (err) {
        setError("Failed to load challenge");
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [id, user]);

  /* -------------------- Permissions -------------------- */
  const currentMember = members.find((m) => m.user_id === user?.id);
  const isOwner = currentMember?.role === "owner";

  function canRemoveMember(member) {
    return isOwner && member.user_id !== user.id;
  }

  /* -------------------- Dates & Progress -------------------- */
  const startDate = useMemo(
    () => new Date(challenge?.start_date),
    [challenge]
  );
  const endDate = useMemo(
    () => new Date(challenge?.end_date),
    [challenge]
  );

  const today = new Date();

  const totalDays =
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  const elapsedDays = Math.min(
    Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)) + 1,
    totalDays
  );

  /* -------------------- Global Progress -------------------- */
  const totalPossibleCheckins = members.length * elapsedDays;
  const totalDoneCheckins = allCheckins.length;

  const globalProgress = totalPossibleCheckins
    ? Math.round((totalDoneCheckins / totalPossibleCheckins) * 100)
    : 0;

  /* -------------------- Member Stats -------------------- */
  const memberStats = members.map((m) => {
    const completed = allCheckins.filter(
      (c) => c.user_id === m.user_id
    ).length;

    const missed = Math.max(elapsedDays - completed, 0);
    const percent = elapsedDays
      ? Math.round((completed / elapsedDays) * 100)
      : 0;

    return { ...m, completed, missed, percent };
  });

  /* -------------------- Check-in -------------------- */
  const doneToday = checkins.some(
    (c) => new Date(c.date).toDateString() === today.toDateString()
  );

  async function handleCheckin() {
    if (doneToday) return;

    setSubmitting(true);
    await supabase
      .from("challenge_checkins")
      .insert({ challenge_id: id, user_id: user.id });

    setCheckins((prev) => [
      ...prev,
      { user_id: user.id, date: new Date().toISOString() },
    ]);

    setAllCheckins((prev) => [
      ...prev,
      { user_id: user.id, date: new Date().toISOString() },
    ]);

    setSubmitting(false);
  }

  /* -------------------- Remove Member -------------------- */
  async function handleRemoveMember(member) {
    if (!confirm(`Remove ${member.displayName}?`)) return;

    await supabase
      .from("challenge_members")
      .delete()
      .eq("challenge_id", id)
      .eq("user_id", member.user_id);

    await loadMembers();
  }

  /* -------------------- UI States -------------------- */
  if (loadingUser || loadingData) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!challenge) return <p>Challenge not found</p>;

  /* -------------------- Render -------------------- */
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{challenge.name}</h1>
        <p className="text-gray-600 mt-1">{challenge.description}</p>
        <p className="text-sm text-gray-500 mt-2">
          {startDate.toLocaleDateString()} – {endDate.toLocaleDateString()}
        </p>
      </div>

      {/* Global Progress */}
      <section className="space-y-2">
        <h2 className="font-semibold text-lg">Overall Progress</h2>
        <div className="w-full h-4 bg-gray-200 rounded">
          <div
            className="h-4 bg-blue-600 rounded"
            style={{ width: `${globalProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">{globalProgress}% completed</p>
      </section>

      {/* Check-in */}
      <button
        onClick={handleCheckin}
        disabled={doneToday || submitting}
        className={`w-full py-3 rounded text-white font-medium ${
          doneToday ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {doneToday ? "Done Today ✅" : "Mark Done Today"}
      </button>

      {/* Members */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Members</h2>

        {memberStats.map((m) => (
          <div
            key={m.user_id}
            className="border rounded p-3 space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {m.displayName}{" "}
                {m.role === "owner" && (
                  <span className="text-sm text-gray-500">(Owner)</span>
                )}
              </span>

              {canRemoveMember(m) && (
                <button
                  onClick={() => handleRemoveMember(m)}
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
          <InviteMember
            challengeId={id}
            members={members}
            refreshMembers={loadMembers}
          />
        )}
      </section>
    </div>
  );
}
