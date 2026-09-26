import { Share2 } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, Bug, Leaf, Syringe, Shield } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Language } from '@/i18n/translations';
import pestsData from '@/data/pests-detailed.json';

type CropKey = keyof typeof pestsData;

const T: Record<Language, Record<string, string>> = {
  en: {
    back: 'Back', symptoms: 'Symptoms', treatment: 'Treatment',
    prevention: 'Prevention', notFound: 'Crop not found',
    diseasesOf: 'Diseases of',
  },
  gu: {
    back: 'પાછળ', symptoms: 'લક્ષણો', treatment: 'ઉપચાર',
    prevention: 'નિવારણ', notFound: 'પાક મળ્યો નથી',
    diseasesOf: 'ના રોગો',
  },
  hi: {
    back: 'पीछे', symptoms: 'लक्षण', treatment: 'उपचार',
    prevention: 'रोकथाम', notFound: 'फसल नहीं मिली',
    diseasesOf: 'के रोग',
  },
  mr: {
    back: 'मागे', symptoms: 'लक्षणे', treatment: 'उपचार',
    prevention: 'प्रतिबंध', notFound: 'पीक सापडले नाही',
    diseasesOf: 'चे रोग',
  },
  pa: {
    back: 'ਪਿੱਛੇ', symptoms: 'ਲੱਛਣ', treatment: 'ਇਲਾਜ',
    prevention: 'ਰੋਕਥਾਮ', notFound: 'ਫਸਲ ਨਹੀਂ ਮਿਲੀ',
    diseasesOf: 'ਦੇ ਰੋਗ',
  },
  ta: {
    back: 'பின்', symptoms: 'அறிகுறிகள்', treatment: 'சிகிச்சை',
    prevention: 'தடுப்பு', notFound: 'பயிர் கிடைக்கவில்லை',
    diseasesOf: 'இன் நோய்கள்',
  },
};

export default function PestCropDetail() {
  const { language } = useLanguage();
  const t = T[language] ?? T.en;
  const [, params] = useRoute('/pests/:id');
  const cropId = params?.id as CropKey | undefined;
  const crop = cropId ? pestsData[cropId] : null;

  if (!crop) {
    return (
      <div className="page-enter">
        <Link href="/pests" className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))] no-underline">
          <ArrowLeft size={16} /> {t.back}
        </Link>
        <p className="mt-6 text-sm text-[hsl(var(--muted-foreground))]">{t.notFound}</p>
      </div>
    );
  }

  const cropName = crop.name[language] || crop.name.en;

  return (
    <div className="page-enter">
      <Link href="/pests" className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))] no-underline">
        <ArrowLeft size={16} /> {t.back}
      </Link>

      {/* Header */}
      <div className="mt-4 flex items-center gap-4 rounded-[1.5rem] bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))]">
  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--secondary)/.3)] text-4xl">
    {crop.emoji}
  </span>
  <div className="flex-1">
    <p className="eyebrow text-[hsl(var(--secondary))]">{t.diseasesOf}</p>
    <h1 className="mt-1 text-2xl font-bold tracking-[-.03em]">{cropName}</h1>
    <p className="mt-1 text-xs opacity-70">
      {crop.diseases.length} {language === 'gu' ? 'રોગો' : 'diseases'}
    </p>
  </div>
  <button
    type="button"
    onClick={async () => {
      const shareData = {
        title: `Agri Check — ${cropName}`,
        text: `${cropName} ke rog aur unka ilaaj — Agri Check app pe`,
        url: `https://agri-check.vercel.app/pests/${cropId}`,
      };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch { /* cancel */ }
      } else {
        navigator.clipboard.writeText(shareData.url);
        alert('Link copied!');
      }
    }}
    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[hsl(var(--secondary)/.3)]"
    aria-label="Share"
  >
    <Share2 size={20} />
  </button>
</div>

      {/* Diseases */}
      <div className="mt-6 grid gap-4">
        {crop.diseases.map((d, i) => {
          const dName = d.name[language] || d.name.en;
          const symptoms = d.symptoms[language] || d.symptoms.en;
          const treatment = d.treatment[language] || d.treatment.en;
          const prevention = d.prevention[language] || d.prevention.en;

          return (
            <article
              key={i}
              className="rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f9e4dc] text-[#9c4936]">
                  <Bug size={20} />
                </span>
                <h2 className="text-lg font-bold">{dName}</h2>
              </div>

              {/* Symptoms */}
              <div className="mt-4 flex items-start gap-3">
                <Leaf size={16} className="mt-1 shrink-0 text-[#79601e]" />
                <div>
                  <p className="text-[.65rem] font-semibold uppercase opacity-60">
                    {t.symptoms}
                  </p>
                  <p className="mt-1 text-sm">{symptoms}</p>
                </div>
              </div>

              {/* Treatment */}
              <div className="mt-3 flex items-start gap-3">
                <Syringe size={16} className="mt-1 shrink-0 text-[#28655e]" />
                <div>
                  <p className="text-[.65rem] font-semibold uppercase opacity-60">
                    {t.treatment}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{treatment}</p>
                </div>
              </div>

              {/* Prevention */}
              <div className="mt-3 flex items-start gap-3">
                <Shield size={16} className="mt-1 shrink-0 text-[#3f8880]" />
                <div>
                  <p className="text-[.65rem] font-semibold uppercase opacity-60">
                    {t.prevention}
                  </p>
                  <p className="mt-1 text-sm">{prevention}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
      }
