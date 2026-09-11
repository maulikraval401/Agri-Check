import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { LANGUAGES } from '@/i18n/translations';
import { useLanguage } from '@/i18n/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language)!;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 text-sm font-semibold"
        aria-label="Change language"
      >
        <Globe size={16} />
        <span>{current.native}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-[hsl(var(--muted))]"
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold">{lang.native}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {lang.label}
                </span>
              </div>
              {language === lang.code && (
                <Check size={16} className="text-[hsl(var(--primary))]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
        }
