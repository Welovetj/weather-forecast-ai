import { Search, Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { UnitSystem } from '../types/weather';

interface SearchBarProps {
  onSearch: (city: string, units: UnitSystem) => void;
  loading: boolean;
}

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [units, setUnits] = useState<UnitSystem>('metric');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = city.trim();
    if (trimmed) onSearch(trimmed, units);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search city (e.g. London, New York, Tokyo)..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm"
          disabled={loading}
          data-testid="city-input"
        />
      </div>

      <select
        value={units}
        onChange={(e) => setUnits(e.target.value as UnitSystem)}
        className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm"
        disabled={loading}
        data-testid="units-select"
      >
        <option value="metric" className="text-gray-800">°C (Metric)</option>
        <option value="imperial" className="text-gray-800">°F (Imperial)</option>
        <option value="standard" className="text-gray-800">K (Standard)</option>
      </select>

      <button
        type="submit"
        disabled={loading || !city.trim()}
        className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center gap-2"
        data-testid="search-button"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        {loading ? 'Loading...' : 'Search'}
      </button>
    </form>
  );
}
