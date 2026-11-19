"""
Farmer Decision Dashboard - FastAPI Application Server
Provides REST APIs for:
- Asynchronous Open-Meteo real-time micro-climate & historical climate archive
- RandomForest crop suitability recommendations with economic decision matrix
- Multi-layered non-crop rejection vision pipeline (HSV -> CLIP -> YOLO11m)
- Fine-tuned MobileNetV2 soil classification with 60% confidence gate
- SQLite farmer advisory history tracking & ReportLab PDF report generation
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models.loaders import preload_all_models
from app.routers import weather, recommend, photo, soil, history, rotation

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Preloads ML models once at server startup (zero per-request loading latency)."""
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

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """Serves the primary Farmer Decision Dashboard single-page application."""
    index_path = os.path.join("templates", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return HTMLResponse("<h1>Farmer Decision Dashboard</h1><div id='app'></div>")

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
