"use client";

import { useState, useMemo } from "react";
import { useHouseholds } from "@/lib/hooks/groceries/useHouseholds";
import { useShoppingList } from "@/lib/hooks/groceries/useShoppingList";
import AddItemModal from "@/components/groceries/AddItemModal";
import HouseholdSetup from "@/components/groceries/HouseholdSetup";
import HouseholdSettingsModal from "@/components/groceries/HouseholdSettingsModal";
import toast from "react-hot-toast";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import { ArrowDownToLine, Trash2, Settings } from "lucide-react";

export default function ShoppingListPage() {
    const { t } = useLanguage();
    const { households, isLoading: householdsLoading } = useHouseholds();
    const activeHousehold = households?.[0];

    const { items, categories, isLoading: listLoading, addItem, toggleItem, deleteItem, moveToInventory } = useShoppingList(activeHousehold?.id);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [movingItems, setMovingItems] = useState(false);

    if (householdsLoading || listLoading) {
        return <div className="h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>;
    }

    if (!households || households.length === 0) return <HouseholdSetup />;

    // --- Logic ---

    const itemsToBuy = items.filter(i => !i.is_checked);
    const checkedItems = items.filter(i => i.is_checked);

    // Group items by Category (Only for Buy List)
    const groupItems = (list) => {
        const groups = {};
        list.forEach(item => {
            const catName = item.product?.category?.name || "Uncategorized";
            const sortOrder = item.product?.category?.sort_order || 999;

            if (!groups[sortOrder]) {
                groups[sortOrder] = { name: catName, icon: item.product?.category?.icon, items: [] };
            }
            groups[sortOrder].items.push(item);
        });
        return Object.keys(groups).sort((a, b) => Number(a) - Number(b)).map(key => groups[key]);
    };

    const buyGroups = groupItems(itemsToBuy);

    const handleToggle = async (id, currentStatus) => {
        try {
            await toggleItem({ id, isChecked: !currentStatus });
        } catch (err) {
            console.error(err);
        }
    };

    const handleBulkMove = async () => {
        if (!checkedItems.length) return;
        if (!confirm(`${checkedItems.length} items collected? Move to Inventory?`)) return; // Optional confirmation

        setMovingItems(true);
        try {
            let movedCount = 0;
            for (const item of checkedItems) {
                // Determine location? Default to fridge or category based? 
                // For now, let's default to 'fridge' or maybe we can be smart later.
                // Or we update moveToInventory to accept a default if not specified.
                // Let's hardcode 'fridge' for now or 'pantry' for dry goods? 
                // Simple logic: If Pantry category -> Pantry, Frozen -> Freezer, else Fridge.
                const catName = item.product?.category?.name;
                let location = 'fridge';
                if (['Pantry & Dry Goods', 'Snacks', 'Beverages', 'Household & Cleaning', 'Personal Care', 'Bakery'].includes(catName)) location = 'pantry';
                if (catName === 'Frozen') location = 'freezer';

                await moveToInventory({ id: item.id, location });
                movedCount++;
            }
            toast.success(`Moved ${movedCount} items to Inventory`);
        } catch (err) {
            toast.error("Failed to move items");
            console.error(err);
        } finally {
            setMovingItems(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 flex flex-col h-[calc(100vh-80px)]">
            <header className="flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white max-w-[200px] truncate">{activeHousehold.name}</h1>
                    <p className="text-sm text-gray-400">{t('shopping_list')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/groceries/inventory" className="text-sm text-emerald-400 hover:text-emerald-300">
                        Households →
                    </Link>
                    <button onClick={() => setShowSettingsModal(true)} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-32 space-y-8 scrollbar-hide">

                {/* 1. Items to Buy */}
                {buyGroups.length > 0 ? (
                    <div className="space-y-6">
                        {buyGroups.map(group => (
                            <div key={group.name} className="animate-fade-in">
                                <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-2 sticky top-0 bg-slate-900/90 backdrop-blur py-2 z-10">
                                    <span>{group.icon}</span> {t(group.name) || group.name}
                                </h2>
                                <div className="space-y-2">
                                    {group.items.map(item => (
                                        <div key={item.id} className="glass glass-hover p-4 rounded-xl flex items-center justify-between group">
                                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleToggle(item.id, false)}>
                                                <div className="w-6 h-6 rounded-full border-2 border-gray-500 hover:border-emerald-400 flex items-center justify-center transition-all bg-transparent">
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-white">{item.product?.name}</h3>
                                                    <p className="text-xs text-gray-400">
                                                        {item.quantity} {item.unit}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                                                className="text-gray-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    itemsToBuy.length === 0 && checkedItems.length === 0 && (
                        <div className="text-center py-20 text-gray-500 opacity-50">
                            <div className="text-6xl mb-4">🛒</div>
                            <p>{t('list_is_empty')}</p>
                        </div>
                    )
                )}

                {/* 2. Checked Items (Moved to Bottom) */}
                {checkedItems.length > 0 && (
                    <div className="pt-8 border-t border-white/10">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 opacity-70">
                            Done ({checkedItems.length})
                        </h2>
                        <div className="space-y-2 opacity-60">
                            {checkedItems.map(item => (
                                <div key={item.id} className="bg-white/5 p-3 rounded-xl flex items-center justify-between group">
                                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleToggle(item.id, true)}>
                                        <div className="w-6 h-6 rounded-full border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center transition-all">
                                            <span className="text-white text-xs">✓</span>
                                        </div>
                                        <div className="line-through text-gray-400">
                                            <h3 className="font-medium">{item.product?.name}</h3>
                                            <p className="text-xs">
                                                {item.quantity} {item.unit}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                                        className="text-gray-600 hover:text-gray-400 p-2"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-[84px] left-0 right-0 p-4 max-w-4xl mx-auto pointer-events-none">
                <div className="flex justify-between items-end pointer-events-auto gap-4">
                    {/* Bulk Add Button (Only if checked items exist) */}
                    <div className="flex-1">
                        {checkedItems.length > 0 && (
                            <button
                                onClick={handleBulkMove}
                                disabled={movingItems}
                                className="w-full bg-emerald-600/90 backdrop-blur hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all animate-bounce-in"
                            >
                                <ArrowDownToLine size={20} />
                                {movingItems ? 'Moving...' : t('add_checked_to_inventory')}
                            </button>
                        )}
                    </div>

                    {/* FAB */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-14 h-14 bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-500/40 flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all flex-shrink-0"
                    >
                        +
                    </button>
                </div>
            </div>

            {showAddModal && (
                <AddItemModal
                    mode="shopping"
                    categories={categories}
                    onClose={() => setShowAddModal(false)}
                    onAdd={addItem}
                />
            )}

            {showSettingsModal && (
                <HouseholdSettingsModal
                    household={activeHousehold}
                    onClose={() => setShowSettingsModal(false)}
                />
            )}
        </div>
    );
}
