'use client';

import { useState } from 'react';
import { addCommonItem } from '@/app/actions/admin-actions';
import { useLanguage } from '@/lib/context/LanguageContext';

const CATEGORIES = [
    'Produce',
    'Dairy & Cheese',
    'Meat & Fish',
    'Bakery',
    'Pantry & Dry Goods',
    'Snacks',
    'Beverages',
    'Household & Cleaning',
    'Personal Care',
    'Frozen',
    'Other'
];

const UNITS = [
    'units',
    'kg',
    'g',
    'l',
    'ml',
    'pcs',
    'pack',
    'can',
    'bottle',
    'box',
    'bag',
    'jar',
    'tube',
    'roll'
];

export default function AdminCommonItemsPage() {
    const { t } = useLanguage();
    const [message, setMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Simple emoji suggestions
    const SUGGESTED_EMOJIS = ['🍎', '🍌', '🥬', '🥛', '🧀', '🥩', '🍞', '🍚', '🍪', '🧃', '🧼', '🧻'];

    async function handleSubmit(event) {
        event.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        const formData = new FormData(event.target);
        const result = await addCommonItem(formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Item added successfully!' });
            event.target.reset();
        } else {
            setMessage({ type: 'error', text: result.error });
        }
        setIsSubmitting(false);
    }

    return (
        <div className="max-w-2xl mx-auto p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">Add Common Item</h1>

            {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 glass p-8 rounded-3xl border border-white/10">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* English Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Name (English)</label>
                        <input
                            name="name"
                            required
                            placeholder="e.g. Apple"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* German Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Name (German)</label>
                        <input
                            name="name_de"
                            required
                            placeholder="e.g. Apfel"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Category</label>
                    <select
                        name="category"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white appearance-none"
                        style={{ backgroundImage: 'none' }} // Remove default arrow if needed, or keep for clarity
                    >
                        <option value="" className="bg-gray-800 text-gray-400">Select a category...</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Default Unit */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Default Unit</label>
                        <select
                            name="default_unit"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                        >
                            {UNITS.map(unit => (
                                <option key={unit} value={unit} className="bg-gray-800">{unit}</option>
                            ))}
                        </select>
                    </div>

                    {/* Icon */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Icon (Emoji)</label>
                        <div className="flex gap-2">
                            <input
                                name="icon"
                                placeholder="🍎"
                                maxLength="4"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-2xl"
                            />
                            {/* Quick pickers */}
                            <div className="flex gap-1 overflow-x-auto py-1">
                                {SUGGESTED_EMOJIS.slice(0, 4).map(emoji => ( // Just show a few as hints
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={(e) => {
                                            const input = e.target.closest('div').previousSibling;
                                            input.value = emoji;
                                        }}
                                        className="bg-white/5 hover:bg-white/10 rounded-lg p-2 text-xl transition-colors"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Adding...' : 'Add Item'}
                    </button>
                </div>

            </form>
        </div>
    );
}
