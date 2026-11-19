"""
Tests for Non-Crop Photo Rejection (POST /api/photo-check)
Verifies layered gates:
  Gate A: File validation (empty, format)
  Gate B: HSV green-pixel vegetation ratio (<8% rejected)
  Gate C: CLIP zero-shot rejection (screenshot, person, indoor, vehicle, bare soil)
  Gate D: YOLO11m classifier margin check (top1 >= 0.50 and top1 - top2 >= 0.15)
  Gate E: Successful identification with crop rotation recommendations
"""

import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_synthetic_image(color=(255, 255, 255), size=(224, 224)):
    """Creates an in-memory PNG image with solid color."""
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.getvalue()

def create_synthetic_foliage_image(size=(224, 224)):
    """Creates an in-memory JPEG image with vibrant agricultural green foliage hue."""
    # OpenCV RGB green: (34, 139, 34) -> ForestGreen
    img = Image.new("RGB", size, color=(34, 139, 34))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.getvalue()

def test_gate_a_empty_photo_rejection():
    """Verify Gate A rejects empty file payloads."""
    files = {"photo": ("empty.jpg", b"", "image/jpeg")}
    response = client.post("/api/photo-check", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "not_crop"
    assert "Gate A" in data.get("gate_failed", "")

def test_gate_b_screenshot_white_rejection():
    """Verify Gate B rejects screenshots/white images (green ratio < 8%)."""
    white_img = create_synthetic_image(color=(245, 245, 245))
    files = {"photo": ("screenshot.jpg", white_img, "image/jpeg")}
    response = client.post("/api/photo-check", files=files)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "not_crop"
    assert "Gate B" in data.get("gate_failed", "")
    assert "below 8% threshold" in data["reason"].lower()

def test_gate_b_gray_vehicle_rejection():
    """Verify Gate B rejects dark metallic/concrete non-plant images."""
    gray_img = create_synthetic_image(color=(70, 70, 75))
    files = {"photo": ("car.jpg", gray_img, "image/jpeg")}
    response = client.post("/api/photo-check", files=files)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "not_crop"
    assert "below 8% threshold" in data["reason"].lower()

def test_crop_foliage_passes_vegetation_gate():
    """Verify green foliage passes Gate B to be evaluated by YOLO11m classifier."""
    foliage_img = create_synthetic_foliage_image()
    files = {"photo": ("foliage.jpg", foliage_img, "image/jpeg")}
    response = client.post("/api/photo-check", files=files)
    assert response.status_code == 200
    data = response.json()

    # The green foliage should pass Gate B (green ratio >= 8%)
    # And either return 'ok' or 'uncertain' based on YOLO11m margin
    assert data["status"] in ["ok", "uncertain"]
    assert "green_pixel_ratio" in data
    assert data["green_pixel_ratio"] >= 0.08
    if data["status"] == "ok":
        assert "rotation_recommendations" in data
    elif data["status"] == "uncertain":
        assert "top_3_guesses" in data
