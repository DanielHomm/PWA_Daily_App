import { supabase } from "@/lib/supabaseClient";

export async function fetchChallengesList(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("challenge_members")
    .select(`
      role,
      challenges (
        id,
        name,
        description,
        created_at
      )
    `)
    .eq("user_id", userId)
    .order("created_at", {
      foreignTable: "challenges",
      ascending: false,
    });

  if (error) throw error;

  return data.map((row) => {
    // Safety: joined relations can sometimes return array if one-to-many is inferred
    const challengeData = Array.isArray(row.challenges)
      ? row.challenges[0]
      : row.challenges;

    return {
      ...challengeData,
      userRole: row.role,
    };
  });
}
