import * as Location from 'expo-location';

/**
 * Location Service
 * Handles geolocation operations using expo-location
 */

export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    return results[0];
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
};
