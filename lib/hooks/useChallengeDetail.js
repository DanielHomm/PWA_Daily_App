"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toDateOnly(date) {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  return d.toISOString().split("T")[0];
}


export function useChallengeDetail(challengeId) {
  const { user, loading: loadingUser } = useAuth();

  const [challenge, setChallenge] = useState(null);
  const [members, setMembers] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [allCheckins, setAllCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- Fetch all data ---------------- */
  const fetchChallenge = useCallback(async () => {
    if (!user || !challengeId) return;

    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Challenge
      const { data: ch, error: chErr } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", challengeId)
        .single();

      if (chErr) throw chErr;
      setChallenge(ch);

      // 2️⃣ Members + profiles
      const { data: mems, error: memErr } = await supabase
        .from("challenge_members")
        .select(`
          user_id,
          role,
          profiles (
            id,
            user_name
          )
        `)
        .eq("challenge_id", challengeId)
        .order("role", { ascending: false });

      if (memErr) throw memErr;

      setMembers(
        mems.map((m) => ({
          user_id: m.user_id,
          role: m.role,
          displayName: m.profiles?.user_name || m.user_id,
        }))
      );

      // 3️⃣ My check-ins
      const { data: userCheckins } = await supabase
        .from("challenge_checkins")
        .select("date")
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id);

      setCheckins(userCheckins || []);

      // 4️⃣ All check-ins
      const { data: all } = await supabase
        .from("challenge_checkins")
        .select("user_id, date")
        .eq("challenge_id", challengeId);

      setAllCheckins(all || []);
    } catch (err) {
      setError("Failed to load challenge");
    } finally {
      setLoading(false);
    }
  }, [challengeId, user]);

  useEffect(() => {
    if (!loadingUser && user) {
      fetchChallenge();
    }
  }, [loadingUser, user, fetchChallenge]);

  /* ---------------- Derived data ---------------- */
  const currentMember = useMemo(
    () => members.find((m) => m.user_id === user?.id),
    [members, user]
  );

  const isOwner = currentMember?.role === "owner";

  const startDate = useMemo(
    () => (challenge ? new Date(challenge.start_date) : null),
    [challenge]
  );

  const endDate = useMemo(
    () => (challenge ? new Date(challenge.end_date) : null),
    [challenge]
  );

  const today = new Date();
  const todayStr = toDateOnly(today);

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Math.floor((endDate - startDate) / MS_PER_DAY) + 1;
  }, [startDate, endDate]);

  const elapsedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    if (today < startDate) return 0;
    if (today > endDate) return totalDays;
    return Math.floor((today - startDate) / MS_PER_DAY) + 1;
  }, [startDate, endDate, totalDays]);

  const globalProgress = totalDays
    ? Math.round((elapsedDays / totalDays) * 100)
    : 0;

  const memberStats = useMemo(() => {
    return members.map((m) => {
      const completed = allCheckins.filter(
        (c) => c.user_id === m.user_id
      ).length;

      const missed = Math.max(elapsedDays - completed, 0);
      const percent = elapsedDays
        ? Math.round((completed / elapsedDays) * 100)
        : 0;

      return { ...m, completed, missed, percent };
    });
  }, [members, allCheckins, elapsedDays]);

  const myCheckinDates = useMemo(
  () =>
    checkins
      .map((c) => toDateOnly(c.date))
      .filter(Boolean),
  [checkins]
);

  const doneToday = myCheckinDates.includes(todayStr);

  /* ---------------- Actions ---------------- */
  async function addCheckinForDate(dateStr) {
  if (!dateStr) return;

  const { error } = await supabase
  .from("challenge_checkins")
  .upsert(
    {
      challenge_id: challengeId,
      user_id: user.id,
      date: dateStr,
    },
    {
      onConflict: "challenge_id,user_id,date",
      ignoreDuplicates: true,
    }
  );

  if (error) {
    console.error(error.message);
    return;
  }

  setCheckins((prev) =>
    prev.some((c) => toDateOnly(c.date) === dateStr)
      ? prev
      : [...prev, { date: dateStr }]
  );

  setAllCheckins((prev) =>
    prev.some(
      (c) =>
        c.user_id === user.id &&
        toDateOnly(c.date) === dateStr
    )
      ? prev
      : [...prev, { user_id: user.id, date: dateStr }]
  );
}


  async function checkInToday() {
    if (doneToday) return;
    await addCheckinForDate(todayStr);
  }

  async function removeMember(memberId) {
    await supabase
      .from("challenge_members")
      .delete()
      .eq("challenge_id", challengeId)
      .eq("user_id", memberId);

    setMembers((prev) => prev.filter((m) => m.user_id !== memberId));
  }

  return {
    challenge,
    members,
    memberStats,
    isOwner,
    loading,
    error,
    globalProgress,
    elapsedDays,
    totalDays,
    doneToday,
    myCheckinDates,          // 👈 wichtig für Kalender
    checkInToday,
    addCheckinForDate,       // 👈 Backfill
    removeMember,
    refetch: fetchChallenge,
  };
}
