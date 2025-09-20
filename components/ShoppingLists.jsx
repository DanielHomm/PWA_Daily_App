"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import { getShoppingLists } from "../lib/shopping-list/getShoppingList";

export default function ShoppingLists({ refreshFlag }) {
  const [lists, setLists] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchLists();
  }, [refreshFlag, user]);

  async function fetchLists() {
    const data = await getShoppingLists(user.id);
    setLists(data);
  }

  async function deleteList(id) {
    const { error } = await supabase
      .from("shopping_lists")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting list:", error);
      return;
    }
    fetchLists(); // refresh after delete
  }

  return (
    <ul className="space-y-2">
      {lists.map((list) => (
        <li
          key={list.id}
          className="flex justify-between items-center p-3 rounded-lg shadow border"
        >
          <a
            href={`/shopping-lists/${list.id}`}
            className="text-blue-600 hover:underline"
          >
            {list.name}
          </a>
          <button
            onClick={() => deleteList(list.id)}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
