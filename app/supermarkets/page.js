"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function SupermarketsPage() {
  const [supermarkets, setSupermarkets] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchSupermarkets();
  }, []);

  async function fetchSupermarkets() {
    const { data, error } = await supabase
      .from("supermarkets")
      .select("id, name")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching supermarkets:", error);
    } else {
      setSupermarkets(data || []);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;

    const { error } = await supabase
      .from("supermarkets")
      .insert([{ name }]);

    if (error) {
      console.error("Error adding supermarket:", error);
    } else {
      setName("");
      fetchSupermarkets();
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase
      .from("supermarkets")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting supermarket:", error);
    } else {
      fetchSupermarkets();
    }
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supermarkets</h1>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New supermarket"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      {/* List of supermarkets */}
      <ul className="space-y-2">
        {supermarkets.map((sm) => (
          <li
            key={sm.id}
            className="flex justify-between items-center p-3 rounded border shadow"
          >
            <Link
              href={`/supermarkets/${sm.id}`}
              className="text-blue-600 hover:underline"
            >
              {sm.name}
            </Link>
            <button
              onClick={() => handleDelete(sm.id)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
