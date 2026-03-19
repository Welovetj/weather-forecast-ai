import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../hooks';

const getWeatherEmoji = (forecastItem) => {
  const weatherId = forecastItem?.weather?.[0]?.id;
  const main = forecastItem?.weather?.[0]?.main?.toLowerCase();

  if (typeof weatherId === 'number') {
    if (weatherId >= 200 && weatherId < 300) return '⛈️';
    if (weatherId >= 300 && weatherId < 600) return '🌧️';
    if (weatherId >= 600 && weatherId < 700) return '❄️';
    if (weatherId >= 700 && weatherId < 800) return '🌫️';
    if (weatherId === 800) return '☀️';
    if (weatherId > 800 && weatherId <= 804) return '☁️';
  }

  if (main?.includes('clear')) return '☀️';
  if (main?.includes('cloud')) return '☁️';
  if (main?.includes('rain')) return '🌧️';
  if (main?.includes('snow')) return '❄️';
  if (main?.includes('thunder')) return '⛈️';
  return '🌤️';
};

const getDayKey = (item) => {
  if (item?.dt_txt && typeof item.dt_txt === 'string') {
    return item.dt_txt.split(' ')[0];
  }

  if (typeof item?.dt === 'number') {
    return new Date(item.dt * 1000).toISOString().split('T')[0];
  }

  return null;
};

const getHourDistanceToNoon = (item) => {
  if (item?.dt_txt && typeof item.dt_txt === 'string') {
    const hourString = item.dt_txt.split(' ')[1]?.split(':')?.[0];
    const hour = Number(hourString);
    if (!Number.isNaN(hour)) {
      return Math.abs(hour - 12);
    }
  }

  if (typeof item?.dt === 'number') {
    return Math.abs(new Date(item.dt * 1000).getHours() - 12);
  }

  return Number.MAX_SAFE_INTEGER;
};

const ForecastStrip = ({ forecastData }) => {
  const { theme, colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const dailyForecast = useMemo(() => {
    const list = Array.isArray(forecastData)
      ? forecastData
      : Array.isArray(forecastData?.list)
        ? forecastData.list
        : [];

    const grouped = {};

    for (const item of list) {
      const dayKey = getDayKey(item);
      if (!dayKey || typeof item?.main?.temp !== 'number') {
        continue;
      }

      if (!grouped[dayKey]) {
        const dayName = typeof item?.dt === 'number'
          ? new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
          : dayKey;

        grouped[dayKey] = {
          dayKey,
          dayName,
          high: item.main.temp,
          low: item.main.temp,
          representative: item,
        };
      } else {
        grouped[dayKey].high = Math.max(grouped[dayKey].high, item.main.temp);
        grouped[dayKey].low = Math.min(grouped[dayKey].low, item.main.temp);

        const currentDistance = getHourDistanceToNoon(grouped[dayKey].representative);
        const nextDistance = getHourDistanceToNoon(item);
        if (nextDistance < currentDistance) {
          grouped[dayKey].representative = item;
        }
      }
    }

    return Object.values(grouped)
      .sort((a, b) => a.dayKey.localeCompare(b.dayKey))
      .slice(0, 5)
      .map((day) => ({
        dayKey: day.dayKey,
        dayName: day.dayName,
        icon: getWeatherEmoji(day.representative),
        high: Math.round(day.high),
        low: Math.round(day.low),
      }));
  }, [forecastData]);

  if (dailyForecast.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={dailyForecast}
        horizontal
        keyExtractor={(item) => item.dayKey}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.dayText}>{item.dayName}</Text>
            <Text style={styles.emoji}>{item.icon}</Text>
            <Text style={styles.tempText}>{item.high}° / {item.low}°</Text>
          </View>
        )}
      />
    </View>
  );
};

const createStyles = (colors, theme) =>
  StyleSheet.create({
    wrapper: {
      marginTop: 10,
    },
    listContent: {
      paddingHorizontal: 10,
      gap: 10,
    },
    card: {
      width: 108,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme === 'dark' ? 0.2 : 0.1,
      shadowRadius: 8,
      elevation: 3,
      alignItems: 'center',
    },
    dayText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    emoji: {
      fontSize: 30,
      marginTop: 8,
      marginBottom: 8,
    },
    tempText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: '700',
    },
  });

export default ForecastStrip;