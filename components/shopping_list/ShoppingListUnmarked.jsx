"use client";

import SwipeableListItem from "./SwipeableListItem";
import ShoppingListItem from "./ShoppingListItem";

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
            <ShoppingListItem
              item={it}
              toggleMarked={toggleMarked}
              updateQuantity={updateQuantity}
              deleteItem={deleteItem}
            />
          </SwipeableListItem>
        ))}
      </ul>
    </div>
  );
}
