"use client";
import { useAuth } from "../lib/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      {!user ? (
        <p>Please log in to continue.</p>
      ) : (
        <p>Welcome back, {user.email}!</p>
      )}
    </main>
  );
}
