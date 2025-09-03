"use client";

export default function ShoppingListItems({ categories, onToggle, onUpdate }) {
  return (
    <div className="space-y-6">
      {Object.entries(categories).map(([cat, items]) => (
        <div key={cat}>
          <h2 className="font-bold text-lg mb-2">{cat}</h2>
          <ul className="space-y-2">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex justify-between items-center p-3 border rounded cursor-pointer hover:bg-slate-50"
                onClick={(e) => {
                  if (e.target.tagName.toLowerCase() !== "input") {
                    onToggle(it.id, it.marked);
                  }
                }}
              >
                <span>{it.items.name}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={it.quantity ?? ""}
                    onChange={(e) => onUpdate(it.id, e.target.value, true)}
                    onBlur={(e) => onUpdate(it.id, e.target.value)}
                    className="w-16 border rounded px-2 py-1"
                  />
                  <span className="text-sm text-gray-600">
                    {it.items.unit?.name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
