"use client";

import { useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";

import { fetchFullChallengeData } from "@/lib/data/challenge/challenge.queries";
import { upsertCheckin } from "@/lib/data/challenge/challenge.mutations";
import { deleteChallengeMember } from "@/lib/data/challenge/challenge.api";

import {
  toDateOnly,
  calculateTotalDays,
  calculateElapsedDays,
} from "@/utils/challenge/dates";

/* ---------------- Query key helper ---------------- */
const challengeDetailKey = (challengeId, userId) => [
  "challenge-detail",
  challengeId,
  userId,
];

export function useChallengeDetail(challengeId) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => toDateOnly(today), [today]);

  /* ---------------- Fetch (React Query) ---------------- */
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: challengeDetailKey(challengeId, user?.id),
    enabled: !!challengeId && !!user,
    queryFn: () =>
      fetchFullChallengeData({
        challengeId,
        userId: user.id,
      }),
  });

  const challenge = data?.challenge ?? null;

  const members = useMemo(
    () =>
      (data?.members ?? []).map((m) => ({
        user_id: m.user_id,
        role: m.role,
        displayName: m.profiles?.user_name || m.user_id,
      })),
    [data?.members]
  );

  const checkins = data?.myCheckins ?? [];
  const allCheckins = data?.allCheckins ?? [];

  /* ---------------- Derived ---------------- */
  const currentMember = useMemo(
    () => members.find((m) => m.user_id === user?.id),
    [members, user?.id]
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

  const totalDays = useMemo(
    () => calculateTotalDays(startDate, endDate),
    [startDate, endDate]
  );

  const elapsedDays = useMemo(
    () => calculateElapsedDays(startDate, endDate, today),
    [startDate, endDate, today]
  );

  const globalProgress = useMemo(
    () =>
      totalDays
        ? Math.round((elapsedDays / totalDays) * 100)
        : 0,
    [elapsedDays, totalDays]
  );

  /* ---------------- Stats ---------------- */
  const checkinsByUser = useMemo(() => {
    const map = {};
    for (const c of allCheckins) {
      map[c.user_id] = (map[c.user_id] || 0) + 1;
    }
    return map;
  }, [allCheckins]);

  const memberStats = useMemo(() => {
    return members.map((m) => {
      const completed = checkinsByUser[m.user_id] || 0;
      const missed = Math.max(elapsedDays - completed, 0);
      const percent = elapsedDays
        ? Math.round((completed / elapsedDays) * 100)
        : 0;

      return { ...m, completed, missed, percent };
    });
  }, [members, checkinsByUser, elapsedDays]);

  /* ---------------- My checkins ---------------- */
  const myCheckinSet = useMemo(
    () =>
      new Set(
        checkins
          .map((c) => toDateOnly(c.date))
          .filter(Boolean)
      ),
    [checkins]
  );

  const myCheckinDates = useMemo(
    () => Array.from(myCheckinSet),
    [myCheckinSet]
  );

  const doneToday = myCheckinSet.has(todayStr);

  /* ---------------- Mutations ---------------- */
  const addCheckinMutation = useMutation({
    mutationFn: ({ date }) =>
      upsertCheckin({
        challengeId,
        userId: user.id,
        date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(
        challengeDetailKey(challengeId, user.id)
      );
    },
  });

  const addCheckinForDate = useCallback(
    (dateStr) => {
      if (!dateStr || doneToday) return;
      addCheckinMutation.mutate({ date: dateStr });
    },
    [addCheckinMutation, doneToday]
  );

  const checkInToday = useCallback(() => {
    addCheckinForDate(todayStr);
  }, [addCheckinForDate, todayStr]);

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) =>
      deleteChallengeMember(challengeId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries(
        challengeDetailKey(challengeId, user.id)
      );
    },
  });

  const removeMember = useCallback(
    (memberId) => removeMemberMutation.mutate(memberId),
    [removeMemberMutation]
  );

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
    myCheckinDates,
    checkInToday,
    addCheckinForDate,
    removeMember,
    refetch,
  };
}
