import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GOOGLE_MAPS_KEY } from '../constants/api';
import { openExternalUrl } from '../utils';

/**
 * WeatherCard Component
 * Displays detailed current weather information
 */
const WeatherCard = ({ weatherData }) => {
  const cityName = weatherData?.name || 'Unknown City';
  const country = weatherData?.sys?.country || '--';
  const temperature = weatherData?.main?.temp;
  const feelsLike = weatherData?.main?.feels_like;
  const conditionDescription = weatherData?.weather?.[0]?.description || 'No data';
  const humidity = weatherData?.main?.humidity;
  const windSpeed = weatherData?.wind?.speed;
  const visibilityKm = typeof weatherData?.visibility === 'number'
    ? (weatherData.visibility / 1000).toFixed(1)
    : null;
  const latitude = weatherData?.coord?.lat;
  const longitude = weatherData?.coord?.lon;
  const canRenderMap =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Boolean(GOOGLE_MAPS_KEY);

  const mapUrl = canRenderMap
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=11&size=600x200&maptype=roadmap&key=${GOOGLE_MAPS_KEY}`
    : null;

  const handleOpenYouTube = async () => {
    const query = encodeURIComponent(`${cityName} weather`);
    const youtubeUrl = `https://www.youtube.com/results?search_query=${query}`;
    await openExternalUrl(
      youtubeUrl,
      `Unable to open YouTube search for ${cityName} on this device.`,
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.location}>{cityName}, {country}</Text>

      <Text style={styles.temperature}>
        {typeof temperature === 'number' ? `${Math.round(temperature)}°` : '--'}
      </Text>

      <Text style={styles.condition}>{conditionDescription}</Text>

      {mapUrl ? (
        <Image
          source={{ uri: mapUrl }}
          style={styles.mapImage}
          resizeMode="cover"
          accessibilityLabel="Location static map"
        />
      ) : null}

      <View style={styles.metricsContainer}>
        <Text style={styles.metric}>Feels like: {typeof feelsLike === 'number' ? `${Math.round(feelsLike)}°` : '--'}</Text>
        <Text style={styles.metric}>Humidity: {typeof humidity === 'number' ? `${humidity}%` : '--'}</Text>
        <Text style={styles.metric}>Wind: {typeof windSpeed === 'number' ? `${windSpeed} m/s` : '--'}</Text>
        <Text style={styles.metric}>Visibility: {visibilityKm ? `${visibilityKm} km` : '--'}</Text>
      </View>

      <Pressable
        onPress={handleOpenYouTube}
        style={styles.youtubeButton}
        accessibilityRole="button"
        accessibilityLabel={`Get to know about ${cityName} on YouTube`}
      >
        <View style={styles.youtubeButtonRow}>
          <MaterialCommunityIcons name="youtube" size={17} color="#FF4D4F" />
          <Text style={styles.youtubeButtonText}>{`Get to know about ${cityName} on YouTube`}</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 22,
    margin: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  location: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F3F4F6',
  },
  temperature: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#38BDF8',
    marginTop: 12,
  },
  condition: {
    fontSize: 16,
    color: '#D1D5DB',
    marginTop: 6,
    textTransform: 'capitalize',
  },
  mapImage: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    marginTop: 14,
    backgroundColor: '#1F2937',
  },
  metricsContainer: {
    marginTop: 16,
    gap: 8,
  },
  metric: {
    color: '#E5E7EB',
    fontSize: 15,
  },
  youtubeButton: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(239,68,68,0.16)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  youtubeButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  youtubeButtonText: {
    color: '#FEE2E2',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default WeatherCard;
