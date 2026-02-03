import { supabase } from "@/lib/supabaseClient";

export async function fetchMealPlans(householdId, startDate, endDate) {
    const { data, error } = await supabase
        .from("meal_plans")
        .select(`
      *,
      recipe:recipes (id, name, default_servings)
    `)
        .eq("household_id", householdId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function createMealPlan(planData) {
    const { data, error } = await supabase
        .from("meal_plans")
        .insert(planData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteMealPlan(id) {
    return supabase.from("meal_plans").delete().eq("id", id);
}
