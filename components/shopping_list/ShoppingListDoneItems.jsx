"use client";

export default function ShoppingListDoneItems({ marked, onToggle }) {
  if (!marked.length) return null;

  return (
    <div>
      <h2 className="font-bold text-lg mb-2">Done</h2>
      <ul className="space-y-2">
        {marked.map((it) => (
          <li
            key={it.id}
            className="flex justify-between items-center p-3 border rounded line-through text-gray-500 cursor-pointer hover:bg-slate-50"
            onClick={() => onToggle(it.id, it.marked)}
          >
            <span>{it.items.name}</span>
            <span className="text-sm">
              {it.quantity} {it.items.unit?.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
