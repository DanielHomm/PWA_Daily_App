"use client";

import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

export default function AuthButtons({ onLoginClick, onSignupClick }) {
  const { user, profile, loading } = useAuth();
  const toastOptions = { duration: 2000 };

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
      toast.error("Logout failed", toastOptions);
    } else {
      toast.success("Logout successful", toastOptions);
    }
  }

  return (
    <div className="flex gap-2">
      {user ? (
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 cursor-pointer"
        >
          Logout
        </button>
      ) : (
        <>
          <button
            onClick={onLoginClick}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 cursor-pointer"
          >
            Login
          </button>
          <button
            onClick={onSignupClick}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 cursor-pointer"
          >
            Sign up
          </button>
        </>
      )}
    </div>
  );
}
