import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.models.weather import (
    CurrentWeather,
    ForecastResponse,
    ForecastDay,
    ForecastItem,
    WeatherCondition,
    WindInfo,
    AIInsight,
    WeatherWithInsights,
)

client = TestClient(app)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

MOCK_CONDITION = WeatherCondition(id=800, main="Clear", description="clear sky", icon="01d")
MOCK_WIND = WindInfo(speed=3.5, deg=180, gust=5.0)

MOCK_CURRENT = CurrentWeather(
    city="London",
    country="GB",
    lat=51.51,
    lon=-0.13,
    temp=18.0,
    feels_like=17.2,
    temp_min=15.0,
    temp_max=21.0,
    humidity=60,
    pressure=1013,
    visibility=10000,
    wind=MOCK_WIND,
    weather=[MOCK_CONDITION],
    sunrise=1700000000,
    sunset=1700040000,
    dt=1700020000,
    timezone=0,
)

MOCK_FORECAST_ITEM = ForecastItem(
    dt=1700020000,
    temp=18.0,
    feels_like=17.2,
    temp_min=15.0,
    temp_max=21.0,
    humidity=60,
    pressure=1013,
    wind=MOCK_WIND,
    weather=[MOCK_CONDITION],
    pop=0.1,
)

MOCK_FORECAST_DAY = ForecastDay(
    date="2024-01-15",
    temp_min=15.0,
    temp_max=21.0,
    humidity=60.0,
    wind_speed=3.5,
    weather=MOCK_CONDITION,
    pop=0.1,
    items=[MOCK_FORECAST_ITEM],
)

MOCK_FORECAST = ForecastResponse(
    city="London",
    country="GB",
    lat=51.51,
    lon=-0.13,
    forecast=[MOCK_FORECAST_DAY] * 5,
)

MOCK_INSIGHT = AIInsight(
    summary="Clear skies and warm temperatures in London.",
    highlights=["Great visibility today.", "Low humidity.", "Calm winds."],
    recommendation="Perfect day for outdoor activities!",
)


# ---------------------------------------------------------------------------
# Health & Root endpoints
# ---------------------------------------------------------------------------

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Weather Forecast AI API"
    assert "docs" in data


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


# ---------------------------------------------------------------------------
# /api/weather/current
# ---------------------------------------------------------------------------

@patch("app.routes.weather.get_current_weather", new_callable=AsyncMock)
def test_current_weather_success(mock_get):
    mock_get.return_value = MOCK_CURRENT
    response = client.get("/api/weather/current?city=London")
    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "London"
    assert data["country"] == "GB"
    assert data["temp"] == 18.0


@patch("app.routes.weather.get_current_weather", new_callable=AsyncMock)
def test_current_weather_not_found(mock_get):
    import httpx

    mock_response = MagicMock()
    mock_response.status_code = 404
    mock_get.side_effect = httpx.HTTPStatusError("Not found", request=MagicMock(), response=mock_response)
    response = client.get("/api/weather/current?city=UnknownCityXYZ")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@patch("app.routes.weather.get_current_weather", new_callable=AsyncMock)
def test_current_weather_invalid_api_key(mock_get):
    import httpx

    mock_response = MagicMock()
    mock_response.status_code = 401
    mock_get.side_effect = httpx.HTTPStatusError("Unauthorized", request=MagicMock(), response=mock_response)
    response = client.get("/api/weather/current?city=London")
    assert response.status_code == 401


def test_current_weather_missing_city():
    response = client.get("/api/weather/current")
    assert response.status_code == 422  # Unprocessable entity — missing required query param


# ---------------------------------------------------------------------------
# /api/weather/forecast
# ---------------------------------------------------------------------------

@patch("app.routes.weather.get_forecast", new_callable=AsyncMock)
def test_forecast_success(mock_get):
    mock_get.return_value = MOCK_FORECAST
    response = client.get("/api/weather/forecast?city=London")
    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "London"
    assert len(data["forecast"]) == 5


@patch("app.routes.weather.get_forecast", new_callable=AsyncMock)
def test_forecast_not_found(mock_get):
    import httpx

    mock_response = MagicMock()
    mock_response.status_code = 404
    mock_get.side_effect = httpx.HTTPStatusError("Not found", request=MagicMock(), response=mock_response)
    response = client.get("/api/weather/forecast?city=FakeCity")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# /api/weather/insights
# ---------------------------------------------------------------------------

@patch("app.routes.weather.generate_weather_insight", new_callable=AsyncMock)
@patch("app.routes.weather.get_forecast", new_callable=AsyncMock)
@patch("app.routes.weather.get_current_weather", new_callable=AsyncMock)
def test_insights_success(mock_current, mock_forecast, mock_insight):
    mock_current.return_value = MOCK_CURRENT
    mock_forecast.return_value = MOCK_FORECAST
    mock_insight.return_value = MOCK_INSIGHT
    response = client.get("/api/weather/insights?city=London")
    assert response.status_code == 200
    data = response.json()
    assert data["current"]["city"] == "London"
    assert data["forecast"]["city"] == "London"
    assert data["ai_insight"]["summary"] != ""
    assert len(data["ai_insight"]["highlights"]) == 3


# ---------------------------------------------------------------------------
# AI Insight fallback (no API key)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_fallback_insight_hot_weather():
    from app.services.ai_service import _fallback_insight

    hot_current = MOCK_CURRENT.model_copy(update={"temp": 35.0})
    insight = _fallback_insight(hot_current, MOCK_FORECAST)
    assert insight.summary != ""
    assert len(insight.highlights) == 3
    assert "outdoor" in insight.recommendation.lower() or "hydrat" in insight.recommendation.lower()


@pytest.mark.asyncio
async def test_fallback_insight_rainy_forecast():
    from app.services.ai_service import _fallback_insight

    rainy_day = MOCK_FORECAST_DAY.model_copy(update={"pop": 0.8})
    rainy_forecast = MOCK_FORECAST.model_copy(update={"forecast": [rainy_day] * 5})
    insight = _fallback_insight(MOCK_CURRENT, rainy_forecast)
    assert any("rain" in h.lower() or "umbrella" in h.lower() for h in insight.highlights)
