"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRecipes } from "@/lib/hooks/groceries/useRecipes";
import { useHouseholds } from "@/lib/hooks/groceries/useHouseholds";
import MagicRecipeInput from "@/components/groceries/MagicRecipeInput";

export default function CreateRecipePage() {
    const router = useRouter();
    const { households } = useHouseholds();
    const activeHousehold = households?.[0];
    const { createRecipe } = useRecipes(activeHousehold?.id);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [servings, setServings] = useState(2);
    const [prepTime, setPrepTime] = useState(15);
    const [cookTime, setCookTime] = useState(30);

    // Ingredients: [{ item: "Carrots", amount: 2, unit: "pcs" }]
    const [ingredients, setIngredients] = useState([
        { item: "", amount: "", unit: "" }
    ]);

    // Handle Import
    const handleRecipeImport = (data) => {
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.servings) setServings(data.servings);
        if (data.prep_time) setPrepTime(data.prep_time);
        if (data.cook_time) setCookTime(data.cook_time);

        if (data.ingredients && Array.isArray(data.ingredients)) {
            // Map AI ingredients to our format
            const mapped = data.ingredients.map(ing => ({
                item: ing.item || ing.name || "",
                amount: ing.amount || ing.quantity || "",
                unit: ing.unit || ""
            }));
            setIngredients(mapped);
        }
    };

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { item: "", amount: "", unit: "" }]);
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index][field] = value;
        setIngredients(newIngredients);
    };

    const handleRemoveIngredient = (index) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngredients);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activeHousehold) {
            toast.error("No active household found");
            return;
        }
        setIsSubmitting(true);
        try {
            await createRecipe({
                household_id: activeHousehold.id,
                name: title,
                description,
                default_servings: parseInt(servings),
                prep_time_minutes: parseInt(prepTime),
                cook_time_minutes: parseInt(cookTime),
                ingredients: ingredients.filter(i => i.item.trim() !== "")
            });
            toast.success("Recipe Created!");
            router.push("/groceries/recipes");
        } catch (error) {
            toast.error("Failed to create recipe");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-6 pb-24">
            <header className="flex items-center gap-4 mb-6">
                <Link href="/groceries/recipes" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-white" />
                </Link>
                <h1 className="text-2xl font-bold text-white">Create Recipe</h1>
            </header>

            {/* MAGIC IMPORT */}
            <MagicRecipeInput onImport={handleRecipeImport} />

            <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 py-2 text-xl font-bold text-white focus:border-emerald-500 outline-none placeholder-gray-600"
                            placeholder="e.g. Grandma's Lasagna"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-gray-300 focus:border-emerald-500 outline-none min-h-[100px]"
                            placeholder="Short description, steps, or needed spices..."
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Servings</label>
                            <input type="number" value={servings} onChange={e => setServings(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Prep (min)</label>
                            <input type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Cook (min)</label>
                            <input type="number" value={cookTime} onChange={e => setCookTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white" />
                        </div>
                    </div>
                </div>

                {/* Ingredients */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-emerald-400">Ingredients</h2>
                        <button type="button" onClick={handleAddIngredient} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                            <Plus size={16} /> Add
                        </button>
                    </div>

                    <div className="space-y-3">
                        {ingredients.map((ing, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Amount"
                                    value={ing.amount}
                                    onChange={e => handleIngredientChange(i, "amount", e.target.value)}
                                    className="w-20 bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Unit"
                                    value={ing.unit}
                                    onChange={e => handleIngredientChange(i, "unit", e.target.value)}
                                    className="w-20 bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Item name"
                                    value={ing.item}
                                    onChange={e => handleIngredientChange(i, "item", e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveIngredient(i)}
                                    className="p-2 text-gray-500 hover:text-red-400"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                >
                    <Save size={20} />
                    {isSubmitting ? "Saving..." : "Save Recipe"}
                </button>
            </form>
        </div>
    );
}
