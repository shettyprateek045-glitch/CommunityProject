"""
Fertilizer Plan & Nutrient Gap Engine
Computes:
- Per-acre and whole-farm macro-nutrient deficits (Delta N, Delta P, Delta K)
- Commercial fertilizer conversion: DAP (18-46-0), Urea (46-0-0), MOP (0-0-60), and Farm Yard Manure (FYM)
- Step-by-step mathematical formulas behind each number
- User-editable pricing table
- Extreme pH detection & corrective soil amendment guidelines (Lime vs Gypsum)
"""

import math
from typing import Dict, Any, Optional

# Standard target NPK nutrient requirements (kg/acre) for Indian crops
CROP_NUTRIENT_TARGETS: Dict[str, Dict[str, float]] = {
    "rice": {"target_n": 40.0, "target_p": 20.0, "target_k": 20.0, "opt_ph_min": 5.5, "opt_ph_max": 7.0},
    "wheat": {"target_n": 50.0, "target_p": 25.0, "target_k": 18.0, "opt_ph_min": 6.0, "opt_ph_max": 7.5},
    "maize": {"target_n": 48.0, "target_p": 24.0, "target_k": 20.0, "opt_ph_min": 5.8, "opt_ph_max": 7.5},
    "cotton": {"target_n": 45.0, "target_p": 20.0, "target_k": 25.0, "opt_ph_min": 6.0, "opt_ph_max": 8.0},
    "sugarcane": {"target_n": 100.0, "target_p": 45.0, "target_k": 50.0, "opt_ph_min": 6.5, "opt_ph_max": 8.0},
    "chickpea": {"target_n": 10.0, "target_p": 25.0, "target_k": 15.0, "opt_ph_min": 6.0, "opt_ph_max": 7.8},
    "soyabean": {"target_n": 12.0, "target_p": 30.0, "target_k": 20.0, "opt_ph_min": 6.0, "opt_ph_max": 7.2},
    "tomato": {"target_n": 60.0, "target_p": 35.0, "target_k": 40.0, "opt_ph_min": 6.0, "opt_ph_max": 7.0},
    "banana": {"target_n": 80.0, "target_p": 30.0, "target_k": 90.0, "opt_ph_min": 6.0, "opt_ph_max": 7.5},
    "default": {"target_n": 40.0, "target_p": 20.0, "target_k": 20.0, "opt_ph_min": 6.0, "opt_ph_max": 7.5}
}

DEFAULT_FERT_PRICES = {
    "urea_50kg_bag": 268.0,      # Standard subsidized Urea 45/50kg
    "dap_50kg_bag": 1350.0,      # Di-ammonium Phosphate 50kg
    "mop_50kg_bag": 1700.0,      # Muriate of Potash 50kg
    "fym_per_ton": 1200.0        # Well-decomposed cow dung / FYM
}

def calculate_fertilizer_plan(
    crop: str,
    soil_n: float,
    soil_p: float,
    soil_k: float,
    soil_ph: float,
    land_acres: float = 1.0,
    prices: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Computes precise commercial fertilizer dosages based on the standard ICAR / KAU formula:
    1. Phosphorus supplied first through DAP (which also carries 18% N).
    2. Remaining Nitrogen deficit supplied through Urea (46% N).
    3. Potassium deficit supplied through MOP (60% K2O).
    """
    crop_clean = str(crop).lower().strip()
    target = CROP_NUTRIENT_TARGETS.get(crop_clean, CROP_NUTRIENT_TARGETS["default"])

    price_tbl = DEFAULT_FERT_PRICES.copy()
    if prices:
        for k, v in prices.items():
            if k in price_tbl and v > 0:
                price_tbl[k] = float(v)

    acres = max(0.1, float(land_acres))

    # Convert available soil test values (kg/ha) to estimated available root-zone nutrients per acre (factor ~ 0.40)
    # Soil Health Card values in kg/ha: 1 hectare = 2.471 acres.
    avail_n_per_acre = (soil_n / 2.471) * 0.50  # 50% seasonal availability factor
    avail_p_per_acre = (soil_p / 2.471) * 0.40  # 40% availability factor
    avail_k_per_acre = (soil_k / 2.471) * 0.60  # 60% availability factor

    # Nutrient Gaps per acre (kg/acre)
    gap_n_per_acre = max(0.0, target["target_n"] - avail_n_per_acre)
    gap_p_per_acre = max(0.0, target["target_p"] - avail_p_per_acre)
    gap_k_per_acre = max(0.0, target["target_k"] - avail_k_per_acre)

    # Whole farm gaps
    total_gap_n = gap_n_per_acre * acres
    total_gap_p = gap_p_per_acre * acres
    total_gap_k = gap_k_per_acre * acres

    # 1. DAP Calculation (18% N, 46% P2O5 per 50kg bag):
    # Each 50kg bag of DAP provides: 50 * 0.46 = 23.0 kg P2O5 and 50 * 0.18 = 9.0 kg N
    if gap_p_per_acre > 0:
        dap_kg_per_acre = gap_p_per_acre / 0.46
        dap_bags_per_acre = dap_kg_per_acre / 50.0
    else:
        dap_kg_per_acre = 0.0
        dap_bags_per_acre = 0.0

    total_dap_bags = math.ceil(dap_bags_per_acre * acres)
    n_from_dap_per_acre = (dap_bags_per_acre * 50.0) * 0.18

    # 2. Urea Calculation (46% N per 50kg bag):
    # Remaining N deficit after DAP
    remaining_n_per_acre = max(0.0, gap_n_per_acre - n_from_dap_per_acre)
    if remaining_n_per_acre > 0:
        urea_kg_per_acre = remaining_n_per_acre / 0.46
        urea_bags_per_acre = urea_kg_per_acre / 50.0
    else:
        urea_kg_per_acre = 0.0
        urea_bags_per_acre = 0.0

    total_urea_bags = math.ceil(urea_bags_per_acre * acres)

    # 3. MOP Calculation (60% K2O per 50kg bag):
    # Each 50kg bag of MOP provides: 50 * 0.60 = 30.0 kg K2O
    if gap_k_per_acre > 0:
        mop_kg_per_acre = gap_k_per_acre / 0.60
        mop_bags_per_acre = mop_kg_per_acre / 50.0
    else:
        mop_kg_per_acre = 0.0
        mop_bags_per_acre = 0.0

    total_mop_bags = math.ceil(mop_bags_per_acre * acres)

    # 4. Organic Basal Manure (FYM): 2 tons per acre recommended
    total_fym_tons = round(2.0 * acres, 1)

    # Cost calculations
    cost_urea = total_urea_bags * price_tbl["urea_50kg_bag"]
    cost_dap = total_dap_bags * price_tbl["dap_50kg_bag"]
    cost_mop = total_mop_bags * price_tbl["mop_50kg_bag"]
    cost_fym = total_fym_tons * price_tbl["fym_per_ton"]
    total_fertilizer_cost = cost_urea + cost_dap + cost_mop + cost_fym

    # Extreme pH checks & guidance
    ph_status = "Optimal"
    ph_guidance = "Soil pH is within the ideal nutrient absorption range (6.0 - 7.5)."
    ph_amendment = None

    if soil_ph < 5.5:
        ph_status = "Acidic (Extreme)"
        lime_needed_qtl = round(10.0 * acres, 1)
        ph_guidance = (
            f"⚠️ Soil is strongly acidic (pH {soil_ph:.1f}). Phosphorus and calcium fixation occurs. "
            f"Recommended amendment: Apply Agricultural Lime (CaCO3) at {lime_needed_qtl} quintals for your farm "
            f"(~10 qtl/acre) 3-4 weeks before sowing during primary ploughing."
        )
        ph_amendment = {
            "type": "Lime (CaCO3)",
            "quantity_qtl": lime_needed_qtl,
            "application": "Broadcast uniformly and incorporate into top 15cm soil 3 weeks before planting."
        }
    elif soil_ph > 8.2:
        ph_status = "Alkaline / Sodic (Extreme)"
        gypsum_needed_qtl = round(8.0 * acres, 1)
        ph_guidance = (
            f"⚠️ Soil is alkaline/calcareous (pH {soil_ph:.1f}). Micronutrient lockout (Zinc, Iron) is high. "
            f"Recommended amendment: Apply Agricultural Gypsum (CaSO4·2H2O) at {gypsum_needed_qtl} quintals for your farm "
            f"(~8 qtl/acre) followed by light irrigation to leach displaced sodium ions."
        )
        ph_amendment = {
            "type": "Agricultural Gypsum (CaSO4·2H2O)",
            "quantity_qtl": gypsum_needed_qtl,
            "application": "Broadcast and mix thoroughly, followed by heavy ponding/leaching if drainage permits."
        }

    comm_fert = {
        "total_cost_inr": total_fertilizer_cost,
        "urea_bags": total_urea_bags,
        "dap_bags": total_dap_bags,
        "mop_bags": total_mop_bags,
        "fym_tons": total_fym_tons,
        "urea_cost": cost_urea,
        "dap_cost": cost_dap,
        "mop_cost": cost_mop,
        "fym_cost": cost_fym
    }

    ph_alert_dict = {
        "warning": ph_status != "Optimal",
        "status": ph_status,
        "amendment_needed": ph_amendment["type"] if ph_amendment else "None required",
        "guidance": ph_guidance
    }

    return {
        "status": "success",
        "crop": crop,
        "acres": acres,
        "land_acres": acres,
        "soil_ph": soil_ph,
        "commercial_fertilizers": comm_fert,
        "nutrient_gap_kg_per_acre": {
            "n": round(gap_n_per_acre, 1),
            "p": round(gap_p_per_acre, 1),
            "k": round(gap_k_per_acre, 1)
        },
        "whole_farm_nutrient_gap_kg": {
            "n": round(total_gap_n, 1),
            "p": round(total_gap_p, 1),
            "k": round(total_gap_k, 1)
        },
        "ph_alert": ph_alert_dict,
        "soil_test": {
            "nitrogen_n": soil_n,
            "phosphorus_p": soil_p,
            "potassium_k": soil_k,
            "ph": soil_ph
        },
        "target_requirements_per_acre": target,
        "nutrient_gaps": {
            "per_acre_kg": {
                "n": round(gap_n_per_acre, 1),
                "p": round(gap_p_per_acre, 1),
                "k": round(gap_k_per_acre, 1)
            },
            "whole_farm_kg": {
                "n": round(total_gap_n, 1),
                "p": round(total_gap_p, 1),
                "k": round(total_gap_k, 1)
            }
        },
        "recommended_fertilizers": [
            {
                "fertilizer": "DAP (18-46-0)",
                "bags_50kg": total_dap_bags,
                "kg_total": total_dap_bags * 50,
                "price_per_bag": price_tbl["dap_50kg_bag"],
                "total_cost": cost_dap,
                "timing": "Basal application at sowing / planting time.",
                "formula_explanation": f"Supplies full P deficit ({total_gap_p:.1f} kg P) via {total_dap_bags} bags of DAP (46% P2O5). Also provides {n_from_dap_per_acre * acres:.1f} kg N."
            },
            {
                "fertilizer": "Urea (46-0-0)",
                "bags_50kg": total_urea_bags,
                "kg_total": total_urea_bags * 50,
                "price_per_bag": price_tbl["urea_50kg_bag"],
                "total_cost": cost_urea,
                "timing": "Split into 2-3 equal doses: 1/3 at 25-30 days, 1/3 at 50-60 days (flowering/tillering).",
                "formula_explanation": f"Supplies remaining N deficit ({remaining_n_per_acre * acres:.1f} kg N) after DAP via {total_urea_bags} bags of Urea (46% N)."
            },
            {
                "fertilizer": "MOP / Potash (0-0-60)",
                "bags_50kg": total_mop_bags,
                "kg_total": total_mop_bags * 50,
                "price_per_bag": price_tbl["mop_50kg_bag"],
                "total_cost": cost_mop,
                "timing": "50% basal and 50% top-dressed at flowering/fruit development.",
                "formula_explanation": f"Supplies K deficit ({total_gap_k:.1f} kg K) via {total_mop_bags} bags of MOP (60% K2O)."
            },
            {
                "fertilizer": "Farm Yard Manure (FYM / Compost)",
                "bags_50kg": 0,
                "tons_total": total_fym_tons,
                "price_per_unit": price_tbl["fym_per_ton"],
                "total_cost": cost_fym,
                "timing": "Apply 3-4 weeks before sowing during last ploughing.",
                "formula_explanation": f"Standard maintenance dosage of 2 tons/acre ({total_fym_tons} tons total) to enhance soil microbial activity."
            }
        ],
        "total_cost_inr": total_fertilizer_cost,
        "ph_evaluation": {
            "status": ph_status,
            "guidance": ph_guidance,
            "amendment": ph_amendment
        },
        "pricing_table_used": price_tbl,
        "disclaimer": "Dosages are calculated using standard State Agricultural University (SAU/ICAR) nutrient recommendation formulas. Consult your local Taluk Krishi Kendra or Agriculture Officer for field-level adjustments."
    }
