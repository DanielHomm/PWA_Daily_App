"use client";

import AuthForm from "../../components/AuthForm";

export default function AuthPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900 z-0" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px]" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 text-gradient">
            Daily App
          </h1>
          <p className="text-gray-400">Welcome back! Please login to continue.</p>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
