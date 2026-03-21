import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SearchBar, UnitToggle, WeatherSceneEffect } from '../components';
import { useGeolocation, useWeather } from '../hooks';
import {
  addFavoriteCity,
  getFavoriteCities,
  moveFavoriteCity,
  removeFavoriteCity,
} from '../services/storageService';
import { getCurrentWeatherByCity } from '../services/weatherService';
import { GOOGLE_MAPS_KEY } from '../constants/api';
import { insertSearch } from '../utils/database';
import { openExternalUrl } from '../utils';

const AnimatedWeatherIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

const glassSurface = (theme) => (
  theme === 'dark' ? 'rgba(13, 20, 34, 0.48)' : 'rgba(255, 255, 255, 0.32)'
);

const glassBorder = (theme) => (
  theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.52)'
);

const getWeatherIconSpec = (weatherData) => {
  const weatherId = weatherData?.weather?.[0]?.id;
  const icon = weatherData?.weather?.[0]?.icon || '';
  const main = weatherData?.weather?.[0]?.main?.toLowerCase();

  if (typeof weatherId === 'number') {
    if (weatherId >= 200 && weatherId < 300) return { name: 'weather-lightning-rainy', motion: 'pulse', color: '#FDE68A' };
    if (weatherId >= 300 && weatherId < 600) return { name: 'weather-pouring', motion: 'drift', color: '#BAE6FD' };
    if (weatherId >= 600 && weatherId < 700) return { name: 'weather-snowy-heavy', motion: 'pulse', color: '#F8FAFC' };
    if (weatherId >= 700 && weatherId < 800) return { name: 'weather-fog', motion: 'drift', color: '#E2E8F0' };
    if (weatherId === 800 && icon.endsWith('n')) return { name: 'weather-night', motion: 'float', color: '#BFDBFE' };
    if (weatherId === 800) return { name: 'weather-sunny', motion: 'pulse', color: '#FDE68A' };
    if (weatherId > 800 && weatherId <= 804) return { name: 'weather-partly-cloudy', motion: 'float', color: '#F8FAFC' };
  }

  if (main?.includes('cloud')) return { name: 'weather-cloudy', motion: 'float', color: '#F8FAFC' };
  if (main?.includes('rain')) return { name: 'weather-rainy', motion: 'drift', color: '#BAE6FD' };
  if (main?.includes('snow')) return { name: 'weather-snowy', motion: 'pulse', color: '#F8FAFC' };
  if (main?.includes('thunder')) return { name: 'weather-lightning', motion: 'pulse', color: '#FDE68A' };
  return icon.endsWith('n')
    ? { name: 'weather-night', motion: 'float', color: '#BFDBFE' }
    : { name: 'weather-partly-cloudy', motion: 'float', color: '#F8FAFC' };
};

const WeatherGlyph = ({ weatherData, size, animated = false, style }) => {
  const animation = useRef(new Animated.Value(0)).current;
  const icon = getWeatherIconSpec(weatherData);

  useEffect(() => {
    if (!animated) {
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [animated, animation]);

  const transform = [];

  if (animated && icon.motion === 'pulse') {
    transform.push({ scale: animation.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) });
  }

  if (animated && icon.motion === 'float') {
    transform.push({ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) });
  }

  if (animated && icon.motion === 'drift') {
    transform.push({ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) });
  }

  const Comp = animated ? AnimatedWeatherIcon : MaterialCommunityIcons;

  return (
    <Comp
      name={icon.name}
      size={size}
      color={icon.color}
      style={[style, animated ? { transform } : null]}
    />
  );
};

const capitalize = (value) => {
  if (!value) {
    return 'No data';
  }

  return value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const getDayPart = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'morning';
  }

  if (hour < 18) {
    return 'afternoon';
  }

  return 'evening';
};

const getSunArcProgress = (weatherData) => {
  const sunrise = weatherData?.sys?.sunrise;
  const sunset = weatherData?.sys?.sunset;

  if (typeof sunrise !== 'number' || typeof sunset !== 'number' || sunset <= sunrise) {
    return 0.5;
  }

  const now = Date.now() / 1000;
  const raw = (now - sunrise) / (sunset - sunrise);
  return Math.min(1, Math.max(0, raw));
};

const getCloudoraBrief = (weatherData, forecastData, unit) => {
  const dayPart = getDayPart();
  const temp = weatherData?.main?.temp;
  const description = (weatherData?.weather?.[0]?.description || '').toLowerCase();
  const forecastList = Array.isArray(forecastData?.list) ? forecastData.list.slice(0, 4) : [];
  const rainLater = forecastList.some((item) => (item.pop ?? 0) >= 0.4);
  const windy = (weatherData?.wind?.speed ?? 0) > 10;

  if (temp == null) {
    return 'A polished read on the conditions ahead.';
  }

  const tempC = unit === 'imperial' ? (temp - 32) * (5 / 9) : temp;
  const opener = dayPart === 'morning'
    ? 'Good morning.'
    : dayPart === 'afternoon'
      ? 'Good afternoon.'
      : 'Good evening.';

  if (description.includes('thunderstorm')) {
    return `${opener} Storm activity is in the mix, so keep plans flexible and stay covered.`;
  }

  if (description.includes('snow')) {
    return `${opener} Snow is shaping the day, with colder air that calls for layers and solid footing.`;
  }

  if (description.includes('rain') || rainLater) {
    return `${opener} Moisture is around, and there is a decent chance of rain later, so keep the day weatherproof.`;
  }

  if (tempC >= 26) {
    return `${opener} The air is running warm and bright, so lighter layers will feel best through the day.`;
  }

  if (tempC <= 5) {
    return `${opener} The temperature stays sharp and cool, so treat this as a layer-first kind of day.`;
  }

  if (windy) {
    return `${opener} Conditions are fairly balanced, but the wind adds an edge, so keep a light outer layer nearby.`;
  }

  return `${opener} Conditions look steady and clean, with a comfortable stretch for most of the day.`;
};

const getWeatherPalette = (weatherData, theme) => {
  const weatherId = weatherData?.weather?.[0]?.id;
  const icon = weatherData?.weather?.[0]?.icon || '';

  if (typeof weatherId === 'number') {
    if (weatherId >= 200 && weatherId < 300) {
      return {
        background: ['#0F172A', '#1E293B', '#475569'],
        hero: ['#1E1B4B', '#312E81', '#1D4ED8'],
        orb: '#7DD3FC',
      };
    }

    if (weatherId >= 300 && weatherId < 600) {
      return {
        background: ['#0F2027', '#203A43', '#2C5364'],
        hero: ['#1E3A5F', '#285E75', '#4C8DA7'],
        orb: '#67E8F9',
      };
    }

    if (weatherId >= 600 && weatherId < 700) {
      return {
        background: ['#6B7A8F', '#A5B4C7', '#E2E8F0'],
        hero: ['#94A3B8', '#CBD5E1', '#E2E8F0'],
        orb: '#FFFFFF',
      };
    }

    if (weatherId >= 700 && weatherId < 800) {
      return {
        background: ['#334155', '#475569', '#94A3B8'],
        hero: ['#475569', '#64748B', '#94A3B8'],
        orb: '#E2E8F0',
      };
    }

    if (weatherId === 800 && icon.endsWith('n')) {
      return {
        background: ['#020617', '#0F172A', '#1E293B'],
        hero: ['#111827', '#1F2937', '#334155'],
        orb: '#93C5FD',
      };
    }

    if (weatherId === 800) {
      return {
        background: ['#082F49', '#0EA5E9', '#67E8F9'],
        hero: ['#0369A1', '#0EA5E9', '#7DD3FC'],
        orb: '#FDE68A',
      };
    }

    if (weatherId > 800) {
      return {
        background: ['#314755', '#4B6584', '#8DA9C4'],
        hero: ['#3B82F6', '#60A5FA', '#93C5FD'],
        orb: '#E0F2FE',
      };
    }
  }

  return theme === 'dark'
    ? {
        background: ['#020617', '#0F172A', '#1E293B'],
        hero: ['#111827', '#1F2937', '#334155'],
        orb: '#93C5FD',
      }
    : {
        background: ['#CFFAFE', '#E0F2FE', '#F8FAFC'],
        hero: ['#BAE6FD', '#E0F2FE', '#FFFFFF'],
        orb: '#0EA5E9',
      };
};

const buildHourlyForecast = (forecastData) => {
  const list = Array.isArray(forecastData?.list) ? forecastData.list : [];

  return list.slice(0, 8).map((item) => ({
    key: String(item.dt),
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    }),
    temp: Math.round(item?.main?.temp ?? 0),
    pop: Math.round((item?.pop ?? 0) * 100),
    weatherItem: item,
  }));
};

const buildDailyForecast = (forecastData) => {
  const list = Array.isArray(forecastData?.list) ? forecastData.list : [];
  const grouped = {};

  list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const key = date.toISOString().split('T')[0];

    if (!grouped[key]) {
      grouped[key] = {
        key,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        high: item.main.temp,
        low: item.main.temp,
        item,
      };
      return;
    }

    grouped[key].high = Math.max(grouped[key].high, item.main.temp);
    grouped[key].low = Math.min(grouped[key].low, item.main.temp);

    const existingHour = new Date(grouped[key].item.dt * 1000).getHours();
    const nextHour = date.getHours();
    if (Math.abs(nextHour - 12) < Math.abs(existingHour - 12)) {
      grouped[key].item = item;
    }
  });

  return Object.values(grouped)
    .slice(0, 5)
    .map((item) => ({
      key: item.key,
      label: item.label,
      high: Math.round(item.high),
      low: Math.round(item.low),
      weatherItem: item.item,
    }));
};

const getInsightChips = (weatherData) => {
  const visibilityKm = typeof weatherData?.visibility === 'number'
    ? `${(weatherData.visibility / 1000).toFixed(1)} km`
    : '--';

  return [
    {
      key: 'feels-like',
      label: 'Feels like',
      value: typeof weatherData?.main?.feels_like === 'number' ? `${Math.round(weatherData.main.feels_like)}°` : '--',
    },
    {
      key: 'humidity',
      label: 'Humidity',
      value: typeof weatherData?.main?.humidity === 'number' ? `${weatherData.main.humidity}%` : '--',
    },
    {
      key: 'wind',
      label: 'Wind',
      value: typeof weatherData?.wind?.speed === 'number' ? `${weatherData.wind.speed} m/s` : '--',
    },
    {
      key: 'visibility',
      label: 'Visibility',
      value: visibilityKm,
    },
  ];
};

const getAirConditions = (weatherData) => [
  {
    key: 'pressure',
    label: 'Pressure',
    value: typeof weatherData?.main?.pressure === 'number' ? `${weatherData.main.pressure} hPa` : '--',
  },
  {
    key: 'clouds',
    label: 'Cloud cover',
    value: typeof weatherData?.clouds?.all === 'number' ? `${weatherData.clouds.all}%` : '--',
  },
  {
    key: 'sunrise',
    label: 'Sunrise',
    value: typeof weatherData?.sys?.sunrise === 'number'
      ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : '--',
  },
  {
    key: 'sunset',
    label: 'Sunset',
    value: typeof weatherData?.sys?.sunset === 'number'
      ? new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : '--',
  },
];

const getTodayFit = (weatherData, unit) => {
  const temp = weatherData?.main?.temp;
  const description = (weatherData?.weather?.[0]?.description || '').toLowerCase();
  const windSpeed = weatherData?.wind?.speed || 0;
  if (temp == null) return null;

  const tempC = unit === 'imperial' ? (temp - 32) * (5 / 9) : temp;

  let top = 'A clean tee';
  let bottom = 'Easy trousers';
  let footwear = 'Comfortable sneakers';
  const extras = [];
  let tone = 'Balanced weather. Keep the outfit sharp but easy.';
  let icon = 'shirt-casual';

  if (tempC >= 28) {
    top = 'Breathable tee or tank';
    bottom = 'Shorts or a light skirt';
    footwear = 'Open sneakers or sandals';
    extras.push('Sunscreen', 'Sunglasses');
    tone = 'Hot and bright. Dress light and stay cool.';
    icon = 'beach';
  } else if (tempC >= 20) {
    top = 'T-shirt or airy blouse';
    bottom = 'Jeans or chinos';
    footwear = 'Low-profile sneakers';
    tone = 'Comfortable and polished. A light layer is optional.';
    icon = 'weather-partly-cloudy';
  } else if (tempC >= 10) {
    top = 'Hoodie or light jacket';
    bottom = 'Long pants';
    footwear = 'Sneakers or light boots';
    tone = 'Cool enough for a layer. Keep a jacket close.';
    icon = 'weather-cloudy';
  } else if (tempC >= 0) {
    top = 'Warm coat over layers';
    bottom = 'Jeans or thermals';
    footwear = 'Boots with grip';
    extras.push('Scarf');
    tone = 'Cold outside. Layer up before you head out.';
    icon = 'snowflake';
  } else {
    top = 'Heavy winter coat';
    bottom = 'Thermal base plus warm pants';
    footwear = 'Insulated winter boots';
    extras.push('Gloves', 'Beanie');
    tone = 'Freezing conditions. Full winter kit is the right move.';
    icon = 'snowflake-alert';
  }

  if (description.includes('rain') || description.includes('drizzle')) {
    extras.push('Umbrella', 'Water-resistant shell');
    tone = 'Wet conditions ahead. Keep the fit weatherproof.';
    icon = 'weather-rainy';
  }

  if (description.includes('snow')) {
    extras.push('Waterproof gloves');
    tone = 'Snow in the air. Prioritize warmth and traction.';
    icon = 'weather-snowy-heavy';
  }

  if (description.includes('thunderstorm')) {
    extras.push('Stay indoors if possible');
    tone = 'Storm risk today. Keep plans flexible and covered.';
    icon = 'weather-lightning-rainy';
  }

  if (windSpeed > 10) {
    extras.push('Windbreaker');
  }

  return {
    icon,
    tone,
    pieces: [
      { key: 'top', label: 'Top', value: top },
      { key: 'bottom', label: 'Bottom', value: bottom },
      { key: 'Footwear', label: 'Footwear', value: footwear },
      { key: 'extras', label: 'Extras', value: extras.length ? extras.join(', ') : 'No extras needed' },
    ],
  };
};

/**
 * HomeScreen
 * Main screen displaying current weather and forecast
 */
const HomeScreen = ({ navigation, theme, colors, unit, setUnit }) => {
  const [cityQuery, setCityQuery] = useState('');
  const [hasManualSelection, setHasManualSelection] = useState(false);
  const [favoriteCities, setFavoriteCities] = useState([]);
  const [compareCities, setCompareCities] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const floatValue = useRef(new Animated.Value(0)).current;

  const {
    cityName,
    loading: locationLoading,
    error: locationError,
    refreshLocation,
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

  useEffect(() => {
    getFavoriteCities()
      .then(setFavoriteCities)
      .catch(() => setFavoriteCities([]));
  }, []);

  useEffect(() => {
    if (favoriteCities.length === 0) {
      setCompareCities([]);
      return;
    }

    let isMounted = true;
    setFavoritesLoading(true);

    Promise.all(
      favoriteCities.map(async (city) => {
        try {
          return await getCurrentWeatherByCity(city, unit);
        } catch (error) {
          return null;
        }
      }),
    )
      .then((results) => {
        if (isMounted) {
          setCompareCities(results.filter(Boolean));
        }
      })
      .finally(() => {
        if (isMounted) {
          setFavoritesLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [favoriteCities, unit]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatValue, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [floatValue]);

  const loading = (locationLoading && !cityQuery) || weatherLoading;
  const isCityNotFound = typeof weatherError === 'string' && weatherError.toLowerCase().includes('city not found');
  const activeError = weatherError || locationError;
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const visualPalette = useMemo(() => getWeatherPalette(weatherData, theme), [weatherData, theme]);
  const fitGuide = useMemo(() => getTodayFit(weatherData, unit), [weatherData, unit]);
  const insightChips = useMemo(() => getInsightChips(weatherData), [weatherData]);
  const airConditions = useMemo(() => getAirConditions(weatherData), [weatherData]);
  const hourlyForecast = useMemo(() => buildHourlyForecast(forecastData), [forecastData]);
  const dailyForecast = useMemo(() => buildDailyForecast(forecastData), [forecastData]);
  const cloudoraBrief = useMemo(() => getCloudoraBrief(weatherData, forecastData, unit), [weatherData, forecastData, unit]);
  const sunArcProgress = useMemo(() => getSunArcProgress(weatherData), [weatherData]);
  const currentCitySaved = favoriteCities.some(
    (city) => city.toLowerCase() === String(weatherData?.name || '').toLowerCase(),
  );
  const floatTranslate = floatValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 18],
  });

  const lastSavedDt = useRef(null);

  useEffect(() => {
    if (!weatherData?.dt) {
      return;
    }

    if (weatherData.dt === lastSavedDt.current) {
      return;
    }

    lastSavedDt.current = weatherData.dt;

    insertSearch({
      location: weatherData.name ?? null,
      latitude: weatherData.coord?.lat ?? null,
      longitude: weatherData.coord?.lon ?? null,
      temp_min: weatherData.main?.temp_min ?? weatherData.main?.temp ?? null,
      temp_max: weatherData.main?.temp_max ?? weatherData.main?.temp ?? null,
      condition: weatherData.weather?.[0]?.description ?? null,
      unit: unit ?? 'metric',
    }).catch((err) => {
      console.warn('Failed to save search history:', err?.message || err);
    });
  }, [weatherData, unit]);

  const handleSearch = (searchedCity) => {
    setHasManualSelection(true);
    setCityQuery(searchedCity);
  };

  const handleLocate = async () => {
    setHasManualSelection(false);

    const nextCity = await refreshLocation();
    if (nextCity) {
      setCityQuery(nextCity);
    } else if (cityName) {
      setCityQuery(cityName);
    }
  };

  const handleSaveCity = async () => {
    if (!weatherData?.name) {
      return;
    }

    const nextCities = await addFavoriteCity(weatherData.name);
    setFavoriteCities(nextCities);
  };

  const handleRemoveCity = async (city) => {
    const nextCities = await removeFavoriteCity(city);
    setFavoriteCities(nextCities);
  };

  const handleSelectFavorite = (city) => {
    setHasManualSelection(true);
    setCityQuery(city);
  };

  const handleMoveFavorite = async (city, direction) => {
    const nextCities = await moveFavoriteCity(city, direction);
    setFavoriteCities(nextCities);
  };

  return (
    <LinearGradient colors={visualPalette.background} style={styles.gradientShell}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.auroraOrb,
          styles.auroraOrbLarge,
          { backgroundColor: visualPalette.orb, transform: [{ translateY: floatTranslate }] },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.auroraOrb,
          styles.auroraOrbSmall,
          { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.34)', transform: [{ translateY: Animated.multiply(floatTranslate, -0.6) }] },
        ]}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brandEyebrow}>CLOUDORA</Text>
            <Text style={styles.headerTitle}>Forecasts with a sharper point of view.</Text>
          </View>
          <Pressable
            onPress={() => navigation?.navigate('Settings')}
            style={[styles.iconButton, { backgroundColor: glassSurface(theme), borderColor: glassBorder(theme) }]}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Text style={styles.iconButtonText}>⚙️</Text>
          </Pressable>
        </View>

        <SearchBar
          onSearch={handleSearch}
          onLocate={handleLocate}
          placeholder="Search by city"
          theme={theme}
          colors={colors}
        />

        <View style={styles.controlsRow}>
          <UnitToggle unit={unit} onToggle={setUnit} theme={theme} colors={colors} />
          <Pressable
            onPress={handleSaveCity}
            disabled={!weatherData?.name || currentCitySaved}
            style={[
              styles.saveButton,
              {
                backgroundColor: currentCitySaved ? 'rgba(255,255,255,0.18)' : glassSurface(theme),
                borderColor: glassBorder(theme),
              },
            ]}
          >
            <Text style={styles.saveButtonText}>{currentCitySaved ? 'Saved' : 'Save City'}</Text>
          </Pressable>
        </View>

        {favoriteCities.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedCitiesRow}>
            {favoriteCities.map((city) => (
              <Pressable
                key={city}
                onPress={() => handleSelectFavorite(city)}
                style={[styles.savedCityChip, { backgroundColor: glassSurface(theme), borderColor: glassBorder(theme) }]}
              >
                <Text style={styles.savedCityText}>{city}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading weather story...</Text>
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
            <LinearGradient colors={visualPalette.hero} style={styles.heroCard}>
              <WeatherSceneEffect weatherData={weatherData} style={styles.sceneEffect} />
              
              <View style={styles.heroTopRow}>
                <View style={styles.heroTextWrap}>
                  <Text style={styles.heroLocation}>{weatherData?.name}, {weatherData?.sys?.country || '--'}</Text>
                  <Text style={styles.heroCondition}>{capitalize(weatherData?.weather?.[0]?.description)}</Text>
                </View>
                <WeatherGlyph weatherData={weatherData} size={56} animated style={styles.heroIcon} />
              </View>

              <Text style={styles.heroTemperature}>
                {typeof weatherData?.main?.temp === 'number' ? `${Math.round(weatherData.main.temp)}°` : '--'}
              </Text>

              <Text style={styles.heroSummary}>{cloudoraBrief}</Text>

              <View style={styles.heroMetaRow}>
                <View style={[styles.heroMetaPill, { backgroundColor: glassSurface(theme), borderColor: glassBorder(theme) }]}>
                  <Text style={styles.heroMetaLabel}>Feels</Text>
                  <Text style={styles.heroMetaValue}>
                    {typeof weatherData?.main?.feels_like === 'number' ? `${Math.round(weatherData.main.feels_like)}°` : '--'}
                  </Text>
                </View>
                <View style={[styles.heroMetaPill, { backgroundColor: glassSurface(theme), borderColor: glassBorder(theme) }]}>
                  <Text style={styles.heroMetaLabel}>Humidity</Text>
                  <Text style={styles.heroMetaValue}>
                    {typeof weatherData?.main?.humidity === 'number' ? `${weatherData.main.humidity}%` : '--'}
                  </Text>
                </View>
              </View>

              <View style={styles.sunArcWrap}>
                <View style={styles.sunArcHeader}>
                  <Text style={styles.sunArcLabel}>Daylight arc</Text>
                  <Text style={styles.sunArcLabel}>{airConditions.find((item) => item.key === 'sunset')?.value || '--'}</Text>
                </View>
                <View style={styles.sunArcTrack}>
                  <View style={styles.sunArcLine} />
                  <MaterialCommunityIcons
                    name="white-balance-sunny"
                    size={22}
                    color="#FDE68A"
                    style={[styles.sunArcIcon, { left: `${sunArcProgress * 100}%` }]}
                  />
                </View>
                <View style={styles.sunArcFooter}>
                  <Text style={styles.sunArcTime}>{airConditions.find((item) => item.key === 'sunrise')?.value || '--'}</Text>
                  <Text style={styles.sunArcTime}>Now</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Quick insight</Text>
              <View style={styles.chipGrid}>
                {insightChips.map((chip) => (
                  <View
                    key={chip.key}
                    style={[styles.infoChip, { backgroundColor: glassSurface(theme), borderColor: glassBorder(theme) }]}
                  >
                    <Text style={styles.infoChipLabel}>{chip.label}</Text>
                    <Text style={styles.infoChipValue}>{chip.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {fitGuide ? (
              <View style={[styles.glassCard, { backgroundColor: glassSurface(theme), borderColor: glassBorder(theme) }]}>
                <View style={styles.fitHeaderRow}>
                  <View>
                    <Text style={styles.cardEyebrow}>CLOUDORA AI</Text>
                    <Text style={styles.sectionTitle}>Today's Fit</Text>
                  </View>
                  <MaterialCommunityIcons name={fitGuide.icon} size={40} color="#E0F2FE" />
                </View>
                <Text style={styles.cardSummary}>{fitGuide.tone}</Text>

                <View style={styles.fitGrid}>
                  {fitGuide.pieces.map((piece) => (
                    <View
                      key={piece.key}
                      style={[styles.fitPiece, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.38)' }]}
                    >
                      <Text style={styles.fitPieceLabel}>{piece.label}</Text>
                      <Text style={styles.fitPieceValue}>{piece.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>City compare</Text>
              {favoritesLoading ? <Text style={styles.sectionHint}>Refreshing your saved cities...</Text> : null}
              {compareCities.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCardsRow}>
                  {compareCities.map((cityWeather) => (
                    <Pressable
                      key={cityWeather.id}
                      onPress={() => handleSelectFavorite(cityWeather.name)}
                      style={[styles.compareCard, { backgroundColor: glassSurface(theme), borderColor: glassBorder(theme) }]}
                    >
                      <View style={styles.compareCardHeader}>
                        <View>
                          <Text style={styles.compareCity}>{cityWeather.name}</Text>
                          <Text style={styles.compareCondition}>{capitalize(cityWeather?.weather?.[0]?.description)}</Text>
                        </View>
                        <View style={styles.compareActionsTop}>
                          <Pressable onPress={() => handleRemoveCity(cityWeather.name)} hitSlop={8}>
                            <Text style={styles.removeCityText}>×</Text>
                          </Pressable>
                        </View>
                      </View>
                      <View style={styles.compareTempRow}>
                        <Text style={styles.compareTemp}>{Math.round(cityWeather?.main?.temp ?? 0)}°</Text>
                        <WeatherGlyph weatherData={cityWeather} size={28} style={styles.compareIcon} />
                      </View>
                      <Text style={styles.compareMeta}>
                        Feels {Math.round(cityWeather?.main?.feels_like ?? 0)}° · Wind {cityWeather?.wind?.speed ?? '--'} m/s
                      </Text>
                      <View style={styles.compareReorderRow}>
                        <Pressable
                          onPress={() => handleMoveFavorite(cityWeather.name, 'left')}
                          style={styles.reorderButton}
                          disabled={favoriteCities[0]?.toLowerCase() === cityWeather.name.toLowerCase()}
                        >
                          <MaterialCommunityIcons
                            name="arrow-left"
                            size={16}
                            color={favoriteCities[0]?.toLowerCase() === cityWeather.name.toLowerCase() ? 'rgba(255,255,255,0.32)' : '#FFFFFF'}
                          />
                          <Text style={styles.reorderButtonText}>Move</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleMoveFavorite(cityWeather.name, 'right')}
                          style={styles.reorderButton}
                          disabled={favoriteCities[favoriteCities.length - 1]?.toLowerCase() === cityWeather.name.toLowerCase()}
                        >
                          <Text style={styles.reorderButtonText}>Move</Text>
                          <MaterialCommunityIcons
                            name="arrow-right"
                            size={16}
                            color={favoriteCities[favoriteCities.length - 1]?.toLowerCase() === cityWeather.name.toLowerCase() ? 'rgba(255,255,255,0.32)' : '#FFFFFF'}
                          />
                        </Pressable>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.sectionHint}>Save cities to compare today’s weather side by side.</Text>
              )}
            </View>

            {hourlyForecast.length > 0 ? (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>Hourly flow</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCardsRow}>
                  {hourlyForecast.map((item) => (
                    <View
                      key={item.key}
                      style={[styles.hourlyCard, { backgroundColor: glassSurface(theme), borderColor: glassBorder(theme) }]}
                    >
                      <Text style={styles.hourlyTime}>{item.time}</Text>
                      <WeatherGlyph weatherData={item.weatherItem} size={28} style={styles.hourlyIcon} />
                      <Text style={styles.hourlyTemp}>{item.temp}°</Text>
                      <Text style={styles.hourlyRain}>Rain {item.pop}%</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {dailyForecast.length > 0 ? (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>5-day outlook</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCardsRow}>
                  {dailyForecast.map((item) => (
                    <View
                      key={item.key}
                      style={[styles.dailyCard, { backgroundColor: glassSurface(theme), borderColor: glassBorder(theme) }]}
                    >
                      <Text style={styles.dailyLabel}>{item.label}</Text>
                      <WeatherGlyph weatherData={item.weatherItem} size={30} style={styles.dailyIcon} />
                      <Text style={styles.dailyTemp}>{item.high}° / {item.low}°</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Air conditions</Text>
              <View style={styles.airGrid}>
                {airConditions.map((item) => (
                  <View
                    key={item.key}
                    style={[styles.airCard, { backgroundColor: glassSurface(theme), borderColor: glassBorder(theme) }]}
                  >
                    <Text style={styles.airLabel}>{item.label}</Text>
                    <Text style={styles.airValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {(() => {
              const lat = weatherData?.coord?.lat;
              const lon = weatherData?.coord?.lon;
              if (typeof lat !== 'number' || typeof lon !== 'number' || !GOOGLE_MAPS_KEY) {
                return null;
              }
              const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=11&size=600x200&maptype=roadmap&key=${GOOGLE_MAPS_KEY}`;
              return (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionLabel}>Location map</Text>
                  <Image
                    source={{ uri: mapUrl }}
                    style={styles.mapImage}
                    resizeMode="cover"
                    accessibilityLabel={`Map of ${weatherData?.name}`}
                  />
                </View>
              );
            })()}

            <Pressable
              onPress={async () => {
                const city = weatherData?.name || 'weather';
                const query = encodeURIComponent(`${city} weather`);
                await openExternalUrl(
                  `https://www.youtube.com/results?search_query=${query}`,
                  `Unable to open YouTube search for ${city} on this device.`,
                );
              }}
              style={[styles.youtubeButton, { backgroundColor: glassSurface(theme), borderColor: glassBorder(theme) }]}
              accessibilityRole="button"
              accessibilityLabel={`Watch ${weatherData?.name} weather on YouTube`}
            >
              <Text style={styles.youtubeButtonText}>{`▶ Watch ${weatherData?.name || 'this city'} on YouTube`}</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
};

const createStyles = (colors, theme) =>
  StyleSheet.create({
    gradientShell: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    contentContainer: {
      paddingTop: 20,
      paddingHorizontal: 16,
      paddingBottom: 32,
      gap: 16,
    },
    auroraOrb: {
      position: 'absolute',
      borderRadius: 999,
      opacity: 0.25,
    },
    auroraOrbLarge: {
      width: 220,
      height: 220,
      top: 40,
      right: -60,
    },
    auroraOrbSmall: {
      width: 140,
      height: 140,
      top: 280,
      left: -20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    brandEyebrow: {
      color: '#E0F2FE',
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 2,
      marginBottom: 8,
    },
    headerTitle: {
      width: 250,
      fontSize: 30,
      fontWeight: '800',
      lineHeight: 36,
      color: '#F8FAFC',
    },
    iconButton: {
      width: 46,
      height: 46,
      borderRadius: 18,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconButtonText: {
      fontSize: 18,
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    saveButton: {
      minWidth: 104,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#F8FAFC',
      fontSize: 14,
      fontWeight: '700',
    },
    savedCitiesRow: {
      gap: 10,
      paddingRight: 8,
    },
    savedCityChip: {
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    savedCityText: {
      color: '#F8FAFC',
      fontWeight: '700',
    },
    loadingWrap: {
      marginTop: 12,
      paddingVertical: 30,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    loadingText: {
      color: '#F8FAFC',
      fontSize: 15,
      opacity: 0.88,
    },
    errorCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#FCA5A5',
      backgroundColor: 'rgba(254, 242, 242, 0.95)',
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
    heroCard: {
      borderRadius: 28,
      padding: 20,
      overflow: 'hidden',
      shadowColor: '#03111F',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: theme === 'dark' ? 0.35 : 0.18,
      shadowRadius: 24,
      elevation: 10,
    },
    sceneEffect: {
      borderRadius: 28,
      zIndex: 1,
    },
    heroTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    heroTextWrap: {
      flex: 1,
    },
    heroLocation: {
      color: '#F8FAFC',
      fontSize: 22,
      fontWeight: '800',
    },
    heroCondition: {
      color: 'rgba(248,250,252,0.78)',
      fontSize: 15,
      marginTop: 6,
    },
    heroIcon: {
      marginTop: 4,
    },
    heroTemperature: {
      marginTop: 18,
      color: '#FFFFFF',
      fontSize: 76,
      fontWeight: '800',
      lineHeight: 84,
    },
    heroSummary: {
      marginTop: 10,
      color: '#E0F2FE',
      fontSize: 16,
      lineHeight: 24,
      maxWidth: 300,
    },
    heroMetaRow: {
      marginTop: 18,
      flexDirection: 'row',
      gap: 10,
    },
    heroMetaPill: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    heroMetaLabel: {
      color: 'rgba(248,250,252,0.72)',
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    heroMetaValue: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
      marginTop: 4,
    },
    sunArcWrap: {
      marginTop: 18,
      gap: 8,
    },
    sunArcHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sunArcLabel: {
      color: 'rgba(248,250,252,0.78)',
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sunArcTrack: {
      height: 42,
      position: 'relative',
      justifyContent: 'flex-end',
      paddingHorizontal: 8,
    },
    sunArcLine: {
      height: 24,
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderRightWidth: 2,
      borderColor: 'rgba(255,255,255,0.28)',
      borderTopLeftRadius: 999,
      borderTopRightRadius: 999,
    },
    sunArcIcon: {
      position: 'absolute',
      top: 0,
      marginLeft: -11,
    },
    sunArcFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sunArcTime: {
      color: '#E0F2FE',
      fontSize: 12,
      fontWeight: '700',
    },
    sectionBlock: {
      gap: 12,
    },
    sectionLabel: {
      color: '#F8FAFC',
      fontSize: 20,
      fontWeight: '800',
    },
    sectionHint: {
      color: 'rgba(248,250,252,0.78)',
      fontSize: 14,
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    infoChip: {
      width: '47%',
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    infoChipLabel: {
      color: 'rgba(248,250,252,0.72)',
      fontSize: 13,
      marginBottom: 6,
    },
    infoChipValue: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '800',
    },
    glassCard: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 18,
      gap: 12,
    },
    fitHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardEyebrow: {
      color: 'rgba(248,250,252,0.72)',
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.8,
    },
    sectionTitle: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '800',
    },
    cardSummary: {
      color: '#E2E8F0',
      fontSize: 15,
      lineHeight: 24,
    },
    fitGrid: {
      gap: 10,
    },
    fitPiece: {
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 4,
    },
    fitPieceLabel: {
      color: 'rgba(248,250,252,0.72)',
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.4,
    },
    fitPieceValue: {
      color: '#FFFFFF',
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '700',
    },
    horizontalCardsRow: {
      gap: 12,
      paddingRight: 10,
    },
    compareCard: {
      width: 220,
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
      gap: 10,
    },
    compareCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10,
    },
    compareActionsTop: {
      alignItems: 'flex-end',
    },
    compareCity: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800',
    },
    compareCondition: {
      color: 'rgba(248,250,252,0.72)',
      marginTop: 4,
      fontSize: 13,
    },
    removeCityText: {
      color: '#FFFFFF',
      fontSize: 24,
      lineHeight: 24,
    },
    compareTemp: {
      color: '#FFFFFF',
      fontSize: 42,
      fontWeight: '800',
    },
    compareTempRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    compareIcon: {
      marginTop: 4,
    },
    compareMeta: {
      color: '#E2E8F0',
      fontSize: 13,
      lineHeight: 20,
    },
    compareReorderRow: {
      marginTop: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    reorderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.14)',
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    reorderButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    hourlyCard: {
      width: 100,
      borderRadius: 22,
      borderWidth: 1,
      paddingVertical: 16,
      paddingHorizontal: 12,
      alignItems: 'center',
    },
    hourlyTime: {
      color: '#E2E8F0',
      fontSize: 13,
      fontWeight: '700',
    },
    hourlyIcon: {
      marginVertical: 10,
    },
    hourlyTemp: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '800',
    },
    hourlyRain: {
      color: '#E0F2FE',
      fontSize: 12,
      marginTop: 8,
    },
    dailyCard: {
      width: 124,
      borderRadius: 22,
      borderWidth: 1,
      paddingVertical: 16,
      paddingHorizontal: 14,
      alignItems: 'center',
    },
    dailyLabel: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    dailyIcon: {
      marginVertical: 12,
    },
    dailyTemp: {
      color: '#E0F2FE',
      fontSize: 15,
      fontWeight: '700',
    },
    airGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    airCard: {
      width: '47%',
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 8,
    },
    airLabel: {
      color: 'rgba(248,250,252,0.72)',
      fontSize: 13,
      fontWeight: '700',
    },
    airValue: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800',
    },
    mapImage: {
      width: '100%',
      height: 160,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    youtubeButton: {
      borderRadius: 16,
      borderWidth: 1,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 4,
    },
    youtubeButtonText: {
      color: '#F8FAFC',
      fontWeight: '700',
      fontSize: 15,
    },
  });

export default HomeScreen;
