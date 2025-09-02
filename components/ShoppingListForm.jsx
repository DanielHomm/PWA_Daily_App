"use client";

import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function ShoppingListForm({ onListAdded }) {
  const [name, setName] = useState("");
  const { user } = useAuth();
  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    const { error } = await supabase.from("shopping_lists").insert([{name: name, owner: user.id }]);
    if (error) {
      console.error(error);
    } else {
      setName("");
      onListAdded();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        value={name}
        placeholder="New shopping list"
        onChange={(e) => setName(e.target.value)}
        className="flex-1 border rounded px-3 py-2"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Create
      </button>
    </form>
  );
}
