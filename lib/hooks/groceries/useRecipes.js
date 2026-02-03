"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchRecipes,
    fetchRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    addRecipeIngredient,
    deleteRecipeIngredient
} from "@/lib/data/groceries/recipes.api";

export function useRecipes(householdId) {
    const queryClient = useQueryClient();
    const recipesKey = ["recipes", householdId];

    // List
    const { data: recipes, isLoading } = useQuery({
        queryKey: recipesKey,
        queryFn: async () => {
            const { data } = await fetchRecipes(householdId);
            return data || [];
        },
        enabled: !!householdId
    });

    // Mutations
    const createRecipeMutation = useMutation({
        mutationFn: createRecipe,
        onSuccess: () => queryClient.invalidateQueries(recipesKey)
    });

    const deleteRecipeMutation = useMutation({
        mutationFn: deleteRecipe,
        onSuccess: () => queryClient.invalidateQueries(recipesKey)
    });

    return {
        recipes,
        isLoading,
        createRecipe: createRecipeMutation.mutateAsync,
        deleteRecipe: deleteRecipeMutation.mutateAsync
    };
}

export function useRecipeDetail(recipeId) {
    const queryClient = useQueryClient();
    const recipeKey = ["recipe", recipeId];

    const { data: recipe, isLoading } = useQuery({
        queryKey: recipeKey,
        queryFn: async () => {
            const { data } = await fetchRecipe(recipeId);
            return data;
        },
        enabled: !!recipeId
    });

    const updateRecipeMutation = useMutation({
        mutationFn: (updates) => updateRecipe(recipeId, updates),
        onSuccess: () => queryClient.invalidateQueries(recipeKey)
    });

    const addIngredientMutation = useMutation({
        mutationFn: addRecipeIngredient,
        onSuccess: () => queryClient.invalidateQueries(recipeKey)
    });

    const deleteIngredientMutation = useMutation({
        mutationFn: deleteRecipeIngredient,
        onSuccess: () => queryClient.invalidateQueries(recipeKey)
    });

    return {
        recipe,
        isLoading,
        updateRecipe: updateRecipeMutation.mutateAsync,
        addIngredient: addIngredientMutation.mutateAsync,
        deleteIngredient: deleteIngredientMutation.mutateAsync
    };
}
