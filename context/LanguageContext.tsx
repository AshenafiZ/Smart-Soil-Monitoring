"use client";
import { createContext, useState, useEffect, ReactNode } from "react";

export type Locale = "en" | "am"; 
type LanguageContextType = {
  locale: Locale;
  changeLanguage: (lang: Locale) => void;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const savedLocale = (localStorage.getItem("locale") as Locale) || "en";
    setLocale(savedLocale);
  }, []);

  const changeLanguage = (lang: Locale) => {
    setLocale(lang);
    localStorage.setItem("locale", lang);
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
