"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";

/* ---------------- API Helpers ---------------- */

async function fetchMyHouseholds(userId) {
    const { data, error } = await supabase
        .from("households")
        .select(`
      *,
      household_members!inner (role, user_id)
    `)
        .eq("household_members.user_id", userId);

    if (error) throw error;
    return data;
}

async function createHousehold({ name, userId }) {
    // 1. Create Household
    const { data: household, error: hError } = await supabase
        .from("households")
        .insert({ name, created_by: userId })
        .select()
        .single();

    if (hError) throw hError;

    // 2. Add creator as Admin
    const { error: mError } = await supabase
        .from("household_members")
        .insert({
            household_id: household.id,
            user_id: userId,
            role: 'admin'
        });

    if (mError) throw mError;
    return household;
}

/* ---------------- Hook ---------------- */

export function useHouseholds() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch all households I belong to
    const { data: households, isLoading, error } = useQuery({
        queryKey: ["households", user?.id],
        queryFn: () => fetchMyHouseholds(user.id),
        enabled: !!user,
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: (name) => createHousehold({ name, userId: user.id }),
        onSuccess: () => {
            queryClient.invalidateQueries(["households", user?.id]);
        },
    });

    // For now, simple selection: fetch the first one or null
    // In future, store "selectedHouseholdId" in local storage
    const activeHousehold = households?.[0] || null;

    return {
        households: households || [],
        activeHousehold,
        isLoading,
        error,
        createHousehold: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
    };
}
