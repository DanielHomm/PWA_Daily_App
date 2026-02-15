"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session load
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        console.log('AuthContext: Session found', session.user.email);
        setUser(session.user);
      } else {
        console.log('AuthContext: No session found');
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthContext: Auth change', _event, session?.user?.email);
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
