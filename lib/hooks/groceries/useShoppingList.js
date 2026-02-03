"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchShoppingList,
    addShoppingListItem,
    toggleShoppingItem,
    deleteShoppingItem,
    moveItemToInventory
} from "@/lib/data/groceries/shoppingList.api";
import { fetchGroceryCategories } from "@/lib/data/groceries/groceries.api";

export function useShoppingList(householdId) {
    const queryClient = useQueryClient();
    const listKey = ["shopping-list", householdId];
    const inventoryKey = ["inventory", householdId]; // To invalidate inventory on move

    // 1. Categories (reused)
    const { data: categories } = useQuery({
        queryKey: ["grocery_categories"],
        queryFn: async () => {
            const { data } = await fetchGroceryCategories();
            return data || [];
        },
        staleTime: 1000 * 60 * 60,
    });

    // 2. Fetch List
    const {
        data: items,
        isLoading
    } = useQuery({
        queryKey: listKey,
        queryFn: async () => {
            const { data, error } = await fetchShoppingList(householdId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!householdId,
    });

    // 3. Mutations
    const addMutation = useMutation({
        mutationFn: (data) => addShoppingListItem({ ...data, householdId }),
        onSuccess: () => queryClient.invalidateQueries(listKey),
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, isChecked }) => toggleShoppingItem(id, isChecked),
        onSuccess: () => queryClient.invalidateQueries(listKey),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteShoppingItem,
        onSuccess: () => queryClient.invalidateQueries(listKey),
    });

    const moveToInventoryMutation = useMutation({
        mutationFn: ({ id, location }) => moveItemToInventory(id, location),
        onSuccess: () => {
            queryClient.invalidateQueries(listKey);
            queryClient.invalidateQueries(inventoryKey);
        },
    });

    return {
        categories: categories || [],
        items: items || [],
        isLoading,
        addItem: addMutation.mutateAsync,
        toggleItem: toggleMutation.mutateAsync,
        deleteItem: deleteMutation.mutateAsync,
        moveToInventory: moveToInventoryMutation.mutateAsync,
    };
}
