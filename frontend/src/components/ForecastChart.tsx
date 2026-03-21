import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ForecastDay, UnitSystem } from '../types/weather';
import { formatDate } from '../api/weatherApi';

interface ForecastChartProps {
  forecast: ForecastDay[];
  units: UnitSystem;
}

export function ForecastChart({ forecast, units }: ForecastChartProps) {
  const unitLabel = units === 'imperial' ? '°F' : units === 'standard' ? 'K' : '°C';

  const data = forecast.map((day) => ({
    date: formatDate(day.date).split(',')[0], // Just weekday name
    'High': Math.round(day.temp_max),
    'Low': Math.round(day.temp_min),
    'Rain %': Math.round(day.pop * 100),
  }));

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-white">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">Temperature Trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(v) => `${v}${unitLabel}`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '0.75rem', color: '#fff' }}
            formatter={(value: number, name: string) =>
              name === 'Rain %' ? [`${value}%`, name] : [`${value}${unitLabel}`, name]
            }
          />
          <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="High"
            stroke="#f97316"
            fill="url(#highGradient)"
            strokeWidth={2}
            dot={{ fill: '#f97316', r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="Low"
            stroke="#60a5fa"
            fill="url(#lowGradient)"
            strokeWidth={2}
            dot={{ fill: '#60a5fa', r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
