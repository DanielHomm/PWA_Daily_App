"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, user, router]);

  if (loading) {
    return <p className="p-4">Checking authentication…</p>;
  }

  if (!user) {
    return <p className="p-4">Redirecting…</p>;
  }

  return children;
}
