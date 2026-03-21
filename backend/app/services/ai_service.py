from openai import AsyncOpenAI
import json

from app.config import settings
from app.models.weather import CurrentWeather, ForecastResponse, AIInsight


async def generate_weather_insight(
    current: CurrentWeather, forecast: ForecastResponse
) -> AIInsight:
    """Use OpenAI to generate a natural language summary and insights."""
    if not settings.openai_api_key:
        return _fallback_insight(current, forecast)

    client = AsyncOpenAI(api_key=settings.openai_api_key)

    forecast_summary = []
    for day in forecast.forecast[:5]:
        forecast_summary.append(
            f"{day.date}: {day.weather.description}, "
            f"Low {day.temp_min:.1f}°, High {day.temp_max:.1f}°, "
            f"Humidity {day.humidity:.0f}%, Rain chance {day.pop * 100:.0f}%"
        )

    prompt = f"""You are a helpful weather assistant. Analyze the following weather data and provide:
1. A concise 2-sentence summary of current conditions and the week ahead.
2. Three key highlights (notable weather events, temperature trends, or safety tips).
3. A practical recommendation for the week.

Current weather in {current.city}, {current.country}:
- Temperature: {current.temp:.1f}°C (feels like {current.feels_like:.1f}°C)
- Conditions: {current.weather[0].description}
- Humidity: {current.humidity}%
- Wind: {current.wind.speed} m/s

5-day forecast:
{chr(10).join(forecast_summary)}

Respond ONLY with valid JSON in this exact format:
{{
  "summary": "...",
  "highlights": ["...", "...", "..."],
  "recommendation": "..."
}}"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.7,
        )
        raw = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)
        return AIInsight(
            summary=data["summary"],
            highlights=data["highlights"],
            recommendation=data["recommendation"],
        )
    except Exception:
        return _fallback_insight(current, forecast)


def _fallback_insight(current: CurrentWeather, forecast: ForecastResponse) -> AIInsight:
    """Generate a rule-based insight when OpenAI is unavailable."""
    condition = current.weather[0].main.lower()
    temp = current.temp
    humidity = current.humidity

    if temp > 30:
        temp_desc = "hot"
    elif temp > 20:
        temp_desc = "warm"
    elif temp > 10:
        temp_desc = "mild"
    elif temp > 0:
        temp_desc = "cold"
    else:
        temp_desc = "freezing"

    summary = (
        f"Currently {temp_desc} and {current.weather[0].description} in {current.city}. "
        f"Temperatures range from {forecast.forecast[0].temp_min:.1f}°C to "
        f"{forecast.forecast[0].temp_max:.1f}°C today."
    )

    highlights = []
    if humidity > 80:
        highlights.append("High humidity — it may feel more uncomfortable than the temperature suggests.")
    elif humidity < 30:
        highlights.append("Very low humidity — stay hydrated and use moisturiser to prevent dry skin.")

    if current.wind.speed > 10:
        highlights.append(f"Strong winds at {current.wind.speed:.1f} m/s — secure loose outdoor items.")

    rain_days = [d for d in forecast.forecast if d.pop > 0.5]
    if rain_days:
        highlights.append(
            f"Rain likely on {len(rain_days)} day(s) — keep an umbrella handy."
        )
    else:
        highlights.append("Low precipitation chance throughout the forecast period.")

    if temp > 30:
        highlights.append(f"High temperatures of {temp:.1f}°C — stay hydrated and use sun protection.")
    elif temp < 5:
        highlights.append(f"Near-freezing temperatures of {temp:.1f}°C — dress warmly in layers.")

    if len(highlights) < 3:
        highlights.append(f"Humidity is {humidity}% — check the forecast before heading outdoors.")
    if len(highlights) < 3:
        highlights.append(
            f"Wind speed is {current.wind.speed:.1f} m/s — conditions are relatively calm."
        )

    recommendation = (
        "Stay indoors during peak heat hours (12–4 PM) and keep hydrated."
        if temp > 28
        else "Great weather for outdoor activities — enjoy the conditions while they last!"
        if "clear" in condition
        else "Dress in layers and check the forecast before heading out."
    )

    return AIInsight(
        summary=summary,
        highlights=highlights[:3],
        recommendation=recommendation,
    )
