// lib/localDB.js
import Dexie from "dexie";
import { supabase } from "./supabaseClient"; // ✅ import supabase

export const db = new Dexie("shoppingApp");
db.version(1).stores({
  items: "id, name, category_id, unit_id",
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
