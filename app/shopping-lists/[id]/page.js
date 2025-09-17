"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import ShareModal from "../../../components/ShareModal";
import { useShoppingList } from "../../../lib/hooks/useShoppingList";
import SwipeableListItem from "../../../components/shopping_list/SwipeableListItem";
import ShoppingListSearch from "../../../components/shopping_list/ShoppingListSearch";
import ShoppingListHeader from "../../../components/shopping_list/ShoppingListHeader";

export default function ShoppingListDetailPage() {
  const { id } = useParams();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showShare, setShowShare] = useState(false);
  const [selectedSupermarket, setSelectedSupermarket] = useState("alphabetic");
  const [supermarketOrder, setSupermarketOrder] = useState([]);

  const {
    items,
    addItem,
    addCustomItem,
    updateQuantity,
    toggleMarked,
    deleteItem,
  } = useShoppingList(id);

  // Load shopping list info (incl. supermarket_id)
  useEffect(() => {
    async function fetchList() {
      const { data, error } = await supabase
        .from("shopping_lists")
        .select("supermarket_id")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching shopping list:", error);
        return;
      }

      if (data?.supermarket_id) {
        setSelectedSupermarket(data.supermarket_id);
      }
    }

    if (id) fetchList();
  }, [id]);

  // Fetch supermarket order if selected
  useEffect(() => {
    async function fetchOrder() {
      if (
        selectedSupermarket === "alphabetic" ||
        selectedSupermarket === null
      ) {
        setSupermarketOrder([]);
        return;
      }

      const { data, error } = await supabase
        .from("supermarket_categories")
        .select("category_id, sort_order, categories(name)")
        .eq("supermarket_id", selectedSupermarket)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching supermarket order:", error);
        setSupermarketOrder([]);
      } else {
        setSupermarketOrder(data || []);
      }
    }

    fetchOrder();
  }, [selectedSupermarket]);

  // Handle supermarket selection (updates DB)
  async function handleSupermarketChange(newValue) {
    setSelectedSupermarket(newValue);

    const updateValue = newValue === "alphabetic" ? null : newValue;
    const { error } = await supabase
      .from("shopping_lists")
      .update({ supermarket_id: updateValue })
      .eq("id", id);

    if (error) {
      console.error("Error updating shopping list supermarket:", error);
    }
  }

  // search items
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

    const addedIds = items.map((i) => i.items?.id).filter(Boolean);
    const results = data.map((item) => ({
      ...item,
      alreadyAdded: addedIds.includes(item.id),
    }));

    setSearchResults(results);
  }

  // Sorting logic
  function groupItems() {
    const unmarked = items.filter((i) => !i.marked);
    const marked = items.filter((i) => i.marked);

    const categories = {};
    unmarked.forEach((i) => {
      const cat =
        i.items?.category?.name || (i.custom_name ? "Custom" : "Uncategorized");
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(i);
    });

    let sortedCategories = {};

    if (
      selectedSupermarket === "alphabetic" ||
      supermarketOrder.length === 0
    ) {
      // fallback alphabetic
      Object.keys(categories)
        .sort((a, b) => a.localeCompare(b))
        .forEach((cat) => (sortedCategories[cat] = categories[cat]));
    } else {
      // order by supermarket
      supermarketOrder.forEach((o) => {
        const catName = o.categories?.name;
        if (categories[catName]) {
          sortedCategories[catName] = categories[catName];
        }
      });

      // add categories not in order
      Object.keys(categories).forEach((cat) => {
        if (!sortedCategories[cat]) sortedCategories[cat] = categories[cat];
      });

      // move "Custom" last
      if (sortedCategories["Custom"]) {
        const customItems = sortedCategories["Custom"];
        delete sortedCategories["Custom"];
        sortedCategories["Custom"] = customItems;
      }
    }

    // sort items inside each category
    Object.keys(sortedCategories).forEach((cat) => {
      sortedCategories[cat].sort((a, b) =>
        (a.items?.name || a.custom_name).localeCompare(
          b.items?.name || b.custom_name
        )
      );
    });

    marked.sort((a, b) =>
      (a.items?.name || a.custom_name).localeCompare(
        b.items?.name || b.custom_name
      )
    );

    return { categories: sortedCategories, marked };
  }

  const { categories, marked } = groupItems();

  return (
    <main className="max-w-xl mx-auto p-4">
      {/* Header */}
      <ShoppingListHeader
        onShare={() => setShowShare(true)}
        selectedSupermarket={selectedSupermarket}
        onSupermarketChange={handleSupermarketChange}
      />

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
        onAddCustom={(name) => {
          addCustomItem(name);
          setSearch("");
          setSearchResults([]);
        }}
      />

      {/* Items */}
      <div className="space-y-6">
        {Object.entries(categories).map(([cat, items]) => (
          <div key={cat}>
            <h2 className="font-bold text-lg mb-2">{cat}</h2>
            <ul className="space-y-2">
              {items.map((it) => (
                <SwipeableListItem
                  key={it.id}
                  onDelete={() => deleteItem(it.id)}
                >
                  <li
                    className="flex justify-between items-center p-3 border rounded cursor-pointer hover:bg-slate-50"
                    onClick={(e) => {
                      if (e.target.tagName.toLowerCase() !== "input") {
                        toggleMarked(it.id, it.marked);
                      }
                    }}
                  >
                    <span className="text-blue-600">{it.items?.name || it.custom_name}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={it.quantity ?? ""}
                        onChange={(e) => updateQuantity(it.id, e.target.value)}
                        className="w-16 border rounded px-2 py-1 text-black-600"
                      />
                      <span className="text-sm text-black-600">
                        {it.items?.unit?.name || it.custom_unit}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(it.id);
                        }}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                </SwipeableListItem>
              ))}
            </ul>
          </div>
        ))}

        {marked.length > 0 && (
          <div>
            <h2 className="font-bold text-lg mb-2">Done</h2>
            <ul className="space-y-2">
              {marked.map((it) => (
                <SwipeableListItem
                  key={it.id}
                  onDelete={() => deleteItem(it.id)}
                >
                  <li
                    className="flex justify-between items-center p-3 border rounded line-through text-gray-500 cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleMarked(it.id, it.marked)}
                  >
                    <span>{it.items?.name || it.custom_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {it.quantity}{" "}
                        {it.items?.unit?.name || it.custom_unit}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(it.id);
                        }}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                </SwipeableListItem>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showShare && (
        <ShareModal listId={id} onClose={() => setShowShare(false)} />
      )}
    </main>
  );
}
