import { supabase } from "@/lib/supabaseClient";

// --- Categories ---
export function fetchGroceryCategories() {
    return supabase
        .from("grocery_categories")
        .select("*")
        .order("sort_order", { ascending: true });
}

export async function searchCommonItems(query, language = 'en') {
    if (!query || query.length < 2) return [];

    let dbQuery = supabase
        .from("common_items")
        .select("*")
        .limit(10);

    if (language === 'de') {
        dbQuery = dbQuery.ilike("name_de", `%${query}%`);
    } else {
        dbQuery = dbQuery.ilike("name", `%${query}%`);
    }

    const { data } = await dbQuery;
    return data || [];
}

// --- Products ---
export async function getOrCreateProduct({ householdId, name, categoryId = null, commonItemId = null }) {
    // 1. Check if product exists in this household
    const { data: existing } = await supabase
        .from("household_products")
        .select("id, common_item_id")
        .eq("household_id", householdId)
        .ilike("name", name)
        .maybeSingle();

    if (existing) {
        // Fix: If we now know the Common ID but the product didn't have it, update it!
        if (commonItemId && !existing.common_item_id) {
            await supabase
                .from("household_products")
                .update({ common_item_id: commonItemId })
                .eq("id", existing.id);
            existing.common_item_id = commonItemId;
        }
        return existing;
    }

    // 2. Create if not exists
    const { data: newProduct, error } = await supabase
        .from("household_products")
        .insert({
            household_id: householdId,
            name,
            category_id: categoryId,
            common_item_id: commonItemId || null
        })
        .select()
        .single();

    if (error) throw error;
    return newProduct;
}

// --- Inventory ---
export function fetchInventoryItems(householdId) {
    return supabase
        .from("inventory_items")
        .select(`
      *,
      product:household_products (
        id, name, category_id, common_item_id,
        category:grocery_categories (name, icon)
      )
    `)
        .eq("household_id", householdId);
}

export function addInventoryItem({ householdId, productId, location, quantity, unit, expiryDate }) {
    return supabase
        .from("inventory_items")
        .insert({
            household_id: householdId,
            product_id: productId,
            location,
            quantity,
            unit,
            expiry_date: expiryDate
        });
}

export function updateInventoryItem(itemId, updates) {
    return supabase
        .from("inventory_items")
        .update(updates)
        .eq("id", itemId);
}

export function deleteInventoryItem(itemId) {
    return supabase
        .from("inventory_items")
        .delete()
        .eq("id", itemId);
}
