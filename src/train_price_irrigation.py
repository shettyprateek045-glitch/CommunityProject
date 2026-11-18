"""
Comprehensive Training & Evaluation Pipeline for:
  - price 1: Crop Yield Prediction (Regression)
  - price 2: Crop Market Price Prediction (Regression)
  - irri 1 (irr 1): Multi-Class Irrigation Need Assessment (Classification)
  - irri 2: Binary Smart Irrigation Decision (Classification)

Trains a deep PyTorch MLP Neural Network for 40 epochs on each dataset,
evaluates on an unseen test set (20%), and computes competitive ML benchmarks.
"""

import os
import sys
import json
import time
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    r2_score, mean_squared_error, mean_absolute_error,
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, ConfusionMatrixDisplay, classification_report
)
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier

# Set seeds
torch.manual_seed(42)
np.random.seed(42)
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -----------------------------------------------------------------------------
# PyTorch Architectures
# -----------------------------------------------------------------------------
class TabularRegressorNN(nn.Module):
    def __init__(self, in_features):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1)
        )

    def forward(self, x):
        return self.net(x).squeeze(-1)

class TabularClassifierNN(nn.Module):
    def __init__(self, in_features, num_classes):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, num_classes)
        )

    def forward(self, x):
        return self.net(x)

# -----------------------------------------------------------------------------
# 1. Dataset 1: price 1 (Crop Yield Prediction)
# -----------------------------------------------------------------------------
def train_price_1(epochs=40, batch_size=32, lr=0.005):
    print("\n" + "=" * 78)
    print("  TRAINING DATASET 1: price 1 (Crop Yield Prediction - Regression)")
    print("=" * 78)

    path = "price 1/Crop_Yield_Prediction.csv"
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")

    df = pd.read_csv(path).dropna()
    print(f"Loaded {len(df)} records from '{path}'")

    X = df.drop(columns=["Yield"])
    y = df["Yield"].values.astype(np.float32)

    num_cols = ["Nitrogen", "Phosphorus", "Potassium", "Temperature", "Humidity", "pH_Value", "Rainfall"]
    cat_cols = ["Crop"]

    preprocessor = ColumnTransformer(transformers=[
        ("num", StandardScaler(), num_cols),
        ("cat", OneHotEncoder(sparse_output=False, handle_unknown="ignore"), cat_cols)
    ])

    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    X_train = preprocessor.fit_transform(X_train_raw).astype(np.float32)
    X_test = preprocessor.transform(X_test_raw).astype(np.float32)

    # Scale target for stable neural net training
    y_scaler = StandardScaler()
    y_train_scaled = y_scaler.fit_transform(y_train.reshape(-1, 1)).flatten().astype(np.float32)
    y_test_scaled = y_scaler.transform(y_test.reshape(-1, 1)).flatten().astype(np.float32)

    train_ds = TensorDataset(torch.from_numpy(X_train), torch.from_numpy(y_train_scaled))
    test_ds = TensorDataset(torch.from_numpy(X_test), torch.from_numpy(y_test_scaled))

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)

    model = TabularRegressorNN(in_features=X_train.shape[1]).to(DEVICE)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    criterion = nn.SmoothL1Loss()
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    history = {"train_loss": [], "test_loss": []}
    print(f"\nTraining Deep PyTorch MLP on {DEVICE} for {epochs} Epochs...")

    for ep in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        for bx, by in train_loader:
            bx, by = bx.to(DEVICE), by.to(DEVICE)
            optimizer.zero_grad()
            pred = model(bx)
            loss = criterion(pred, by)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * len(by)
        train_loss /= len(train_ds)
        scheduler.step()

        # Validation loss
        model.eval()
        test_loss = 0.0
        with torch.no_grad():
            for bx, by in test_loader:
                bx, by = bx.to(DEVICE), by.to(DEVICE)
                pred = model(bx)
                test_loss += criterion(pred, by).item() * len(by)
        test_loss /= len(test_ds)

        history["train_loss"].append(train_loss)
        history["test_loss"].append(test_loss)

        if ep % 5 == 0 or ep == 1 or ep == epochs:
            print(f"  Epoch {ep:2d}/{epochs:2d} | Train Loss: {train_loss:.4f} | Test Loss: {test_loss:.4f}")

    # Evaluate on test set
    model.eval()
    with torch.no_grad():
        preds_scaled = model(torch.from_numpy(X_test).to(DEVICE)).cpu().numpy()
    preds = y_scaler.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()

    r2 = r2_score(y_test, preds)
    rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
    mae = float(mean_absolute_error(y_test, preds))

    # Also fit Random Forest baseline
    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    rf_r2 = r2_score(y_test, rf_preds)
    rf_rmse = float(np.sqrt(mean_squared_error(y_test, rf_preds)))
    rf_mae = float(mean_absolute_error(y_test, rf_preds))

    print(f"\n[EVALUATION RESULTS - price 1]")
    print(f"  PyTorch Neural Network (40 Epochs): R2 = {r2:.4f} | RMSE = {rmse:.2f} | MAE = {mae:.2f}")
    print(f"  Random Forest Regressor Benchmark:  R2 = {rf_r2:.4f} | RMSE = {rf_rmse:.2f} | MAE = {rf_mae:.2f}")

    # Save artifacts
    out_dir = "evaluation/price_1"
    weights_dir = "weights/price_1"
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(weights_dir, exist_ok=True)

    # Learning curve
    plt.figure(figsize=(8, 5))
    plt.plot(range(1, epochs + 1), history["train_loss"], label="Train Loss (Smooth L1)")
    plt.plot(range(1, epochs + 1), history["test_loss"], label="Test Loss (Smooth L1)")
    plt.title("price 1 - Crop Yield Prediction Learning Curve (40 Epochs)")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend()
    plt.tight_layout()
    plt.savefig(f"{out_dir}/learning_curve.png", dpi=150)
    plt.close()

    # Predictions CSV
    test_res_df = X_test_raw.copy()
    test_res_df["True_Yield"] = y_test
    test_res_df["Predicted_Yield_NN"] = preds
    test_res_df["Predicted_Yield_RF"] = rf_preds
    test_res_df.to_csv(f"{out_dir}/test_results.csv", index=False)

    # Metrics JSON
    metrics = {
        "dataset": "price 1 (Crop_Yield_Prediction.csv)",
        "task": "regression",
        "epochs": epochs,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "nn_metrics": {"R2": float(r2), "RMSE": float(rmse), "MAE": float(mae)},
        "rf_metrics": {"R2": float(rf_r2), "RMSE": float(rf_rmse), "MAE": float(rf_mae)}
    }
    with open(f"{out_dir}/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    # Save models
    torch.save(model.state_dict(), f"{weights_dir}/model.pt")
    joblib.dump({"preprocessor": preprocessor, "y_scaler": y_scaler, "rf": rf, "metrics": metrics},
                f"{weights_dir}/bundle.pkl")
    print(f"  Artifacts saved to '{out_dir}/' and '{weights_dir}/'")

    return metrics

# -----------------------------------------------------------------------------
# 2. Dataset 2: price 2 (Crop Price Prediction)
# -----------------------------------------------------------------------------
def train_price_2(epochs=40, batch_size=32, lr=0.005):
    print("\n" + "=" * 78)
    print("  TRAINING DATASET 2: price 2 (Crop Market Price Prediction - Regression)")
    print("=" * 78)

    path = "price 2/crop_price_dataset.csv"
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")

    df = pd.read_csv(path)
    df = df.dropna(subset=["avg_modal_price"])
    print(f"Loaded {len(df)} records from '{path}'")

    # Feature engineering from month
    df["date"] = pd.to_datetime(df["month"], errors="coerce")
    df["year"] = df["date"].dt.year.fillna(2024).astype(int)
    df["month_num"] = df["date"].dt.month.fillna(1).astype(int)

    feature_cols = ["commodity_name", "avg_min_price", "avg_max_price", "year", "month_num"]
    X = df[feature_cols].copy()
    y = df["avg_modal_price"].values.astype(np.float32)

    num_cols = ["avg_min_price", "avg_max_price", "year", "month_num"]
    cat_cols = ["commodity_name"]

    preprocessor = ColumnTransformer(transformers=[
        ("num", StandardScaler(), num_cols),
        ("cat", OneHotEncoder(sparse_output=False, handle_unknown="ignore"), cat_cols)
    ])

    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    X_train = preprocessor.fit_transform(X_train_raw).astype(np.float32)
    X_test = preprocessor.transform(X_test_raw).astype(np.float32)

    y_scaler = StandardScaler()
    y_train_scaled = y_scaler.fit_transform(y_train.reshape(-1, 1)).flatten().astype(np.float32)
    y_test_scaled = y_scaler.transform(y_test.reshape(-1, 1)).flatten().astype(np.float32)

    train_ds = TensorDataset(torch.from_numpy(X_train), torch.from_numpy(y_train_scaled))
    test_ds = TensorDataset(torch.from_numpy(X_test), torch.from_numpy(y_test_scaled))

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)

    model = TabularRegressorNN(in_features=X_train.shape[1]).to(DEVICE)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    criterion = nn.SmoothL1Loss()
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    history = {"train_loss": [], "test_loss": []}
    print(f"\nTraining Deep PyTorch MLP on {DEVICE} for {epochs} Epochs...")

    for ep in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        for bx, by in train_loader:
            bx, by = bx.to(DEVICE), by.to(DEVICE)
            optimizer.zero_grad()
            pred = model(bx)
            loss = criterion(pred, by)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * len(by)
        train_loss /= len(train_ds)
        scheduler.step()

        model.eval()
        test_loss = 0.0
        with torch.no_grad():
            for bx, by in test_loader:
                bx, by = bx.to(DEVICE), by.to(DEVICE)
                pred = model(bx)
                test_loss += criterion(pred, by).item() * len(by)
        test_loss /= len(test_ds)

        history["train_loss"].append(train_loss)
        history["test_loss"].append(test_loss)

        if ep % 5 == 0 or ep == 1 or ep == epochs:
            print(f"  Epoch {ep:2d}/{epochs:2d} | Train Loss: {train_loss:.4f} | Test Loss: {test_loss:.4f}")

    model.eval()
    with torch.no_grad():
        preds_scaled = model(torch.from_numpy(X_test).to(DEVICE)).cpu().numpy()
    preds = y_scaler.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()

    r2 = r2_score(y_test, preds)
    rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
    mae = float(mean_absolute_error(y_test, preds))

    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    rf_r2 = r2_score(y_test, rf_preds)
    rf_rmse = float(np.sqrt(mean_squared_error(y_test, rf_preds)))
    rf_mae = float(mean_absolute_error(y_test, rf_preds))

    print(f"\n[EVALUATION RESULTS - price 2]")
    print(f"  PyTorch Neural Network (40 Epochs): R2 = {r2:.4f} | RMSE = {rmse:.2f} | MAE = {mae:.2f}")
    print(f"  Random Forest Regressor Benchmark:  R2 = {rf_r2:.4f} | RMSE = {rf_rmse:.2f} | MAE = {rf_mae:.2f}")

    out_dir = "evaluation/price_2"
    weights_dir = "weights/price_2"
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(weights_dir, exist_ok=True)

    plt.figure(figsize=(8, 5))
    plt.plot(range(1, epochs + 1), history["train_loss"], label="Train Loss (Smooth L1)")
    plt.plot(range(1, epochs + 1), history["test_loss"], label="Test Loss (Smooth L1)")
    plt.title("price 2 - Crop Price Prediction Learning Curve (40 Epochs)")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend()
    plt.tight_layout()
    plt.savefig(f"{out_dir}/learning_curve.png", dpi=150)
    plt.close()

    test_res_df = X_test_raw.copy()
    test_res_df["True_Modal_Price"] = y_test
    test_res_df["Predicted_Modal_Price_NN"] = preds
    test_res_df["Predicted_Modal_Price_RF"] = rf_preds
    test_res_df.to_csv(f"{out_dir}/test_results.csv", index=False)

    metrics = {
        "dataset": "price 2 (crop_price_dataset.csv)",
        "task": "regression",
        "epochs": epochs,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "nn_metrics": {"R2": float(r2), "RMSE": float(rmse), "MAE": float(mae)},
        "rf_metrics": {"R2": float(rf_r2), "RMSE": float(rf_rmse), "MAE": float(rf_mae)}
    }
    with open(f"{out_dir}/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    torch.save(model.state_dict(), f"{weights_dir}/model.pt")
    joblib.dump({"preprocessor": preprocessor, "y_scaler": y_scaler, "rf": rf, "metrics": metrics},
                f"{weights_dir}/bundle.pkl")
    print(f"  Artifacts saved to '{out_dir}/' and '{weights_dir}/'")

    return metrics

# -----------------------------------------------------------------------------
# 3. Dataset 3: irri 1 / irr 1 (Multi-Class Irrigation Need Assessment)
# -----------------------------------------------------------------------------
def train_irri_1(epochs=40, batch_size=64, lr=0.005):
    print("\n" + "=" * 78)
    print("  TRAINING DATASET 3: irri 1 (Irrigation Need Classification - Multi-Class)")
    print("=" * 78)

    path = "irr 1/irrigation_prediction.csv"
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")

    df = pd.read_csv(path).dropna()
    print(f"Loaded {len(df)} records from '{path}'")

    X = df.drop(columns=["Irrigation_Need"])
    class_map = {"Low": 0, "Medium": 1, "High": 2}
    inv_class_map = {0: "Low", 1: "Medium", 2: "High"}
    y = df["Irrigation_Need"].map(class_map).values.astype(np.int64)

    num_cols = ["Soil_pH", "Soil_Moisture", "Organic_Carbon", "Electrical_Conductivity",
                "Temperature_C", "Humidity", "Rainfall_mm", "Sunlight_Hours", "Wind_Speed_kmh",
                "Field_Area_hectare", "Previous_Irrigation_mm"]
    cat_cols = ["Soil_Type", "Crop_Type", "Crop_Growth_Stage", "Season",
                "Irrigation_Type", "Water_Source", "Mulching_Used", "Region"]

    preprocessor = ColumnTransformer(transformers=[
        ("num", StandardScaler(), num_cols),
        ("cat", OneHotEncoder(sparse_output=False, handle_unknown="ignore"), cat_cols)
    ])

    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    X_train = preprocessor.fit_transform(X_train_raw).astype(np.float32)
    X_test = preprocessor.transform(X_test_raw).astype(np.float32)

    train_ds = TensorDataset(torch.from_numpy(X_train), torch.from_numpy(y_train))
    test_ds = TensorDataset(torch.from_numpy(X_test), torch.from_numpy(y_test))

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)

    model = TabularClassifierNN(in_features=X_train.shape[1], num_classes=3).to(DEVICE)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    criterion = nn.CrossEntropyLoss()
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    history = {"train_loss": [], "test_loss": [], "test_acc": []}
    print(f"\nTraining Deep PyTorch Classifier on {DEVICE} for {epochs} Epochs...")

    for ep in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        for bx, by in train_loader:
            bx, by = bx.to(DEVICE), by.to(DEVICE)
            optimizer.zero_grad()
            logits = model(bx)
            loss = criterion(logits, by)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * len(by)
        train_loss /= len(train_ds)
        scheduler.step()

        model.eval()
        test_loss = 0.0
        correct = 0
        with torch.no_grad():
            for bx, by in test_loader:
                bx, by = bx.to(DEVICE), by.to(DEVICE)
                logits = model(bx)
                test_loss += criterion(logits, by).item() * len(by)
                preds = logits.argmax(dim=-1)
                correct += (preds == by).sum().item()
        test_loss /= len(test_ds)
        test_acc = correct / len(test_ds)

        history["train_loss"].append(train_loss)
        history["test_loss"].append(test_loss)
        history["test_acc"].append(test_acc)

        if ep % 5 == 0 or ep == 1 or ep == epochs:
            print(f"  Epoch {ep:2d}/{epochs:2d} | Train Loss: {train_loss:.4f} | Test Loss: {test_loss:.4f} | Test Acc: {test_acc*100:.2f}%")

    model.eval()
    with torch.no_grad():
        test_logits = model(torch.from_numpy(X_test).to(DEVICE)).cpu()
        preds = test_logits.argmax(dim=-1).numpy()

    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds, average="weighted", zero_division=0)
    rec = recall_score(y_test, preds, average="weighted", zero_division=0)
    f1 = f1_score(y_test, preds, average="weighted", zero_division=0)

    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_preds)
    rf_f1 = f1_score(y_test, rf_preds, average="weighted", zero_division=0)

    print(f"\n[EVALUATION RESULTS - irri 1]")
    print(f"  PyTorch Neural Network (40 Epochs): Accuracy = {acc*100:.2f}% | F1-Score = {f1*100:.2f}%")
    print(f"  Random Forest Benchmark:            Accuracy = {rf_acc*100:.2f}% | F1-Score = {rf_f1*100:.2f}%")
    print("\nClassification Report (PyTorch NN):")
    print(classification_report(y_test, preds, target_names=["Low", "Medium", "High"], zero_division=0))

    out_dir = "evaluation/irri_1"
    weights_dir = "weights/irri_1"
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(weights_dir, exist_ok=True)

    # Plots
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    ax1.plot(range(1, epochs + 1), history["train_loss"], label="Train Loss")
    ax1.plot(range(1, epochs + 1), history["test_loss"], label="Test Loss")
    ax1.set_title("irri 1 - Loss Curves (40 Epochs)")
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("CrossEntropy Loss")
    ax1.legend()

    ax2.plot(range(1, epochs + 1), [a * 100 for a in history["test_acc"]], color="green", label="Test Accuracy (%)")
    ax2.set_title("irri 1 - Test Accuracy vs Epochs")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Accuracy (%)")
    ax2.legend()
    plt.tight_layout()
    plt.savefig(f"{out_dir}/learning_curve.png", dpi=150)
    plt.close()

    # Confusion Matrix
    cm = confusion_matrix(y_test, preds)
    fig, ax = plt.subplots(figsize=(6, 5))
    ConfusionMatrixDisplay(cm, display_labels=["Low", "Medium", "High"]).plot(ax=ax, cmap="Blues", colorbar=False)
    plt.title("irri 1 - Test Confusion Matrix (PyTorch NN)")
    plt.tight_layout()
    plt.savefig(f"{out_dir}/confusion_matrix.png", dpi=150)
    plt.close()

    metrics = {
        "dataset": "irr 1 (irrigation_prediction.csv)",
        "task": "multi_class_classification",
        "epochs": epochs,
        "classes": ["Low", "Medium", "High"],
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "nn_metrics": {
            "accuracy": float(acc),
            "precision_weighted": float(prec),
            "recall_weighted": float(rec),
            "f1_weighted": float(f1)
        },
        "rf_metrics": {
            "accuracy": float(rf_acc),
            "f1_weighted": float(rf_f1)
        }
    }
    with open(f"{out_dir}/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    torch.save(model.state_dict(), f"{weights_dir}/model.pt")
    joblib.dump({"preprocessor": preprocessor, "class_map": class_map, "rf": rf, "metrics": metrics},
                f"{weights_dir}/bundle.pkl")
    print(f"  Artifacts saved to '{out_dir}/' and '{weights_dir}/'")

    return metrics

# -----------------------------------------------------------------------------
# 4. Dataset 4: irri 2 (Binary Smart Irrigation Decision)
# -----------------------------------------------------------------------------
def train_irri_2(epochs=40, batch_size=16, lr=0.005):
    print("\n" + "=" * 78)
    print("  TRAINING DATASET 4: irri 2 (Binary Smart Irrigation Decision - Classification)")
    print("=" * 78)

    path = "irri 2/datasets - datasets.csv"
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")

    df = pd.read_csv(path).dropna()
    print(f"Loaded {len(df)} records from '{path}'")

    X = df.drop(columns=["Irrigation"])
    y = df["Irrigation"].values.astype(np.int64)

    num_cols = ["CropDays", "SoilMoisture", "temperature", "Humidity"]
    cat_cols = ["CropType"]

    preprocessor = ColumnTransformer(transformers=[
        ("num", StandardScaler(), num_cols),
        ("cat", OneHotEncoder(sparse_output=False, handle_unknown="ignore"), cat_cols)
    ])

    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    X_train = preprocessor.fit_transform(X_train_raw).astype(np.float32)
    X_test = preprocessor.transform(X_test_raw).astype(np.float32)

    train_ds = TensorDataset(torch.from_numpy(X_train), torch.from_numpy(y_train))
    test_ds = TensorDataset(torch.from_numpy(X_test), torch.from_numpy(y_test))

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)

    model = TabularClassifierNN(in_features=X_train.shape[1], num_classes=2).to(DEVICE)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    criterion = nn.CrossEntropyLoss()
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    history = {"train_loss": [], "test_loss": [], "test_acc": []}
    print(f"\nTraining Deep PyTorch Binary Classifier on {DEVICE} for {epochs} Epochs...")

    for ep in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        for bx, by in train_loader:
            bx, by = bx.to(DEVICE), by.to(DEVICE)
            optimizer.zero_grad()
            logits = model(bx)
            loss = criterion(logits, by)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * len(by)
        train_loss /= len(train_ds)
        scheduler.step()

        model.eval()
        test_loss = 0.0
        correct = 0
        with torch.no_grad():
            for bx, by in test_loader:
                bx, by = bx.to(DEVICE), by.to(DEVICE)
                logits = model(bx)
                test_loss += criterion(logits, by).item() * len(by)
                preds = logits.argmax(dim=-1)
                correct += (preds == by).sum().item()
        test_loss /= len(test_ds)
        test_acc = correct / len(test_ds)

        history["train_loss"].append(train_loss)
        history["test_loss"].append(test_loss)
        history["test_acc"].append(test_acc)

        if ep % 5 == 0 or ep == 1 or ep == epochs:
            print(f"  Epoch {ep:2d}/{epochs:2d} | Train Loss: {train_loss:.4f} | Test Loss: {test_loss:.4f} | Test Acc: {test_acc*100:.2f}%")

    model.eval()
    with torch.no_grad():
        test_logits = model(torch.from_numpy(X_test).to(DEVICE)).cpu()
        preds = test_logits.argmax(dim=-1).numpy()

    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds, zero_division=0)
    rec = recall_score(y_test, preds, zero_division=0)
    f1 = f1_score(y_test, preds, zero_division=0)

    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_preds)
    rf_f1 = f1_score(y_test, rf_preds, zero_division=0)

    print(f"\n[EVALUATION RESULTS - irri 2]")
    print(f"  PyTorch Neural Network (40 Epochs): Accuracy = {acc*100:.2f}% | F1-Score = {f1*100:.2f}%")
    print(f"  Random Forest Benchmark:            Accuracy = {rf_acc*100:.2f}% | F1-Score = {rf_f1*100:.2f}%")
    print("\nClassification Report (PyTorch NN):")
    print(classification_report(y_test, preds, target_names=["No Irrigation (0)", "Irrigate (1)"], zero_division=0))

    out_dir = "evaluation/irri_2"
    weights_dir = "weights/irri_2"
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(weights_dir, exist_ok=True)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    ax1.plot(range(1, epochs + 1), history["train_loss"], label="Train Loss")
    ax1.plot(range(1, epochs + 1), history["test_loss"], label="Test Loss")
    ax1.set_title("irri 2 - Loss Curves (40 Epochs)")
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("CrossEntropy Loss")
    ax1.legend()

    ax2.plot(range(1, epochs + 1), [a * 100 for a in history["test_acc"]], color="green", label="Test Accuracy (%)")
    ax2.set_title("irri 2 - Test Accuracy vs Epochs")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Accuracy (%)")
    ax2.legend()
    plt.tight_layout()
    plt.savefig(f"{out_dir}/learning_curve.png", dpi=150)
    plt.close()

    cm = confusion_matrix(y_test, preds)
    fig, ax = plt.subplots(figsize=(6, 5))
    ConfusionMatrixDisplay(cm, display_labels=["No Irrigation", "Irrigate"]).plot(ax=ax, cmap="Greens", colorbar=False)
    plt.title("irri 2 - Test Confusion Matrix (PyTorch NN)")
    plt.tight_layout()
    plt.savefig(f"{out_dir}/confusion_matrix.png", dpi=150)
    plt.close()

    metrics = {
        "dataset": "irri 2 (datasets - datasets.csv)",
        "task": "binary_classification",
        "epochs": epochs,
        "classes": ["No Irrigation (0)", "Irrigate (1)"],
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "nn_metrics": {
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1": float(f1)
        },
        "rf_metrics": {
            "accuracy": float(rf_acc),
            "f1": float(rf_f1)
        }
    }
    with open(f"{out_dir}/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    torch.save(model.state_dict(), f"{weights_dir}/model.pt")
    joblib.dump({"preprocessor": preprocessor, "rf": rf, "metrics": metrics},
                f"{weights_dir}/bundle.pkl")
    print(f"  Artifacts saved to '{out_dir}/' and '{weights_dir}/'")

    return metrics

# -----------------------------------------------------------------------------
# Main Orchestrator
# -----------------------------------------------------------------------------
def main():
    print("=" * 78)
    print("  MULTI-DATASET TRAINING & EVALUATION PIPELINE (40 EPOCHS)")
    print("  Datasets: price 1 | price 2 | irri 1 | irri 2")
    print("=" * 78)

    t0 = time.time()
    m1 = train_price_1(epochs=40)
    m2 = train_price_2(epochs=40)
    m3 = train_irri_1(epochs=40)
    m4 = train_irri_2(epochs=40)
    elapsed = time.time() - t0

    print("\n" + "=" * 78)
    print(f"  ALL 4 DATASETS SUCCESSFULLY TRAINED & EVALUATED IN {elapsed:.2f}s!")
    print("=" * 78)
    print(f"1. price 1 (Crop Yield Regression):         PyTorch NN R2={m1['nn_metrics']['R2']:.4f} | RF R2={m1['rf_metrics']['R2']:.4f}")
    print(f"2. price 2 (Crop Price Regression):         PyTorch NN R2={m2['nn_metrics']['R2']:.4f} | RF R2={m2['rf_metrics']['R2']:.4f}")
    print(f"3. irri 1  (Irrigation Need Multi-Class):   PyTorch NN Acc={m3['nn_metrics']['accuracy']*100:.2f}% | RF Acc={m3['rf_metrics']['accuracy']*100:.2f}%")
    print(f"4. irri 2  (Smart Irrigation Binary):       PyTorch NN Acc={m4['nn_metrics']['accuracy']*100:.2f}% | RF Acc={m4['rf_metrics']['accuracy']*100:.2f}%")
    print("=" * 78 + "\n")

if __name__ == "__main__":
    main()
