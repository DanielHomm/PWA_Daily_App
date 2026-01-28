"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, isSameDay } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";

export default function BackfillCheckinModal({
  challenge,
  subChallenges = [],
  // existingDates is now a Map of dateStr -> Set(subId) or Array of dates for a specific task? 
  // Simplified: Pass valid dates for the SELECTED sub-challenge, or handle logic consistently.
  // Ideally, parent passes a function to check validity.
  isTaskDoneOnDate,
  onClose,
  onSave,
}) {
  const [selectedDay, setSelectedDay] = useState();
  const [selectedSubId, setSelectedSubId] = useState(
    subChallenges.length > 0 ? subChallenges[0].id : null
  );

  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    if (!selectedDay) return;

    // Fallback for legacy or if selection empty (though UI shouldn't allow)
    const subIdToSave = selectedSubId || (subChallenges.length > 0 ? subChallenges[0].id : null);

    setLoading(true);

    const { error } = await supabase
      .from("challenge_checkins")
      .insert({
        user_id: user.id,
        challenge_id: challenge.id,
        date: format(selectedDay, "yyyy-MM-dd"),
        sub_challenge_id: subIdToSave,
      });

    setLoading(false);

    if (!error) {
      onSave(format(selectedDay, "yyyy-MM-dd"));
      onClose();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass bg-[#0f172a] rounded-3xl p-6 w-full max-w-sm space-y-6 border border-white/10 shadow-2xl">
        <h2 className="text-xl font-bold text-white text-center">
          Backfill Check-in
        </h2>

        {/* Sub-challenge Selector */}
        {subChallenges.length > 0 && (
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
              Select Task
            </label>
            <select
              value={selectedSubId || ""}
              onChange={(e) => setSelectedSubId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50"
            >
              {subChallenges.map(sc => (
                <option key={sc.id} value={sc.id} className="bg-slate-900">
                  {sc.title} ({sc.frequency})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-center bg-white/5 rounded-2xl p-4">
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            disabled={[
              { before: new Date(challenge.start_date) },
              { after: new Date(challenge.end_date) },
              { after: new Date() },
              (date) => {
                const dStr = format(date, "yyyy-MM-dd");
                // Parent prop `isTaskDoneOnDate` now acts as "isDisabled"
                // It returns TRUE if check-in is blocked (due to done OR frequency)
                return isTaskDoneOnDate ? isTaskDoneOnDate(dStr, selectedSubId) : false;
              }
            ]}
            modifiersClassNames={{
              selected: "bg-emerald-500 text-white hover:bg-emerald-600 rounded-full",
              today: "text-emerald-400 font-bold border border-emerald-500/50 rounded-full",
              disabled: "text-gray-600 opacity-30 line-through cursor-not-allowed"
            }}
            styles={{
              caption: { color: 'white', fontWeight: 'bold' },
              head_cell: { color: '#94a3b8', fontSize: '0.8rem' },
              day: { color: 'white', fontSize: '0.9rem', margin: '2px' },
              nav_button: { color: 'white', opacity: 0.8 },
              table: { maxWidth: 'none' }
            }}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selectedDay || loading}
            onClick={handleSave}
            className="
              px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 
              text-white text-sm font-bold shadow-lg shadow-emerald-500/20 
              disabled:opacity-50 disabled:cursor-not-allowed transition-all
            "
          >
            {loading ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
