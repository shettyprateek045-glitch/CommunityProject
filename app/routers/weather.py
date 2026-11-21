"""
Weather Router: Implements POST /api/weather, /api/location, /api/geocode, and GET /api/ip-location
Uses async httpx with 10-minute in-memory caching and resilient fallback.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Request
from app.schemas import WeatherRequest, WeatherResponse, IPLocationResponse
from app.services.weather_service import (
    fetch_open_meteo_weather,
    reverse_geocode_async,
    get_ip_location,
    calculate_irrigation_and_sowing_advice
)
from services.weather import forward_geocode

router = APIRouter(prefix="/api", tags=["Weather"])

@router.get("/weather/current")
@router.get("/weather")
async def api_weather_get(lat: float = 15.3173, lon: Optional[float] = None, lng: Optional[float] = None):
    """
    GET /api/weather/current?lat=...&lon=...
    Fetches real-time micro-climate, 7-day forecast, 24h hourly rain,
    and 12-month historical archive from Open-Meteo using async httpx.
    """
    actual_lon = lon if lon is not None else (lng if lng is not None else 75.7139)
    try:
        data = await fetch_open_meteo_weather(lat, actual_lon)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather service failure: {str(e)}")

@router.post("/weather", response_model=WeatherResponse)
async def api_weather(req: WeatherRequest):
    """
    POST /api/weather {lat, lng}
    Fetches real-time micro-climate, 7-day forecast, 24h hourly rain,
    and 12-month historical archive from Open-Meteo using async httpx.
    """
    lat = req.lat
    lon = req.get_lon()
    try:
        data = await fetch_open_meteo_weather(lat, lon)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather service failure: {str(e)}")

@router.post("/location")
async def api_location(req: WeatherRequest):
    """
    POST /api/location
    Reverse-geocodes coordinates and returns live weather and historical climate.
    """
    lat = req.lat
    lon = req.get_lon()
    loc_info = await reverse_geocode_async(lat, lon)
    wx_info = await fetch_open_meteo_weather(lat, lon)

    return {
        "status": "success",
        "location": loc_info,
        "weather": wx_info,
        "climate": {
            "annual_rainfall_mm": wx_info.get("annual_rainfall_estimate", 950.0),
            "monthly_averages": wx_info.get("monthly_climate_12m", [])
        }
    }

@router.get("/ip-location", response_model=IPLocationResponse)
async def api_ip_location():
    """
    GET /api/ip-location
    Returns approximate IP-based location when GPS is unavailable.
    """
    try:
        data = await get_ip_location()
        return data
    except Exception as e:
        return IPLocationResponse()

@router.get("/geocode")
async def api_geocode(q: str = Query(..., min_length=1, description="Village or district query")):
    """
    GET /api/geocode?q=Dharwad
    Manual geocoding query fallback.
    """
    try:
        res = forward_geocode(q)
        return {"status": "success", "result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Geocode search error: {str(e)}")

@router.post("/weather/irrigation-schedule")
async def api_irrigation_schedule(request: Request):
    """
    POST /api/weather/irrigation-schedule
    Generates 7-day crop-specific FAO-56 irrigation schedule and sowing window recommendation.
    """
    try:
        body = await request.json()
        lat = float(body.get("lat", 15.3173))
        lon = float(body.get("lon", body.get("lng", 75.7139)))
        crop = str(body.get("crop", "maize"))
        stage = str(body.get("crop_stage", body.get("stage", "vegetative")))
        soil_type = str(body.get("soil_type", "Clay Loam"))
        irrigation = str(body.get("irrigation_method", body.get("irrigation", "drip")))
        acres = float(body.get("land_acres", body.get("acres", 1.0)))

        res = await calculate_irrigation_and_sowing_advice(
            lat=lat,
            lon=lon,
            crop=crop,
            stage=stage,
            soil_type=soil_type,
            irrigation=irrigation,
            acres=acres
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Irrigation schedule calculation failed: {str(e)}")
