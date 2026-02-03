"use client";

import Link from "next/link";
import { useHouseholds } from "@/lib/hooks/groceries/useHouseholds";
import { useChallengesList } from "@/lib/hooks/challenges/useChallengesList";
import { useProfile } from "@/lib/hooks/useProfile";

function DashboardCard({ href, title, icon, description, colorClass }) {
    return (
        <Link href={href} className="flex-1 min-w-[300px]">
            <div className={`
        group relative overflow-hidden rounded-3xl p-6 h-48 flex flex-col justify-between
        glass glass-hover transition-all duration-300 border border-white/10
        hover:scale-[1.02]
      `}>
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-40 ${colorClass}`} />

                <div className="relative z-10">
                    <div className="text-4xl mb-4">{icon}</div>
                    <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
                    <p className="text-sm text-gray-400">{description}</p>
                </div>

                <div className="relative z-10 flex items-center text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Open <span className="ml-1">→</span>
                </div>
            </div>
        </Link>
    );
}

export default function Dashboard() {
    const { households, isLoading: householdsLoading } = useHouseholds();
    const { challenges, isLoading: challengesLoading } = useChallengesList();
    const { data: profile } = useProfile();
    const isAdmin = profile?.role === "admin";

    const activeChallengesCount = challenges?.length || 0;
    const householdName = households?.[0]?.name || "Create Household";

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-10 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">My Hub</h1>
                <p className="text-gray-400">Manage your daily life and goals</p>
            </header>

            <div className="flex flex-wrap gap-6">
                <DashboardCard
                    href="/challenges"
                    title="Daily Challenges"
                    icon="🔥"
                    description={`${activeChallengesCount} Active Challenges`}
                    colorClass="bg-orange-500"
                />

                {isAdmin && (
                    <DashboardCard
                        href="/groceries/inventory"
                        title="Groceries"
                        icon="🥦"
                        description={households?.length > 0 ? householdName : "Setup your kitchen"}
                        colorClass="bg-emerald-500"
                    />
                )}
            </div>

            {/* Quick Stats or Widgets can go here later */}
        </div>
    );
}
