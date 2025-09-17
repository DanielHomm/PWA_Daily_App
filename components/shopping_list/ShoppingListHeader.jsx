"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ShoppingListHeader({
  onShare,
  selectedSupermarket,
  onSupermarketChange,
}) {
  const [supermarkets, setSupermarkets] = useState([]);

  useEffect(() => {
    async function fetchSupermarkets() {
      const { data, error } = await supabase
        .from("supermarkets")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching supermarkets:", error);
      } else {
        setSupermarkets(data || []);
      }
    }

    fetchSupermarkets();
  }, []);

  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">Shopping List</h1>

      <div className="flex items-center gap-2">
        {/* Dropdown */}
        <select
          value={selectedSupermarket || "alphabetic"}
          onChange={(e) => onSupermarketChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="alphabetic">Alphabetic</option>
          {supermarkets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Share button */}
        <button
          onClick={onShare}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Share
        </button>
      </div>
    </div>
  );
}
