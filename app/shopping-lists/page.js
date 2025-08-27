"use client";

import { useState } from "react";
import AuthForm from "../../components/AuthForm";
import { useAuth } from "../../lib/AuthContext";
import ShoppingListForm from "../../components/ShoppingListForm";
import ShoppingLists from "../../components/ShoppingLists";

export default function ShoppingListsPage() {
  const [refreshFlag, setRefreshFlag] = useState(false);
  const { user } = useAuth();

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shopping Lists</h1>

      {/* Always show Auth */}
      <AuthForm />

      {/* Only show lists if logged in */}
      {user && (
        <>
          <ShoppingListForm onListAdded={() => setRefreshFlag(!refreshFlag)} />
          <ShoppingLists refreshFlag={refreshFlag} />
        </>
      )}
    </main>
  );
}
