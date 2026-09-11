import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { fetchMandiPrices, type MandiPrice } from '@/lib/mandi';

export default function MandiPage() {
  const { copy } = useLanguage();
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
      <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
        ⚠️ {copy.mandiDemoNotice}
      </p>

      {loading ? (
        <p className="mt-6 text-sm">{copy.mandiLoading}</p>
      ) : (
        <div className="mt-6 grid gap-3">
          {prices.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{p.commodity}</h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {p.market} · {p.date}
                  </p>
                </div>
                <p className="text-xl font-bold">₹{p.modalPrice}</p>
              </div>
              <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                {copy.mandiMin} ₹{p.minPrice} · {copy.mandiMax} ₹{p.maxPrice}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
