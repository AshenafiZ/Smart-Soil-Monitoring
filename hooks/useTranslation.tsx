import { useContext } from "react";
import en from "@/public/locales/en.json";
import am from "@/public/locales/am.json";
import { LanguageContext, Locale } from "@/context/LanguageContext";


const translations: Record<Locale, typeof en> = { en, am };

const getNestedValue = (obj: any, path: string): string => {
  return path.split(".").reduce((acc, key) => acc?.[key], obj) || path;
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }

  const { locale } = context;
  return {
    t: (key: string) => getNestedValue(translations[locale], key),
  };
};
