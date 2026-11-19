"""
Soil Photo Router: Implements POST /api/soil-photo
Fine-tuned MobileNetV2 soil classifier with a 60% confidence gate.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas import SoilPhotoResponse
from app.services.soil_service import predict_soil_image

router = APIRouter(prefix="/api", tags=["Soil Classification"])

@router.post("/soil-photo", response_model=SoilPhotoResponse)
async def api_soil_photo(photo: UploadFile = File(...)):
    """
    POST /api/soil-photo
    Accepts field soil imagery, classifies into target pedological class
    ('Alluvial', 'Black Cotton', 'Clay Loam', 'Red Loam', 'Sandy Loam'),
    and enforces a 60% confidence threshold.
    """
    try:
        contents = await photo.read()
        result = predict_soil_image(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Soil image processing error: {str(e)}")
