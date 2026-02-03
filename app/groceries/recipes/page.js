"use client";

import { useState } from "react";
import { useHouseholds } from "@/lib/hooks/groceries/useHouseholds";
import { useRecipes } from "@/lib/hooks/groceries/useRecipes";
import Link from "next/link";
import { Plus, ChevronRight, Utensils, Clock, Users, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function RecipesPage() {
    const { t } = useLanguage();
    const { households } = useHouseholds();
    const activeHousehold = households?.[0];
    const { recipes = [], isLoading, createRecipe, deleteRecipe } = useRecipes(activeHousehold?.id);

    const [newRecipeName, setNewRecipeName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newRecipeName.trim()) return;

        try {
            await createRecipe({
                household_id: activeHousehold.id,
                name: newRecipeName,
                default_servings: 2 // Default
            });
            setNewRecipeName("");
            setIsCreating(false);
            toast.success(t('recipe_created') || "Recipe created!");
        } catch (err) {
            toast.error("Failed to create recipe");
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault(); // Prevent link click
        if (confirm("Delete this recipe?")) {
            await deleteRecipe(id);
            toast.success("Recipe deleted");
        }
    };

    if (isLoading) return <div className="p-10 text-center text-gray-500">Loading recipes...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">{t('recipes')}</h1>
                    <p className="text-sm text-gray-400">{t('meal_planner')}</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="p-2 bg-emerald-500/10 text-emerald-400 rounded-full hover:bg-emerald-500/20"
                >
                    <Plus size={24} />
                </button>
            </header>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-white/5 p-4 rounded-xl border border-white/10 animate-fade-in mb-6">
                    <label className="block text-xs uppercase text-gray-500 mb-2">Recipe Name</label>
                    <div className="flex gap-2">
                        <input
                            value={newRecipeName}
                            onChange={e => setNewRecipeName(e.target.value)}
                            placeholder="e.g. Spaghetti Bolognese"
                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                            autoFocus
                        />
                        <button className="px-6 bg-emerald-500 text-white font-bold rounded-lg">
                            Create
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {recipes?.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                        <Utensils className="mx-auto mb-3 opacity-50" size={32} />
                        <p>{t('no_recipes')}</p>
                        <p className="text-sm">{t('create_first_recipe')}</p>
                    </div>
                ) : (
                    recipes.map(recipe => (
                        <Link
                            key={recipe.id}
                            href={`/groceries/recipes/${recipe.id}`}
                            className="block glass glass-hover p-5 rounded-2xl group"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                                        {recipe.name}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                        {recipe.prep_time_minutes > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} /> {recipe.prep_time_minutes} min
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Users size={12} /> {recipe.default_servings} {t('people') || 'ppl'}
                                        </span>
                                        <span className="bg-white/5 px-2 py-0.5 rounded">
                                            {recipe.ingredients?.[0]?.count || 0} {t('ingredients')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => handleDelete(e, recipe.id)}
                                        className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <ChevronRight className="text-gray-500 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div >
    );
}
