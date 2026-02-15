'use client';

import { useEffect, useState, use } from 'react';
import { getGoal, getGoalLogs, logGoalProgress, deleteGoalLog } from '@/app/actions/goal-actions';
import { Loader2, ArrowLeft, Trash2, Plus, Calendar, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startOfWeek, startOfMonth, isSameWeek, isSameMonth, parseISO, isSameDay } from 'date-fns';

export default function GoalDetailPage(props) {
    const params = use(props.params);
    const id = params.id;
    const [goal, setGoal] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logging, setLogging] = useState(false);

    // Stats
    const [todayTotal, setTodayTotal] = useState(0);
    const [weeklyTotal, setWeeklyTotal] = useState(0);
    const [monthlyTotal, setMonthlyTotal] = useState(0);
    const [maxLog, setMaxLog] = useState(0);
    const [maxDaily, setMaxDaily] = useState(0);

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        setLoading(true);
        const [goalData, logsData] = await Promise.all([
            getGoal(id),
            getGoalLogs(id)
        ]);
        setGoal(goalData);
        setLogs(logsData);
        calculateStats(logsData);
        setLoading(false);
    }

    function calculateStats(logsData) {
        const now = new Date();

        // Totals
        let dTotal = 0;
        let wTotal = 0;
        let mTotal = 0;

        logsData.forEach(log => {
            const date = parseISO(log.log_date);
            const val = Number(log.value);

            if (isSameDay(date, now)) dTotal += val;
            if (isSameWeek(date, now, { weekStartsOn: 1 })) wTotal += val; // Monday start
            if (isSameMonth(date, now)) mTotal += val;
        });

        setTodayTotal(dTotal);
        setWeeklyTotal(wTotal);
        setMonthlyTotal(mTotal);

        // Max Single Log
        const maxSingle = Math.max(...logsData.map(l => Number(l.value)), 0);
        setMaxLog(maxSingle);

        // Max Daily Total
        const dailyTotals = logsData.reduce((acc, log) => {
            acc[log.log_date] = (acc[log.log_date] || 0) + Number(log.value);
            return acc;
        }, {});
        const maxDay = Math.max(...Object.values(dailyTotals), 0);
        setMaxDaily(maxDay);
    }

    async function handleLog(formData) {
        setLogging(true);
        const res = await logGoalProgress(id, formData);
        if (res.success) {
            loadData();
            // Reset form
            document.getElementById('logForm').reset();
        } else {
            alert('Failed to log progress');
        }
        setLogging(false);
    }

    async function handleDeleteLog(logId) {
        if (!confirm('Delete this log entry?')) return;
        const res = await deleteGoalLog(logId);
        if (res.success) {
            loadData();
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-white" /></div>;
    if (!goal) return <div className="text-white p-8">Goal not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 animate-fade-in text-white">
            <Link href="/admin/goals" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Goals
            </Link>

            <header className="mb-8 p-6 glass rounded-3xl border border-white/10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{goal.title}</h1>
                        <p className="text-gray-400">Target: {goal.target_value} {goal.target_unit}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Frequency</div>
                        <div className="font-medium capitalize">{goal.frequency}</div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-6">
                    {/* Max Record - Always Shown */}
                    <div className="flex-1 min-w-[140px] bg-white/5 p-4 rounded-2xl text-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <div className="text-sm text-gray-400 mb-1">Max Record</div>
                        <div className="text-2xl font-bold text-white">
                            {formatValue(maxLog, goal.type)}
                            <span className="text-sm font-normal text-gray-500 ml-1">{goal.type === 'time' ? '' : goal.target_unit}</span>
                        </div>
                    </div>

                    {/* Conditional Stats */}
                    {goal.show_daily_sum && (
                        <div className="flex-1 min-w-[140px] bg-white/5 p-4 rounded-2xl text-center">
                            <div className="text-sm text-gray-400 mb-1">Today</div>
                            <div className="text-2xl font-bold text-emerald-400">
                                {formatValue(todayTotal, goal.type)}
                                <span className="text-sm font-normal text-gray-500 ml-1">{goal.type === 'time' ? '' : goal.target_unit}</span>
                            </div>
                        </div>
                    )}

                    {goal.show_weekly_sum && (
                        <div className="flex-1 min-w-[140px] bg-white/5 p-4 rounded-2xl text-center">
                            <div className="text-sm text-gray-400 mb-1">This Week</div>
                            <div className="text-2xl font-bold text-blue-400">
                                {formatValue(weeklyTotal, goal.type)}
                                <span className="text-sm font-normal text-gray-500 ml-1">{goal.type === 'time' ? '' : goal.target_unit}</span>
                            </div>
                        </div>
                    )}

                    {goal.show_monthly_sum && (
                        <div className="flex-1 min-w-[140px] bg-white/5 p-4 rounded-2xl text-center">
                            <div className="text-sm text-gray-400 mb-1">This Month</div>
                            <div className="text-2xl font-bold text-purple-400">
                                {formatValue(monthlyTotal, goal.type)}
                                <span className="text-sm font-normal text-gray-500 ml-1">{goal.type === 'time' ? '' : goal.target_unit}</span>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Log Form */}
                <div className="md:col-span-1">
                    <div className="glass p-6 rounded-3xl border border-white/10 sticky top-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-emerald-500" />
                            Log Progress
                        </h3>
                        <form id="logForm" action={handleLog} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Date</label>
                                <input
                                    type="date"
                                    name="log_date"
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    Value ({goal.target_unit})
                                </label>
                                <input
                                    type="number"
                                    name="value"
                                    step="0.01"
                                    required
                                    placeholder="0"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white text-lg font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                                <textarea
                                    name="notes"
                                    rows="2"
                                    placeholder="Optional notes..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={logging}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
                            >
                                {logging ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                Save Log
                            </button>
                        </form>
                    </div>
                </div>

                {/* Log History */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-blue-500" />
                        History
                    </h3>
                    {logs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-white/5 rounded-3xl">
                            No logs yet. Start tracking!
                        </div>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className="glass p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors flex justify-between items-center group">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold text-emerald-400">
                                            {goal.type === 'time' ? (() => {
                                                const val = log.value;
                                                const h = Math.floor(val / 3600);
                                                const m = Math.floor((val % 3600) / 60);
                                                const s = val % 60;
                                                return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
                                            })() : log.value}
                                            <span className="text-sm font-normal text-gray-500 ml-1">{goal.target_unit}</span>
                                        </span>
                                        <span className="text-sm text-gray-400 border-l border-white/10 pl-3">
                                            {new Date(log.log_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {log.notes && (
                                        <p className="text-gray-400 text-sm mt-1">{log.notes}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDeleteLog(log.id)}
                                    className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function formatValue(val, type) {
    if (type !== 'time') return Number(val).toLocaleString();

    val = Number(val);
    const h = Math.floor(val / 3600);
    const m = Math.floor((val % 3600) / 60);
    const s = val % 60;
    return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
}
