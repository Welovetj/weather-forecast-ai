export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WindInfo {
  speed: number;
  deg: number;
  gust?: number;
}

export interface CurrentWeather {
  city: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  visibility?: number;
  wind: WindInfo;
  weather: WeatherCondition[];
  sunrise: number;
  sunset: number;
  dt: number;
  timezone: number;
}

export interface ForecastItem {
  dt: number;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind: WindInfo;
  weather: WeatherCondition[];
  pop: number;
}

export interface ForecastDay {
  date: string;
  temp_min: number;
  temp_max: number;
  humidity: number;
  wind_speed: number;
  weather: WeatherCondition;
  pop: number;
  items: ForecastItem[];
}

export interface ForecastResponse {
  city: string;
  country: string;
  lat: number;
  lon: number;
  forecast: ForecastDay[];
}

export interface AIInsight {
  summary: string;
  highlights: string[];
  recommendation: string;
}

export interface WeatherWithInsights {
  current: CurrentWeather;
  forecast: ForecastResponse;
  ai_insight?: AIInsight;
}

export type UnitSystem = 'metric' | 'imperial' | 'standard';
