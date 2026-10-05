import { Leaf, Syringe, Shield } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Language } from '@/i18n/translations';
import info from '@/data/disease-info.json';

type Entry = {
  name: Record<string, string>;
  symptoms: Record<string, string>;
  treatment: Record<string, string>;
  prevention: Record<string, string>;
};

const T: Record<Language, { symptoms: string; treatment: string; prevention: string }> = {
  en: { symptoms: 'Symptoms', treatment: 'Treatment', prevention: 'Prevention' },
  gu: { symptoms: 'લક્ષણો', treatment: 'ઉપચાર', prevention: 'નિવારણ' },
  hi: { symptoms: 'लक्षण', treatment: 'उपचार', prevention: 'रोकथाम' },
  mr: { symptoms: 'लक्षणे', treatment: 'उपचार', prevention: 'प्रतिबंध' },
  pa: { symptoms: 'ਲੱਛਣ', treatment: 'ਇਲਾਜ', prevention: 'ਰੋਕਥਾਮ' },
  ta: { symptoms: 'அறிகுறிகள்', treatment: 'சிகிச்சை', prevention: 'தடுப்பு' },
};

export default function DiseaseInfoCard({ className }: { className: string }) {
  const { language } = useLanguage();
  const entry = (info as unknown as Record<string, Entry>)[className];
  if (!entry) return null;

  const t = T[language] ?? T.en;
  const pick = (r: Record<string, string>) => r[language] || r.en;

  const sections = [
    { icon: Leaf, title: t.symptoms, text: pick(entry.symptoms) },
    { icon: Syringe, title: t.treatment, text: pick(entry.treatment) },
    { icon: Shield, title: t.prevention, text: pick(entry.prevention) },
  ];

  return (
    <div className="mt-4 rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <p className="text-lg font-bold">{pick(entry.name)}</p>
      <div className="mt-3 space-y-4">
        {sections.map(({ icon: Icon, title, text }) => (
          <div key={title}>
            <p className="flex items-center gap-2 text-xs font-bold uppercase text-[hsl(var(--primary))]">
              <Icon size={14} /> {title}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
                      }
