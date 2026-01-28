"use client";

import { useAuth } from "../lib/AuthContext";
import { useChallengesList } from "@/lib/hooks/challenges/useChallengesList";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  // Conditionally fetch challenges only if user is logged in
  // Note: the hook handles 'enabled: !!user' internally
  const { challenges, loading } = useChallengesList();

  if (!user) {
    return <LandingPage />;
  }

  // Dashboard View
  const activeChallenges = challenges ? challenges.length : 0;
  const recentChallenges = challenges ? challenges.slice(0, 3) : [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            {getGreeting()}, <span className="text-emerald-400">{user.email?.split('@')[0]}</span>
          </h1>
          <p className="text-gray-400 mt-1">Ready to crush your goals today?</p>
        </div>
        <button
          onClick={() => router.push('/challenges/new')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
        >
          + New Challenge
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Active Challenges"
          value={activeChallenges}
          icon="🔥"
          color="emerald"
        />
        <StatCard
          label="Completed Today"
          value="0"
          sub="(Coming Soon)"
          icon="✅"
          color="blue"
        />
        <StatCard
          label="Current Streak"
          value="0"
          sub="Days"
          icon="⚡"
          color="purple"
        />
      </div>

      {/* Recent Activity / Challenges */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Challenges</h2>
          <Link href="/challenges" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : challenges.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center border-dashed border-2 border-white/10">
            <p className="text-gray-400 mb-4">You don't have any challenges yet.</p>
            <Link href="/challenges/new" className="text-emerald-400 hover:underline">
              Create your first challenge
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentChallenges.map(challenge => (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`}>
                <div className="glass glass-hover rounded-2xl p-5 h-full flex flex-col justify-between group cursor-pointer">
                  <div>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-emerald-400 transition-colors">
                      {challenge.name}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{challenge.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-white/5 px-2 py-1 rounded-lg">
                      {new Date(challenge.start_date).toLocaleDateString()}
                    </span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, sub, color }) {
  const colorStyles = {
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400",
  }[color] || "from-gray-500/20 to-gray-500/5 border-gray-500/20 text-gray-400";

  return (
    <div className={`glass rounded-2xl p-6 border bg-gradient-to-br ${colorStyles} relative overflow-hidden`}>
      <div className="relative z-10">
        <p className="text-sm font-medium text-gray-400 mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{value}</span>
          {sub && <span className="text-xs text-gray-500">{sub}</span>}
        </div>
      </div>
      <div className="absolute top-4 right-4 text-2xl opacity-50 grayscale contrast-200">
        {icon}
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 space-y-8 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500 blur-[80px] opacity-20 rounded-full" />
        <h1 className="relative text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-6">
          Daily App
        </h1>
      </div>

      <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
        Track your habits, challenge your friends, and master your daily routine.
      </p>

      <div className="flex gap-4 pt-4">
        <Link
          href="/auth"
          className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-1"
        >
          Get Started
        </Link>
        <button className="px-8 py-3 glass rounded-full hover:bg-white/10 transition-colors">
          Learn More
        </button>
      </div>
    </div>
  );
}
