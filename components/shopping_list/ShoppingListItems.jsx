"use client";

import SwipeableListItem from "./SwipeableListItem";

export default function ShoppingListItems({
  categories,
  toggleMarked,
  updateQuantity,
  deleteItem,
}) {
  return (
    <>
      {Object.entries(categories).map(([cat, items]) => (
        <div key={cat}>
          <h2 className="font-bold text-lg mb-2">{cat}</h2>
          <ul className="space-y-2">
            {items.map((it) => (
              <SwipeableListItem key={it.id} onDelete={() => deleteItem(it.id)}>
                <li
                  className="flex justify-between items-center p-3 border rounded cursor-pointer hover:bg-slate-50"
                  onClick={(e) => {
                    if (e.target.tagName.toLowerCase() !== "input" && e.target.tagName.toLowerCase() !== "button") {
                      toggleMarked(it.id, it.marked);
                    }
                  }}
                >
                  <span>{it.items?.name || it.custom_name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={it.quantity ?? ""}
                      onChange={(e) => updateQuantity(it.id, e.target.value)}
                      className="w-16 border rounded px-2 py-1"
                    />
                    <span className="text-sm text-gray-600">{it.items?.unit?.name || it.custom_unit}</span>

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
      ))}
    </>
  );
}
