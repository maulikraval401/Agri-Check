import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import schemes from '@/data/schemes.json';

export default function SchemesPage() {
  const { copy, language } = useLanguage();

  return (
    <div className="page-enter">
      <p className="eyebrow">07 / schemes</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.05em]">{copy.schemes}</h1>

      <div className="mt-6 grid gap-3">
        {schemes.map((s) => {
          const name =
            language === 'gu' ? s.nameGu : language === 'hi' ? s.nameHi : s.name;
          const benefit =
            language === 'gu'
              ? s.benefitGu
              : language === 'hi'
                ? s.benefitHi
                : s.benefit;
          return (
            <div
              key={s.name}
              className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4"
            >
              <h3 className="font-bold">{name}</h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {benefit}
              </p>
              
                href={s.apply}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[hsl(var(--primary)/.09)] px-3 text-sm font-bold text-[hsl(var(--primary))]"
              >
                Apply <ExternalLink size={14} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
