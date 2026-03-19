# Skye Weather App (Expo React Native)

## Candidate Details
- Name: EFEMINI TEJIRI
- Institution: Mount Royal University
- Location: Calgary, Alberta, Canada

## Assessment Completed
- Completed: Tech Assessment #1 (Frontend Engineer)
- Not completed in this repository: Tech Assessment #2 (Backend CRUD/API/Export)

## Project Summary
Skye is a weather app that allows users to:
- Search weather by city name
- Fetch weather based on current GPS location
- View current weather details
- View a 5-day forecast in a horizontal strip
- Switch temperature unit (C/F)
- Toggle dark/light mode

## PM Accelerator Description
PM Accelerator (Product Manager Accelerator) is a career-focused training and mentorship community that helps professionals build product management and related technology skills through practical projects, coaching, and real-world execution.

## Tech Stack
- Expo + React Native
- React Navigation (Native Stack)
- Axios
- Expo Location
- AsyncStorage

## Frontend Requirement Mapping (Tech Assessment #1)

### Core Requirements
- Let users enter a location and get current weather: Implemented through city search input on Home screen.
- Show weather clearly with useful details: Implemented with current weather card (city, country, temperature, feels-like, description, humidity, wind, visibility).
- Let users see weather from current location: Implemented via geolocation hook and location trigger button.
- Use icons/images for weather info: Implemented with weather emoji icons in forecast strip and weather visuals in UI.

### Stand-Out Requirements
- 5-day forecast (section 1.1): Implemented via ForecastStrip component grouped by day.
- Error handling (section 1.2): Implemented with styled city-not-found and API-failure messages.

### Responsive Design Techniques Used
- Flexible layouts using flexbox and percentage-free adaptive spacing.
- Root ScrollView for content adaptability on small screens.
- Horizontal FlatList for forecast cards to avoid vertical overflow.
- Theme-aware visual tokens for contrast/readability in dark and light mode.

### APIs Managed
- OpenWeatherMap Current Weather API
- OpenWeatherMap 5-Day Forecast API
- Optional geolocation via expo-location

## Screens and UX

### Home Screen
- SearchBar for city lookup
- Location button for current-position lookup
- UnitToggle (C/F)
- WeatherCard for current weather details
- ForecastStrip for 5-day forecast
- Settings gear button

### Settings Screen
- Theme toggle (dark/light)
- Temperature unit toggle (C/F)
- Candidate profile section
- PM Accelerator informational section

## Environment Setup
Create a `.env` file in project root:

```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY_HERE
EXPO_PUBLIC_WEATHER_PROXY_URL=
```

Notes:
- `EXPO_PUBLIC_OPENWEATHER_API_KEY` is used for direct OpenWeather calls.
- `EXPO_PUBLIC_WEATHER_PROXY_URL` is optional. If set, app routes calls through backend proxy endpoints (`/weather`, `/forecast`).

## Installation and Run
```bash
npm install
npm start
```

Run options:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web
- Or scan QR with Expo Go

## Repository Structure
```text
Skye/
  App.js
  app.json
  package.json
  .env.example
  src/
    components/
    hooks/
    screens/
    constants/
    services/
    utils/
```

## What Is Included for Evaluators
- Live API data (no static weather stubs)
- Error handling for invalid cities and request failures
- In-app candidate details and PM Accelerator description
- Package/dependency manifest via `package.json` and lockfile

## Demo Video
- Add your demo URL before submission:
  - DEMO_URL_HERE

## Submission Checklist (Copy Into Google Form)

Use this block as your quick submission answer:

```text
Candidate Name: EFEMINI TEJIRI
Assessment Completed: Tech Assessment #1 (Frontend)
GitHub Repository URL: REPO_URL_HERE
Repository Visibility: Public OR Private with collaborators added (community@pmaccelerator.io, hr@pmaccelerator.io)
Clone/Download Access: Enabled
Demo Video URL (1-2 min): DEMO_URL_HERE

What was built:
- React Native Expo weather app
- City search + current location weather
- Current weather details and 5-day forecast
- Error handling (city not found / API failure)
- Theme toggle + temperature unit toggle

How to run:
1) npm install
2) Add .env with EXPO_PUBLIC_OPENWEATHER_API_KEY
3) npm start

Notes:
- Tech Assessment #2 (backend CRUD/export) is not included in this repository.
```
