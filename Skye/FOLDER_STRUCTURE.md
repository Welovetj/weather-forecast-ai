# Cloudora Weather App - Folder Structure

## Directory Organization

```
Cloudora/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── index.js
│   │   ├── WeatherCard.js       # Weather card component
│   │   ├── ForecastList.js      # Forecast list component
│   │   ├── LoadingSpinner.js    # Loading indicator
│   │   └── ErrorMessage.js      # Error display component
│   │
│   ├── screens/                 # Navigation screens
│   │   ├── index.js
│   │   ├── HomeScreen.js        # Main weather display
│   │   ├── SettingsScreen.js    # App settings
│   │   └── ForecastScreen.js    # Detailed forecast
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── index.js
│   │   ├── useWeather.js        # Weather data fetching
│   │   ├── useLocation.js       # Location services
│   │   └── useStorage.js        # AsyncStorage operations
│   │
│   ├── services/                # API and business logic
│   │   ├── index.js
│   │   ├── weatherService.js    # Weather API calls
│   │   ├── locationService.js   # Geolocation service
│   │   └── storageService.js    # Local storage management
│   │
│   ├── constants/               # App constants
│   │   ├── index.js
│   │   ├── api.js              # API endpoints & keys
│   │   ├── colors.js           # Color palette
│   │   └── config.js           # App configuration
│   │
│   ├── utils/                   # Utility functions
│   │   ├── index.js
│   │   ├── weatherUtils.js     # Weather helper functions
│   │   ├── dateUtils.js        # Date formatting helpers
│   │   └── formatUtils.js      # Data formatting utilities
│   │
│   ├── context/                 # React Context & state
│   │   ├── index.js
│   │   ├── WeatherContext.js    # Weather global state
│   │   └── LocationContext.js   # Location global state
│   │
│   ├── assets/                  # Static files
│   │   ├── images/             # PNG, JPG, SVG icons
│   │   └── fonts/              # Custom fonts
│   │
│   └── App.js                  # Root component (moved here)
│
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── babel.config.js              # Babel configuration
├── .gitignore                   # Git ignore rules
└── README.md                    # Project documentation
```

## Folder Purpose Guide

### `/src/components`
Reusable UI components that don't have business logic. Examples:
- Weather cards
- Loading spinners
- Error messages
- UI buttons and inputs
- List items

**Export pattern**: Use index.js barrel export for clean imports

### `/src/screens`
Full-screen components used in navigation. One screen = one view.
- HomeScreen - Main weather view
- SettingsScreen - App preferences
- ForecastScreen - Detailed weather forecast

### `/src/hooks`
Custom React hooks for logic reuse:
- `useWeather` - Fetch and cache weather data
- `useLocation` - Get device location
- `useStorage` - AsyncStorage operations

### `/src/services`
Business logic and external API integration:
- `weatherService` - OpenWeatherMap API calls
- `locationService` - Geolocation functionality
- `storageService` - AsyncStorage CRUD operations

### `/src/constants`
Centralized constants and configuration:
- `api.js` - API keys, endpoints, timeouts
- `colors.js` - Color palette and gradients
- `config.js` - App settings and feature flags

### `/src/utils`
Pure utility/helper functions:
- Formatting functions
- Unit conversions
- Data transformations
- Date/time helpers

### `/src/context`
React Context for global state:
- `WeatherContext` - Shared weather state
- `LocationContext` - Shared location state

### `/src/assets`
Static files:
- `images/` - Weather icons, backgrounds, logos
- `fonts/` - Custom typography

## Import Examples

### ❌ Bad (deeply nested)
```javascript
import WeatherCard from '../../../components/WeatherCard.js';
```

### ✅ Good (barrel export)
```javascript
import { WeatherCard } from '../components';
```

### ✅ Good (services)
```javascript
import { getWeather } from '../services';
```

### ✅ Good (utilities)
```javascript
import { formatTemperature } from '../utils';
```

## Best Practices

1. **Keep components small and focused** - 100-200 lines max
2. **Use barrel exports** (index.js) for cleaner imports
3. **Move reusable logic to hooks** - Don't repeat in components
4. **Centralize constants** - No magic strings/numbers
5. **Keep services pure** - No React dependencies
6. **Use context sparingly** - Only for truly global state
7. **One component per file** - Exceptions for related small components
8. **Use TypeScript paths** (optional) - For even cleaner imports

## Next Steps

1. Update `App.js` to use the src folder structure
2. Add navigation setup (React Navigation)
3. Implement actual API integration
4. Add more components as needed
5. Create tests folder at root: `__tests__/`
