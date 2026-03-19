import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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

  return (
    <View style={styles.card}>
      <Text style={styles.location}>{cityName}, {country}</Text>

      <Text style={styles.temperature}>
        {typeof temperature === 'number' ? `${Math.round(temperature)}°` : '--'}
      </Text>

      <Text style={styles.condition}>{conditionDescription}</Text>

      <View style={styles.metricsContainer}>
        <Text style={styles.metric}>Feels like: {typeof feelsLike === 'number' ? `${Math.round(feelsLike)}°` : '--'}</Text>
        <Text style={styles.metric}>Humidity: {typeof humidity === 'number' ? `${humidity}%` : '--'}</Text>
        <Text style={styles.metric}>Wind: {typeof windSpeed === 'number' ? `${windSpeed} m/s` : '--'}</Text>
        <Text style={styles.metric}>Visibility: {visibilityKm ? `${visibilityKm} km` : '--'}</Text>
      </View>
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
  metricsContainer: {
    marginTop: 16,
    gap: 8,
  },
  metric: {
    color: '#E5E7EB',
    fontSize: 15,
  },
});

export default WeatherCard;
