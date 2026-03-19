/**
 * API Constants
 * Weather API configuration and endpoints
 */

// Weather API - OpenWeatherMap (example)
// Get your free API key from https://openweathermap.org/api
export const WEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || 'YOUR_API_KEY_HERE';
export const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
export const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// Request timeout (in ms)
export const API_TIMEOUT = 10000;

// Refresh intervals
export const WEATHER_REFRESH_INTERVAL = 600000; // 10 minutes
export const LOCATION_REFRESH_INTERVAL = 300000; // 5 minutes
