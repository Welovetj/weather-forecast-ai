import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SearchBar = ({ onSearch, onLocate, placeholder = 'Search city', theme = 'light', colors }) => {
  const [city, setCity] = useState('');
  const styles = createStyles(theme, colors);

  const submitSearch = () => {
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      return;
    }

    if (typeof onSearch === 'function') {
      onSearch(trimmedCity);
    }
  };

  const handleLocate = () => {
    if (typeof onLocate === 'function') {
      onLocate();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleLocate}
        style={styles.iconButton}
        accessibilityRole="button"
        accessibilityLabel="Use current location"
      >
        <MaterialCommunityIcons name="map-marker" size={20} color="#0EA5E9" />
      </Pressable>

      <TextInput
        value={city}
        onChangeText={setCity}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={submitSearch}
      />

      <Pressable
        onPress={submitSearch}
        style={styles.searchButton}
        accessibilityRole="button"
        accessibilityLabel="Search city weather"
      >
        <Text style={styles.searchButtonText}>Search</Text>
      </Pressable>
    </View>
  );
};

const createStyles = (theme, colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.15)' : '#E5E7EB',
      borderRadius: 16,
      backgroundColor: colors?.surface || '#FFFFFF',
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.09)' : '#F3F4F6',
      marginRight: 8,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors?.text || '#111827',
      paddingVertical: 8,
    },
    searchButton: {
      marginLeft: 8,
      borderRadius: 12,
      backgroundColor: colors?.accent || '#0EA5E9',
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    searchButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default SearchBar;