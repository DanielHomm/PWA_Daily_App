"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function ShoppingListDetailPage() {
  const params = useParams();
  const listId = params.id;

  const [listName, setListName] = useState("");
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (listId) {
      fetchList();
      fetchItems();
    }
  }, [listId]);

  async function fetchList() {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("name")
      .eq("id", listId)
      .single();

    if (!error && data) {
      setListName(data.name);
    }
  }

  async function fetchItems() {
    const { data, error } = await supabase
      .from("shopping_list_items")
      .select(`
        id,
        quantity,
        items (
          id,
          name,
          units ( id, name )
        )
      `)
      .eq("shopping_list_id", listId);

    if (!error) setItems(data || []);
  }

  async function searchItems(term) {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from("items")
      .select("id, name")
      .ilike("name", `%${term}%`)
      .limit(10);

    if (!error) setSearchResults(data || []);
  }

  async function addItem(itemId) {
    if (!itemId) return;

    const { error } = await supabase.from("shopping_list_items").insert([
      {
        shopping_list_id: listId,
        item_id: itemId,
        quantity: 1, // always start with 1
      },
    ]);

    if (error) {
      console.error("Error adding item:", error.message);
    } else {
      setSearchTerm("");
      setSearchResults([]);
      fetchItems();
    }
  }

  async function updateQuantity(id, newQty) {
    const { error } = await supabase
      .from("shopping_list_items")
      .update({ quantity: newQty })
      .eq("id", id);

    if (error) {
      console.error("Error updating quantity:", error.message);
    } else {
      fetchItems();
    }
  }

  async function removeItem(id) {
    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting item:", error.message);
    } else {
      fetchItems();
    }
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{listName}</h1>

      {/* Add item with autocomplete */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            searchItems(e.target.value);
          }}
          className="w-full border rounded px-3 py-2"
        />

        {searchResults.length > 0 && (
          <ul className="border rounded bg-white mt-1 max-h-40 overflow-y-auto">
            {searchResults.map((result) => (
              <li
                key={result.id}
                onClick={() => addItem(result.id)}
                className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
              >
                {result.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Items in list */}
      <ul className="space-y-2">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex justify-between items-center p-3 border rounded"
          >
            <span className="flex items-center gap-2">
              <span>{it.items?.name || "Unknown item"}</span>
              <input
                type="number"
                min="1"
                value={it.quantity ?? ""}
                onChange={(e) => {
                  // allow temporary empty string while typing
                  const val = e.target.value;
                  const updated = items.map((i) =>
                    i.id === it.id ? { ...i, quantity: val } : i
                  );
                  setItems(updated);
                }}
                onBlur={async (e) => {
                  let val = parseInt(e.target.value, 10);
                  if (!val || val < 1) val = 1; // default back to 1 if empty or invalid

                  const { error } = await supabase
                    .from("shopping_list_items")
                    .update({ quantity: val })
                    .eq("id", it.id);

                  if (error) console.error("Error updating quantity:", error.message);
                  else fetchItems();
                }}
                className="w-16 border rounded px-2 py-1"
              />

              <span className="text-sm text-gray-600">
                {it.items?.units?.name || ""}
              </span>
            </span>
            <button
              onClick={() => removeItem(it.id)}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
