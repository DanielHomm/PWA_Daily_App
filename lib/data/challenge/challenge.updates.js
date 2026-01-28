import { supabase } from "@/lib/supabaseClient";

export async function updateChallenge(challengeId, updates) {
    const { data, error } = await supabase
        .from("challenges")
        .update(updates)
        .eq("id", challengeId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function upsertSubChallenges(subChallenges) {
    const { data, error } = await supabase
        .from("sub_challenges")
        .upsert(subChallenges, { onConflict: "id" })
        .select();

    if (error) throw error;
    return data;
}

export async function deleteSubChallenge(subChallengeId) {
    const { error } = await supabase
        .from("sub_challenges")
        .delete()
        .eq("id", subChallengeId);

    if (error) throw error;
    return true;
}
