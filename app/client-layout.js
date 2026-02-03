"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../lib/AuthContext";
import { LanguageProvider } from "../lib/context/LanguageContext";
import Header from "../components/Header";

export default function ClientProviderLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <Header />
          <main className="p-4">{children}</main>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
