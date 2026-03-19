import axios from 'axios';
import {
  WEATHER_API_KEY,
  WEATHER_API_URL,
  FORECAST_API_URL,
  API_TIMEOUT,
} from '../constants/api';

/**
 * Weather Service
 * Handles all API calls related to weather data
 */

export const getWeather = async (latitude, longitude, units = 'metric') => {
  try {
    const normalizedUnits = units === 'imperial' ? 'imperial' : 'metric';
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: WEATHER_API_KEY,
        units: normalizedUnits,
      },
      timeout: API_TIMEOUT,
    });

    return {
      temp: response.data.main.temp,
      condition: response.data.weather[0].main,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      location: response.data.name,
    };
  } catch (error) {
    throw new Error('Failed to fetch weather data');
  }
};

export const getCurrentWeatherByCity = async (city, units = 'metric') => {
  try {
    const normalizedUnits = units === 'imperial' ? 'imperial' : 'metric';
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: normalizedUnits,
      },
      timeout: API_TIMEOUT,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch city weather');
  }
};

export const getForecast = async (latitude, longitude) => {
  try {
    const response = await axios.get(FORECAST_API_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: WEATHER_API_KEY,
        units: 'metric',
      },
      timeout: API_TIMEOUT,
    });

    return response.data.list;
  } catch (error) {
    throw new Error('Failed to fetch forecast data');
  }
};
