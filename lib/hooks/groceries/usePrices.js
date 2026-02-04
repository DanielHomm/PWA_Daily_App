"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";

/* ---------------- API Helpers ---------------- */

async function fetchChains() {
    const { data, error } = await supabase
        .from("supermarket_chains")
        .select("*")
        .order("name");

    if (error) throw error;
    return data;
}

async function searchStores(query, chainId = null) {
    if (!query && !chainId) return [];

    let dbQuery = supabase
        .from("supermarket_stores")
        .select("*")
        .limit(20);

    if (chainId) {
        dbQuery = dbQuery.eq("chain_id", chainId);
    }

    if (query) {
        dbQuery = dbQuery.ilike("name", `%${query}%`);
    }

    const { data, error } = await dbQuery;
    if (error) throw error;
    return data;
}

async function addPrice({ common_item_id, store_id, price, user_id }) {
    const { data, error } = await supabase
        .from("product_prices")
        .insert({
            common_item_id,
            store_id,
            price,
            user_id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function createStore({ name, chain_id, user_id }) {
    const { data, error } = await supabase
        .from("supermarket_stores")
        .insert({
            name,
            chain_id,
            created_by: user_id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/* ---------------- Hook ---------------- */

export function usePrices(itemId = null) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch Chains (cache heavily)
    const { data: chains, isLoading: chainsLoading } = useQuery({
        queryKey: ["supermarket_chains"],
        queryFn: fetchChains,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    // Fetch Prices for specific item
    const { data: prices, isLoading: pricesLoading } = useQuery({
        queryKey: ["prices", itemId],
        queryFn: () => fetchItemPrices(itemId),
        enabled: !!itemId,
    });

    // Mutations
    const addPriceMutation = useMutation({
        mutationFn: (params) => addPrice({ ...params, user_id: user?.id }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(["prices", variables.common_item_id]);
        },
    });

    const createStoreMutation = useMutation({
        mutationFn: (params) => createStore({ ...params, user_id: user?.id }),
        onSuccess: () => {
            queryClient.invalidateQueries(["supermarket_stores"]);
        }
    });

    return {
        chains: chains || [],
        chainsLoading,
        prices: prices || [],
        pricesLoading,
        searchStores,
        addPrice: addPriceMutation.mutateAsync,
        createStore: createStoreMutation.mutateAsync,
        isSubmitting: addPriceMutation.isPending || createStoreMutation.isPending
    };
}
