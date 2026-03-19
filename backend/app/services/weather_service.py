import httpx
from typing import Optional
from datetime import datetime, timezone
from collections import defaultdict

from app.config import settings
from app.models.weather import (
    CurrentWeather,
    ForecastResponse,
    ForecastItem,
    ForecastDay,
    WeatherCondition,
    WindInfo,
)

OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"


async def get_current_weather(city: str, units: str = "metric") -> CurrentWeather:
    """Fetch current weather for a given city from OpenWeatherMap."""
    params = {
        "q": city,
        "appid": settings.openweather_api_key,
        "units": units,
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{OPENWEATHER_BASE_URL}/weather", params=params)
        response.raise_for_status()
        data = response.json()

    return CurrentWeather(
        city=data["name"],
        country=data["sys"]["country"],
        lat=data["coord"]["lat"],
        lon=data["coord"]["lon"],
        temp=data["main"]["temp"],
        feels_like=data["main"]["feels_like"],
        temp_min=data["main"]["temp_min"],
        temp_max=data["main"]["temp_max"],
        humidity=data["main"]["humidity"],
        pressure=data["main"]["pressure"],
        visibility=data.get("visibility"),
        wind=WindInfo(
            speed=data["wind"]["speed"],
            deg=data["wind"].get("deg", 0),
            gust=data["wind"].get("gust"),
        ),
        weather=[
            WeatherCondition(
                id=w["id"],
                main=w["main"],
                description=w["description"],
                icon=w["icon"],
            )
            for w in data["weather"]
        ],
        sunrise=data["sys"]["sunrise"],
        sunset=data["sys"]["sunset"],
        dt=data["dt"],
        timezone=data["timezone"],
    )


async def get_forecast(city: str, units: str = "metric") -> ForecastResponse:
    """Fetch 5-day weather forecast (3-hour intervals) for a given city."""
    params = {
        "q": city,
        "appid": settings.openweather_api_key,
        "units": units,
        "cnt": 40,  # 5 days * 8 intervals per day
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{OPENWEATHER_BASE_URL}/forecast", params=params)
        response.raise_for_status()
        data = response.json()

    items_by_day: dict = defaultdict(list)
    for item in data["list"]:
        dt = datetime.fromtimestamp(item["dt"], tz=timezone.utc)
        day_key = dt.strftime("%Y-%m-%d")
        forecast_item = ForecastItem(
            dt=item["dt"],
            temp=item["main"]["temp"],
            feels_like=item["main"]["feels_like"],
            temp_min=item["main"]["temp_min"],
            temp_max=item["main"]["temp_max"],
            humidity=item["main"]["humidity"],
            pressure=item["main"]["pressure"],
            wind=WindInfo(
                speed=item["wind"]["speed"],
                deg=item["wind"].get("deg", 0),
                gust=item["wind"].get("gust"),
            ),
            weather=[
                WeatherCondition(
                    id=w["id"],
                    main=w["main"],
                    description=w["description"],
                    icon=w["icon"],
                )
                for w in item["weather"]
            ],
            pop=item.get("pop", 0.0),
        )
        items_by_day[day_key].append(forecast_item)

    forecast_days = []
    for day_key, items in sorted(items_by_day.items()):
        temps = [i.temp for i in items]
        humidities = [i.humidity for i in items]
        wind_speeds = [i.wind.speed for i in items]
        pops = [i.pop for i in items]
        # Use midday item for primary weather condition, fall back to first
        midday = next(
            (
                i
                for i in items
                if datetime.fromtimestamp(i.dt, tz=timezone.utc).hour in range(11, 14)
            ),
            items[0],
        )
        forecast_days.append(
            ForecastDay(
                date=day_key,
                temp_min=min(temps),
                temp_max=max(temps),
                humidity=sum(humidities) / len(humidities),
                wind_speed=sum(wind_speeds) / len(wind_speeds),
                weather=midday.weather[0],
                pop=max(pops),
                items=items,
            )
        )

    return ForecastResponse(
        city=data["city"]["name"],
        country=data["city"]["country"],
        lat=data["city"]["coord"]["lat"],
        lon=data["city"]["coord"]["lon"],
        forecast=forecast_days,
    )
