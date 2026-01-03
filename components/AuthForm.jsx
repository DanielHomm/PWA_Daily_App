"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import toast from "react-hot-toast";

export default function AuthForm({ onAuthSuccess, defaultMode = "login" }) {
  const { user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState(defaultMode);

  // login/signup fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // optional signup fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");

  const toastOptions = { duration: 2000 };

  async function handleLogin(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error);
      toast.error("Login failed", toastOptions);
      return;
    }

    toast.success("Login successful", toastOptions);
    onAuthSuccess?.();
    router.push("/");
  }

  async function handleSignup(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || null,
          last_name: lastName || null,
          user_name: userName || null,
        },
      },
    });

    if (error) {
      console.error(error);
      toast.error("Sign-up failed: " + error.message, toastOptions);
      return;
    }

    toast.success("Sign-up successful! Check your email.", toastOptions);
    setMode("login");
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed", toastOptions);
      return;
    }

    toast.success("Logout successful", toastOptions);
    onAuthSuccess?.();
    router.push("/");
  }

  if (user) {
    return (
      <div>
        <p className="text-black">Logged in as {user.email}</p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div>
      {mode === "login" ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border px-2 py-1"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border px-2 py-1"
          />
          <div className="flex gap-2">
            <button className="bg-blue-500 text-white px-3 py-1 rounded">
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Sign up
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="flex flex-col gap-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border px-2 py-1"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border px-2 py-1"
          />
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border px-2 py-1"
          />
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border px-2 py-1"
          />
          <input
            type="text"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="border px-2 py-1"
          />
          <div className="flex gap-2">
            <button className="bg-green-500 text-white px-3 py-1 rounded">
              Sign up
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Back to Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
