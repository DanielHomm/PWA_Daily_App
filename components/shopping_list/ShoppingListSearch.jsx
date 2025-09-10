"use client";

export default function ShoppingListSearch({
  search,
  searchResults,
  onSearch,
  onAdd,
  onAddCustom,
}) {
  return (
    <div className="relative mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={onSearch}
          placeholder="Search items to add..."
          className="flex-1 border rounded px-3 py-2"
        />
        {search.trim() && (
          <button
            onClick={() => onAddCustom(search.trim())}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            style={{ cursor: "pointer" }}
          >
            Add
          </button>
        )}
      </div>

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
