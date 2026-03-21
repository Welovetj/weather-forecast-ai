import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { openExternalUrl } from '../utils';

const LINKEDIN_URL = 'https://www.linkedin.com/company/product-manager-accelerator';

const AboutScreen = ({ theme, colors }) => {
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const handleOpenLinkedIn = async () => {
    await openExternalUrl(
      LINKEDIN_URL,
      'Unable to open the PM Accelerator LinkedIn page on this device.',
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>Efemini Tejiri</Text>
        <Text style={styles.heading}>Built for PM Accelerator</Text>
        <Text style={styles.description}>
          Product Manager Accelerator is a global program that breaks down barriers into the
          tech industry by providing hands-on AI product building experience. Their mission is
          to establish 200 schools worldwide and foster diversity in tech.
        </Text>

        <Pressable
          onPress={handleOpenLinkedIn}
          style={styles.linkedinButton}
          accessibilityRole="button"
          accessibilityLabel="Open PM Accelerator LinkedIn page"
        >
          <Text style={styles.linkedinButtonText}>View on LinkedIn</Text>
        </Pressable>
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
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.08)',
      padding: 18,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme === 'dark' ? 0.2 : 0.08,
      shadowRadius: 8,
      elevation: 3,
      gap: 12,
    },
    name: {
      color: colors.text,
      fontSize: 34,
      fontWeight: '800',
      lineHeight: 40,
    },
    heading: {
      color: colors.accent,
      fontSize: 20,
      fontWeight: '800',
      lineHeight: 26,
      marginTop: 2,
    },
    description: {
      color: colors.text,
      opacity: 0.82,
      fontSize: 15,
      lineHeight: 24,
      marginTop: 4,
      fontWeight: '500',
    },
    linkedinButton: {
      marginTop: 8,
      alignSelf: 'flex-start',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(56,189,248,0.42)' : 'rgba(14,165,233,0.35)',
      backgroundColor: theme === 'dark' ? 'rgba(14,116,144,0.26)' : 'rgba(14,165,233,0.12)',
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    linkedinButtonText: {
      color: theme === 'dark' ? '#BAE6FD' : '#0C4A6E',
      fontSize: 14,
      fontWeight: '800',
    },
  });

export default AboutScreen;
