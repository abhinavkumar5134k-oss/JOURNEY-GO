import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface OpenMeteoWeather {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
}

function weatherLabel(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

function weatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌤️';
}

function travelTip(code: number, temp: number): string {
  if (code >= 95) return 'Storm alert — avoid outdoor travel. Use train or pre-booked cab.';
  if (code >= 51 && code <= 67) return 'Wet roads expected — train is the safest option. Carry an umbrella.';
  if (code >= 71 && code <= 77) return 'Icy surfaces — avoid auto/cab; stick to train.';
  if (code >= 45 && code <= 48) return 'Low visibility — allow extra travel time. Drive slowly.';
  if (temp >= 40) return 'Extreme heat — carry water. AC cabs and trains are recommended.';
  if (temp >= 33) return 'Hot conditions. Good for AC cabs and trains; carry water.';
  if (temp <= 10) return 'Cold conditions — wrap up warm. Train travel is comfortable.';
  return 'Good travel conditions. All transport modes are suitable.';
}

interface Props {
  city: string;
  lat?: number;
  lng?: number;
}

export default function RouteWeather({ city, lat, lng }: Props) {
  const [data, setData] = useState<OpenMeteoWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState('');
  const [error, setError] = useState(false);

  async function fetchWeather(c: string, overrideLat?: number, overrideLng?: number) {
    setLoading(true);
    setError(false);
    try {
      let weatherLat = overrideLat ?? 22.5533;
      let weatherLng = overrideLng ?? 85.8058;

      // If no coordinates provided, geocode the city
      if (!overrideLat || !overrideLng) {
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(c)}&limit=1&countrycodes=in`
          );
          const geoData = await geoRes.json();
          if (geoData[0]) {
            weatherLat = parseFloat(geoData[0].lat);
            weatherLng = parseFloat(geoData[0].lon);
          }
        } catch {
          // Use default Chaibasa coordinates
        }
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${weatherLat}&longitude=${weatherLng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather fetch failed');
      const json: OpenMeteoWeather = await res.json();
      setData(json);
      const now = new Date();
      setUpdatedAt(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchWeather(city, lat, lng); }, [city, lat, lng]);

  if (error) return null;

  const current = data?.current;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-lg">
            {loading ? '🌤️' : current ? weatherIcon(current.weather_code) : '🌤️'}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Weather along route</p>
            <p className="text-xs text-gray-400 font-medium">
              {loading ? 'Fetching via OpenMeteo...' : updatedAt ? `Updated at ${updatedAt}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {current && (
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
              {weatherLabel(current.weather_code)}
            </span>
          )}
          <button
            onClick={() => fetchWeather(city, lat, lng)}
            disabled={loading}
            className="w-7 h-7 flex items-center justify-center"
          >
            <RefreshCw size={13} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      {loading && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-xl h-16 animate-pulse" />
        </div>
      )}

      {current && !loading && (
        <>
          <div className="grid grid-cols-3 divide-x divide-gray-100 mx-4 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 mb-3">
            {[
              { icon: '🌡️', label: 'TEMP', value: `${Math.round(current.temperature_2m)}°C` },
              { icon: '💧', label: 'HUMIDITY', value: `${current.relative_humidity_2m}%` },
              { icon: '💨', label: 'WIND', value: `${Math.round(current.wind_speed_10m * 3.6)} km/h` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex flex-col items-center py-2.5 px-2">
                <span className="text-base mb-0.5">{icon}</span>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
                <p className="text-sm font-black text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Travel tip */}
          <div className="flex items-start gap-2.5 px-4 pb-4">
            <span className="text-blue-500 text-xs mt-0.5 flex-shrink-0">✦</span>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              {travelTip(current.weather_code, current.temperature_2m)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

