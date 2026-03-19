import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * WeatherCard Component
 * Displays current weather information
 */
const WeatherCard = ({ temperature, condition, location }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.location}>{location}</Text>
      <Text style={styles.temperature}>{temperature}°C</Text>
      <Text style={styles.condition}>{condition}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  location: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 10,
  },
  condition: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});

export default WeatherCard;
