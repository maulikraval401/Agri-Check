import { Link, useRoute } from 'wouter';
import { ArrowLeft, Thermometer, Droplets, FlaskConical, Calendar, Bug, Leaf, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Language } from '@/i18n/translations';
import cropsData from '@/data/crops-detailed.json';

type CropKey = keyof typeof cropsData;

const T: Record<Language, Record<string, string>> = {
  en: {
    back: 'Back',
    conditions: 'Growth Conditions',
    temperature: 'Temperature',
    rainfall: 'Rainfall',
    soil: 'Soil type',
    ph: 'pH range',
    timing: 'Sowing & Harvest',
    sowing: 'Sowing',
    harvest: 'Harvest',
    duration: 'Duration',
    days: 'days',
    diseases: 'Common Diseases',
    pests: 'Common Pests',
    tips: 'Farming Tips',
    notFound: 'Crop not found',
  },
  gu: {
    back: 'પાછળ',
    conditions: 'વૃદ્ધિ શરતો',
    temperature: 'તાપમાન',
    rainfall: 'વરસાદ',
    soil: 'માટીનો પ્રકાર',
    ph: 'pH રેન્જ',
    timing: 'વાવેતર અને લણણી',
    sowing: 'વાવેતર',
    harvest: 'લણણી',
    duration: 'અવધિ',
    days: 'દિવસ',
    diseases: 'સામાન્ય રોગો',
    pests: 'સામાન્ય જીવાતો',
    tips: 'ખેતીની ટિપ્સ',
    notFound: 'પાક મળ્યો નથી',
  },
  hi: {
    back: 'पीछे',
    conditions: 'बढ़ने की शर्तें',
    temperature: 'तापमान',
    rainfall: 'बारिश',
    soil: 'मिट्टी का प्रकार',
    ph: 'pH रेंज',
    timing: 'बुवाई और कटाई',
    sowing: 'बुवाई',
    harvest: 'कटाई',
    duration: 'अवधि',
    days: 'दिन',
    diseases: 'सामान्य रोग',
    pests: 'सामान्य कीट',
    tips: 'खेती के टिप्स',
    notFound: 'फसल नहीं मिली',
  },
  mr: {
    back: 'मागे',
    conditions: 'वाढीच्या अटी',
    temperature: 'तापमान',
    rainfall: 'पाऊस',
    soil: 'मातीचा प्रकार',
    ph: 'pH श्रेणी',
    timing: 'पेरणी आणि कापणी',
    sowing: 'पेरणी',
    harvest: 'कापणी',
    duration: 'कालावधी',
    days: 'दिवस',
    diseases: 'सामान्य रोग',
    pests: 'सामान्य कीड',
    tips: 'शेती टिप्स',
    notFound: 'पीक सापडले नाही',
  },
  pa: {
    back: 'ਪਿੱਛੇ',
    conditions: 'ਵਾਧੇ ਦੀਆਂ ਸ਼ਰਤਾਂ',
    temperature: 'ਤਾਪਮਾਨ',
    rainfall: 'ਬਾਰਿਸ਼',
    soil: 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ',
    ph: 'pH ਰੇਂਜ',
    timing: 'ਬਿਜਾਈ ਅਤੇ ਵਾਢੀ',
    sowing: 'ਬਿਜਾਈ',
    harvest: 'ਵਾਢੀ',
    duration: 'ਅਵਧੀ',
    days: 'ਦਿਨ',
    diseases: 'ਆਮ ਰੋਗ',
    pests: 'ਆਮ ਕੀੜੇ',
    tips: 'ਖੇਤੀ ਟਿਪਸ',
    notFound: 'ਫਸਲ ਨਹੀਂ ਮਿਲੀ',
  },
  ta: {
    back: 'பின்',
    conditions: 'வளர்ச்சி நிலைமைகள்',
    temperature: 'வெப்பநிலை',
    rainfall: 'மழை',
    soil: 'மண் வகை',
    ph: 'pH வரம்பு',
    timing: 'விதைப்பு & அறுவடை',
    sowing: 'விதைப்பு',
    harvest: 'அறுவடை',
    duration: 'காலம்',
    days: 'நாட்கள்',
    diseases: 'பொதுவான நோய்கள்',
    pests: 'பொதுவான பூச்சிகள்',
    tips: 'விவசாய குறிப்புகள்',
    notFound: 'பயிர் கிடைக்கவில்லை',
  },
};

export default function CropDetail() {
  const { language } = useLanguage();
  const t = T[language] ?? T.en;
  const [, params] = useRoute('/crops/:id');
  const cropId = params?.id as CropKey | undefined;
  const crop = cropId ? cropsData[cropId] : null;

  if (!crop) {
    return (
      <div className="page-enter">
        <Link href="/crops" className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))] no-underline">
          <ArrowLeft size={16} /> {t.back}
        </Link>
        <p className="mt-6 text-sm text-[hsl(var(--muted-foreground))]">{t.notFound}</p>
      </div>
    );
  }

  const name = crop.name[language] || crop.name.en;
  const soil = crop.conditions.soil[language] || crop.conditions.soil.en;
  const sowing = crop.sowing[language] || crop.sowing.en;
  const harvest = crop.harvest[language] || crop.harvest.en;

  return (
    <div className="page-enter">
      <Link href="/crops" className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))] no-underline">
        <ArrowLeft size={16} /> {t.back}
      </Link>

      {/* Header */}
      <div className="mt-4 flex items-center gap-4 rounded-[1.5rem] bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))]">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--secondary)/.3)] text-5xl">
          {crop.emoji}
        </span>
        <div>
          <p className="eyebrow text-[hsl(var(--secondary))]">Crop</p>
          <h1 className="mt-1 text-3xl font-bold tracking-[-.03em]">{name}</h1>
          <p className="mt-1 text-xs opacity-70">{crop.duration} {t.days}</p>
        </div>
      </div>

      {/* Growth Conditions */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold tracking-[-.02em]">{t.conditions}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
            <Thermometer size={18} className="text-[hsl(var(--primary))]" />
            <p className="mt-2 text-xs font-semibold uppercase opacity-60">{t.temperature}</p>
            <p className="mt-1 text-sm font-bold">{crop.conditions.temp}</p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
            <Droplets size={18} className="text-[hsl(var(--primary))]" />
            <p className="mt-2 text-xs font-semibold uppercase opacity-60">{t.rainfall}</p>
            <p className="mt-1 text-sm font-bold">{crop.conditions.rain}</p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
            <Leaf size={18} className="text-[hsl(var(--primary))]" />
            <p className="mt-2 text-xs font-semibold uppercase opacity-60">{t.soil}</p>
            <p className="mt-1 text-sm font-bold">{soil}</p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
            <FlaskConical size={18} className="text-[hsl(var(--primary))]" />
            <p className="mt-2 text-xs font-semibold uppercase opacity-60">{t.ph}</p>
            <p className="mt-1 text-sm font-bold">{crop.conditions.ph}</p>
          </div>
        </div>
      </section>

      {/* Timing */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold tracking-[-.02em]">{t.timing}</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-3 text-center">
            <Calendar size={16} className="mx-auto text-[hsl(var(--primary))]" />
            <p className="mt-2 text-[.65rem] font-semibold uppercase opacity-60">{t.sowing}</p>
            <p className="mt-1 text-xs font-bold">{sowing}</p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-3 text-center">
            <Calendar size={16} className="mx-auto text-[hsl(var(--primary))]" />
            <p className="mt-2 text-[.65rem] font-semibold uppercase opacity-60">{t.harvest}</p>
            <p className="mt-1 text-xs font-bold">{harvest}</p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-3 text-center">
            <Calendar size={16} className="mx-auto text-[hsl(var(--primary))]" />
            <p className="mt-2 text-[.65rem] font-semibold uppercase opacity-60">{t.duration}</p>
            <p className="mt-1 text-xs font-bold">{crop.duration} {t.days}</p>
          </div>
        </div>
      </section>

      {/* Diseases */}
      <section className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold tracking-[-.02em]">
          <Bug size={18} /> {t.diseases}
        </h2>
        <div className="grid gap-2">
          {crop.diseases.map((d, i) => {
            const dname = d[language] || d.en;
            return (
              <div key={i} className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] px-4 py-3 text-sm font-semibold">
                {dname}
              </div>
            );
          })}
        </div>
      </section>

      {/* Pests */}
      <section className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold tracking-[-.02em]">
          <Bug size={18} /> {t.pests}
        </h2>
        <div className="grid gap-2">
          {crop.pests.map((p, i) => {
            const pname = p[language] || p.en;
            return (
              <div key={i} className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] px-4 py-3 text-sm font-semibold">
                {pname}
              </div>
            );
          })}
        </div>
      </section>

      {/* Tips */}
      <section className="mt-6 rounded-[1.35rem] border border-[#a9ccc2] bg-[#deeee9] p-5 text-[#28655e]">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-[-.02em]">
          <Lightbulb size={20} /> {t.tips}
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {crop.tips.map((tip, i) => {
            const tname = tip[language] || tip.en;
            return <li key={i}>{tname}</li>;
          })}
        </ul>
      </section>
    </div>
  );
    }
