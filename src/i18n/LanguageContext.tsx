import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { translations, type Language, type Copy } from './translations';

const LANGUAGE_KEY = 'soil-health-checker-language';
const SUPPORTED: Language[] = ['en', 'gu', 'hi', 'mr', 'pa', 'ta'];

type LanguageContextValue = {
  language: Language;
  copy: Copy;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (saved && SUPPORTED.includes(saved)) return saved;

    const browser = navigator.language.split('-')[0] as Language;
    if (SUPPORTED.includes(browser)) return browser;
  } catch {
    /* storage blocked */
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      /* storage blocked */
    }
    document.documentElement.lang = language;
  }, [language]);

  const handleLanguageChange = (lang: Language) => {
    setLanguageState(lang);
  };

  const value: LanguageContextValue = {
    language,
    copy: translations[language],
    setLanguage: handleLanguageChange,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
