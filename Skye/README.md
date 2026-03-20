# Skye (Expo React Native Weather App)

Skye is a React Native Expo weather app that helps users search live weather, view location-aware forecasts, manage historical search records, and use practical extras like export tools, maps, and media links. It is designed as a polished mobile weather experience with local database support, theme controls, and cloud-ready integrations.

## Features

- Current weather search by city
- Date range history support
- Local SQLite CRUD database for saved searches
- CSV export for saved records
- JSON export for saved records
- Optional Supabase cloud sync for saved search records
- Dark/light theme mode
- Temperature unit toggle (°C/°F)
- Geolocation-based city/weather lookup
- Google Maps static preview in weather card
- YouTube integration for city weather search

## Setup

1. Install dependencies:

```bash
npm install
```

2. Use `.env.example` as your setup template and copy it to `.env`:

```bash
cp .env.example .env
```

3. In `.env`, set your values:

```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY_HERE
EXPO_PUBLIC_GOOGLE_MAPS_KEY=YOUR_GOOGLE_STATIC_MAPS_KEY_HERE
EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
EXPO_PUBLIC_WEATHER_PROXY_URL=
```

Notes:

- `EXPO_PUBLIC_OPENWEATHER_API_KEY` is required for OpenWeather current/forecast endpoints.
- `EXPO_PUBLIC_GOOGLE_MAPS_KEY` is required for Google Static Maps image rendering.
- `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` enable cloud sync from History screen.
- `EXPO_PUBLIC_WEATHER_PROXY_URL` is optional.

## Run the App

Start the Expo development server:

```bash
npx expo start
```

Then run on your preferred target (Android, iOS, or web) from the Expo prompt.

## Tech Stack

- React Native + Expo
- React Navigation (Bottom Tabs + Native Stack)
- Axios
- Expo Location
- Expo SQLite
- Expo File System
- Expo Sharing
- Supabase JavaScript Client
- AsyncStorage

## Troubleshooting

- Missing weather data or API errors:
	Ensure `EXPO_PUBLIC_OPENWEATHER_API_KEY` is set correctly in `.env`, then restart Expo.
- Google map image does not render:
	Confirm `EXPO_PUBLIC_GOOGLE_MAPS_KEY` is set, Google Static Maps API is enabled, and key restrictions allow your app usage.
- CSV/JSON export sharing does not open:
	Verify your device/emulator supports share intents and that app permissions are not blocking file access.
- Environment updates not taking effect:
	Stop and restart the dev server with a clean cache: `npx expo start --clear`.

## Author

Efemini Tejiri
