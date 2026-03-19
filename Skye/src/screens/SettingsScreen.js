import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { UnitToggle } from '../components';

const THEME_OPTIONS = [
  { mode: 'light', label: '☀️ Light' },
  { mode: 'dark',  label: '🌙 Dark'  },
  { mode: 'auto',  label: '🌓 Auto'  },
];

const SettingsScreen = ({ theme, colors, themeMode, setThemeMode, unit, setUnit }) => {
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Text style={styles.sectionDescription}>Choose your preferred theme.</Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map(({ mode, label }) => (
            <Pressable
              key={mode}
              onPress={() => setThemeMode(mode)}
              style={[styles.themeOption, themeMode === mode && styles.themeOptionActive]}
              accessibilityRole="button"
              accessibilityLabel={`Set ${mode} theme`}
            >
              <Text style={[styles.themeOptionText, themeMode === mode && styles.themeOptionTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
        {themeMode === 'auto' && (
          <Text style={styles.autoNote}>Switches to dark after 8 PM, light at 6 AM.</Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Temperature Unit</Text>
        <Text style={styles.sectionDescription}>Select Celsius or Fahrenheit for weather values.</Text>
        <UnitToggle unit={unit} onToggle={setUnit} theme={theme} colors={colors} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>About Author</Text>
        <Text style={styles.sectionDescription}>EFEMINI TEJIRI</Text>
        <Text style={styles.sectionDescription}>Student, Mount Royal University</Text>
        <Text style={styles.sectionDescription}>Calgary, Alberta, Canada</Text>
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
    themeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    themeOption: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.15)',
      alignItems: 'center',
    },
    themeOptionActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    themeOptionText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 13,
    },
    themeOptionTextActive: {
      color: '#FFFFFF',
    },
    autoNote: {
      color: colors.text,
      opacity: 0.6,
      fontSize: 12,
      fontStyle: 'italic',
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