"use client";

import AuthForm from "../../components/AuthForm";

export default function AuthPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-900">
      {/* Background blur */}
      <div className="absolute inset-0 bg-[url('/your-bg.jpg')] bg-cover bg-center blur-sm opacity-30" />

      {/* Overlay to darken */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Centered card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Welcome 👋
        </h1>
        <AuthForm />
      </div>
    </div>
  );
}
