"""
Multi-Domain Tech Forge - YOLOv11 Model Inference Pipeline
Runs trained best.pt model on test/ images and saves annotated prediction images to runs/detect/predict/.
"""

import os
import argparse
from ultralytics import YOLO

def run_predictions(weights_path="runs/detect/train/best.pt",
                    source_dir="test/images",
                    project_dir="runs/detect",
                    save_name="predict",
                    conf_threshold=0.25):
    """
    Run YOLOv11 predictions on test images and save visual detection boxes.
    """
    project_dir = os.path.abspath(project_dir)
    print("=" * 70)
    print("Multi-Domain Tech Forge: YOLOv11 Test Image Inference")
    print(f"Model weights:   {weights_path}")
    print(f"Source folder:   {source_dir}")
    print(f"Destination:     {project_dir}/{save_name}")
    print(f"Confidence:      {conf_threshold}")
    print("=" * 70)

    # Fallback to weights/best.pt if needed
    if not os.path.exists(weights_path):
        alt_path = os.path.join(os.path.dirname(weights_path), "weights", "best.pt")
        if os.path.exists(alt_path):
            weights_path = alt_path

    if not os.path.exists(weights_path):
        raise FileNotFoundError(f"Model weights not found at {weights_path}. Please train the model first.")

    model = YOLO(weights_path)

    # Run batched inference and save visual predictions
    results = model.predict(
        source=source_dir,
        conf=conf_threshold,
        project=project_dir,
        name=save_name,
        exist_ok=True,
        save=True,
        save_txt=True,
        save_conf=True
    )

    out_dir = os.path.join(project_dir, save_name)
    print(f"\n[+] Successfully saved {len(results)} annotated test images to {out_dir}")
    for res in results:
        img_name = os.path.basename(res.path)
        det_count = len(res.boxes)
        classes_found = [model.names[int(c)] for c in res.boxes.cls.tolist()]
        print(f"  - {img_name}: {det_count} detections -> {classes_found}")

    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run YOLOv11m predictions on test images")
    parser.add_argument("--weights", type=str, default="runs/detect/train/best.pt", help="Path to best.pt")
    parser.add_argument("--source", type=str, default="test/images", help="Path to test images folder")
    parser.add_argument("--conf", type=float, default=0.25, help="Confidence threshold")
    args = parser.parse_args()

    run_predictions(
        weights_path=args.weights,
        source_dir=args.source,
        conf_threshold=args.conf
    )
