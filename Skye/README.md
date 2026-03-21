# Cloudora — AI-Powered Weather App

> Built for the **PM Accelerator** program · React Native + Expo

Cloudora is a production-grade mobile weather application built with React Native and Expo. It delivers real-time weather data, intelligent forecasts, geolocation support, and a full local history system with cloud sync — all wrapped in a polished dark/light themed UI.

---

## Features

| Feature | Description |
|---|---|
| 🔍 City Search | Search current weather by any city name |
| 📍 Geolocation | Auto-detect your location and load local weather |
| 🌤 Live Weather | Temperature, humidity, wind, visibility, pressure |
| 📅 5-Day Forecast | Hourly and daily outlooks with weather icons |
| 🗂 Search History | Auto-saved SQLite records of every search |
| ✏️ Edit / Delete | Full CRUD on saved history records |
| 📤 CSV Export | Export history as a `.csv` file and share |
| 📤 JSON Export | Export history as a `.json` file and share |
| ☁️ Supabase Sync | Auto cloud-sync history to Supabase on every save |
| 🗺 Google Maps | Static map preview of the searched city |
| ▶️ YouTube | One-tap YouTube weather search for any city |
| 🌓 Dark / Light | Theme toggle that persists across sessions |
| 🌡 °C / °F | Temperature unit toggle |
| 🏙 City Compare | Save favourite cities and compare them side by side |
| 👗 Outfit Guide | AI-style outfit recommendation based on conditions |

---

## Tech Stack

- **React Native** + **Expo SDK 54**
- **React Navigation** — Bottom Tabs + Native Stack
- **Expo SQLite** — local CRUD database
- **Supabase JS** — cloud sync (`searches` table)
- **Expo Location** — device geolocation
- **Expo File System + Sharing** — CSV/JSON export
- **Expo Web Browser** — reliable external link opening
- **Axios** — OpenWeather API requests
- **AsyncStorage** — theme + unit persistence
- **expo-linear-gradient** — UI gradients
- **@expo/vector-icons** — MaterialCommunityIcons

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your keys:

```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_static_maps_key
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start the app

```bash
npx expo start --clear
```

Scan the QR code with **Expo Go** on your phone, or press `a` for Android emulator / `w` for web.

---

## API Keys

| Key | Where to get it |
|---|---|
| `EXPO_PUBLIC_OPENWEATHER_API_KEY` | [openweathermap.org/api](https://openweathermap.org/api) (free tier) |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY` | [Google Cloud Console](https://console.cloud.google.com) → Maps Static API |
| Supabase URL + Anon Key | [supabase.com](https://supabase.com) → Project Settings → API |

---

## Supabase Database Setup

In your Supabase project, run this SQL to create the table:

```sql
CREATE TABLE searches (
  id BIGINT PRIMARY KEY,
  location TEXT,
  latitude REAL,
  longitude REAL,
  date_from TEXT,
  date_to TEXT,
  temp_min REAL,
  temp_max REAL,
  condition TEXT,
  unit TEXT,
  created_at TEXT
);
```

---

## Project Structure

```
Cloudora/
├── App.js                    # Root navigation (bottom tabs + settings stack)
├── app.json                  # Expo config
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js     # Weather search + live data
│   │   ├── HistoryScreen.js  # CRUD history + CSV/JSON export
│   │   ├── AboutScreen.js    # Branding + LinkedIn
│   │   └── SettingsScreen.js # Theme + unit toggles
│   ├── components/
│   │   ├── WeatherCard.js    # Weather detail card
│   │   ├── SearchBar.js      # City search input
│   │   ├── ForecastStrip.js  # Forecast row
│   │   └── UnitToggle.js     # °C/°F toggle
│   ├── services/
│   │   ├── weatherService.js # OpenWeather API calls
│   │   ├── supabaseService.js# Cloud sync
│   │   ├── locationService.js# GPS location
│   │   └── storageService.js # AsyncStorage favourites
│   ├── utils/
│   │   ├── database.js       # SQLite CRUD + auto-sync
│   │   ├── exportUtils.js    # CSV + JSON export
│   │   └── linkUtils.js      # Reliable URL opening
│   ├── hooks/
│   │   ├── useWeather.js     # Weather fetch hook
│   │   ├── useGeolocation.js # Location hook
│   │   ├── useTheme.js       # Dark/light theme
│   │   └── useTemperatureUnit.js
│   └── constants/
│       └── api.js            # API keys + endpoints
```

---

## Troubleshooting

**Weather not loading** — Check `EXPO_PUBLIC_OPENWEATHER_API_KEY` in `.env`, restart with `npx expo start --clear`.

**Map image not showing** — Enable the Maps Static API in Google Cloud Console and confirm the key is set in `.env`.

**History not saving** — Search for a city on the Home tab and wait for weather to load. Records save automatically.

**Export not working** — Make sure there are saved records in History first, then tap Export CSV or Export JSON.

**Supabase not syncing** — Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are correct and the `searches` table exists.

---

## Author

**Efemini Tejiri**
Built for the PM Accelerator program.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-PM%20Accelerator-blue?logo=linkedin)](https://www.linkedin.com/company/product-manager-accelerator)

> Product Manager Accelerator is a global program that breaks down barriers into the tech industry by providing hands-on AI product building experience. Their mission is to establish 200 schools worldwide and foster diversity in tech.


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
