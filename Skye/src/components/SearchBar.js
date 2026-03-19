import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const SearchBar = ({ onSearch, onLocate, placeholder = 'Search city' }) => {
  const [city, setCity] = useState('');

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
      <Pressable onPress={handleLocate} style={styles.iconButton}>
        <Text style={styles.icon}>📍</Text>
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

      <Pressable onPress={submitSearch} style={styles.searchButton}>
        <Text style={styles.searchButtonText}>Search</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  icon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 8,
  },
  searchButton: {
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: '#0EA5E9',
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