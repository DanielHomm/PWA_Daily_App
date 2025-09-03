"use client";

import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export function useShoppingList(listId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (listId) fetchItems();
  }, [listId]);

  async function fetchItems() {
    setLoading(true);
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
      .eq("shopping_list_id", listId);

    if (error) console.error(error);
    else setItems(data || []);
    setLoading(false);
  }

  async function addItem(itemId) {
    const { error } = await supabase.from("shopping_list_items").insert([
      { shopping_list_id: listId, item_id: itemId, quantity: 1 },
    ]);
    if (error) console.error(error);
    else fetchItems();
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

  async function deleteItem(itemId) {
    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .eq("id", itemId);

    if (error) console.error(error);
    else fetchItems();
  }

  return {
    items,
    loading,
    fetchItems,
    addItem,
    updateQuantity,
    toggleMarked,
    deleteItem,
  };
}
