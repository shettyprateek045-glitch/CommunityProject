"""
Photo Check Router: Implements POST /api/photo-check with Layered Non-Crop Rejection
Rejects screenshots, selfies, non-crop objects, and low-confidence predictions.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas import PhotoCheckResponse
from app.services.vision_service import process_crop_photo
from app.services.leaf_disease_service import analyze_leaf_disease

router = APIRouter(prefix="/api", tags=["Vision Photo Check"])

@router.post("/photo-check", response_model=PhotoCheckResponse)
async def api_photo_check(photo: UploadFile = File(...)):
    """
    POST /api/photo-check
    Layered verification gates:
      Gate A: File validation (size, type, PIL decode)
      Gate B: HSV green-pixel ratio check (>= 8%)
      Gate C: CLIP zero-shot gate (crop vs screenshot/person/indoor/vehicle/building/bare soil)
      Gate D: YOLO11m classifier margin check (top1 >= 0.50 and top1 - top2 >= 0.15)
      Gate E: Ok status with smart crop rotation advice
    """
    try:
        contents = await photo.read()
        filename = photo.filename or "field.jpg"
        result = process_crop_photo(contents, filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Photo evaluation failed: {str(e)}")

@router.post("/photo/leaf-disease")
async def api_leaf_disease(photo: UploadFile = File(...)):
    """
    POST /api/photo/leaf-disease
    Phase 4: Foliar pest & disease detection on PlantVillage benchmark YOLO model:
    - Rejects non-leaf imagery
    - 60% confidence gate (returns 'Uncertain' if < 0.60)
    - Actionable treatments, annotated bounding boxes, and mandatory agriculture officer disclaimer.
    """
    try:
        contents = await photo.read()
        result = analyze_leaf_disease(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Leaf disease detection failed: {str(e)}")
