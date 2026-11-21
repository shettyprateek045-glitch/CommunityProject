"""
Soil Photo Router: Implements POST /api/photo/analyze-soil, /api/soil/analyze, and /api/soil-photo
Fine-tuned MobileNetV2 soil classifier with non-soil rejection and 60% confidence gate.
"""

from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Request
from app.services.soil_service import predict_soil_image
from app.services.soilgrids_service import fetch_soilgrids_estimate

router = APIRouter(prefix="/api", tags=["Soil Classification"])

@router.post("/photo/analyze-soil")
@router.post("/soil/analyze")
@router.post("/soil-photo")
async def api_analyze_soil(file: Optional[UploadFile] = None, photo: Optional[UploadFile] = None):
    """
    Accepts field soil imagery, enforces non-soil rejection gates,
    classifies into pedological classes, and returns detailed physical/chemical report.
    """
    target = file or photo
    if target is None:
        raise HTTPException(status_code=400, detail="No file uploaded. Please upload a soil image.")
    try:
        contents = await target.read()
        result = predict_soil_image(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Soil image processing error: {str(e)}")

@router.get("/soil/soilgrids")
async def api_get_soilgrids(lat: float = Query(...), lon: float = Query(...)):
    """
    GET /api/soil/soilgrids?lat=15.45&lon=75.00
    Pre-fills an initial physical/chemical soil estimate from ISRIC SoilGrids 2.0 API.
    """
    try:
        data = await fetch_soilgrids_estimate(lat, lon)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SoilGrids query failed: {str(e)}")

@router.post("/soil/soilgrids")
async def api_post_soilgrids(request: Request):
    """
    POST /api/soil/soilgrids {lat, lng/lon}
    """
    try:
        body = await request.json()
        lat = float(body.get("lat", 15.3173))
        lon = float(body.get("lon", body.get("lng", 75.7139)))
        data = await fetch_soilgrids_estimate(lat, lon)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SoilGrids query failed: {str(e)}")
