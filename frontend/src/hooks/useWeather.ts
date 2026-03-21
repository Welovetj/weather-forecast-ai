import { useState, useCallback } from 'react';
import { weatherApi } from '../api/weatherApi';
import type { WeatherWithInsights, UnitSystem } from '../types/weather';

interface UseWeatherState {
  data: WeatherWithInsights | null;
  loading: boolean;
  error: string | null;
}

export function useWeather() {
  const [state, setState] = useState<UseWeatherState>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchWeather = useCallback(async (city: string, units: UnitSystem = 'metric') => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await weatherApi.getInsights(city, units);
      setState({ data, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to fetch weather data. Please try again.';
      setState({ data: null, loading: false, error: message });
    }
  }, []);

  return { ...state, fetchWeather };
}
