"use client";

export default function ShoppingListSearch({
  search,
  searchResults,
  onSearch,
  onAdd,
}) {
  return (
    <div className="relative mb-6">
      <input
        type="text"
        value={search}
        onChange={onSearch}
        placeholder="Search items to add..."
        className="w-full border rounded px-3 py-2"
      />
      {searchResults.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow">
          {searchResults.map((res) => (
            <li
              key={res.id}
              className={`px-3 py-2 cursor-pointer ${
                res.alreadyAdded
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-black font-semibold hover:bg-slate-100"
              }`}
              onClick={() => {
                if (!res.alreadyAdded) onAdd(res.id);
              }}
            >
              {res.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
