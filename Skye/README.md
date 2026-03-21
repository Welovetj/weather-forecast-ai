# Cloudora - AI-Powered Weather App

Built for the PM Accelerator program using React Native and Expo.

## Overview

Cloudora is a mobile weather app focused on practical day-to-day usage:

- Search weather by city
- Use geolocation to load local weather
- View current conditions and forecast
- Save search history locally
- Edit/delete history records
- Export history as CSV or JSON
- Optionally sync records to Supabase
- Save favorite cities and compare them side by side
- Switch dark/light theme and C/F units

## Implemented Screens

- Home
  - weather search
  - current weather and forecast
  - map preview image for searched city
  - outfit guidance and quick insights
  - favorites and city comparison
- History
  - saved searches from SQLite
  - edit/delete records
  - export CSV and JSON
- About
  - project/author info and PM Accelerator link
- Settings
  - theme and unit toggles

## Tech Stack

- React Native
- Expo SDK 54
- React Navigation (bottom tabs + native stack)
- Expo SQLite
- AsyncStorage
- Axios
- Expo Location
- Expo File System + Sharing
- Expo Web Browser
- Supabase JavaScript client

## Requirements

See `requirements.txt` in this folder for a full dependency list and minimum runtime requirements.

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in these keys:

EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_static_maps_key
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_WEATHER_PROXY_URL=

Notes:
- OpenWeather key is required
- Google Maps key is required for static map images
- Supabase values are optional unless cloud sync is needed
- Weather proxy URL is optional

## Install and Run

1. Install dependencies:

npm install

2. Start Expo:

npx expo start --clear

3. Run target:

- Android emulator/device: press a
- iOS simulator/device: press i (macOS only)
- Web: press w

## Supabase Table (Optional)

If enabling cloud sync, create this table:

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

## Troubleshooting

- Weather not loading:
  - verify EXPO_PUBLIC_OPENWEATHER_API_KEY in `.env`
  - restart with `npx expo start --clear`
- Map image missing:
  - verify EXPO_PUBLIC_GOOGLE_MAPS_KEY and Maps Static API access
- History export not opening:
  - ensure device supports share intents and has at least one saved record
- Supabase sync not working:
  - confirm EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
  - confirm searches table exists and allows inserts/upserts

## PM Accelerator Submission Notes

To align with assessment requirements:

- Include GitHub link and this README with run instructions
- Keep repository public during evaluation, or add:
  - community@pmaccelerator.io
  - hr@pmaccelerator.io
- Ensure Clone/Download is allowed
- Keep requirements file included (`requirements.txt`)

## Author

Efemini Tejiri
