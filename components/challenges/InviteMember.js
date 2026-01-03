"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function InviteMember({
  challengeId,
  refreshMembers, // new callback from parent
  members,
}) {
  const [username, setUsername] = useState("");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState(null);

  async function handleInvite() {
    if (!username.trim()) return;

    setInviting(true);
    setError(null);

    try {
      // 1️⃣ Find user by username
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, user_name")
        .eq("user_name", username) // use correct column name
        .single();

      if (profileError || !profile) {
        throw new Error("User not found");
      }

      // Prevent duplicates locally
      if (members.some((m) => m.user_id === profile.id)) {
        throw new Error("User already in challenge");
      }

      // 2️⃣ Insert into challenge_members
      const { error: insertError } = await supabase
        .from("challenge_members")
        .insert({
          challenge_id: challengeId,
          user_id: profile.id,
          role: "member",
        });

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("User already in challenge");
        }
        throw insertError;
      }

      // 3️⃣ Refresh members in parent
      if (refreshMembers) {
        await refreshMembers(); // reload from Supabase
      }

      setUsername("");
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Invite by username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-1 border rounded px-2 py-1"
        />
        <button
          onClick={handleInvite}
          disabled={inviting}
          className="px-4 py-1 bg-green-600 text-white rounded"
        >
          {inviting ? "Inviting…" : "Add"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
