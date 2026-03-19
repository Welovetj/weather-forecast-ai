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
    return location ? JSON.stringify(location) : null;
  } catch (error) {
    console.error('Error retrieving location:', error);
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
  }
};

export const saveFavoriteCities = async (cities) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_CITIES, JSON.stringify(cities));
  } catch (error) {
    console.error('Error saving favorite cities:', error);
  }
};

export const getFavoriteCities = async () => {
  try {
    const cities = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_CITIES);
    return cities ? JSON.parse(cities) : [];
  } catch (error) {
    console.error('Error retrieving favorite cities:', error);
    return [];
  }
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
