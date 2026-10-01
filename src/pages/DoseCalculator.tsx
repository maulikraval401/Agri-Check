import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Droplet, FlaskConical, Calculator } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Language } from '@/i18n/translations';
import pesticides from '@/data/pesticides.json';

type Pesticide = {
  id: string;
  name: Record<string, string>;
  doseML: number;
  purpose: Record<string, string>;
  crops: string[];
};

const T: Record<Language, Record<string, string>> = {
  en: {
    back: 'Back', title: 'Pesticide Dose Calculator',
    subtitle: 'Calculate exact dose for your spray tank',
    pesticide: 'Select pesticide', tankSize: 'Tank size',
    liters: 'liters', dosePerLiter: 'Dose per liter',
    totalDose: 'Total dose for this tank', ml: 'ml',
    purpose: 'Used for', disclaimer: 'Always follow label instructions and safety precautions.',
  },
  gu: {
    back: 'પાછળ', title: 'જંતુનાશક ડોઝ કેલ્ક્યુલેટર',
    subtitle: 'તમારા સ્પ્રે ટાંકી માટે સચોટ ડોઝ ગણો',
    pesticide: 'જંતુનાશક પસંદ કરો', tankSize: 'ટાંકીનું માપ',
    liters: 'લિટર', dosePerLiter: 'પ્રતિ લિટર ડોઝ',
    totalDose: 'આ ટાંકી માટે કુલ ડોઝ', ml: 'મિલી',
    purpose: 'ઉપયોગ', disclaimer: 'હંમેશા લેબલ સૂચનાઓ અને સલામતી પગલાં અનુસરો.',
  },
  hi: {
    back: 'पीछे', title: 'कीटनाशक खुराक कैलकुलेटर',
    subtitle: 'अपने स्प्रे टैंक के लिए सटीक खुराक गणना करें',
    pesticide: 'कीटनाशक चुनें', tankSize: 'टैंक का आकार',
    liters: 'लीटर', dosePerLiter: 'प्रति लीटर खुराक',
    totalDose: 'इस टैंक के लिए कुल खुराक', ml: 'मिली',
    purpose: 'उपयोग', disclaimer: 'हमेशा लेबल निर्देश और सुरक्षा सावधानियों का पालन करें।',
  },
  mr: {
    back: 'मागे', title: 'कीटकनाशक डोस कॅल्क्युलेटर',
    subtitle: 'तुमच्या फवारणी टाकीसाठी अचूक डोस मोजा',
    pesticide: 'कीटकनाशक निवडा', tankSize: 'टाकीचा आकार',
    liters: 'लिटर', dosePerLiter: 'प्रति लिटर डोस',
    totalDose: 'या टाकीसाठी एकूण डोस', ml: 'मिली',
    purpose: 'वापर', disclaimer: 'नेहमी लेबल सूचना आणि सुरक्षा खबरदारी अनुसरा.',
  },
  pa: {
    back: 'ਪਿੱਛੇ', title: 'ਕੀਟਨਾਸ਼ਕ ਖੁਰਾਕ ਕੈਲਕੁਲੇਟਰ',
    subtitle: 'ਆਪਣੇ ਸਪਰੇਅ ਟੈਂਕ ਲਈ ਸਹੀ ਖੁਰਾਕ ਗਿਣੋ',
    pesticide: 'ਕੀਟਨਾਸ਼ਕ ਚੁਣੋ', tankSize: 'ਟੈਂਕ ਦਾ ਆਕਾਰ',
    liters: 'ਲੀਟਰ', dosePerLiter: 'ਪ੍ਰਤੀ ਲੀਟਰ ਖੁਰਾਕ',
    totalDose: 'ਇਸ ਟੈਂਕ ਲਈ ਕੁੱਲ ਖੁਰਾਕ', ml: 'ਮਿਲੀ',
    purpose: 'ਵਰਤੋਂ', disclaimer: 'ਹਮੇਸ਼ਾ ਲੇਬਲ ਨਿਰਦੇਸ਼ ਅਤੇ ਸੁਰੱਖਿਆ ਸਾਵਧਾਨੀਆਂ ਦੀ ਪਾਲਣਾ ਕਰੋ.',
  },
  ta: {
    back: 'பின்', title: 'பூச்சிக்கொல்லி அளவு கணக்கீடு',
    subtitle: 'உங்கள் தெளிப்பு தொட்டிக்கு சரியான அளவு கணக்கிடுங்கள்',
    pesticide: 'பூச்சிக்கொல்லி தேர்வு', tankSize: 'தொட்டி அளவு',
    liters: 'லிட்டர்', dosePerLiter: 'ஒரு லிட்டருக்கு அளவு',
    totalDose: 'இந்த தொட்டிக்கான மொத்த அளவு', ml: 'மிலி',
    purpose: 'பயன்பாடு', disclaimer: 'எப்போதும் லேபிள் வழிமுறைகள் மற்றும் பாதுகாப்பு முன்னெச்சரிக்கைகளைப் பின்பற்றவும்.',
  },
};

export default function DoseCalculator() {
  const { language } = useLanguage();
  const t = T[language] ?? T.en;
  const list = pesticides as Pesticide[];

  const [selectedId, setSelectedId] = useState(list[0].id);
  const [tankSize, setTankSize] = useState(15);

  const selected = list.find((p) => p.id === selectedId) || list[0];
  const totalDose = (selected.doseML * tankSize).toFixed(1);

  const pesticideName = selected.name[language] || selected.name.en;
  const purpose = selected.purpose[language] || selected.purpose.en;

  return (
    <div className="page-enter">
      <Link
        href="/calculator"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))] no-underline"
      >
        <ArrowLeft size={16} /> {t.back}
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))]">
          <FlaskConical size={24} />
        </span>
        <div>
          <p className="eyebrow">Dose Calculator</p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-.03em]">{t.title}</h1>
        </div>
      </div>

      <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
        {t.subtitle}
      </p>

      {/* Pesticide Select */}
      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold">{t.pesticide}</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
        >
          {list.map((p) => {
            const name = p.name[language] || p.name.en;
            return (
              <option key={p.id} value={p.id}>
                {name}
              </option>
            );
          })}
        </select>
      </div>

      {/* Tank Size */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-semibold">
          {t.tankSize} ({t.liters})
        </label>
        <input
          type="number"
          min="1"
          max="200"
          value={tankSize}
          onChange={(e) => setTankSize(parseFloat(e.target.value) || 0)}
          className="min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
        />
      </div>

      {/* Dose per liter info */}
      <div className="mt-4 rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
        <div className="flex items-center gap-2 text-xs opacity-60">
          <Droplet size={14} />
          <span className="font-semibold uppercase">{t.dosePerLiter}</span>
        </div>
        <p className="mt-1 text-2xl font-bold">{selected.doseML} ml/L</p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          {t.purpose}: {purpose}
        </p>
      </div>

      {/* Result */}
      <div className="mt-4 rounded-[1.35rem] bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))]">
        <div className="flex items-center gap-2">
          <Calculator size={18} />
          <p className="text-xs font-semibold uppercase opacity-80">
            {t.totalDose}
          </p>
        </div>
        <p className="mt-2 text-4xl font-bold">
          {totalDose} <span className="text-xl">{t.ml}</span>
        </p>
        <p className="mt-2 text-xs opacity-70">
          {pesticideName} · {tankSize} {t.liters}
        </p>
      </div>

      {/* Disclaimer */}
      <p className="mt-5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
        ⚠️ {t.disclaimer}
      </p>
    </div>
  );
      }
