"use client";

import { useState, useEffect, useRef } from "react";
import { searchCommonItems } from "@/lib/data/groceries/groceries.api";
import { Search } from "lucide-react";

export default function ItemSearchCombobox({ onSelect, categories }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                const items = await searchCommonItems(query);
                setResults(items);
                setLoading(false);
                setIsOpen(true);
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (item) => {
        setQuery(item.name);
        setIsOpen(false);

        // Find category ID based on name match
        const category = categories.find(c => c.name === item.category_name);

        onSelect({
            name: item.name,
            categoryId: category?.id,
            unit: item.default_unit,
            commonItemId: item.id
        });
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        // Allow custom input
        onSelect({ name: val, isCustom: true });
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Product Name</label>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search e.g. Milk..."
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </div>

            {/* Dropdown */}
            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {results.map(item => (
                        <button
                            key={item.id}
                            type="button" // Prevent form submit
                            onClick={() => handleSelect(item)}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                        >
                            <span className="text-xl">{item.icon || '📦'}</span>
                            <div>
                                <div className="text-white font-medium">{item.name}</div>
                                <div className="text-xs text-gray-400">
                                    {item.category_name} • {item.default_unit}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
