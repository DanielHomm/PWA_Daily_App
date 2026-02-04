"use client";

import { useState } from "react";
import { Tag, Trash2, ArrowDownToLine } from "lucide-react";
import { usePrices } from "@/lib/hooks/groceries/usePrices";

export default function ShoppingListItem({ item, onToggle, onMoveToInventory, onDelete, onAddPrice }) {
    const { prices } = usePrices(item.product?.common_item_id); // Auto-fetches if common_item_id exists

    // Calculate best price
    const bestPrice = prices?.length > 0 ? prices[0] : null;

    return (
        <div
            className={`group flex items-center justify-between p-4 rounded-2xl transition-all ${item.is_checked ? "bg-white/5 opacity-60" : "bg-white/10 hover:bg-white/15"}`}
        >
            <div className="flex items-center gap-4 flex-1">
                {/* Checkbox */}
                <button
                    onClick={() => onToggle(item.id, !item.is_checked)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.is_checked ? "bg-emerald-500 border-emerald-500" : "border-gray-500 hover:border-emerald-400"}`}
                >
                    {item.is_checked && <span className="text-white text-xs">✓</span>}
                </button>

                {/* Info */}
                <div>
                    <h3 className={`font-bold text-lg ${item.is_checked ? "line-through text-gray-400" : "text-white"}`}>
                        {item.product?.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300">
                            {item.quantity} {item.unit}
                        </span>

                        {/* Best Price Badge */}
                        {bestPrice && (
                            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                <span className="font-bold">€{bestPrice.price}</span>
                                <span>@ {bestPrice.store?.chain?.name || bestPrice.store?.name}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {/* Price Button */}
                {!item.is_checked && (
                    <button
                        onClick={() => onAddPrice(item)}
                        className="p-2 bg-white/5 hover:bg-white/10 text-emerald-400 rounded-lg transition-colors"
                        title="Check/Add Prices"
                    >
                        <Tag size={18} />
                    </button>
                )}

                {item.is_checked ? (
                    <button
                        onClick={() => onMoveToInventory(item.id)}
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                        title="Move to Inventory"
                    >
                        <ArrowDownToLine size={18} />
                    </button>
                ) : null}

                <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
