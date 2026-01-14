"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 Minuten Cache
  });
}
