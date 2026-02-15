"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useProfile } from "@/lib/hooks/useProfile";
import { useLanguage } from "@/lib/context/LanguageContext";
import AuthButtons from "./AuthButtons";
import AuthForm from "./AuthForm";
import { Menu, X, Globe } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();
  const [authMode, setAuthMode] = useState(null); // "login" | "signup" | null
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();

  const { data: profile } = useProfile();
  const isAdmin = profile?.role === "admin";

  // Base nav items
  const navItems = [
    { name: t("dashboard"), href: "/dashboard" },
    { name: t("challenges"), href: "/challenges" },
  ];

  if (isAdmin) {
    navItems.push({ name: "Admin", href: "/admin" });
    navItems.push({ name: "Goals", href: "/admin/goals" });
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
          <Link href="/" className="text-lg font-bold flex items-center gap-2">
            <Image src="/icons/FrugalFridge-no_bg.png" width={40} height={40} alt="FrugalFridge Logo" priority />
            <span>Challenge App</span>
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
                  className={`px-3 py-1 rounded hover:bg-slate-700 transition-colors ${isActive ? "bg-slate-700" : ""
                    }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Language Toggle (Desktop) */}
        <button
          onClick={toggleLanguage}
          className="hidden sm:flex items-center gap-1 mx-4 text-sm font-mono text-gray-300 hover:text-white"
        >
          <Globe size={16} />
          {language === 'en' ? 'EN' : 'DE'}
        </button>

        {/* Desktop Auth Buttons */}
        <div className="hidden sm:block">
          <AuthButtons
            onLoginClick={() => setAuthMode("login")}
            onSignupClick={() => setAuthMode("signup")}
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
                className={`block px-3 py-2 rounded hover:bg-slate-600 ${isActive ? "bg-slate-600" : ""
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
          {/* Language Toggle (Mobile) */}
          <button
            onClick={() => {
              toggleLanguage();
              setMobileOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 rounded hover:bg-slate-600 text-left"
          >
            <Globe size={16} />
            {language === 'en' ? 'English' : 'Deutsch'} ({language.toUpperCase()})
          </button>

          {/* Auth Buttons for Mobile */}
          <div className="pt-2 border-t border-slate-500">
            <AuthButtons
              onLoginClick={() => {
                setAuthMode("login");
                setMobileOpen(false);
              }}
              onSignupClick={() => {
                setAuthMode("signup");
                setMobileOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Auth Form (single entry point) */}
      {authMode && (
        <div className="p-4 bg-gray-100">
          <AuthForm
            onAuthSuccess={() => setAuthMode(null)}
            defaultMode={authMode}
          />
          <button
            onClick={() => setAuthMode(null)}
            className="mt-2 text-sm underline"
          >
            Close
          </button>
        </div>
      )}
    </header>
  );
}
