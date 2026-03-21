from fastapi import APIRouter, HTTPException, Query
from typing import Literal
import httpx

from app.services.weather_service import get_current_weather, get_forecast
from app.services.ai_service import generate_weather_insight
from app.models.weather import CurrentWeather, ForecastResponse, WeatherWithInsights

router = APIRouter(prefix="/weather", tags=["weather"])

UnitType = Literal["metric", "imperial", "standard"]


@router.get("/current", response_model=CurrentWeather)
async def current_weather(
    city: str = Query(..., description="City name, e.g. 'London' or 'New York,US'"),
    units: UnitType = Query("metric", description="Unit system: metric, imperial, or standard"),
):
    """Get current weather conditions for a city."""
    try:
        return await get_current_weather(city, units)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found.")
        if e.response.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid OpenWeatherMap API key.")
        raise HTTPException(status_code=502, detail="Weather service unavailable.")
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error.")


@router.get("/forecast", response_model=ForecastResponse)
async def weather_forecast(
    city: str = Query(..., description="City name, e.g. 'London' or 'New York,US'"),
    units: UnitType = Query("metric", description="Unit system: metric, imperial, or standard"),
):
    """Get 5-day weather forecast for a city."""
    try:
        return await get_forecast(city, units)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found.")
        if e.response.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid OpenWeatherMap API key.")
        raise HTTPException(status_code=502, detail="Weather service unavailable.")
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error.")


@router.get("/insights", response_model=WeatherWithInsights)
async def weather_with_insights(
    city: str = Query(..., description="City name, e.g. 'London' or 'New York,US'"),
    units: UnitType = Query("metric", description="Unit system: metric, imperial, or standard"),
):
    """Get current weather + 5-day forecast + AI-powered insights for a city."""
    try:
        current, forecast = await get_current_weather(city, units), await get_forecast(city, units)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found.")
        if e.response.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid OpenWeatherMap API key.")
        raise HTTPException(status_code=502, detail="Weather service unavailable.")
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error.")

    ai_insight = await generate_weather_insight(current, forecast)
    return WeatherWithInsights(current=current, forecast=forecast, ai_insight=ai_insight)
