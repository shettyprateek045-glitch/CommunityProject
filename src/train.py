"""
Multi-Domain Tech Forge - YOLOv11 Model Training Pipeline
Trains YOLOv11m on crop disease & condition dataset (data.yaml) with early stopping.
"""

import os
import shutil
import argparse
from ultralytics import YOLO

def train_model(data_path="data.yaml",
                model_weights="yolo11m.pt",
                epochs=50,
                imgsz=640,
                patience=10,
                batch_size=8,
                project_dir="runs/detect",
                run_name="train"):
    """
    Train YOLOv11 model with early stopping, saving artifacts to runs/detect/train/.
    """
    project_dir = os.path.abspath(project_dir)
    print("=" * 70)
    print("Multi-Domain Tech Forge: YOLOv11 Model Training")
    print(f"Data config:     {data_path}")
    print(f"Pretrained base: {model_weights}")
    print(f"Epochs:          {epochs}")
    print(f"Image size:      {imgsz}")
    print(f"Patience:        {patience} (Early stopping)")
    print(f"Batch size:      {batch_size}")
    print(f"Destination:     {project_dir}/{run_name}")
    print("=" * 70)

    # Initialize model
    model = YOLO(model_weights)

    # Train model
    results = model.train(
        data=data_path,
        epochs=epochs,
        imgsz=imgsz,
        patience=patience,
        batch=batch_size,
        workers=2,
        project=project_dir,
        name=run_name,
        exist_ok=True,
        plots=True,
        verbose=True,
        device="cpu"
    )

    train_dir = os.path.join(project_dir, run_name)
    weights_dir = os.path.join(train_dir, "weights")

    # Ensure best.pt and last.pt exist directly in runs/detect/train/ as well
    if os.path.exists(weights_dir):
        best_src = os.path.join(weights_dir, "best.pt")
        last_src = os.path.join(weights_dir, "last.pt")
        if os.path.exists(best_src):
            shutil.copy2(best_src, os.path.join(train_dir, "best.pt"))
            print(f"[+] Synced best.pt to {train_dir}/best.pt")
        if os.path.exists(last_src):
            shutil.copy2(last_src, os.path.join(train_dir, "last.pt"))
            print(f"[+] Synced last.pt to {train_dir}/last.pt")

    print("\n[+] Training completed successfully!")
    print(f"[+] Artifacts saved in: {train_dir}")
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train YOLOv11m for Crop Foliage & Disease Detection")
    parser.add_argument("--data", type=str, default="data.yaml", help="Path to data.yaml")
    parser.add_argument("--model", type=str, default="yolo11m.pt", help="Pretrained weights file")
    parser.add_argument("--epochs", type=int, default=50, help="Number of epochs (e.g. 50 or 30)")
    parser.add_argument("--imgsz", type=int, default=640, help="Image resolution")
    parser.add_argument("--patience", type=int, default=10, help="Early stopping patience")
    parser.add_argument("--batch", type=int, default=8, help="Batch size")
    args = parser.parse_args()

    train_model(
        data_path=args.data,
        model_weights=args.model,
        epochs=args.epochs,
        imgsz=args.imgsz,
        patience=args.patience,
        batch_size=args.batch
    )
