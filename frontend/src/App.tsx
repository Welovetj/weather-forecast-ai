import { Cloud, AlertCircle } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { ForecastCard } from './components/ForecastCard';
import { ForecastChart } from './components/ForecastChart';
import { AIInsightCard } from './components/AIInsightCard';
import { useWeather } from './hooks/useWeather';
import type { UnitSystem } from './types/weather';
import { useState } from 'react';

export default function App() {
  const { data, loading, error, fetchWeather } = useWeather();
  const [units, setUnits] = useState<UnitSystem>('metric');

  const handleSearch = (city: string, selectedUnits: UnitSystem) => {
    setUnits(selectedUnits);
    fetchWeather(city, selectedUnits);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Subtle animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Cloud className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Weather Forecast AI
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Real-time weather data + AI-powered insights for any city worldwide
          </p>
        </header>

        {/* Search */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-3 bg-red-500/20 border border-red-400/30 rounded-xl px-5 py-4 mb-6 text-red-200"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-64 bg-white/5 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 bg-white/5 rounded-2xl" />
              <div className="h-48 bg-white/5 rounded-2xl" />
            </div>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-4">
            <CurrentWeatherCard weather={data.current} units={units} />
            {data.ai_insight && <AIInsightCard insight={data.ai_insight} />}
            <ForecastChart forecast={data.forecast.forecast} units={units} />
            <ForecastCard forecast={data.forecast.forecast} units={units} />
          </div>
        )}

        {/* Welcome state */}
        {!data && !loading && !error && (
          <div className="text-center py-20 text-gray-500">
            <Cloud className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Search for a city to get started</p>
            <p className="text-sm mt-2">Try &ldquo;London&rdquo;, &ldquo;New York&rdquo;, or &ldquo;Tokyo&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
