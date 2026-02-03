import { supabase } from "@/lib/supabaseClient";

// --- Recipes ---

export function fetchRecipes(householdId) {
    return supabase
        .from("recipes")
        .select("*, ingredients:recipe_ingredients(count)")
        .eq("household_id", householdId)
        .order("created_at", { ascending: false });
}

export function fetchRecipe(id) {
    return supabase
        .from("recipes")
        .select(`
      *,
      ingredients:recipe_ingredients (
        *,
        common_item:common_items (name, name_de, category_name, default_unit, icon)
      )
    `)
        .eq("id", id)
        .single();
}

export async function createRecipe(recipeData) {
    const { data, error } = await supabase
        .from("recipes")
        .insert(recipeData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateRecipe(id, updates) {
    const { data, error } = await supabase
        .from("recipes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteRecipe(id) {
    return supabase.from("recipes").delete().eq("id", id);
}

// --- Ingredients ---

export async function addRecipeIngredient(ingredientData) {
    // ingredientData: { recipe_id, common_item_id, name, quantity, unit }
    const { data, error } = await supabase
        .from("recipe_ingredients")
        .insert(ingredientData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteRecipeIngredient(id) {
    return supabase.from("recipe_ingredients").delete().eq("id", id);
}
