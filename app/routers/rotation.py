"""
Rotation Router: Implements POST /api/rotation-check
Evaluates previous standing crop to adjust soil NPK and provide disease/fertility guidance.
"""

from fastapi import APIRouter, HTTPException
from app.schemas import RotationCheckRequest, RotationCheckResponse
from app.services.rotation_service import evaluate_crop_rotation

router = APIRouter(prefix="/api", tags=["Crop Rotation"])

@router.post("/rotation-check", response_model=RotationCheckResponse)
async def api_rotation_check(req: RotationCheckRequest):
    """
    POST /api/rotation-check
    Evaluates fertility impact of previous standing crop on current field.
    """
    try:
        n = req.soil_n if req.soil_n is not None else 85.0
        p = req.soil_p if req.soil_p is not None else 45.0
        k = req.soil_k if req.soil_k is not None else 42.0
        result = evaluate_crop_rotation(req.crop_name, current_n=n, current_p=p, current_k=k)
        return {
            "status": "success",
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rotation evaluation failed: {str(e)}")
