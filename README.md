# Weather Forecast AI — PM Accelerator Internship

> **PM Accelerator AI Engineer Internship** · Dual-Role Submission

This repository contains two projects submitted for the PM Accelerator AI Engineer Internship technical assessment.

---

## 📱 Cloudora — AI-Powered Mobile Weather App (`/Skye`)

A production-grade React Native + Expo mobile weather application.

→ **[See full documentation](Skye/README.md)**

| Feature | Description |
|---|---|
| 🔍 City Search | Search current weather by any city name |
| 📍 Geolocation | Auto-detect location and load local weather |
| 🌤 Live Weather | Temperature, humidity, wind, visibility, pressure |
| 📅 5-Day Forecast | Hourly and daily outlooks with weather icons |
| 🗂 Search History | Auto-saved SQLite records of every search |
| ✏️ Edit / Delete | Full CRUD on saved history records |
| 📤 Export | CSV and JSON export with share support |
| ☁️ Supabase Sync | Auto cloud-sync history to Supabase |
| 🌓 Dark / Light | Persistent theme toggle |
| 🌡 °C / °F | Temperature unit toggle |

**Tech stack:** React Native · Expo SDK 54 · SQLite · Supabase · AsyncStorage

**Quick start:**
```bash
cd Skye
cp .env.example .env   # add your API keys
npm install
npx expo start
```

---

## 🌤️ Weather Forecast AI — Full-Stack Web App (`/backend` + `/frontend`)

A FastAPI + React TypeScript web app with GPT-4o-mini AI weather insights.

| Feature | Detail |
|---|---|
| 🌍 Global city search | Any city with metric/imperial/standard units |
| 🌡️ Current conditions | Temp, humidity, wind, pressure, visibility, sunrise/sunset |
| 📅 5-day forecast | Daily high/low, rain probability, weather icons |
| 📊 Temperature chart | Recharts area chart of weekly temp trend |
| 🤖 AI insights | GPT-4o-mini summary, highlights, and recommendation |
| ⚡ Fallback AI | Rule-based insights when OpenAI key is absent |

**Tech stack:** Python FastAPI · Pydantic v2 · OpenAI · React 18 · TypeScript · Vite · Tailwind CSS v4

**Quick start:**
```bash
# Backend
cd backend
cp .env.example .env   # add OPENWEATHER_API_KEY and (optional) OPENAI_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Or with Docker:
```bash
docker compose up --build
```

**Tests:**
```bash
cd backend && python -m pytest -v          # 11 tests
cd frontend && npm test                    # 21 tests
```

---

## 🛠️ Data Science Assessment

Global weather trend forecasting on the **Global Weather Repository** dataset using SARIMA, Prophet, XGBoost, and Ensemble models, with anomaly detection, climate pattern analysis, and spatial visualisations.

---

## 🌐 Environment Variables

| Variable | Used by | Description |
|---|---|---|
| `EXPO_PUBLIC_OPENWEATHER_API_KEY` | Cloudora (Skye) | OpenWeatherMap key |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY` | Cloudora (Skye) | Google Static Maps key |
| `EXPO_PUBLIC_SUPABASE_URL` | Cloudora (Skye) | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Cloudora (Skye) | Supabase anon key |
| `OPENWEATHER_API_KEY` | Web app backend | OpenWeatherMap key |
| `OPENAI_API_KEY` | Web app backend | OpenAI key (optional) |
