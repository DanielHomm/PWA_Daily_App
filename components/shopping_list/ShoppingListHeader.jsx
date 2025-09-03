"use client";

export default function ShoppingListHeader({ onShare }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">Shopping List</h1>
      <button
        onClick={onShare}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Share
      </button>
    </div>
  );
}
