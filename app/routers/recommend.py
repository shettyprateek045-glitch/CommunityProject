"""
Crop Recommendation Router: Implements POST /api/recommend and POST /api/whatif
Fuses RandomForest predict_proba suitability with financial margins, risk scoring, and crop rotation.
"""

from fastapi import APIRouter, HTTPException
from app.schemas import RecommendRequest, RecommendResponse
from app.services.decision_engine import compute_farmer_recommendations
from services.history import save_farmer_run

router = APIRouter(prefix="/api", tags=["Crop Recommendation"])

@router.post("/recommend", response_model=RecommendResponse)
async def api_recommend(req: RecommendRequest):
    """
    POST /api/recommend
    Synthesizes farmer parameters (N, P, K, pH, land, budget, irrigation, previous crop)
    with live weather and market data to yield top ranked crops and alternatives.
    """
    try:
        temp_c = req.temperature if req.temperature is not None else 26.5
        humidity = req.humidity if req.humidity is not None else 65.0
        rainfall = req.rainfall if req.rainfall is not None else 950.0

        results = compute_farmer_recommendations(
            land_acres=req.land_acres,
            soil_n=req.soil_n,
            soil_p=req.soil_p,
            soil_k=req.soil_k,
            soil_ph=req.soil_ph,
            soil_type=req.soil_type,
            irrigation=req.irrigation,
            budget_inr=req.budget_inr,
            previous_crop=req.previous_crop,
            temp_c=temp_c,
            humidity=humidity,
            rainfall_annual=rainfall,
            w_suit=req.w_suit or 0.40,
            w_profit=req.w_profit or 0.40,
            w_risk=req.w_risk or 0.20
        )

        # Save to SQLite history
        lon = req.lng if req.lng is not None else (req.lon if req.lon is not None else 75.0078)
        run_record = {
            "inputs": req.model_dump(),
            "location_name": req.location_name or "Farm Plot",
            "lat": req.lat,
            "lon": lon,
            "top_crops": results["top_crops"],
            "weather": {"temperature": temp_c, "humidity": humidity, "rainfall": rainfall}
        }
        run_id = save_farmer_run(run_record)
        results["run_id"] = run_id

        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation computation failed: {str(e)}")

@router.post("/whatif")
async def api_whatif(req: RecommendRequest):
    """
    POST /api/whatif
    Instant re-ranking when sliders (budget, land, irrigation) change live.
    """
    try:
        temp_c = req.temperature if req.temperature is not None else 26.5
        humidity = req.humidity if req.humidity is not None else 65.0
        rainfall = req.rainfall if req.rainfall is not None else 950.0

        results = compute_farmer_recommendations(
            land_acres=req.land_acres,
            soil_n=req.soil_n,
            soil_p=req.soil_p,
            soil_k=req.soil_k,
            soil_ph=req.soil_ph,
            soil_type=req.soil_type,
            irrigation=req.irrigation,
            budget_inr=req.budget_inr,
            previous_crop=req.previous_crop,
            temp_c=temp_c,
            humidity=humidity,
            rainfall_annual=rainfall,
            w_suit=req.w_suit or 0.40,
            w_profit=req.w_profit or 0.40,
            w_risk=req.w_risk or 0.20
        )
        return {
            "status": "success",
            "top_crops": results["top_crops"],
            "weather_fit_crops": results.get("weather_fit_crops", []),
            "alternative_crops": results.get("alternative_crops", []),
            "excluded_by_budget": results["excluded_by_budget"],
            "explainability": results["explainability"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"What-if simulation error: {str(e)}")
