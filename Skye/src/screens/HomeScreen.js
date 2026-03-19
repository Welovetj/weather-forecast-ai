import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ForecastStrip,
  SearchBar,
  UnitToggle,
  WeatherCard,
} from '../components';
import { useGeolocation, useWeather } from '../hooks';

/**
 * HomeScreen
 * Main screen displaying current weather and forecast
 */
const HomeScreen = ({ navigation, theme, colors, unit, setUnit }) => {
  const [cityQuery, setCityQuery] = useState('');
  const [hasManualSelection, setHasManualSelection] = useState(false);

  const {
    cityName,
    loading: locationLoading,
    error: locationError,
  } = useGeolocation();

  const {
    weatherData,
    forecastData,
    loading: weatherLoading,
    error: weatherError,
  } = useWeather(cityQuery, unit);

  useEffect(() => {
    if (!hasManualSelection && cityName) {
      setCityQuery(cityName);
    }
  }, [cityName, hasManualSelection]);

  const loading = (locationLoading && !cityQuery) || weatherLoading;
  const isCityNotFound = typeof weatherError === 'string' && weatherError.toLowerCase().includes('city not found');
  const activeError = weatherError || locationError;
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const handleSearch = (searchedCity) => {
    setHasManualSelection(true);
    setCityQuery(searchedCity);
  };

  const handleLocate = () => {
    setHasManualSelection(false);

    if (cityName) {
      setCityQuery(cityName);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Skye</Text>
        <Pressable onPress={() => navigation?.navigate('Settings')} style={styles.themeButton}>
          <Text style={styles.themeButtonText}>⚙️</Text>
        </Pressable>
      </View>

      <SearchBar onSearch={handleSearch} onLocate={handleLocate} placeholder="Search by city" />

      <View style={styles.controlsRow}>
        <UnitToggle unit={unit} onToggle={setUnit} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading weather...</Text>
        </View>
      ) : null}

      {!loading && activeError ? (
        <View style={[styles.errorCard, isCityNotFound ? styles.errorCardNotFound : null]}>
          <Text style={styles.errorTitle}>{isCityNotFound ? 'City Not Found' : 'Unable to Fetch Weather'}</Text>
          <Text style={styles.errorText}>
            {isCityNotFound
              ? 'Try a different city name, for example: Calgary, Toronto, or London.'
              : activeError}
          </Text>
        </View>
      ) : null}

      {!loading && !activeError && weatherData ? (
        <>
          <WeatherCard weatherData={weatherData} />
          <ForecastStrip forecastData={forecastData} />
        </>
      ) : null}
    </ScrollView>
  );
};

const createStyles = (colors, theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      paddingTop: 20,
      paddingHorizontal: 14,
      paddingBottom: 28,
      gap: 12,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
    },
    themeButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeButtonText: {
      fontSize: 18,
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    loadingWrap: {
      marginTop: 8,
      paddingVertical: 24,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    loadingText: {
      color: colors.text,
      fontSize: 15,
      opacity: 0.85,
    },
    errorCard: {
      marginTop: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#FCA5A5',
      backgroundColor: '#FEF2F2',
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    errorCardNotFound: {
      borderColor: '#F59E0B',
      backgroundColor: '#FFFBEB',
    },
    errorTitle: {
      color: '#991B1B',
      fontWeight: '700',
      fontSize: 15,
      marginBottom: 4,
    },
    errorText: {
      color: '#7F1D1D',
      fontSize: 14,
      lineHeight: 20,
    },
  });

export default HomeScreen;
