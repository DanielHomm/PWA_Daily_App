"use client";

import SwipeableListItem from "./SwipeableListItem";

export default function ShoppingListItem({
  item,
  updateQuantity,
  toggleMarked,
  deleteItem,
}) {
  return (
    <SwipeableListItem key={item.id} onDelete={() => deleteItem(item.id)}>
      <li
        className="flex justify-between items-center p-3 border rounded cursor-pointer hover:bg-slate-50"
        onClick={(e) => {
          if (e.target.tagName.toLowerCase() !== "input") {
            toggleMarked(item.id, item.marked);
          }
        }}
      >
        <span>{item.items.name}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={item.quantity ?? ""}
            onChange={(e) => updateQuantity(item.id, e.target.value)}
            className="w-16 border rounded px-2 py-1"
          />
          <span className="text-text-primary font-medium">
            {item.items.unit?.name}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteItem(item.id);
            }}
            className="text-red-600 hover:text-red-800 ml-2"
          >
            ✕
          </button>
        </div>
      </li>
    </SwipeableListItem>
  );
}
