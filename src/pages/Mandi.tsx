import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Bell, X, Loader2, Trash2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMandiPrices, type MandiPrice } from '@/lib/mandi';
import { translateCommodity } from '@/lib/commodity-translations';
import { supabase } from '@/lib/supabase';

type GroupedPrice = {
  commodity: string;
  category: string;
  date: string;
  avgModal: number;
  avgMin: number;
  avgMax: number;
  marketCount: number;
};

export default function MandiPage() {
  const { copy, language } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grouped' | 'all'>('grouped');

  // Alert States
  const [alerts, setAlerts] = useState<Record<string, number>>({});
  const [alertCrop, setAlertCrop] = useState<string | null>(null);
  const [alertPrice, setAlertPrice] = useState('');
  const [savingAlert, setSavingAlert] = useState(false);

  const lang = ['en', 'gu', 'hi', 'mr', 'pa', 'ta'].includes(language) ? language : 'en';

  const t = {
    setAlert: { en: 'Set Price Alert', gu: 'ભાવ એલર્ટ સેટ કરો', hi: 'भाव अलर्ट सेट करें', mr: 'दर अलर्ट सेट करा', pa: 'ਭਾਅ ਅਲਰਟ ਸੈੱਟ ਕਰੋ', ta: 'விலை எச்சரிக்கையை அமை' },
    targetPrice: { en: 'Target Price (₹)', gu: 'ટાર્ગેટ ભાવ (₹)', hi: 'लक्ष्य भाव (₹)', mr: 'लक्ष्य दर (₹)', pa: 'ਟਾਰਗੇਟ ਭਾਅ (₹)', ta: 'இலக்கு விலை (₹)' },
    save: { en: 'Save', gu: 'સેવ કરો', hi: 'सेव करें', mr: 'जतन करा', pa: 'ਸੇਵ ਕਰੋ', ta: 'சேமி' },
    cancel: { en: 'Cancel', gu: 'કેન્સલ', hi: 'कैंसिल', mr: 'रद्द करा', pa: 'ਰੱਦ ਕਰੋ', ta: 'ரத்து' },
    removeAlert: { en: 'Remove Alert', gu: 'એલર્ટ હટાવો', hi: 'अलर्ट हटाएं', mr: 'अलर्ट काढा', pa: 'ਅਲਰਟ ਹਟਾਓ', ta: 'எச்சரிக்கையை நீக்கு' },
    alertActive: { en: 'Alert set at ₹', gu: 'એલર્ટ સેટ છે ₹', hi: 'अलर्ट सेट है ₹', mr: 'अलर्ट सेट आहे ₹', pa: 'ਅਲਰਟ ਸੈੱਟ ਹੈ ₹', ta: 'எச்சரிக்கை அமைக்கப்பட்டது ₹' }
  };

  useEffect(() => {
    fetchMandiPrices()
      .then(setPrices)
      .finally(() => setLoading(false));
  }, []);

  // Fetch User Alerts
  useEffect(() => {
    if (!user) return;
    supabase.from('mandi_alerts').select('crop, target_price').eq('user_id', user.id).then(({ data }) => {
      if (data) {
        const alertMap: Record<string, number> = {};
        data.forEach(a => { alertMap[a.crop] = a.target_price; });
        setAlerts(alertMap);
      }
    });
  }, [user]);

  const handleSaveAlert = async () => {
    if (!user) { navigate('/login'); return; }
    if (!alertCrop || !alertPrice) return;

    setSavingAlert(true);
    try {
      const { error } = await supabase.from('mandi_alerts').upsert({
        user_id: user.id,
        crop: alertCrop,
        target_price: Number(alertPrice)
      }, { onConflict: 'user_id,crop' });

      if (error) throw error;
      
      setAlerts(prev => ({ ...prev, [alertCrop]: Number(alertPrice) }));
      setAlertCrop(null);
      setAlertPrice('');
    } catch (err) {
      alert('Alert save nahi hua. Dobara try karein.');
    } finally {
      setSavingAlert(false);
    }
  };

  const handleRemoveAlert = async () => {
    if (!user || !alertCrop) return;
    setSavingAlert(true);
    try {
      const { error } = await supabase.from('mandi_alerts').delete().eq('user_id', user.id).eq('crop', alertCrop);
      if (error) throw error;

      setAlerts(prev => {
        const newAlerts = { ...prev };
        delete newAlerts[alertCrop];
        return newAlerts;
      });
      setAlertCrop(null);
      setAlertPrice('');
    } catch (err) {
      alert('Alert remove nahi hua.');
    } finally {
      setSavingAlert(false);
    }
  };

  // Data Grouping Logic
  const groupedPrices = useMemo(() => {
    const map = new Map<string, { 
      commodity: string; category: string; date: string; 
      modalSum: number; minSum: number; maxSum: number; count: number 
    }>();

    prices.forEach(p => {
      const existing = map.get(p.commodity);
      if (existing) {
        existing.modalSum += p.modalPrice;
        existing.minSum += p.minPrice;
        existing.maxSum += p.maxPrice;
        existing.count += 1;
      } else {
        map.set(p.commodity, {
          commodity: p.commodity,
          category: p.category,
          date: p.date,
          modalSum: p.modalPrice,
          minSum: p.minPrice,
          maxSum: p.maxPrice,
          count: 1,
        });
      }
    });

    return Array.from(map.values()).map(g => ({
      commodity: g.commodity,
      category: g.category,
      date: g.date,
      avgModal: Math.round(g.modalSum / g.count),
      avgMin: Math.round(g.minSum / g.count),
      avgMax: Math.round(g.maxSum / g.count),
      marketCount: g.count
    })).sort((a, b) => a.commodity.localeCompare(b.commodity));
  }, [prices]);
   return (
    <div className="page-enter pb-24 relative">
      <p className="eyebrow">06 / mandi</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.05em]">{copy.mandi}</h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        {language === 'gu' ? 'ગુજરાતના આજના મંડી ભાવ' : language === 'hi' ? 'गुजरात के आज के मंडी भाव' : 'Gujarat ke aaj ke mandi bhav'}
      </p>

      {/* Navigation Cards */}
      <Link href="/sell" className="mt-4 flex items-center gap-3 rounded-[1.35rem] border border-[hsl(var(--primary)/.3)] bg-[hsl(var(--primary)/.08)] p-4 no-underline">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xl">🌾</span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[hsl(var(--foreground))]">Fasal Becho</p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">Apni fasal listing daalo — WhatsApp pe share karo</p>
        </div>
        <ArrowRight size={18} className="shrink-0 text-[hsl(var(--primary))]" />
      </Link>

      <Link href="/listings" className="mt-3 flex items-center gap-3 rounded-[1.35rem] border border-[hsl(var(--primary)/.3)] bg-[hsl(var(--primary)/.08)] p-4 no-underline">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xl">🛒</span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[hsl(var(--foreground))]">Sabki Fasal Dekho</p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">Buyers ki listings — contact karo, kharido</p>
        </div>
        <ArrowRight size={18} className="shrink-0 text-[hsl(var(--primary))]" />
      </Link>

      <Link href="/my-listings" className="mt-3 flex items-center gap-3 rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 no-underline">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[hsl(var(--muted))] text-xl">📋</span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[hsl(var(--foreground))]">Meri Listings</p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">Apni listings manage karo — sold mark, delete</p>
        </div>
        <ArrowRight size={18} className="shrink-0 text-[hsl(var(--primary))]" />
      </Link>

      {/* Mandi Data */}
      {loading ? (
        <p className="mt-6 text-sm">Loading...</p>
      ) : prices.length === 0 ? (
        <p className="mt-6 text-sm text-[hsl(var(--muted-foreground))]">Aaj koi data nahi mila.</p>
      ) : (
        <>
          <div className="mt-6 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-3 text-xs text-[#66511b]">
            {language === 'gu' ? '🌾 કપાસ, મગફળી, ઘઉં — ઓક્ટોબર-ડિસેમ્બરમાં આવશે' : language === 'hi' ? '🌾 कपास, मूंगफली, गेहूँ — अक्टूबर-दिसंबर में आएंगे' : '🌾 Cotton, Groundnut, Wheat — arriving Oct-Dec'}
          </div>

          <div className="mt-4 flex rounded-lg bg-[hsl(var(--muted))] p-1">
            <button onClick={() => setViewMode('grouped')} className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-colors ${viewMode === 'grouped' ? 'bg-white shadow-sm text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
              Group by Crop (Average)
            </button>
            <button onClick={() => setViewMode('all')} className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-colors ${viewMode === 'all' ? 'bg-white shadow-sm text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
              Show All Mandis
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {viewMode === 'grouped' ? (
              groupedPrices.map((p) => {
                const activeAlert = alerts[p.commodity];
                return (
                  <div key={p.commodity} className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{translateCommodity(p.commodity, language)}</h3>
                          <span className={`rounded-md px-2 py-0.5 text-[.6rem] font-bold ${p.category === 'crop' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                            {p.category === 'crop' ? '🌾' : '🥬'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{p.marketCount} mandiyo ka average · {p.date}</p>
                      </div>
                      <div className="ml-3 text-right">
                        <p className="text-xl font-bold">₹{p.avgModal}</p>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Avg Modal</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between border-t border-[hsl(var(--border))] pt-2">
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Avg Min ₹{p.avgMin} · Avg Max ₹{p.avgMax}</p>
                      
                      <button 
                        onClick={() => { setAlertCrop(p.commodity); setAlertPrice(activeAlert ? String(activeAlert) : ''); }}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition-colors ${activeAlert ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        <Bell size={12} className={activeAlert ? 'fill-orange-500' : ''} />
                        {activeAlert ? `${t.alertActive[lang]}${activeAlert}` : t.setAlert[lang]}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              prices.map((p, i) => (
                <div key={`${p.commodity}-${p.market}-${i}`} className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{translateCommodity(p.commodity, language)}</h3>
                        <span className={`rounded-md px-2 py-0.5 text-[.6rem] font-bold ${p.category === 'crop' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {p.category === 'crop' ? '🌾' : '🥬'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{p.market} · {p.date}</p>
                    </div>
                    <p className="ml-3 text-xl font-bold">₹{p.modalPrice}</p>
                  </div>
                  <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">Min ₹{p.minPrice} · Max ₹{p.maxPrice}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ALERT MODAL */}
      {alertCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[hsl(var(--card))] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Bell size={18} /> {t.setAlert[lang]}</h3>
              <button onClick={() => setAlertCrop(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <p className="text-sm font-bold text-[hsl(var(--primary))] mb-3 text-center">
              {translateCommodity(alertCrop, language)}
            </p>
            
            <div>
              <label className="text-xs font-bold text-gray-500">{t.targetPrice[lang]}</label>
              <input 
                type="number" 
                value={alertPrice} 
                onChange={e => setAlertPrice(e.target.value)} 
                placeholder="e.g. 7500"
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-transparent p-3 text-lg font-bold outline-none mt-1" 
              />
            </div>

            <div className="mt-5 flex gap-2">
              {alerts[alertCrop] ? (
                <button onClick={handleRemoveAlert} disabled={savingAlert} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-red-50 py-3 text-sm font-bold text-red-600 disabled:opacity-50">
                  <Trash2 size={16} /> {t.removeAlert[lang]}
                </button>
              ) : (
                <button onClick={() => setAlertCrop(null)} className="flex-1 rounded-xl border border-[hsl(var(--border))] py-3 text-sm font-bold text-gray-600">{t.cancel[lang]}</button>
              )}
              
              <button onClick={handleSaveAlert} disabled={savingAlert || !alertPrice} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-50">
                {savingAlert && <Loader2 className="animate-spin" size={16} />} {t.save[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
          } 
