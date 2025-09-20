import { supabase } from "../supabaseClient";

// Fetch shopping lists (online only)
export async function getShoppingLists(userId) {
  const { data, error } = await supabase
    .from("shopping_lists")
    .select("id, name, owner, created_at")
    .eq("owner", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching shopping lists:", error);
    return [];
  }

  return data || [];
}
