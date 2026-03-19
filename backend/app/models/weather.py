from pydantic import BaseModel
from typing import Optional, List


class WeatherCondition(BaseModel):
    id: int
    main: str
    description: str
    icon: str


class WindInfo(BaseModel):
    speed: float
    deg: float
    gust: Optional[float] = None


class CurrentWeather(BaseModel):
    city: str
    country: str
    lat: float
    lon: float
    temp: float
    feels_like: float
    temp_min: float
    temp_max: float
    humidity: int
    pressure: int
    visibility: Optional[int] = None
    wind: WindInfo
    weather: List[WeatherCondition]
    sunrise: int
    sunset: int
    dt: int
    timezone: int


class ForecastItem(BaseModel):
    dt: int
    temp: float
    feels_like: float
    temp_min: float
    temp_max: float
    humidity: int
    pressure: int
    wind: WindInfo
    weather: List[WeatherCondition]
    pop: float  # probability of precipitation


class ForecastDay(BaseModel):
    date: str
    temp_min: float
    temp_max: float
    humidity: float
    wind_speed: float
    weather: WeatherCondition
    pop: float
    items: List[ForecastItem]


class ForecastResponse(BaseModel):
    city: str
    country: str
    lat: float
    lon: float
    forecast: List[ForecastDay]


class AIInsight(BaseModel):
    summary: str
    highlights: List[str]
    recommendation: str


class WeatherWithInsights(BaseModel):
    current: CurrentWeather
    forecast: ForecastResponse
    ai_insight: Optional[AIInsight] = None
