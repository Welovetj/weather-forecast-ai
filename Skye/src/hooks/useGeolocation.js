import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

const useGeolocation = () => {
  const [coords, setCoords] = useState(null);
  const [cityName, setCityName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (isMounted) {
            setError('Location permission was denied');
            setLoading(false);
          }
          return;
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

        if (isMounted) {
          setCoords(nextCoords);
          setCityName(city);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Failed to get location');
          setCoords(null);
          setCityName(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return { coords, cityName, loading, error };
};

export default useGeolocation;