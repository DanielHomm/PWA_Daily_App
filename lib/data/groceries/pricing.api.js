import { supabase } from "@/lib/supabaseClient";

// --- Pricing API ---

export function fetchChains() {
    return supabase
        .from("supermarket_chains")
        .select("*")
        .order("name");
}

export function fetchStores(chainId) {
    let query = supabase.from("supermarket_stores").select("*");

    if (chainId) {
        query = query.eq("chain_id", chainId);
    }

    return query.order("name");
}

export async function createStore({ name, chainId = null }) {
    const { data, error } = await supabase
        .from("supermarket_stores")
        .insert({
            name,
            chain_id: chainId
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function reportPrice({ commonItemId, storeId, price }) {
    const { data, error } = await supabase
        .from("product_prices")
        .insert({
            common_item_id: commonItemId,
            store_id: storeId,
            price
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getBestPrices(commonItemId) {
    // This helps find the best prices.
    // We will do a raw query or join.
    // For simplicity: Fetch all prices for this item recently (last 30 days) and aggregate in frontend or via RPC.
    // Actually, let's use a simple select with joins for now.

    const { data, error } = await supabase
        .from("product_prices")
        .select(`
       price,
       created_at,
       store:supermarket_stores (
         name,
         chain:supermarket_chains (name, icon)
       )
    `)
        .eq("common_item_id", commonItemId)
        .order("price", { ascending: true })
        .limit(5);

    if (error) throw error;
    return data;
}
