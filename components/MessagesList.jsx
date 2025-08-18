"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import toast from "react-hot-toast";

export default function MessagesList({ refreshFlag }) {
  const { user, profile, loading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetchMessages();
  }, [refreshFlag]);

  async function fetchMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to fetch messages");
    } else {
      setMessages(data);
    }
  }

  async function handleDelete(id) {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // ensures you can only delete your own

    if (error) {
      console.error(error);
      toast.error("Failed to delete");
    } else {
      toast.success("Message deleted");
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  }

  async function handleEdit(id) {
    const { error } = await supabase
      .from("messages")
      .update({ content: editContent })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      toast.error("Failed to update");
    } else {
      toast.success("Message updated");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, content: editContent } : m
        )
      );
      setEditingId(null);
      setEditContent("");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="border p-2 rounded flex justify-between items-center"
        >
          {editingId === msg.id ? (
            <input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="border px-2 py-1 flex-1 mr-2"
            />
          ) : (
            <span>{msg.content}</span>
          )}

          {user && user.id === msg.user_id && (
            <div className="flex gap-2">
              {editingId === msg.id ? (
                <>
                  <button
                    onClick={() => handleEdit(msg.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditingId(msg.id);
                      setEditContent(msg.content);
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 cursor-pointer"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
