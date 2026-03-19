import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UNIT_STORAGE_KEY = '@skye_unit';

const useTemperatureUnit = () => {
  const [unit, setUnitState] = useState('metric');

  useEffect(() => {
    let isMounted = true;

    const loadSavedUnit = async () => {
      try {
        const savedUnit = await AsyncStorage.getItem(UNIT_STORAGE_KEY);
        if (isMounted && (savedUnit === 'metric' || savedUnit === 'imperial')) {
          setUnitState(savedUnit);
        }
      } catch (error) {
        console.error('Error loading temperature unit:', error);
      }
    };

    loadSavedUnit();

    return () => {
      isMounted = false;
    };
  }, []);

  const setUnit = useCallback(async (nextUnit) => {
    const normalizedUnit = nextUnit === 'imperial' ? 'imperial' : 'metric';
    setUnitState(normalizedUnit);

    try {
      await AsyncStorage.setItem(UNIT_STORAGE_KEY, normalizedUnit);
    } catch (error) {
      console.error('Error saving temperature unit:', error);
    }
  }, []);

  const toggleUnit = useCallback(() => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  }, [unit, setUnit]);

  return { unit, setUnit, toggleUnit };
};

export default useTemperatureUnit;