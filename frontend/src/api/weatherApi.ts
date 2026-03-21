import axios from 'axios';
import type { WeatherWithInsights, UnitSystem } from '../types/weather';

const BASE_URL = '/api/weather';

export const weatherApi = {
  async getInsights(city: string, units: UnitSystem = 'metric'): Promise<WeatherWithInsights> {
    const { data } = await axios.get<WeatherWithInsights>(`${BASE_URL}/insights`, {
      params: { city, units },
    });
    return data;
  },
};

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export function formatTemp(temp: number, units: UnitSystem): string {
  const symbol = units === 'imperial' ? '°F' : units === 'standard' ? 'K' : '°C';
  return `${Math.round(temp)}${symbol}`;
}

export function formatTime(timestamp: number, timezoneOffset: number): string {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toUTCString().slice(17, 22);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function getWindDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}
