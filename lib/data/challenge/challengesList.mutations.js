import { supabase } from "@/lib/supabaseClient";

export async function deleteChallengeById(challengeId) {
  const { error } = await supabase
    .from("challenges")
    .delete()
    .eq("id", challengeId);

  if (error) throw error;

  return challengeId;
}
