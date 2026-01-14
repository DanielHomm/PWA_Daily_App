"use client";

import { useAuth } from "../AuthContext";
import { supabase } from "../supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useChallenges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ✅ Fetch Challenges
  const { data: challenges = [], isLoading, error, refetch } = useQuery({
    queryKey: ["challenges", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("challenge_members")
        .select(`
          role,
          challenges (
            id,
            name,
            description,
            created_at
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { foreignTable: "challenges", ascending: false });

      if (error) throw error;

      return data.map((row) => ({
        ...row.challenges,
        userRole: row.role,
      }));
    },
    enabled: !!user,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  });

  // ✅ Delete Challenge
  const mutation = useMutation({
    mutationFn: async (challengeId) => {
      const { error } = await supabase
        .from("challenges")
        .delete()
        .eq("id", challengeId);
      if (error) throw error;
      return challengeId;
    },
    onMutate: async (challengeId) => {
      await queryClient.cancelQueries(["challenges", user?.id]);
      const previous = queryClient.getQueryData(["challenges", user?.id]);
      queryClient.setQueryData(["challenges", user?.id], (old = []) =>
        old.filter((c) => c.id !== challengeId)
      );
      return { previous };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(["challenges", user?.id], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["challenges", user?.id]);
    },
  });

  return {
    challenges,
    loading: isLoading,
    error,
    refetch,
    deleteChallenge: mutation.mutateAsync,
  };
}
