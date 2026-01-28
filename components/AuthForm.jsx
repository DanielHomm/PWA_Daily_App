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
      <div className="glass rounded-2xl p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👤</span>
        </div>
        <p className="mb-6 text-gray-300">
          Logged in as <br />
          <strong className="text-white text-lg">{user.email}</strong>
        </p>
        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-red-500/10 border border-red-500/20 py-3 text-red-500 hover:bg-red-500/20 transition-all font-medium"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 relative overflow-hidden group">
      {/* Decorative gradient blob inside card */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-500" />

      <h2 className="mb-6 text-center text-2xl font-bold text-white relative z-10">
        {mode === "login" ? "Login" : "Create Account"}
      </h2>

      <form
        onSubmit={mode === "login" ? handleLogin : handleSignup}
        className="space-y-4 relative z-10"
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
          <div className="animate-fade-in space-y-4">
            <Input label="First name" value={firstName} onChange={setFirstName} />
            <Input label="Last name" value={lastName} onChange={setLastName} />
            <Input label="Username" value={userName} onChange={setUserName} />
          </div>
        )}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 mt-6"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Login"
              : "Sign up"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-400 relative z-10">
        {mode === "login" ? (
          <>
            No account?{" "}
            <button
              onClick={() => setMode("signup")}
              className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setMode("login")}
              className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
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
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-xl border border-white/10
          bg-white/5
          px-4 py-3 text-white
          placeholder-gray-500
          transition-all
          focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20
        "
      />
    </div>
  );
}
