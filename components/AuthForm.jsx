"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import toast from "react-hot-toast";

export default function AuthForm({ onAuthSuccess, defaultMode = "login"}) {
  const { user } = useAuth();
  const [mode, setMode] = useState(defaultMode); // "login" | "signup"

  // login/signup fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // extra signup fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");

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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error(error);
      toast.error("Sign-up failed: " + error.message, toastOptions);
      return;
    }

    if (data?.user) {
      // create profile row
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          user_name: userName,
        },
      ]);
      if (profileError) console.error("Error creating profile:", profileError);
    }

    toast.success("Sign-up successful! Check your email.", toastOptions);
    if (onAuthSuccess) onAuthSuccess();
    setMode("login"); // go back to login after signup
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
      toast.error("Logout failed", toastOptions);
    } else {
      toast.success("Logout successful", toastOptions);
      if (onAuthSuccess) onAuthSuccess();
      router.push("/");
    }
  }

  if (user) {
    return (
      <div>
        <p className="text-black">Logged in as {user.email}</p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 cursor-pointer"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div>
      {mode === "login" ? (
        <form className="flex flex-col gap-2" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-2 py-1 bg-white text-black"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-2 py-1 bg-white text-black"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 cursor-pointer"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </form>
      ) : (
        <form className="flex flex-col gap-2" onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-2 py-1 bg-white text-black"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-2 py-1 bg-white text-black"
            required
          />
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border px-2 py-1 bg-white text-black"
          />
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border px-2 py-1 bg-white text-black"
          />
          <input
            type="text"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="border px-2 py-1 bg-white text-black"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 cursor-pointer"
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
