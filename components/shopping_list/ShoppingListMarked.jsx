"use client";

import SwipeableListItem from "./SwipeableListItem";

export default function ShoppingListMarked({ marked, toggleMarked, deleteItem }) {
  if (marked.length === 0) return null;

  return (
    <div>
      <h2 className="font-bold text-lg mb-2">Done</h2>
      <ul className="space-y-2">
        {marked.map((it) => (
          <SwipeableListItem key={it.id} onDelete={() => deleteItem(it.id)}>
            <li
              className="flex justify-between items-center p-3 border rounded line-through text-gray-500 cursor-pointer hover:bg-slate-50"
              onClick={() => toggleMarked(it.id, it.marked)}
            >
              <span>{it.items.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-text-muted sm">
                  {it.quantity} {it.items.unit?.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(it.id);
                  }}
                  className="text-red-600 hover:text-red-800 ml-2"
                >
                  ✕
                </button>
              </div>
            </li>
          </SwipeableListItem>
        ))}
      </ul>
    </div>
  );
}
