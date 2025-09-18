"use client";

import SwipeableListItem from "./SwipeableListItem";

export default function ShoppingListUnmarked({ 
  categoryName, 
  items, 
  toggleMarked, 
  updateQuantity, 
  deleteItem 
}) {
  return (
    <div>
      <h2 className="font-bold text-lg mb-2">{categoryName}</h2>
      <ul className="space-y-2">
        {items.map((it) => (
          <SwipeableListItem
            key={it.id}
            onDelete={() => deleteItem(it.id)}
          >
            <li
              className="flex justify-between items-center p-3 border rounded cursor-pointer hover:bg-slate-50"
              onClick={(e) => {
                if (e.target.tagName.toLowerCase() !== "input") {
                  toggleMarked(it.id, it.marked);
                }
              }}
            >
              <span className="text-gray-900">
                {it.items?.name || it.custom_name}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={it.quantity ?? ""}
                  onChange={(e) => updateQuantity(it.id, e.target.value)}
                  className="w-16 border rounded px-2 py-1 text-gray-900"
                />
                <span className="text-sm text-gray-900">
                  {it.items?.unit?.name || it.custom_unit}
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
