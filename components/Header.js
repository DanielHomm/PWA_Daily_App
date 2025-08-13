"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButtons from "./AuthButtons";
import { useState } from "react";
import AuthForm from "./AuthForm";

export default function Header() {
  const pathname = usePathname();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Messages", href: "/messages" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <header className="w-full bg-slate-800 text-white shadow-md">
      <nav className="max-w-4xl mx-auto flex items-center justify-between p-4">
        <ul className="flex gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`px-3 py-1 rounded hover:bg-slate-700 transition-colors ${
                    isActive ? "bg-slate-700" : ""
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side Auth buttons */}
        <AuthButtons
          onLoginClick={() => setShowLoginForm(true)}
          onSignupClick={() => setShowSignupForm(true)}
        />
      </nav>

      {/* Login Form */}
      {showLoginForm && (
        <div className="p-4 bg-gray-100">
          <AuthForm onAuthSuccess={() => setShowLoginForm(false)} />
          <button
            onClick={() => setShowLoginForm(false)}
            className="mt-2 text-sm underline"
          >
            Close
          </button>
        </div>
      )}

      {/* Signup Form */}
      {showSignupForm && (
        <div className="p-4 bg-gray-100">
          <AuthForm onAuthSuccess={() => setShowSignupForm(false)} />
          <button
            onClick={() => setShowSignupForm(false)}
            className="mt-2 text-sm underline"
          >
            Close
          </button>
        </div>
      )}
    </header>
  );
}
