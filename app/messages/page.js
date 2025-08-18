"use client";

import MessageForm from "../../components/MessageForm";
import MessagesList from "../../components/MessagesList";
import AuthForm from "../../components/AuthForm";
import { useState } from "react";
import { useAuth } from "../../lib/AuthContext";

export default function Home() {
  const [refreshFlag, setRefreshFlag] = useState(false);
    const { user, profile, loading } = useAuth();

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase PWA Messages</h1>

      {/* Always show the Auth form */}
      <AuthForm />

      {/* Only show message form if logged in */}
      {user && (
        <>
          <MessageForm onMessageAdded={() => setRefreshFlag(!refreshFlag)} />
          <MessagesList refreshFlag={refreshFlag} />
        </>
      )}
    </main>
  );
}
