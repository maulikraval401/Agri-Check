import { useEffect, useState, useMemo } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { fetchMandiPrices, type MandiPrice } from '@/lib/mandi';
import { translateCommodity } from '@/lib/commodity-translations';

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
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grouped' | 'all'>('grouped');

  useEffect(() => {
    fetchMandiPrices()
      .then(setPrices)
      .finally(() => setLoading(false));
  }, []);

  // Data ko faslon ke hisaab se group karne ka logic
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

  const currentData = viewMode === 'grouped' ? groupedPrices : prices;

  return (
    <div className="page-enter pb-24">
      <p className="eyebrow">06 / mandi</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.05em]">{copy.mandi}</h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        {language === 'gu'
          ? 'ગુજરાતના આજના મંડી ભાવ'
          : language === 'hi'
            ? 'गुजरात के आज के मंडी भाव'
            : 'Gujarat ke aaj ke mandi bhav'}
      </p>

      {/* Sell My Crop Button */}
      <Link
        href="/sell"
        className="mt-4 flex items-center gap-3 rounded-[1.35rem] border border-[hsl(var(--primary)/.3)] bg-[hsl(var(--primary)/.08)] p-4 no-underline"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xl">
          🌾
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[hsl(var(--foreground))]">
            Fasal Becho
          </p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            Apni fasal listing daalo — WhatsApp pe share karo
          </p>
        </div>
        <ArrowRight size={18} className="shrink-0 text-[hsl(var(--primary))]" />
      </Link>

      {/* Browse Listings Button */}
      <Link
        href="/listings"
        className="mt-3 flex items-center gap-3 rounded-[1.35rem] border border-[hsl(var(--primary)/.3)] bg-[hsl(var(--primary)/.08)] p-4 no-underline"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xl">
          🛒
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[hsl(var(--foreground))]">
            Sabki Fasal Dekho
          </p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            Buyers ki listings — contact karo, kharido
          </p>
        </div>
        <ArrowRight size={18} className="shrink-0 text-[hsl(var(--primary))]" />
      </Link>

      {/* My Listings Button */}
      <Link
        href="/my-listings"
        className="mt-3 flex items-center gap-3 rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 no-underline"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[hsl(var(--muted))] text-xl">
          📋
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[hsl(var(--foreground))]">
            Meri Listings
          </p>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            Apni listings manage karo — sold mark, delete
          </p>
        </div>
        <ArrowRight size={18} className="shrink-0 text-[hsl(var(--primary))]" />
      </Link>

      {loading ? (
        <p className="mt-6 text-sm">Loading...</p>
      ) : prices.length === 0 ? (
        <p className="mt-6 text-sm text-[hsl(var(--muted-foreground))]">
          Aaj koi data nahi mila.
        </p>
      ) : (
        <>
          <div className="mt-6 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-3 text-xs text-[#66511b]">
            {language === 'gu'
              ? '🌾 કપાસ, મગફળી, ઘઉં — ઓક્ટોબર-ડિસેમ્બરમાં આવશે'
              : language === 'hi'
                ? '🌾 कपास, मूंगफली, गेहूँ — अक्टूबर-दिसंबर में आएंगे'
                : '🌾 Cotton, Groundnut, Wheat — arriving Oct-Dec'}
          </div>

          {/* Toggle Button */}
          <div className="mt-4 flex rounded-lg bg-[hsl(var(--muted))] p-1">
            <button
              onClick={() => setViewMode('grouped')}
              className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-colors ${
                viewMode === 'grouped' ? 'bg-white shadow-sm text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'
              }`}
            >
              Group by Crop (Average)
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-colors ${
                viewMode === 'all' ? 'bg-white shadow-sm text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'
              }`}
            >
              Show All Mandis
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {viewMode === 'grouped' ? (
              // Grouped View
              groupedPrices.map((p) => (
                <div
                  key={p.commodity}
                  className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">
                          {translateCommodity(p.commodity, language)}
                        </h3>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[.6rem] font-bold ${
                            p.category === 'crop'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {p.category === 'crop' ? '🌾' : '🥬'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        {p.marketCount} mandiyo ka average · {p.date}
                      </p>
                    </div>
                    <div className="ml-3 text-right">
                      <p className="text-xl font-bold">₹{p.avgModal}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Avg Modal</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                    Avg Min ₹{p.avgMin} · Avg Max ₹{p.avgMax}
                  </p>
                </div>
              ))
            ) : (
              // Detailed View (All Mandis)
              prices.map((p, i) => (
                <div
                  key={`${p.commodity}-${p.market}-${i}`}
                  className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">
                          {translateCommodity(p.commodity, language)}
                        </h3>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[.6rem] font-bold ${
                            p.category === 'crop'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {p.category === 'crop' ? '🌾' : '🥬'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        {p.market} · {p.date}
                      </p>
                    </div>
                    <p className="ml-3 text-xl font-bold">₹{p.modalPrice}</p>
                  </div>
                  <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                    Min ₹{p.minPrice} · Max ₹{p.maxPrice}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
      }
