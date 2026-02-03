"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMealPlans, createMealPlan, deleteMealPlan } from "@/lib/data/groceries/planner.api";

export function usePlanner(householdId, startDate, endDate) {
    const queryClient = useQueryClient();
    const plannerKey = ["meal_plans", householdId, startDate, endDate];

    const { data: plans, isLoading } = useQuery({
        queryKey: plannerKey,
        queryFn: () => fetchMealPlans(householdId, startDate, endDate),
        enabled: !!householdId && !!startDate && !!endDate,
        keepPreviousData: true, // Smooth transitions between months
    });

    const createPlanMutation = useMutation({
        mutationFn: createMealPlan,
        onSuccess: () => {
            // Invalidate all planner queries for this household
            queryClient.invalidateQueries(["meal_plans", householdId]);
        }
    });

    const deletePlanMutation = useMutation({
        mutationFn: deleteMealPlan,
        onSuccess: () => {
            queryClient.invalidateQueries(["meal_plans", householdId]);
        }
    });

    return {
        plans: plans || [],
        isLoading,
        addMeal: createPlanMutation.mutateAsync,
        removeMeal: deletePlanMutation.mutateAsync
    };
}
