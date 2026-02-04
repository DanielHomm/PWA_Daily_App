"use client";

import { useState } from "react";
import { X, MapPin } from "lucide-react";
import { usePrices } from "@/lib/hooks/groceries/usePrices";
import toast from "react-hot-toast";

export default function AddPriceModal({ item, onClose }) {
    const commonItemId = item.product?.common_item_id;
    const { chains, createStore, addPrice, prices, pricesLoading } = usePrices(commonItemId);
    const [step, setStep] = useState(1); // 1: Chain/Type, 2: Store Name, 3: Price

    const [selectedChainId, setSelectedChainId] = useState(null); // Null = Independent
    const [isIndependent, setIsIndependent] = useState(false);

    const [storeName, setStoreName] = useState("");
    const [storeId, setStoreId] = useState(null); // If selecting existing store (future feature: search stores)

    const [price, setPrice] = useState("");

    const handleChainSelect = (id) => {
        setSelectedChainId(id);
        setIsIndependent(false);
        setStep(2);
    };

    const handleIndependentSelect = () => {
        setSelectedChainId(null);
        setIsIndependent(true);
        setStep(2);
    };

    const handleStoreSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ideally search for existing store first, but for now we simplify:
            // Create store on the fly or select if logic existed.
            // Let's create it for now to handle "My Local Edeka".
            const newStore = await createStore({
                name: storeName,
                chain_id: selectedChainId
            });
            setStoreId(newStore.id);
            setStep(3);
        } catch (err) {
            toast.error("Failed to set store");
        }
    };

    const handlePriceSubmit = async (e) => {
        e.preventDefault();
        try {
            await addPrice({
                common_item_id: item.product?.common_item_id, // Ensure item has this!
                store_id: storeId,
                price: parseFloat(price)
            });
            toast.success("Price reported!");
            onClose();
        } catch (err) {
            toast.error("Failed to report price");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1e293b] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">

                <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-white">
                        Price for {item.product?.name}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Recent Prices / Best Prices */}
                {step === 1 && (
                    <div className="px-6 pt-4 shrink-0">
                        <h3 className="text-xs uppercase text-emerald-400 font-bold mb-2">Best Prices</h3>
                        {pricesLoading ? (
                            <div className="text-sm text-gray-500">Loading prices...</div>
                        ) : prices?.length > 0 ? (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {prices.map(p => (
                                    <div key={p.id} className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 min-w-[100px] flex flex-col items-center">
                                        <div className="text-lg font-bold text-emerald-400">€{p.price}</div>
                                        <div className="text-xs text-white truncate max-w-full">
                                            {p.store?.chain?.icon} {p.store?.chain?.name || 'Indep.'}
                                        </div>
                                        <div className="text-[10px] text-gray-400 truncate max-w-full">{p.store?.name}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 bg-white/5 p-3 rounded-lg text-center">No prices reported yet. Be the first!</div>
                        )}
                        <div className="h-px bg-white/10 my-4"></div>
                    </div>
                )}

                <div className="p-6 overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-gray-400 text-sm">Where are you shopping?</p>
                            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                                {chains.map(chain => (
                                    <button
                                        key={chain.id}
                                        onClick={() => handleChainSelect(chain.id)}
                                        className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
                                    >
                                        <span className="text-2xl">{chain.icon || '🏪'}</span>
                                        <span className="text-white font-medium">{chain.name}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={handleIndependentSelect}
                                    className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-dashed border-gray-500"
                                >
                                    <span className="text-2xl">🏪</span>
                                    <span className="text-gray-300 font-medium">Independent Store</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleStoreSubmit} className="space-y-4">
                            <p className="text-gray-400 text-sm">Which store specifically?</p>
                            <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                {selectedChainId ? chains.find(c => c.id === selectedChainId)?.name : "Independent"}
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-1">Store Name/Location</label>
                                <input
                                    type="text"
                                    value={storeName}
                                    onChange={e => setStoreName(e.target.value)}
                                    placeholder="e.g. Main Street, or Joe's Market"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                                    autoFocus
                                    required
                                />
                            </div>
                            <button className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl">Next</button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handlePriceSubmit} className="space-y-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                <MapPin size={14} /> {storeName}
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-gray-500 mb-1">Price per {item.unit}</label>
                                <div className="flex bg-black/20 rounded-xl border border-white/10 items-center px-4">
                                    <span className="text-gray-400 mr-2">€</span>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        className="w-full bg-transparent py-4 text-xl text-white outline-none"
                                        step="0.01"
                                        placeholder="0.00"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>
                            <button className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20">
                                Confirm Price
                            </button>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}
