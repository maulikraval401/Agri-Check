import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { Calculator, Bug, CloudSun, TrendingUp, Search, Send, Bot, User } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

type Target = 'fertilizer' | 'disease' | 'weather' | 'mandi';
const ROUTES: Record<Target, string> = { fertilizer: '/calculator', disease: '/disease', weather: '/weather', mandi: '/mandi' };

const KEYWORDS: Record<Target, string[]> = {
  fertilizer: ['khaad', 'khad', 'fertilizer', 'urea', 'dap', 'mop', 'npk', 'ખાતર', 'યુરિયા', 'खाद', 'खत', 'ਖਾਦ'],
  disease: ['rog', 'keeda', 'kida', 'bimari', 'disease', 'pest', 'રોગ', 'जીવાત', 'रोग', 'ਕੀੜਾ', 'நோய்'],
  mandi: ['bhav', 'bhaav', 'mandi', 'rate', 'price', 'ભાવ', 'મંડી', 'भाव', 'मंडी', 'ਭਾਅ', 'விலை'],
  weather: ['mausam', 'barish', 'weather', 'rain', 'હવામાન', 'વરસાદ', 'मौसम', 'बारिश', 'ਮੌਸਮ', 'மழை'],
};

const CROP_KEYWORDS: Record<string, string> = {
  cotton: 'cotton', kapas: 'cotton', 'કપાસ': 'cotton', 'कपास': 'cotton',
  groundnut: 'groundnut', moongfali: 'groundnut', 'મગફળી': 'groundnut', 'मूंगफली': 'groundnut',
  wheat: 'wheat', gehu: 'wheat', 'ઘઉં': 'wheat', 'गेहूं': 'wheat',
  bajra: 'bajra', 'બાજરી': 'bajra', 'बाजरा': 'bajra',
  cumin: 'cumin', jeera: 'cumin', 'જીરું': 'cumin', 'जीरा': 'cumin',
};

type Msg = { role: 'user' | 'bot'; text: string; path?: string | null; crop?: string | null };

const ICONS: Record<Target, any> = { fertilizer: Calculator, disease: Bug, weather: CloudSun, mandi: TrendingUp };
const ORDER: Target[] = ['fertilizer', 'disease', 'weather', 'mandi'];

const QUICK: Record<string, Record<Target, { title: string; sub: string }>> = {
  en: { fertilizer: { title: 'Fertilizer', sub: 'Urea, DAP dose' }, disease: { title: 'Disease', sub: 'Find the problem' }, weather: { title: 'Weather', sub: 'Rain & temp' }, mandi: { title: 'Mandi', sub: "Today's rates" } },
  gu: { fertilizer: { title: 'ખાતર', sub: 'યુરિયા, DAP માત્રા' }, disease: { title: 'રોગ', sub: 'સમસ્યા ઓળખો' }, weather: { title: 'હવામાન', sub: 'વરસાદ' }, mandi: { title: 'મંડી', sub: 'આજના ભાવ' } },
  hi: { fertilizer: { title: 'खाद', sub: 'यूरिया, DAP मात्रा' }, disease: { title: 'रोग', sub: 'समस्या पहचानें' }, weather: { title: 'मौसम', sub: 'बारिश' }, mandi: { title: 'मंडी', sub: 'आज के भाव' } },
  mr: { fertilizer: { title: 'खत', sub: 'युरिया मात्रा' }, disease: { title: 'रोग', sub: 'समस्या ओळखा' }, weather: { title: 'हवामान', sub: 'पाऊस' }, mandi: { title: 'मंडी', sub: 'आजचे भाव' } },
  pa: { fertilizer: { title: 'ਖਾਦ', sub: 'ਯੂਰੀਆ ਮਾਤਰਾ' }, disease: { title: 'ਰੋਗ', sub: 'ਸਮੱਸਿਆ' }, weather: { title: 'ਮੌਸਮ', sub: 'ਬਾਰਿਸ਼' }, mandi: { title: 'ਮੰਡੀ', sub: 'ਅੱਜ ਦੇ ਭਾਅ' } },
  ta: { fertilizer: { title: 'உரம்', sub: 'யூரியா அளவு' }, disease: { title: 'நோய்', sub: 'பிரச்சினை' }, weather: { title: 'வானிலை', sub: 'மழை' }, mandi: { title: 'சந்தை', sub: 'இன்றைய விலை' } },
};

const PLACEHOLDER: Record<string, string> = {
  en: 'Ask anything about farming...', gu: 'ખેતી વિશે કંઈ પણ પૂછો...', hi: 'खेती के बारे में कुछ भी पूछें...',
  mr: 'शेतीबद्दल काहीही विचारा...', pa: 'ਖੇਤੀ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ...', ta: 'விவசாயம் பற்றி எதையும் கேளுங்கள்...',
};

export default function AssistantPage() {
  const { language } = useLanguage();
  const { user, session } = useAuth();
  const [, navigate] = useLocation();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lang = (['en', 'gu', 'hi', 'mr', 'pa', 'ta'] as const).includes(language as any) ? language : 'en';
  const placeholder = PLACEHOLDER[lang] || PLACEHOLDER.en;
  const quick = QUICK[lang] || QUICK.en;

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  const go = (target: Target, crop?: string | null) => {
    const base = ROUTES[target];
    navigate(target === 'fertilizer' && crop ? `${base}?crop=${crop}` : base);
  };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !text.trim()) return;

    const userMsg = text.trim();
    setText('');
    setMsgs((m) => [...m, { role: 'user', text: userMsg }]);
    setBusy(true);

    // Local keyword shortcut (free, no API)
    const lower = userMsg.toLowerCase();
    let localCrop: string | null = null;
    for (const [k, v] of Object.entries(CROP_KEYWORDS)) {
      if (lower.includes(k)) { localCrop = v; break; }
    }

    const token = (session as any)?.access_token;
    if (!token) {
      setMsgs((m) => [...m, { role: 'bot', text: 'Pehle login karein, phir main aapki poori madad kar paunga.' }]);
      setBusy(false);
      return;
    }

    try {
      const r = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: userMsg }),
      });

      if (r.status === 429) {
        setMsgs((m) => [...m, { role: 'bot', text: 'Aaj ki limit khatam. Kal phir try karein.' }]);
        return;
      }
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setMsgs((m) => [...m, { role: 'bot', text: `Error: ${d.details || d.error || 'Unknown'}` }]);
        return;
      }

      const data = await r.json();
      setMsgs((m) => [...m, { role: 'bot', text: data.reply || '...', path: data.path, crop: data.crop || localCrop }]);
    } catch (err: any) {
      setMsgs((m) => [...m, { role: 'bot', text: `Network error: ${err.message}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-5 pb-32">
      <header className="rounded-2xl bg-[hsl(var(--primary))] p-4 text-[hsl(var(--primary-foreground))] flex items-center gap-3 mb-4">
        <Bot size={28} />
        <div>
          <h1 className="text-lg font-bold">Agri Assistant</h1>
          <p className="text-xs opacity-90">Poochhein, main jawab dunga</p>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="space-y-3 mb-4 min-h-[200px]">
        {msgs.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-8">
            Namaste! Kheti ke baare me kuch bhi poochhein 👇
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'bot' && <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center shrink-0"><Bot size={16} /></div>}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))]'}`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.path && (
                <button
                  onClick={() => {
                    const target = (Object.keys(ROUTES) as Target[]).find((k) => ROUTES[k] === m.path);
                    if (target) go(target, m.crop);
                  }}
                  className="mt-2 rounded-lg bg-[hsl(var(--primary))] text-white text-xs font-bold px-3 py-1.5"
                >
                  Open Page →
                </button>
              )}
            </div>
            {m.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0"><User size={16} /></div>}
          </div>
        ))}
        {busy && (
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center shrink-0"><Bot size={16} /></div>
            <div className="rounded-2xl px-4 py-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="fixed bottom-20 left-0 right-0 mx-auto max-w-xl px-4">
        <div className="flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-lg">
          <Search className="ml-2 h-5 w-5 shrink-0 opacity-60" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="min-h-10 flex-1 bg-transparent text-base outline-none"
            disabled={busy}
          />
          <button type="submit" disabled={busy || !text.trim()} className="min-h-10 rounded-xl bg-[hsl(var(--primary))] px-3 text-white disabled:opacity-40">
            <Send size={18} />
          </button>
        </div>
      </form>

      {/* Quick Cards */}
      {msgs.length === 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold opacity-70">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {ORDER.map((key) => {
              const Icon = ICONS[key];
              return (
                <button key={key} onClick={() => go(key)} className="flex min-h-24 flex-col items-start justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-left shadow-sm active:scale-[0.98]">
                  <span className="rounded-lg bg-[hsl(var(--primary))] p-2 text-white"><Icon size={20} /></span>
                  <span>
                    <span className="block text-sm font-bold">{quick[key].title}</span>
                    <span className="block text-xs opacity-70">{quick[key].sub}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
    }
