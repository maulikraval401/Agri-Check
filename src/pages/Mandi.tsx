import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { fetchMandiPrices, type MandiPrice } from '@/lib/mandi';
import { translateCommodity } from '@/lib/commodity-translations';

export default function MandiPage() {
  const { copy, language } = useLanguage();
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMandiPrices()
      .then(setPrices)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter">
      <p className="eyebrow">06 / mandi</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.05em]">{copy.mandi}</h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        {language === 'gu'
          ? 'ગુજરાતના આજના મંડી ભાવ'
          : language === 'hi'
            ? 'गुजरात के आज के मंडी भाव'
            : 'Gujarat ke aaj ke mandi bhav'}
      </p>

      {loading ? (
        <p className="mt-6 text-sm">Loading...</p>
      ) : prices.length === 0 ? (
        <p className="mt-6 text-sm text-[hsl(var(--muted-foreground))]">
          Aaj koi data nahi mila.
        </p>
      ) : (
      {/* Season banner */}
<div className="mt-4 rounded-xl border border-[#e6c879] bg-[#fbf0c9] p-3 text-xs text-[#66511b]">
  {language === 'gu'
    ? '🌾 કપાસ, મગફળી, ઘઉં — ઓક્ટોબર-ડિસેમ્બરમાં આવશે'
    : language === 'hi'
      ? '🌾 कपास, मूंगफली, गेहूँ — अक्टूबर-दिसंबर में आएंगे'
      : '🌾 Cotton, Groundnut, Wheat — arriving Oct-Dec'}
      </div>
        <div className="mt-6 grid gap-3">
          {prices.map((p, i) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
