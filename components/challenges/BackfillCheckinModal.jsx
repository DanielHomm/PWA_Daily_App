"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, isSameDay } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";

export default function BackfillCheckinModal({
  challenge,
  existingDates,
  onClose,
  onSave,
}) {
  const [selectedDay, setSelectedDay] = useState();
  const [loading, setLoading] = useState(false);
  const { user, loading: loadingUser } = useAuth();

  const handleSave = async () => {
    if (!selectedDay) return;

    setLoading(true);

    const { error } = await supabase
      .from("challenge_checkins")
      .insert({
        user_id: user.id,
        challenge_id: challenge.id,
        date: format(selectedDay, "yyyy-MM-dd"),
      });

    setLoading(false);

    if (!error) {
      onSave();
      onClose();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold">
          Check-in nachtragen
        </h2>

        <DayPicker
          mode="single"
          selected={selectedDay}
          onSelect={setSelectedDay}
          disabled={(date) =>
            date < new Date(challenge.start_date) ||
            date > new Date(challenge.end_date) ||
            isSameDay(date, new Date()) ||
            existingDates.some((d) =>
              isSameDay(new Date(d), date)
            )
          }
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded"
          >
            Cancel
          </button>
          <button
            disabled={!selectedDay || loading}
            onClick={handleSave}
            className="px-3 py-1 bg-green-600 text-white rounded disabled:bg-gray-400"
          >
            {loading ? "Saving…" : "Save Check-in"}
          </button>
        </div>
      </div>
    </div>
  );
}
