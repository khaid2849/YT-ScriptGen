# backend/app/config.py
from pydantic_settings import BaseSettings
from typing import Optional, List
import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment-specific .env file
backend_dir = Path(__file__).parent.parent
env_file = ".env.prod" if os.getenv("ENVIRONMENT") == "production" else ".env"
dotenv_path = backend_dir / env_file
load_dotenv(dotenv_path)

class Settings(BaseSettings):
    # Application
    APP_NAME: str = os.getenv("APP_NAME", "YouTube Script Generator")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

    # API
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/scriptgen")

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Celery
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/2")

    # File Paths
    TEMP_AUDIO_PATH: str = os.getenv("TEMP_AUDIO_PATH", "./temp_audio")
    GENERATED_SCRIPTS_PATH: str = os.getenv("GENERATED_SCRIPTS_PATH", "./generated_scripts")

    # Whisper Model
    WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "base")

    # Limits
    MAX_VIDEO_DURATION: int = int(os.getenv("MAX_VIDEO_DURATION", "3600"))
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "524288000"))

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    RATE_LIMIT_PER_HOUR: int = int(os.getenv("RATE_LIMIT_PER_HOUR", "1000"))

    # CORS - Parse JSON string from env var
    BACKEND_CORS_ORIGINS: List[str] = json.loads(
        os.getenv("CORS_ORIGINS", '["http://localhost:3000"]')
    )

settings = Settings()

# Create directories if they don't exist
os.makedirs(settings.TEMP_AUDIO_PATH, exist_ok=True)
os.makedirs(settings.GENERATED_SCRIPTS_PATH, exist_ok=True)