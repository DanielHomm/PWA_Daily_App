"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MessagesList({ refreshFlag }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function fetchMessages() {
      console.log("Fetching messages from Supabase...");
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
      } else {
        setMessages(data);
      }
    }

    fetchMessages();
  }, [refreshFlag]);

  return (
    <ul className="space-y-2">
      {messages.map((msg) => (
        <li key={msg.id} className="border p-2 rounded">
          {msg.content}
        </li>
      ))}
    </ul>
  );
}
