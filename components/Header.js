"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AuthButtons from "./AuthButtons";
import AuthForm from "./AuthForm";
import { Menu, X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Messages", href: "/messages" },
    { name: "Profile", href: "/profile" },
  ];

  function closeAuthForms() {
    setShowLoginForm(false);
    setShowSignupForm(false);
  }

  return (
    <header className="w-full bg-slate-800 text-white shadow-md">
      <nav className="max-w-4xl mx-auto flex items-center justify-between p-4">
        {/* Left side: Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button
            className="sm:hidden p-2 hover:bg-slate-700 rounded"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>

          {/* Logo */}
          <Link href="/" className="text-lg font-bold">
            Supabase PWA
          </Link>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden sm:flex gap-4">
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

        {/* Desktop Auth Buttons */}
        <div className="hidden sm:block">
          <AuthButtons
            onLoginClick={() => setShowLoginForm(true)}
            onSignupClick={() => setShowSignupForm(true)}
          />
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="sm:hidden bg-slate-700 px-4 py-2 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded hover:bg-slate-600 ${
                  isActive ? "bg-slate-600" : ""
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          {/* Auth Buttons for Mobile */}
          <div className="pt-2 border-t border-slate-500">
            <AuthButtons
              onLoginClick={() => {
                setShowLoginForm(true);
                setMobileOpen(false);
              }}
              onSignupClick={() => {
                setShowSignupForm(true);
                setMobileOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Login Form */}
      {showLoginForm && (
        <div className="p-4 bg-gray-100">
          <AuthForm onAuthSuccess={closeAuthForms} />
          <button
            onClick={closeAuthForms}
            className="mt-2 text-sm underline"
          >
            Close
          </button>
        </div>
      )}

      {/* Signup Form */}
      {showSignupForm && (
        <div className="p-4 bg-gray-100">
          <AuthForm onAuthSuccess={closeAuthForms} />
          <button
            onClick={closeAuthForms}
            className="mt-2 text-sm underline"
          >
            Close
          </button>
        </div>
      )}
    </header>
  );
}
