import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  WEATHER_API_KEY,
  WEATHER_API_URL,
  FORECAST_API_URL,
  WEATHER_PROXY_URL,
  API_TIMEOUT,
} from '../constants/api';

/**
 * useWeather Hook
 * Fetches current weather and 5-day forecast by city
 */
const useWeather = (city, units = 'metric') => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const normalizedUnits = units === 'imperial' ? 'imperial' : 'metric';

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchWeather = async () => {
      if (!city || !city.trim()) {
        if (isMounted) {
          setWeatherData(null);
          setForecastData(null);
          setError(null);
          setLoading(false);
        }
        return;
      }

      const shouldUseProxy = Boolean(WEATHER_PROXY_URL);

      if (!shouldUseProxy && (!WEATHER_API_KEY || WEATHER_API_KEY === 'YOUR_API_KEY_HERE')) {
        if (isMounted) {
          setWeatherData(null);
          setForecastData(null);
          setError('OpenWeather API key is missing. Set EXPO_PUBLIC_OPENWEATHER_API_KEY in .env or configure EXPO_PUBLIC_WEATHER_PROXY_URL.');
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        const params = {
          q: city.trim(),
          units: normalizedUnits,
        };

        if (!shouldUseProxy) {
          params.appid = WEATHER_API_KEY;
        }

        const weatherEndpoint = shouldUseProxy ? `${WEATHER_PROXY_URL}/weather` : WEATHER_API_URL;
        const forecastEndpoint = shouldUseProxy ? `${WEATHER_PROXY_URL}/forecast` : FORECAST_API_URL;

        const [weatherResponse, forecastResponse] = await Promise.all([
          axios.get(weatherEndpoint, {
            params,
            timeout: API_TIMEOUT,
            signal: controller.signal,
          }),
          axios.get(forecastEndpoint, {
            params,
            timeout: API_TIMEOUT,
            signal: controller.signal,
          }),
        ]);

        if (isMounted) {
          setWeatherData(weatherResponse.data);
          setForecastData(forecastResponse.data);
        }
      } catch (err) {
        if (controller.signal.aborted || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return;
        }

        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch weather data');
          setWeatherData(null);
          setForecastData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const debounceId = setTimeout(fetchWeather, 350);

    return () => {
      isMounted = false;
      clearTimeout(debounceId);
      controller.abort();
    };
  }, [city, normalizedUnits]);

  return { loading, error, weatherData, forecastData };
};

export default useWeather;
