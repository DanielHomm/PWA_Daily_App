"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/AuthContext";

export default function ItemsPage() {
  const { user, profile, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);

  // Add form state
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // Edit state
  const [editItemId, setEditItemId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    fetchLookups();
    fetchItems();
  }, []);

  async function fetchLookups() {
    const { data: u } = await supabase.from("units").select("*").order("name");
    const { data: c } = await supabase.from("categories").select("*").order("name");
    setUnits(u || []);
    setCategories(c || []);
    if (u?.length) setNewUnit(u[0].id);
    if (c?.length) setNewCategory(c[0].id);
  }

  async function fetchItems() {
    setItemsLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select(`
        id, name,
        units ( id, name ),
        categories ( id, name )
      `)
      .order("name", { ascending: true });

    if (!error) setItems(data || []);
    setItemsLoading(false);
  }

  async function handleAddItem(e) {
    e.preventDefault();
    const { error } = await supabase.from("items").insert([
      { name: newName, unit_id: newUnit, category_id: newCategory },
    ]);
    if (!error) {
      setNewName("");
      if (units.length) setNewUnit(units[0].id);
      if (categories.length) setNewCategory(categories[0].id);
      fetchItems();
    } else {
      console.error(error);
    }
  }

  async function handleDeleteItem(id) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (!error) fetchItems();
    else console.error(error);
  }

  async function handleEditItem(e) {
    e.preventDefault();
    const { error } = await supabase
      .from("items")
      .update({
        name: editName,
        unit_id: editUnit,
        category_id: editCategory,
      })
      .eq("id", editItemId);
    if (!error) {
      setEditItemId(null);
      setEditName("");
      setEditUnit("");
      setEditCategory("");
      fetchItems();
    } else {
      console.error(error);
    }
  }

  // Access restrictions
  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>You must be logged in to view this page.</p>;
  if (!isAdmin) return <p>Access denied: Admins only.</p>;

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Items</h1>

      {/* Admin-only Add Item Form */}
      <form
        onSubmit={handleAddItem}
        className="mb-6 p-4 bg-gray-100 rounded shadow"
      >
        <h2 className="font-semibold mb-2">Add New Item</h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Item name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            className="border px-2 py-1 rounded"
          />

          <select
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 cursor-pointer"
          >
            Add Item
          </button>
        </div>
      </form>

      {/* Items grouped by category */}
      {itemsLoading ? (
        <p>Loading items...</p>
      ) : (
        Object.entries(
          items.reduce((acc, item) => {
            const categoryName = item.categories?.name || "Uncategorized";
            if (!acc[categoryName]) acc[categoryName] = [];
            acc[categoryName].push(item);
            return acc;
          }, {})
        ).map(([categoryName, items]) => (
          <div key={categoryName} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{categoryName}</h2>
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center bg-white p-2 rounded shadow"
                >
                  {editItemId === item.id ? (
                    <form
                      onSubmit={handleEditItem}
                      className="flex flex-col sm:flex-row gap-2 w-full"
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border px-2 py-1 rounded flex-1"
                        required
                      />

                      <select
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="border px-2 py-1 rounded flex-1"
                      >
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="border px-2 py-1 rounded flex-1"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-green-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditItemId(null)}
                          className="bg-gray-400 text-white px-2 py-1 rounded cursor-pointer hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <span>
                        {item.name} ({item.units?.name}) —{" "}
                        {item.categories?.name}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditItemId(item.id);
                            setEditName(item.name);
                            setEditUnit(item.units?.id || "");
                            setEditCategory(item.categories?.id || "");
                          }}
                          className="text-blue-600 cursor-pointer hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 cursor-pointer hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </main>
  );
}
