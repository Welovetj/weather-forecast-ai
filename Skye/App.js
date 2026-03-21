import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AboutScreen, HistoryScreen, HomeScreen, SettingsScreen } from './src/screens';
import { useTemperatureUnit, useTheme } from './src/hooks';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const TAB_ICONS = {
  Home: 'weather-partly-cloudy',
  History: 'history',
  About: 'information-outline',
};

export default function App() {
  const { theme, colors, themeMode, setThemeMode } = useTheme();
  const { unit, setUnit } = useTemperatureUnit();

  const Tabs = () => (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerRight: () => (
          <Pressable
            onPress={() => navigation.getParent()?.navigate('Settings')}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            style={{
              borderWidth: 1,
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(17,24,39,0.12)',
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.03)',
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
          >
            <Text style={{ fontSize: 16 }}>⚙️</Text>
          </Pressable>
        ),
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: theme === 'dark' ? 'rgba(243,244,246,0.62)' : 'rgba(17,24,39,0.58)',
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.08)',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color }) => (
          <MaterialCommunityIcons
            name={TAB_ICONS[route.name]}
            size={focused ? 26 : 23}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" options={{ title: 'Cloudora' }}>
        {(props) => (
          <HomeScreen
            {...props}
            theme={theme}
            colors={colors}
            unit={unit}
            setUnit={setUnit}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="History" options={{ title: 'History' }}>
        {(props) => (
          <HistoryScreen
            {...props}
            theme={theme}
            colors={colors}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="About" options={{ title: 'About' }}>
        {(props) => (
          <AboutScreen
            {...props}
            theme={theme}
            colors={colors}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="MainTabs" component={Tabs} />
          <RootStack.Screen name="Settings" options={{ headerShown: true, title: 'Settings' }}>
            {(props) => (
              <SettingsScreen
                {...props}
                theme={theme}
                colors={colors}
                themeMode={themeMode}
                setThemeMode={setThemeMode}
                unit={unit}
                setUnit={setUnit}
              />
            )}
          </RootStack.Screen>
        </RootStack.Navigator>
      </NavigationContainer>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
