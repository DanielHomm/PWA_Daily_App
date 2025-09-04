// lib/localDB.js
import Dexie from "dexie";
import { supabase } from "./supabaseClient"; // ✅ import supabase

export const db = new Dexie("shoppingApp");
db.version(2).stores({
  items: "id, name, category_id, unit_id", 
  shopping_lists: "id, name, owner, created_at",
});

export async function syncItemsFromSupabase() {
  if (!navigator.onLine) return; // skip if offline
  const { data, error } = await supabase
    .from("items")
    .select("id, name, category_id, unit_id");

  if (error) {
    console.error("Error fetching items from Supabase:", error);
    return;
  }

  if (data?.length) {
    await db.items.clear(); // optional: replace old cache
    await db.items.bulkAdd(data);
  }
}

export async function syncShoppingListsFromSupabase(userId) {
  if (!navigator.onLine || !userId) return;

  const { data, error } = await supabase
    .from("shopping_lists")
    .select("id, name, owner, created_at")
    .eq("owner", userId);

  if (!error && data?.length) {
    //await db.shopping_lists.clear();
    await db.shopping_lists.bulkPut(data);
  }
}

// Fetch shopping lists (offline or online)
export async function getShoppingLists(userId) {
  if (navigator.onLine) {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("id, name, owner, created_at")
      .eq("owner", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      //await db.shopping_lists.clear();
      await db.shopping_lists.bulkPut(data);
      return data;
    }
  }

  // fallback: get from IndexedDB
  return await db.shopping_lists.orderBy("created_at").reverse().toArray();
}