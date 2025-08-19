"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/AuthContext";

export default function ItemsPage() {
  const { user, profile, loading } = useAuth();

  // Items
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  // Lookups
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);

  // Add Item form
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newType, setNewType] = useState("");

  // Edit Item
  const [editItemId, setEditItemId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editType, setEditType] = useState("");

  // Categories
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // Units
  const [newUnitName, setNewUnitName] = useState("");
  const [editUnitId, setEditUnitId] = useState(null);
  const [editUnitName, setEditUnitName] = useState("");

  // Types
  const [newTypeName, setNewTypeName] = useState("");
  const [editTypeId, setEditTypeId] = useState(null);
  const [editTypeName, setEditTypeName] = useState("");

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    fetchLookups();
    fetchItems();
  }, []);

  async function fetchLookups() {
    const { data: u } = await supabase.from("units").select("*").order("name");
    const { data: c } = await supabase.from("categories").select("*").order("name");
    const { data: t } = await supabase.from("item_types").select("*").order("name");

    setUnits(u || []);
    setCategories(c || []);
    setTypes(t || []);

    if (u?.length) setNewUnit(u[0].id);
    if (c?.length) setNewCategory(c[0].id);
    if (t?.length) setNewType(t[0].id);
  }

  async function fetchItems() {
    setItemsLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select(`
        id, name,
        units ( id, name ),
        categories ( id, name ),
        item_types ( id, name )
      `)
      .order("name", { ascending: true });

    if (!error) setItems(data || []);
    setItemsLoading(false);
  }

  // ---- ITEMS ----
  async function handleAddItem(e) {
    e.preventDefault();
    const { error } = await supabase.from("items").insert([
      { name: newName, unit_id: newUnit, category_id: newCategory, type_id: newType },
    ]);
    if (!error) {
      setNewName("");
      if (units.length) setNewUnit(units[0].id);
      if (categories.length) setNewCategory(categories[0].id);
      if (types.length) setNewType(types[0].id);
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
        type_id: editType,
      })
      .eq("id", editItemId);
    if (!error) {
      setEditItemId(null);
      setEditName("");
      setEditUnit("");
      setEditCategory("");
      setEditType("");
      fetchItems();
    } else {
      console.error(error);
    }
  }

  // ---- CATEGORIES ----
  async function handleAddCategory(e) {
    e.preventDefault();
    const { error } = await supabase.from("categories").insert([{ name: newCategoryName }]);
    if (!error) {
      setNewCategoryName("");
      fetchLookups();
    } else console.error(error);
  }

  async function handleEditCategory(e) {
    e.preventDefault();
    const { error } = await supabase
      .from("categories")
      .update({ name: editCategoryName })
      .eq("id", editCategoryId);
    if (!error) {
      setEditCategoryId(null);
      setEditCategoryName("");
      fetchLookups();
    } else console.error(error);
  }

  async function handleDeleteCategory(id) {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) fetchLookups();
    else console.error(error);
  }

  // ---- UNITS ----
  async function handleAddUnit(e) {
    e.preventDefault();
    const { error } = await supabase.from("units").insert([{ name: newUnitName }]);
    if (!error) {
      setNewUnitName("");
      fetchLookups();
    } else console.error(error);
  }

  async function handleEditUnit(e) {
    e.preventDefault();
    const { error } = await supabase
      .from("units")
      .update({ name: editUnitName })
      .eq("id", editUnitId);
    if (!error) {
      setEditUnitId(null);
      setEditUnitName("");
      fetchLookups();
    } else console.error(error);
  }

  async function handleDeleteUnit(id) {
    if (!confirm("Delete this unit?")) return;
    const { error } = await supabase.from("units").delete().eq("id", id);
    if (!error) fetchLookups();
    else console.error(error);
  }

  // ---- TYPES ----
  async function handleAddType(e) {
    e.preventDefault();
    const { error } = await supabase.from("item_types").insert([{ name: newTypeName }]);
    if (!error) {
      setNewTypeName("");
      fetchLookups();
    } else console.error(error);
  }

  async function handleEditType(e) {
    e.preventDefault();
    const { error } = await supabase
      .from("item_types")
      .update({ name: editTypeName })
      .eq("id", editTypeId);
    if (!error) {
      setEditTypeId(null);
      setEditTypeName("");
      fetchLookups();
    } else console.error(error);
  }

  async function handleDeleteType(id) {
    if (!confirm("Delete this type?")) return;
    const { error } = await supabase.from("item_types").delete().eq("id", id);
    if (!error) fetchLookups();
    else console.error(error);
  }

  // ---- ACCESS ----
  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>You must be logged in to view this page.</p>;
  if (!isAdmin) return <p>Access denied: Admins only.</p>;

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Items</h1>

      {/* ---- Add Item ---- */}
      <form onSubmit={handleAddItem} className="p-4 bg-gray-100 rounded shadow">
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
          <select value={newUnit} onChange={(e) => setNewUnit(e.target.value)} className="border px-2 py-1 rounded">
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="border px-2 py-1 rounded">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={newType} onChange={(e) => setNewType(e.target.value)} className="border px-2 py-1 rounded">
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 cursor-pointer">Add Item</button>
        </div>
      </form>

      {/* ---- Items ---- */}
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
                <li key={item.id} className="flex justify-between items-center bg-white p-2 rounded shadow">
                  {editItemId === item.id ? (
                    <form onSubmit={handleEditItem} className="flex flex-col sm:flex-row gap-2 w-full">
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="border px-2 py-1 rounded flex-1" required />
                      <select value={editUnit} onChange={(e) => setEditUnit(e.target.value)} className="border px-2 py-1 rounded flex-1">
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                      <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="border px-2 py-1 rounded flex-1">
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <select value={editType} onChange={(e) => setEditType(e.target.value)} className="border px-2 py-1 rounded flex-1">
                        {types.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-green-600">Save</button>
                        <button type="button" onClick={() => setEditItemId(null)} className="bg-gray-400 text-white px-2 py-1 rounded cursor-pointer hover:bg-gray-500">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <span>{item.name} ({item.units?.name}) — {item.categories?.name} [{item.item_types?.name}]</span>
                      <div className="flex gap-2">
                        <button onClick={() => {
                          setEditItemId(item.id);
                          setEditName(item.name);
                          setEditUnit(item.units?.id || "");
                          setEditCategory(item.categories?.id || "");
                          setEditType(item.item_types?.id || "");
                        }} className="text-blue-600 cursor-pointer hover:underline">Edit</button>
                        <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 cursor-pointer hover:underline">Delete</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      {/* ---- Manage Categories ---- */}
      <div className="p-4 bg-gray-100 rounded shadow">
        <h2 className="font-semibold mb-2">Manage Categories</h2>
        <form onSubmit={handleAddCategory} className="flex gap-2 mb-2">
          <input type="text" placeholder="New category" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="border px-2 py-1 rounded flex-1" required />
          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 cursor-pointer">Add</button>
        </form>
        <ul className="space-y-1">
          {categories.map((c) => (
            <li key={c.id} className="flex justify-between items-center bg-white p-2 rounded">
              {editCategoryId === c.id ? (
                <form onSubmit={handleEditCategory} className="flex gap-2 w-full">
                  <input type="text" value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} className="border px-2 py-1 rounded flex-1" required />
                  <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 cursor-pointer">Save</button>
                  <button type="button" onClick={() => setEditCategoryId(null)} className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 cursor-pointer">Cancel</button>
                </form>
              ) : (
                <>
                  <span>{c.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditCategoryId(c.id); setEditCategoryName(c.name); }} className="text-blue-600 hover:underline cursor-pointer">Edit</button>
                    <button onClick={() => handleDeleteCategory(c.id)} className="text-red-600 hover:underline cursor-pointer">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* ---- Manage Units ---- */}
      <div className="p-4 bg-gray-100 rounded shadow">
        <h2 className="font-semibold mb-2">Manage Units</h2>
        <form onSubmit={handleAddUnit} className="flex gap-2 mb-2">
          <input type="text" placeholder="New unit" value={newUnitName} onChange={(e) => setNewUnitName(e.target.value)} className="border px-2 py-1 rounded flex-1" required />
          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 cursor-pointer">Add</button>
        </form>
        <ul className="space-y-1">
          {units.map((u) => (
            <li key={u.id} className="flex justify-between items-center bg-white p-2 rounded">
              {editUnitId === u.id ? (
                <form onSubmit={handleEditUnit} className="flex gap-2 w-full">
                  <input type="text" value={editUnitName} onChange={(e) => setEditUnitName(e.target.value)} className="border px-2 py-1 rounded flex-1" required />
                  <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 cursor-pointer">Save</button>
                  <button type="button" onClick={() => setEditUnitId(null)} className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 cursor-pointer">Cancel</button>
                </form>
              ) : (
                <>
                  <span>{u.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditUnitId(u.id); setEditUnitName(u.name); }} className="text-blue-600 hover:underline cursor-pointer">Edit</button>
                    <button onClick={() => handleDeleteUnit(u.id)} className="text-red-600 hover:underline cursor-pointer">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* ---- Manage Types ---- */}
      <div className="p-4 bg-gray-100 rounded shadow">
        <h2 className="font-semibold mb-2">Manage Types</h2>
        <form onSubmit={handleAddType} className="flex gap-2 mb-2">
          <input type="text" placeholder="New type" value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} className="border px-2 py-1 rounded flex-1" required />
          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 cursor-pointer">Add</button>
        </form>
        <ul className="space-y-1">
          {types.map((t) => (
            <li key={t.id} className="flex justify-between items-center bg-white p-2 rounded">
              {editTypeId === t.id ? (
                <form onSubmit={handleEditType} className="flex gap-2 w-full">
                  <input type="text" value={editTypeName} onChange={(e) => setEditTypeName(e.target.value)} className="border px-2 py-1 rounded flex-1" required />
                  <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 cursor-pointer">Save</button>
                  <button type="button" onClick={() => setEditTypeId(null)} className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 cursor-pointer">Cancel</button>
                </form>
              ) : (
                <>
                  <span>{t.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditTypeId(t.id); setEditTypeName(t.name); }} className="text-blue-600 hover:underline cursor-pointer">Edit</button>
                    <button onClick={() => handleDeleteType(t.id)} className="text-red-600 hover:underline cursor-pointer">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
