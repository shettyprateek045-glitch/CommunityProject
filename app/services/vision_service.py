"""
Vision Service: Multi-Layered Non-Crop Rejection & YOLO11m Inference Pipeline
Gates:
  Gate A: Basic validation (size, format, PIL decode, resize)
  Gate B: Vegetation check (HSV green-pixel ratio >= 8%)
  Gate C: CLIP zero-shot gate (crop vs screenshot/person/indoor/vehicle/building/bare soil)
  Gate D: YOLO11m classifier (top1 >= 0.50 and top1 - top2 >= 0.15)
  Gate E: Status 'ok' with crop identification and smart rotation recommendations
"""

import os
import io
import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, Tuple
from app.models.loaders import get_yolo_crop_model, get_clip_gate

CROP_ROTATION_RULES = {
    "rice": {
        "rotations": ["Chickpea", "Mungbean", "Blackgram", "Mustard"],
        "reason": "Rice depletes nitrogen and compacts soil; rotating with legumes restores soil nitrogen via Rhizobium nodules.",
        "rotations_kn": "ಕಡಲೆ, ಹೆಸರುಕಾಳು, ಉದ್ದು, ಸಾಸಿವೆ",
        "reason_kn": "ಭತ್ತವು ಸಾರಜನಕವನ್ನು ಹೀರುತ್ತದೆ; ದ್ವಿದಳ ಧಾನ್ಯಗಳನ್ನು ಬೆಳೆಸುವುದರಿಂದ ಮಣ್ಣಿನಲ್ಲಿ ನೈಸರ್ಗಿಕ ಸಾರಜನಕ ಸ್ಥಿರೀಕರಣವಾಗುತ್ತದೆ."
    },
    "wheat": {
        "rotations": ["Mungbean", "Soyabean", "Chickpea", "Sunflower"],
        "reason": "Wheat draws nutrients from shallow root zones; summer legumes replenish organic nitrogen.",
        "rotations_kn": "ಹೆಸರುಕಾಳು, ಸೋಯಾಬೀನ್, ಕಡಲೆ, ಸೂರ್ಯಕಾಂತಿ",
        "reason_kn": "ಗೋಧಿಯ ನಂತರ ದ್ವಿದಳ ಧಾನ್ಯಗಳನ್ನು ಬೆಳೆದರೆ ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಮತ್ತು ನೀರು ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳುವ ಸಾಮರ್ಥ್ಯ ಹೆಚ್ಚುತ್ತದೆ."
    },
    "maize": {
        "rotations": ["Pigeonpea", "Chickpea", "Soyabean", "Groundnut"],
        "reason": "Maize is a heavy feeder; rotating with deep-rooted legumes breaks nematode life cycles.",
        "rotations_kn": "ತೊಗರಿ, ಕಡಲೆ, ಸೋಯಾಬೀನ್, ನೆಲಗಡಲೆ",
        "reason_kn": "ಮೆಕ್ಕೆಜೋಳವು ಹೆಚ್ಚು ಪೋಷಕಾಂಶ ಬಳಸುತ್ತದೆ; ತೊಗರಿ ಅಥವಾ ಕಡಲೆ ಬೆಳೆಯುವುದರಿಂದ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಸುಧಾರಿಸುತ್ತದೆ."
    },
    "cotton": {
        "rotations": ["Chickpea", "Wheat", "Maize", "Sunflower"],
        "reason": "Cotton is susceptible to wilt fungi; rotating with cereals breaks pest spore accumulation.",
        "rotations_kn": "ಕಡಲೆ, ಗೋಧಿ, ಮೆಕ್ಕೆಜೋಳ, ಸೂರ್ಯಕಾಂತಿ",
        "reason_kn": "ಹತ್ತಿ ಬೆಳೆಗೆ ಬರುವ ರೋಗಗಳು ಮತ್ತು ಕೀಟಗಳ ಚಕ್ರವನ್ನು ಮುರಿಯಲು ಧಾನ್ಯ ಬೆಳೆಗಳನ್ನು ಸರದಿ ಮಾಡಿ."
    },
    "sugarcane": {
        "rotations": ["Mungbean", "Chickpea", "Soyabean"],
        "reason": "Sugarcane depletes organic carbon over multi-year ratoons; pulse green-manuring revitalizes soil.",
        "rotations_kn": "ಹೆಸರುಕಾಳು, ಕಡಲೆ, ಸೋಯಾಬೀನ್",
        "reason_kn": "ಕಬ್ಬು ಕಟಾವಿನ ನಂತರ ದ್ವಿದಳ ಬೆಳೆಗಳನ್ನು ಹಸಿರೆಲೆ ಗೊಬ್ಬರವಾಗಿ ಬಳಸುವುದು ಶ್ರೇಷ್ಠ."
    },
    "tomato": {
        "rotations": ["Maize", "Mungbean", "Wheat"],
        "reason": "Tomato (Solanaceae) is prone to bacterial wilt; never follow with chilli or potato. Rotate with cereals.",
        "rotations_kn": "ಮೆಕ್ಕೆಜೋಳ, ಹೆಸರುಕಾಳು, ಗೋಧಿ",
        "reason_kn": "ಟೊಮೆಟೊ ನಂತರ ಮೆಣಸಿನಕಾಯಿ ಅಥವಾ ಆಲೂಗಡ್ಡೆ ಬೆಳೆಯಬೇಡಿ. ಧಾನ್ಯ ಬೆಳೆಗಳನ್ನು ಬೆಳೆಯಿರಿ."
    },
    "default": {
        "rotations": ["Chickpea", "Mungbean", "Wheat", "Maize"],
        "reason": "Balanced cereal-legume crop rotation replenishes soil macro-nutrients and manages soil pathogens.",
        "rotations_kn": "ಕಡಲೆ, ಹೆಸರುಕಾಳು, ಗೋಧಿ, ಮೆಕ್ಕೆಜೋಳ",
        "reason_kn": "ದ್ವಿದಳ ಮತ್ತು ಏಕದಳ ಬೆಳೆಗಳ ಸಮತೋಲಿತ ಸರದಿಯು ಮಣ್ಣಿನ ಫಲವತ್ತತೆಯನ್ನು ಕಾಪಾಡುತ್ತದೆ."
    }
}

CLIP_LABELS = [
    "a photo of crop plants in a farm field",       # Target positive class
    "a screenshot of a mobile phone or computer",   # Distractor 1
    "a photo of a person or selfie",                # Distractor 2
    "a photo of an indoor room or furniture",       # Distractor 3
    "a photo of a vehicle, car, or truck",          # Distractor 4
    "a photo of a building, house, or road",        # Distractor 5
    "a photo of dry bare soil without plants"       # Distractor 6
]

def check_green_pixel_ratio(image_pil: Image.Image) -> float:
    """Computes HSV green-pixel vegetation ratio."""
    np_img = np.array(image_pil)
    if np_img.ndim == 2:
        return 0.0
    if np_img.shape[2] == 4:
        np_img = cv2.cvtColor(np_img, cv2.COLOR_RGBA2RGB)

    hsv = cv2.cvtColor(np_img, cv2.COLOR_RGB2HSV)
    # Agricultural green hue spectrum in OpenCV: H in [25, 90], S in [35, 255], V in [35, 255]
    green_mask = (
        (hsv[:, :, 0] >= 25) & (hsv[:, :, 0] <= 90) &
        (hsv[:, :, 1] >= 35) &
        (hsv[:, :, 2] >= 35)
    )
    total_pixels = float(hsv.shape[0] * hsv.shape[1])
    green_pixels = float(np.sum(green_mask))
    return green_pixels / max(1.0, total_pixels)

def evaluate_clip_zero_shot(image_pil: Image.Image) -> Tuple[bool, str, float]:
    """
    Evaluates CLIP zero-shot classification.
    Returns: (is_crop_winner, top_prediction, confidence)
    """
    clip_model, clip_processor = get_clip_gate()
    if clip_model is None or clip_processor is None:
        # Fallback to green ratio heuristic if CLIP is uninitialized
        return True, "clip_heuristic_pass", 0.85

    try:
        import torch
        inputs = clip_processor(
            text=CLIP_LABELS,
            images=image_pil,
            return_tensors="pt",
            padding=True
        )
        with torch.no_grad():
            outputs = clip_model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1)[0].cpu().numpy()

        top_idx = int(np.argmax(probs))
        top_prob = float(probs[top_idx])
        is_crop = (top_idx == 0)
        return is_crop, CLIP_LABELS[top_idx], top_prob
    except Exception as e:
        print(f"[VISION NOTE] CLIP inference skipped: {e}")
        return True, "clip_exception_pass", 0.80

def process_crop_photo(file_bytes: bytes, filename: str = "field.jpg") -> Dict[str, Any]:
    """
    Executes layered validation gates:
    Gate A: Basic validation & decode
    Gate B: HSV green ratio >= 8%
    Gate C: CLIP zero-shot classification
    Gate D: YOLO11m crop classification & margin check
    Gate E: Ok status with rotation advice
    """
    # -------------------------------------------------------------
    # Gate A: Basic Validation
    # -------------------------------------------------------------
    if not file_bytes or len(file_bytes) == 0:
        return {
            "status": "not_crop",
            "gate_failed": "Gate A: Empty File",
            "reason": "Uploaded image file is empty.",
            "is_confident": False
        }

    if len(file_bytes) > 16 * 1024 * 1024:
        return {
            "status": "not_crop",
            "gate_failed": "Gate A: File Size",
            "reason": "Image size exceeds 16 MB limit.",
            "is_confident": False
        }

    try:
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    except Exception:
        return {
            "status": "not_crop",
            "gate_failed": "Gate A: Format Decode",
            "reason": "Invalid or corrupted image format. Please upload JPG or PNG.",
            "is_confident": False
        }

    # -------------------------------------------------------------
    # Gate B: Vegetation Check (HSV green-pixel ratio)
    # -------------------------------------------------------------
    green_ratio = check_green_pixel_ratio(image)
    if green_ratio < 0.08:
        return {
            "status": "not_crop",
            "gate_failed": "Gate B: Vegetation Ratio",
            "reason": f"No plant foliage or vegetation detected (green foliage coverage is {green_ratio*100:.1f}%, below 8% threshold).",
            "green_pixel_ratio": round(green_ratio, 3),
            "is_confident": False
        }

    # -------------------------------------------------------------
    # Gate C: CLIP Zero-Shot Classification Gate
    # -------------------------------------------------------------
    is_crop, clip_pred, clip_conf = evaluate_clip_zero_shot(image)
    if not is_crop:
        return {
            "status": "not_crop",
            "gate_failed": "Gate C: CLIP Zero-Shot",
            "reason": f"Image classified as '{clip_pred}' rather than standing crop plants.",
            "clip_prediction": clip_pred,
            "green_pixel_ratio": round(green_ratio, 3),
            "is_confident": False
        }

    # -------------------------------------------------------------
    # Gate D: YOLO11m Crop Classifier with Margin Check
    # -------------------------------------------------------------
    yolo_model = get_yolo_crop_model()
    if yolo_model is None:
        return {
            "status": "uncertain",
            "gate_failed": "Gate D: Model Unavailable",
            "reason": "YOLO11m crop classifier is not loaded on this server.",
            "is_confident": False
        }

    # Run YOLO11m inference
    try:
        results = yolo_model.predict(image, imgsz=224, verbose=False)[0]
        probs = results.probs
        top1_idx = int(probs.top1)
        top1_conf = float(probs.top1conf)
        top1_name = results.names[top1_idx]

        top5_indices = probs.top5
        top2_conf = float(probs.data[top5_indices[1]]) if len(top5_indices) > 1 else 0.0
        margin = top1_conf - top2_conf

        top_3_guesses = [
            {"class": results.names[int(idx)], "confidence": round(float(probs.data[idx]) * 100, 1)}
            for idx in top5_indices[:3]
        ]

        # Uncertainty threshold check: top1 >= 0.50 and margin >= 0.15
        if top1_conf < 0.50 or margin < 0.15:
            return {
                "status": "uncertain",
                "gate_failed": "Gate D: Confidence Margin",
                "reason": f"Ambiguous foliage features (Top candidate confidence: {top1_conf*100:.1f}%, margin: {margin*100:.1f}%).",
                "confidence": round(top1_conf * 100, 1),
                "is_confident": False,
                "top_3_guesses": top_3_guesses,
                "green_pixel_ratio": round(green_ratio, 3)
            }

        # -------------------------------------------------------------
        # Gate E: All Gates Passed -> Return Identified Crop & Rotation
        # -------------------------------------------------------------
        rot_info = CROP_ROTATION_RULES.get(top1_name.lower(), CROP_ROTATION_RULES["default"])

        return {
            "status": "ok",
            "crop_name": top1_name,
            "kannada_name": rot_info.get("rotations_kn", top1_name),
            "confidence": round(top1_conf * 100, 1),
            "is_confident": True,
            "top_3_guesses": top_3_guesses,
            "rotation_recommendations": {
                "standing_crop": top1_name,
                "rotation_crops": rot_info["rotations"],
                "agronomic_reason": rot_info["reason"],
                "rotation_crops_kn": rot_info.get("rotations_kn"),
                "reason_kn": rot_info.get("reason_kn")
            },
            "green_pixel_ratio": round(green_ratio, 3)
        }
    except Exception as e:
        return {
            "status": "uncertain",
            "gate_failed": "Gate D: Inference Error",
            "reason": f"Crop model prediction error: {str(e)}",
            "is_confident": False
        }
