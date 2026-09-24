import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  Cloud, Droplets, Calendar, TrendingUp, Leaf, Save, ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { readFarm } from '@/lib/farm-storage';
import {
  getCropAge, getCropStage, getIrrigationAdvice, getEstimatedProfit,
} from '@/lib/farm-logic';
import { fetchWeather, getCurrentLocation } from '@/lib/weather';
import { fetchMandiPrices } from '@/lib/mandi';

export default function FarmDashboard() {
  const { language } = useLanguage();
  const farm = readFarm();

  const [weather, setWeather] = useState<{ temp: number; rain: number } | null>(null);
  const [mandiPrice, setMandiPrice] = useState<number>(0);
  const [soilTest, setSoilTest] = useState<any>(null);

  useEffect(() => {
    if (!farm) return;

    // Fetch weather
    getCurrentLocation()
      .then((loc) => fetchWeather(loc.lat, loc.lon))
      .then((w) => setWeather({ temp: w.current.temp, rain: w.daily[0]?.rain ?? 0 }))
      .catch(() => undefined);

    // Fetch mandi for first crop
    const mainCrop = farm.crops[0];
    fetchMandiPrices()
      .then((prices) => {
        const match = prices.find((p) =>
          p.commodity.toLowerCase().includes(mainCrop.toLowerCase()),
        );
        if (match) setMandiPrice(match.modalPrice);
      })
      .catch(() => undefined);

    // Last soil test
    try {
      const history = JSON.parse(localStorage.getItem('soil-health-checker-history') || '[]');
      if (history[0]) setSoilTest(history[0]);
    } catch {
      // silent
    }
  }, [farm]);

  if (!farm) return null;

  const cropAge = getCropAge(farm.sowingDate);
  const cropTask = getCropStage(farm.crops[0], cropAge);
  const irrigation = getIrrigationAdvice(weather?.rain ?? 0, cropAge);
  const profit = getEstimatedProfit(farm.crops[0], farm.landArea, mandiPrice);

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-enter">
      {/* Greeting */}
      <div className="rounded-[1.5rem] bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))]">
        <p className="eyebrow text-[hsl(var(--secondary))]">{greeting}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-.03em]">{farm.name} 👨‍🌾</h1>
        <p className="mt-2 text-sm opacity-80">
          🌾 {farm.crops.join(' · ')} · {farm.landArea} acres · {farm.village || 'Gujarat'}
        </p>
        <p className="mt-3 text-xs opacity-70">Day {cropAge} of crop</p>
      </div>

      {/* Quick cards */}
      <div className="mt-5 grid gap-3">
        {/* Weather */}
        <div className="flex items-start gap-3 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))]">
            <Cloud size={20} />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase opacity-60">Aaj ka Mausam</p>
            <p className="mt-1 text-lg font-bold">
              {weather ? `${Math.round(weather.temp)}°C` : 'Loading...'}
            </p>
            {weather && (
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                Barish: {weather.rain}mm
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
            <p className="text-xs font-semibold uppercase opacity-60">Sinchai / Irrigation</p>
            <p className="mt-1 text-sm font-bold">
              {irrigation.emoji} {irrigation.advice}
            </p>
          </div>
        </div>

        {/* Today's Task */}
        <div className="flex items-start gap-3 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))]">
            <Calendar size={20} />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase opacity-60">Aaj ka Kaam</p>
            <p className="mt-1 text-sm font-bold">{cropTask}</p>
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
                {farm.crops[0]} Mandi
              </p>
              <p className="mt-1 text-lg font-bold">₹{mandiPrice.toLocaleString()}</p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">per quintal</p>
            </div>
          </div>
        )}

        {/* Soil Test */}
        {soilTest && (
          <div className="flex items-start gap-3 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))]">
              <Leaf size={20} />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase opacity-60">Last Soil Test</p>
              <p className="mt-1 text-sm font-bold">
                N: {soilTest.nutrients?.nitrogen?.status} · P: {soilTest.nutrients?.phosphorus?.status} · K: {soilTest.nutrients?.potassium?.status}
              </p>
            </div>
          </div>
        )}

        {/* Profit */}
        {profit > 0 && (
          <div className="flex items-start gap-3 rounded-[1.35rem] border border-[#a9ccc2] bg-[#deeee9] p-4 text-[#28655e]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/50">
              <Save size={20} />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase opacity-70">Estimated Income</p>
              <p className="mt-1 text-lg font-bold">₹{profit.toLocaleString()}</p>
              <p className="mt-1 text-xs opacity-70">
                {farm.crops[0]} · {farm.landArea} acres
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Farm */}
      <Link
        href="/my-farm"
        className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] text-sm font-bold no-underline"
      >
        Edit My Farm <ArrowRight size={16} />
      </Link>
    </div>
  );
    }
