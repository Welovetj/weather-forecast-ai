/**
 * App Configuration Constants
 */

export const APP_CONFIG = {
  name: 'Cloudora',
  version: '1.0.0',
  minTempUnit: 'C', // or 'F'
  speedUnit: 'km/h', // or 'mph'
};

export const LOCATION_CONFIG = {
  enableBackgroundLocation: false,
  desiredAccuracy: 'high',
};

export const CACHE_CONFIG = {
  enableCaching: true,
  cacheExpiry: 600000, // 10 minutes
};
