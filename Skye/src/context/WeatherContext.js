import React, { createContext, useState, useCallback } from 'react';

/**
 * Weather Context
 * Global state management for weather data
 */

export const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateWeather = useCallback((newWeather) => {
    setWeather(newWeather);
  }, []);

  const updateForecast = useCallback((newForecast) => {
    setForecast(newForecast);
  }, []);

  const value = {
    weather,
    forecast,
    isRefreshing,
    updateWeather,
    updateForecast,
    setIsRefreshing,
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};
