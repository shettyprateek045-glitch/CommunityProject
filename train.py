"""
Crop Classification Training Pipeline with YOLOv11m-cls.
Trains YOLOv11m classifier on agricultural crops dataset (crops_split).
"""
import os
import argparse
import torch
from ultralytics import YOLO

def train_classifier(data_dir="crops_split",
                     model_weights="yolo11m-cls.pt",
                     epochs=40,
                     imgsz=224,
                     batch=16,
                     device=None,
                     workers=4,
                     project="runs/classify",
                     name="train"):
    if not os.path.exists(data_dir):
        raise FileNotFoundError(f"Dataset split not found at: {data_dir}. Run split.py first.")
    
    if device is None:
        device = 0 if torch.cuda.is_available() else "cpu"
        
    print("=" * 70)
    print("Training YOLOv11m Crop Classifier")
    print(f"Data directory: {data_dir}")
    print(f"Base model:     {model_weights}")
    print(f"Epochs:         {epochs} | Imgsz: {imgsz} | Batch: {batch}")
    print(f"Device:         {device} | Destination: {project}/{name}")
    print("=" * 70)

    model = YOLO(model_weights)
    results = model.train(
        data=data_dir,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device=device,
        workers=workers,
        project=project,
        name=name,
        exist_ok=True,
    )
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train YOLOv11m Crop Classifier")
    parser.add_argument("--data", default="crops_split", help="Path to crops_split dataset")
    parser.add_argument("--weights", default="yolo11m-cls.pt", help="Pretrained classifier weights")
    parser.add_argument("--epochs", type=int, default=40, help="Number of epochs")
    parser.add_argument("--imgsz", type=int, default=224, help="Input image size")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    args = parser.parse_args()

    train_classifier(
        data_dir=args.data,
        model_weights=args.weights,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
    )
