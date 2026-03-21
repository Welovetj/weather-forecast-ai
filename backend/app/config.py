from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openweather_api_key: str = ""
    openai_api_key: str = ""
    app_name: str = "Weather Forecast AI"
    debug: bool = False

    class Config:
        env_file = ".env"


settings = Settings()
