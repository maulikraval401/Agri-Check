import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { Calculator, Bug, CloudSun, TrendingUp, Search, Send, Bot, User } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

type Target = 'fertilizer' | 'disease' | 'weather' | 'mandi';
type Lang = 'en' | 'gu' | 'hi' | 'mr' | 'pa' | 'ta';
type Msg = { role: 'user' | 'bot'; text: string; path?: string | null; crop?: string | null };

const ROUTES: Record<Target, string> = {
  fertilizer: '/calculator',
  disease: '/disease',
  weather: '/weather',
  mandi: '/mandi',
};
const ORDER: Target[] = ['fertilizer', 'disease', 'weather', 'mandi'];
const ICONS: Record<Target, typeof Calculator> = {
  fertilizer: Calculator,
  disease: Bug,
  weather: CloudSun,
  mandi: TrendingUp,
};

// Offline fallback (used when not logged in, limit over, or server error)
const KEYWORDS: Record<Target, string[]> = {
  fertilizer: ['khaad', 'khad', 'fertilizer', 'urea', 'dap', 'ખાતર', 'યુરિયા', 'खाद', 'खत', 'यूरिया', 'ਖਾਦ', 'உரம்'],
  disease: ['rog', 'keeda', 'bimari', 'disease', 'pest', 'રોગ', 'જીવાત', 'रोग', 'कीड़ा', 'कीट', 'किड', 'ਰੋਗ', 'ਕੀੜਾ', 'நோய்', 'பூச்சி'],
  mandi: ['bhav', 'mandi', 'rate', 'price', 'ભાવ', 'મંડી', 'भाव', 'मंडी', 'ਭਾਅ', 'ਮੰਡੀ', 'விலை', 'சந்தை'],
  weather: ['mausam', 'barish', 'weather', 'rain', 'હવામાન', 'વરસાદ', 'मौसम', 'बारिश', 'हवामान', 'पाऊस', 'ਮੌਸਮ', 'ਬਾਰਸ਼', 'வானிலை', 'மழை'],
};
const CROP_KEYWORDS: Record<string, string> = {
  cotton: 'cotton', kapas: 'cotton', 'કપાસ': 'cotton', 'कपास': 'cotton', 'कापूस': 'cotton',
  groundnut: 'groundnut', moongfali: 'groundnut', 'મગફળી': 'groundnut', 'मूंगफली': 'groundnut', 'भुईमूग': 'groundnut',
  wheat: 'wheat', gehu: 'wheat', 'ઘઉં': 'wheat', 'ઘઉ': 'wheat', 'गेहूं': 'wheat', 'गहू': 'wheat', 'ਕਣਕ': 'wheat',
  bajra: 'bajra', bajri: 'bajra', 'બાજરી': 'bajra', 'बाजरा': 'bajra', 'बाजरी': 'bajra',
  cumin: 'cumin', jeera: 'cumin', 'જીરું': 'cumin', 'जीरा': 'cumin', 'जिरे': 'cumin',
};

function localDetect(text: string): { target: Target | null; crop: string | null } {
  const t = text.toLowerCase();
  const target = (Object.keys(KEYWORDS) as Target[]).find((k) => KEYWORDS[k].some((w) => t.includes(w))) ?? null;
  const crop = Object.entries(CROP_KEYWORDS).find(([w]) => t.includes(w))?.[1] ?? null;
  return { target: target ?? (crop ? 'fertilizer' : null), crop };
}

const T: Record<Lang, {
  title: string; sub: string; empty: string; placeholder: string; quick: string; open: string;
  login: string; limit: string; error: string; unknown: string;
  cards: Record<Target, { title: string; sub: string }>;
}> = {
  en: {
    title: 'Agri Assistant', sub: 'Ask about farming', empty: 'Hello! Ask anything about farming 👇',
    placeholder: 'Ask anything about farming...', quick: 'Quick actions', open: 'Open page →',
    login: 'Log in to chat with the assistant. You can still use the cards below.',
    limit: "Today's chat limit is over. Try again tomorrow, or use the cards.",
    error: 'The assistant is not working right now. Try again, or use the cards.',
    unknown: 'I did not understand. Try again or use the cards.',
    cards: {
      fertilizer: { title: 'Fertilizer', sub: 'Urea, DAP dose' }, disease: { title: 'Disease', sub: 'Find the problem' },
      weather: { title: 'Weather', sub: 'Rain & temp' }, mandi: { title: 'Mandi', sub: "Today's rates" },
    },
  },
  gu: {
    title: 'એગ્રી આસિસ્ટન્ટ', sub: 'ખેતી વિશે પૂછો', empty: 'નમસ્તે! ખેતી વિશે કંઈ પણ પૂછો 👇',
    placeholder: 'ખેતી વિશે કંઈ પણ પૂછો...', quick: 'ઝડપી વિકલ્પો', open: 'પેજ ખોલો →',
    login: 'આસિસ્ટન્ટ સાથે વાત કરવા લૉગિન કરો. નીચેના કાર્ડ વાપરી શકો છો.',
    limit: 'આજની ચેટ મર્યાદા પૂરી થઈ. કાલે ફરી પ્રયાસ કરો, અથવા કાર્ડ વાપરો.',
    error: 'આસિસ્ટન્ટ હમણાં કામ કરતો નથી. ફરી પ્રયાસ કરો, અથવા કાર્ડ વાપરો.',
    unknown: 'સમજાયું નહીં. ફરી પ્રયાસ કરો અથવા કાર્ડ વાપરો.',
    cards: {
      fertilizer: { title: 'ખાતર', sub: 'યુરિયા, DAP માત્રા' }, disease: { title: 'રોગ', sub: 'સમસ્યા ઓળખો' },
      weather: { title: 'હવામાન', sub: 'વરસાદ' }, mandi: { title: 'મંડી', sub: 'આજના ભાવ' },
    },
  },
  hi: {
    title: 'एग्री असिस्टेंट', sub: 'खेती के बारे में पूछें', empty: 'नमस्ते! खेती के बारे में कुछ भी पूछें 👇',
    placeholder: 'खेती के बारे में कुछ भी पूछें...', quick: 'तुरंत विकल्प', open: 'पेज खोलें →',
    login: 'असिस्टेंट से बात करने के लिए लॉगिन करें। नीचे के कार्ड इस्तेमाल कर सकते हैं।',
    limit: 'आज की चैट सीमा पूरी हो गई। कल फिर कोशिश करें, या कार्ड इस्तेमाल करें।',
    error: 'असिस्टेंट अभी काम नहीं कर रहा। फिर कोशिश करें, या कार्ड इस्तेमाल करें।',
    unknown: 'समझ नहीं आया। फिर कोशिश करें या कार्ड इस्तेमाल करें।',
    cards: {
      fertilizer: { title: 'खाद', sub: 'यूरिया, DAP मात्रा' }, disease: { title: 'रोग', sub: 'समस्या पहचानें' },
      weather: { title: 'मौसम', sub: 'बारिश' }, mandi: { title: 'मंडी', sub: 'आज के भाव' },
    },
  },
  mr: {
    title: 'अ‍ॅग्री असिस्टंट', sub: 'शेतीबद्दल विचारा', empty: 'नमस्कार! शेतीबद्दल काहीही विचारा 👇',
    placeholder: 'शेतीबद्दल काहीही विचारा...', quick: 'झटपट पर्याय', open: 'पेज उघडा →',
    login: 'असिस्टंटशी बोलण्यासाठी लॉगिन करा. खालील कार्ड वापरू शकता.',
    limit: 'आजची चॅट मर्यादा संपली. उद्या पुन्हा प्रयत्न करा, किंवा कार्ड वापरा.',
    error: 'असिस्टंट सध्या चालत नाही. पुन्हा प्रयत्न करा, किंवा कार्ड वापरा.',
    unknown: 'समजले नाही. पुन्हा प्रयत्न करा किंवा कार्ड वापरा.',
    cards: {
      fertilizer: { title: 'खत', sub: 'युरिया मात्रा' }, disease: { title: 'रोग', sub: 'समस्या ओळखा' },
      weather: { title: 'हवामान', sub: 'पाऊस' }, mandi: { title: 'मंडी', sub: 'आजचे भाव' },
    },
  },
  pa: {
    title: 'ਐਗਰੀ ਅਸਿਸਟੈਂਟ', sub: 'ਖੇਤੀ ਬਾਰੇ ਪੁੱਛੋ', empty: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਖੇਤੀ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ 👇',
    placeholder: 'ਖੇਤੀ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ...', quick: 'ਤੁਰੰਤ ਚੋਣਾਂ', open: 'ਪੰਨਾ ਖੋਲ੍ਹੋ →',
    login: 'ਅਸਿਸਟੈਂਟ ਨਾਲ ਗੱਲ ਕਰਨ ਲਈ ਲਾਗਇਨ ਕਰੋ। ਹੇਠਾਂ ਕਾਰਡ ਵਰਤ ਸਕਦੇ ਹੋ।',
    limit: 'ਅੱਜ ਦੀ ਚੈਟ ਸੀਮਾ ਪੂਰੀ ਹੋ ਗਈ। ਕੱਲ੍ਹ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ, ਜਾਂ ਕਾਰਡ ਵਰਤੋ।',
    error: 'ਅਸਿਸਟੈਂਟ ਹੁਣ ਕੰਮ ਨਹੀਂ ਕਰ ਰਿਹਾ। ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ, ਜਾਂ ਕਾਰਡ ਵਰਤੋ।',
    unknown: 'ਸਮਝ ਨਹੀਂ ਆਇਆ। ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ ਕਾਰਡ ਵਰਤੋ।',
    cards: {
      fertilizer: { title: 'ਖਾਦ', sub: 'ਯੂਰੀਆ ਮਾਤਰਾ' }, disease: { title: 'ਰੋਗ', sub: 'ਸਮੱਸਿਆ' },
      weather: { title: 'ਮੌਸਮ', sub: 'ਬਾਰਿਸ਼' }, mandi: { title: 'ਮੰਡੀ', sub: 'ਅੱਜ ਦੇ ਭਾਅ' },
    },
  },
  ta: {
    title: 'அக்ரி உதவியாளர்', sub: 'விவசாயம் பற்றி கேளுங்கள்', empty: 'வணக்கம்! விவசாயம் பற்றி எதையும் கேளுங்கள் 👇',
    placeholder: 'விவசாயம் பற்றி எதையும் கேளுங்கள்...', quick: 'விரைவு தேர்வுகள்', open: 'பக்கத்தைத் திற →',
    login: 'உதவியாளருடன் பேச உள்நுழையவும். கீழே உள்ள அட்டைகளையும் பயன்படுத்தலாம்.',
    limit: 'இன்றைய அரட்டை வரம்பு முடிந்தது. நாளை முயற்சிக்கவும், அல்லது அட்டைகளைப் பயன்படுத்தவும்.',
    error: 'உதவியாளர் இப்போது வேலை செய்யவில்லை. மீண்டும் முயற்சிக்கவும், அல்லது அட்டைகளைப் பயன்படுத்தவும்.',
    unknown: 'புரியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது அட்டைகளைப் பயன்படுத்தவும்.',
    cards: {
      fertilizer: { title: 'உரம்', sub: 'யூரியா அளவு' }, disease: { title: 'நோய்', sub: 'பிரச்சினை' },
      weather: { title: 'வானிலை', sub: 'மழை' }, mandi: { title: 'சந்தை', sub: 'இன்றைய விலை' },
    },
  },
};

export default function AssistantPage() {
  const { language } = useLanguage();
  const { session } = useAuth();
  const [, navigate] = useLocation();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const lang: Lang = (['en', 'gu', 'hi', 'mr', 'pa', 'ta'] as const).includes(language as Lang)
    ? (language as Lang)
    : 'en';
  const tx = T[lang];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  const go = (target: Target, crop?: string | null) => {
    const base = ROUTES[target];
    navigate(target === 'fertilizer' && crop ? `${base}?crop=${crop}` : base);
  };

  const openPath = (path: string, crop?: string | null) => {
    const target = (Object.keys(ROUTES) as Target[]).find((k) => ROUTES[k] === path);
    if (target) go(target, crop);
  };

  // Bot message that uses keywords only (no AI): shows the page button if a keyword matched
  const fallbackReply = (userText: string, note: string): Msg => {
    const { target, crop } = localDetect(userText);
    return { role: 'bot', text: note, path: target ? ROUTES[target] : null, crop };
  };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const userText = text.trim();
    if (busy || !userText) return;

    const previous = msgs;
    setText('');
    setMsgs((m) => [...m, { role: 'user', text: userText }]);

    const token = session?.access_token;
    if (!token) {
      setMsgs((m) => [...m, fallbackReply(userText, tx.login)]);
      return;
    }

    setBusy(true);
    try {
      const r = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          text: userText,
          lang,
          history: previous.slice(-6).map(({ role, text: t }) => ({ role, text: t })),
        }),
      });
      if (r.status === 429) {
        setMsgs((m) => [...m, fallbackReply(userText, tx.limit)]);
        return;
      }
      if (!r.ok) {
        setMsgs((m) => [...m, fallbackReply(userText, tx.error)]);
        return;
      }
      const data = (await r.json()) as { reply?: string; path?: string | null; crop?: string | null };
      const crop = data.crop ?? localDetect(userText).crop;
      setMsgs((m) => [...m, { role: 'bot', text: data.reply && data.reply !== '...' ? data.reply : tx.unknown, path: data.path ?? null, crop }]);
    } catch {
      setMsgs((m) => [...m, fallbackReply(userText, tx.error)]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-5 pb-40">
      <header className="mb-4 flex items-center gap-3 rounded-2xl bg-[hsl(var(--primary))] p-4 text-[hsl(var(--primary-foreground))]">
        <Bot size={28} aria-hidden />
        <div>
          <h1 className="text-lg font-bold">{tx.title}</h1>
          <p className="text-xs opacity-90">{tx.sub}</p>
        </div>
      </header>

      <div className="mb-4 min-h-[200px] space-y-3" aria-live="polite">
        {msgs.length === 0 && (
          <div className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">{tx.empty}</div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'bot' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
                <Bot size={16} aria-hidden />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))]'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.path && (
                <button
                  onClick={() => openPath(m.path as string, m.crop)}
                  className="mt-2 min-h-9 rounded-lg bg-[hsl(var(--primary))] px-3 text-xs font-bold text-[hsl(var(--primary-foreground))]"
                >
                  {tx.open}
                </button>
              )}
            </div>
            {m.role === 'user' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
                <User size={16} aria-hidden />
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="flex justify-start gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
              <Bot size={16} aria-hidden />
            </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[hsl(var(--muted-foreground))]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[hsl(var(--muted-foreground))]" style={{ animationDelay: '0.15s' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[hsl(var(--muted-foreground))]" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick cards stay visible so the app works even if the AI is down */}
      <section className="mb-4">
        <h2 className="mb-2 text-sm font-semibold opacity-70">{tx.quick}</h2>
        <div className="grid grid-cols-2 gap-3">
          {ORDER.map((key) => {
            const Icon = ICONS[key];
            return (
              <button
                key={key}
                onClick={() => go(key)}
                className="flex min-h-24 flex-col items-start justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-left shadow-sm active:scale-[0.98]"
              >
                <span className="rounded-lg bg-[hsl(var(--primary))] p-2 text-[hsl(var(--primary-foreground))]">
                  <Icon size={20} aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-bold">{tx.cards[key].title}</span>
                  <span className="block text-xs opacity-70">{tx.cards[key].sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <form onSubmit={send} className="fixed bottom-20 left-0 right-0 mx-auto max-w-xl px-4">
        <div className="flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-lg">
          <Search className="ml-2 h-5 w-5 shrink-0 opacity-60" aria-hidden />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={tx.placeholder}
            aria-label={tx.placeholder}
            maxLength={300}
            className="min-h-10 flex-1 bg-transparent text-base outline-none"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            aria-label="Send"
            className="min-h-10 rounded-xl bg-[hsl(var(--primary))] px-3 text-[hsl(var(--primary-foreground))] disabled:opacity-40"
          >
            <Send size={18} aria-hidden />
          </button>
        </div>
      </form>
    </div>
  );
  }
