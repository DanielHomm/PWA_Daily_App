"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ShareModal({ listId, onClose }) {
  const [username, setUsername] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchCollaborators();
  }, []);

  async function fetchCollaborators() {
    const { data, error } = await supabase
      .from("shopping_list_collaborators")
      .select(`
        id,
        role,
        profiles (id, first_name, last_name, user_name)
      `)
      .eq("shopping_list_id", listId);

    if (error) {
      console.error(error);
    } else {
      setCollaborators(data || []);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    // Find user by username
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_name", username.trim())
      .single();

    if (profileError || !profile) {
      setErrorMsg("User not found");
      setLoading(false);
      return;
    }

    // Add collaborator
    const { error: insertError } = await supabase
      .from("shopping_list_collaborators")
      .insert({
        shopping_list_id: listId,
        profile_id: profile.id,
        role: "editor", // default role
      });

    if (insertError) {
      setErrorMsg(insertError.message);
    } else {
      setUsername("");
      fetchCollaborators();
      onClose();
    }
    setLoading(false);
  }

  async function handleRemove(collabId) {
    const { error } = await supabase
      .from("shopping_list_collaborators")
      .delete()
      .eq("id", collabId);

    if (error) {
      console.error(error);
    } else {
      fetchCollaborators();
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Share this List</h2>

        {/* Invite form */}
        <form onSubmit={handleInvite} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 cursor-pointer"
          >
            Invite
          </button>
        </form>

        {errorMsg && <p className="text-red-600 mb-2">{errorMsg}</p>}

        {/* List collaborators */}
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {collaborators.map((c) => (
            <li
              key={c.id}
              className="flex justify-between items-center border rounded px-3 py-2"
            >
              <div>
                <span className="font-medium">
                  {c.profiles.first_name} {c.profiles.last_name}
                </span>{" "}
                <span className="text-sm text-gray-600">
                  ({c.profiles.user_name})
                </span>
                <div className="text-xs text-gray-500">Role: {c.role}</div>
              </div>
              <button
                onClick={() => handleRemove(c.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        {/* Close */}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}
