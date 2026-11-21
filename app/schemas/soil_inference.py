from pydantic import BaseModel, Field
from typing import List

class Soil1Input(BaseModel):
    """Hyperspectral cube input for Soil 1 model.
    Expected shape: list of 150 bands, each band is a 2‑D list of floats (H×W).
    """
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
