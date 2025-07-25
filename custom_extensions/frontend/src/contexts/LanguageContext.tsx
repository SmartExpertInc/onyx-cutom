"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locales } from '../locales';

export type Language = 'en' | 'ru' | 'uk' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  locale: any; // Using any for now to avoid complex type issues
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

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

  // Get current locale
  const locale = locales[language] || locales.en;

  // Enhanced translation function that uses locale files
  const t = (key: string, fallback?: string): string => {
    // Split the key by dots to navigate nested objects
    const keys = key.split('.');
    let value: any = locale;
    
    // Navigate through the nested object structure
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // If key not found, return fallback or the original key
        return fallback || key;
      }
    }
    
    // If we found a string value, return it
    if (typeof value === 'string') {
      return value;
    }
    
    // If not a string, return fallback or key
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, locale }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 