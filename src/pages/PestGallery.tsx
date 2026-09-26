import { Link } from 'wouter';
import { ArrowLeft, Bug, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Language } from '@/i18n/translations';
import pestsData from '@/data/pests-detailed.json';

type CropKey = keyof typeof pestsData;

const T: Record<Language, { title: string; subtitle: string; back: string; diseases: string }> = {
  en: { title: 'Pest & Disease Gallery', subtitle: 'Browse common diseases and pests by crop', back: 'Back', diseases: 'diseases' },
  gu: { title: 'જીવાત અને રોગ ગેલેરી', subtitle: 'પાક પ્રમાણે સામાન્ય રોગો અને જીવાતો જુઓ', back: 'પાછળ', diseases: 'રોગો' },
  hi: { title: 'कीट और रोग गैलरी', subtitle: 'फसल के अनुसार सामान्य रोग और कीट देखें', back: 'पीछे', diseases: 'रोग' },
  mr: { title: 'कीड आणि रोग गॅलरी', subtitle: 'पिकानुसार सामान्य रोग आणि कीड पहा', back: 'मागे', diseases: 'रोग' },
  pa: { title: 'ਕੀੜੇ ਅਤੇ ਰੋਗ ਗੈਲਰੀ', subtitle: 'ਫਸਲ ਅਨੁਸਾਰ ਆਮ ਰੋਗ ਅਤੇ ਕੀੜੇ ਵੇਖੋ', back: 'ਪਿੱਛੇ', diseases: 'ਰੋਗ' },
  ta: { title: 'பூச்சி மற்றும் நோய் காட்சியகம்', subtitle: 'பயிர் வாரியாக பொதுவான நோய்கள் மற்றும் பூச்சிகளைப் பாருங்கள்', back: 'பின்', diseases: 'நோய்கள்' },
};

export default function PestGallery() {
  const { language } = useLanguage();
  const t = T[language] ?? T.en;
  const crops = Object.entries(pestsData) as [CropKey, typeof pestsData.cotton][];

  return (
    <div className="page-enter">
      <Link
        href="/disease"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))] no-underline"
      >
        <ArrowLeft size={16} /> {t.back}
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))]">
          <Bug size={24} />
        </span>
        <div>
          <p className="eyebrow">Browse</p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-.03em]">{t.title}</h1>
        </div>
      </div>

      <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">{t.subtitle}</p>

      <div className="mt-6 grid gap-3">
        {crops.map(([key, crop]) => {
          const cropName = crop.name[language] || crop.name.en;
          const count = crop.diseases.length;
          return (
            <Link
              key={key}
              href={`/pests/${key}`}
              className="flex items-center gap-4 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4 no-underline shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--secondary)/.3)] text-3xl">
                {crop.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-[hsl(var(--foreground))]">{cropName}</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {count} {t.diseases}
                </p>
              </div>
              <ChevronRight size={20} className="shrink-0 text-[hsl(var(--muted-foreground))]" />
            </Link>
          );
        })}
      </div>
    </div>
  );
            }
