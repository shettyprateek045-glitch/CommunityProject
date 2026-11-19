"""
Crop Suitability Model Training Script
Trains a scikit-learn RandomForestClassifier on the Kaggle Crop Recommendation Dataset
(N, P, K, temperature, humidity, pH, rainfall -> crop).
Outputs: models/crop_rf.joblib and models/crop_suit.pkl with comprehensive metrics.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def train_crop_model():
    print("=" * 78)
    print("  TRAINING CROP SUITABILITY MODEL (RANDOM FOREST)")
    print("=" * 78)

    # Locate dataset
    dataset_paths = [
        "data/Crop_recommendation.csv",
        "Crop_recommendation.csv",
        "recommendation/Crop_recommendation.csv"
    ]
    csv_path = next((p for p in dataset_paths if os.path.exists(p)), None)
    if not csv_path:
        raise FileNotFoundError("Could not find Crop_recommendation.csv")

    print(f"[DATA] Loading dataset from '{csv_path}'...")
    df = pd.read_csv(csv_path)

    # Feature column normalization
    feature_cols = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    target_col = "label" if "label" in df.columns else "crop"

    X = df[feature_cols].copy()
    y = df[target_col].astype(str).str.lower().str.strip()

    print(f"[DATA] Dataset size: {len(df)} samples across {y.nunique()} crop classes.")
    print(f"[DATA] Features: {feature_cols}")

    # Stratified train/test split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[SPLIT] Training samples: {len(X_train)} | Test samples: {len(X_test)}")

    # Model definition: 250 estimators with calibrated leaf splits
    rf = RandomForestClassifier(
        n_estimators=250,
        max_depth=16,
        min_samples_split=3,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1
    )

    print("[TRAIN] Fitting RandomForestClassifier...")
    rf.fit(X_train, y_train)

    # Evaluation on unseen test partition
    y_pred = rf.predict(X_test)
    test_acc = accuracy_score(y_test, y_pred)
    print(f"\n[EVALUATION] Test Accuracy: {test_acc * 100:.2f}%")

    # Feature Importances
    importances = dict(zip(feature_cols, rf.feature_importances_))
    sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    print("\n[EXPLAINABILITY] Feature Importance Ranking:")
    for feat, imp in sorted_importances:
        print(f"  - {feat:12s}: {imp * 100:.2f}%")

    # Compute per-crop profiles for distance/explainability
    crop_profiles = {}
    for crop in y.unique():
        crop_data = X[y == crop]
        crop_profiles[crop] = {
            "means": crop_data.mean().to_dict(),
            "stds": crop_data.std().to_dict(),
            "mins": crop_data.min().to_dict(),
            "maxs": crop_data.max().to_dict()
        }

    # Prepare bundle
    model_bundle = {
        "model": rf,
        "feature_names": feature_cols,
        "classes": list(rf.classes_),
        "test_accuracy": float(test_acc),
        "feature_importances": {k: float(v) for k, v in importances.items()},
        "crop_profiles": crop_profiles,
        "report": classification_report(y_test, y_pred, output_dict=True)
    }

    os.makedirs("models", exist_ok=True)
    
    # Save primary artifact: models/crop_rf.joblib
    joblib_path = "models/crop_rf.joblib"
    joblib.dump(model_bundle, joblib_path)
    print(f"\n[SAVED] Exported model bundle to '{joblib_path}' ({os.path.getsize(joblib_path) / 1024:.1f} KB)")

    # Also save to models/crop_suit.pkl for compatibility
    pkl_path = "models/crop_suit.pkl"
    joblib.dump(model_bundle, pkl_path)
    print(f"[SAVED] Exported backup bundle to '{pkl_path}'")

    print("=" * 78)
    print("  TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 78)
    return test_acc

if __name__ == "__main__":
    train_crop_model()
