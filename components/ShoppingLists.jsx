"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ShoppingLists({ refreshFlag }) {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    fetchLists();
  }, [refreshFlag]);

  async function fetchLists() {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("id, name")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setLists(data || []);
  }

  async function deleteList(id) {
    const { error } = await supabase.from("shopping_lists").delete().eq("id", id);
    if (error) console.error(error);
    else fetchLists();
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
