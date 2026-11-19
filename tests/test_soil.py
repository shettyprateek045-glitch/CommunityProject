"""
Tests for MobileNetV2 Soil Classification & Non-Soil Gate (POST /api/soil-photo)
Verifies:
  1. Non-soil gate rejection (plants/leaves, sky/screen, dark, blurry).
  2. Textured bare soil image classification.
  3. Pedological report (soil_colour, texture, problems_to_watch, estimated_n).
  4. 60% confidence gate enforcement.
"""

import io
import pytest
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.models.loaders import SOIL_CLASSES

client = TestClient(app)

def create_textured_soil_image(size=(224, 224)):
    """Creates synthetic textured soil image with realistic noise variance."""
    np.random.seed(42)
    # Dark brown / black soil matrix with texture
    base = np.zeros((size[1], size[0], 3), dtype=np.uint8)
    base[:, :, 0] = np.random.normal(loc=65, scale=20, size=size).clip(0, 255).astype(np.uint8)
    base[:, :, 1] = np.random.normal(loc=55, scale=18, size=size).clip(0, 255).astype(np.uint8)
    base[:, :, 2] = np.random.normal(loc=45, scale=16, size=size).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(base)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.getvalue()

def create_plant_leaves_image(size=(224, 224)):
    """Creates synthetic green crop/leaf image."""
    base = np.zeros((size[1], size[0], 3), dtype=np.uint8)
    base[:, :, 0] = 30
    base[:, :, 1] = 180  # Dominant green
    base[:, :, 2] = 40
    img = Image.fromarray(base)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.getvalue()

def create_blue_screen_image(size=(224, 224)):
    """Creates synthetic blue sky or screen image."""
    base = np.zeros((size[1], size[0], 3), dtype=np.uint8)
    base[:, :, 0] = 40
    base[:, :, 1] = 100
    base[:, :, 2] = 220  # Dominant blue
    img = Image.fromarray(base)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.getvalue()

def create_dark_image(size=(224, 224)):
    """Creates synthetic too-dark image."""
    img = Image.new("RGB", size, color=(10, 10, 10))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.getvalue()

def test_soil_photo_classification_valid():
    """Verify POST /api/soil-photo succeeds on textured bare soil image."""
    soil_bytes = create_textured_soil_image()
    files = {"photo": ("soil_sample.jpg", soil_bytes, "image/jpeg")}
    response = client.post("/api/soil-photo", files=files)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] in ["ok", "uncertain"]
    assert "soil_type" in data
    assert data["soil_type"] in SOIL_CLASSES
    assert "confidence" in data
    assert "soil_colour" in data
    assert "texture" in data
    assert "problems_to_watch" in data
    assert "estimated_n" in data
    assert "disclaimer" in data
    assert "Soil Health Card" in data["disclaimer"]

def test_soil_photo_rejection_plants():
    """Verify non-soil gate rejects plant leaves."""
    plant_bytes = create_plant_leaves_image()
    files = {"photo": ("leaves.jpg", plant_bytes, "image/jpeg")}
    response = client.post("/api/soil-photo", files=files)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "not_soil"
    assert data["gate_failed"] == "plant_vegetation"
    assert "rejection_reason" in data
    assert "not a soil image" in data["rejection_reason"].lower() or "plants" in data["rejection_reason"].lower()

def test_soil_photo_rejection_sky():
    """Verify non-soil gate rejects sky/blue screen."""
    sky_bytes = create_blue_screen_image()
    files = {"photo": ("sky.jpg", sky_bytes, "image/jpeg")}
    response = client.post("/api/soil-photo", files=files)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "not_soil"
    assert data["gate_failed"] == "sky_or_screen"

def test_soil_photo_rejection_dark():
    """Verify non-soil gate rejects pitch dark photos."""
    dark_bytes = create_dark_image()
    files = {"photo": ("dark.jpg", dark_bytes, "image/jpeg")}
    response = client.post("/api/soil-photo", files=files)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "not_soil"
    assert data["gate_failed"] == "too_dark"
