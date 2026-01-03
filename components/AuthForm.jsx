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
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error("Login failed");
      return;
    }

    toast.success("Welcome back!");
    onAuthSuccess?.();
    router.push("/");
  }

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);

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

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created! Check your email.");
    setMode("login");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/");
  }

  if (user) {
    return (
      <div className="rounded-xl border bg-white dark:bg-zinc-900 p-6 shadow">
        <p className="mb-4 text-sm text-zinc-700 dark:text-zinc-300">
          Logged in as <strong>{user.email}</strong>
        </p>
        <button
          onClick={handleLogout}
          className="w-full rounded-lg bg-red-500 py-2 text-white hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border bg-white dark:bg-zinc-900 p-8 shadow-lg">
      <h2 className="mb-6 text-center text-2xl font-semibold text-zinc-900 dark:text-white">
        {mode === "login" ? "Login" : "Create Account"}
      </h2>

      <form
        onSubmit={mode === "login" ? handleLogin : handleSignup}
        className="space-y-4"
      >
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />

        {mode === "signup" && (
          <>
            <Input label="First name" value={firstName} onChange={setFirstName} />
            <Input label="Last name" value={lastName} onChange={setLastName} />
            <Input label="Username" value={userName} onChange={setUserName} />
          </>
        )}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Login"
            : "Sign up"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        {mode === "login" ? (
          <>
            No account?{" "}
            <button
              onClick={() => setMode("signup")}
              className="font-medium text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setMode("login")}
              className="font-medium text-blue-600 hover:underline"
            >
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Reusable Input ---------- */

function Input({ label, type = "text", value, onChange, required }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-lg border border-zinc-300 dark:border-zinc-700
          bg-white dark:bg-zinc-800
          px-3 py-2 text-zinc-900 dark:text-white
          placeholder-zinc-400
          focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
        "
      />
    </div>
  );
}
