"""
Farmer Decision Dashboard - FastAPI Application Server
Provides REST APIs for:
- Asynchronous Open-Meteo real-time micro-climate & historical climate archive
- RandomForest crop suitability recommendations with economic decision matrix
- Multi-layered non-crop rejection vision pipeline (HSV -> CLIP -> YOLO11m)
- Fine-tuned MobileNetV2 soil classification with 60% confidence gate
- SQLite farmer advisory history tracking & ReportLab PDF report generation
- Google OAuth 2.0 / OpenID Connect (Gmail-only) & email/password authentication
"""

import os
from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models.loaders import preload_all_models
from app.routers import weather, recommend, photo, soil, history, rotation, soil_inference, profile, auth, chat, report
from app.models.database import engine, Base, init_db
from app.models.user import User, Farm, RefreshToken
from app.dependencies import get_current_user_optional

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes DB tables, runs column migrations, and preloads ML models at startup."""
    init_db()
    preload_all_models()
    yield

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Precision Agronomic Planning, Market Forecasting & Smart Irrigation System",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static asset directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Register Routers
app.include_router(weather.router)
app.include_router(recommend.router)
app.include_router(photo.router)
app.include_router(soil.router)
app.include_router(rotation.router)
app.include_router(history.router)
app.include_router(profile.router)
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(report.router)

@app.get("/", response_class=HTMLResponse)
async def serve_index(user: Optional[User] = Depends(get_current_user_optional)):
    """
    Serves the primary Farmer Decision Dashboard.
    Redirects unauthenticated visitors to /login.
    """
    if user is None:
        return RedirectResponse(url="/login?next=/", status_code=303)

    index_path = os.path.join("templates", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return HTMLResponse("<h1>Farmer Decision Dashboard</h1><div id='app'></div>")

@app.get("/login", response_class=HTMLResponse)
async def serve_login(next: str = "/", user: Optional[User] = Depends(get_current_user_optional)):
    """
    Serves the Login & Registration page.
    If already authenticated, redirects back to the dashboard or destination.
    """
    if user is not None:
        target = next if (next and next.startswith("/") and not next.startswith("//")) else "/"
        return RedirectResponse(url=target, status_code=303)

    login_path = os.path.join("templates", "login.html")
    if os.path.exists(login_path):
        return FileResponse(login_path)
    return HTMLResponse("<h1>Sign In</h1>")

@app.get("/logout")
async def logout_redirect():
    """Clears the session cookie and redirects to /login."""
    res = RedirectResponse(url="/login?msg=You%20have%20been%20logged%20out.", status_code=303)
    res.delete_cookie("access_token", path="/")
    return res

@app.get("/health")
async def health_check():
    """Server health status."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version
    }

if __name__ == "__main__":
    import uvicorn
    print(f"\n🌾 Starting {settings.app_name} on http://localhost:{settings.port}")
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
