/**
 * Weather Utilities
 * Helper functions for weather data processing
 */

export const getWeatherIcon = (condition) => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('cloud')) return 'weather-cloudy';
  if (conditionLower.includes('rain')) return 'weather-rainy';
  if (conditionLower.includes('snow')) return 'weather-snowy-heavy';
  if (conditionLower.includes('thunder')) return 'weather-lightning-rainy';
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) return 'weather-sunny';
  if (conditionLower.includes('wind')) return 'weather-windy';
  
  return 'weather-partly-cloudy';
};

export const getWeatherColor = (condition) => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('cloud')) return '#95A5A6';
  if (conditionLower.includes('rain')) return '#3498DB';
  if (conditionLower.includes('snow')) return '#ECF0F1';
  if (conditionLower.includes('thunder')) return '#2C3E50';
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) return '#FDB813';
  
  return '#007AFF';
};

export const fahrenheitToCelsius = (f) => Math.round((f - 32) * 5/9);
export const celsiusToFahrenheit = (c) => Math.round(c * 9/5 + 32);

export const mphToKmh = (mph) => (mph * 1.60934).toFixed(1);
export const kmhToMph = (kmh) => (kmh / 1.60934).toFixed(1);
