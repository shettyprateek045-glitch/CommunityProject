"""
Vision Service: Ultralytics YOLO11m-cls image classifier for crop identification.
Loaded once at startup using GPU if available, else CPU.
Handles confidence thresholding (<50% -> 'Not sure' with top 3 guesses)
and smart agronomic crop rotation recommendations.
"""

import os
import torch
from ultralytics import YOLO

# Global model handle
_CLASSIFIER_MODEL = None
_DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

CROP_ROTATION_RULES = {
    # Cereals & Grasses -> Rotate to Legumes to replenish soil Nitrogen
    "rice": {
        "rotations": ["chickpea", "mungbean", "blackgram", "mustard-oil"],
        "reason": "Rice depletes soil nitrogen and compacts subsoil; rotating with legumes (Chickpea/Mung) restores atmospheric nitrogen via Rhizobium nodules and breaks weed cycles."
    },
    "wheat": {
        "rotations": ["mungbean", "soyabean", "gram", "sunflower"],
        "reason": "Wheat takes heavy nutrients from upper root zones; summer legumes (Green Gram / Soybean) replenish organic nitrogen and improve water infiltration."
    },
    "maize": {
        "rotations": ["pigeonpeas", "chickpea", "soyabean", "groundnut"],
        "reason": "Maize is a heavy feeder of soil potassium and nitrogen; rotating with deep-rooted Pigeonpea or Soybean breaks root-knot nematode life cycles."
    },
    "jowar": {
        "rotations": ["gram", "mungbean", "cotton"],
        "reason": "Sorghum produces allelopathic residues; legumes like Chickpea thrive in the post-rainy residual moisture while balancing soil microbial flora."
    },
    "Pearl_millet(bajra)": {
        "rotations": ["mothbeans", "mungbean", "mustard-oil"],
        "reason": "Bajra is drought tolerant but draws deep minerals; following with short-duration drought-hardy Moth Bean or Mung Bean preserves dryland soil health."
    },
    # Legumes & Pulses -> Rotate to nutrient-demanding Cereals or Cash crops
    "gram": {
        "rotations": ["maize", "wheat", "cotton", "rice"],
        "reason": "Bengal Gram fixes 30-40 kg N/ha into the soil; cereals like Wheat or Maize directly benefit from this residual fertility without excess synthetic urea."
    },
    "vigna-radiati(Mung)": {
        "rotations": ["wheat", "mustard-oil", "maize"],
        "reason": "Green Gram leaves high green manure biomass; following with Wheat or Mustard delivers exceptional early vegetative vigor."
    },
    "soyabean": {
        "rotations": ["wheat", "chickpea", "jowar"],
        "reason": "Soybean fixes nitrogen and drops organic leaf mulch; Rabi Wheat following Soybean exhibits superior tillering."
    },
    # Cash Crops & Solanaceae -> Rotate to non-host crops to break pests
    "cotton": {
        "rotations": ["chickpea", "wheat", "maize", "sunflower"],
        "reason": "Cotton is susceptible to bollworm and wilt fungi; rotating with Chickpea or Wheat breaks pest spore accumulation in black cotton soils."
    },
    "tomato": {
        "rotations": ["maize", "mungbean", "wheat"],
        "reason": "Tomato (Solanaceae) is prone to bacterial wilt and nematodes; NEVER follow with other Solanaceae (Chilli/Potato). Rotate with non-host cereals or pulses."
    },
    "chilli": {
        "rotations": ["maize", "legumes", "marigold", "jowar"],
        "reason": "Chilli suffers from anthracnose and thrips; maize or pulse rotations disrupt insect pupation in the soil."
    },
    "sugarcane": {
        "rotations": ["mungbean", "chickpea", "soyabean"],
        "reason": "Sugarcane severely depletes soil organic carbon over multi-year ratoons; short-duration pulse green-manuring revitalizes root porosity."
    },
    "default": {
        "rotations": ["chickpea", "mungbean", "wheat", "maize"],
        "reason": "Balanced cereal-legume crop rotation replenishes soil macro-nutrients, manages soil pathogens, and optimizes moisture utilization."
    }
}

def load_vision_model():
    """Loads YOLO11m-cls once at startup."""
    global _CLASSIFIER_MODEL
    if _CLASSIFIER_MODEL is not None:
        return _CLASSIFIER_MODEL

    model_paths = [
        "models/crop_model.pt",
        "crop_model.pt",
        "weights/crop_model.pt",
        "weights/best.pt"
    ]
    selected_path = next((p for p in model_paths if os.path.exists(p)), None)
    if not selected_path:
        print("[VISION WARNING] No trained YOLO crop model found. Image classifier disabled.")
        return None

    try:
        print(f"[VISION] Loading YOLO11m-cls model from '{selected_path}' on device '{_DEVICE}'...")
        _CLASSIFIER_MODEL = YOLO(selected_path)
        print(f"[VISION] Model ready! ({len(_CLASSIFIER_MODEL.names)} classes loaded)")
        return _CLASSIFIER_MODEL
    except Exception as e:
        print(f"[VISION ERROR] Could not load YOLO classifier: {e}")
        return None

def predict_crop_image(image_path):
    """
    Inference on uploaded field image (imgsz=224).
    If confidence < 50%, returns 'Not sure' and top 3 guesses.
    Also generates agronomic rotation suggestions.
    """
    model = load_vision_model()
    if model is None:
        return {
            "status": "error",
            "message": "Vision classifier is not available on this server.",
            "top_crop": None,
            "confidence": 0.0
        }

    try:
        results = model.predict(image_path, imgsz=224, verbose=False, device=_DEVICE)[0]
        probs = results.probs
        top1_idx = int(probs.top1)
        top1_conf = float(probs.top1conf)
        top1_name = results.names[top1_idx]

        # Top 3 candidates
        top5_indices = probs.top5[:3]
        top3_candidates = []
        for idx in top5_indices:
            name = results.names[int(idx)]
            conf = float(probs.data[idx])
            top3_candidates.append({
                "crop": name,
                "confidence": round(conf * 100, 1)
            })

        is_confident = top1_conf >= 0.50
        status_label = "Identified" if is_confident else "Not sure"
        display_crop = top1_name if is_confident else "Uncertain Foliage"

        # Lookup rotation recommendations
        rot_info = CROP_ROTATION_RULES.get(top1_name, CROP_ROTATION_RULES["default"])

        return {
            "status": "success",
            "is_confident": is_confident,
            "status_label": status_label,
            "top_crop": top1_name,
            "detected_crop": top1_name,
            "display_crop": display_crop,
            "confidence": round(top1_conf * 100, 1),
            "top3_guesses": top3_candidates,
            "top_3_guesses": [{"class": g["crop"], "confidence": g["confidence"]} for g in top3_candidates],
            "rotation_advice": {
                "current_crop": top1_name,
                "recommended_rotations": rot_info["rotations"],
                "reason": rot_info["reason"]
            },
            "rotation_recommendations": {
                "standing_crop": top1_name,
                "rotation_crops": rot_info["rotations"],
                "agronomic_reason": rot_info["reason"]
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Image inference failed: {str(e)}",
            "top_crop": None,
            "confidence": 0.0
        }
