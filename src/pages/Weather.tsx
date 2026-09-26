import { useEffect, useState } from 'react';
import { Cloud, Droplets, Wind } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { fetchWeather, getCurrentLocation, type WeatherData } from '@/lib/weather';

export default function WeatherPage() {
  const { copy } = useLanguage();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
  try {
    // Timeout with fallback location (Gujarat center)
    const loc = await Promise.race([
      getCurrentLocation(),
      new Promise<{ lat: number; lon: number }>((resolve) =>
        setTimeout(() => resolve({ lat: 22.2587, lon: 71.1924 }), 5000),
      ),
    ]);
    const w = await fetchWeather(loc.lat, loc.lon);
    setData(w);
  } catch (err) {
    setError('Weather fetch failed. Location on karo.');
  } finally {
    setLoading(false);
  }
})();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p className="text-sm">{copy.weatherLoading}</p>;
  if (error) return <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>;
  if (!data) return null;

  return (
    <div className="page-enter">
      <p className="eyebrow">05 / weather</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.05em]">{copy.weather}</h1>

      <div className="mt-6 rounded-[1.35rem] bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))]">
        <div className="flex items-center gap-3">
          <Cloud size={28} />
          <p className="text-4xl font-bold">{Math.round(data.current.temp)}°C</p>
        </div>
        <div className="mt-3 flex gap-5 text-sm opacity-80">
          <span className="flex items-center gap-1">
            <Wind size={14} /> {data.current.windSpeed} km/h
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        {data.daily.map((day) => (
          <div
            key={day.date}
            className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-sm"
          >
            <span className="font-semibold">{day.date}</span>
            <span>
              {Math.round(day.tempMin)}° – {Math.round(day.tempMax)}°
            </span>
            <span className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
              <Droplets size={14} /> {day.rain}mm
            </span>
          </div>
        ))}
      </div>
    </div>
  );
    }
