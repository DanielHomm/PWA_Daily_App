"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import toast from "react-hot-toast";

export default function MessageForm({ onMessageAdded }) {
  const { user, profile, loadingUser } = useAuth();
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

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([{ content, user_id: user.id }])
        .select();

      if (error) throw error;

      setContent("");
      toast.success("Message sent!");

      if (data && data.length > 0 && onMessageAdded) {
        onMessageAdded(data[0]);
      }
    } catch (err) {
      console.error("Error inserting message:", err);
      toast.error("Failed to send message");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
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
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 cursor-pointer"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
