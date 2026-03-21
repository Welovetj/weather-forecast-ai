/**
 * API Constants
 * Weather API configuration and endpoints
 */

const OPENWEATHER_PLACEHOLDER = 'YOUR_OPENWEATHER_API_KEY_HERE';

const normalizeEnvValue = (value = '') => {
	const trimmed = String(value)
		.replace(/^\uFEFF/, '')
		.trim();

	// Accept keys pasted with surrounding single/double quotes.
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"'))
		|| (trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1).trim();
	}

	return trimmed;
};

const getFirstEnvValue = (...names) => {
	for (const name of names) {
		const raw = process.env[name];
		if (typeof raw === 'string' && raw.trim() !== '') {
			return normalizeEnvValue(raw);
		}
	}

	return '';
};

// Weather API - OpenWeatherMap (example)
// Get your free API key from https://openweathermap.org/api
export const WEATHER_API_KEY = getFirstEnvValue(
	'EXPO_PUBLIC_OPENWEATHER_API_KEY',
	'OPENWEATHER_API_KEY',
	'EXPO_PUBLIC_WEATHER_API_KEY',
);
export const GOOGLE_MAPS_KEY = getFirstEnvValue('EXPO_PUBLIC_GOOGLE_MAPS_KEY', 'GOOGLE_MAPS_KEY');
export const SUPABASE_URL = getFirstEnvValue('EXPO_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
export const SUPABASE_ANON_KEY = getFirstEnvValue('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY');
export const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
export const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
export const WEATHER_PROXY_URL = getFirstEnvValue('EXPO_PUBLIC_WEATHER_PROXY_URL', 'WEATHER_PROXY_URL');

export const hasWeatherApiKeyConfigured = Boolean(
	WEATHER_API_KEY && WEATHER_API_KEY !== OPENWEATHER_PLACEHOLDER,
);

export const isLikelyOpenWeatherApiKey = (value = WEATHER_API_KEY) => /^[a-f0-9]{32}$/i.test(value);

// Request timeout (in ms)
export const API_TIMEOUT = 10000;

// Refresh intervals
export const WEATHER_REFRESH_INTERVAL = 600000; // 10 minutes
export const LOCATION_REFRESH_INTERVAL = 300000; // 5 minutes
