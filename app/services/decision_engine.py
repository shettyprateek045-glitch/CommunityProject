"""
Decision Engine: Combines Scikit-Learn RandomForest Probabilities with Agronomic Economics
Calculates suitability %, financial projections, budget constraints, multi-factor risk,
NPK fertilizer balancing advice, growth calendars, weather-fit crops, and conditional alternatives.
"""

import os
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from app.models.loaders import get_crop_rf_model
from app.services.rotation_service import evaluate_crop_rotation

CROP_YOLO_NAME_MAP = {
    "rice": "rice",
    "maize": "maize",
    "chickpea": "gram",
    "kidneybeans": "vigna-radiati(Mung)",
    "pigeonpeas": "gram",
    "mothbeans": "gram",
    "mungbean": "vigna-radiati(Mung)",
    "blackgram": "vigna-radiati(Mung)",
    "lentil": "gram",
    "pomegranate": "Cherry",
    "banana": "banana",
    "mango": "Lemon",
    "grapes": "Cherry",
    "watermelon": "Cucumber",
    "muskmelon": "Cucumber",
    "apple": "Cherry",
    "orange": "Lemon",
    "papaya": "papaya",
    "coconut": "coconut",
    "cotton": "cotton",
    "jute": "jute",
    "coffee": "Coffee-plant",
    "wheat": "wheat",
    "sugarcane": "sugarcane",
    "sunflower": "sunflower",
    "soyabean": "soyabean",
    "tomato": "tomato",
    "chilli": "chilli"
}

def load_economics_and_prices():
    """Loads crop economics and prices datasets."""
    eco_df = pd.read_csv("data/crop_economics.csv")
    price_df = pd.read_csv("data/prices.csv")
    return eco_df, price_df

def compute_farmer_recommendations(
    land_acres: float = 3.0,
    soil_n: float = 85.0,
    soil_p: float = 45.0,
    soil_k: float = 42.0,
    soil_ph: float = 6.5,
    soil_type: str = "Clay Loam",
    irrigation: str = "drip",
    budget_inr: float = 65000.0,
    previous_crop: Optional[str] = None,
    temp_c: float = 26.5,
    humidity: float = 65.0,
    rainfall_annual: float = 950.0,
    w_suit: float = 0.40,
    w_profit: float = 0.40,
    w_risk: float = 0.20,
    alerts: list = None
) -> Dict[str, Any]:
    """
    Computes recommendations across 3 sections:
    A) Top 5 recommended crops overall
    B) Top 3 for current weather
    C) Top 3 alternatives with conditions and actions
    """
    # Evaluate previous standing crop impact if provided
    rotation_info = None
    effective_n, effective_p, effective_k = soil_n, soil_p, soil_k
    if previous_crop and previous_crop.strip():
        rotation_info = evaluate_crop_rotation(previous_crop.strip(), soil_n, soil_p, soil_k)
        effective_n = rotation_info["adjusted_npk"]["n"]
        effective_p = rotation_info["adjusted_npk"]["p"]
        effective_k = rotation_info["adjusted_npk"]["k"]

    rf_bundle = get_crop_rf_model()
    eco_df, price_df = load_economics_and_prices()

    # Model inference
    feature_cols = rf_bundle["feature_names"] if rf_bundle else ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    input_row = pd.DataFrame([{
        "N": effective_n,
        "P": effective_p,
        "K": effective_k,
        "temperature": temp_c,
        "humidity": humidity,
        "ph": soil_ph,
        "rainfall": min(300.0, max(20.0, rainfall_annual / 4.0))  # Seasonal rainfall estimate
    }])[feature_cols]

    suitability_map: Dict[str, float] = {}
    if rf_bundle and "model" in rf_bundle:
        rf_model = rf_bundle["model"]
        probs = rf_model.predict_proba(input_row)[0]
        classes = rf_bundle["classes"]
        for cls_name, prob in zip(classes, probs):
            suitability_map[cls_name.lower().strip()] = float(prob)

    # Irrigation efficiency score
    irr_scores = {"drip": 0.95, "borewell": 0.80, "canal": 0.70, "sprinkler": 0.85, "rainfed": 0.35, "none": 0.15}
    irr_efficiency = irr_scores.get(irrigation.lower(), 0.50)

    # Process all available crop profiles
    all_candidates = []
    price_lookup = {row["crop"]: row for _, row in price_df.iterrows()}

    for _, eco in eco_df.iterrows():
        crop_id = str(eco["crop"]).lower().strip()
        display_name = str(eco["display_name"])
        kannada_name = str(eco.get("kannada_name", display_name))

        # Suitability score from RF model or pedological heuristic
        suit_score = suitability_map.get(crop_id, 0.05)

        # Agronomic tolerance score (environmental distance)
        ideal_ph = float(eco.get("ideal_ph", 6.5))
        ph_diff = abs(soil_ph - ideal_ph)
        ph_fit = max(0.0, 1.0 - (ph_diff / 2.5))
        
        # NPK distance fit
        ideal_n, ideal_p, ideal_k = float(eco["ideal_n"]), float(eco["ideal_p"]), float(eco["ideal_k"])
        n_fit = max(0.0, 1.0 - abs(effective_n - ideal_n) / 120.0)
        p_fit = max(0.0, 1.0 - abs(effective_p - ideal_p) / 80.0)
        k_fit = max(0.0, 1.0 - abs(effective_k - ideal_k) / 80.0)
        agro_fit = (ph_fit * 0.40) + (n_fit * 0.20) + (p_fit * 0.20) + (k_fit * 0.20)

        # Max RF probability for relative scaling
        max_prob = max(suitability_map.values()) if suitability_map else 0.05
        rf_relative = suit_score / max(0.01, max_prob)

        # Combined suitability (0 to 1)
        final_suit_score = round(0.55 * rf_relative + 0.45 * agro_fit, 3)
        suitability_pct = round(final_suit_score * 100.0, 1)

        # Climate Mismatch Check
        is_climate_mismatch = False
        if crop_id == "apple" and temp_c > 25.0:
            is_climate_mismatch = True
        elif crop_id == "wheat" and temp_c > 33.0:
            is_climate_mismatch = True
        elif crop_id in ["cotton", "banana", "papaya"] and temp_c < 12.0:
            is_climate_mismatch = True
        elif crop_id in ["rice", "jute"] and (rainfall_annual < 400.0 and irrigation.lower() in ["none", "rainfed"]):
            is_climate_mismatch = True

        # Economic computations
        yield_per_acre = float(eco.get("yield_per_acre_qtl", eco.get("yield_qtl_per_acre", 15.0)))
        total_yield_qtl = round(yield_per_acre * land_acres, 1)

        cost_per_acre = float(eco.get("cost_per_acre_inr", 15000.0))
        total_cost_inr = round(cost_per_acre * land_acres, 0)

        # Market price lookup
        p_row = price_lookup.get(crop_id)
        if p_row is not None:
            unit_price = float(p_row["modal_price"])
            volatility_std = float(p_row.get("volatility_std", 250.0))
            trend_raw = [float(p_row[f"trend_m{i}"]) for i in range(1, 13)]
            price_source = "Agmarknet Mandi Feed"
        else:
            unit_price = 3200.0
            volatility_std = 300.0
            trend_raw = [3200.0] * 12
            price_source = "Regional Benchmark"

        total_revenue_inr = round(total_yield_qtl * unit_price, 0)
        net_profit_inr = round(total_revenue_inr - total_cost_inr, 0)

        # Budget check
        exceeds_budget = bool(total_cost_inr > float(budget_inr))

        # Water need vs irrigation constraint
        water_need_mm = float(eco["water_need_mm"])
        water_deficit_ratio = max(0.0, (water_need_mm - rainfall_annual) / max(1.0, water_need_mm))
        irr_risk = water_deficit_ratio * (1.0 - irr_efficiency)
        price_vol_ratio = min(1.0, (volatility_std / max(100.0, unit_price)) * 2.5)

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
            risk_color = "emerald"
        elif risk_score <= 0.65:
            risk_badge = "Medium"
            risk_color = "amber"
        else:
            risk_badge = "High"
            risk_color = "rose"

        # Why this crop reasons (exact numbers matching the card metrics)
        reasons = [
            f"Projected net profit of ₹{int(net_profit_inr):,} across {land_acres:.1f} acres (Revenue: ₹{int(total_revenue_inr):,} at Mandi modal price ₹{unit_price:,.0f}/qtl minus cultivation cost: ₹{int(total_cost_inr):,}).",
            f"Estimated total harvest of {total_yield_qtl:.1f} quintals ({yield_per_acre:.1f} qtl/acre) well-adapted to {eco['preferred_soil']} soil.",
            f"Agronomic suitability of {suitability_pct:.1f}% matching your soil pH ({soil_ph:.1f}), available NPK, and local weather."
        ]
        reasons_kn = [
            f"{land_acres:.1f} ಎಕರೆಗೆ ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ ₹{int(net_profit_inr):,} (ಆದಾಯ: ₹{int(total_revenue_inr):,} - ವೆಚ್ಚ: ₹{int(total_cost_inr):,}).",
            f"ಒಟ್ಟು ನಿರೀಕ್ಷಿತ ಇಳುವರಿ {total_yield_qtl:.1f} ಕ್ವಿಂಟಾಲ್ (ಮಾರುಕಟ್ಟೆ ಧಾರಣೆ ₹{unit_price:,.0f}/ಕ್ವಿಂಟಾಲ್).",
            f"ಮಣ್ಣಿನ pH ({soil_ph:.1f}) ಮತ್ತು ಪೋಷಕಾಂಶಗಳಿಗೆ {suitability_pct:.1f}% ಹೊಂದಾಣಿಕೆ."
        ]
        reasons_hi = [
            f"{land_acres:.1f} एकड़ के लिए अनुमानित शुद्ध लाभ ₹{int(net_profit_inr):,} (आय: ₹{int(total_revenue_inr):,} - लागत: ₹{int(total_cost_inr):,})।",
            f"कुल अनुमानित उपज {total_yield_qtl:.1f} क्विंटल (मंडी भाव ₹{unit_price:,.0f}/क्विंटल)।",
            f"मृदा pH ({soil_ph:.1f}) और पोषक तत्वों के साथ {suitability_pct:.1f}% उपयुक्तता स्कोर।"
        ]

        # Fertilizer Advice
        ideal_n, ideal_p, ideal_k = float(eco["ideal_n"]), float(eco["ideal_p"]), float(eco["ideal_k"])
        fert_advice = []

        # Nitrogen
        n_diff = ideal_n - effective_n
        if n_diff > 15:
            n_status = "deficient"
            n_tip = f"Nitrogen deficit: apply {round(n_diff * 2.17, 0)} kg Urea in 2-3 split doses."
        elif n_diff < -25:
            n_status = "excess"
            n_tip = "Nitrogen surplus: avoid supplemental urea to prevent lodging."
        else:
            n_status = "optimal"
            n_tip = "Optimal nitrogen levels; maintain organic mulch and basal dosage."
        fert_advice.append({
            "nutrient": "Nitrogen (N)",
            "current": round(effective_n, 1),
            "ideal_min": round(ideal_n * 0.85, 1),
            "ideal_max": round(ideal_n * 1.15, 1),
            "status": n_status,
            "advice": n_tip
        })

        # Phosphorus
        p_diff = ideal_p - effective_p
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
            "current": round(effective_p, 1),
            "ideal_min": round(ideal_p * 0.85, 1),
            "ideal_max": round(ideal_p * 1.15, 1),
            "status": p_status,
            "advice": p_tip
        })

        # Potassium
        k_diff = ideal_k - effective_k
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
            "current": round(effective_k, 1),
            "ideal_min": round(ideal_k * 0.85, 1),
            "ideal_max": round(ideal_k * 1.15, 1),
            "status": k_status,
            "advice": k_tip
        })

        # Calendar
        dur = int(eco["duration_days"])
        calendar = [
            {"stage": "Sowing & Basal Nutrients", "days": f"Days 0 - {int(dur*0.15)}", "action": "Seed treatment, basal DAP/compost application"},
            {"stage": "Vegetative & Weeding", "days": f"Days {int(dur*0.15)} - {int(dur*0.45)}", "action": "First split Urea application, weed suppression"},
            {"stage": "Flowering & Fruit Set", "days": f"Days {int(dur*0.45)} - {int(dur*0.75)}", "action": "Critical irrigation window, pest monitoring"},
            {"stage": "Maturity & Harvest", "days": f"Days {int(dur*0.75)} - {dur}", "action": "Field drying, harvest and storage prep"}
        ]

        months_list = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        historical_prices = [
            {"month": months_list[i % 12], "price": float(trend_raw[i]) if i < len(trend_raw) else float(unit_price)}
            for i in range(12)
        ]

        # Infeasible water constraint flag
        is_water_infeasible = bool(irrigation.lower() in ["none", "rainfed"] and water_need_mm >= 1100 and rainfall_annual < 800)

        all_candidates.append({
            "crop": crop_id,
            "crop_key": crop_id,
            "name": display_name,
            "display_name": display_name,
            "kannada_name": kannada_name,
            "suitability_pct": suitability_pct,
            "raw_suitability": final_suit_score,
            "climate_mismatch": is_climate_mismatch,
            "yield_per_acre_qtl": yield_per_acre,
            "total_yield_qtl": total_yield_qtl,
            "cost_per_acre_inr": cost_per_acre,
            "total_cost_inr": total_cost_inr,
            "unit_price_inr": unit_price,
            "total_revenue_inr": total_revenue_inr,
            "net_profit_inr": net_profit_inr,
            "exceeds_budget": exceeds_budget,
            "is_water_infeasible": is_water_infeasible,
            "risk_score": risk_score,
            "risk_badge": risk_badge,
            "risk_level": risk_badge,
            "risk_color": risk_color,
            "risk_factors": {
                "water_deficit_pct": round(water_deficit_ratio * 100, 1),
                "price_volatility_pct": round(price_vol_ratio * 100, 1),
                "weather_alert_penalty": round(alert_penalty * 100, 1)
            },
            "season": str(eco["season"]),
            "duration_days": dur,
            "water_need_level": str(eco["water_need_level"]),
            "water_need_mm": water_need_mm,
            "rotation_category": str(eco["rotation_category"]),
            "reasons": reasons,
            "reasons_kn": reasons_kn,
            "reasons_hi": reasons_hi,
            "fertilizer_advice": fert_advice,
            "calendar": calendar,
            "growth_calendar": calendar,
            "price_trend": trend_raw,
            "historical_prices": historical_prices,
            "price_source": price_source
        })

    # Ranking formula across all candidates
    max_profit = max([c["net_profit_inr"] for c in all_candidates], default=1.0)
    min_profit = min([c["net_profit_inr"] for c in all_candidates], default=0.0)
    profit_range = max(1.0, max_profit - min_profit)

    for c in all_candidates:
        norm_profit = max(0.0, (c["net_profit_inr"] - min_profit) / profit_range)
        norm_suit = c["raw_suitability"]
        norm_safety = 1.0 - c["risk_score"]

        composite = (
            float(w_suit) * norm_suit +
            float(w_profit) * norm_profit +
            float(w_risk) * norm_safety
        )
        c["composite_score"] = round(composite * 100, 2)

    # Strict Hard Filtering before ranking:
    # 1. Drop crops with suitability < 30%
    # 2. Drop crops exceeding farmer's budget (total_cost_inr > budget_inr)
    # 3. Drop crops with climate mismatch
    # 4. Drop crops with water/irrigation infeasibility
    viable_candidates = [
        c for c in all_candidates
        if not c["exceeds_budget"]
        and not c.get("is_water_infeasible", False)
        and not c.get("climate_mismatch", False)
        and c.get("suitability_pct", 0.0) >= 30.0
    ]
    working_pool = viable_candidates

    working_pool.sort(key=lambda x: x["composite_score"], reverse=True)
    top_5 = working_pool[:5]

    # Section B: Top 3 for Current Weather
    # Select crops that thrive in the current temperature and rainfall profile
    weather_sorted = sorted(
        all_candidates,
        key=lambda x: (
            1.0 - abs(x.get("water_need_mm", 600) - rainfall_annual) / 1500.0 +
            x.get("raw_suitability", 0.0)
        ),
        reverse=True
    )
    weather_fit_crops = weather_sorted[:3]

    # Section C: Top 3 Conditional Alternatives
    alternative_crops = []

    # Alternative 1: Drip upgrade if currently rainfed / flood
    if irrigation.lower() in ["none", "rainfed", "canal"]:
        alternative_crops.append({
            "crop": "banana_or_cotton",
            "display_name": "Commercial Cash Crops (Banana / Cotton)",
            "kannada_name": "ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು (ಬಾಳೆ / ಹತ್ತಿ)",
            "condition": "Upgrade to Micro-Drip Irrigation",
            "condition_kn": "ಹನಿ ನೀರಾವರಿ ಅಳವಡಿಕೆ",
            "action_required": "Install pressure-compensating drip system with PMKSY (50-70% government subsidy).",
            "action_required_kn": "ಪ್ರಧಾನ ಮಂತ್ರಿ ಕೃಷಿ ಸಿಂಚಾಯಿ ಯೋಜನೆಯಡಿ ಸಬ್ಸಿಡಿ ಪಡೆದು ಹನಿ ನೀರಾವರಿ ಅಳವಡಿಸಿ.",
            "potential_benefit": "Cuts water usage by 45%, avoids drought shock, and boosts net profit by +35% to ₹65,000+/acre.",
            "potential_benefit_kn": "ನೀರಿನ ಬಳಕೆಯನ್ನು 45% ಕಡಿಮೆ ಮಾಡಿ ಎಕರೆಗೆ ₹65,000 ಕ್ಕೂ ಹೆಚ್ಚು ನಿವ್ವಳ ಲಾಭ ಗಳಿಸಿ."
        })

    # Alternative 2: Budget expansion for highest profit excluded crop
    budget_excluded = [c for c in all_candidates if c["exceeds_budget"]]
    if budget_excluded:
        budget_excluded.sort(key=lambda x: x["net_profit_inr"], reverse=True)
        top_excluded = budget_excluded[0]
        deficit = int(top_excluded["total_cost_inr"] - budget_inr)
        alternative_crops.append({
            "crop": top_excluded["crop"],
            "display_name": top_excluded["display_name"],
            "kannada_name": top_excluded["kannada_name"],
            "condition": f"Expand Working Capital by ₹{deficit:,}",
            "condition_kn": f"ಬಂಡವಾಳವನ್ನು ₹{deficit:,} ರಷ್ಟು ಹೆಚ್ಚಿಸಿ",
            "action_required": f"Avail Kisan Credit Card (KCC) 7% interest subvention loan or Nabard credit line for {top_excluded['display_name']}.",
            "action_required_kn": f"ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (KCC) ಮೂಲಕ ಅಲ್ಪಾವಧಿ ಸಾಲ ಪಡೆದು {top_excluded['kannada_name']} ಬೆಳೆಯಿರಿ.",
            "potential_benefit": f"Unlocks high-value harvest projected at ₹{int(top_excluded['total_revenue_inr']):,} with ₹{int(top_excluded['net_profit_inr']):,} net profit.",
            "potential_benefit_kn": f"₹{int(top_excluded['net_profit_inr']):,} ನಿವ್ವಳ ಲಾಭ ಗಳಿಸುವ ಅವಕಾಶ."
        })

    # Alternative 3: Soil Nutrient Enrichment
    alternative_crops.append({
        "crop": "gram_or_maize",
        "display_name": "Gram / Maize Synergy",
        "kannada_name": "ಕಡಲೆ / ಮುಸುಕಿನ ಜೋಳ ಮಿಶ್ರ ಹೊಂದಾಣಿಕೆ",
        "condition": "Incorporate 5 Tonnes Farmyard Manure & Biofertilizers",
        "condition_kn": "5 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಮತ್ತು ಜೈವಿಕ ಗೊಬ್ಬರ ಸೇರ್ಪಡೆ",
        "action_required": "Pre-sowing soil amendment with FYM, Rhizobium (for pulses) or Azotobacter (for cereals).",
        "action_required_kn": "ಬಿತ್ತನೆಗೆ ಮುನ್ನ ತಿಪ್ಪೆ ಗೊಬ್ಬರ ಮತ್ತು ರೈಜೋಬಿಯಂ ಜೈವಿಕ ಗೊಬ್ಬರ ನೀಡಿ ಮಣ್ಣು ಹದಗೊಳಿಸಿ.",
        "potential_benefit": "Increases soil cation exchange capacity, reduces synthetic urea needs by 2 bags, and boosts yield by 15-20%.",
        "potential_benefit_kn": "ಇಳುವರಿ 15-20% ಹೆಚ್ಚುತ್ತದೆ ಮತ್ತು 2 ಚೀಲ ಯೂರಿಯಾ ಗೊಬ್ಬರದ ವೆಚ್ಚ ಉಳಿತಾಯವಾಗುತ್ತದೆ."
    })

    excluded_crops = [
        {"crop": c["display_name"], "cost": c["total_cost_inr"], "budget": budget_inr}
        for c in all_candidates if c["exceeds_budget"]
    ]

    importances = rf_bundle.get("feature_importances", {
        "rainfall": 0.22, "humidity": 0.22, "K": 0.18, "P": 0.15, "N": 0.10, "temperature": 0.08, "ph": 0.05
    }) if rf_bundle else {}

    explainability = sorted(
        [{"feature": k, "importance": round(v * 100, 1), "importance_pct": round(v * 100, 1)} for k, v in importances.items()],
        key=lambda x: x["importance"],
        reverse=True
    )

    return {
        "top_crops": top_5,
        "weather_fit_crops": weather_fit_crops,
        "alternative_crops": alternative_crops[:3],
        "all_candidates_count": len(working_pool),
        "total_evaluated": len(all_candidates),
        "excluded_by_budget": excluded_crops,
        "excluded_count": len(excluded_crops),
        "weights_used": {"suitability": w_suit, "profit": w_profit, "risk": w_risk},
        "explainability": explainability,
        "inputs_summary": {
            "land_acres": land_acres,
            "soil_n": effective_n,
            "soil_p": effective_p,
            "soil_k": effective_k,
            "soil_ph": soil_ph,
            "soil_type": soil_type,
            "irrigation": irrigation,
            "budget_inr": budget_inr,
            "previous_crop": previous_crop
        }
    }
