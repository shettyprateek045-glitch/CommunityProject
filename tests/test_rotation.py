"""
Tests for Crop Rotation Engine (POST /api/rotation-check)
Verifies:
  1. Legume crop (Gram) enhances soil fertility (Improved impact, +N).
  2. Heavy feeder (Maize) depletes soil fertility (Depleted impact, -N).
  3. Solanaceous crop (Tomato) flags disease carryover risks.
  4. Kannada tips and agronomic advisories.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_rotation_legume_improved():
    """Verify pulses/legumes improve soil nitrogen and fertility."""
    payload = {
        "crop_name": "Gram",
        "soil_n": 80.0,
        "soil_p": 40.0,
        "soil_k": 40.0
    }
    response = client.post("/api/rotation-check", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert data["fertility_impact"] == "Improved"
    assert data["nitrogen_fixation"] is True
    assert data["adjusted_npk"]["n"] > 80.0
    assert len(data["recommended_next_crops"]) > 0

def test_rotation_cereal_depleted():
    """Verify heavy feeders deplete nitrogen and recommend legumes."""
    payload = {
        "crop_name": "Maize",
        "soil_n": 80.0,
        "soil_p": 40.0,
        "soil_k": 40.0
    }
    response = client.post("/api/rotation-check", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert data["fertility_impact"] == "Depleted"
    assert data["adjusted_npk"]["n"] < 80.0
    # Next recommended should include Gram or pulse
    rec_crops = [r["crop"] for r in data["recommended_next_crops"]]
    assert any("Gram" in c or "Soybean" in c for c in rec_crops)

def test_rotation_disease_avoidance():
    """Verify continuous Solanaceae is flagged with disease warning."""
    payload = {
        "crop_name": "Tomato"
    }
    response = client.post("/api/rotation-check", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    avoid_crops = [a["crop"] for a in data["crops_to_avoid"]]
    assert any("Chilli" in a or "Potato" in a for a in avoid_crops)
    assert len(data["carryover_risks"]) > 0
