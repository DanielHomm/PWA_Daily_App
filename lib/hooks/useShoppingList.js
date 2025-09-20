"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

export function useShoppingList(listId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch items from Supabase
  const fetchItems = useCallback(async () => {
    if (!listId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("shopping_list_items")
      .select(`
        id,
        quantity,
        marked,
        custom_name,
        custom_unit,
        items (
          id,
          name,
          category:categories(name),
          unit:units(name)
        )
      `)
      .eq("shopping_list_id", listId);

    if (error) console.error("Error fetching items:", error);
    else setItems(data || []);

    setLoading(false);
  }, [listId]);

  // Initial fetch when listId changes
  useEffect(() => {
    if (listId) fetchItems();
  }, [listId, fetchItems]);

  // Add an existing item
  const addItem = async (itemId) => {
    const { error } = await supabase.from("shopping_list_items").insert([
      { shopping_list_id: listId, item_id: itemId, quantity: 1 },
    ]);

    if (error) console.error("Error adding item:", error);
    else fetchItems();
  };

  // Add a custom item
  const addCustomItem = async (name) => {
    const { error } = await supabase.from("shopping_list_items").insert([
      {
        shopping_list_id: listId,
        item_id: null,
        custom_name: name,
        custom_unit: "pcs",
        quantity: 1,
      },
    ]);

    if (error) console.error("Error adding custom item:", error);
    else fetchItems();
  };

  // Update item quantity
  const updateQuantity = async (itemId, value) => {
    let qty = parseInt(value, 10);
    if (!qty || qty < 1) qty = 1;

    const { error } = await supabase
      .from("shopping_list_items")
      .update({ quantity: qty })
      .eq("id", itemId);

    if (error) console.error("Error updating quantity:", error);
    else fetchItems();
  };

  // Toggle marked/unmarked
  const toggleMarked = async (itemId, current) => {
    const { error } = await supabase
      .from("shopping_list_items")
      .update({ marked: !current })
      .eq("id", itemId);

    if (error) console.error("Error toggling marked:", error);
    else fetchItems();
  };

  // Delete an item
  const deleteItem = async (itemId) => {
    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .eq("id", itemId);

    if (error) console.error("Error deleting item:", error);
    else fetchItems();
  };

  return {
    items,
    loading,
    fetchItems,
    addItem,
    addCustomItem,
    updateQuantity,
    toggleMarked,
    deleteItem,
  };
}
