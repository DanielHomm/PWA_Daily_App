"use client";

import { useState, useEffect } from "react";
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

async function joinHouseholdByCode(code) {
    const { data, error } = await supabase.rpc('join_household_by_code', { code: code.toUpperCase() });
    if (error) throw error;
    return data;
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

    // Join Mutation
    const joinMutation = useMutation({
        mutationFn: (code) => joinHouseholdByCode(code),
        onSuccess: () => {
            queryClient.invalidateQueries(["households", user?.id]);
        },
    });

    // State for active selection
    const [activeHouseholdId, setActiveHouseholdId] = useState(null);

    // Sync with Local Storage
    useEffect(() => {
        const stored = localStorage.getItem("activeHouseholdId");
        if (stored && households?.some(h => h.id === stored)) {
            setActiveHouseholdId(stored);
        } else if (households?.length > 0) {
            setActiveHouseholdId(households[0].id);
        }
    }, [households]);

    const switchHousehold = (id) => {
        setActiveHouseholdId(id);
        localStorage.setItem("activeHouseholdId", id);
    };

    const activeHousehold = households?.find(h => h.id === activeHouseholdId) || households?.[0] || null;

    return {
        households: households || [],
        activeHousehold,
        switchHousehold,
        isLoading,
        error,
        createHousehold: createMutation.mutateAsync,
        joinHousehold: joinMutation.mutateAsync,
        isCreating: createMutation.isPending || joinMutation.isPending,
    };
}
