import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  WEATHER_API_KEY,
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

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async () => {
      if (!city || !city.trim()) {
        if (isMounted) {
          setWeatherData(null);
          setForecastData(null);
          setError('City name is required');
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
          appid: WEATHER_API_KEY,
          units,
        };

        const [weatherResponse, forecastResponse] = await Promise.all([
          axios.get(WEATHER_API_URL, {
            params,
            timeout: API_TIMEOUT,
          }),
          axios.get(FORECAST_API_URL, {
            params,
            timeout: API_TIMEOUT,
          }),
        ]);

        if (isMounted) {
          setWeatherData(weatherResponse.data);
          setForecastData(forecastResponse.data);
        }
      } catch (err) {
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

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [city, units]);

  return { loading, error, weatherData, forecastData };
};

export default useWeather;
