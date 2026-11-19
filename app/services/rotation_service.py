"""
Crop Rotation Engine: Rule-Based Soil Fertility Impact & Pathogen Cycle Analysis
Evaluates previous standing crop, adjusts soil NPK levels, flags disease carryover risks,
and recommends optimal rotational crops.
"""

import json
import os
from typing import Dict, Any, List

RULES_FILE = "data/rotation_rules.json"
_CACHED_RULES = None

CROP_ALIASES = {
    "chickpea": "gram",
    "bengal gram": "gram",
    "kadale": "gram",
    "corn": "maize",
    "musukina jola": "maize",
    "paddy": "rice",
    "bhatta": "rice",
    "mung": "vigna-radiati(Mung)",
    "moong": "vigna-radiati(Mung)",
    "blackgram": "vigna-radiati(Mung)",
    "uddu": "vigna-radiati(Mung)",
    "hesaru": "vigna-radiati(Mung)",
    "soya": "soyabean",
    "soybean": "soyabean",
    "sorghum": "jowar",
    "jola": "jowar",
    "godi": "wheat",
    "kabbu": "sugarcane",
    "hatti": "cotton",
    "menasinakai": "chilli",
    "chili": "chilli",
    "tamata": "tomato",
    "suriyakanti": "sunflower"
}

def load_rotation_rules() -> Dict[str, Any]:
    global _CACHED_RULES
    if _CACHED_RULES is not None:
        return _CACHED_RULES

    if os.path.exists(RULES_FILE):
        try:
            with open(RULES_FILE, "r", encoding="utf-8") as f:
                _CACHED_RULES = json.load(f)
                return _CACHED_RULES
        except Exception as e:
            print(f"[ROTATION RULES] Error reading {RULES_FILE}: {e}")

    # Fallback minimal rules if file reading fails
    return {
        "rules": {},
        "default_rule": {
            "display_name": "General Field Crop",
            "family": "Mixed Agriculture",
            "fertility_impact": "Neutral",
            "fertility_impact_kn": "ತಟಸ್ಥ",
            "nitrogen_fixation": False,
            "biomass_addition": "Moderate organic matter contribution",
            "n_adjust": 0.0,
            "p_adjust": 0.0,
            "k_adjust": 0.0,
            "recommended_next_crops": [
                {"crop": "Gram", "reason": "Legumes restore soil nitrogen."},
                {"crop": "Maize", "reason": "Standard versatile cereal rotation."}
            ],
            "crops_to_avoid": [],
            "soil_health_tips": ["Add 4-5 tonnes organic manure per acre."],
            "soil_health_tips_kn": ["ಎಕರೆಗೆ 4-5 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಸೇರಿಸಿ."]
        }
    }

def get_normalized_crop_key(crop_name: str) -> str:
    cleaned = (crop_name or "").lower().strip()
    return CROP_ALIASES.get(cleaned, cleaned)

def evaluate_crop_rotation(
    crop_name: str,
    current_n: float = 85.0,
    current_p: float = 45.0,
    current_k: float = 42.0
) -> Dict[str, Any]:
    """
    Evaluates the fertility and pathogen impact of a previous crop.
    Returns adjusted N, P, K, recommendations, warnings, and agronomic tips.
    """
    rules_data = load_rotation_rules()
    rules = rules_data.get("rules", {})
    default_rule = rules_data.get("default_rule", {})

    key = get_normalized_crop_key(crop_name)
    rule = rules.get(key)

    if not rule:
        # Try substring match
        for r_key, r_val in rules.items():
            if r_key in key or key in r_key:
                rule = r_val
                key = r_key
                break

    if not rule:
        rule = default_rule

    n_adjust = float(rule.get("n_adjust", 0.0))
    p_adjust = float(rule.get("p_adjust", 0.0))
    k_adjust = float(rule.get("k_adjust", 0.0))

    adj_n = max(5.0, current_n + n_adjust)
    adj_p = max(5.0, current_p + p_adjust)
    adj_k = max(5.0, current_k + k_adjust)

    impact = rule.get("fertility_impact", "Neutral")
    impact_kn = rule.get("fertility_impact_kn", "ತಟಸ್ಥ")

    # Generate carryover warnings
    carryover_risks = []
    avoid = rule.get("crops_to_avoid", [])
    for av in avoid:
        carryover_risks.append(f"Avoid following with {av.get('crop')}: {av.get('reason')}")

    return {
        "standing_crop": crop_name,
        "matched_key": key,
        "display_name": rule.get("display_name", crop_name),
        "family": rule.get("family", "Unknown"),
        "fertility_impact": impact,
        "fertility_impact_kn": impact_kn,
        "nitrogen_fixation": bool(rule.get("nitrogen_fixation", False)),
        "biomass_addition": rule.get("biomass_addition", ""),
        "original_npk": {
            "n": round(current_n, 1),
            "p": round(current_p, 1),
            "k": round(current_k, 1)
        },
        "adjusted_npk": {
            "n": round(adj_n, 1),
            "p": round(adj_p, 1),
            "k": round(adj_k, 1)
        },
        "npk_changes": {
            "n_change": n_adjust,
            "p_change": p_adjust,
            "k_change": k_adjust
        },
        "recommended_next_crops": rule.get("recommended_next_crops", []),
        "crops_to_avoid": avoid,
        "carryover_risks": carryover_risks,
        "soil_health_tips": rule.get("soil_health_tips", []),
        "soil_health_tips_kn": rule.get("soil_health_tips_kn", [])
    }
