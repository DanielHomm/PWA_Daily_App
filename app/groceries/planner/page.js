"use client";

import { useState } from "react";
import { useHouseholds } from "@/lib/hooks/groceries/useHouseholds";
import { usePlanner } from "@/lib/hooks/groceries/usePlanner";
import { useRecipes } from "@/lib/hooks/groceries/useRecipes";
import { format, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Trash2, ChefHat, AlignJustify, Calendar as CalendarIcon, Grid } from "lucide-react";
import toast from "react-hot-toast";

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function PlannerPage() {
    const { households } = useHouseholds();
    const activeHousehold = households?.[0];

    // View State
    const [view, setView] = useState("week"); // day, week, month
    const [currentDate, setCurrentDate] = useState(new Date());

    // Date Range Calculation
    let startDate, endDate;
    if (view === 'day') {
        startDate = currentDate;
        endDate = currentDate;
    } else if (view === 'week') {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
    }

    // Data Fetching
    const { plans, isLoading, addMeal, removeMeal } = usePlanner(
        activeHousehold?.id,
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
    );

    // For Modal
    const { recipes } = useRecipes(activeHousehold?.id);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedType, setSelectedType] = useState("dinner");

    // Modal Form State
    const [mode, setMode] = useState("recipe"); // recipe, custom
    const [selectedRecipeId, setSelectedRecipeId] = useState("");
    const [customText, setCustomText] = useState("");

    const handlePrev = () => {
        if (view === 'day') setCurrentDate(addDays(currentDate, -1));
        if (view === 'week') setCurrentDate(addDays(currentDate, -7));
        if (view === 'month') setCurrentDate(startOfMonth(addDays(startDate, -1)));
    };

    const handleNext = () => {
        if (view === 'day') setCurrentDate(addDays(currentDate, 1));
        if (view === 'week') setCurrentDate(addDays(currentDate, 7));
        if (view === 'month') setCurrentDate(startOfMonth(addDays(endDate, 1)));
    };

    const openAddModal = (date, type) => {
        setSelectedDate(date);
        setSelectedType(type || 'dinner');
        setShowAddModal(true);
    };

    const handleSaveMeal = async () => {
        if (mode === 'recipe' && !selectedRecipeId) return toast.error("Select a recipe");
        if (mode === 'custom' && !customText.trim()) return toast.error("Enter text");

        try {
            await addMeal({
                household_id: activeHousehold.id,
                date: format(selectedDate, 'yyyy-MM-dd'),
                meal_type: selectedType,
                recipe_id: mode === 'recipe' ? selectedRecipeId : null,
                custom_text: mode === 'custom' ? customText : null,
            });
            setShowAddModal(false);
            setCustomText("");
            setSelectedRecipeId("");
            toast.success("Meal added");
        } catch (err) {
            toast.error("Failed to add meal");
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Remove this meal?")) {
            await removeMeal(id);
        }
    };

    // --- RENDERERS ---

    const renderMealCard = (plan) => (
        <div key={plan.id} className="bg-white/5 p-2 rounded-lg mb-1 border border-white/5 text-xs relative group">
            <div className="font-bold text-white truncate max-w-[90%]">
                {plan.recipe ? plan.recipe.name : plan.custom_text}
            </div>
            {plan.recipe && (
                <div className="text-[10px] text-gray-500 flex items-center gap-1">
                    <ChefHat size={10} /> Recipe
                </div>
            )}
            <button
                onClick={() => handleDelete(plan.id)}
                className="absolute top-1 right-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={12} />
            </button>
        </div>
    );

    const renderDayColumn = (day) => {
        const dayPlans = plans.filter(p => isSameDay(new Date(p.date), day));
        const isToday = isSameDay(day, new Date());

        return (
            <div key={day.toISOString()} className={`flex-1 min-w-[140px] p-2 border-r border-white/10 last:border-r-0 ${isToday ? 'bg-white/5' : ''}`}>
                <div className="text-center mb-4 sticky top-0 bg-slate-900/90 backdrop-blur pb-2 z-10">
                    <div className="text-xs uppercase text-gray-400">{format(day, 'EEE')}</div>
                    <div className={`text-lg font-bold ${isToday ? 'text-emerald-400' : 'text-white'}`}>
                        {format(day, 'd')}
                    </div>
                </div>

                <div className="space-y-4">
                    {MEAL_TYPES.map(type => (
                        <div key={type}>
                            <div className="flex justify-between items-center mb-1 group/header">
                                <span className="text-[10px] uppercase text-gray-600 font-bold">{type}</span>
                                <button
                                    onClick={() => openAddModal(day, type)}
                                    className="text-emerald-500 opacity-0 group-hover/header:opacity-100 hover:scale-125 transition-all"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="min-h-[20px]">
                                {dayPlans.filter(p => p.meal_type === type).map(renderMealCard)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col pt-4">
            {/* Header */}
            <div className="px-4 flex justify-between items-center mb-4">
                <div className="flex items-center bg-white/5 rounded-lg p-1">
                    <button
                        onClick={() => setView('day')}
                        className={`p-2 rounded-md ${view === 'day' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
                    >
                        <AlignJustify size={16} />
                    </button>
                    <button
                        onClick={() => setView('week')}
                        className={`p-2 rounded-md ${view === 'week' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
                    >
                        <CalendarIcon size={16} />
                    </button>
                    <button
                        onClick={() => setView('month')}
                        className={`p-2 rounded-md ${view === 'month' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
                    >
                        <Grid size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={handlePrev} className="p-2 hover:bg-white/10 rounded-full"><ChevronLeft /></button>
                    <div className="text-white font-bold min-w-[120px] text-center">
                        {view === 'day' && format(currentDate, 'MMM d, yyyy')}
                        {view === 'week' && `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`}
                        {view === 'month' && format(currentDate, 'MMMM yyyy')}
                    </div>
                    <button onClick={handleNext} className="p-2 hover:bg-white/10 rounded-full"><ChevronRight /></button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {view === 'week' && (
                    <div className="flex min-w-[1000px] h-full">
                        {Array.from({ length: 7 }).map((_, i) => renderDayColumn(addDays(startDate, i)))}
                    </div>
                )}

                {view === 'day' && (
                    <div className="px-4 max-w-md mx-auto">
                        {renderDayColumn(currentDate)}
                    </div>
                )}

                {view === 'month' && (
                    <div className="grid grid-cols-7 gap-1 px-2">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                            <div key={i} className="text-center text-xs text-gray-500 py-2">{d}</div>
                        ))}
                        {Array.from({ length: 35 }).map((_, i) => { // Simple 35 day grid for now
                            const day = addDays(startDate, i);
                            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                            const dayPlans = plans.filter(p => isSameDay(new Date(p.date), day));

                            if (!isCurrentMonth) return <div key={i}></div>; // Simplified

                            return (
                                <div
                                    key={i}
                                    onClick={() => { setCurrentDate(day); setView('day'); }}
                                    className="aspect-square bg-white/5 border border-white/5 rounded-lg p-1 relative cursor-pointer hover:bg-white/10"
                                >
                                    <div className="text-xs text-gray-400">{format(day, 'd')}</div>
                                    {dayPlans.length > 0 && (
                                        <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm">
                        <h3 className="text-xl font-bold text-white mb-4">
                            Add {selectedType} <span className="text-gray-500 text-sm">for {format(selectedDate, 'MMM d')}</span>
                        </h3>

                        <div className="flex bg-white/5 p-1 rounded-lg mb-4">
                            <button
                                onClick={() => setMode('recipe')}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'recipe' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
                            >
                                Recipe
                            </button>
                            <button
                                onClick={() => setMode('custom')}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'custom' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
                            >
                                Custom
                            </button>
                        </div>

                        {mode === 'recipe' ? (
                            <select
                                value={selectedRecipeId}
                                onChange={e => setSelectedRecipeId(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none mb-4"
                            >
                                <option value="">Select a recipe...</option>
                                {recipes?.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                value={customText}
                                onChange={e => setCustomText(e.target.value)}
                                placeholder="e.g. Leftovers"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none mb-4"
                                autoFocus
                            />
                        )}

                        <div className="flex gap-2">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 text-gray-400">Cancel</button>
                            <button onClick={handleSaveMeal} className="flex-1 bg-emerald-500 text-white font-bold rounded-xl">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
