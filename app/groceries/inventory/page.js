"use client";

import { useState } from "react";
import { useHouseholds } from "@/lib/hooks/groceries/useHouseholds";
import { useInventory } from "@/lib/hooks/groceries/useInventory";
import HouseholdSetup from "@/components/groceries/HouseholdSetup";
import AddItemModal from "@/components/groceries/AddItemModal";
import AddPriceModal from "@/components/groceries/AddPriceModal";
import toast from "react-hot-toast";
import { Tag } from "lucide-react";

export default function InventoryPage() {
    const { households, isLoading: householdsLoading } = useHouseholds();
    const activeHousehold = households?.[0];

    const { inventory, categories, isLoading: inventoryLoading, addItem, deleteItem } = useInventory(activeHousehold?.id);

    const [activeTab, setActiveTab] = useState("fridge"); // fridge, freezer, pantry
    const [showAddModal, setShowAddModal] = useState(false);
    const [activePriceItem, setActivePriceItem] = useState(null);

    if (householdsLoading || inventoryLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // If no household, force setup
    if (!households || households.length === 0) {
        return <HouseholdSetup />;
    }

    // DEBUG: Check item structure
    console.log("Inventory Data:", inventory);

    // Filter items by location
    const filteredItems = inventory.filter(item => item.location === activeTab);

    const handleAddItem = async (itemData) => {
        try {
            await addItem(itemData);
            toast.success("Added to " + itemData.location);
        } catch (err) {
            toast.error("Failed to add item");
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Remove this item?")) {
            await deleteItem(id);
            toast.success("Removed");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white transition-all">{activeHousehold.name}</h1>
                    <p className="text-sm text-gray-400">Inventory</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {['fridge', 'freezer', 'pantry'].map(loc => (
                    <button
                        key={loc}
                        onClick={() => setActiveTab(loc)}
                        className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all duration-300
                    ${activeTab === loc
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                                : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                            }`}
                    >
                        {loc}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-3 min-h-[300px]">
                {filteredItems.length === 0 ? (
                    <div className="glass rounded-3xl p-12 text-center text-gray-500 flex flex-col items-center justify-center h-64 border border-dashed border-white/10">
                        <div className="text-4xl mb-4 opacity-50">
                            {activeTab === 'fridge' ? '🥬' : activeTab === 'freezer' ? '🧊' : '🥫'}
                        </div>
                        <p>Your {activeTab} is empty.</p>
                        {/* Empty State Action Button */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-4 px-6 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 font-medium transition-colors"
                        >
                            + Add first item
                        </button>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <div key={item.id} className="glass glass-hover p-4 rounded-2xl flex items-center justify-between group relative overflow-hidden">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">
                                    {item.product?.category?.icon || '📦'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{item.product?.name}</h3>
                                    <p className="text-xs text-gray-400 flex items-center gap-2">
                                        <span>{item.quantity} {item.unit}</span>
                                        {/* Tag Button for Price - Only if common item */}
                                        {item.product?.common_item_id && (
                                            <button
                                                onClick={() => setActivePriceItem(item)}
                                                className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-[10px] text-emerald-400 transition-colors border border-white/5"
                                            >
                                                <Tag size={10} />
                                                Add Price
                                            </button>
                                        )}
                                    </p>

                                    {item.expiry_date && (
                                        <p className={`text-[10px] mt-0.5 ${new Date(item.expiry_date) < new Date() ? 'text-red-400' : 'text-gray-500'}`}>
                                            Exp: {new Date(item.expiry_date).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity relative z-10"
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* FAB (Floating Action Button) */}
            <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-500/40 flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all z-40"
            >
                +
            </button>

            {showAddModal && (
                <AddItemModal
                    categories={categories}
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddItem}
                />
            )}

            {activePriceItem && (
                <AddPriceModal
                    item={activePriceItem}
                    onClose={() => setActivePriceItem(null)}
                />
            )}
        </div>
    );
}
