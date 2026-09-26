export type WeatherDay = {
  date: string;
  tempMax: number;
  tempMin: number;
  rain: number;
};

export type WeatherData = {
  current: {
    temp: number;
    windSpeed: number;
  };
  daily: WeatherDay[];
};

export type CityResult = {
  name: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
};

export async function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FKolkata&forecast_days=7`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API failed: ${res.status}`);

  const data = await res.json();

  return {
    current: {
      temp: data.current.temperature_2m,
      windSpeed: data.current.wind_speed_10m,
    },
    daily: data.daily.time.map((date: string, i: number) => ({
      date,
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      rain: data.daily.precipitation_sum[i],
    })),
  };
}

export async function searchCity(query: string): Promise<CityResult[]> {
  if (query.length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=10&language=en&format=json`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  const results = data.results || [];

  return results
    .filter((r: any) => r.country === 'India' || r.country_code === 'IN')
    .map((r: any) => ({
      name: r.name,
      state: r.admin1 || '',
      country: r.country || 'India',
      lat: r.latitude,
      lon: r.longitude,
    }));
}

export function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve) => {
    const FALLBACK = { lat: 22.2587, lon: 71.1924 };

    if (!('geolocation' in navigator)) {
      resolve(FALLBACK);
      return;
    }

    const timeout = setTimeout(() => resolve(FALLBACK), 3000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        clearTimeout(timeout);
        resolve(FALLBACK);
      },
      { timeout: 3000, maximumAge: 600000 },
    );
  });
                     }
