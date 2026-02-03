"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchGroceryCategories,
    fetchInventoryItems,
    addInventoryItem,
    getOrCreateProduct,
    deleteInventoryItem,
    updateInventoryItem
} from "@/lib/data/groceries/groceries.api";

export function useInventory(householdId) {
    const queryClient = useQueryClient();
    const inventoryKey = ["inventory", householdId];

    // 1. Fetch Categories (Global)
    const { data: categories } = useQuery({
        queryKey: ["grocery_categories"],
        queryFn: async () => {
            const { data } = await fetchGroceryCategories();
            return data || [];
        },
        staleTime: 1000 * 60 * 60, // 1 hour (rarely changes)
    });

    // 2. Fetch Inventory
    const {
        data: inventory,
        isLoading,
        error
    } = useQuery({
        queryKey: inventoryKey,
        queryFn: async () => {
            const { data, error } = await fetchInventoryItems(householdId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!householdId,
    });

    // 3. Add Item (Smart: Create Product + Add to Inventory)
    const addItemMutation = useMutation({
        mutationFn: async ({ name, categoryId, location, quantity, unit, expiryDate, commonItemId }) => {
            // A. Ensure Product Exists
            const product = await getOrCreateProduct({ householdId, name, categoryId, commonItemId });

            // B. Add to Inventory
            const { error } = await addInventoryItem({
                householdId,
                productId: product.id,
                location,
                quantity,
                unit,
                expiryDate
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(inventoryKey);
        },
    });

    const deleteItemMutation = useMutation({
        mutationFn: deleteInventoryItem,
        onSuccess: () => queryClient.invalidateQueries(inventoryKey),
    });

    return {
        categories: categories || [],
        inventory: inventory || [],
        isLoading,
        addItem: addItemMutation.mutateAsync,
        deleteItem: deleteItemMutation.mutateAsync,
        isAdding: addItemMutation.isPending,
    };
}
