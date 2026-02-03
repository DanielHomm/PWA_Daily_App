"use client";

import { useState } from "react";
import { X, Calendar } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

import ItemSearchCombobox from "./ItemSearchCombobox";

export default function AddItemModal({ categories, onClose, onAdd }) {
    const { t } = useLanguage();
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [location, setLocation] = useState("fridge");
    const [expiryDate, setExpiryDate] = useState("");
    const [commonItemId, setCommonItemId] = useState(null);

    // Quick defaults
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState("units");

    const handleSearchSelect = (data) => {
        if (data.isCustom) {
            setName(data.name);
            setCommonItemId(null);
        } else {
            setName(data.name);
            if (data.categoryId) setCategoryId(data.categoryId);
            if (data.unit) setUnit(data.unit);
            setCommonItemId(data.commonItemId);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        await onAdd({
            name,
            categoryId: categoryId || null, // Optional
            location,
            quantity,
            unit,
            expiryDate: expiryDate || null,
            commonItemId
        });
        onClose();
    };

    // Helper for unit logic
    const isIntegerUnit = (u) => ['pcs', 'units', 'pack', 'can', 'bottle', 'bag', 'box', 'g', 'ml'].includes(u);
    const getStep = (u) => isIntegerUnit(u) ? "1" : "0.1";

    const handleUnitChange = (e) => {
        const newUnit = e.target.value;
        setUnit(newUnit);
        // Reset qty if switching to integer unit and current is decimal
        if (isIntegerUnit(newUnit) && quantity % 1 !== 0) {
            setQuantity(Math.ceil(quantity) || 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1e293b] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/10">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">{t('add_item')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Name & Category */}
                    <div className="space-y-4">
                        <div>
                            <ItemSearchCombobox onSelect={handleSearchSelect} categories={categories} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Category</label>
                                <select
                                    value={categoryId}
                                    onChange={e => setCategoryId(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 appearance-none"
                                >
                                    <option value="">{t('all')}</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {t(cat.name) || cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Location</label>
                                <select
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 appearance-none"
                                >
                                    <option value="fridge">{t('fridge')}</option>
                                    <option value="pantry">{t('pantry')}</option>
                                    <option value="freezer">{t('freezer')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr className="border-white/5" />

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Quantity</label>
                            <div className="flex bg-black/20 rounded-xl border border-white/10">
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                    className="w-full bg-transparent px-4 py-3 text-white focus:outline-none"
                                    min="0"
                                    step={getStep(unit)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Unit</label>
                            <select
                                value={unit}
                                onChange={handleUnitChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 appearance-none"
                            >
                                <option value="pcs">pieces (pcs)</option>
                                <option value="kg">kilograms (kg)</option>
                                <option value="g">grams (g)</option>
                                <option value="l">liters (l)</option>
                                <option value="ml">milliliters (ml)</option>
                                <option value="pack">packs</option>
                                <option value="can">cans</option>
                                <option value="bottle">bottles</option>
                                <option value="bag">bags</option>
                                <option value="box">boxes</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-2">
                            <Calendar size={12} /> Expiry (Optional)
                        </label>
                        <input
                            type="date"
                            value={expiryDate}
                            onChange={e => setExpiryDate(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-400 focus:text-white focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                    >
                        {t('add_item')}
                    </button>
                </form>
            </div>
        </div>
    );
}
