import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { Calculator, Bug, CloudSun, TrendingUp, Search } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const EXTRA: Record<'en' | 'gu' | 'hi' | 'mr' | 'pa' | 'ta', { thinking: string; login: string; limit: string; error: string }> = {
  en: { thinking: 'Finding the right page...', login: 'Log in to use smart search, or type a simple word like fertilizer, disease, weather, mandi.', limit: 'Today\'s smart search limit is over. Use the cards below.', error: 'Smart search is not working right now. Use the cards below.' },
  gu: { thinking: 'સાચું પેજ શોધી રહ્યા છીએ...', login: 'સ્માર્ટ સર્ચ માટે લૉગિન કરો, અથવા ખાતર, રોગ, હવામાન, મંડી જેવો સાદો શબ્દ લખો.', limit: 'આજની સ્માર્ટ સર્ચ મર્યાદા પૂરી થઈ. નીચેના કાર્ડ વાપરો.', error: 'સ્માર્ટ સર્ચ હમણાં કામ કરતું નથી. નીચેના કાર્ડ વાપરો.' },
  hi: { thinking: 'सही पेज ढूँढ रहे हैं...', login: 'स्मार्ट सर्च के लिए लॉगिन करें, या खाद, रोग, मौसम, मंडी जैसा सीधा शब्द लिखें।', limit: 'आज की स्मार्ट सर्च सीमा पूरी हो गई। नीचे के कार्ड इस्तेमाल करें।', error: 'स्मार्ट सर्च अभी काम नहीं कर रहा। नीचे के कार्ड इस्तेमाल करें।' },
  mr: { thinking: 'योग्य पेज शोधत आहे...', login: 'स्मार्ट सर्चसाठी लॉगिन करा, किंवा खत, रोग, हवामान, मंडी असा साधा शब्द लिहा.', limit: 'आजची स्मार्ट सर्च मर्यादा संपली. खालील कार्ड वापरा.', error: 'स्मार्ट सर्च सध्या चालत नाही. खालील कार्ड वापरा.' },
  pa: { thinking: 'ਸਹੀ ਪੰਨਾ ਲੱਭ ਰਹੇ ਹਾਂ...', login: 'ਸਮਾਰਟ ਸਰਚ ਲਈ ਲਾਗਇਨ ਕਰੋ, ਜਾਂ ਖਾਦ, ਰੋਗ, ਮੌਸਮ, ਮੰਡੀ ਵਰਗਾ ਸਿੱਧਾ ਸ਼ਬਦ ਲਿਖੋ।', limit: 'ਅੱਜ ਦੀ ਸਮਾਰਟ ਸਰਚ ਸੀਮਾ ਪੂਰੀ ਹੋ ਗਈ। ਹੇਠਾਂ ਕਾਰਡ ਵਰਤੋ।', error: 'ਸਮਾਰਟ ਸਰਚ ਹੁਣ ਕੰਮ ਨਹੀਂ ਕਰ ਰਹੀ। ਹੇਠਾਂ ਕਾਰਡ ਵਰਤੋ।' },
  ta: { thinking: 'சரியான பக்கத்தை தேடுகிறோம்...', login: 'ஸ்மார்ட் தேடலுக்கு உள்நுழையவும், அல்லது உரம், நோய், வானிலை, சந்தை போன்ற எளிய சொல்லை எழுதவும்.', limit: 'இன்றைய ஸ்மார்ட் தேடல் வரம்பு முடிந்தது. கீழே உள்ள அட்டைகளைப் பயன்படுத்தவும்.', error: 'ஸ்மார்ட் தேடல் இப்போது வேலை செய்யவில்லை. கீழே உள்ள அட்டைகளைப் பயன்படுத்தவும்.' },
};

type Lang = 'en' | 'gu' | 'hi' | 'mr' | 'pa' | 'ta';
type Target = 'fertilizer' | 'disease' | 'weather' | 'mandi';

const ROUTES: Record<Target, string> = {
  fertilizer: '/calculator',
  disease: '/disease',
  weather: '/weather',
  mandi: '/mandi',
};

const KEYWORDS: Record<Target, string[]> = {
  fertilizer: ['khaad', 'khad', 'fertilizer', 'fertiliser', 'urea', 'dap', 'mop', 'npk', 'dose', 'ખાતર', 'યુરિયા', 'खाद', 'खत', 'उर्वरक', 'यूरिया', 'ਖਾਦ', 'ਯੂਰੀਆ', 'உரம்', 'யூரியா'],
  disease: ['rog', 'keeda', 'kida', 'bimari', 'disease', 'pest', 'insect', 'leaf', 'spot', 'રોગ', 'જીવાત', 'ઈયળ', 'બીમારી', 'रोग', 'कीड़ा', 'कीट', 'बीमारी', 'किड', 'ਰੋਗ', 'ਕੀੜਾ', 'ਬਿਮਾਰੀ', 'நோய்', 'பூச்சி'],
  mandi: ['bhav', 'bhaav', 'mandi', 'rate', 'price', 'market', 'apmc', 'ભાવ', 'મંડી', 'બજાર', 'भाव', 'मंडी', 'मंदी', 'बाजार', 'बाज़ार', 'दर', 'ਭਾਅ', 'ਮੰਡੀ', 'விலை', 'சந்தை'],
  weather: ['mausam', 'mosam', 'barish', 'baarish', 'weather', 'rain', 'temperature', 'garmi', 'હવામાન', 'વરસાદ', 'मौसम', 'बारिश', 'हवामान', 'पाऊस', 'ਮੌਸਮ', 'ਬਾਰਸ਼', 'வானிலை', 'மழை'],
};

const CROP_KEYWORDS: Record<string, string[]> = {
  cotton: ['cotton', 'kapas', 'kapaas', 'કપાસ', 'कपास', 'कापूस', 'ਕਪਾਹ', 'பருத்தி'],
  groundnut: ['groundnut', 'moongfali', 'mungfali', 'peanut', 'મગફળી', 'मूंगफली', 'भुईमूग', 'ਮੂੰਗਫਲੀ', 'நிலக்கடலை'],
  wheat: ['wheat', 'gehu', 'gehun', 'ઘઉં', 'ઘઉ', 'गेहूं', 'गेहू', 'गहू', 'ਕਣਕ', 'கோதுமை'],
  bajra: ['bajra', 'bajri', 'બાજરી', 'बाजरा', 'बाजरी', 'ਬਾਜਰਾ', 'கம்பு'],
  cumin: ['cumin', 'jeera', 'jira', 'જીરું', 'જીરુ', 'जीरा', 'जिरे', 'ਜੀਰਾ', 'சீரகம்'],
};

function detect(text: string): { target: Target | null; crop: string | null } {
  const t = text.toLowerCase().trim();
  if (!t) return { target: null, crop: null };
  let target: Target | null = null;
  for (const key of Object.keys(KEYWORDS) as Target[]) {
    if (KEYWORDS[key].some((w) => t.includes(w))) { target = key; break; }
  }
  let crop: string | null = null;
  for (const [c, words] of Object.entries(CROP_KEYWORDS)) {
    if (words.some((w) => t.includes(w))) { crop = c; break; }
  }
  if (!target && crop) target = 'fertilizer';
  return { target, crop };
}

const TEXT: Record<Lang, any> = {
  en: { hello: 'Hello, farmer', helloName: (n: string) => `Hello, ${n}`, season: 'Current season', placeholder: 'How can I help with your farm?', ask: 'Go', notFound: 'I did not understand. Try words like fertilizer, disease, weather or mandi price — or tap a card below.', quick: 'Quick actions', cards: { fertilizer: { title: 'Fertilizer', sub: 'Urea, DAP, MOP amount' }, disease: { title: 'Disease & pests', sub: 'Find the problem' }, weather: { title: 'Weather', sub: 'Rain and temperature' }, mandi: { title: 'Mandi price', sub: "Today's rates" } }, seasonNames: { kharif: 'Kharif', rabi: 'Rabi', summer: 'Summer' } },
  gu: { hello: 'નમસ્તે, ખેડૂત મિત્ર', helloName: (n: string) => `નમસ્તે, ${n}`, season: 'હાલની સીઝન', placeholder: 'ખેતીમાં કેવી મદદ જોઈએ?', ask: 'જાઓ', notFound: 'સમજાયું નહીં. ખાતર, રોગ, હવામાન કે મંડી ભાવ જેવા શબ્દો લખો — અથવા નીચેના કાર્ડ દબાવો.', quick: 'ઝડપી વિકલ્પો', cards: { fertilizer: { title: 'ખાતર', sub: 'યુરિયા, DAP, MOP ની માત્રા' }, disease: { title: 'રોગ અને જીવાત', sub: 'સમસ્યા ઓળખો' }, weather: { title: 'હવામાન', sub: 'વરસાદ અને તાપમાન' }, mandi: { title: 'મંડી ભાવ', sub: 'આજના ભાવ' } }, seasonNames: { kharif: 'ખરીફ', rabi: 'રવિ', summer: 'ઉનાળુ' } },
  hi: { hello: 'नमस्ते, किसान भाई', helloName: (n: string) => `नमस्ते, ${n}`, season: 'अभी का मौसम (सीज़न)', placeholder: 'खेती में क्या मदद चाहिए?', ask: 'चलें', notFound: 'समझ नहीं आया। खाद, रोग, मौसम या मंडी भाव जैसे शब्द लिखें — या नीचे के कार्ड दबाएँ।', quick: 'तुरंत विकल्प', cards: { fertilizer: { title: 'खाद', sub: 'यूरिया, DAP, MOP की मात्रा' }, disease: { title: 'रोग और कीट', sub: 'समस्या पहचानें' }, weather: { title: 'मौसम', sub: 'बारिश और तापमान' }, mandi: { title: 'मंडी भाव', sub: 'आज के भाव' } }, seasonNames: { kharif: 'खरीफ', rabi: 'रबी', summer: 'गर्मी' } },
  mr: { hello: 'नमस्कार, शेतकरी मित्रा', helloName: (n: string) => `नमस्कार, ${n}`, season: 'सध्याचा हंगाम', placeholder: 'शेतीत कोणती मदत हवी?', ask: 'जा', notFound: 'समजले नाही. खत, रोग, हवामान किंवा मंडी भाव असे शब्द लिहा — किंवा खालील कार्ड दाबा.', quick: 'झटपट पर्याय', cards: { fertilizer: { title: 'खत', sub: 'युरिया, DAP, MOP ची मात्रा' }, disease: { title: 'रोग व कीड', sub: 'समस्या ओळखा' }, weather: { title: 'हवामान', sub: 'पाऊस आणि तापमान' }, mandi: { title: 'मंडी भाव', sub: 'आजचे भाव' } }, seasonNames: { kharif: 'खरीप', rabi: 'रब्बी', summer: 'उन्हाळी' } },
  pa: { hello: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਕਿਸਾਨ ਵੀਰ', helloName: (n: string) => `ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ${n}`, season: 'ਮੌਜੂਦਾ ਸੀਜ਼ਨ', placeholder: 'ਖੇਤੀ ਵਿੱਚ ਕਿਹੜੀ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?', ask: 'ਜਾਓ', notFound: 'ਸਮਝ ਨਹੀਂ ਆਇਆ। ਖਾਦ, ਰੋਗ, ਮੌਸਮ ਜਾਂ ਮੰਡੀ ਭਾਅ ਵਰਗੇ ਸ਼ਬਦ ਲਿਖੋ — ਜਾਂ ਹੇਠਾਂ ਕਾਰਡ ਦਬਾਓ।', quick: 'ਤੁਰੰਤ ਚੋਣਾਂ', cards: { fertilizer: { title: 'ਖਾਦ', sub: 'ਯੂਰੀਆ, DAP, MOP ਦੀ ਮਾਤਰਾ' }, disease: { title: 'ਰੋਗ ਅਤੇ ਕੀੜੇ', sub: 'ਸਮੱਸਿਆ ਪਛਾਣੋ' }, weather: { title: 'ਮੌਸਮ', sub: 'ਬਾਰਸ਼ ਅਤੇ ਤਾਪਮਾਨ' }, mandi: { title: 'ਮੰਡੀ ਭਾਅ', sub: 'ਅੱਜ ਦੇ ਭਾਅ' } }, seasonNames: { kharif: 'ਸਾਉਣੀ', rabi: 'ਹਾੜ੍ਹੀ', summer: 'ਗਰਮੀ' } },
  ta: { hello: 'வணக்கம், விவசாயி', helloName: (n: string) => `வணக்கம், ${n}`, season: 'தற்போதைய பருவம்', placeholder: 'விவசாயத்தில் என்ன உதவி வேண்டும்?', ask: 'செல்', notFound: 'புரியவில்லை. உரம், நோய், வானிலை அல்லது சந்தை விலை போன்ற சொற்களை எழுதுங்கள் — அல்லது கீழே உள்ள அட்டையை அழுத்துங்கள்.', quick: 'விரைவு தேர்வுகள்', cards: { fertilizer: { title: 'உரம்', sub: 'யூரியா, DAP, MOP அளவு' }, disease: { title: 'நோய் & பூச்சி', sub: 'பிரச்சினையை கண்டறிக' }, weather: { title: 'வானிலை', sub: 'மழை மற்றும் வெப்பநிலை' }, mandi: { title: 'சந்தை விலை', sub: 'இன்றைய விலை' } }, seasonNames: { kharif: 'காரிஃப்', rabi: 'ரபி', summer: 'கோடை' } },
};

const ICONS: Record<Target, any> = { fertilizer: Calculator, disease: Bug, weather: CloudSun, mandi: TrendingUp };
const ORDER: Target[] = ['fertilizer', 'disease', 'weather', 'mandi'];

function currentSeason(date = new Date()): 'kharif' | 'rabi' | 'summer' {
  const m = date.getMonth() + 1;
  if (m >= 6 && m <= 10) return 'kharif';
  if (m === 11 || m === 12 || m <= 2) return 'rabi';
  return 'summer';
}

export default function AssistantPage() {
  const { language } = useLanguage();
  const { user, session } = useAuth();
  const [, navigate] = useLocation();
  const [text, setText] = useState('');
  const [missed, setMissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const lang: Lang = (['en', 'gu', 'hi', 'mr', 'pa', 'ta'] as const).includes(language as Lang) ? (language as Lang) : 'en';
  const tx = TEXT[lang];
  const name = (user as any)?.name?.trim();
  const season = currentSeason();

  const go = (target: Target, crop?: string | null) => {
    const base = ROUTES[target];
    navigate(target === 'fertilizer' && crop ? `${base}?crop=${crop}` : base);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setNote(''); setMissed('');

    const local = detect(text);
    if (local.target) { go(local.target, local.crop); return; }
    if (!text.trim()) return;

    const token = (session as any)?.access_token;
    if (!token) { setNote(EXTRA[lang].login); return; }
    
    setBusy(true);
    try {
      const r = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      if (r.status === 429) { setNote(EXTRA[lang].limit); return; }
      if (!r.ok) { setNote(EXTRA[lang].error); return; }
      
      const data = await r.json();
      if (data.target && data.target !== 'none' && data.target in ROUTES) {
        go(data.target, data.crop);
      } else {
        setMissed(true);
      }
    } catch {
      setNote(EXTRA[lang].error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-5 px-4 py-5 pb-24">
      <header className="rounded-2xl bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))]">
        <h1 className="text-xl font-bold">{name ? tx.helloName(name) : tx.hello}</h1>
        <p className="mt-1 text-sm opacity-90">{tx.season}: <span className="font-semibold">{tx.seasonNames[season]}</span></p>
      </header>

      <form onSubmit={onSubmit} className="space-y-2">
        <div className="flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-sm">
          <Search className="ml-2 h-5 w-5 shrink-0 opacity-60" />
          <input
            value={text}
            onChange={(e) => { setText(e.target.value); setMissed(false); }}
            placeholder={tx.placeholder}
            className="min-h-11 flex-1 bg-transparent text-base outline-none"
          />
          <button type="submit" className="min-h-11 rounded-xl bg-[hsl(var(--primary))] px-4 text-sm font-bold text-[hsl(var(--primary-foreground))]">
            {busy ? '…' : tx.ask}
          </button>
        </div>
        {busy && <p className="px-1 text-sm opacity-70">{EXTRA[lang].thinking}</p>}
        {note && <p className="px-1 text-sm text-[hsl(var(--muted-foreground))]">{note}</p>}
        {missed && <p className="px-1 text-sm text-[hsl(var(--muted-foreground))]">{tx.notFound}</p>}
      </form>

      <section>
        <h2 className="mb-2 text-sm font-semibold opacity-70">{tx.quick}</h2>
        <div className="grid grid-cols-2 gap-3">
          {ORDER.map((key) => {
            const Icon = ICONS[key];
            return (
              <button key={key} onClick={() => go(key)} className="flex min-h-32 flex-col items-start justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left shadow-sm active:scale-[0.98]">
                <span className="rounded-xl bg-[hsl(var(--primary))] p-2.5 text-[hsl(var(--primary-foreground))]">
                  <Icon className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-base font-bold">{tx.cards[key].title}</span>
                  <span className="block text-xs opacity-70">{tx.cards[key].sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
    }
