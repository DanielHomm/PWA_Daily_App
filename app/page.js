"use client";
import { useAuth } from "../lib/AuthContext";

export default function HomePage() {
  const { user, profile, loading } = useAuth();

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      {!user ? (
        <p>Welcome to my private app. Maybe more features will follow maybe not, who knows.
          <br />
          Please log in to see the current available features and tabs.</p>
      ) : (
        <p>Welcome back, {user.email}!</p>
      )}
    </main>
  );
}
