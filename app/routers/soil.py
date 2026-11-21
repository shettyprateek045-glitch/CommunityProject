"""
Soil Photo Router: Implements POST /api/soil-photo
Fine-tuned MobileNetV2 soil classifier with a 60% confidence gate.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Request
from app.schemas import SoilPhotoResponse
from app.services.soil_service import predict_soil_image
from app.services.soilgrids_service import fetch_soilgrids_estimate

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

@router.get("/soil/soilgrids")
async def api_get_soilgrids(lat: float = Query(...), lon: float = Query(...)):
    """
    GET /api/soil/soilgrids?lat=15.45&lon=75.00
    Pre-fills an initial physical/chemical soil estimate from ISRIC SoilGrids 2.0 API
    (pH, Sand %, Clay %, Organic Carbon), labeled as an estimate to be refined by SHC.
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
