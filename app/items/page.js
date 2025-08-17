"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/AuthContext";

export default function ItemsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add form state
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("pieces");
  const [newCategory, setNewCategory] = useState("Fruit");

  // Edit state
  const [editItemId, setEditItemId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const categories = [
    "Fruit",
    "Vegetable",
    "Carbs",
    "Proteins",
    "Ready to Eat",
    "Snack",
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });
    if (!error) setItems(data);
    setLoading(false);
  }

  async function handleAddItem(e) {
    e.preventDefault();
    const { error } = await supabase.from("items").insert([
      { name: newName, default_unit: newUnit, category: newCategory },
    ]);
    if (!error) {
      setNewName("");
      setNewUnit("pieces");
      setNewCategory("Fruit");
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
        default_unit: editUnit,
        category: editCategory,
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

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Items</h1>

      {/* Admin-only Add Item Form */}
      {isAdmin && (
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
            <input
              type="text"
              placeholder="Default unit"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              required
              className="border px-2 py-1 rounded"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Add Item
            </button>
          </div>
        </form>
      )}

      {/* Items grouped by category */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        Object.entries(
          items.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {})
        ).map(([category, items]) => (
          <div key={category} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{category}</h2>
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
                      <input
                        type="text"
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="border px-2 py-1 rounded flex-1"
                        required
                      />
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="border px-2 py-1 rounded flex-1"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditItemId(null)}
                          className="bg-gray-400 text-white px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <span>
                        {item.name} ({item.default_unit})
                      </span>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditItemId(item.id);
                              setEditName(item.name);
                              setEditUnit(item.default_unit);
                              setEditCategory(item.category);
                            }}
                            className="text-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
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
