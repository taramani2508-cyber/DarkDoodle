import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { LANGUAGES } from '../constants';

interface LanguageContextType {
  language: Language;
  userEmail: string | null;
  setLanguage: (lang: Language) => void;
  setUserEmail: (email: string) => void;
  isInitial: boolean;
  completeInitial: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('darkdoddle_lang');
    if (saved) {
      const found = LANGUAGES.find(l => l.code === saved);
      if (found) return found;
    }
    return LANGUAGES[0]; // Default Telugu
  });

  const [userEmail, setUserEmailState] = useState<string | null>(() => {
    return localStorage.getItem('darkdoddle_email');
  });

  const [isInitial, setIsInitial] = useState(() => {
    return !localStorage.getItem('darkdoddle_email') || !localStorage.getItem('darkdoddle_lang');
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('darkdoddle_lang', lang.code);
  };

  const setUserEmail = (email: string) => {
    setUserEmailState(email);
    localStorage.setItem('darkdoddle_email', email);
  };

  const completeInitial = () => {
    setIsInitial(false);
  };

  return (
    <LanguageContext.Provider value={{ language, userEmail, setLanguage, setUserEmail, isInitial, completeInitial }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
