"use client";

import SwipeableListItem from "./SwipeableListItem";
import ShoppingListItem from "./ShoppingListItem";


export default function ShoppingListDone({ marked, toggleMarked, deleteItem }) {
  if (marked.length === 0) return null;

  return (
    <div>
      <h2 className="font-bold text-lg mb-2">Done</h2>
      <ul className="space-y-2">
        {marked.map((it) => (
          <SwipeableListItem
            key={it.id}
            onDelete={() => deleteItem(it.id)}
          >
            <ShoppingListItem
              item={it}
              isDone
              toggleMarked={toggleMarked}
              deleteItem={deleteItem}
            />
          </SwipeableListItem>
        ))}
      </ul>
    </div>
  );
}
