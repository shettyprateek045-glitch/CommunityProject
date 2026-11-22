"""
Application Configuration Settings
Loads environment variables from .env with fallback defaults.
"""

import os
from pydantic import BaseModel

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    if os.path.exists(".env"):
        try:
            with open(".env", "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip().strip("'\""))
        except Exception:
            pass

class Settings(BaseModel):
    app_name: str = "Farmer Decision Dashboard"
    app_version: str = "2.1.0"
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "5000"))
    secret_key: str = os.getenv("SECRET_KEY", "farmer-decision-secret-key-2026")
    data_gov_in_api_key: str = os.getenv("DATA_GOV_IN_API_KEY", "")
    open_meteo_timeout: float = float(os.getenv("OPEN_METEO_TIMEOUT", "5.0"))
    cache_ttl_seconds: int = int(os.getenv("CACHE_TTL_SECONDS", "600"))  # 10 minutes
    upload_folder: str = "uploads"
    models_dir: str = "models"
    data_dir: str = "data"
    google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", "")
    google_client_secret: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    google_redirect_uri: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5000/api/auth/google/callback")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    owner_email: str = os.getenv("OWNER_EMAIL", "shettyprateek@gmail.com")

settings = Settings()

os.makedirs(settings.upload_folder, exist_ok=True)
os.makedirs(settings.models_dir, exist_ok=True)
os.makedirs(settings.data_dir, exist_ok=True)
