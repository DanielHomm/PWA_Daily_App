"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import ShareModal from "../../../components/ShareModal";
import { useShoppingList } from "../../../lib/hooks/useShoppingList";

import ShoppingListHeader from "../../../components/shopping_list/ShoppingListHeader";
import ShoppingListSearch from "../../../components/shopping_list/ShoppingListSearch";
import ShoppingListItems from "../../../components/shopping_list/ShoppingListItems";
import ShoppingListMarked from "../../../components/shopping_list/ShoppingListMarked";

export default function ShoppingListDetailPage() {
  const { id } = useParams();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showShare, setShowShare] = useState(false);

  const {
    items,
    addItem,
    updateQuantity,
    toggleMarked,
    deleteItem,
  } = useShoppingList(id);

  // Search items
  async function handleSearch(e) {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    let data = [];
    let error = null;

    if (navigator.onLine) {
      // Try Supabase first
      const { data: supaData, error: supaError } = await supabase
        .from("items")
        .select("id, name")
        .ilike("name", `%${value}%`)
        .limit(10);

      data = supaData || [];
      error = supaError;
    }

    if (!navigator.onLine || error) {
      console.warn("Falling back to local Dexie search...");

      try {
        // Dexie full-text "like" filter (case-insensitive)
        data = await db.items
          .filter((item) =>
            item.name.toLowerCase().includes(value.toLowerCase())
          )
          .limit(10)
          .toArray();
      } catch (dexieErr) {
        console.error("Dexie search failed:", dexieErr);
      }
    }

    if (!data.length) {
      setSearchResults([]);
      return;
    }

    const addedIds = items.map((i) => i.items.id);
    const results = data.map((item) => ({
      ...item,
      alreadyAdded: addedIds.includes(item.id),
    }));

    setSearchResults(results);
  }

  // Sort + group items
  function groupItems() {
    const unmarked = items.filter((i) => !i.marked);
    const marked = items.filter((i) => i.marked);

    const categories = {};
    unmarked.forEach((i) => {
      const cat = i.items.category?.name || "Uncategorized";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(i);
    });

    Object.keys(categories).forEach((cat) => {
      categories[cat].sort((a, b) =>
        a.items.name.localeCompare(b.items.name)
      );
    });

    marked.sort((a, b) => a.items.name.localeCompare(b.items.name));

    return { categories, marked };
  }

  const { categories, marked } = groupItems();

  return (
    <main className="max-w-xl mx-auto p-4">
      {/* Header */}
      <ShoppingListHeader onShare={() => setShowShare(true)} />

      {/* Search */}
      <ShoppingListSearch
        search={search}
        searchResults={searchResults}
        onSearch={handleSearch}
        onAdd={(itemId) => {
          addItem(itemId);
          setSearch("");
          setSearchResults([]);
        }}
      />

      {/* Items */}
      <ShoppingListItems
        categories={categories}
        updateQuantity={updateQuantity}
        toggleMarked={toggleMarked}
        deleteItem={deleteItem}
      />

      {/* Marked items */}
      <ShoppingListMarked
        marked={marked}
        toggleMarked={toggleMarked}
        deleteItem={deleteItem}
      />

      {/* Share Modal */}
      {showShare && (
        <ShareModal listId={id} onClose={() => setShowShare(false)} />
      )}
    </main>
  );
}
