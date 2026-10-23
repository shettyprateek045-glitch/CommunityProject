"""
Multi-Domain Tech Forge - Agronomic Crop & Disease Recommendation Engine
Maps detected crops and leaf pathology to actionable field management advice from crop_lookup.csv.
"""

import os
import argparse
import pandas as pd
from ultralytics import YOLO

def load_crop_lookup(csv_path="recommendation/crop_lookup.csv"):
    """
    Load the crop lookup CSV and return a dictionary keyed by normalized crop names.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Crop lookup file not found at: {csv_path}")

    df = pd.read_csv(csv_path)
    lookup = {}
    for _, row in df.iterrows():
        c_name = str(row["crop name"]).strip()
        norm_key = c_name.lower().replace("-", "_").replace(" ", "_")
        lookup[norm_key] = {
            "crop_name": c_name,
            "care_tips": str(row["care tips"]).strip(),
            "next_action": str(row["next action"]).strip()
        }
    return lookup

def get_recommendation(crop_or_disease_name, lookup_csv="recommendation/crop_lookup.csv"):
    """
    Given a detected crop or condition name, retrieve care tips and next actions.
    """
    lookup = load_crop_lookup(lookup_csv)
    query_key = str(crop_or_disease_name).strip().lower().replace("-", "_").replace(" ", "_")

    if query_key in lookup:
        return lookup[query_key]

    # Partial / substring matching fallback
    for k, v in lookup.items():
        if k in query_key or query_key in k:
            return v

    # Default fallback
    return {
        "crop_name": crop_or_disease_name,
        "care_tips": "Ensure optimal moisture, monitor soil pH, and maintain balanced N-P-K mineral levels.",
        "next_action": "Consult local agricultural extension officer and conduct periodic foliage scouting."
    }

def predict_and_recommend(image_path,
                          weights_path="runs/detect/train/best.pt",
                          lookup_csv="recommendation/crop_lookup.csv",
                          conf_threshold=0.25):
    """
    Perform detection on an image and provide automated recommendations for all detected conditions.
    """
    if not os.path.exists(weights_path):
        alt = os.path.join(os.path.dirname(weights_path), "weights", "best.pt")
        if os.path.exists(alt):
            weights_path = alt

    if not os.path.exists(weights_path):
        raise FileNotFoundError(f"Model weights not found at: {weights_path}")

    model = YOLO(weights_path)
    res = model.predict(source=image_path, conf=conf_threshold, verbose=False)[0]

    detections = []
    print("\n" + "=" * 70)
    print(f"DIAGNOSTIC REPORT FOR: {os.path.basename(image_path)}")
    print("=" * 70)

    if len(res.boxes) == 0:
        print("[!] No crop or disease conditions detected with sufficient confidence.")
        return detections

    detected_classes = set()
    for box in res.boxes:
        cls_id = int(box.cls[0].item())
        conf = float(box.conf[0].item())
        cls_name = model.names[cls_id]
        detected_classes.add((cls_name, conf))

    for cls_name, conf in detected_classes:
        advice = get_recommendation(cls_name, lookup_csv=lookup_csv)
        print(f"\n[+] Condition Detected: {cls_name} (Confidence: {conf*100:.1f}%)")
        print(f"    • Care Tips:   {advice['care_tips']}")
        print(f"    • Next Action: {advice['next_action']}")

        detections.append({
            "detected_condition": cls_name,
            "confidence": round(conf, 4),
            "care_tips": advice["care_tips"],
            "next_action": advice["next_action"]
        })

    print("=" * 70)
    return detections

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Agronomic Care & Decision Support Recommendation Engine")
    parser.add_argument("--crop", type=str, default=None, help="Name of crop or condition to query")
    parser.add_argument("--image", type=str, default=None, help="Path to image for end-to-end detection and recommendation")
    parser.add_argument("--weights", type=str, default="runs/detect/train/best.pt", help="Path to best.pt")
    parser.add_argument("--lookup", type=str, default="recommendation/crop_lookup.csv", help="Path to crop_lookup.csv")
    args = parser.parse_args()

    if args.crop:
        rec = get_recommendation(args.crop, lookup_csv=args.lookup)
        print(f"\nRecommendation for '{args.crop}':")
        print(f"  Care Tips:   {rec['care_tips']}")
        print(f"  Next Action: {rec['next_action']}")
    elif args.image:
        predict_and_recommend(args.image, weights_path=args.weights, lookup_csv=args.lookup)
    else:
        # Default demo query
        print("Demo: Querying recommendations for Early_blight, Late_blight, and Leaf:")
        for demo_name in ["Early_blight", "Late_blight", "Leaf"]:
            rec = get_recommendation(demo_name, lookup_csv=args.lookup)
            print(f"\n[{rec['crop_name']}]")
            print(f"  Care Tips:   {rec['care_tips']}")
            print(f"  Next Action: {rec['next_action']}")
