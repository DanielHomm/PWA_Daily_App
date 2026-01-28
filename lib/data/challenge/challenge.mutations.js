// lib/data/challenge/challenge.mutations.js

import { supabase } from "@/lib/supabaseClient";

export function upsertCheckin({ challengeId, userId, date, subChallengeId }) {
  return supabase.from("challenge_checkins").upsert(
    {
      challenge_id: challengeId,
      user_id: userId,
      date,
      sub_challenge_id: subChallengeId || null,
    },
    {
      onConflict: "user_id,date,sub_challenge_id",
      ignoreDuplicates: true,
    }
  );
}
