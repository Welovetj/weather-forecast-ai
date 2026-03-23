import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SearchBar = ({
  onSearch,
  onLocate,
  fetchSuggestions,
  recentSearches = [],
  placeholder = 'Search city',
  theme = 'light',
  colors,
}) => {
  const [city, setCity] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const blurTimeoutRef = useRef(null);
  const styles = createStyles(theme, colors);
  const normalizedCity = city.trim();
  const normalizedRecentSearches = useMemo(
    () => (Array.isArray(recentSearches) ? recentSearches.filter((item) => typeof item === 'string') : []),
    [recentSearches],
  );

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (normalizedCity.length < 2 || typeof fetchSuggestions !== 'function') {
      setSuggestions([]);
      return undefined;
    }

    let isMounted = true;
    const timeoutId = setTimeout(async () => {
      const nextSuggestions = await fetchSuggestions(normalizedCity);
      if (isMounted) {
        setSuggestions(Array.isArray(nextSuggestions) ? nextSuggestions : []);
      }
    }, 220);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [fetchSuggestions, normalizedCity]);

  const dropdownItems = useMemo(() => {
    const seen = new Set();

    const addUnique = (items) => items.filter((item) => {
      const key = String(item?.value || item?.label || '').toLowerCase();
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    const recentItemsBase = normalizedRecentSearches.map((name, index) => ({
      id: `recent-${index}-${name}`,
      label: name,
      value: name,
      type: 'recent',
    }));

    if (!normalizedCity) {
      return addUnique(recentItemsBase).slice(0, 8);
    }

    const queryLower = normalizedCity.toLowerCase();
    const filteredRecent = recentItemsBase.filter((item) => item.label.toLowerCase().includes(queryLower));
    const suggestionItems = suggestions.map((item, index) => ({
      id: item?.id ? `suggestion-${item.id}` : `suggestion-${index}`,
      label: item?.label || item?.value || '',
      value: item?.value || item?.label || '',
      type: 'suggestion',
    }));

    return addUnique([...filteredRecent, ...suggestionItems]).slice(0, 8);
  }, [normalizedCity, normalizedRecentSearches, suggestions]);

  const shouldShowDropdown = isFocused && dropdownItems.length > 0;

  const submitSearch = () => {
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      return;
    }

    if (typeof onSearch === 'function') {
      onSearch(trimmedCity);
    }

    setIsFocused(false);
  };

  const handleLocate = () => {
    if (typeof onLocate === 'function') {
      onLocate();
    }

    setIsFocused(false);
  };

  const handleSelectOption = (option) => {
    const value = String(option?.value || option?.label || '').trim();
    if (!value) {
      return;
    }

    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    setCity(value);
    setIsFocused(false);

    if (typeof onSearch === 'function') {
      onSearch(value);
    }
  };

  const handleInputFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
    }, 120);
  };

  return (
    <View style={styles.wrapper}>
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
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
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

      {shouldShowDropdown ? (
        <View style={styles.dropdown}>
          <Text style={styles.dropdownTitle}>{normalizedCity ? 'Suggestions' : 'Recent searches'}</Text>
          {dropdownItems.map((item) => (
            <Pressable
              key={item.id}
              style={styles.dropdownItem}
              onPress={() => handleSelectOption(item)}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name={item.type === 'recent' ? 'history' : 'map-search'}
                size={16}
                color={theme === 'dark' ? '#CBD5E1' : '#4B5563'}
              />
              <Text style={styles.dropdownItemText} numberOfLines={1}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const createStyles = (theme, colors) =>
  StyleSheet.create({
    wrapper: {
      zIndex: 20,
    },
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
    dropdown: {
      marginTop: 8,
      borderRadius: 14,
      backgroundColor: colors?.surface || '#FFFFFF',
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.15)' : '#E5E7EB',
      overflow: 'hidden',
    },
    dropdownTitle: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 6,
      fontSize: 12,
      color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
    },
    dropdownItemText: {
      flex: 1,
      color: colors?.text || '#111827',
      fontSize: 14,
    },
  });

export default SearchBar;