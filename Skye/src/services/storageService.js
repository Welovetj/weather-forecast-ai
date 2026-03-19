import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service
 * Handles all AsyncStorage operations for local data persistence
 */

const STORAGE_KEYS = {
  LAST_LOCATION: '@skye_last_location',
  USER_PREFERENCES: '@skye_preferences',
  FAVORITE_CITIES: '@skye_favorite_cities',
};

const normalizeCities = (cities) => {
  if (!Array.isArray(cities)) {
    return [];
  }

  const seen = new Set();

  return cities
    .map((city) => (typeof city === 'string' ? city.trim() : ''))
    .filter((city) => {
      if (!city) {
        return false;
      }

      const key = city.toLowerCase();
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 8);
};

export const saveLocation = async (location) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(location));
  } catch (error) {
    console.error('Error saving location:', error);
  }
};

export const getLocation = async () => {
  try {
    const location = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
    return location ? JSON.parse(location) : null;
  } catch (error) {
    console.error('Error retrieving location:', error);
    return null;
  }
};

export const savePreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

export const getPreferences = async () => {
  try {
    const prefs = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return prefs ? JSON.parse(prefs) : null;
  } catch (error) {
    console.error('Error retrieving preferences:', error);
    return null;
  }
};

export const saveFavoriteCities = async (cities) => {
  try {
    const normalizedCities = normalizeCities(cities);
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_CITIES, JSON.stringify(normalizedCities));
  } catch (error) {
    console.error('Error saving favorite cities:', error);
  }
};

export const getFavoriteCities = async () => {
  try {
    const cities = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_CITIES);
    return cities ? normalizeCities(JSON.parse(cities)) : [];
  } catch (error) {
    console.error('Error retrieving favorite cities:', error);
    return [];
  }
};

export const addFavoriteCity = async (city) => {
  const currentCities = await getFavoriteCities();
  const nextCities = normalizeCities([city, ...currentCities]);
  await saveFavoriteCities(nextCities);
  return nextCities;
};

export const removeFavoriteCity = async (cityToRemove) => {
  const currentCities = await getFavoriteCities();
  const nextCities = currentCities.filter(
    (city) => city.toLowerCase() !== String(cityToRemove || '').trim().toLowerCase(),
  );
  await saveFavoriteCities(nextCities);
  return nextCities;
};

export const moveFavoriteCity = async (cityToMove, direction) => {
  const currentCities = await getFavoriteCities();
  const currentIndex = currentCities.findIndex(
    (city) => city.toLowerCase() === String(cityToMove || '').trim().toLowerCase(),
  );

  if (currentIndex < 0) {
    return currentCities;
  }

  const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= currentCities.length) {
    return currentCities;
  }

  const nextCities = [...currentCities];
  const [city] = nextCities.splice(currentIndex, 1);
  nextCities.splice(targetIndex, 0, city);

  await saveFavoriteCities(nextCities);
  return nextCities;
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_LOCATION);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    await AsyncStorage.removeItem(STORAGE_KEYS.FAVORITE_CITIES);
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};
