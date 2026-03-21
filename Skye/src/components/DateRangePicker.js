import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const MAX_FREE_TIER_DAYS = 16;
const DAY_MS = 24 * 60 * 60 * 1000;

const formatDate = (date) => {
  if (!(date instanceof Date)) {
    return 'Select date';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const normalizeDate = (value) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDateOnlyUtc = (date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

const validateDateRange = (fromDate, toDate) => {
  if (!fromDate || !toDate) {
    return 'Please select both From Date and To Date.';
  }

  const fromUtc = getDateOnlyUtc(fromDate);
  const toUtc = getDateOnlyUtc(toDate);

  if (fromUtc > toUtc) {
    return 'From Date cannot be after To Date.';
  }

  const inclusiveDays = Math.floor((toUtc - fromUtc) / DAY_MS) + 1;
  if (inclusiveDays > MAX_FREE_TIER_DAYS) {
    return 'Date range cannot exceed 16 days on Open-Meteo free tier.';
  }

  return '';
};

const DateRangePicker = ({ value, onChange, theme = 'light', colors }) => {
  const [fromDate, setFromDate] = useState(() => normalizeDate(value?.fromDate));
  const [toDate, setToDate] = useState(() => normalizeDate(value?.toDate));
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setFromDate(normalizeDate(value?.fromDate));
    setToDate(normalizeDate(value?.toDate));
  }, [value?.fromDate, value?.toDate]);

  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange({ fromDate, toDate });
    }
  }, [fromDate, toDate, onChange]);

  useEffect(() => {
    if (!fromDate && !toDate) {
      setValidationError('');
      return;
    }

    setValidationError(validateDateRange(fromDate, toDate));
  }, [fromDate, toDate]);

  const styles = useMemo(() => createStyles(theme, colors), [theme, colors]);

  const handleFromChange = (event, selectedDate) => {
    setShowFromPicker(Platform.OS === 'ios');

    if (event?.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      setFromDate(selectedDate);
      if (toDate && selectedDate > toDate) {
        setToDate(selectedDate);
      }
    }
  };

  const handleToChange = (event, selectedDate) => {
    setShowToPicker(Platform.OS === 'ios');

    if (event?.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      setToDate(selectedDate);
      if (fromDate && selectedDate < fromDate) {
        setFromDate(selectedDate);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Date Range</Text>

      <View style={styles.row}>
        <Pressable
          onPress={() => setShowFromPicker(true)}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="Pick from date"
        >
          <Text style={styles.buttonLabel}>From Date</Text>
          <Text style={styles.buttonValue}>{formatDate(fromDate)}</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowToPicker(true)}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="Pick to date"
        >
          <Text style={styles.buttonLabel}>To Date</Text>
          <Text style={styles.buttonValue}>{formatDate(toDate)}</Text>
        </Pressable>
      </View>

      {showFromPicker ? (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleFromChange}
          maximumDate={toDate || undefined}
        />
      ) : null}

      {showToPicker ? (
        <DateTimePicker
          value={toDate || fromDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleToChange}
          minimumDate={fromDate || undefined}
        />
      ) : null}

      {validationError ? (
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>Invalid Date Range</Text>
          <Text style={styles.alertText}>{validationError}</Text>
        </View>
      ) : null}
    </View>
  );
};

const createStyles = (theme, colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors?.surface || '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.08)',
      padding: 14,
      gap: 10,
    },
    title: {
      color: colors?.text || '#111827',
      fontSize: 16,
      fontWeight: '700',
    },
    row: {
      flexDirection: 'row',
      gap: 10,
    },
    button: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(17,24,39,0.12)',
      backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.03)',
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 6,
    },
    buttonLabel: {
      color: colors?.text || '#111827',
      opacity: 0.78,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    buttonValue: {
      color: colors?.text || '#111827',
      fontSize: 14,
      fontWeight: '700',
    },
    alertCard: {
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(252,165,165,0.45)' : '#FCA5A5',
      backgroundColor: theme === 'dark' ? 'rgba(127,29,29,0.30)' : '#FEF2F2',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 4,
    },
    alertTitle: {
      color: theme === 'dark' ? '#FECACA' : '#991B1B',
      fontSize: 13,
      fontWeight: '800',
    },
    alertText: {
      color: theme === 'dark' ? '#FEE2E2' : '#7F1D1D',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
  });

export default DateRangePicker;
