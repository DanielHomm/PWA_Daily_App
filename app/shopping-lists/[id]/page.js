"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function ShoppingListDetailPage() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (id) fetchItems();
  }, [id]);

  async function fetchItems() {
    const { data, error } = await supabase
      .from("shopping_list_items")
      .select(`
        id,
        quantity,
        marked,
        items (
          id,
          name,
          category:categories(name),
          unit:units(name)
        )
      `)
      .eq("shopping_list_id", id);

    if (error) console.error(error);
    else setItems(data || []);
  }

  // search all items
  async function handleSearch(e) {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from("items")
      .select("id, name")
      .ilike("name", `%${value}%`)
      .limit(10);

    if (error) {
      console.error(error);
      return;
    }

    // filter already-added items
    const addedIds = items.map((i) => i.items.id);
    const results = data.map((item) => ({
      ...item,
      alreadyAdded: addedIds.includes(item.id),
    }));

    setSearchResults(results);
  }

  async function addItem(itemId) {
    const { error } = await supabase.from("shopping_list_items").insert([
      { shopping_list_id: id, item_id: itemId, quantity: 1 },
    ]);
    if (error) console.error(error);
    else {
      setSearch("");
      setSearchResults([]);
      fetchItems();
    }
  }

  async function updateQuantity(itemId, value) {
    let qty = parseInt(value, 10);
    if (!qty || qty < 1) qty = 1;

    const { error } = await supabase
      .from("shopping_list_items")
      .update({ quantity: qty })
      .eq("id", itemId);

    if (error) console.error(error);
    else fetchItems();
  }

  async function toggleMarked(itemId, current) {
    const { error } = await supabase
      .from("shopping_list_items")
      .update({ marked: !current })
      .eq("id", itemId);

    if (error) console.error(error);
    else fetchItems();
  }

  // Sort items: unmarked grouped by category, marked separately at bottom
  function groupItems() {
    const unmarked = items.filter((i) => !i.marked);
    const marked = items.filter((i) => i.marked);

    // group unmarked by category
    const categories = {};
    unmarked.forEach((i) => {
      const cat = i.items.category?.name || "Uncategorized";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(i);
    });

    // sort inside categories
    Object.keys(categories).forEach((cat) => {
      categories[cat].sort((a, b) =>
        a.items.name.localeCompare(b.items.name)
      );
    });

    // sort marked alphabetically
    marked.sort((a, b) => a.items.name.localeCompare(b.items.name));

    return { categories, marked };
  }

  const { categories, marked } = groupItems();

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shopping List</h1>

      {/* Search / add input */}
      <div className="relative mb-6">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search items to add..."
          className="w-full border rounded px-3 py-2"
        />
        {searchResults.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow">
            {searchResults.map((res) => (
              <li
                key={res.id}
                className={`px-3 py-2 cursor-pointer ${
                  res.alreadyAdded
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-black font-semibold hover:bg-slate-100"
                }`}
                onClick={() => {
                  if (!res.alreadyAdded) addItem(res.id);
                }}
              >
                {res.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Items list */}
      <div className="space-y-6">
        {/* Unmarked items by category */}
        {Object.entries(categories).map(([cat, items]) => (
          <div key={cat}>
            <h2 className="font-bold text-lg mb-2">{cat}</h2>
            <ul className="space-y-2">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="flex justify-between items-center p-3 border rounded cursor-pointer hover:bg-slate-50"
                  onClick={(e) => {
                    // don’t trigger toggle when clicking inside input
                    if (e.target.tagName.toLowerCase() !== "input") {
                      toggleMarked(it.id, it.marked);
                    }
                  }}
                >
                  <span>{it.items.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={it.quantity ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updated = items.map((i) =>
                          i.id === it.id ? { ...i, quantity: val } : i
                        );
                        setItems((prev) =>
                          prev.map((i) =>
                            i.id === it.id ? { ...i, quantity: val } : i
                          )
                        );
                      }}
                      onBlur={(e) => updateQuantity(it.id, e.target.value)}
                      className="w-16 border rounded px-2 py-1"
                    />
                    <span className="text-sm text-gray-600">
                      {it.items.unit?.name}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Marked items */}
        {marked.length > 0 && (
          <div>
            <h2 className="font-bold text-lg mb-2">Done</h2>
            <ul className="space-y-2">
              {marked.map((it) => (
                <li
                  key={it.id}
                  className="flex justify-between items-center p-3 border rounded line-through text-gray-500 cursor-pointer hover:bg-slate-50"
                  onClick={() => toggleMarked(it.id, it.marked)}
                >
                  <span>{it.items.name}</span>
                  <span className="text-sm">
                    {it.quantity} {it.items.unit?.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
