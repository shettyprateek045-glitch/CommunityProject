"""
Tests for Weather Service & Router (POST /api/weather, POST /api/location, GET /api/geocode)
Verifies:
  1. Open-Meteo real-time weather & 7-day forecast parsing.
  2. 12-month historical climate & 24h hourly rain.
  3. 10-minute in-memory cache functionality.
  4. Nominatim reverse geocoding fallback resilience.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_weather_endpoint():
    """Verify POST /api/weather returns accurate Open-Meteo structure."""
    payload = {"lat": 15.4589, "lng": 75.0078}
    response = client.post("/api/weather", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()

    assert data["status"] == "success"
    assert "temperature" in data
    assert "humidity" in data
    assert "rainfall_mm" in data
    assert "rainfall_7d_total" in data
    assert "annual_rainfall_estimate" in data
    assert "daily_7d" in data
    assert len(data["daily_7d"]) >= 7
    assert "hourly_rain_24h" in data
    assert "monthly_climate_12m" in data
    assert len(data["monthly_climate_12m"]) == 12
    assert "alerts" in data
    assert len(data["alerts"]) > 0

def test_weather_10_minute_cache():
    """Verify that a second query to the same coordinates hits the 10-minute cache."""
    coords = {"lat": 12.9716, "lng": 77.5946}
    res1 = client.post("/api/weather", json=coords)
    assert res1.status_code == 200
    data1 = res1.json()

    # Second call should return cached=True
    res2 = client.post("/api/weather", json=coords)
    assert res2.status_code == 200
    data2 = res2.json()

    assert data2.get("cached") is True
    assert data1["temperature"] == data2["temperature"]

def test_api_location_reverse_geocode():
    """Verify POST /api/location returns both location details and weather."""
    payload = {"lat": 15.4589, "lon": 75.0078}
    response = client.post("/api/location", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert "location" in data
    assert "village" in data["location"]
    assert "weather" in data
    assert "climate" in data
    assert "annual_rainfall_mm" in data["climate"]

def test_api_geocode_search():
    """Verify GET /api/geocode returns coordinates for a known query."""
    response = client.get("/api/geocode?q=Dharwad")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "result" in data
    assert "lat" in data["result"]
    assert "lon" in data["result"]
