# Skye - Weather Forecast App

A React Native weather app built with Expo that provides real-time weather forecasts using geolocation services.

## Features

- Real-time weather updates
- Geolocation support (GPS)
- Local preference storage
- API integration with weather service

## Dependencies

### Core Framework
- **expo** (v50.0.0) - Expo framework for React Native development
- **react** (18.2.0) - React library
- **react-native** (0.73.6) - React Native framework

### Weather & Location
- **axios** (v1.6.0) - HTTP client for API calls
- **expo-location** (v16.5.0) - Access device location services

### Storage
- **@react-native-async-storage/async-storage** (v1.21.0) - Persistent local storage for preferences

### Navigation
- **@react-navigation/native** (v6.1.0) - Navigation library
- **@react-navigation/bottom-tabs** (v6.5.0) - Bottom tab navigation
- **react-native-screens** (v3.26.0) - Native screen components
- **react-native-safe-area-context** (v4.7.0) - Safe area handling

### UI/Status
- **expo-status-bar** (v1.11.1) - Status bar management

## Installation

1. **Prerequisites**: Ensure you have Node.js and npm installed
   ```bash
   node --version
   npm --version
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

## Running the App

### Expo CLI (Recommended)
```bash
npm start
```

Then choose:
- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Press `w` to open in web browser
- Scan QR code with Expo Go app on your phone

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web
```bash
npm run web
```

## Project Structure

```
Skye/
├── App.js              # Main app component
├── app.json            # Expo configuration
├── package.json        # Dependencies and scripts
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Configuration

The `app.json` file contains:
- App metadata and permissions
- iOS and Android specific settings
- Location permission requests
- Expo plugin configurations

## Permissions

### Android
- `ACCESS_FINE_LOCATION` - Precise device location
- `ACCESS_COARSE_LOCATION` - Approximate location

### iOS
- Location usage descriptions for privacy

## API Integration

Update the app to integrate with a weather API (e.g., OpenWeatherMap, WeatherAPI):

1. Install axios (already included)
2. Create an API service module
3. Use `expo-location` to get user coordinates
4. Fetch weather data based on location
5. Store preferences using AsyncStorage

## Building for Production

```bash
npm run eject
```

(Note: Ejecting gives you full control but you lose some Expo benefits)

## Troubleshooting

- **App won't start**: Clear cache with `expo start -c`
- **Location permission denied**: Check app.json permissions
- **Blank screen**: Ensure App.js is properly configured

## Learn More

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [AsyncStorage Guide](https://react-native-async-storage.github.io/async-storage)
- [Axios Documentation](https://axios-http.com)
