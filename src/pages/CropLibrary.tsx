import { Link } from 'wouter';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Language } from '@/i18n/translations';
import cropsData from '@/data/crops-detailed.json';

type CropKey = keyof typeof cropsData;

const T: Record<Language, { title: string; subtitle: string; conditions: string }> = {
  en: { title: 'Crops', subtitle: 'Learn about your crop — conditions, diseases, pests and tips', conditions: 'conditions' },
  gu: { title: 'ફસલો', subtitle: 'તમારા પાક વિશે જાણો — વૃદ્ધિ શરતો, રોગો, જીવાતો અને સૂચનો', conditions: 'શરતો' },
  hi: { title: 'फसलें', subtitle: 'अपनी फसल के बारे में जानें — बढ़ने की शर्तें, रोग, कीट और सुझाव', conditions: 'शर्तें' },
  mr: { title: 'पिके', subtitle: 'तुमच्या पिकाबद्दल जाणून घ्या — वाढीच्या अटी, रोग, कीड आणि टिप्स', conditions: 'अटी' },
  pa: { title: 'ਫਸਲਾਂ', subtitle: 'ਆਪਣੀ ਫਸਲ ਬਾਰੇ ਜਾਣੋ — ਵਾਧੇ ਦੀਆਂ ਸ਼ਰਤਾਂ, ਰੋਗ, ਕੀੜੇ ਅਤੇ ਸੁਝਾਅ', conditions: 'ਸ਼ਰਤਾਂ' },
  ta: { title: 'பயிர்கள்', subtitle: 'உங்கள் பயிரைப் பற்றி அறிக — வளர்ச்சி நிலைமைகள், நோய்கள், பூச்சிகள் மற்றும் குறிப்புகள்', conditions: 'நிலைமைகள்' },
};

export default function CropLibrary() {
  const { language } = useLanguage();
  const t = T[language] ?? T.en;
  const crops = Object.entries(cropsData) as [CropKey, typeof cropsData.cotton][];

  return (
    <div className="page-enter">
      <p className="eyebrow">10 / crop library</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.05em]">{t.title}</h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{t.subtitle}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {crops.map(([key, crop]) => {
          const name = crop.name[language] || crop.name.en;
          return (
            <Link
              key={key}
              href={`/crops/${key}`}
              className="group flex flex-col items-center gap-3 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4 no-underline shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5"
            >
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[hsl(var(--secondary)/.3)] text-4xl">
                {crop.emoji}
              </span>
              <span className="text-center text-sm font-bold text-[hsl(var(--foreground))]">
                {name}
              </span>
              <span className="text-[.65rem] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                {crop.duration} days
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
    }
