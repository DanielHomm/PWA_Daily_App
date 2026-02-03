"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchChains,
    fetchStores,
    createStore,
    reportPrice,
    getBestPrices
} from "@/lib/data/groceries/pricing.api";

export function usePricing() {
    const queryClient = useQueryClient();

    // 1. Chains (Cached heavily)
    const { data: chains } = useQuery({
        queryKey: ["supermarket_chains"],
        queryFn: async () => {
            const { data } = await fetchChains();
            return data || [];
        },
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });

    // 2. Fetch Best Prices (Helper)
    const useBestPrices = (commonItemId) => useQuery({
        queryKey: ["prices", commonItemId],
        queryFn: () => getBestPrices(commonItemId),
        enabled: !!commonItemId,
    });

    // 3. Mutations
    const addStoreMutation = useMutation({
        mutationFn: createStore,
        onSuccess: () => {
            // Invalidate if needed, or return data
        }
    });

    const reportPriceMutation = useMutation({
        mutationFn: reportPrice,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["prices", variables.commonItemId]);
        }
    });

    return {
        chains: chains || [],
        useBestPrices,
        addStore: addStoreMutation.mutateAsync,
        reportPrice: reportPriceMutation.mutateAsync,
    };
}
