import os
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List

from app.models.loaders import get_soil_model, SOIL_CLASSES

router = APIRouter(prefix="/api", tags=["soil-inference"])

class Soil1Input(BaseModel):
    """Expected shape: list of 150 bands, each band is a 2‑D list of floats (H×W)."""
    cube: List[List[List[float]]] = Field(..., description="Hyperspectral cube (150, H, W)")

class Soil1Output(BaseModel):
    p: float
    k: float
    mg: float
    ph: float
    mae: float | None = None
    r2: float | None = None

class Soil2Output(BaseModel):
    soil_type: str
    confidence: float

@router.post("/soil1/predict", response_model=Soil1Output)
async def predict_soil1(data: Soil1Input):
    model, _ = get_soil_model()
    if model is None:
        raise HTTPException(status_code=503, detail="Soil model not available")
    # Convert the nested list to a torch tensor (batch of 150 bands, flatten spatial dims)
    import torch
    try:
        cube = torch.tensor(data.cube, dtype=torch.float32)
        # Shape (150, H, W) -> flatten spatial dimensions
        b, h, w = cube.shape
        cube = cube.view(b, -1).transpose(0, 1)  # (H*W, 150)
        with torch.no_grad():
            preds = model(cube).cpu().numpy().squeeze()
        # Expect four regression outputs
        if preds.shape[-1] != 4:
            raise ValueError("Model output size mismatch")
        p, k, mg, ph = preds.tolist()
        return Soil1Output(p=p, k=k, mg=mg, ph=ph)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/soil2/predict", response_model=Soil2Output)
async def predict_soil2(file: UploadFile = File(...)):
    model, transform = get_soil_model()
    if model is None or transform is None:
        raise HTTPException(status_code=503, detail="Soil model not available")
    import io
    from PIL import Image
    try:
        image_bytes = await file.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        input_tensor = transform(img).unsqueeze(0)
        with torch.no_grad():
            logits = model(input_tensor)
        probs = torch.softmax(logits, dim=1).cpu().numpy().squeeze()
        idx = int(probs.argmax())
        confidence = float(probs[idx])
        soil_type = SOIL_CLASSES[idx] if idx < len(SOIL_CLASSES) else "unknown"
        return Soil2Output(soil_type=soil_type, confidence=confidence)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
