import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const UnitToggle = ({ unit = 'metric', onToggle }) => {
  const isMetric = unit === 'metric';

  const handlePress = (nextUnit) => {
    if (typeof onToggle === 'function') {
      onToggle(nextUnit);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => handlePress('metric')} style={styles.button}>
        {isMetric ? (
          <LinearGradient colors={['#06B6D4', '#0EA5E9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.activeFill}>
            <Text style={[styles.label, styles.activeLabel]}>°C</Text>
          </LinearGradient>
        ) : (
          <View style={styles.inactiveFill}>
            <Text style={styles.label}>°C</Text>
          </View>
        )}
      </Pressable>

      <Pressable onPress={() => handlePress('imperial')} style={styles.button}>
        {!isMetric ? (
          <LinearGradient colors={['#06B6D4', '#0EA5E9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.activeFill}>
            <Text style={[styles.label, styles.activeLabel]}>°F</Text>
          </LinearGradient>
        ) : (
          <View style={styles.inactiveFill}>
            <Text style={styles.label}>°F</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
    padding: 4,
    alignSelf: 'flex-start',
    gap: 6,
  },
  button: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  activeFill: {
    minWidth: 58,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  inactiveFill: {
    minWidth: 58,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  label: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '700',
  },
  activeLabel: {
    color: '#FFFFFF',
  },
});

export default UnitToggle;