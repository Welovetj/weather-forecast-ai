import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

const useGeolocation = () => {
  const [coords, setCoords] = useState(null);
  const [cityName, setCityName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshLocation = useCallback(async (options = {}) => {
    const { silentOnPermissionDenied = false } = options;

    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        if (!silentOnPermissionDenied) {
          setError('Location permission was denied');
        }
        setCoords(null);
        setCityName(null);
        setLoading(false);
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nextCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      const geocodeResults = await Location.reverseGeocodeAsync(nextCoords);
      const city = geocodeResults?.[0]?.city || geocodeResults?.[0]?.subregion || null;

      setCoords(nextCoords);
      setCityName(city);
      return city;
    } catch (err) {
      setError(err?.message || 'Failed to get location');
      setCoords(null);
      setCityName(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialLocation = async () => {
      if (!isMounted) {
        return;
      }

      await refreshLocation({ silentOnPermissionDenied: true });
    };

    loadInitialLocation();

    return () => {
      isMounted = false;
    };
  }, [refreshLocation]);

  return { coords, cityName, loading, error, refreshLocation };
};

export default useGeolocation;