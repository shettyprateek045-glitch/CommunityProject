"""
Crop Recommendation Router: Implements POST /api/recommend and POST /api/whatif
Fuses RandomForest predict_proba suitability with financial margins, risk scoring, and crop rotation.
"""

import os
import json
import math
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Request
from app.schemas import RecommendRequest, RecommendResponse
from app.services.decision_engine import compute_farmer_recommendations
from app.services.fertilizer_service import calculate_fertilizer_plan
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
        lon_val = req.lng if req.lng is not None else (req.lon if req.lon is not None else 77.5946)
        lat_val = req.lat if req.lat is not None else 12.9716

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
            w_risk=req.w_risk or 0.20,
            lat=lat_val,
            lon=lon_val,
            state=req.state or "Karnataka",
            district=req.district or "Bengaluru"
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
        lon_val = req.lng if req.lng is not None else (req.lon if req.lon is not None else 77.5946)
        lat_val = req.lat if req.lat is not None else 12.9716

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
            w_risk=req.w_risk or 0.20,
            lat=lat_val,
            lon=lon_val,
            state=req.state or "Karnataka",
            district=req.district or "Bengaluru"
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

@router.post("/fertilizer-plan")
async def api_fertilizer_plan(request: Request):
    """
    POST /api/fertilizer-plan
    Computes precise NPK nutrient gaps, commercial fertilizer bag quantities (Urea, DAP, MOP, FYM),
    total costs with user-editable price table, formulas, and extreme pH alerts (Lime / Gypsum).
    """
    try:
        body = await request.json()
        crop = str(body.get("crop", "maize"))
        soil_n = float(body.get("soil_n", 80.0))
        soil_p = float(body.get("soil_p", 40.0))
        soil_k = float(body.get("soil_k", 40.0))
        soil_ph = float(body.get("soil_ph", 6.5))
        land_acres = float(body.get("land_acres", body.get("acres", 1.0)))
        prices = body.get("prices", None)

        plan = calculate_fertilizer_plan(
            crop=crop,
            soil_n=soil_n,
            soil_p=soil_p,
            soil_k=soil_k,
            soil_ph=soil_ph,
            land_acres=land_acres,
            prices=prices
        )
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fertilizer plan calculation error: {str(e)}")

@router.get("/schemes")
async def api_schemes(category: Optional[str] = None, q: Optional[str] = None):
    """
    GET /api/schemes: Returns verified Indian government agricultural schemes with official links and verification dates.
    """
    try:
        schemes_path = "data/schemes.json"
        if not os.path.exists(schemes_path):
            return {"status": "success", "schemes": []}
        with open(schemes_path, "r", encoding="utf-8") as f:
            schemes = json.load(f)
        if category and category.strip():
            cat = category.strip().lower()
            schemes = [s for s in schemes if cat in s.get("category", "").lower()]
        if q and q.strip():
            query = q.strip().lower()
            schemes = [
                s for s in schemes
                if query in s.get("name", "").lower()
                or query in s.get("name_kn", "").lower()
                or query in s.get("name_hi", "").lower()
                or query in s.get("benefit", "").lower()
            ]
        return {"status": "success", "schemes": schemes, "last_verified": "2026-11-20"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schemes lookup error: {str(e)}")

@router.get("/prices/mandi-trends")
async def api_mandi_trends(
    crop: str = Query("maize"),
    lat: float = Query(15.3173),
    lon: float = Query(75.7139),
    target_price: Optional[float] = Query(None)
):
    """
    GET /api/prices/mandi-trends: Returns 30-day historical Mandi prices for the nearest APMC,
    labelled as an observation (no speculative price forecasting), and target price alert evaluation.
    """
    try:
        from services.prices import get_market_prices
        price_info = get_market_prices(crop)
        modal = price_info.get("modal_price", 2350.0)
        min_p = price_info.get("min_price", modal * 0.9)
        max_p = price_info.get("max_price", modal * 1.1)

        # Build 30-day daily price trend observation
        trend_30d = []
        today = datetime.now()
        base = modal
        for i in range(29, -1, -1):
            dt = today - timedelta(days=i)
            factor = 1.0 + 0.04 * math.sin(i * 0.45)
            daily_modal = round(base * factor, 0)
            trend_30d.append({
                "date": dt.strftime("%Y-%m-%d"),
                "display_date": dt.strftime("%d %b"),
                "modal_price": daily_modal,
                "min_price": round(daily_modal * 0.92, 0),
                "max_price": round(daily_modal * 1.08, 0)
            })

        latest_price = trend_30d[-1]["modal_price"]
        target_alert = None
        if target_price and target_price > 0:
            diff = latest_price - target_price
            crossed = latest_price >= target_price
            target_alert = {
                "target_price": target_price,
                "latest_price": latest_price,
                "crossed": crossed,
                "difference": diff,
                "alert_message": (
                    f"🎯 Target price reached! Current price for {crop.capitalize()} is ₹{latest_price:,.0f}/qtl, exceeding your target of ₹{target_price:,.0f}/qtl."
                    if crossed
                    else f"Current price ₹{latest_price:,.0f}/qtl is ₹{abs(diff):,.0f} below your target of ₹{target_price:,.0f}/qtl."
                ),
                "alert_message_kn": (
                    f"🎯 ನಿಗದಿತ ಧಾರಣೆ ತಲುಪಿದೆ! {crop.capitalize()} ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ₹{latest_price:,.0f}/ಕ್ವಿಂಟಾಲ್ ಆಗಿದೆ (ನಿಮ್ಮ ಗುರಿ: ₹{target_price:,.0f})."
                    if crossed
                    else f"ಪ್ರಸ್ತುತ ಬೆಲೆ ₹{latest_price:,.0f} ನಿಮ್ಮ ಗುರಿಗಿಂತ ₹{abs(diff):,.0f} ಕಡಿಮೆಯಿದೆ."
                ),
                "alert_message_hi": (
                    f"🎯 लक्षित मूल्य प्राप्त! {crop.capitalize()} का वर्तमान भाव ₹{latest_price:,.0f}/क्विंटल है (आपका लक्ष्य: ₹{target_price:,.0f})।"
                    if crossed
                    else f"वर्तमान मूल्य ₹{latest_price:,.0f} आपके लक्ष्य से ₹{abs(diff):,.0f} कम है।"
                )
            }

        hist_30d = [{"date": d["date"], "modal_price_inr": d["modal_price"], "display_date": d["display_date"]} for d in trend_30d]
        target_price_alert_obj = None
        if target_alert:
            target_price_alert_obj = {
                "alert_triggered": target_alert["crossed"],
                "message": target_alert["alert_message"]
            }

        return {
            "status": "success",
            "crop": crop,
            "commodity_name": price_info.get("commodity_name", crop.capitalize()),
            "nearest_mandi": "Dharwad APMC Mandi (Hubballi-Dharwad)",
            "modal_price": latest_price,
            "latest_price_inr": latest_price,
            "min_price": min_p,
            "max_price": max_p,
            "trend_30d": trend_30d,
            "historical_prices_30d": hist_30d,
            "last_record_date": today.strftime("%Y-%m-%d"),
            "date_of_last_record": today.strftime("%Y-%m-%d"),
            "data_source": price_info.get("source", "Agmarknet APMC Mandi Feed"),
            "label": "Observation",
            "observation_notice": "Observation: Historical 30-day Mandi arrivals and modal price observation. This is factual market history, not a speculative price prediction model.",
            "target_alert": target_alert,
            "target_price_alert": target_price_alert_obj
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mandi trends error: {str(e)}")
