// lib/data/challenge/challenge.mutations.js

import { supabase } from "@/lib/supabaseClient";

export function upsertCheckin({ challengeId, userId, date }) {
  return supabase.from("challenge_checkins").upsert(
    {
      challenge_id: challengeId,
      user_id: userId,
      date,
    },
    {
      onConflict: "challenge_id,user_id,date",
      ignoreDuplicates: true,
    }
  );
}
