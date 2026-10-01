import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, TrendingUp, Wallet, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Language } from '@/i18n/translations';
import { CROPS } from '@/lib/fertilizer';

const COST_PER_ACRE: Record<string, number> = {
  cotton: 12000,
  groundnut: 10000,
  wheat: 8000,
  bajra: 6000,
  cumin: 15000,
  rice: 14000,
  maize: 10000,
  potato: 18000,
  onion: 20000,
  soybean: 9000,
};

const YIELD_PER_ACRE: Record<string, number> = {
  cotton: 8,
  groundnut: 10,
  wheat: 20,
  bajra: 12,
  cumin: 3,
  rice: 22,
  maize: 25,
  potato: 80,
  onion: 100,
  soybean: 10,
};

const T: Record<Language, Record<string, string>> = {
  en: {
    back: 'Back', title: 'Cost & Profit Calculator',
    subtitle: 'Estimate your income, expenses and profit',
    crop: 'Crop', area: 'Area (acres)', mandiPrice: 'Mandi price (₹/quintal)',
    yieldPerAcre: 'Est. yield per acre', quintal: 'quintal',
    revenue: 'Expected Revenue', cost: 'Estimated Cost', profit: 'Expected Profit',
    loss: 'Loss', margin: 'Margin',
    disclaimer: 'Estimate only. Actual results depend on weather, market and management.',
  },
  gu: {
    back: 'પાછળ', title: 'ખર્ચ અને નફો કેલ્ક્યુલેટર',
    subtitle: 'તમારી આવક, ખર્ચ અને નફાનો અંદાજ લગાવો',
    crop: 'પાક', area: 'ક્ષેત્ર (એકર)', mandiPrice: 'મંડી ભાવ (₹/ક્વિન્ટલ)',
    yieldPerAcre: 'અંદાજિત ઉત્પાદન પ્રતિ એકર', quintal: 'ક્વિન્ટલ',
    revenue: 'અપેક્ષિત આવક', cost: 'અંદાજિત ખર્ચ', profit: 'અપેક્ષિત નફો',
    loss: 'નુકસાન', margin: 'માર્જિન',
    disclaimer: 'ફક્ત અંદાજ. વાસ્તવિક પરિણામ હવામાન, બજાર અને મેનેજમેન્ટ પર આધાર રાખે છે.',
  },
  hi: {
    back: 'पीछे', title: 'लागत और लाभ कैलकुलेटर',
    subtitle: 'अपनी आय, खर्च और मुनाफे का अनुमान लगाएँ',
    crop: 'फसल', area: 'क्षेत्र (एकड़)', mandiPrice: 'मंडी भाव (₹/क्विंटल)',
    yieldPerAcre: 'अनुमानित उपज प्रति एकड़', quintal: 'क्विंटल',
    revenue: 'अपेक्षित आय', cost: 'अनुमानित लागत', profit: 'अपेक्षित मुनाफा',
    loss: 'नुकसान', margin: 'मार्जिन',
    disclaimer: 'केवल अनुमान. वास्तविक परिणाम मौसम, बाजार और प्रबंधन पर निर्भर हैं.',
  },
  mr: {
    back: 'मागे', title: 'खर्च आणि नफा कॅल्क्युलेटर',
    subtitle: 'तुमचे उत्पन्न, खर्च आणि नफा अंदाज लावा',
    crop: 'पीक', area: 'क्षेत्र (एकर)', mandiPrice: 'मंडी भाव (₹/क्विंटल)',
    yieldPerAcre: 'अंदाजे उत्पादन प्रति एकर', quintal: 'क्विंटल',
    revenue: 'अपेक्षित उत्पन्न', cost: 'अंदाजे खर्च', profit: 'अपेक्षित नफा',
    loss: 'तोटा', margin: 'मार्जिन',
    disclaimer: 'फक्त अंदाज. वास्तविक परिणाम हवामान, बाजार आणि व्यवस्थापनावर अवलंबून आहेत.',
  },
  pa: {
    back: 'ਪਿੱਛੇ', title: 'ਲਾਗਤ ਅਤੇ ਮੁਨਾਫ਼ਾ ਕੈਲਕੁਲੇਟਰ',
    subtitle: 'ਆਪਣੀ ਆਮਦਨ, ਖਰਚੇ ਅਤੇ ਮੁਨਾਫ਼ੇ ਦਾ ਅੰਦਾਜ਼ਾ ਲਗਾਓ',
    crop: 'ਫਸਲ', area: 'ਖੇਤਰ (ਏਕੜ)', mandiPrice: 'ਮੰਡੀ ਭਾਅ (₹/ਕੁਇੰਟਲ)',
    yieldPerAcre: 'ਅਨੁਮਾਨਿਤ ਉਪਜ ਪ੍ਰਤੀ ਏਕੜ', quintal: 'ਕੁਇੰਟਲ',
    revenue: 'ਅਪੇਖਿਤ ਆਮਦਨ', cost: 'ਅਨੁਮਾਨਿਤ ਲਾਗਤ', profit: 'ਅਪੇਖਿਤ ਮੁਨਾਫ਼ਾ',
    loss: 'ਨੁਕਸਾਨ', margin: 'ਮਾਰਜਿਨ',
    disclaimer: 'ਸਿਰਫ਼ ਅੰਦਾਜ਼ਾ. ਅਸਲ ਨਤੀਜੇ ਮੌਸਮ, ਬਾਜ਼ਾਰ ਅਤੇ ਪ੍ਰਬੰਧਨ \'ਤੇ ਨਿਰਭਰ ਕਰਦੇ ਹਨ.',
  },
  ta: {
    back: 'பின்', title: 'செலவு மற்றும் லாப கணக்கீடு',
    subtitle: 'உங்கள் வருவாய், செலவு மற்றும் லாபத்தை மதிப்பிடுங்கள்',
    crop: 'பயிர்', area: 'பரப்பளவு (ஏக்கர்)', mandiPrice: 'மண்டி விலை (₹/குவிண்டால்)',
    yieldPerAcre: 'மதிப்பிடப்பட்ட விளைச்சல்/ஏக்கர்', quintal: 'குவிண்டால்',
    revenue: 'எதிர்பார்க்கப்படும் வருவாய்', cost: 'மதிப்பிடப்பட்ட செலவு',
    profit: 'எதிர்பார்க்கப்படும் லாபம்', loss: 'இழப்பு', margin: 'வரம்பு',
    disclaimer: 'மதிப்பீடு மட்டுமே. உண்மையான முடிவுகள் வானிலை, சந்தை மற்றும் நிர்வாகத்தைப் பொறுத்தது.',
  },
};

export default function CostCalculator() {
  const { language } = useLanguage();
  const t = T[language] ?? T.en;

  const [crop, setCrop] = useState('cotton');
  const [area, setArea] = useState(1);
  const [mandiPrice, setMandiPrice] = useState(7100);

  // Update mandi price when crop changes
  useEffect(() => {
    const prices: Record<string, number> = {
      cotton: 7100,
      groundnut: 5800,
      wheat: 2350,
      bajra: 1950,
      cumin: 20000,
      rice: 2200,
      maize: 2100,
      potato: 1350,
      onion: 2200,
      soybean: 4500,
    };
    setMandiPrice(prices[crop] || 2000);
  }, [crop]);

  const yieldPerAcre = YIELD_PER_ACRE[crop] || 10;
  const totalYield = yieldPerAcre * area;
  const revenue = Math.round(totalYield * mandiPrice);
  const cost = (COST_PER_ACRE[crop] || 10000) * area;
  const profit = revenue - cost;
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

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
          <Wallet size={24} />
        </span>
        <div>
          <p className="eyebrow">Cost Calculator</p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-.03em]">{t.title}</h1>
        </div>
      </div>

      <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
        {t.subtitle}
      </p>

      {/* Crop */}
      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold">{t.crop}</label>
        <select
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
        >
          {CROPS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Area */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-semibold">{t.area}</label>
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={area}
          onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
          className="min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
        />
      </div>

      {/* Mandi price */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-semibold">{t.mandiPrice}</label>
        <input
          type="number"
          min="0"
          value={mandiPrice}
          onChange={(e) => setMandiPrice(parseFloat(e.target.value) || 0)}
          className="min-h-12 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm"
        />
      </div>

      {/* Yield info */}
      <div className="mt-4 rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
        <p className="text-xs font-semibold uppercase opacity-60">
          {t.yieldPerAcre}
        </p>
        <p className="mt-1 text-lg font-bold">
          {yieldPerAcre} {t.quintal} / acre
        </p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Total: {totalYield} {t.quintal}
        </p>
      </div>

      {/* Revenue */}
      <div className="mt-4 flex items-center gap-3 rounded-[1.35rem] border border-[#a9ccc2] bg-[#deeee9] p-4 text-[#28655e]">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/50">
          <TrendingUp size={20} />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase opacity-70">
            {t.revenue}
          </p>
          <p className="mt-1 text-2xl font-bold">
            ₹{revenue.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Cost */}
      <div className="mt-3 flex items-center gap-3 rounded-[1.35rem] border border-[#e5b5a5] bg-[#f9e4dc] p-4 text-[#833b2e]">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/50">
          <TrendingDown size={20} />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase opacity-70">{t.cost}</p>
          <p className="mt-1 text-2xl font-bold">
            ₹{cost.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Profit */}
      <div
        className={`mt-4 rounded-[1.35rem] p-5 ${
          profit >= 0
            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
            : 'bg-[#9c4936] text-white'
        }`}
      >
        <p className="text-xs font-semibold uppercase opacity-80">
          {profit >= 0 ? t.profit : t.loss}
        </p>
        <p className="mt-2 text-4xl font-bold">
          ₹{Math.abs(profit).toLocaleString('en-IN')}
        </p>
        <p className="mt-2 text-xs opacity-70">
          {t.margin}: {margin}%
        </p>
      </div>

      {/* Disclaimer */}
      <p className="mt-5 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
        ⚠️ {t.disclaimer}
      </p>
    </div>
  );
    }
