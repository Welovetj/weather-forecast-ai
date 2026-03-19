/**
 * Format Utilities
 * Helper functions for formatting various data types
 */

export const formatTemperature = (temp, unit = 'C') => {
  return `${Math.round(temp)}°${unit}`;
};

export const formatHumidity = (humidity) => {
  return `${Math.round(humidity)}%`;
};

export const formatWindSpeed = (speed, unit = 'km/h') => {
  return `${Math.round(speed)} ${unit}`;
};

export const formatPressure = (pressure) => {
  return `${Math.round(pressure)} hPa`;
};

export const formatVisibility = (meters) => {
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
};

export const truncateString = (str, length = 20) => {
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
};
