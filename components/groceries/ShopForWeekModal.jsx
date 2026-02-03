"use client";

import { useState, useMemo } from "react";
import { X, ShoppingCart, Check } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useInventory } from "@/lib/hooks/groceries/useInventory";
import { useShoppingList } from "@/lib/hooks/groceries/useShoppingList";
import toast from "react-hot-toast";

export default function ShopForWeekModal({ onClose, plans, householdId }) {
    const { t, language } = useLanguage();
    const { inventory } = useInventory(householdId);
    const { addItem: addToShoppingList } = useShoppingList(householdId);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Consolidate Ingredients
    const consolidatedItems = useMemo(() => {
        const items = {};

        plans.forEach(plan => {
            if (!plan.recipe || !plan.recipe.ingredients) return;

            // Adjust for servings if we tracked meal-specific servings (Not yet implemented, assume default)
            const scale = 1;

            plan.recipe.ingredients.forEach(ing => {
                // Key by Common ID if available, else Name
                const key = ing.common_item_id || ing.name.toLowerCase();

                if (!items[key]) {
                    items[key] = {
                        name: ing.common_item?.name || ing.name,
                        name_de: ing.common_item?.name_de,
                        commonItemId: ing.common_item_id,
                        unit: ing.unit,
                        quantity: 0,
                        icon: ing.common_item?.icon,
                        originalNames: new Set()
                    };
                }

                // Simple addition (ignoring unit conversion for now - assuming consistent units for same items)
                items[key].quantity += (ing.quantity * scale);
                items[key].originalNames.add(ing.name);
            });
        });

        // Convert to array and check inventory
        return Object.values(items).map(item => {
            // Check Inventory
            const inStock = inventory?.find(inv =>
                (item.commonItemId && inv.product?.common_item_id === item.commonItemId) ||
                (inv.product?.name?.toLowerCase() === item.name.toLowerCase())
            );

            const stockQty = inStock ? inStock.quantity : 0;
            const needs = Math.max(0, item.quantity - stockQty);

            return {
                ...item,
                stockQty,
                needs,
                // Default checked if we need it
                checked: needs > 0
            };
        });
    }, [plans, inventory]);

    const [itemsToBuy, setItemsToBuy] = useState(consolidatedItems);

    const toggleItem = (index) => {
        const newItems = [...itemsToBuy];
        newItems[index].checked = !newItems[index].checked;
        setItemsToBuy(newItems);
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const selected = itemsToBuy.filter(i => i.checked);
            let count = 0;

            for (const item of selected) {
                // Use localized name for the list if available? 
                // Shopping list usually works with english names or whatever is in DB product.
                // We'll pass English name + commonID so backend links correctly.
                await addToShoppingList({
                    name: item.name,
                    commonItemId: item.commonItemId,
                    quantity: Math.ceil(item.needs * 10) / 10, // Round to 1 decimal
                    unit: item.unit
                });
                count++;
            }

            toast.success(t('added_to_list') || `Added ${count} items`);
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Error adding items");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getName = (item) => {
        if (language === 'de' && item.name_de) return item.name_de;
        return item.name;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1e293b] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShoppingCart className="text-emerald-400" /> {t('shop_for_week')}
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">
                            {plans.length} {t('nav_meals')} • {itemsToBuy.length} {t('ingredients')}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {itemsToBuy.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            {t('no_ingredients_found') || "No ingredients found in selected meals."}
                        </div>
                    ) : (
                        itemsToBuy.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => toggleItem(idx)}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all
                                    ${item.checked
                                        ? 'bg-emerald-500/10 border-emerald-500/30'
                                        : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors
                                        ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500'}
                                    `}>
                                        {item.checked && <Check size={14} className="text-white" />}
                                    </div>
                                    <span className="text-xl">{item.icon || '🧂'}</span>
                                    <div>
                                        <div className="text-white font-medium">{getName(item)}</div>
                                        <div className="text-xs text-gray-400 flex gap-2">
                                            <span>Need: {Math.round(item.quantity * 10) / 10} {item.unit}</span>
                                            {item.stockQty > 0 && (
                                                <span className="text-orange-400">
                                                    (Have: {item.stockQty})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-emerald-400 font-bold">
                                        {Math.max(0, Math.round(item.needs * 10) / 10)} {item.unit}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-slate-900/50">
                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting || itemsToBuy.filter(i => i.checked).length === 0}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Adding...' : (t('add_to_list') || 'Add to Shopping List')}
                        ({itemsToBuy.filter(i => i.checked).length})
                    </button>
                </div>
            </div>
        </div>
    );
}
