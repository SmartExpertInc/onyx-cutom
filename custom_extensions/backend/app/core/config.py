# custom_extensions/backend/app/core/config.py
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # Default value matches docker-compose internal URL
    CUSTOM_FRONTEND_URL: str = "http://custom_frontend:3001"
    # DATABASE_URL: Optional[str] = None # Add if use DB

    class Config:
        # Load from .env file if present in the backend directory
        # But docker-compose environment injection usually takes precedence
        env_file = '.env'
        extra = 'ignore' # Ignore extra environment variables

settings = Settings()

# Nextcloud SmartDrive Configuration
NEXTCLOUD_URL = os.getenv("NEXTCLOUD_URL", "https://nc1.contentbuilder.ai")
NEXTCLOUD_ADMIN_USERNAME = os.getenv("NEXTCLOUD_ADMIN_USERNAME", "admin")
NEXTCLOUD_ADMIN_PASSWORD = os.getenv("NEXTCLOUD_ADMIN_PASSWORD", "")
