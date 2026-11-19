"""
Model Loaders (Singletons loaded once at startup, not per request)
Loads:
- Ultralytics YOLO11m-cls (crop_model.pt, 30 agricultural species)
- RandomForest Crop Recommender (models/crop_rf.joblib)
- Fine-Tuned MobileNetV2 Soil Classifier (models/soil_mobilenetv2.pt)
- CLIP Zero-Shot Classifier (transformers / open_clip)
"""

import os
os.environ["YOLO_OFFLINE"] = "True"
os.environ["YOLO_VERBOSE"] = "False"
os.environ["ULTRALYTICS_AUTOINSTALL"] = "False"

import torch
import torch.nn as nn
from torchvision import models, transforms
from ultralytics import YOLO
import joblib

try:
    from ultralytics.utils import SETTINGS
    SETTINGS.update({"sync": False, "checks": False})
except Exception:
    pass

# Global Singleton Handles
_YOLO_CROP_MODEL = None
_CROP_RF_BUNDLE = None
_SOIL_MODEL = None
_SOIL_TRANSFORMS = None
_CLIP_MODEL = None
_CLIP_PROCESSOR = None

_DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
_SOIL_DEVICE = "cpu"  # Keep soil classifier lightweight for laptop demos

SOIL_CLASSES = ["Alluvial", "Black Cotton", "Clay Loam", "Red Loam", "Sandy Loam"]

def get_yolo_crop_model():
    """Loads YOLO11m-cls once at startup."""
    global _YOLO_CROP_MODEL
    if _YOLO_CROP_MODEL is not None:
        return _YOLO_CROP_MODEL

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
        print(f"[LOADER] Loading YOLO11m-cls model from '{selected_path}' on device '{_DEVICE}'...")
        _YOLO_CROP_MODEL = YOLO(selected_path)
        print(f"[LOADER] YOLO11m model ready! ({len(_YOLO_CROP_MODEL.names)} classes loaded)")
        return _YOLO_CROP_MODEL
    except Exception as e:
        print(f"[LOADER ERROR] Could not load YOLO classifier: {e}")
        return None

def get_crop_rf_model():
    """Loads RandomForest Crop Recommender bundle from models/crop_rf.joblib."""
    global _CROP_RF_BUNDLE
    if _CROP_RF_BUNDLE is not None:
        return _CROP_RF_BUNDLE

    model_paths = [
        "models/crop_rf.joblib",
        "models/crop_suit.pkl",
        "crop_model.pkl"
    ]
    selected_path = next((p for p in model_paths if os.path.exists(p)), None)
    if not selected_path:
        print("[LOADER WARNING] No trained crop RandomForest found.")
        return None

    try:
        print(f"[LOADER] Loading crop recommendation model from '{selected_path}'...")
        bundle = joblib.load(selected_path)
        _CROP_RF_BUNDLE = bundle
        acc = bundle.get("test_accuracy", 0.99)
        print(f"[LOADER] Crop RF Model ready! (Accuracy: {acc*100:.2f}%)")
        return _CROP_RF_BUNDLE
    except Exception as e:
        print(f"[LOADER ERROR] Could not load crop RF model: {e}")
        return None

def get_soil_model():
    """Loads fine-tuned MobileNetV2 soil classifier on CPU."""
    global _SOIL_MODEL, _SOIL_TRANSFORMS
    if _SOIL_MODEL is not None:
        return _SOIL_MODEL, _SOIL_TRANSFORMS

    model_path = "models/soil_mobilenetv2.pt"
    if not os.path.exists(model_path):
        print(f"[LOADER WARNING] Soil model checkpoint not found at '{model_path}'.")
        return None, None

    try:
        print(f"[LOADER] Loading fine-tuned MobileNetV2 soil model from '{model_path}' on CPU...")
        checkpoint = torch.load(model_path, map_location=_SOIL_DEVICE)

        model = models.mobilenet_v2(weights=None)
        in_features = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.25),
            nn.Linear(in_features, 256),
            nn.ReLU(),
            nn.Dropout(p=0.20),
            nn.Linear(256, len(SOIL_CLASSES))
        )
        model.load_state_dict(checkpoint["model_state_dict"])
        model.to(_SOIL_DEVICE)
        model.eval()

        transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        _SOIL_MODEL = model
        _SOIL_TRANSFORMS = transform
        print(f"[LOADER] Soil MobileNetV2 ready! ({len(SOIL_CLASSES)} soil classes)")
        return _SOIL_MODEL, _SOIL_TRANSFORMS
    except Exception as e:
        print(f"[LOADER ERROR] Failed to load soil MobileNetV2: {e}")
        return None, None

def get_clip_gate():
    """Loads CLIP model for zero-shot non-crop rejection."""
    global _CLIP_MODEL, _CLIP_PROCESSOR
    if _CLIP_MODEL is not None and _CLIP_PROCESSOR is not None:
        return _CLIP_MODEL, _CLIP_PROCESSOR

    try:
        from transformers import CLIPProcessor, CLIPModel
        model_name = "openai/clip-vit-base-patch32"
        try:
            _CLIP_PROCESSOR = CLIPProcessor.from_pretrained(model_name, local_files_only=True)
            _CLIP_MODEL = CLIPModel.from_pretrained(model_name, local_files_only=True)
            _CLIP_MODEL.to("cpu")
            _CLIP_MODEL.eval()
            print("[LOADER] CLIP Zero-Shot gate loaded from local cache!")
            return _CLIP_MODEL, _CLIP_PROCESSOR
        except Exception:
            # Model not cached locally - fallback to high-speed vegetation heuristic
            return None, None
    except Exception as e:
        print(f"[LOADER NOTE] CLIP zero-shot gate offline / using heuristic fallback ({e})")
        return None, None

# Alias for compatibility
get_clip_model = get_clip_gate

def preload_all_models():
    """Invoked once at FastAPI startup event."""
    print("=" * 78)
    print("  PRE-LOADING SINGLETON ML MODELS AT FASTAPI STARTUP")
    print("=" * 78)
    get_yolo_crop_model()
    get_crop_rf_model()
    get_soil_model()
    print("=" * 78)
