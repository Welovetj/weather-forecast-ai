import axios from 'axios';
import { WEATHER_API_KEY, WEATHER_API_URL } from '../constants/api';

/**
 * Weather Service
 * Handles all API calls related to weather data
 */

export const getWeather = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `${WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
    );
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

export const getForecast = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `${WEATHER_API_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
    );
    return response.data.list;
  } catch (error) {
    throw new Error('Failed to fetch forecast data');
  }
};
