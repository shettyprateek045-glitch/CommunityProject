"""
Weather Router: Implements POST /api/weather, /api/location, /api/geocode, and GET /api/ip-location
Uses async httpx with 10-minute in-memory caching and resilient fallback.
"""

from fastapi import APIRouter, HTTPException, Query, Request
from app.schemas import WeatherRequest, WeatherResponse, IPLocationResponse
from app.services.weather_service import fetch_open_meteo_weather, reverse_geocode_async, get_ip_location
from services.weather import forward_geocode

router = APIRouter(prefix="/api", tags=["Weather"])

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
