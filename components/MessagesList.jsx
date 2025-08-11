'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MessagesList() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function loadMessages() {
      console.log('Fetching messages from Supabase...');
      const { data, error } = await supabase
        .from('messages') // ✅ make sure this matches EXACTLY your table name
        .select('*');

      console.log('Supabase returned:', { data, error });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data);
      }
    }

    loadMessages();
  }, []);

  return (
    <ul>
      {messages.map((msg) => (
        <li key={msg.id}>{msg.content}</li>
      ))}
    </ul>
  );
}
