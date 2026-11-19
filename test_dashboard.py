"""
Farmer Decision Dashboard - Comprehensive Verification Test Suite
Tests all endpoints, ML models, weather integration, what-if re-ranking,
vision photo-check, SQLite history, and PDF export.
"""

import sys
import os
import json
import io
from PIL import Image

# Ensure path is configured
sys.path.insert(0, os.path.abspath("."))

from app import app
from services.vision import predict_crop_image, load_vision_model
from services.engine import compute_farmer_recommendations, load_suitability_model
from services.weather import reverse_geocode, get_live_weather, get_historical_climate
from services.export_pdf import generate_advisory_pdf
from services.history import get_farmer_history

def run_tests():
    print("=" * 78)
    print("  RUNNING FARMER DECISION DASHBOARD TEST SUITE")
    print("=" * 78)

    client = app.test_client()

    # Test 1: Root route
    print("\n[Test 1] Testing GET / (HTML Dashboard)...")
    res = client.get("/")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert b"Farmer Decision Dashboard" in res.data
    assert b"chart-profit" in res.data
    assert b"farm-map" in res.data
    print("  --> PASS: Dashboard HTML successfully served.")

    # Test 2: Location & Weather API
    print("\n[Test 2] Testing POST /api/location (GPS & Weather Feed)...")
    res = client.post("/api/location", json={"lat": 15.4589, "lon": 75.0078})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.get_json()
    assert data["status"] == "success"
    assert "location" in data and "weather" in data and "climate" in data
    assert "current" in data["weather"]
    print(f"  --> PASS: Geocoded to '{data['location']['village']}, {data['location']['state']}', Temp={data['weather']['current']['temperature']}°C")

    # Test 3: Recommendation Engine
    print("\n[Test 3] Testing POST /api/recommend (AI Decision Matrix)...")
    payload = {
        "lat": 15.4589,
        "lon": 75.0078,
        "location_name": "Dharwad, Karnataka",
        "land_acres": 3.0,
        "budget_inr": 70000,
        "irrigation": "drip",
        "soil_n": 85,
        "soil_p": 45,
        "soil_k": 42,
        "soil_ph": 6.5,
        "soil_type": "Clay Loam",
        "weather": data["weather"],
        "climate": data["climate"]
    }
    res = client.post("/api/recommend", json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    rec_data = res.get_json()
    assert rec_data["status"] == "success"
    assert "recommendations" in rec_data
    top_crops = rec_data["recommendations"]["top_crops"]
    assert len(top_crops) > 0, "Expected at least 1 top crop"
    print(f"  --> PASS: Received {len(top_crops)} recommendations. #1: {top_crops[0]['name']} (Profit: ₹{top_crops[0]['net_profit_inr']:,.0f}, Suit: {top_crops[0]['suitability_pct']}%)")

    # Test 4: What-If Slider Re-Ranking
    print("\n[Test 4] Testing POST /api/whatif (Live Slider Simulation)...")
    whatif_payload = {
        "budget_inr": 20000,  # Constrained budget
        "land_acres": 2.0,
        "irrigation": "rainfed",
        "soil_n": 85,
        "soil_p": 45,
        "soil_k": 42,
        "soil_ph": 6.5,
        "soil_type": "Clay Loam",
        "temp_c": 26.5,
        "humidity": 65.0,
        "annual_rain": 950.0
    }
    res = client.post("/api/whatif", json=whatif_payload)
    assert res.status_code == 200
    wi_data = res.get_json()
    assert wi_data["status"] == "success"
    assert len(wi_data["excluded_by_budget"]) > 0, "Expected some crops to be excluded with ₹20,000 budget"
    print(f"  --> PASS: What-If re-ranking succeeded. {len(wi_data['excluded_by_budget'])} crops excluded by budget.")

    # Test 5: Field Photo Check (YOLO11m-cls)
    print("\n[Test 5] Testing POST /api/photo-check (Vision Classifier & Rotation)...")
    # Create test image in memory
    img = Image.new("RGB", (224, 224), color=(34, 139, 34))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    res = client.post(
        "/api/photo-check",
        data={"photo": (img_byte_arr, "test_field.jpg")},
        content_type="multipart/form-data"
    )
    assert res.status_code == 200
    v_data = res.get_json()
    assert v_data["status"] == "success"
    assert "detected_crop" in v_data
    assert "confidence" in v_data
    assert "rotation_recommendations" in v_data
    print(f"  --> PASS: YOLO11m analyzed image. Detected: {v_data['detected_crop']} (conf={v_data['confidence']:.2f}, confident={v_data['is_confident']})")

    # Test 6: SQLite History
    print("\n[Test 6] Testing GET /api/history (SQLite Records)...")
    res = client.get("/api/history")
    assert res.status_code == 200
    h_data = res.get_json()
    assert h_data["status"] == "success"
    assert len(h_data["history"]) >= 1
    print(f"  --> PASS: SQLite history retrieved {len(h_data['history'])} records.")

    # Test 7: PDF Advisory Generation & Export
    print("\n[Test 7] Testing POST /api/export-pdf (Publication-Grade PDF)...")
    pdf_payload = {
        "location": "Dharwad, Karnataka",
        "lat": 15.4589,
        "lon": 75.0078,
        "land_acres": 3.0,
        "budget_inr": 70000,
        "irrigation": "drip",
        "soil": {"n": 85, "p": 45, "k": 42, "ph": 6.5, "type": "Clay Loam"},
        "top_crops": top_crops,
        "weather": data["weather"],
        "climate": data["climate"]
    }
    res = client.post("/api/export-pdf", json=pdf_payload)
    assert res.status_code == 200
    assert res.mimetype == "application/pdf"
    assert res.data[:4] == b"%PDF", "Output must be valid PDF"
    print(f"  --> PASS: PDF successfully generated ({len(res.data):,} bytes).")

    print("\n" + "=" * 78)
    print("  ALL 7 TESTS PASSED SUCCESSFULLY! (100% VERIFIED)")
    print("=" * 78)

if __name__ == "__main__":
    run_tests()
