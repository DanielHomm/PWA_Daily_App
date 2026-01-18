"use client";

import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchChallengesList,
} from "@/lib/data/challenge/challengesList.queries";
import {
  deleteChallengeById,
} from "@/lib/data/challenge/challengesList.mutations";

export function useChallengesList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: challenges = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["challenges", user?.id],
    queryFn: () => fetchChallengesList(user.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: deleteChallengeById,
    onMutate: async (challengeId) => {
      await queryClient.cancelQueries(["challenges", user?.id]);

      const previous = queryClient.getQueryData(["challenges", user?.id]);

      queryClient.setQueryData(["challenges", user?.id], (old = []) =>
        old.filter((c) => c.id !== challengeId)
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(
        ["challenges", user?.id],
        context.previous
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["challenges", user?.id]);
    },
  });

  return {
    challenges,
    loading: isLoading,
    error,
    deleteChallenge: mutation.mutateAsync,
    isDeleting: mutation.isLoading,
    deletingId: mutation.variables,
  };
}
