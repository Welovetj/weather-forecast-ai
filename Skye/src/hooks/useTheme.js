import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@cloudora_theme';

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

// Light between 6 AM and 8 PM, dark otherwise
const getAutoTheme = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20 ? 'light' : 'dark';
};

const useTheme = () => {
  const [themeMode, setThemeModeState] = useState('light'); // 'light' | 'dark' | 'auto'
  const [tick, setTick] = useState(0); // used to refresh auto theme every minute

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (isMounted && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
          setThemeModeState(saved);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Tick every minute so auto theme updates when the hour changes
  useEffect(() => {
    if (themeMode !== 'auto') return;
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, [themeMode]);

  const setThemeMode = useCallback(async (mode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}
  }, []);

  const theme = useMemo(() => {
    // tick is referenced so useMemo re-runs when it changes in auto mode
    void tick;
    return themeMode === 'auto' ? getAutoTheme() : themeMode;
  }, [themeMode, tick]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light';
    setThemeMode(next);
  }, [theme, setThemeMode]);

  const colors = useMemo(() => THEME_COLORS[theme], [theme]);

  return { theme, colors, toggleTheme, themeMode, setThemeMode };
};

export default useTheme;