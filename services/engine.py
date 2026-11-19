"""
AI Decision & Recommendation Engine.
Calculates crop suitability, yield, cultivation cost, market revenue,
net profit, risk scores, final composite rankings, fertilizer deficiency advice,
season calendars, and explainability factors.
"""

import os
import joblib
import pandas as pd
import numpy as np
from services.prices import get_market_prices

MODEL_PKL = "models/crop_suit.pkl"
ECONOMICS_CSV = "data/crop_economics.csv"

_SUITABILITY_BUNDLE = None

# Name mapping between Scikit-learn recommendation crops and YOLO11m classes
CROP_YOLO_NAME_MAP = {
    "rice": "rice",
    "maize": "maize",
    "chickpea": "gram",
    "kidneybeans": None,
    "pigeonpeas": None,
    "mothbeans": None,
    "mungbean": "vigna-radiati(Mung)",
    "blackgram": None,
    "lentil": None,
    "pomegranate": None,
    "banana": "banana",
    "mango": None,
    "grapes": None,
    "watermelon": None,
    "muskmelon": None,
    "apple": None,
    "orange": "Lemon",
    "papaya": "papaya",
    "coconut": "coconut",
    "cotton": "cotton",
    "jute": "jute",
    "coffee": "Coffee-plant",
    "wheat": "wheat",
    "sugarcane": "sugarcane",
    "sunflower": "sunflower",
    "tobacco": "Tobacco-plant",
    "tomato": "tomato"
}

def load_suitability_model():
    """Loads crop suitability model bundle once."""
    global _SUITABILITY_BUNDLE
    if _SUITABILITY_BUNDLE is not None:
        return _SUITABILITY_BUNDLE

    if not os.path.exists(MODEL_PKL):
        # Fallback to train on the fly if needed
        import train_crop_model
        print("[ENGINE] models/crop_suit.pkl not found. Training model now...")
        train_crop_model.train_model()

    _SUITABILITY_BUNDLE = joblib.load(MODEL_PKL)
    print(f"[ENGINE] Loaded crop suitability model (Accuracy: {_SUITABILITY_BUNDLE.get('test_accuracy', 0)*100:.1f}%)")
    return _SUITABILITY_BUNDLE

def load_economics_table():
    if not os.path.exists(ECONOMICS_CSV):
        raise FileNotFoundError(f"Economics table not found: {ECONOMICS_CSV}")
    df = pd.read_csv(ECONOMICS_CSV)
    df["crop"] = df["crop"].str.strip().str.lower()
    return df

# -----------------------------------------------------------------------------
# Decision Support Computation
# -----------------------------------------------------------------------------
def compute_farmer_recommendations(
    land_acres=2.0,
    soil_n=80.0,
    soil_p=40.0,
    soil_k=40.0,
    soil_ph=6.5,
    soil_type="Clay Loam",
    irrigation="drip",
    budget_inr=60000.0,
    temp_c=26.5,
    humidity=68.0,
    rainfall_annual=950.0,
    w_suit=0.40,
    w_profit=0.40,
    w_risk=0.20,
    alerts=None
):
    """
    Main decision engine:
    1. Evaluates suitability % using RandomForest predict_proba.
    2. Calculates economics (yield, costs, market revenue, profit) for farmer's land size.
    3. Excludes crops that exceed the farmer's budget.
    4. Computes multi-factor risk score (rainfall mismatch, price volatility, irrigation adequacy).
    5. Ranks top crops by weighted combination.
    6. Generates fertilizer advice, calendar timelines, and why-this-crop explanations.
    """
    bundle = load_suitability_model()
    model = bundle["model"]
    features = bundle["features"]
    feature_importances = bundle.get("feature_importances", {})
    profiles = bundle.get("profiles", {})

    eco_df = load_economics_table()
    prices_dict = get_market_prices()

    # 1. Feature Vector for Suitability Classifier
    input_df = pd.DataFrame([[
        float(soil_n),
        float(soil_p),
        float(soil_k),
        float(temp_c),
        float(humidity),
        float(soil_ph),
        float(rainfall_annual)
    ]], columns=features)

    proba = model.predict_proba(input_df)[0]
    classes = list(model.classes_)
    suitability_map = {cls: float(p) for cls, p in zip(classes, proba)}

    # Irrigation efficiency score (0.0 to 1.0)
    irr_map = {
        "none": 0.1,
        "rainfed": 0.25,
        "canal": 0.70,
        "borewell": 0.85,
        "drip": 0.98
    }
    irr_score = irr_map.get(str(irrigation).lower().strip(), 0.5)

    all_candidates = []

    for _, eco in eco_df.iterrows():
        crop_id = eco["crop"]
        display_name = eco["display_name"]
        kannada_name = eco["kannada_name"]

        # Base Suitability Score
        suit_score = suitability_map.get(crop_id, 0.05)
        # Even crops not in Kaggle dataset get an agronomic heuristic score
        if crop_id not in suitability_map:
            # Heuristic suitability based on NPK and pH match
            n_diff = abs(eco["ideal_n"] - soil_n) / 100.0
            ph_diff = abs(eco["ideal_ph"] - soil_ph) / 2.0
            suit_score = max(0.15, 0.85 - (n_diff * 0.4 + ph_diff * 0.4))

        # Economics
        yield_per_acre = float(eco["yield_per_acre_qtl"])
        cost_per_acre = float(eco["cost_per_acre_inr"])
        water_need_mm = float(eco["water_need_mm"])
        water_level = eco["water_need_level"]

        total_yield_qtl = round(yield_per_acre * land_acres, 1)
        total_cost_inr = round(cost_per_acre * land_acres, 0)

        # Market Price lookup
        price_info = prices_dict.get(crop_id, {
            "modal_price": 2500.0,
            "min_price": 2200.0,
            "max_price": 2800.0,
            "volatility_std": 200.0,
            "trend_12m": [2400]*12,
            "source": "Sample Benchmark Data",
            "is_live": False
        })

        unit_price = price_info["modal_price"]
        total_revenue_inr = round(total_yield_qtl * unit_price, 0)
        net_profit_inr = round(total_revenue_inr - total_cost_inr, 0)

        # Budget Check: flag if cost exceeds farmer's budget
        exceeds_budget = total_cost_inr > float(budget_inr)

        # -------------------------------------------------------------
        # Risk Score Calculation (0.0 Low -> 1.0 High)
        # -------------------------------------------------------------
        # A. Rainfall variability risk (crop water requirement vs available rainfall)
        water_deficit_ratio = max(0.0, (water_need_mm - rainfall_annual) / max(1.0, water_need_mm))
        # If irrigation is good (drip/borewell), water deficit risk is mitigated
        irr_risk = water_deficit_ratio * (1.0 - irr_score)

        # B. Price volatility risk (normalized by modal price)
        price_vol_ratio = min(1.0, (price_info["volatility_std"] / max(100.0, unit_price)) * 2.5)

        # C. Weather alert risk penalty
        alert_penalty = 0.0
        if alerts:
            for alt in alerts:
                if alt.get("severity") == "high":
                    alert_penalty += 0.08
                elif alt.get("severity") == "medium":
                    alert_penalty += 0.04

        raw_risk = (irr_risk * 0.50) + (price_vol_ratio * 0.35) + (alert_penalty * 0.15)
        risk_score = round(float(np.clip(raw_risk, 0.08, 0.95)), 2)

        if risk_score <= 0.35:
            risk_badge = "Low"
            risk_color = "green"
        elif risk_score <= 0.65:
            risk_badge = "Medium"
            risk_color = "amber"
        else:
            risk_badge = "High"
            risk_color = "red"

        # -------------------------------------------------------------
        # Specific "Why This Crop" Reasons
        # -------------------------------------------------------------
        reasons = []
        if suit_score >= 0.40:
            reasons.append(f"High agronomic compatibility with your soil pH ({soil_ph:.1f}) and macro-nutrients.")
        else:
            reasons.append(f"Tolerant crop suitable for {eco['preferred_soil']} soil types.")

        if irrigation in ["drip", "borewell", "canal"] and water_level in ["High", "Medium"]:
            reasons.append(f"Your {irrigation} irrigation mitigates moisture risk and supports heavy vegetative growth.")
        elif water_level == "Low":
            reasons.append(f"Low water requirement ({water_need_mm:.0f} mm); highly resilient under current rainfall.")

        if net_profit_inr > 35000:
            reasons.append(f"Strong profit margin at current Mandi modal price (₹{unit_price:,.0f}/qtl).")
        else:
            reasons.append(f"Stable staple commodity with dependable local market off-take.")

        # -------------------------------------------------------------
        # Fertilizer Deficiency Advice (Structured & Actionable)
        # -------------------------------------------------------------
        fert_advice = []
        ideal_n, ideal_p, ideal_k = eco["ideal_n"], eco["ideal_p"], eco["ideal_k"]

        # Nitrogen (N)
        n_diff = ideal_n - soil_n
        if n_diff > 15:
            n_status = "deficient"
            n_tip = f"Nitrogen deficit: apply {round(n_diff * 2.17, 0)} kg Urea in 2-3 split doses."
        elif n_diff < -25:
            n_status = "excess"
            n_tip = "Nitrogen excess: avoid supplemental urea to prevent lodging."
        else:
            n_status = "optimal"
            n_tip = "Optimal nitrogen levels; maintain organic mulch and basal dosage."
        fert_advice.append({
            "nutrient": "Nitrogen (N)",
            "current": round(soil_n, 1),
            "ideal_min": round(ideal_n * 0.85, 1),
            "ideal_max": round(ideal_n * 1.15, 1),
            "status": n_status,
            "advice": n_tip
        })

        # Phosphorus (P)
        p_diff = ideal_p - soil_p
        if p_diff > 15:
            p_status = "deficient"
            p_tip = f"Phosphorus deficit: apply {round(p_diff * 6.25, 0)} kg Single Super Phosphate (SSP) at basal sowing."
        elif p_diff < -25:
            p_status = "excess"
            p_tip = "Phosphorus surplus: skip basal phosphate fertilizer this cycle."
        else:
            p_status = "optimal"
            p_tip = "Optimal root-zone phosphorus available for early establishment."
        fert_advice.append({
            "nutrient": "Phosphorus (P)",
            "current": round(soil_p, 1),
            "ideal_min": round(ideal_p * 0.85, 1),
            "ideal_max": round(ideal_p * 1.15, 1),
            "status": p_status,
            "advice": p_tip
        })

        # Potassium (K)
        k_diff = ideal_k - soil_k
        if k_diff > 15:
            k_status = "deficient"
            k_tip = f"Potassium deficit: top-dress {round(k_diff * 1.67, 0)} kg Muriate of Potash (MOP) during grain fill."
        elif k_diff < -25:
            k_status = "excess"
            k_tip = "High potassium reserves; no supplemental potash required."
        else:
            k_status = "optimal"
            k_tip = "Optimal potassium levels supporting drought and disease resistance."
        fert_advice.append({
            "nutrient": "Potassium (K)",
            "current": round(soil_k, 1),
            "ideal_min": round(ideal_k * 0.85, 1),
            "ideal_max": round(ideal_k * 1.15, 1),
            "status": k_status,
            "advice": k_tip
        })

        # -------------------------------------------------------------
        # Season Calendar Timeline
        # -------------------------------------------------------------
        dur = int(eco["duration_days"])
        calendar = [
            {"stage": "Sowing & Basal Nutrients", "days": f"Days 0 - {int(dur*0.15)}", "action": "Seed treatment, basal DAP/compost application"},
            {"stage": "Vegetative & Weeding", "days": f"Days {int(dur*0.15)} - {int(dur*0.45)}", "action": "First split Urea application, weed suppression"},
            {"stage": "Flowering & Fruit Set", "days": f"Days {int(dur*0.45)} - {int(dur*0.75)}", "action": "Critical irrigation window, pest monitoring"},
            {"stage": "Maturity & Harvest", "days": f"Days {int(dur*0.75)} - {dur}", "action": "Field drying, harvest and storage prep"}
        ]

        # Build structured 12-month historical price objects
        months_list = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        trend_raw = price_info["trend_12m"]
        trend_structured = [
            {"month": months_list[i % 12], "price": float(trend_raw[i]) if i < len(trend_raw) else float(unit_price)}
            for i in range(12)
        ]

        all_candidates.append({
            "crop": crop_id,
            "crop_key": crop_id,
            "name": display_name,
            "display_name": display_name,
            "kannada_name": kannada_name,
            "yolo_class": CROP_YOLO_NAME_MAP.get(crop_id),
            "suitability_pct": round(suit_score * 100, 1),
            "raw_suitability": suit_score,
            "yield_per_acre_qtl": yield_per_acre,
            "total_yield_qtl": total_yield_qtl,
            "cost_per_acre_inr": cost_per_acre,
            "total_cost_inr": total_cost_inr,
            "unit_price_inr": unit_price,
            "total_revenue_inr": total_revenue_inr,
            "net_profit_inr": net_profit_inr,
            "exceeds_budget": exceeds_budget,
            "risk_score": risk_score,
            "risk_badge": risk_badge,
            "risk_level": risk_badge,
            "risk_color": risk_color,
            "risk_factors": {
                "water_deficit_pct": round(water_deficit_ratio * 100, 1),
                "price_volatility_pct": round(price_vol_ratio * 100, 1),
                "weather_alert_penalty": round(alert_penalty * 100, 1)
            },
            "season": eco["season"],
            "duration_days": dur,
            "water_need_level": water_level,
            "water_need_mm": water_need_mm,
            "rotation_category": eco["rotation_category"],
            "reasons": reasons[:3],
            "fertilizer_advice": fert_advice,
            "calendar": calendar,
            "growth_calendar": calendar,
            "price_trend": trend_raw,
            "historical_prices": trend_structured,
            "price_source": price_info["source"]
        })

    # Filter out crops that exceed farmer budget
    affordable_candidates = [c for c in all_candidates if not c["exceeds_budget"]]
    # If budget is extremely small and filters out everything, keep all with budget warning
    working_pool = affordable_candidates if affordable_candidates else all_candidates

    # Compute Normalized Composite Score for Ranking
    max_profit = max([c["net_profit_inr"] for c in working_pool], default=1.0)
    min_profit = min([c["net_profit_inr"] for c in working_pool], default=0.0)
    profit_range = max(1.0, max_profit - min_profit)

    for c in working_pool:
        norm_profit = max(0.0, (c["net_profit_inr"] - min_profit) / profit_range)
        norm_suit = c["raw_suitability"]
        norm_safety = 1.0 - c["risk_score"]

        # Composite weighted formula
        composite_score = (
            float(w_suit) * norm_suit +
            float(w_profit) * norm_profit +
            float(w_risk) * norm_safety
        )
        c["composite_score"] = round(composite_score * 100, 2)

    # Sort descending by composite score
    working_pool.sort(key=lambda x: x["composite_score"], reverse=True)
    top_5 = working_pool[:5]

    # Explainability factors: top influential features
    explainability = sorted(
        [{"feature": k, "importance": round(v * 100, 1), "importance_pct": round(v * 100, 1)} for k, v in feature_importances.items()],
        key=lambda x: x["importance"],
        reverse=True
    )

    # Excluded crops detail
    excluded_crops = [
        {"crop": c["display_name"], "cost": c["total_cost_inr"], "budget": budget_inr}
        for c in all_candidates if c["exceeds_budget"]
    ]

    return {
        "top_crops": top_5,
        "all_candidates_count": len(working_pool),
        "total_evaluated": len(all_candidates),
        "excluded_by_budget": excluded_crops,
        "excluded_count": len(excluded_crops),
        "weights_used": {"suitability": w_suit, "profit": w_profit, "risk": w_risk},
        "explainability": explainability,
        "inputs_summary": {
            "land_acres": land_acres,
            "soil_n": soil_n,
            "soil_p": soil_p,
            "soil_k": soil_k,
            "soil_ph": soil_ph,
            "soil_type": soil_type,
            "irrigation": irrigation,
            "budget_inr": budget_inr,
            "temperature_c": temp_c,
            "humidity": humidity,
            "rainfall_annual_mm": rainfall_annual
        }
    }
