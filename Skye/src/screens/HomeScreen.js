import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { WeatherCard } from '../components';
import { useWeather } from '../hooks';

/**
 * HomeScreen
 * Main screen displaying current weather and forecast
 */
const HomeScreen = () => {
  const { weather, loading, error } = useWeather();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading weather...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <WeatherCard
        temperature={weather?.temp}
        condition={weather?.condition}
        location={weather?.location}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
});

export default HomeScreen;
