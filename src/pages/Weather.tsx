import { useEffect, useRef, useState } from 'react';
import { Cloud, Droplets, Wind, MapPin, Search, X } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  fetchWeather,
  getCurrentLocation,
  searchCity,
  type WeatherData,
  type CityResult,
} from '@/lib/weather';

const CITY_KEY = 'agri-check-selected-city';

export default function WeatherPage() {
  const { copy, language } = useLanguage();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Selected location
  const [location, setLocation] = useState<CityResult | null>(null);
  const searchTimer = useRef<number | null>(null);

  // Load saved location
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CITY_KEY);
      if (saved) setLocation(JSON.parse(saved));
    } catch {
      /* silent */
    }
  }, []);

  // Fetch weather
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        let lat: number;
        let lon: number;

        if (location) {
          lat = location.lat;
          lon = location.lon;
        } else {
          const loc = await getCurrentLocation();
          lat = loc.lat;
          lon = loc.lon;
        }

        const w = await fetchWeather(lat, lon);
        if (!cancelled) setData(w);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Weather load nahi ho paya.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location]);

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    searchTimer.current = window.setTimeout(async () => {
      const r = await searchCity(query);
      setResults(r);
      setSearching(false);
    }, 400);

    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [query]);

  const handleSelectCity = (city: CityResult) => {
    setLocation(city);
    setShowSearch(false);
    setQuery('');
    setResults([]);
    try {
      localStorage.setItem(CITY_KEY, JSON.stringify(city));
    } catch {
      /* silent */
    }
  };

  const handleUseMyLocation = () => {
    setLocation(null);
    setShowSearch(false);
    try {
      localStorage.removeItem(CITY_KEY);
    } catch {
      /* silent */
    }
  };

  const locationLabel = location
    ? `${location.name}${location.state ? `, ${location.state}` : ''}`
    : language === 'gu'
      ? 'મારું સ્થાન'
      : language === 'hi'
        ? 'मेरा स्थान'
        : 'My Location';

  return (
    <div className="page-enter">
      <p className="eyebrow">05 / weather</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.05em]">{copy.weather}</h1>

      {/* Location selector */}
      <div className="mt-5 rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-4">
        {!showSearch ? (
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary)/.35)] text-[hsl(var(--primary))]">
              <MapPin size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[.65rem] font-semibold uppercase opacity-60">
                Location
              </p>
              <p className="mt-1 truncate text-sm font-bold">{locationLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              className="flex min-h-10 items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-3 text-xs font-bold"
            >
              <Search size={14} /> Change
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <Search size={16} className="shrink-0 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="City name likho..."
                autoFocus
                className="min-h-10 flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  setQuery('');
                  setResults([]);
                }}
                className="grid h-8 w-8 place-items-center rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            {searching && (
              <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
                Searching...
              </p>
            )}

            {results.length > 0 && (
              <div className="mt-3 max-h-64 overflow-y-auto">
                {results.map((city, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[hsl(var(--muted))]"
                  >
                    <MapPin size={14} className="shrink-0 text-[hsl(var(--primary))]" />
                    <span className="font-semibold">{city.name}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {city.state}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {query.length >= 2 && !searching && results.length === 0 && (
              <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
                Koi city nahi mili
              </p>
            )}

            <button
              type="button"
              onClick={handleUseMyLocation}
              className="mt-3 flex w-full items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs font-bold"
            >
              <MapPin size={14} /> Use my current location
            </button>
          </div>
        )}
      </div>

      {/* Weather data */}
      {loading ? (
        <p className="mt-6 text-sm">Loading...</p>
      ) : error ? (
        <p className="mt-6 text-sm text-[hsl(var(--destructive))]">{error}</p>
      ) : data ? (
        <>
          <div className="mt-5 rounded-[1.35rem] bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))]">
            <p className="text-xs opacity-70">{locationLabel}</p>
            <div className="mt-2 flex items-center gap-3">
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
        </>
      ) : null}
    </div>
  );
        }
