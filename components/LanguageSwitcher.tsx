"use client";
import { useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue   } from "./ui/select";

const LanguageSwitcher = () => {
  const { locale, changeLanguage } = useContext(LanguageContext)!;
  const { t } = useTranslation();
  const handleSelectChange = (value: 'en' | 'am') => {
    changeLanguage(value);
  }

  return (
    <>
    <Select onValueChange={handleSelectChange}>
      <SelectTrigger>
        <SelectValue placeholder='Language' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="en">english</SelectItem>
          <SelectItem value="am">amharic</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    </>

  );
};

export default LanguageSwitcher;
