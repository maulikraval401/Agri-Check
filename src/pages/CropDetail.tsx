import { Link, useRoute } from 'wouter';
import {
  ArrowLeft, Thermometer, Droplets, FlaskConical, Calendar,
  Bug, Leaf, Lightbulb, Sun, Wind, Waves, Repeat, Users,
  Sprout, Check, X, Volume2,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Language } from '@/i18n/translations';
import cropsData from '@/data/crops-detailed.json';

type CropKey = keyof typeof cropsData;

const T: Record<Language, Record<string, string>> = {
  en: {
    back: 'Back', crop: 'Crop',
    conditions: 'Growth Conditions',
    temperature: 'Temperature', rainfall: 'Rainfall',
    light: 'Light', humidity: 'Humidity',
    soil: 'Soil type', ph: 'pH range', waterLevel: 'Water need',
    timing: 'Sowing & Harvest',
    sowing: 'Sowing', harvest: 'Harvest', duration: 'Duration', days: 'days',
    lifecycle: 'Lifecycle', labour: 'Labour', plantingMethod: 'Planting method',
    seedRate: 'Seed rate',
    npk: 'Nutrient requirement (N-P-K)',
    npkNote: 'This is general information. Adjust based on your soil test.',
    diseases: 'Common Diseases',
    pests: 'Common Pests',
    companions: 'Companion Crops',
    goodCompanions: 'Good companions',
    badCompanions: 'Bad companions',
    rotation: 'Crop Rotation',
    rotationNote: 'Grow good rotation crops after your main crop to improve soil health and reduce pests.',
    tips: 'Farming Tips',
    notFound: 'Crop not found',
    listen: 'Listen',
  },
  gu: {
    back: 'પાછળ', crop: 'પાક',
    conditions: 'વૃદ્ધિ શરતો',
    temperature: 'તાપમાન', rainfall: 'વરસાદ',
    light: 'પ્રકાશ', humidity: 'ભેજ',
    soil: 'માટીનો પ્રકાર', ph: 'pH રેન્જ', waterLevel: 'પાણીની જરૂર',
    timing: 'વાવેતર અને લણણી',
    sowing: 'વાવેતર', harvest: 'લણણી', duration: 'અવધિ', days: 'દિવસ',
    lifecycle: 'જીવનચક્ર', labour: 'શ્રમ', plantingMethod: 'વાવેતર પદ્ધતિ',
    seedRate: 'બીજ દર',
    npk: 'પોષક તત્વોની જરૂરિયાત (N-P-K)',
    npkNote: 'આ સામાન્ય માહિતી છે. તમારી માટી ચકાસણી મુજબ ગોઠવો.',
    diseases: 'સામાન્ય રોગો',
    pests: 'સામાન્ય જીવાતો',
    companions: 'સાથી પાક',
    goodCompanions: 'સારા સાથી',
    badCompanions: 'ખરાબ સાથી',
    rotation: 'પાક ચક્ર',
    rotationNote: 'તમારા મુખ્ય પાક પછી સારા ચક્રવાળી ફસલો વાવો.',
    tips: 'ખેતીની ટિપ્સ',
    notFound: 'પાક મળ્યો નથી',
    listen: 'સાંભળો',
  },
  hi: {
    back: 'पीछे', crop: 'फसल',
    conditions: 'बढ़ने की शर्तें',
    temperature: 'तापमान', rainfall: 'बारिश',
    light: 'प्रकाश', humidity: 'नमी',
    soil: 'मिट्टी का प्रकार', ph: 'pH रेंज', waterLevel: 'पानी की जरूरत',
    timing: 'बुवाई और कटाई',
    sowing: 'बुवाई', harvest: 'कटाई', duration: 'अवधि', days: 'दिन',
    lifecycle: 'जीवनचक्र', labour: 'श्रम', plantingMethod: 'बुवाई विधि',
    seedRate: 'बीज दर',
    npk: 'पोषक तत्वों की जरूरत (N-P-K)',
    npkNote: 'यह सामान्य जानकारी है। अपनी मिट्टी जाँच के अनुसार बदलें।',
    diseases: 'सामान्य रोग',
    pests: 'सामान्य कीट',
    companions: 'साथी फसलें',
    goodCompanions: 'अच्छे साथी',
    badCompanions: 'खराब साथी',
    rotation: 'फसल चक्र',
    rotationNote: 'मुख्य फसल के बाद अच्छे चक्र वाली फसलें उगाएँ।',
    tips: 'खेती के टिप्स',
    notFound: 'फसल नहीं मिली',
    listen: 'सुनें',
  },
  mr: {
    back: 'मागे', crop: 'पीक',
    conditions: 'वाढीच्या अटी',
    temperature: 'तापमान', rainfall: 'पाऊस',
    light: 'प्रकाश', humidity: 'आर्द्रता',
    soil: 'मातीचा प्रकार', ph: 'pH श्रेणी', waterLevel: 'पाण्याची गरज',
    timing: 'पेरणी आणि कापणी',
    sowing: 'पेरणी', harvest: 'कापणी', duration: 'कालावधी', days: 'दिवस',
    lifecycle: 'जीवनचक्र', labour: 'श्रम', plantingMethod: 'पेरणी पद्धत',
    seedRate: 'बियाणे दर',
    npk: 'पोषक घटकांची गरज (N-P-K)',
    npkNote: 'हे सामान्य माहिती आहे. तुमच्या माती चाचणीनुसार बदला.',
    diseases: 'सामान्य रोग',
    pests: 'सामान्य कीड',
    companions: 'सोबतची पिके',
    goodCompanions: 'चांगले सोबत',
    badCompanions: 'वाईट सोबत',
    rotation: 'पीक चक्र',
    rotationNote: 'मुख्य पिकानंतर चांगल्या चक्राची पिके वाढवा.',
    tips: 'शेती टिप्स',
    notFound: 'पीक सापडले नाही',
    listen: 'ऐका',
  },
  pa: {
    back: 'ਪਿੱਛੇ', crop: 'ਫਸਲ',
    conditions: 'ਵਾਧੇ ਦੀਆਂ ਸ਼ਰਤਾਂ',
    temperature: 'ਤਾਪਮਾਨ', rainfall: 'ਬਾਰਿਸ਼',
    light: 'ਰੌਸ਼ਨੀ', humidity: 'ਨਮੀ',
    soil: 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ', ph: 'pH ਰੇਂਜ', waterLevel: 'ਪਾਣੀ ਦੀ ਲੋੜ',
    timing: 'ਬਿਜਾਈ ਅਤੇ ਵਾਢੀ',
    sowing: 'ਬਿਜਾਈ', harvest: 'ਵਾਢੀ', duration: 'ਅਵਧੀ', days: 'ਦਿਨ',
    lifecycle: 'ਜੀਵਨ ਚੱਕਰ', labour: 'ਮਜ਼ਦੂਰੀ', plantingMethod: 'ਬਿਜਾਈ ਵਿਧੀ',
    seedRate: 'ਬੀਜ ਦਰ',
    npk: 'ਪੋਸ਼ਕ ਤੱਤਾਂ ਦੀ ਲੋੜ (N-P-K)',
    npkNote: 'ਇਹ ਆਮ ਜਾਣਕਾਰੀ ਹੈ। ਆਪਣੀ ਮਿੱਟੀ ਜਾਂਚ ਅਨੁਸਾਰ ਬਦਲੋ।',
    diseases: 'ਆਮ ਰੋਗ',
    pests: 'ਆਮ ਕੀੜੇ',
    companions: 'ਸਾਥੀ ਫਸਲਾਂ',
    goodCompanions: 'ਚੰਗੇ ਸਾਥੀ',
    badCompanions: 'ਮਾੜੇ ਸਾਥੀ',
    rotation: 'ਫਸਲ ਚੱਕਰ',
    rotationNote: 'ਮੁੱਖ ਫਸਲ ਤੋਂ ਬਾਅਦ ਚੰਗੇ ਚੱਕਰ ਵਾਲੀਆਂ ਫਸਲਾਂ ਬੀਜੋ।',
    tips: 'ਖੇਤੀ ਟਿਪਸ',
    notFound: 'ਫਸਲ ਨਹੀਂ ਮਿਲੀ',
    listen: 'ਸੁਣੋ',
  },
  ta: {
    back: 'பின்', crop: 'பயிர்',
    conditions: 'வளர்ச்சி நிலைமைகள்',
    temperature: 'வெப்பநிலை', rainfall: 'மழை',
    light: 'ஒளி', humidity: 'ஈரப்பதம்',
    soil: 'மண் வகை', ph: 'pH வரம்பு', waterLevel: 'நீர் தேவை',
    timing: 'விதைப்பு & அறுவடை',
    sowing: 'விதைப்பு', harvest: 'அறுவடை', duration: 'காலம்', days: 'நாட்கள்',
    lifecycle: 'வாழ்க்கை சுழற்சி', labour: 'உழைப்பு', plantingMethod: 'நடவு முறை',
    seedRate: 'விதை விகிதம்',
    npk: 'ஊட்டச்சத்து தேவை (N-P-K)',
    npkNote: 'இது பொதுவான தகவல். உங்கள் மண் சோதனைக்கு ஏற்ப மாற்றவும்.',
    diseases: 'பொதுவான நோய்கள்',
    pests: 'பொதுவான பூச்சிகள்',
    companions: 'துணை பயிர்கள்',
    goodCompanions: 'நல்ல துணை',
    badCompanions: 'மோசமான துணை',
    rotation: 'பயிர் சுழற்சி',
    rotationNote: 'முக்கிய பயிருக்குப் பிறகு நல்ல சுழற்சி பயிர்களை வளர்க்கவும்.',
    tips: 'விவசாய குறிப்புகள்',
    notFound: 'பயிர் கிடைக்கவில்லை',
    listen: 'கேளுங்கள்',
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
  const light = crop.conditions.light[language] || crop.conditions.light.en;
  const waterLevel = crop.conditions.waterLevel[language] || crop.conditions.waterLevel.en;
  const lifecycle = crop.lifecycle[language] || crop.lifecycle.en;
  const labour = crop.labour[language] || crop.labour.en;
  const plantingMethod = crop.plantingMethod[language] || crop.plantingMethod.en;
  const sowing = crop.sowing[language] || crop.sowing.en;
  const harvest = crop.harvest[language] || crop.harvest.en;
  const goodComp = crop.goodCompanions[language] || crop.goodCompanions.en;
  const badComp = crop.badCompanions[language] || crop.badCompanions.en;
  const rotation = crop.rotation[language] || crop.rotation.en;

  const handleListen = () => {
    if (!('speechSynthesis' in window)) return;
    const text = `${name}. ${t.conditions}: ${t.temperature} ${crop.conditions.temp}, ${t.rainfall} ${crop.conditions.rain}, ${t.soil} ${soil}, ${t.ph} ${crop.conditions.ph}.`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

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
        <div className="flex-1">
          <p className="eyebrow text-[hsl(var(--secondary))]">{t.crop}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-[-.03em]">{name}</h1>
          <p className="mt-1 text-xs opacity-70">{crop.duration} {t.days}</p>
        </div>
        <button
          type="button"
          onClick={handleListen}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[hsl(var(--secondary)/.3)]"
          aria-label={t.listen}
        >
          <Volume2 size={20} />
        </button>
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
            <Sun size={18} className="text-[hsl(var(--primary))]" />
            <p className="mt-2 text-xs font-semibold uppercase opacity-60">{t.light}</p>
            <p className="mt-1 text-sm font-bold">{light}</p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
            <Wind size={18} className="text-[hsl(var(--primary))]" />
            <p className="mt-2 text-xs font-semibold uppercase opacity-60">{t.humidity}</p>
            <p className="mt-1 text-sm font-bold">{crop.conditions.humidity}</p>
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
          <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
            <Waves size={18} className="text-[hsl(var(--primary))]" />
            <p className="mt-2 text-xs font-semibold uppercase opacity-60">{t.waterLevel}</p>
            <p className="mt-1 text-sm font-bold">{waterLevel}</p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
            <Repeat size={18} className="text-[hsl(var(--primary))]" />
            <p className="mt-2 text-xs font-semibold uppercase opacity-60">{t.lifecycle}</p>
            <p className="mt-1 text-sm font-bold">{lifecycle}</p>
          </div>
        </div>
      </section>

      {/* Planting Details */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold tracking-[-.02em]">{t.plantingMethod}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
            <Sprout size={18} className="text-[hsl(var(--primary))]" />
            <p className="mt-2 text-xs font-semibold uppercase opacity-60">{t.plantingMethod}</p>
            <p className="mt-1 text-sm font-bold">{plantingMethod}</p>
          </div>
          <div className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
            <Users size={18} className="text-[hsl(var(--primary))]" />
            <p className="mt-2 text-xs font-semibold uppercase opacity-60">{t.labour}</p>
            <p className="mt-1 text-sm font-bold">{labour}</p>
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

      {/* Seed Rate & NPK */}
      <section className="mt-6 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase opacity-60">{t.seedRate}</p>
          <p className="text-sm font-bold">{crop.seedRate}</p>
        </div>

        <div className="mt-4 border-t border-[hsl(var(--border))] pt-4">
          <p className="text-xs font-semibold uppercase opacity-60">{t.npk}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-[hsl(var(--muted))] p-2">
              <p className="text-xs font-bold">N</p>
              <p className="mt-1 text-sm font-bold">{crop.npk.n}</p>
              <p className="text-[.55rem]">kg/ha</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--muted))] p-2">
              <p className="text-xs font-bold">P</p>
              <p className="mt-1 text-sm font-bold">{crop.npk.p}</p>
              <p className="text-[.55rem]">kg/ha</p>
            </div>
            <div className="rounded-lg bg-[hsl(var(--muted))] p-2">
              <p className="text-xs font-bold">K</p>
              <p className="mt-1 text-sm font-bold">{crop.npk.k}</p>
              <p className="text-[.55rem]">kg/ha</p>
            </div>
          </div>
          <p className="mt-3 text-xs opacity-70">{t.npkNote}</p>
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

      {/* Companion Crops */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold tracking-[-.02em]">{t.companions}</h2>
        <div className="grid gap-3">
          <div className="flex items-start gap-3 rounded-xl border border-[#a9ccc2] bg-[#deeee9] p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#a9ccc2] text-[#28655e]">
              <Check size={16} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase opacity-60 text-[#28655e]">{t.goodCompanions}</p>
              <p className="mt-1 text-sm font-bold text-[#28655e]">{goodComp}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-[#e5b5a5] bg-[#f9e4dc] p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e5b5a5] text-[#833b2e]">
              <X size={16} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase opacity-60 text-[#833b2e]">{t.badCompanions}</p>
              <p className="mt-1 text-sm font-bold text-[#833b2e]">{badComp}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rotation */}
      <section className="mt-6 rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)] p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-[-.02em]">
          <Repeat size={20} /> {t.rotation}
        </h2>
        <p className="mt-2 text-sm font-semibold">{rotation}</p>
        <p className="mt-3 text-xs opacity-70">{t.rotationNote}</p>
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
