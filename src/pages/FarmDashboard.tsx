import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  Cloud, Droplets, Calendar, TrendingUp, Leaf, Wallet, ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Language } from '@/i18n/translations';
import { readFarm } from '@/lib/farm-storage';
import {
  getCropAge,
  getCropTask,
  getIrrigationAdviceKey,
  getEstimatedRevenue,
  getEstimatedProfit,
} from '@/lib/farm-logic';
import { fetchWeather, getCurrentLocation } from '@/lib/weather';
import { fetchMandiPrices } from '@/lib/mandi';

const T: Record<Language, Record<string, string>> = {
  en: {
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    day: 'Day',
    ofCrop: 'of crop',
    todayWeather: "Today's Weather",
    rain: 'Rain',
    irrigation: 'Irrigation',
    todayTask: "Today's Task",
    today: 'Today',
    next: 'Next',
    mandi: 'Mandi',
    perQuintal: 'per quintal',
    lastSoilTest: 'Last Soil Test',
    estimatedRevenue: 'Estimated Revenue',
    estimatedProfit: 'Estimated Profit',
    editFarm: 'Edit My Farm',
    loading: 'Loading...',
    rainTomorrow: 'Rain tomorrow — skip irrigation',
    irrigationToday: 'Irrigation today',
    irrigationTomorrow: 'Irrigation tomorrow',
    // Task names
    taskSowing: 'Sowing',
    taskFirstIrrigation: 'First irrigation',
    taskSecondIrrigation: 'Second irrigation',
    taskUrea50: 'Urea 50 kg/acre',
    taskUrea40: 'Urea 40 kg/acre',
    taskUrea30: 'Urea 30 kg/acre',
    taskSecondUrea: 'Second urea',
    taskPestCheck: 'Pest check',
    taskWeeding: 'Weeding',
    taskGypsum: 'Gypsum 100 kg/acre',
    taskHarvestPrep: 'Harvest preparation',
  },
  gu: {
    goodMorning: 'સુપ્રભાત',
    goodAfternoon: 'શુભ બપોર',
    goodEvening: 'શુભ સાંજ',
    day: 'દિવસ',
    ofCrop: 'પાકના',
    todayWeather: 'આજનું હવામાન',
    rain: 'વરસાદ',
    irrigation: 'સિંચાઈ',
    todayTask: 'આજનું કામ',
    today: 'આજે',
    next: 'પછી',
    mandi: 'મંડી',
    perQuintal: 'પ્રતિ ક્વિન્ટલ',
    lastSoilTest: 'છેલ્લી માટી ચકાસણી',
    estimatedRevenue: 'અંદાજિત આવક',
    estimatedProfit: 'અંદાજિત નફો',
    editFarm: 'ખેત સુધારો',
    loading: 'લોડ થાય છે...',
    rainTomorrow: 'કાલે વરસાદ — પિયત ન કરો',
    irrigationToday: 'આજે પિયત કરો',
    irrigationTomorrow: 'કાલે પિયત',
    taskSowing: 'વાવેતર',
    taskFirstIrrigation: 'પ્રથમ પિયત',
    taskSecondIrrigation: 'બીજું પિયત',
    taskUrea50: 'યુરિયા ૫૦ કિલો/એકર',
    taskUrea40: 'યુરિયા ૪૦ કિલો/એકર',
    taskUrea30: 'યુરિયા ૩૦ કિલો/એકર',
    taskSecondUrea: 'બીજું યુરિયા',
    taskPestCheck: 'જીવાત તપાસ',
    taskWeeding: 'નીંદણ',
    taskGypsum: 'જીપ્સમ ૧૦૦ કિલો/એકર',
    taskHarvestPrep: 'લણણીની તૈયારી',
  },
  hi: {
    goodMorning: 'सुप्रभात',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    day: 'दिन',
    ofCrop: 'फसल का',
    todayWeather: 'आज का मौसम',
    rain: 'बारिश',
    irrigation: 'सिंचाई',
    todayTask: 'आज का काम',
    today: 'आज',
    next: 'फिर',
    mandi: 'मंडी',
    perQuintal: 'प्रति क्विंटल',
    lastSoilTest: 'पिछली मिट्टी जाँच',
    estimatedRevenue: 'अनुमानित आय',
    estimatedProfit: 'अनुमानित मुनाफा',
    editFarm: 'खेत संपादित करें',
    loading: 'लोड हो रहा है...',
    rainTomorrow: 'कल बारिश — सिंचाई न करें',
    irrigationToday: 'आज सिंचाई करें',
    irrigationTomorrow: 'कल सिंचाई',
    taskSowing: 'बुवाई',
    taskFirstIrrigation: 'पहली सिंचाई',
    taskSecondIrrigation: 'दूसरी सिंचाई',
    taskUrea50: 'यूरिया 50 किग्रा/एकड़',
    taskUrea40: 'यूरिया 40 किग्रा/एकड़',
    taskUrea30: 'यूरिया 30 किग्रा/एकड़',
    taskSecondUrea: 'दूसरा यूरिया',
    taskPestCheck: 'कीट जाँच',
    taskWeeding: 'निराई',
    taskGypsum: 'जिप्सम 100 किग्रा/एकड़',
    taskHarvestPrep: 'कटाई की तैयारी',
  },
  mr: {
    goodMorning: 'सुप्रभात',
    goodAfternoon: 'शुभ दुपार',
    goodEvening: 'शुभ संध्याकाळ',
    day: 'दिवस',
    ofCrop: 'पिकाचा',
    todayWeather: 'आजचे हवामान',
    rain: 'पाऊस',
    irrigation: 'सिंचन',
    todayTask: 'आजचे काम',
    today: 'आज',
    next: 'नंतर',
    mandi: 'मंडी',
    perQuintal: 'प्रति क्विंटल',
    lastSoilTest: 'शेवटची माती तपासणी',
    estimatedRevenue: 'अंदाजे उत्पन्न',
    estimatedProfit: 'अंदाजे नफा',
    editFarm: 'शेत संपादित करा',
    loading: 'लोड होत आहे...',
    rainTomorrow: 'उद्या पाऊस — सिंचन नको',
    irrigationToday: 'आज सिंचन करा',
    irrigationTomorrow: 'उद्या सिंचन',
    taskSowing: 'पेरणी',
    taskFirstIrrigation: 'पहिले सिंचन',
    taskSecondIrrigation: 'दुसरे सिंचन',
    taskUrea50: 'युरिया ५० किलो/एकर',
    taskUrea40: 'युरिया ४० किलो/एकर',
    taskUrea30: 'युरिया ३० किलो/एकर',
    taskSecondUrea: 'दुसरे युरिया',
    taskPestCheck: 'कीड तपासणी',
    taskWeeding: 'तण काढणे',
    taskGypsum: 'जिप्सम १०० किलो/एकर',
    taskHarvestPrep: 'कापणीची तयारी',
  },
  pa: {
    goodMorning: 'ਸ਼ੁਭ ਸਵੇਰ',
    goodAfternoon: 'ਸ਼ੁਭ ਦੁਪਹਿਰ',
    goodEvening: 'ਸ਼ੁਭ ਸ਼ਾਮ',
    day: 'ਦਿਨ',
    ofCrop: 'ਫਸਲ ਦਾ',
    todayWeather: 'ਅੱਜ ਦਾ ਮੌਸਮ',
    rain: 'ਬਾਰਿਸ਼',
    irrigation: 'ਸਿੰਚਾਈ',
    todayTask: 'ਅੱਜ ਦਾ ਕੰਮ',
    today: 'ਅੱਜ',
    next: 'ਫਿਰ',
    mandi: 'ਮੰਡੀ',
    perQuintal: 'ਪ੍ਰਤੀ ਕੁਇੰਟਲ',
    lastSoilTest: 'ਪਿਛਲੀ ਮਿੱਟੀ ਜਾਂਚ',
    estimatedRevenue: 'ਅਨੁਮਾਨਿਤ ਆਮਦਨ',
    estimatedProfit: 'ਅਨੁਮਾਨਿਤ ਮੁਨਾਫ਼ਾ',
    editFarm: 'ਖੇਤ ਸੋਧੋ',
    loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    rainTomorrow: 'ਕੱਲ੍ਹ ਬਾਰਿਸ਼ — ਸਿੰਚਾਈ ਨਾ ਕਰੋ',
    irrigationToday: 'ਅੱਜ ਸਿੰਚਾਈ ਕਰੋ',
    irrigationTomorrow: 'ਕੱਲ੍ਹ ਸਿੰਚਾਈ',
    taskSowing: 'ਬਿਜਾਈ',
    taskFirstIrrigation: 'ਪਹਿਲੀ ਸਿੰਚਾਈ',
    taskSecondIrrigation: 'ਦੂਜੀ ਸਿੰਚਾਈ',
    taskUrea50: 'ਯੂਰੀਆ ੫੦ ਕਿਲੋ/ਏਕੜ',
    taskUrea40: 'ਯੂਰੀਆ ੪੦ ਕਿਲੋ/ਏਕੜ',
    taskUrea30: 'ਯੂਰੀਆ ੩੦ ਕਿਲੋ/ਏਕੜ',
    taskSecondUrea: 'ਦੂਜਾ ਯੂਰੀਆ',
    taskPestCheck: 'ਕੀੜੇ ਜਾਂਚ',
    taskWeeding: 'ਨਦੀਨ ਕੱਢਣਾ',
    taskGypsum: 'ਜਿਪਸਮ ੧੦੦ ਕਿਲੋ/ਏਕੜ',
    taskHarvestPrep: 'ਵਾਢੀ ਦੀ ਤਿਆਰੀ',
  },
  ta: {
    goodMorning: 'காலை வணக்கம்',
    goodAfternoon: 'மதிய வணக்கம்',
    goodEvening: 'மாலை வணக்கம்',
    day: 'நாள்',
    ofCrop: 'பயிரின்',
    todayWeather: 'இன்றைய வானிலை',
    rain: 'மழை',
    irrigation: 'நீர்ப்பாசனம்',
    todayTask: 'இன்றைய வேலை',
    today: 'இன்று',
    next: 'அடுத்து',
    mandi: 'மண்டி',
    perQuintal: 'ஒரு குவிண்டாலுக்கு',
    lastSoilTest: 'கடைசி மண் சோதனை',
    estimatedRevenue: 'மதிப்பிடப்பட்ட வருவாய்',
    estimatedProfit: 'மதிப்பிடப்பட்ட லாபம்',
    editFarm: 'பண்ணையைத் திருத்து',
    loading: 'ஏற்றுகிறது...',
    rainTomorrow: 'நாளை மழை — நீர்ப்பாசனம் வேண்டாம்',
    irrigationToday: 'இன்று நீர்ப்பாசனம்',
    irrigationTomorrow: 'நாளை நீர்ப்பாசனம்',
    taskSowing: 'விதைப்பு',
    taskFirstIrrigation: 'முதல் நீர்ப்பாசனம்',
    taskSecondIrrigation: 'இரண்டாம் நீர்ப்பாசனம்',
    taskUrea50: 'யூரியா ௫௦ கிலோ/ஏக்கர்',
    taskUrea40: 'யூரिया ௪௦ கிலோ/ஏக்கர்',
    taskUrea30: 'யூரியா ௩௦ கிலோ/ஏக்கர்',
    taskSecondUrea: 'இரண்டாம் யூரியா',
    taskPestCheck: 'பூச்சி சோதனை',
    taskWeeding: 'களை எடுத்தல்',
    taskGypsum: 'ஜிப்சம் ௧௦௦ கிலோ/ஏக்கர்',
    taskHarvestPrep: 'அறுவடை தயாரிப்பு',
  },
};

export default function FarmDashboard() {
  const { language } = useLanguage();
  const t = T[language] ?? T.en;
  const farm = readFarm();

  const [weather, setWeather] = useState<{ temp: number; rain: number } | null>(null);
  const [mandiPrice, setMandiPrice] = useState<number>(0);
  const [soilTest, setSoilTest] = useState<any>(null);

 useEffect(() => {
  if (!farm) return;

  let cancelled = false;

  (async () => {
    try {
      let lat: number;
      let lon: number;

      try {
        const saved = localStorage.getItem('agri-check-selected-city');
        if (saved) {
          const city = JSON.parse(saved);
          lat = city.lat;
          lon = city.lon;
        } else {
          const loc = await getCurrentLocation();
          lat = loc.lat;
          lon = loc.lon;
        }
      } catch {
        const loc = await getCurrentLocation();
        lat = loc.lat;
        lon = loc.lon;
      }

      const w = await fetchWeather(lat, lon);
      if (!cancelled) {
        setWeather({
          temp: w.current.temp,
          rain: w.daily[0]?.rain ?? 0,
        });
      }
    } catch (err) {
      console.error('Weather error:', err);
    }
  })();

  const mainCrop = farm.crops[0];
  fetchMandiPrices()
    .then((prices) => {
      if (cancelled) return;
      const match = prices.find((p) =>
        p.commodity.toLowerCase().includes(mainCrop.toLowerCase()),
      );
      if (match) setMandiPrice(match.modalPrice);
    })
    .catch(() => undefined);

  try {
    const history = JSON.parse(
      localStorage.getItem('soil-health-checker-history') || '[]',
    );
    if (history[0] && !cancelled) setSoilTest(history[0]);
  } catch {
    // silent
  }

  return () => {
    cancelled = true;
  };
}, [farm]);
      .then((prices) => {
        const match = prices.find((p) =>
          p.commodity.toLowerCase().includes(mainCrop.toLowerCase()),
        );
        if (match) setMandiPrice(match.modalPrice);
      })
      .catch(() => undefined);

    try {
      const history = JSON.parse(localStorage.getItem('soil-health-checker-history') || '[]');
      if (history[0]) setSoilTest(history[0]);
    } catch {
      // silent
    }
  }, [farm]);

  if (!farm) return null;

  const cropAge = getCropAge(farm.sowingDate);
  const task = getCropTask(farm.crops[0], cropAge);
  const irrigationKey = getIrrigationAdviceKey(weather?.rain ?? 0, cropAge);
  const revenue = getEstimatedRevenue(farm.crops[0], farm.landArea, mandiPrice);
  const profit = getEstimatedProfit(farm.crops[0], farm.landArea, mandiPrice);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.goodMorning : hour < 17 ? t.goodAfternoon : t.goodEvening;

  const cropLabel = farm.crops
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
    .join(' · ');

  const irrigationEmoji =
    irrigationKey === 'rainTomorrow' ? '🌧️'
    : irrigationKey === 'irrigationToday' ? '💧'
    : '⏰';

  return (
    <div className="page-enter">
      {/* Greeting header */}
      <div className="rounded-[1.5rem] bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))]">
        <p className="eyebrow text-[hsl(var(--secondary))]">{greeting}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-.03em]">
          {farm.name} 👨‍🌾
        </h1>
        <p className="mt-2 text-sm opacity-80">
          🌾 {cropLabel} · {farm.landArea} acres
          {farm.village ? ` · ${farm.village}` : ''}
        </p>
        <p className="mt-3 text-xs opacity-70">
          {t.day} {cropAge} {t.ofCrop}
        </p>
      </div>

      {/* Cards */}
      <div className="mt-5 grid gap-3">
        {/* Weather */}
        <div className="flex items-start gap-3 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))]">
            <Cloud size={20} />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase opacity-60">
              {t.todayWeather}
            </p>
            <p className="mt-1 text-lg font-bold">
              {weather ? `${Math.round(weather.temp)}°C` : '—'}
            </p>
            {weather && (
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                {t.rain}: {weather.rain}mm
              </p>
            )}
          </div>
        </div>

        {/* Irrigation */}
        <div className="flex items-start gap-3 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))]">
            <Droplets size={20} />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase opacity-60">
              {t.irrigation}
            </p>
            <p className="mt-1 text-sm font-bold">
              {irrigationEmoji} {t[irrigationKey]}
            </p>
          </div>
        </div>

        {/* Task */}
        <div className="flex items-start gap-3 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))]">
            <Calendar size={20} />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase opacity-60">
              {t.todayTask}
            </p>
            <p className="mt-1 text-sm font-bold">
              {t.today}: {t[task.currentKey]}
              {task.nextKey && task.nextDay !== null && (
                <span className="opacity-70">
                  {' · '}{t.next}: {t[task.nextKey]} ({t.day} {task.nextDay})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Mandi */}
        {mandiPrice > 0 && (
          <div className="flex items-start gap-3 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))]">
              <TrendingUp size={20} />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase opacity-60">
                {farm.crops[0]} {t.mandi}
              </p>
              <p className="mt-1 text-lg font-bold">
                ₹{mandiPrice.toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                {t.perQuintal}
              </p>
            </div>
          </div>
        )}

        {/* Soil test */}
        {soilTest && (
          <div className="flex items-start gap-3 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))]">
              <Leaf size={20} />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase opacity-60">
                {t.lastSoilTest}
              </p>
              <p className="mt-1 text-sm font-bold">
                N: {soilTest.nutrients?.nitrogen?.status} · P:{' '}
                {soilTest.nutrients?.phosphorus?.status} · K:{' '}
                {soilTest.nutrients?.potassium?.status}
              </p>
            </div>
          </div>
        )}

        {/* Estimated Revenue */}
        {revenue > 0 && (
          <div className="flex items-start gap-3 rounded-[1.35rem] border border-[#a9ccc2] bg-[#deeee9] p-4 text-[#28655e]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/50">
              <Wallet size={20} />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase opacity-70">
                {t.estimatedRevenue}
              </p>
              <p className="mt-1 text-lg font-bold">
                ₹{revenue.toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-xs opacity-70">
                {t.estimatedProfit}: ₹{profit.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Edit */}
      <Link
        href="/my-farm"
        className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] text-sm font-bold no-underline"
      >
        {t.editFarm} <ArrowRight size={16} />
      </Link>
    </div>
  );
    }
