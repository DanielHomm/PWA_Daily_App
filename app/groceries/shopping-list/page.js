"use client";

import { useState } from "react";
import { useHouseholds } from "@/lib/hooks/groceries/useHouseholds";
import { useShoppingList } from "@/lib/hooks/groceries/useShoppingList";
import AddItemModal from "@/components/groceries/AddItemModal";
import HouseholdSetup from "@/components/groceries/HouseholdSetup";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ShoppingListPage() {
    const { households, isLoading: householdsLoading } = useHouseholds();
    const activeHousehold = households?.[0];

    const { items, categories, isLoading: listLoading, addItem, toggleItem, deleteItem, moveToInventory } = useShoppingList(activeHousehold?.id);
    const [showAddModal, setShowAddModal] = useState(false);

    if (householdsLoading || listLoading) {
        return <div className="h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>;
    }

    if (!households || households.length === 0) return <HouseholdSetup />;

    // Group items by Category
    const groupedItems = {};
    items.forEach(item => {
        // If no category, group under 'Uncategorized' (or use Sort Order 999)
        const catName = item.product?.category?.name || "Uncategorized";
        const sortOrder = item.product?.category?.sort_order || 999;

        if (!groupedItems[sortOrder]) {
            groupedItems[sortOrder] = { name: catName, icon: item.product?.category?.icon, items: [] };
        }
        groupedItems[sortOrder].items.push(item);
    });

    // Sort groups
    const sortedGroups = Object.keys(groupedItems).sort((a, b) => Number(a) - Number(b)).map(key => groupedItems[key]);

    const handleToggle = async (id, currentStatus) => {
        try {
            // If checking OFF (marking as bought), we prompt to move to inventory
            const newStatus = !currentStatus;
            if (newStatus === true) {
                if (confirm("Bought it? Move to Fridge?")) {
                    await moveToInventory({ id, location: 'fridge' });
                    toast.success("Moved to Fridge");
                    return; // Don't toggle, it's deleted/moved
                }
            }
            await toggleItem({ id, isChecked: newStatus });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">{activeHousehold.name}</h1>
                    <p className="text-sm text-gray-400">Shopping List</p>
                </div>
                <Link href="/groceries/inventory" className="text-sm text-emerald-400 hover:text-emerald-300">
                    View Inventory →
                </Link>
            </header>

            {/* Main List Area */}
            <div className="space-y-6 pb-24">
                {sortedGroups.map(group => (
                    <div key={group.name} className="animate-fade-in">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span>{group.icon}</span> {group.name}
                        </h2>
                        <div className="space-y-2">
                            {group.items.map(item => (
                                <div key={item.id} className="glass glass-hover p-4 rounded-xl flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleToggle(item.id, item.is_checked)}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                        ${item.is_checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500 hover:border-emerald-400'}
                                    `}
                                        >
                                            {item.is_checked && <span className="text-white text-xs">✓</span>}
                                        </button>
                                        <div className={item.is_checked ? 'opacity-50 line-through' : ''}>
                                            <h3 className="font-medium text-white">{item.product?.name}</h3>
                                            <p className="text-xs text-gray-400">
                                                {item.quantity} {item.unit}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="text-gray-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="text-center py-20 text-gray-500 opacity-50">
                        <div className="text-6xl mb-4">🛒</div>
                        <p>List is empty</p>
                    </div>
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-500/40 flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all z-40"
            >
                +
            </button>

            {showAddModal && (
                <AddItemModal
                    mode="shopping"
                    categories={categories}
                    onClose={() => setShowAddModal(false)}
                    onAdd={addItem}
                />
            )}
        </div>
    );
}
