import { useState, useEffect } from 'react';
import axios from 'axios';
import { OPENWEATHER_API_KEY } from '@env';
import {
  WEATHER_API_URL,
  FORECAST_API_URL,
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

      if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
        if (isMounted) {
          setWeatherData(null);
          setForecastData(null);
          setError('OpenWeather API key is missing. Set OPENWEATHER_API_KEY in .env.');
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
          appid: OPENWEATHER_API_KEY,
          units: normalizedUnits,
        };

        const [weatherResponse, forecastResponse] = await Promise.all([
          axios.get(WEATHER_API_URL, {
            params,
            timeout: API_TIMEOUT,
            signal: controller.signal,
          }),
          axios.get(FORECAST_API_URL, {
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
