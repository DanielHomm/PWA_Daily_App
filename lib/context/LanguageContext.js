"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { dictEn } from "@/lib/i18n/en";
import { dictDe } from "@/lib/i18n/de";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    // Default to german if no preference (user requested app introduction in english and german, might want a default)
    // Actually, let's default to browser locale or 'en'
    const [language, setLanguage] = useState("en");

    useEffect(() => {
        const saved = localStorage.getItem("app_lang");
        if (saved) {
            setLanguage(saved);
        } else {
            // Very basic auto-detection
            const browserLang = navigator.language.split("-")[0];
            if (browserLang === 'de') setLanguage('de');
        }
    }, []);

    const toggleLanguage = () => {
        const newLang = language === "en" ? "de" : "en";
        setLanguage(newLang);
        localStorage.setItem("app_lang", newLang);
    };

    const t = (key) => {
        const dict = language === "de" ? dictDe : dictEn;
        return dict[key] || key; // Fallback to key if missing
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
