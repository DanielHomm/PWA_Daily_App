"use client"; // ✅ good

import { useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import ShoppingListForm from "../../components/ShoppingListForm";
import ShoppingLists from "../../components/ShoppingLists";
import ProtectedRoute from "@/components/ProtectedRoute";
import { syncItemsFromSupabase, syncShoppingListsFromSupabase } from "../../lib/localDB"; // ✅ now works

export default function ShoppingListsPage() {
  const [refreshFlag, setRefreshFlag] = useState(false);
  const { user } = useAuth();

  const syncAll = async () => {
    if (!user) return;
    try {
      await Promise.all([
        syncItemsFromSupabase(),
        syncShoppingListsFromSupabase(user.id),
      ]);
      console.log("Synced items + shopping lists");
    } catch (err) {
      console.error("Failed to sync:", err);
    }
  };

  useEffect(() => {
    syncAll();
  }, [user, refreshFlag]);

  useEffect(() => {
    const handleOnline = () => {
      console.log("Network back online, syncing items...");
      syncItems();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [user]);

  return (
    <ProtectedRoute>
      <main className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Shopping Lists</h1>

        {user && (
          <>
            <ShoppingListForm onListAdded={() => setRefreshFlag(!refreshFlag)} />
            <ShoppingLists refreshFlag={refreshFlag} />
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
