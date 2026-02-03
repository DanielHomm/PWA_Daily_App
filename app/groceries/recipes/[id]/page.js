"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRecipeDetail } from "@/lib/hooks/groceries/useRecipes";
import { useShoppingList } from "@/lib/hooks/groceries/useShoppingList";
import { ArrowLeft, Users, Plus, Trash2, ChefHat, ShoppingCart } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import ItemSearchCombobox from "@/components/groceries/ItemSearchCombobox";
import { useInventory } from "@/lib/hooks/groceries/useInventory";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function RecipeDetailPage() {
    const { t, language } = useLanguage();
    const { id } = useParams();
    const router = useRouter();
    const { recipe, isLoading, updateRecipe, addIngredient, deleteIngredient } = useRecipeDetail(id);
    const { addItem: addToShoppingList } = useShoppingList(recipe?.household_id);
    const { inventory, categories } = useInventory(recipe?.household_id);

    // Scaling State
    const [desiredServings, setDesiredServings] = useState(2);

    // Ingredient Form
    const [isAddingIngredient, setIsAddingIngredient] = useState(false);
    const [newIngName, setNewIngName] = useState("");
    const [newIngCommonId, setNewIngCommonId] = useState(null);
    const [newIngQty, setNewIngQty] = useState(1);
    const [newIngUnit, setNewIngUnit] = useState("units");

    useEffect(() => {
        if (recipe?.default_servings) {
            setDesiredServings(recipe.default_servings);
        }
    }, [recipe?.default_servings]);

    if (isLoading || !recipe) return <div className="p-10 text-center text-gray-400">Loading...</div>;

    const scaleFactor = desiredServings / (recipe.default_servings || 1);

    const handleUpdateServings = async () => {
        await updateRecipe({ default_servings: desiredServings });
        toast.success("Saved default servings");
    };

    const handleAddIngredient = async (e) => {
        e.preventDefault();
        try {
            await addIngredient({
                recipe_id: id,
                name: newIngName,
                common_item_id: newIngCommonId,
                quantity: newIngQty,
                unit: newIngUnit
            });
            setIsAddingIngredient(false);
            setNewIngName("");
            setNewIngCommonId(null);
            setNewIngQty(1);
        } catch (err) {
            toast.error("Failed to add ingredient");
        }
    };

    const handleSearchSelect = (data) => {
        setNewIngName(data.name);
        setNewIngCommonId(data.commonItemId || null);
        if (data.unit) setNewIngUnit(data.unit);
    };

    const getIngName = (ing) => {
        if (ing.common_item) {
            if (language === 'de' && ing.common_item.name_de) return ing.common_item.name_de;
            return ing.common_item.name;
        }
        return ing.name;
    };

    const handleAddToShoppingList = async () => {
        const confirmMsg = language === 'de'
            ? `Zutaten für ${desiredServings} Personen zur Einkaufsliste hinzufügen?`
            : `Add ingredients for ${desiredServings} people to Shopping List?`;

        if (!confirm(confirmMsg)) return;

        let addedCount = 0;
        for (const ing of recipe.ingredients) {
            // Calculate scaled quantity
            const scaledQty = ing.quantity * scaleFactor;

            // Check inventory (simple match by Name or Common ID)
            const inventoryMatch = inventory?.find(invItem =>
                (ing.common_item_id && invItem.product?.common_item_id === ing.common_item_id) ||
                (invItem.product?.name?.toLowerCase() === ing.name?.toLowerCase())
            );

            if (inventoryMatch && inventoryMatch.quantity >= scaledQty) {
                // Skip silently or maybe warn? For now let's just skip if we have enough.
                // Or better: Add it but checked? No, let's just add it.
                // Actually, user requested "Scale Ingredients".
            }

            // Add to list
            await addToShoppingList({
                name: getIngName(ing), // Use localized name for the list item name? Maybe better to store the English name or CommonID?
                // The API for `addToShoppingList` likely takes `commonItemId`. If so, backend/shopping list logic handles naming if it's a common item.
                // But `addItem` in hook usually takes `name`.
                // If I pass `commonItemId`, `getOrCreateProduct` will link it.
                // I should pass the English name if possible to keep DB consistent, BUT if `addItem` uses the name to display, we might want the localized one?
                // Actually, products table name is usually English or user input.
                // If I pass `ing.common_item.name` (English), it finds/creates product "Milk".
                // If I pass "Milch", it creates product "Milch" or finds it.
                // Ideally products should be unique by Common Item regardless of name.
                // For now, let's pass `ing.common_item?.name || ing.name` (English preferred for consistency)
                // BUT wait, `addItem` uses the name.
                // Let's stick to English name if common item exists, so products are shared.
                name: ing.common_item?.name || ing.name,
                commonItemId: ing.common_item_id,
                quantity: Math.ceil(scaledQty * 10) / 10, // Round to 1 decimal
                unit: ing.unit,
                categoryId: null // API will figure it out if common item, or we could pass it if we looked it up
            });
            addedCount++;
        }
        toast.success(`${addedCount} items added!`);
        router.push("/groceries/shopping-list");
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/groceries/recipes" className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                    <ArrowLeft size={20} className="text-gray-400" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white">{recipe.name}</h1>
                </div>
                <button
                    onClick={handleAddToShoppingList}
                    className="flex items-center gap-2 bg-emerald-500 px-4 py-2 rounded-xl text-white font-bold shadow-lg shadow-emerald-500/20"
                >
                    <ShoppingCart size={18} /> {t('shop')}
                </button>
            </div>

            {/* Scaling Controls */}
            <div className="glass p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                        <ChefHat size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-400">{t('cooking_for')}</div>
                        <div className="flex items-center gap-3 mt-1">
                            <button
                                onClick={() => setDesiredServings(Math.max(1, desiredServings - 1))}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold"
                            >
                                -
                            </button>
                            <span className="text-xl font-bold text-white text-center w-8">{desiredServings}</span>
                            <button
                                onClick={() => setDesiredServings(desiredServings + 1)}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold"
                            >
                                +
                            </button>
                            <span className="text-gray-500 ml-1">{t('people')}</span>
                        </div>
                    </div>
                </div>

                {desiredServings !== recipe.default_servings && (
                    <button
                        onClick={handleUpdateServings}
                        className="text-xs text-orange-400 hover:text-orange-300 underline"
                    >
                        {t('save_as_default')} ({recipe.default_servings})
                    </button>
                )}
            </div>

            {/* Ingredients */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">{t('ingredients')}</h2>
                    <button
                        onClick={() => setIsAddingIngredient(true)}
                        className="text-xs bg-white/10 px-3 py-1.5 rounded-lg text-emerald-400 hover:bg-white/15"
                    >
                        + {t('add_ingredient')}
                    </button>
                </div>

                {isAddingIngredient && (
                    <form onSubmit={handleAddIngredient} className="bg-white/5 p-4 rounded-xl border border-white/10 animate-fade-in space-y-3">
                        <ItemSearchCombobox onSelect={handleSearchSelect} categories={categories || []} />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={newIngQty}
                                onChange={e => setNewIngQty(e.target.value)}
                                className="w-20 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                                placeholder={t('qty') || "Qty"}
                                min="0"
                                step={['pcs', 'units', 'pack', 'can', 'g', 'ml'].includes(newIngUnit) ? "1" : "0.1"}
                            />
                            <select
                                value={newIngUnit}
                                onChange={e => setNewIngUnit(e.target.value)}
                                className="w-24 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none appearance-none"
                            >
                                <option value="units">units</option>
                                <option value="g">g</option>
                                <option value="kg">kg</option>
                                <option value="ml">ml</option>
                                <option value="l">l</option>
                                <option value="pcs">pcs</option>
                                <option value="pack">pack</option>
                                <option value="can">can</option>
                            </select>
                            <button className="flex-1 bg-emerald-500 text-white font-bold rounded-lg py-2">{t('add') || 'Add'}</button>
                        </div>
                    </form>
                )}

                <div className="space-y-2">
                    {recipe.ingredients?.map(ing => {
                        const scaledAmount = Math.ceil((ing.quantity * scaleFactor) * 100) / 100;
                        return (
                            <div key={ing.id} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl border-b border-white/5 last:border-0 group">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{ing.common_item?.icon || '🧂'}</span>
                                    <div>
                                        <div className="text-white font-medium">{getIngName(ing)}</div>
                                        <div className="text-xs text-gray-400">
                                            Base: {ing.quantity} {ing.unit}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-emerald-400 font-mono font-bold text-lg">
                                        {scaledAmount} <span className="text-xs text-gray-500">{ing.unit}</span>
                                    </div>
                                    <button
                                        onClick={() => deleteIngredient(ing.id)}
                                        className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
