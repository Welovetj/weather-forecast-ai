import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, SettingsScreen } from './src/screens';
import { useTemperatureUnit, useTheme } from './src/hooks';

const Stack = createNativeStackNavigator();

export default function App() {
  const { theme, colors, toggleTheme } = useTheme();
  const { unit, setUnit } = useTemperatureUnit();

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: '700',
            },
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen name="Home" options={{ title: 'Skye' }}>
            {(props) => (
              <HomeScreen
                {...props}
                theme={theme}
                colors={colors}
                toggleTheme={toggleTheme}
                unit={unit}
                setUnit={setUnit}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Settings" options={{ title: 'Settings' }}>
            {(props) => (
              <SettingsScreen
                {...props}
                theme={theme}
                colors={colors}
                toggleTheme={toggleTheme}
                unit={unit}
                setUnit={setUnit}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
