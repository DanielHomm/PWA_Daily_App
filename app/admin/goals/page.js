'use client';

import { useEffect, useState } from 'react';
import { createGoal, getGoals, deleteGoal } from '@/app/actions/goal-actions';
import { Loader2, Trash2, Plus, ArrowRight, Activity, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GoalsPage() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadGoals();
    }, []);

    async function loadGoals() {
        setLoading(true);
        const data = await getGoals();
        setGoals(data);
        setLoading(false);
    }

    async function handleDelete(e, id) {
        e.preventDefault(); // Prevent navigation
        if (!confirm('Are you sure you want to delete this goal?')) return;

        const res = await deleteGoal(id);
        if (res.success) {
            loadGoals();
        } else {
            alert('Failed to delete goal');
        }
    }

    async function handleCreate(formData) {
        // Handle time conversion if type is time
        if (formData.get('type') === 'time') {
            const hours = Number(formData.get('hours') || 0);
            const minutes = Number(formData.get('minutes') || 0);
            const seconds = Number(formData.get('seconds') || 0);
            const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
            formData.set('target_value', totalSeconds);
            formData.set('target_unit', 'seconds');
        }

        const res = await createGoal(formData);
        if (res.success) {
            setIsCreating(false);
            loadGoals();
        } else {
            console.error(res.error);
            alert(`Failed to create goal: ${res.error}`);
        }
    }


    // Helpers for time input state
    const [createType, setCreateType] = useState('numeric');

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-white" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 animate-fade-in text-white">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Goal Tracking</h1>
                    <p className="text-gray-400">Set and track your personal goals</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    New Goal
                </button>
            </header>

            {isCreating && (
                <div className="mb-8 glass p-6 rounded-3xl border border-white/10 animate-slide-down">
                    <h3 className="text-xl font-bold mb-4">Create New Goal</h3>
                    <form action={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Title</label>
                                <input name="title" required className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white" placeholder="e.g. Pushups" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Type</label>
                                <select
                                    name="type"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white"
                                    value={createType}
                                    onChange={(e) => setCreateType(e.target.value)}
                                >
                                    <option value="numeric">Numeric (Reps, Weight, etc.)</option>
                                    <option value="time">Time based (Duration)</option>
                                </select>
                            </div>

                            {/* Conditional Input based on Type */}
                            {createType === 'time' ? (
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-1">Target Duration</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <input name="hours" type="number" min="0" placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white text-center" />
                                            <div className="text-xs text-center text-gray-500 mt-1">Hours</div>
                                        </div>
                                        <div className="flex-1">
                                            <input name="minutes" type="number" min="0" max="59" placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white text-center" />
                                            <div className="text-xs text-center text-gray-500 mt-1">Mins</div>
                                        </div>
                                        <div className="flex-1">
                                            <input name="seconds" type="number" min="0" max="59" placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white text-center" />
                                            <div className="text-xs text-center text-gray-500 mt-1">Secs</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Target Value</label>
                                        <input name="target_value" type="number" required className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white" placeholder="e.g. 100" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Unit</label>
                                        <input name="target_unit" required className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white" placeholder="e.g. reps, mins" />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Frequency / Type</label>
                                <select name="frequency" className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white" defaultValue="session">
                                    <option value="session">Session / Record (One-time)</option>
                                    <option value="daily">Daily Target</option>
                                    <option value="weekly">Weekly Target</option>
                                    <option value="monthly">Monthly Target</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <label className="block text-sm text-gray-400 mb-3">Stats to Show on Detail Page</label>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input name="show_daily_sum" type="checkbox" className="w-4 h-4 rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-500" />
                                    <span className="text-sm">Daily Total</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input name="show_weekly_sum" type="checkbox" className="w-4 h-4 rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-500" />
                                    <span className="text-sm">Weekly Total</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input name="show_monthly_sum" type="checkbox" className="w-4 h-4 rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-500" />
                                    <span className="text-sm">Monthly Total</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 hover:bg-white/10 rounded-xl transition-colors">Cancel</button>
                            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 rounded-xl transition-colors">Create</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {goals.map(goal => (
                    <Link href={`/admin/goals/${goal.id}`} key={goal.id}>
                        <div className="glass p-6 rounded-3xl border border-white/10 hover:bg-white/5 transition-all duration-300 group">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${goal.type === 'time' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                        {goal.type === 'time' ? <Clock size={24} /> : <Activity size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{goal.title}</h3>
                                        <p className="text-gray-400 text-sm">
                                            Target: {goal.type === 'time'
                                                ? (() => {
                                                    const h = Math.floor(goal.target_value / 3600);
                                                    const m = Math.floor((goal.target_value % 3600) / 60);
                                                    const s = goal.target_value % 60;
                                                    const parts = [];
                                                    if (h > 0) parts.push(`${h}h`);
                                                    if (m > 0) parts.push(`${m}m`);
                                                    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
                                                    return parts.join(' ');
                                                })()
                                                : `${goal.target_value} ${goal.target_unit}`
                                            } {goal.frequency === 'session' ? '(Record)' : `/ ${goal.frequency}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => handleDelete(e, goal.id)}
                                        className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <ArrowRight className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
