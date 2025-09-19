"use client";

export default function ShoppingListItem({
  item,
  isDone = false,
  toggleMarked,
  updateQuantity,
  deleteItem,
}) {
  return (
    <li
      className={`flex justify-between items-center p-3 border rounded cursor-pointer hover:bg-slate-50 ${
        isDone ? "line-through text-gray-500" : ""
      }`}
      onClick={(e) => {
        if (e.target.tagName.toLowerCase() !== "input") {
          toggleMarked(item.id, item.marked);
        }
      }}
    >
      <span className={isDone ? "" : "text-gray-900"}>
        {item.items?.name || item.custom_name}
      </span>
      <div className="flex items-center gap-2">
        {!isDone && (
          <input
            type="number"
            min="1"
            value={item.quantity ?? ""}
            onChange={(e) => updateQuantity(item.id, e.target.value)}
            className="w-16 border rounded px-2 py-1 text-gray-900"
          />
        )}
        <span className={`text-sm ${isDone ? "" : "text-gray-900"}`}>
          {item.quantity} {item.items?.unit?.name || item.custom_unit}
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
  );
}
