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

import { isCheckinAllowed } from "@/utils/challenge/frequencies";

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
  const subChallenges = useMemo(() => data?.subChallenges ?? [], [data?.subChallenges]);

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

  // Simplified Global Progress: 
  // If sub-challenges exist, progress is average of sub-challenge completion?
  // For now keeping simple day-based progress, but logic might need expansion.
  // Ideally: (Total Completed Checkins / Total Possible Checkins) * 100
  const globalProgress = useMemo(
    () =>
      totalDays
        ? Math.round((elapsedDays / totalDays) * 100)
        : 0,
    [elapsedDays, totalDays]
  );

  /* ---------------- Stats ---------------- */
  const memberStats = useMemo(() => {
    // 1. Group checkins by user AND sub-challenge
    // Map<userId, Map<subChallengeId, count>>
    const statsMap = new Map();

    for (const c of allCheckins) {
      if (!statsMap.has(c.user_id)) statsMap.set(c.user_id, new Map());
      const userMap = statsMap.get(c.user_id);

      const subId = c.sub_challenge_id || 'main';
      userMap.set(subId, (userMap.get(subId) || 0) + 1);
    }

    // 2. Build detailed stats
    return members.map((m) => {
      const userCheckins = statsMap.get(m.user_id) || new Map();

      // Calculate total for global simple stats
      let totalCompleted = 0;
      userCheckins.forEach(count => totalCompleted += count);

      // Per-task stats
      const tasksToMap = subChallenges.length > 0
        ? subChallenges
        : [{ id: 'main', title: 'Daily Goal', frequency: 'daily' }]; // Legacy fallback

      const taskStats = tasksToMap.map(task => {
        const count = userCheckins.get(task.id) || 0;
        const subId = task.id || 'main';
        // Handle legacy checkins that might be under 'null' or mapped to main
        // If task.id is real, check userCheckins.get(task.id)
        // If legacy fallback, check userCheckins.get(null) ??

        // Expected checkins calculation
        let expected = 1;
        if (elapsedDays > 0) {
          switch (task.frequency) {
            case 'daily': expected = elapsedDays; break;
            case 'every_other_day': expected = Math.ceil(elapsedDays / 2); break;
            case 'weekly': expected = Math.ceil(elapsedDays / 7); break;
            case 'monthly': expected = Math.ceil(elapsedDays / 30); break;
            default: expected = elapsedDays;
          }
        }

        const percent = expected > 0
          ? Math.min(100, Math.round((count / expected) * 100))
          : 0;

        return {
          id: subId,
          title: task.title,
          frequency: task.frequency,
          completed: count,
          expected,
          percent
        };
      });

      // Overall percent (average of task percents? or total vs total expected?)
      // Let's use average of task percents for a balanced view
      const validTasks = taskStats.filter(t => t.expected > 0);
      const avgPercent = validTasks.length > 0
        ? Math.round(validTasks.reduce((acc, t) => acc + t.percent, 0) / validTasks.length)
        : 0;

      return {
        ...m,
        completed: totalCompleted,
        percent: avgPercent,
        taskStats
      };
    });
  }, [members, allCheckins, subChallenges, elapsedDays]);

  /* ---------------- My checkins ---------------- */
  // Map: date -> Set(subChallengeIds)
  // If subChallengeId is null (legacy), use 'root' or similar key
  const myCheckinsMap = useMemo(() => {
    const map = new Map(); // dateStr -> Set<subChallengeId>

    for (const c of checkins) {
      const d = toDateOnly(c.date);
      if (!d) continue;
      if (!map.has(d)) map.set(d, new Set());
      // Store sub_challenge_id or 'main' if null
      map.get(d).add(c.sub_challenge_id || 'main');
    }
    return map;
  }, [checkins]);

  const myCheckinDates = useMemo(
    () => Array.from(myCheckinsMap.keys()),
    [myCheckinsMap]
  );



  // Helper to check if a specific task is done on a date
  const isTaskDoneOnDate = useCallback((dateStr, subChallengeId) => {
    const set = myCheckinsMap.get(dateStr);
    if (!set) return false;
    if (subChallengeId) return set.has(subChallengeId);
    return set.size > 0;
  }, [myCheckinsMap]);

  // New Helper: Can I check in today (or any date) for this task?
  const isCheckInAllowedForTask = useCallback((targetDate, task) => {
    if (!task) return false;

    // Check if challenge has started
    const targetStr = toDateOnly(targetDate);
    const startStr = toDateOnly(startDate);
    if (targetStr < startStr) return false;

    // Get all dates where this specific task was done
    // We need to iterate myCheckinsMap to build this set efficiently
    // Optimized: Memoize this per task if performance issues arise? 
    // For now, simple iteration is fine for typical user data size.
    const completedDates = [];
    myCheckinsMap.forEach((subIds, dateStr) => {
      if (subIds.has(task.id)) {
        completedDates.push(dateStr);
      }
    });

    return isCheckinAllowed(targetDate, task.frequency, completedDates);
  }, [myCheckinsMap, startDate]);

  const doneToday = isTaskDoneOnDate(todayStr, null); // Legacy 'done' check

  /* ---------------- Mutations ---------------- */
  const addCheckinMutation = useMutation({
    mutationFn: ({ date, subChallengeId }) =>
      upsertCheckin({
        challengeId,
        userId: user.id,
        date,
        subChallengeId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(
        challengeDetailKey(challengeId, user.id)
      );
    },
  });

  const addCheckinForDate = useCallback(
    (dateStr, subChallengeId = null) => {
      if (!dateStr) return;
      // Optimistic check? Leave it to UI to disable
      addCheckinMutation.mutate({ date: dateStr, subChallengeId });
    },
    [addCheckinMutation]
  );

  const checkInToday = useCallback((subChallengeId = null) => {
    addCheckinForDate(todayStr, subChallengeId);
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
    subChallenges,
    members,
    memberStats,
    isOwner,
    loading,
    error,
    globalProgress, // This might need UI renaming to "Time Progress" or similar
    elapsedDays,
    totalDays,
    doneToday,
    myCheckinDates,
    myCheckins: checkins,
    isTaskDoneOnDate,
    isCheckInAllowedForTask, // New helper exposed
    checkInToday,
    addCheckinForDate,
    removeMember,
    refetch,
  };
}
