"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ---------------------
// Sortable Item Component
// ---------------------
function SortableItem({ id, name }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 mb-2 border rounded bg-white shadow cursor-grab hover:bg-slate-50 text-black-600"
    >
      {name}
    </li>
  );
}

// ---------------------
// Main Page
// ---------------------
export default function SupermarketDetailPage() {
  const { id } = useParams(); // supermarket id from URL
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [orderedIds, setOrderedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false); // track unsaved changes

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Load categories and supermarket order if it exists
  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);

      // 1. Check if supermarket already has a saved order
      const { data: orderData, error: orderError } = await supabase
        .from("supermarket_categories")
        .select("category_id, sort_order")
        .eq("supermarket_id", id)
        .order("sort_order", { ascending: true });

      if (orderError) {
        console.error("Error fetching supermarket categories:", orderError);
        setLoading(false);
        return;
      }

      if (orderData && orderData.length > 0) {
        // Custom order exists
        const categoryIds = orderData.map((o) => o.category_id);
        setOrderedIds(categoryIds);

        // Fetch names for these categories
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("id, name")
          .in("id", categoryIds);

        if (catError) {
          console.error("Error fetching categories:", catError);
        } else {
          setCategories(catData);
        }
      } else {
        // No custom order yet → fallback to alphabetical
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("id, name")
          .order("name", { ascending: true });

        if (catError) {
          console.error("Error fetching categories:", catError);
        } else {
          setCategories(catData);
          setOrderedIds(catData.map((c) => c.id));
        }
      }

      setLoading(false);
    }

    if (id) fetchCategories();
  }, [id]);

  // Handle drag end → update local state only
  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setOrderedIds((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setDirty(true); // mark as changed
        return newOrder;
      });
    }
  }

  // Save order to Supabase (only when clicking Save)
async function saveOrder() {
  if (!id) return;

  const mappings = orderedIds.map((catId, idx) => ({
    supermarket_id: id,
    category_id: catId,
    sort_order: idx,
  }));

  const { error } = await supabase
    .from("supermarket_categories")
    .upsert(mappings, {
      onConflict: ["supermarket_id", "category_id"], // update if exists
    });

  if (error) {
    console.error("Error saving supermarket order:", error);
  } else {
    setDirty(false);
    console.log("Supermarket order saved successfully.");
  }
}


  if (loading) return <p>Loading...</p>;

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supermarket Sorting</h1>
      <p className="mb-4 text-black-900">
        Drag and drop categories to define the order for this supermarket.
        Changes are only saved when you click <strong>Save</strong>.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedIds}
          strategy={verticalListSortingStrategy}
        >
          <ul className="text-gray-900">
            {orderedIds.map((id) => {
              const cat = categories.find((c) => c.id === id);
              return <SortableItem key={id} id={id} name={cat?.name} />;
            })}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="flex gap-4 mt-6">
        <button
          onClick={saveOrder}
          disabled={!dirty}
          className={`px-4 py-2 rounded ${
            dirty
              ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Save
        </button>
        <button
          onClick={() => router.push("/supermarkets")}
          className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 text-gray-900 cursor-pointer"
        >
          Exit
        </button>
      </div>
    </main>
  );
}
