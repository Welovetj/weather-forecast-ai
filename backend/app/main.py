from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.weather import router as weather_router

app = FastAPI(
    title=settings.app_name,
    description=(
        "A full-stack AI-powered weather forecast application that combines "
        "real-time weather data from OpenWeatherMap with GPT-4o-mini AI insights."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "Weather Forecast AI API",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
