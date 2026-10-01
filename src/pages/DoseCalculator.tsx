import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Droplet, FlaskConical, Calculator, Search, Save, Check, IndianRupee } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Language } from '@/i18n/translations';
import pesticides from '@/data/pesticides.json';
import { CROPS } from '@/lib/fertilizer';

type Pesticide = {
  id: string;
  name: Record<string, string>;
  doseML: number;
  pricePerML: number;
  purpose: Record<string, string>;
  crops: string[];
};

const HISTORY_KEY = 'agri-check-dose-history';

const T: Record<Language, Record<string, string>> = {
  en: {
    back: 'Back', title: 'Pesticide Dose Calculator',
    subtitle: 'Calculate exact dose for your spray tank',
    crop: 'Crop (optional)', allCrops: 'All crops',
    search: 'Search pesticide', pesticide: 'Select pesticide',
    tankSize: 'Tank size', liters: 'liters',
    dosePerLiter: 'Dose per liter', totalDose: 'Total dose for this tank', ml: 'ml',
    purpose: 'Used for', estimatedCost: 'Estimated cost',
    perML: '/ml', totalCost: 'Total cost for this tank',
    save: 'Save this result', saved: '✓ Saved!',
    disclaimer: 'Always follow label instructions and safety precautions.',
    noResults: 'No pesticide found', history: 'Recent calculations',
  },
  gu: {
    back: 'પાછળ', title: 'જંતુનાશક ડોઝ કેલ્ક્યુલેટર',
    subtitle: 'તમારા સ્પ્રે ટાંકી માટે સચોટ ડોઝ ગણો',
    crop: 'પાક (વૈકલ્પિક)', allCrops: 'બધા પાક',
    search: 'જંતુનાશક શોધો', pesticide: 'જંતુનાશક પસંદ કરો',
    tankSize: 'ટાંકીનું માપ', liters: 'લિટર',
    dosePerLiter: 'પ્રતિ લિટર ડોઝ', totalDose: 'આ ટાંકી માટે કુલ ડોઝ', ml: 'મિલી',
    purpose: 'ઉપયોગ', estimatedCost: 'અંદાજિત કિંમત',
    perML: '/મિલી', totalCost: 'આ ટાંકી માટે કુલ કિંમત',
    save: 'આ પરિણામ સાચવો', saved: '✓ સચવાયું!',
    disclaimer: 'હંમેશા લેબલ સૂચનાઓ અને સલામતી પગલાં અનુસરો.',
    noResults: 'કોઈ જંતુનાશક મળ્યું નથી', history: 'તાજેતરની ગણતરી',
  },
  hi: {
    back: 'पीछे', title: 'कीटनाशक खुराक कैलकुलेटर',
    subtitle: 'अपने स्प्रे टैंक के लिए सटीक खुराक गणना करें',
    crop: 'फसल (वैकल्पिक)', allCrops: 'सभी फसलें',
    search: 'कीटनाशक खोजें', pesticide: 'कीटनाशक चुनें',
    tankSize: 'टैंक का आकार', liters: 'लीटर',
    dosePerLiter: 'प्रति लीटर खुराक', totalDose: 'इस टैंक के लिए कुल खुराक', ml: 'मिली',
    purpose: 'उपयोग', estimatedCost: 'अनुमानित लागत',
    perML: '/मिली', totalCost: 'इस टैंक के लिए कुल लागत',
    save: 'यह परिणाम सहेजें', saved: '✓ सहेजा!',
    disclaimer: 'हमेशा लेबल निर्देश और सुरक्षा सावधानियों का पालन करें।',
    noResults: 'कोई कीटनाशक नहीं मिला', history: 'हाल की गणनाएँ',
  },
  mr: {
    back: 'मागे', title: 'कीटकनाशक डोस कॅल्क्युलेटर',
    subtitle: 'तुमच्या फवारणी टाकीसाठी अचूक डोस मोजा',
    crop: 'पीक (पर्यायी)', allCrops: 'सर्व पिके',
    search: 'कीटकनाशक शोधा', pesticide: 'कीटकनाशक निवडा',
    tankSize: 'टाकीचा आकार', liters: 'लिटर',
    dosePerLiter: 'प्रति लिटर डोस', totalDose: 'या टाकीसाठी एकूण डोस', ml: 'मिली',
    purpose: 'वापर', estimatedCost: 'अंदाजे खर्च',
    perML: '/मिली', totalCost: 'या टाकीसाठी एकूण खर्च',
    save: 'हा निकाल जतन करा', saved: '✓ जतन झाले!',
    disclaimer: 'नेहमी लेबल सूचना आणि सुरक्षा खबरदारी अनुसरा.',
    noResults: 'कोणतेही कीटकनाशक सापडले नाही', history: 'अलीकडील गणना',
  },
  pa: {
    back: 'ਪਿੱਛੇ', title: 'ਕੀਟਨਾਸ਼ਕ ਖੁਰਾਕ ਕੈਲਕੁਲੇਟਰ',
    subtitle: 'ਆਪਣੇ ਸਪਰੇਅ ਟੈਂਕ ਲਈ ਸਹੀ ਖੁਰਾਕ ਗਿਣੋ',
    crop: 'ਫਸਲ (ਵਿਕਲਪਿਕ)', allCrops: 'ਸਾਰੀਆਂ ਫਸਲਾਂ',
    search: 'ਕੀਟਨਾਸ਼ਕ ਖੋਜੋ', pesticide: 'ਕੀਟਨਾਸ਼ਕ ਚੁਣੋ',
    tankSize: 'ਟੈਂਕ ਦਾ ਆਕਾਰ', liters: 'ਲੀਟਰ',
    dosePerLiter: 'ਪ੍ਰਤੀ ਲੀਟਰ ਖੁਰਾਕ', totalDose: 'ਇਸ ਟੈਂਕ ਲਈ ਕੁੱਲ ਖੁਰਾਕ', ml: 'ਮਿਲੀ',
    purpose: 'ਵਰਤੋਂ', estimatedCost: 'ਅਨੁਮਾਨਿਤ ਲਾਗਤ',
    perML: '/ਮਿਲੀ', totalCost: 'ਇਸ ਟੈਂਕ ਲਈ ਕੁੱਲ ਲਾਗਤ',
    save: 'ਇਹ ਨਤੀਜਾ ਸੰਭਾਲੋ', saved: '✓ ਸੰਭਾਲਿਆ!',
    disclaimer: 'ਹਮੇਸ਼ਾ ਲੇਬਲ ਨਿਰਦੇਸ਼ ਅਤੇ ਸੁਰੱਖਿਆ ਸਾਵਧਾਨੀਆਂ ਦੀ ਪਾਲਣਾ ਕਰੋ.',
    noResults: 'ਕੋਈ ਕੀਟਨਾਸ਼ਕ ਨਹੀਂ ਮਿਲਿਆ', history: 'ਤਾਜ਼ਾ ਗਣਨਾਵਾਂ',
  },
  ta: {
    back: 'பின்', title: 'பூச்சிக்கொல்லி அளவு கணக்கீடு',
    subtitle: 'உங்கள் தெளிப்பு தொட்டிக்கு சரியான அளவு கணக்கிடுங்கள்',
    crop: 'பயிர் (விரும்பினால்)', allCrops: 'அனைத்து பயிர்கள்',
    search: 'பூச்சிக்கொல்லி தேடு', pesticide: 'பூச்சிக்கொல்லி தேர்வு',
    tankSize: 'தொட்டி அளவு', liters: 'லிட்டர்',
    dosePerLiter: 'ஒரு லிட்டருக்கு அளவு', totalDose: 'இந்த தொட்டிக்கான மொத்த அளவு', ml: 'மிலி',
    purpose: 'பயன்பாடு', estimatedCost: 'மதிப்பிடப்பட்ட செலவு',
    perML: '/மிலி', totalCost: 'இந்த தொட்டிக்கான மொத்த செலவு',
    save: 'இந்த முடிவை சேமி', saved: '✓ சேமிக்கப்பட்டது!',
    disclaimer: 'எப்போதும் லேபிள் வழிமுறைகள் மற்றும் பாதுகாப்பு முன்னெச்சரிக்கைகளைப் பின்பற்றவும்.',
    noResults: 'பூச்சிக்கொல்லி கிடைக்கவில்லை', history: 'சமீபத்திய கணக்கீடுகள்',
  },
};

type DoseHistory = {
  id: string;
  pesticideId: string;
  pesticideName: string;
  tankSize: number;
  doseML: number;
  totalDose: number;
  cost: number;
  createdAt: string;
};

function readHistory(): DoseHistory[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

function writeHistory(items: DoseHistory[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 5)));
  } catch {
    // silent
  }
}

export default function DoseCalculator() {
  const { language } = useLanguage();
  const t = T[language] ?? T.en;
  const list = pesticides as Pesticide[];

  const [cropFilter, setCropFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(list[0].id);
  const [tankSize, setTankSize] = useState(15);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<DoseHistory[]>(readHistory);

  // Filter pesticides by crop + search
  const filteredList = list.filter((p) => {
    const cropMatch = !cropFilter || p.crops.includes(cropFilter);
    const search = searchQuery.toLowerCase().trim();
    const name = (p.name[language] || p.name.en).toLowerCase();
    const nameEn = p.name.en.toLowerCase();
    const searchMatch = !search || name.includes(search) || nameEn.includes(search);
    return cropMatch && searchMatch;
  });

  // If selected not in filtered list, auto-pick first
  const selected = filteredList.find((p) => p.id === selectedId) || filteredList[0];

  const totalDose = selected ? (selected.doseML * tankSize).toFixed(1) : '0';
  const totalCost = selected ? Math.round(selected.pricePerML * selected.doseML * tankSize) : 0;
  const pesticideName = selected ? selected.name[language] || selected.name.en : '—';
  const purpose = selected ? selected.purpose[language] || selected.purpose.en : '';

  const handleSave = () => {
    if (!selected) return;
    const item: DoseHistory = {
      id: `dose-${Date.now()}`,
      pesticideId: selected.id,
      pesticideName,
      tankSize,
      doseML: selected.doseML,
      totalDose: parseFloat(totalDose),
      cost: totalCost,
      createdAt: new Date().toISOString(),
    };
    const next = [item, ...history];
    setHistory(next);
    writeHistory(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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

      <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">{t.subtitle}</p>

      {/* Crop Filter */}
      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold">{t.crop}</label>
        <select
          value={cropFilter}
          onChange={(e) => {
            setCropFilter(e.target.value);
            setSaved(false);
          }}
          className="min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
        >
          <option value="">{t.allCrops}</option>
          {CROPS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-semibold">{t.search}</label>
        <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4">
          <Search size={16} className="shrink-0 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Imida..."
            className="min-h-12 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {/* Pesticide Select */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-semibold">{t.pesticide}</label>
        {filteredList.length === 0 ? (
          <p className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
            {t.noResults}
          </p>
        ) : (
          <select
            value={selected?.id || ''}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setSaved(false);
            }}
            className="min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
          >
            {filteredList.map((p) => {
              const name = p.name[language] || p.name.en;
              return (
                <option key={p.id} value={p.id}>
                  {name}
                </option>
              );
            })}
          </select>
        )}
      </div>

      {selected && (
        <>
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
              onChange={(e) => {
                setTankSize(parseFloat(e.target.value) || 0);
                setSaved(false);
              }}
              className="min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
            />
          </div>

          {/* Dose per liter */}
          <div className="mt-4 rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
            <div className="flex items-center gap-2 text-xs opacity-60">
              <Droplet size={14} />
              <span className="font-semibold uppercase">{t.dosePerLiter}</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{selected.doseML} ml/L</p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              {t.purpose}: {purpose} · ₹{selected.pricePerML} {t.perML}
            </p>
          </div>

          {/* Total Dose */}
          <div className="mt-4 rounded-[1.35rem] bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))]">
            <div className="flex items-center gap-2">
              <Calculator size={18} />
              <p className="text-xs font-semibold uppercase opacity-80">{t.totalDose}</p>
            </div>
            <p className="mt-2 text-4xl font-bold">
              {totalDose} <span className="text-xl">{t.ml}</span>
            </p>
            <p className="mt-2 text-xs opacity-70">
              {pesticideName} · {tankSize} {t.liters}
            </p>
          </div>

          {/* Cost */}
          <div className="mt-4 flex items-center gap-3 rounded-[1.35rem] border border-[#e6c879] bg-[#fbf0c9] p-4 text-[#66511b]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/50">
              <IndianRupee size={20} />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase opacity-70">{t.totalCost}</p>
              <p className="mt-1 text-2xl font-bold">₹{totalCost}</p>
            </div>
          </div>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saved}
            className={`mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold ${
              saved
                ? 'border border-[#a9ccc2] bg-[#deeee9] text-[#28655e]'
                : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-lift)]'
            }`}
          >
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? t.saved : t.save}
          </button>
        </>
      )}

      {/* Disclaimer */}
      <p className="mt-5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
        ⚠️ {t.disclaimer}
      </p>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6">
          <p className="eyebrow mb-3">{t.history}</p>
          <div className="grid gap-2">
            {history.map((h) => (
              <div
                key={h.id}
                className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{h.pesticideName}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {h.tankSize}L
                  </p>
                </div>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {h.totalDose} ml · ₹{h.cost}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
          }
