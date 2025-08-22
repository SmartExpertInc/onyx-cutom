"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locales } from '@/locales';

export type Language = 'en' | 'ru' | 'uk' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, defaultValue?: string) => defaultValue || key,
});

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('onyx-language') as Language;
    if (savedLanguage && ['en', 'ru', 'uk', 'es'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('onyx-language', lang);
    // Update document language for accessibility
    document.documentElement.lang = lang;
  };

  const t = (key: string, defaultValue?: string) => {
    // Get the current locale
    const currentLocale = locales[language];
    if (!currentLocale) {
      return defaultValue || key;
    }

    // Split the key by dots to navigate the nested object
    const keys = key.split('.');
    let value: any = currentLocale;

    // Navigate through the nested object
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Key not found, return default value or key
        return defaultValue || key;
      }
    }

    // Return the found value or fallback
    return typeof value === 'string' ? value : (defaultValue || key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}; 