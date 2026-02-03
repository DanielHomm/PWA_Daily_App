"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import GroceriesNav from "@/components/groceries/GroceriesNav";

export default function GroceriesLayout({ children }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#0f172a] text-white pb-24">
                {children}
                <GroceriesNav />
            </div>
        </ProtectedRoute>
    );
}
