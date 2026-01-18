// lib/data/challenge/challenge.api.js

import { supabase } from "@/lib/supabaseClient";

export function fetchChallengeById(challengeId) {
  return supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single();
}

export function fetchChallengeMembers(challengeId) {
  return supabase
    .from("challenge_members")
    .select(`
      user_id,
      role,
      profiles (
        user_name
      )
    `)
    .eq("challenge_id", challengeId)
    .order("role", { ascending: false });
}

export function fetchUserCheckins(challengeId, userId) {
  return supabase
    .from("challenge_checkins")
    .select("date")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId);
}

export function fetchAllCheckins(challengeId) {
  return supabase
    .from("challenge_checkins")
    .select("user_id, date")
    .eq("challenge_id", challengeId);
}

export function deleteChallengeMember(challengeId, memberId) {
  return supabase
    .from("challenge_members")
    .delete()
    .eq("challenge_id", challengeId)
    .eq("user_id", memberId);
}
