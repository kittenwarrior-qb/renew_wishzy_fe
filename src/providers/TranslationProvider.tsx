'use client';

import { createContext, useContext, ReactNode } from 'react';

type TranslationContextType = {
  t: (key: string) => string;
  locale: string;
};

const TranslationContext = createContext<TranslationContextType | null>(null);

interface TranslationProviderProps {
  children: ReactNode;
  locale: string;
  messages: Record<string, any>;
}

export function TranslationProvider({ children, locale, messages }: TranslationProviderProps) {
  const t = (key: string): string => {
    const keys = key.split('.');
    let value = messages;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; 
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <TranslationContext.Provider value={{ t, locale }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationProvider');
  }
  return context.t;
}

export function useLocale() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useLocale must be used within a TranslationProvider');
  }
  return context.locale;
}
