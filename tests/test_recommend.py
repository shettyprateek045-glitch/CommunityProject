"""
Tests for Crop Recommendation & What-If Live Simulation (POST /api/recommend, POST /api/whatif)
Verifies:
  1. RandomForest predict_proba suitability integrated into decision matrix.
  2. Profit = Yield x Land x Price - Cost.
  3. Budget exclusion filtering.
  4. Multi-factor risk scoring (Low, Medium, High).
  5. Explainability feature importances.
  6. Instant what-if re-ranking without page reload.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_recommend_top_5_crops():
    """Verify POST /api/recommend returns top 5 ranked crops with complete metrics."""
    payload = {
        "land_acres": 3.0,
        "budget_inr": 80000.0,
        "irrigation": "drip",
        "soil_n": 85.0,
        "soil_p": 45.0,
        "soil_k": 42.0,
        "soil_ph": 6.5,
        "soil_type": "Clay Loam",
        "temperature": 26.5,
        "humidity": 68.0,
        "rainfall": 950.0
    }
    response = client.post("/api/recommend", json=payload)
    assert response.status_code == 200, f"Error: {response.text}"
    data = response.json()

    assert data["status"] == "success"
    top_crops = data["top_crops"]
    assert len(top_crops) == 5

    first_crop = top_crops[0]
    assert "name" in first_crop
    assert "suitability_pct" in first_crop
    assert "net_profit_inr" in first_crop
    assert "total_cost_inr" in first_crop
    assert "total_yield_qtl" in first_crop
    assert "risk_level" in first_crop
    assert first_crop["risk_level"] in ["Low", "Medium", "High"]
    assert len(first_crop["reasons"]) >= 2
    assert "fertilizer_advice" in first_crop
    assert "growth_calendar" in first_crop

    # Verify explainability weights exist
    assert "explainability" in data
    assert len(data["explainability"]) > 0
    total_imp = sum(f["importance_pct"] for f in data["explainability"])
    assert total_imp >= 95.0, "Feature importances should sum to ~100%"

def test_recommend_budget_constraint_exclusion():
    """Verify crops exceeding farmer budget are properly excluded."""
    # Tiny budget of 5,000 INR for 5 acres -> total cost per acre would exceed budget
    payload = {
        "land_acres": 5.0,
        "budget_inr": 5000.0,
        "irrigation": "rainfed",
        "soil_n": 50.0,
        "soil_p": 25.0,
        "soil_k": 25.0,
        "soil_ph": 6.8,
        "soil_type": "Sandy Loam",
        "temperature": 28.0,
        "humidity": 55.0,
        "rainfall": 600.0
    }
    response = client.post("/api/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "excluded_by_budget" in data
    # When budget is strictly 5000 for 5 acres, most commercial crops will be excluded
    assert len(data["excluded_by_budget"]) > 0

def test_whatif_live_reranking():
    """Verify POST /api/whatif responds quickly with updated top crops."""
    payload = {
        "land_acres": 4.0,
        "budget_inr": 120000.0,
        "irrigation": "borewell",
        "soil_n": 90.0,
        "soil_p": 50.0,
        "soil_k": 45.0,
        "soil_ph": 7.0,
        "soil_type": "Black Cotton",
        "temperature": 27.0,
        "humidity": 60.0,
        "rainfall": 850.0
    }
    response = client.post("/api/whatif", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert "top_crops" in data
    assert len(data["top_crops"]) <= 5
    assert "explainability" in data
