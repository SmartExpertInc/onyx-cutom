"use client";

import React, { createContext, useContext, ReactNode } from 'react';

interface LanguageContextType {
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
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
  const t = (key: string, defaultValue?: string) => {
    // For now, just return the default value or the key
    // In a real implementation, you would have proper translation logic
    return defaultValue || key;
  };

  return (
    <LanguageContext.Provider value={{ t }}>
      {children}
    </LanguageContext.Provider>
  );
}; 