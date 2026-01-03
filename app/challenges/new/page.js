"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";

export default function CreateChallengePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Redirect ONLY in effect
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // ⛔ Block render while loading or redirecting
  if (loading || !user) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!name || !startDate || !endDate) {
      setError("Please fill in all required fields.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date.");
      return;
    }

    setSubmitting(true);

    try {
      const { data: challenge, error: challengeError } = await supabase
        .from("challenges")
        .insert({
          name,
          description: description || null,
          start_date: startDate,
          end_date: endDate,
          created_by: user.id,
        })
        .select()
        .single();

      if (challengeError) throw challengeError;

      const { error: memberError } = await supabase
        .from("challenge_members")
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      router.push(`/challenges/${challenge.id}`);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create a new challenge</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Start date *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">End date *</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create Challenge"}
        </button>
      </form>
    </div>
  );
}
