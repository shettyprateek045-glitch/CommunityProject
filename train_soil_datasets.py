"""
train_soil_datasets.py
======================
Trains TWO soil models with 50 epochs each:

SOIL 1 — Hyperspectral Spectral Regression (1D CNN)
  Dataset : soil1/ (.npz files, 150 spectral bands)
  Task    : Predict soil nutrient values — P, K, Mg, pH
  Model   : 1D CNN on mean spectrum per sample
  Split   : 80 / 10 / 10  (train / val / test)
  Output  : evaluation/soil1/  +  models/soil1_cnn.pt

SOIL 2 — RGB Soil Image Classification (MobileNetV2)
  Dataset : soil2/Soil types/  (5 classes, 156 images)
  Task    : Classify soil into Black / Cinder / Laterite / Peat / Yellow
  Model   : Fine-tuned MobileNetV2 (ImageNet pre-trained)
  Split   : 70 / 15 / 15
  Output  : evaluation/soil2/  +  models/soil2_mobilenetv2.pt

Run:
    python train_soil_datasets.py

Requirements:
    pip install torch torchvision numpy pandas scikit-learn matplotlib seaborn pillow
"""

import os, sys, json, time, warnings
import numpy as np
import pandas as pd
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

warnings.filterwarnings("ignore")

# ─── PyTorch ─────────────────────────────────────────────────────────────────
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split
import torchvision.models as tv_models
import torchvision.transforms as T
from torchvision.datasets import ImageFolder
from PIL import Image

# ─── Sklearn ──────────────────────────────────────────────────────────────────
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, classification_report, confusion_matrix
)
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

# ─── Config ──────────────────────────────────────────────────────────────────
EPOCHS        = 50
BATCH_SIZE    = 16
LR            = 1e-3
DEVICE        = "cuda" if torch.cuda.is_available() else "cpu"
SEED          = 42

SOIL1_TRAIN_DIR = Path("soil1/train_data/train_data/train_data")
SOIL1_TRAIN_CSV = Path("soil1/train_data/train_data/train_gt.csv")
SOIL1_TEST_DIR  = Path("soil1/test_data")
SOIL1_EVAL_DIR  = Path("evaluation/soil1")
SOIL1_MODEL_OUT = Path("models/soil1_cnn.pt")

SOIL2_DATA_DIR  = Path("soil2/Soil types")
SOIL2_EVAL_DIR  = Path("evaluation/soil2")
SOIL2_MODEL_OUT = Path("models/soil2_mobilenetv2.pt")

SOIL1_EVAL_DIR.mkdir(parents=True, exist_ok=True)
SOIL2_EVAL_DIR.mkdir(parents=True, exist_ok=True)
Path("models").mkdir(exist_ok=True)

torch.manual_seed(SEED)
np.random.seed(SEED)

SEP = "=" * 70

def banner(title):
    print(f"\n{SEP}")
    print(f"  {title}")
    print(SEP)

# ═══════════════════════════════════════════════════════════════════════════════
# SOIL 1  —  Hyperspectral Regression (1D CNN)
# ═══════════════════════════════════════════════════════════════════════════════

banner("SOIL 1 — Hyperspectral Spectral Regression (1D CNN)  |  50 Epochs")
print(f"  Bands : 150 spectral channels (mean spectrum per sample)")
print(f"  Targets : P (mg/kg), K (mg/kg), Mg (mg/kg), pH")
print(f"  Device  : {DEVICE.upper()}")

# ── Load labels ──────────────────────────────────────────────────────────────
gt_df = pd.read_csv(SOIL1_TRAIN_CSV)
print(f"\n  Labels CSV shape : {gt_df.shape}")
print(f"  Columns          : {list(gt_df.columns)}")
print(f"  Label stats:")
for col in ["P", "K", "Mg", "pH"]:
    if col in gt_df.columns:
        print(f"    {col}: mean={gt_df[col].mean():.2f}  std={gt_df[col].std():.2f}  "
              f"min={gt_df[col].min():.2f}  max={gt_df[col].max():.2f}")

TARGET_COLS = [c for c in ["P", "K", "Mg", "pH"] if c in gt_df.columns]

# ── Load hyperspectral .npz files and extract mean spectrum ───────────────────
print(f"\n  Loading .npz files from {SOIL1_TRAIN_DIR} ...")
spectra, labels_list, indices_found = [], [], []

for idx, row in gt_df.iterrows():
    sample_idx = int(row["sample_index"])
    npz_path = SOIL1_TRAIN_DIR / f"{sample_idx}.npz"
    if not npz_path.exists():
        continue
    try:
        d = np.load(npz_path)
        cube = d["data"].astype(np.float32)          # (150, H, W)
        mask = d.get("mask", None)
        n_bands = cube.shape[0]                      # 150

        if mask is not None and mask.ndim == 3:
            # Mask is 3D (150, H, W) — use first band as spatial mask
            spatial_mask = mask[0].astype(bool)       # (H, W)
        elif mask is not None and mask.ndim == 2:
            spatial_mask = mask.astype(bool)          # (H, W)
        else:
            spatial_mask = None

        if spatial_mask is not None and spatial_mask.sum() > 0:
            # For each band, select only valid spatial pixels and average
            mean_spec = np.array([cube[b][spatial_mask].mean() for b in range(n_bands)])
        else:
            # No valid mask — average over all spatial pixels
            mean_spec = cube.reshape(n_bands, -1).mean(axis=1)

        if mean_spec.shape == (n_bands,) and np.isfinite(mean_spec).all():
            spectra.append(mean_spec)
            labels_list.append([row[c] for c in TARGET_COLS])
            indices_found.append(sample_idx)
    except Exception as e:
        print(f"    WARNING: Failed to load sample {sample_idx}: {e}")

X = np.array(spectra, dtype=np.float32)             # (N, 150)
y = np.array(labels_list, dtype=np.float32)         # (N, 4)
print(f"  Loaded {len(X)} samples with valid labels")
print(f"  Spectrum shape : {X.shape}   Labels shape : {y.shape}")

# ── Normalise features and targets ───────────────────────────────────────────
x_scaler = StandardScaler()
X_norm = x_scaler.fit_transform(X)                  # (N, 150)

y_scaler = StandardScaler()
y_norm = y_scaler.fit_transform(y)                  # (N, 4)

# ── 80 / 10 / 10 split ───────────────────────────────────────────────────────
X_tr, X_tmp, y_tr, y_tmp = train_test_split(X_norm, y_norm, test_size=0.20, random_state=SEED)
X_val, X_te, y_val, y_te = train_test_split(X_tmp, y_tmp, test_size=0.50, random_state=SEED)
print(f"  Train : {len(X_tr)}   Val : {len(X_val)}   Test : {len(X_te)}")

# ── Dataset ──────────────────────────────────────────────────────────────────
class SpectraDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.FloatTensor(X)
        self.y = torch.FloatTensor(y)
    def __len__(self): return len(self.X)
    def __getitem__(self, i): return self.X[i], self.y[i]

tr_loader  = DataLoader(SpectraDataset(X_tr, y_tr),   batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(SpectraDataset(X_val, y_val), batch_size=BATCH_SIZE)
te_loader  = DataLoader(SpectraDataset(X_te, y_te),   batch_size=BATCH_SIZE)

# ── 1D CNN Model ─────────────────────────────────────────────────────────────
class Soil1CNN(nn.Module):
    """1D CNN for hyperspectral spectral regression."""
    def __init__(self, in_channels=1, num_bands=150, num_targets=4):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv1d(in_channels, 32, kernel_size=7, padding=3),
            nn.BatchNorm1d(32), nn.ReLU(), nn.MaxPool1d(2),      # 75
            nn.Conv1d(32, 64, kernel_size=5, padding=2),
            nn.BatchNorm1d(64), nn.ReLU(), nn.MaxPool1d(2),      # 37
            nn.Conv1d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm1d(128), nn.ReLU(), nn.AdaptiveAvgPool1d(16) # 16
        )
        self.head = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 16, 256), nn.ReLU(), nn.Dropout(0.3),
            nn.Linear(256, 64),  nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(64, num_targets)
        )
    def forward(self, x):
        x = x.unsqueeze(1)   # (B, 1, 150)
        return self.head(self.conv(x))

model1 = Soil1CNN(num_targets=len(TARGET_COLS)).to(DEVICE)
optimizer1 = optim.AdamW(model1.parameters(), lr=LR, weight_decay=1e-4)
scheduler1 = optim.lr_scheduler.CosineAnnealingLR(optimizer1, T_max=EPOCHS)
criterion1 = nn.SmoothL1Loss()

# ── Training loop ─────────────────────────────────────────────────────────────
print(f"\n  Training Soil1 1D CNN for {EPOCHS} epochs ...")
tr_losses1, val_losses1 = [], []
best_val1 = float("inf")
best_state1 = None

for epoch in range(1, EPOCHS + 1):
    model1.train()
    ep_loss = 0.0
    for xb, yb in tr_loader:
        xb, yb = xb.to(DEVICE), yb.to(DEVICE)
        optimizer1.zero_grad()
        pred = model1(xb)
        loss = criterion1(pred, yb)
        loss.backward()
        optimizer1.step()
        ep_loss += loss.item() * len(xb)
    ep_loss /= len(X_tr)
    tr_losses1.append(ep_loss)

    model1.eval()
    vl = 0.0
    with torch.no_grad():
        for xb, yb in val_loader:
            xb, yb = xb.to(DEVICE), yb.to(DEVICE)
            vl += criterion1(model1(xb), yb).item() * len(xb)
    vl /= len(X_val)
    val_losses1.append(vl)
    scheduler1.step()

    if vl < best_val1:
        best_val1 = vl
        best_state1 = {k: v.clone() for k, v in model1.state_dict().items()}

    if epoch % 10 == 0 or epoch == 1:
        print(f"    Epoch {epoch:3d}/{EPOCHS}  |  Train Loss: {ep_loss:.5f}  |  Val Loss: {vl:.5f}")

model1.load_state_dict(best_state1)

# ── Evaluation on test set ────────────────────────────────────────────────────
print(f"\n  Evaluating on test set ...")
model1.eval()
preds_norm, trues_norm = [], []
with torch.no_grad():
    for xb, yb in te_loader:
        preds_norm.append(model1(xb.to(DEVICE)).cpu().numpy())
        trues_norm.append(yb.numpy())

preds_norm = np.vstack(preds_norm)
trues_norm = np.vstack(trues_norm)

preds = y_scaler.inverse_transform(preds_norm)
trues = y_scaler.inverse_transform(trues_norm)

print(f"\n  {'Target':<8} {'MAE':>10} {'RMSE':>10} {'R²':>8}")
print(f"  {'-'*40}")
metrics1 = {}
for i, col in enumerate(TARGET_COLS):
    mae  = mean_absolute_error(trues[:, i], preds[:, i])
    rmse = mean_squared_error(trues[:, i], preds[:, i]) ** 0.5
    r2   = r2_score(trues[:, i], preds[:, i])
    metrics1[col] = {"MAE": round(mae, 4), "RMSE": round(rmse, 4), "R2": round(r2, 4)}
    print(f"  {col:<8} {mae:>10.4f} {rmse:>10.4f} {r2:>8.4f}")

# ── Save model + artifacts ───────────────────────────────────────────────────
save_bundle1 = {
    "model_state_dict": best_state1,
    "x_scaler_mean":  x_scaler.mean_.tolist(),
    "x_scaler_std":   x_scaler.scale_.tolist(),
    "y_scaler_mean":  y_scaler.mean_.tolist(),
    "y_scaler_std":   y_scaler.scale_.tolist(),
    "target_cols":    TARGET_COLS,
    "num_bands":      150,
    "epochs":         EPOCHS,
    "best_val_loss":  round(best_val1, 6),
    "test_metrics":   metrics1
}
torch.save(save_bundle1, SOIL1_MODEL_OUT)
print(f"\n  Model saved -> {SOIL1_MODEL_OUT}")

# Save metrics JSON
with open(SOIL1_EVAL_DIR / "metrics.json", "w") as f:
    json.dump({"epochs": EPOCHS, "best_val_loss": round(best_val1, 6), "test_metrics": metrics1}, f, indent=2)

# ── Learning curve ────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(9, 4))
ax.plot(tr_losses1, label="Train Loss", linewidth=2, color="#2e7d32")
ax.plot(val_losses1, label="Val Loss",  linewidth=2, color="#f57f17", linestyle="--")
ax.set_xlabel("Epoch"); ax.set_ylabel("SmoothL1 Loss")
ax.set_title("Soil1 Hyperspectral 1D CNN — 50 Epochs Learning Curve")
ax.legend(); ax.grid(alpha=0.3)
plt.tight_layout()
plt.savefig(SOIL1_EVAL_DIR / "learning_curve.png", dpi=150)
plt.close()
print(f"  Learning curve -> {SOIL1_EVAL_DIR}/learning_curve.png")

# ── Prediction scatter plots ──────────────────────────────────────────────────
n_cols = len(TARGET_COLS)
fig, axes = plt.subplots(1, n_cols, figsize=(4 * n_cols, 4))
if n_cols == 1: axes = [axes]
for i, (col, ax) in enumerate(zip(TARGET_COLS, axes)):
    ax.scatter(trues[:, i], preds[:, i], alpha=0.6, s=20, color="#1b5e20")
    mn, mx = trues[:, i].min(), trues[:, i].max()
    ax.plot([mn, mx], [mn, mx], "r--", linewidth=1.5)
    ax.set_xlabel(f"True {col}"); ax.set_ylabel(f"Pred {col}")
    ax.set_title(f"{col}  R²={metrics1[col]['R2']:.4f}")
    ax.grid(alpha=0.3)
plt.suptitle("Soil1 — Test Set Predictions vs Ground Truth", y=1.02)
plt.tight_layout()
plt.savefig(SOIL1_EVAL_DIR / "prediction_scatter.png", dpi=150, bbox_inches="tight")
plt.close()
print(f"  Scatter plots    -> {SOIL1_EVAL_DIR}/prediction_scatter.png")

# ── Save test predictions CSV ─────────────────────────────────────────────────
pred_df = pd.DataFrame()
for i, col in enumerate(TARGET_COLS):
    pred_df[f"true_{col}"]  = trues[:, i]
    pred_df[f"pred_{col}"]  = preds[:, i]
pred_df.to_csv(SOIL1_EVAL_DIR / "test_predictions.csv", index=False)
print(f"  Test predictions -> {SOIL1_EVAL_DIR}/test_predictions.csv")

# ═══════════════════════════════════════════════════════════════════════════════
# SOIL 2  —  RGB Soil Image Classification (MobileNetV2)
# ═══════════════════════════════════════════════════════════════════════════════

banner("SOIL 2 — RGB Image Classification (MobileNetV2 Fine-tune)  |  50 Epochs")
print(f"  Classes : Black Soil, Cinder Soil, Laterite Soil, Peat Soil, Yellow Soil")
print(f"  Total images : 156   Split : 70 / 15 / 15")
print(f"  Device  : {DEVICE.upper()}")

CLASSES2 = ["Black Soil", "Cinder Soil", "Laterite Soil", "Peat Soil", "Yellow Soil"]
N_CLASSES2 = len(CLASSES2)
IMG_SIZE   = 224

# ── Transforms ───────────────────────────────────────────────────────────────
train_tf = T.Compose([
    T.Resize((IMG_SIZE + 32, IMG_SIZE + 32)),
    T.RandomCrop(IMG_SIZE),
    T.RandomHorizontalFlip(),
    T.RandomVerticalFlip(),
    T.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2, hue=0.05),
    T.RandomRotation(20),
    T.ToTensor(),
    T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])
eval_tf = T.Compose([
    T.Resize((IMG_SIZE, IMG_SIZE)),
    T.ToTensor(),
    T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ── Load all images manually for stratified split ─────────────────────────────
image_paths, image_labels = [], []
for cls_idx, cls_name in enumerate(CLASSES2):
    cls_dir = SOIL2_DATA_DIR / cls_name
    for ext in ["*.jpg", "*.jpeg", "*.png", "*.JPG", "*.JPEG", "*.PNG"]:
        for p in cls_dir.glob(ext):
            image_paths.append(p)
            image_labels.append(cls_idx)

print(f"\n  Found {len(image_paths)} images across {N_CLASSES2} classes")
for i, cls_name in enumerate(CLASSES2):
    cnt = image_labels.count(i)
    print(f"    [{i}] {cls_name}: {cnt} images")

# Stratified 70 / 15 / 15
tr_paths, tmp_paths, tr_lbs, tmp_lbs = train_test_split(
    image_paths, image_labels, test_size=0.30, stratify=image_labels, random_state=SEED)
val_paths, te_paths, val_lbs, te_lbs = train_test_split(
    tmp_paths, tmp_lbs, test_size=0.50, stratify=tmp_lbs, random_state=SEED)
print(f"\n  Train: {len(tr_paths)}  Val: {len(val_paths)}  Test: {len(te_paths)}")

# ── Class weights for imbalance ───────────────────────────────────────────────
from collections import Counter
cls_counts = Counter(tr_lbs)
cls_weights = torch.FloatTensor([1.0 / max(cls_counts[i], 1) for i in range(N_CLASSES2)])
cls_weights = cls_weights / cls_weights.sum() * N_CLASSES2

# ── Custom Dataset ────────────────────────────────────────────────────────────
class SoilImgDataset(Dataset):
    def __init__(self, paths, labels, transform):
        self.paths, self.labels, self.tf = paths, labels, transform
    def __len__(self): return len(self.paths)
    def __getitem__(self, i):
        img = Image.open(self.paths[i]).convert("RGB")
        return self.tf(img), self.labels[i]

BATCH2 = 8  # small dataset, small batch
tr_loader2  = DataLoader(SoilImgDataset(tr_paths,  tr_lbs,  train_tf), batch_size=BATCH2, shuffle=True,  drop_last=False)
val_loader2 = DataLoader(SoilImgDataset(val_paths, val_lbs, eval_tf),  batch_size=BATCH2, shuffle=False)
te_loader2  = DataLoader(SoilImgDataset(te_paths,  te_lbs,  eval_tf),  batch_size=BATCH2, shuffle=False)

# ── MobileNetV2 — fine-tune all layers ───────────────────────────────────────
model2 = tv_models.mobilenet_v2(weights=tv_models.MobileNet_V2_Weights.IMAGENET1K_V1)
in_feats = model2.classifier[1].in_features
model2.classifier = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(in_feats, 256),
    nn.ReLU(),
    nn.Dropout(0.2),
    nn.Linear(256, N_CLASSES2)
)
model2 = model2.to(DEVICE)

optimizer2  = optim.AdamW(model2.parameters(), lr=5e-4, weight_decay=1e-4)
scheduler2  = optim.lr_scheduler.CosineAnnealingLR(optimizer2, T_max=EPOCHS, eta_min=1e-6)
criterion2  = nn.CrossEntropyLoss(weight=cls_weights.to(DEVICE), label_smoothing=0.1)

# ── Training loop ─────────────────────────────────────────────────────────────
print(f"\n  Training Soil2 MobileNetV2 for {EPOCHS} epochs ...")
tr_losses2, val_losses2, val_accs2 = [], [], []
best_val_acc2 = 0.0
best_state2   = None

for epoch in range(1, EPOCHS + 1):
    model2.train()
    ep_loss2, correct2, total2 = 0.0, 0, 0
    for xb, yb in tr_loader2:
        xb, yb = xb.to(DEVICE), yb.to(DEVICE)
        optimizer2.zero_grad()
        logits = model2(xb)
        loss = criterion2(logits, yb)
        loss.backward()
        optimizer2.step()
        ep_loss2 += loss.item() * len(xb)
        preds_b = logits.argmax(dim=1)
        correct2 += (preds_b == yb).sum().item()
        total2 += len(yb)
    ep_loss2 /= total2
    tr_losses2.append(ep_loss2)

    # Validation
    model2.eval()
    vl2, vc2, vt2 = 0.0, 0, 0
    with torch.no_grad():
        for xb, yb in val_loader2:
            xb, yb = xb.to(DEVICE), yb.to(DEVICE)
            logits = model2(xb)
            vl2 += criterion2(logits, yb).item() * len(xb)
            vc2 += (logits.argmax(1) == yb).sum().item()
            vt2 += len(yb)
    vl2 /= max(vt2, 1)
    vacc2 = vc2 / max(vt2, 1) * 100
    val_losses2.append(vl2)
    val_accs2.append(vacc2)
    scheduler2.step()

    if vacc2 > best_val_acc2:
        best_val_acc2 = vacc2
        best_state2 = {k: v.clone() for k, v in model2.state_dict().items()}

    if epoch % 10 == 0 or epoch == 1:
        tr_acc2 = correct2 / total2 * 100
        print(f"    Epoch {epoch:3d}/{EPOCHS}  |  Train Loss: {ep_loss2:.4f}  Acc: {tr_acc2:.1f}%  |  Val Loss: {vl2:.4f}  Acc: {vacc2:.1f}%")

model2.load_state_dict(best_state2)

# ── Test evaluation ────────────────────────────────────────────────────────────
print(f"\n  Evaluating on test set ...")
model2.eval()
all_preds2, all_trues2 = [], []
with torch.no_grad():
    for xb, yb in te_loader2:
        logits = model2(xb.to(DEVICE))
        all_preds2.extend(logits.argmax(1).cpu().tolist())
        all_trues2.extend(yb.tolist())

test_acc2 = accuracy_score(all_trues2, all_preds2) * 100
report2   = classification_report(all_trues2, all_preds2, target_names=CLASSES2, digits=4)
cm2       = confusion_matrix(all_trues2, all_preds2)

print(f"\n  Test Accuracy : {test_acc2:.2f}%")
print(f"  Best Val Accuracy : {best_val_acc2:.2f}%")
print(f"\n  Classification Report:\n{report2}")

# ── Save model + metrics ──────────────────────────────────────────────────────
save_bundle2 = {
    "model_state_dict": best_state2,
    "classes":          CLASSES2,
    "num_classes":      N_CLASSES2,
    "img_size":         IMG_SIZE,
    "epochs":           EPOCHS,
    "best_val_acc":     round(best_val_acc2, 4),
    "test_accuracy":    round(test_acc2, 4)
}
torch.save(save_bundle2, SOIL2_MODEL_OUT)
print(f"\n  Model saved -> {SOIL2_MODEL_OUT}")

metrics2 = {
    "epochs": EPOCHS,
    "best_val_accuracy": round(best_val_acc2, 4),
    "test_accuracy": round(test_acc2, 4),
    "classes": CLASSES2,
    "per_class_report": classification_report(
        all_trues2, all_preds2, target_names=CLASSES2, output_dict=True)
}
with open(SOIL2_EVAL_DIR / "metrics.json", "w") as f:
    json.dump(metrics2, f, indent=2)

# ── Confusion matrix ──────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(7, 6))
sns.heatmap(cm2, annot=True, fmt="d", cmap="Greens",
            xticklabels=CLASSES2, yticklabels=CLASSES2, ax=ax,
            linewidths=0.5)
ax.set_xlabel("Predicted"); ax.set_ylabel("True")
ax.set_title(f"Soil2 MobileNetV2 — Confusion Matrix\nTest Accuracy: {test_acc2:.2f}%")
plt.xticks(rotation=30, ha="right"); plt.yticks(rotation=0)
plt.tight_layout()
plt.savefig(SOIL2_EVAL_DIR / "confusion_matrix.png", dpi=150)
plt.close()
print(f"  Confusion matrix -> {SOIL2_EVAL_DIR}/confusion_matrix.png")

# ── Learning curve ────────────────────────────────────────────────────────────
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
ax1.plot(tr_losses2, label="Train", color="#2e7d32", linewidth=2)
ax1.plot(val_losses2, label="Val",   color="#f57f17", linewidth=2, linestyle="--")
ax1.set_xlabel("Epoch"); ax1.set_ylabel("Cross-Entropy Loss")
ax1.set_title("Loss Curves"); ax1.legend(); ax1.grid(alpha=0.3)
ax2.plot(val_accs2, color="#1565c0", linewidth=2)
ax2.axhline(best_val_acc2, color="red", linestyle="--", linewidth=1.2,
            label=f"Best: {best_val_acc2:.1f}%")
ax2.set_xlabel("Epoch"); ax2.set_ylabel("Validation Accuracy (%)")
ax2.set_title("Validation Accuracy"); ax2.legend(); ax2.grid(alpha=0.3)
plt.suptitle("Soil2 MobileNetV2 Fine-tune — 50 Epochs")
plt.tight_layout()
plt.savefig(SOIL2_EVAL_DIR / "learning_curve.png", dpi=150)
plt.close()
print(f"  Learning curve -> {SOIL2_EVAL_DIR}/learning_curve.png")

# ═══════════════════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════

banner("TRAINING COMPLETE — SUMMARY")

print(f"\n  SOIL 1  — Hyperspectral Regression (1D CNN)  |  50 Epochs")
print(f"  {'Target':<8} {'MAE':>10} {'RMSE':>10} {'R²':>8}")
print(f"  {'-'*40}")
for col, m in metrics1.items():
    print(f"  {col:<8} {m['MAE']:>10.4f} {m['RMSE']:>10.4f} {m['R2']:>8.4f}")
print(f"  Checkpoint : {SOIL1_MODEL_OUT}")
print(f"  Evaluation : {SOIL1_EVAL_DIR}/")

print(f"\n  SOIL 2  — RGB Image Classification (MobileNetV2)  |  50 Epochs")
print(f"  Test Accuracy     : {test_acc2:.2f}%")
print(f"  Best Val Accuracy : {best_val_acc2:.2f}%")
for cls_name in CLASSES2:
    row = metrics2["per_class_report"].get(cls_name, {})
    p, r, f = row.get("precision", 0), row.get("recall", 0), row.get("f1-score", 0)
    print(f"    {cls_name:<18} P={p:.2f}  R={r:.2f}  F1={f:.2f}")
print(f"  Checkpoint : {SOIL2_MODEL_OUT}")
print(f"  Evaluation : {SOIL2_EVAL_DIR}/")

print(f"\n{SEP}")
print(f"  ALL ARTIFACTS SAVED")
print(f"  Soil1 -> evaluation/soil1/  &  models/soil1_cnn.pt")
print(f"  Soil2 -> evaluation/soil2/  &  models/soil2_mobilenetv2.pt")
print(SEP)
