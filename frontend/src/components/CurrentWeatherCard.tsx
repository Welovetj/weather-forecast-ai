import { Wind, Droplets, Gauge, Eye, Sunrise, Sunset } from 'lucide-react';
import type { CurrentWeather, UnitSystem } from '../types/weather';
import { getWeatherIconUrl, formatTemp, formatTime, getWindDirection } from '../api/weatherApi';

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  units: UnitSystem;
}

export function CurrentWeatherCard({ weather, units }: CurrentWeatherCardProps) {
  const condition = weather.weather[0];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold">
            {weather.city}, {weather.country}
          </h2>
          <p className="text-gray-300 text-sm mt-1">
            {weather.lat.toFixed(2)}°N, {weather.lon.toFixed(2)}°E
          </p>
        </div>
        <img
          src={getWeatherIconUrl(condition.icon)}
          alt={condition.description}
          className="w-16 h-16"
        />
      </div>

      {/* Temperature */}
      <div className="flex items-end gap-4 mb-6">
        <span className="text-7xl font-thin" data-testid="current-temp">
          {formatTemp(weather.temp, units)}
        </span>
        <div className="mb-3 text-gray-300">
          <p className="text-lg capitalize">{condition.description}</p>
          <p className="text-sm">Feels like {formatTemp(weather.feels_like, units)}</p>
          <p className="text-sm">
            H: {formatTemp(weather.temp_max, units)} · L: {formatTemp(weather.temp_min, units)}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatItem
          icon={<Droplets className="w-4 h-4" />}
          label="Humidity"
          value={`${weather.humidity}%`}
        />
        <StatItem
          icon={<Wind className="w-4 h-4" />}
          label="Wind"
          value={`${weather.wind.speed} m/s ${getWindDirection(weather.wind.deg)}`}
        />
        <StatItem
          icon={<Gauge className="w-4 h-4" />}
          label="Pressure"
          value={`${weather.pressure} hPa`}
        />
        {weather.visibility !== undefined && (
          <StatItem
            icon={<Eye className="w-4 h-4" />}
            label="Visibility"
            value={`${(weather.visibility / 1000).toFixed(1)} km`}
          />
        )}
        <StatItem
          icon={<Sunrise className="w-4 h-4" />}
          label="Sunrise"
          value={formatTime(weather.sunrise, weather.timezone)}
        />
        <StatItem
          icon={<Sunset className="w-4 h-4" />}
          label="Sunset"
          value={formatTime(weather.sunset, weather.timezone)}
        />
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-blue-300">{icon}</span>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
