"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";

export default function MessageForm({ onMessageAdded }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;

     setLoading(true);

      // Safety: auto-reset loading after 5s no matter what
    const timeoutId = setTimeout(() => {
        console.warn("Supabase request took too long — resetting form state.");
        setLoading(false);
    }, 5000);

    let data = null;
    let error = null;

    try {
        const result = await supabase
        .from("messages")
        .insert([{ content }])
        .select();

        data = result.data;
        error = result.error;

        if (error) throw error;

        setContent("");

        if (data && data.length > 0 && onMessageAdded) {
        onMessageAdded(data[0]);
        }
    } catch (err) {
        console.error("Error inserting message:", err);
    } finally {
        clearTimeout(timeoutId); // stop the safety timer
        setLoading(false);       // normal reset
    }
    // Clear input
    setContent("");

    // Notify parent to refresh the list
    if (data && data.length > 0 && onMessageAdded) {
        onMessageAdded(data[0]);
    }
  }
  if (!user) return <p>You must log in to post a message.</p>;

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="Write a message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 border border-gray-300 rounded px-3 py-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
