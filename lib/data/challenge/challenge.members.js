import { supabase } from "@/lib/supabaseClient";

/**
 * Updates a member's role in a challenge.
 */
export async function updateMemberRole(challengeId, userId, newRole) {
    const { data, error } = await supabase
        .from("challenge_members")
        .update({ role: newRole })
        .eq("challenge_id", challengeId)
        .eq("user_id", userId)
        .select();

    if (error) throw error;
    return data;
}

/**
 * Transfers ownership from one user to another.
 * 1. Sets new owner to 'owner'.
 * 2. Sets old owner to 'member'.
 * Note: Check RLS policies if this fails (Owners should be able to update challenge_members).
 */
export async function transferOwnership(challengeId, currentOwnerId, newOwnerId) {
    // We try to do this "atomically" as possible from client. 
    // Ideally, use a Database RPC.

    // 1. Promote new owner
    const { error: promoteError } = await supabase
        .from("challenge_members")
        .update({ role: "owner" })
        .eq("challenge_id", challengeId)
        .eq("user_id", newOwnerId);

    if (promoteError) throw promoteError;

    // 2. Demote self
    const { error: demoteError } = await supabase
        .from("challenge_members")
        .update({ role: "member" })
        .eq("challenge_id", challengeId)
        .eq("user_id", currentOwnerId);

    if (demoteError) {
        // Critical failure state: We have two owners now. 
        // In a real app we'd rollback or alert. 
        // For now throwing error.
        console.error("Failed to demote old owner", demoteError);
        throw demoteError;
    }

    return true;
}

export async function leaveChallenge(challengeId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("challenge_members")
        .delete()
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id);

    if (error) throw error;
    return true;
}
