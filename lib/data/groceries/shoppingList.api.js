import { supabase } from "@/lib/supabaseClient";
import { getOrCreateProduct } from "./groceries.api";

// --- Shopping List ---

export function fetchShoppingList(householdId) {
    return supabase
        .from("shopping_list_items")
        .select(`
      *,
      product:household_products (
        id, name, category_id,
        category:grocery_categories (name, icon, sort_order)
      )
    `)
        .eq("household_id", householdId);
}

export async function addShoppingListItem({ householdId, name, categoryId, quantity, unit }) {
    // 1. Get/Create Product
    const product = await getOrCreateProduct({ householdId, name, categoryId });

    // 2. Add to List
    return supabase
        .from("shopping_list_items")
        .insert({
            household_id: householdId,
            product_id: product.id,
            quantity,
            unit,
            is_checked: false
        });
}

export function toggleShoppingItem(itemId, isChecked) {
    return supabase
        .from("shopping_list_items")
        .update({ is_checked: isChecked })
        .eq("id", itemId);
}

export function deleteShoppingItem(itemId) {
    return supabase
        .from("shopping_list_items")
        .delete()
        .eq("id", itemId);
}

// --- Smart Actions ---
export async function moveItemToInventory(itemId, location = 'fridge') {
    // 1. Get the item details
    const { data: item } = await supabase
        .from("shopping_list_items")
        .select("*")
        .eq("id", itemId)
        .single();

    if (!item) throw new Error("Item not found");

    // 2. Add to Inventory
    const { error: invError } = await supabase
        .from("inventory_items")
        .insert({
            household_id: item.household_id,
            product_id: item.product_id,
            location,
            quantity: item.quantity,
            unit: item.unit
        });

    if (invError) throw invError;

    // 3. Remove from Shopping List
    return deleteShoppingItem(itemId);
}
