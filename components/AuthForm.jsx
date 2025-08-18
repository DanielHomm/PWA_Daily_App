"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import toast from "react-hot-toast";

export default function AuthForm({ onAuthSuccess }) {
  const { user, profile, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const toastOptions = { duration: 2000 };

  async function handleLogin(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error(error);
      toast.error("Login failed", toastOptions);
    } else {
      toast.success("Login successful", toastOptions);
      if (onAuthSuccess) onAuthSuccess();
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error(error);
      toast.error("Sign-up failed: " + error.message, toastOptions);
    } else {
      toast.success("Sign-up successful! Check your email.", toastOptions);
      if (onAuthSuccess) onAuthSuccess();
    }

    if (!error && data?.user) {
        await supabase.from("profiles").insert([
        { id: data.user.id, email: data.user.email }
  ]);
}
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
      toast.error("Logout failed", toastOptions);
    } else {
      toast.success("Logout successful", toastOptions);
      if (onAuthSuccess) onAuthSuccess();
    }
  }

  return (
    <div>
      {user ? (
        <div>
          <p className="text-black">Logged in as {user.email}</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 cursor-pointer"
          >
            Logout
          </button>
        </div>
      ) : (
        <form className="flex flex-col gap-2" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-2 py-1 bg-white text-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-2 py-1 bg-white text-black"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
              type="button"
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
