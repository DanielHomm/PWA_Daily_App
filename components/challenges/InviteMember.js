"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function InviteMember({
  challengeId,
  refreshMembers,
  members = [], // default to empty array
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
        .eq("user_name", username)
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
        await refreshMembers();
      }

      setUsername("");
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Invite by username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="
             flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 
             text-white placeholder-gray-500 text-sm
             focus:outline-none focus:border-emerald-500/50 focus:bg-white/10
             transition-all
          "
        />
        <button
          onClick={handleInvite}
          disabled={inviting}
          className="
            px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400
            border border-emerald-500/20 rounded-xl text-sm font-medium
            disabled:opacity-50 transition-colors
          "
        >
          {inviting ? "..." : "+ Add"}
        </button>
      </div>

      {error && <p className="text-xs text-red-400 mt-2 ml-1">{error}</p>}
    </div>
  );
}
