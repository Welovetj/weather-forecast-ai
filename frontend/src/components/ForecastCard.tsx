import type { ForecastDay, UnitSystem } from '../types/weather';
import { getWeatherIconUrl, formatTemp, formatDate } from '../api/weatherApi';
import { Droplets } from 'lucide-react';

interface ForecastCardProps {
  forecast: ForecastDay[];
  units: UnitSystem;
}

export function ForecastCard({ forecast, units }: ForecastCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-white">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">5-Day Forecast</h3>
      <div className="space-y-3">
        {forecast.map((day) => (
          <ForecastDayRow key={day.date} day={day} units={units} />
        ))}
      </div>
    </div>
  );
}

function ForecastDayRow({ day, units }: { day: ForecastDay; units: UnitSystem }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
      {/* Date */}
      <span className="text-sm font-medium w-28 text-gray-200">{formatDate(day.date)}</span>

      {/* Icon + description */}
      <div className="flex items-center gap-2 flex-1 px-2">
        <img
          src={getWeatherIconUrl(day.weather.icon)}
          alt={day.weather.description}
          className="w-8 h-8"
        />
        <span className="text-xs text-gray-300 capitalize hidden sm:block">{day.weather.description}</span>
      </div>

      {/* Precipitation */}
      <div className="flex items-center gap-1 text-xs text-blue-300 w-12 justify-end mr-4">
        {day.pop > 0.05 && (
          <>
            <Droplets className="w-3 h-3" />
            <span>{Math.round(day.pop * 100)}%</span>
          </>
        )}
      </div>

      {/* Temp range */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">{formatTemp(day.temp_min, units)}</span>
        <TempBar min={day.temp_min} max={day.temp_max} />
        <span className="font-semibold">{formatTemp(day.temp_max, units)}</span>
      </div>
    </div>
  );
}

function TempBar({ min, max }: { min: number; max: number }) {
  const absMin = -10;
  const absMax = 45;
  const range = absMax - absMin;
  const left = ((min - absMin) / range) * 100;
  const width = ((max - min) / range) * 100;

  return (
    <div className="relative w-20 h-1.5 bg-white/20 rounded-full hidden sm:block">
      <div
        className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400"
        style={{ left: `${left}%`, width: `${Math.max(width, 8)}%` }}
      />
    </div>
  );
}
