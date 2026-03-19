import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { UnitToggle } from '../components';

const SettingsScreen = ({ theme, colors, toggleTheme, unit, setUnit }) => {
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Text style={styles.sectionDescription}>Choose your preferred app theme.</Text>
        <Pressable
          onPress={toggleTheme}
          style={styles.themeButton}
          accessibilityRole="button"
          accessibilityLabel="Toggle app theme"
        >
          <Text style={styles.themeButtonText}>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</Text>
        </Pressable>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Temperature Unit</Text>
        <Text style={styles.sectionDescription}>Select Celsius or Fahrenheit for weather values.</Text>
        <UnitToggle unit={unit} onToggle={setUnit} theme={theme} colors={colors} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Candidate Profile</Text>
        <Text style={styles.sectionDescription}>EFEMINI TEJIRI</Text>
        <Text style={styles.sectionDescription}>Student, Mount Royal University</Text>
        <Text style={styles.sectionDescription}>Calgary, Alberta, Canada</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>About PM Accelerator</Text>
        <Text style={styles.sectionDescription}>
          PM Accelerator (Product Manager Accelerator) is a career-focused training and mentorship community
          that helps professionals build product management and related technology skills through practical
          projects, coaching, and real-world execution.
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors, theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 20,
      gap: 14,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 2,
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.08)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme === 'dark' ? 0.18 : 0.08,
      shadowRadius: 8,
      elevation: 3,
      gap: 10,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    sectionDescription: {
      color: colors.text,
      opacity: 0.75,
      fontSize: 14,
      lineHeight: 20,
    },
    themeButton: {
      alignSelf: 'flex-start',
      backgroundColor: colors.accent,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
    },
    themeButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
  });

export default SettingsScreen;