import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@skye_theme';

const THEME_COLORS = {
  light: {
    background: '#F5F7FB',
    surface: '#FFFFFF',
    text: '#111827',
    accent: '#0EA5E9',
  },
  dark: {
    background: '#0B1220',
    surface: '#111827',
    text: '#F3F4F6',
    accent: '#38BDF8',
  },
};

const useTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    let isMounted = true;

    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (isMounted && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, [theme]);

  const colors = useMemo(() => THEME_COLORS[theme], [theme]);

  return { theme, colors, toggleTheme };
};

export default useTheme;