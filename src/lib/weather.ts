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

export async function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FKolkata&forecast_days=7`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
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

export function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 10000 },
    );
  });
}
