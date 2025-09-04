"use client";

import { useEffect, useState } from "react";
import { getShoppingLists } from "../lib/localDB";
import { useAuth } from "../lib/AuthContext";

export default function ShoppingLists({ refreshFlag }) {
  const [lists, setLists] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchLists();
  }, [refreshFlag, user]);

  async function fetchLists() {
    const data = await getShoppingLists(user.id);
    setLists(data || []);
  }

  async function deleteList(id) {
    // delete online
    if (navigator.onLine) {
      const { error } = await supabase.from("shopping_lists").delete().eq("id", id);
      if (error) {
        console.error(error);
        return;
      }
      await fetchLists();
    } else {
      // mark as deleted offline (optional: sync later)
      await db.shopping_lists.delete(id);
      setLists(await db.shopping_lists.toArray());
    }
  }

  return (
    <ul className="space-y-2">
      {lists.map((list) => (
        <li
          key={list.id}
          className="flex justify-between items-center p-3 rounded-lg shadow border"
        >
          <a href={`/shopping-lists/${list.id}`} className="text-blue-600 hover:underline">
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
