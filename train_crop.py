"""Crop Recommendation - train and test script.
Usage:  py train_crop.py [train.csv] [test.csv]
Example: py train_crop.py
"""
import sys, os, joblib
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, classification_report, ConfusionMatrixDisplay

ALIASES = {
    "temperatu": "temperature", "temp": "temperature", "temperature_c": "temperature",
    "nitrogen": "n", "phosphorus": "p", "phosphorous": "p", "potassium": "k",
    "ph_value": "ph", "ph value": "ph", "p_h": "ph", "soil_ph": "ph",
    "rain": "rainfall", "humid": "humidity",
    "crop": "label", "class": "label", "target": "label",
}
FEATURES = ["n", "p", "k", "temperature", "humidity", "ph", "rainfall"]

def load(path):
    d = pd.read_csv(path)
    d.columns = [c.strip().lower() for c in d.columns]
    d = d.rename(columns=ALIASES)
    d = d.dropna()
    if "label" in d.columns:
        d["label"] = d["label"].astype(str).str.strip().str.lower()
    return d

def split_from(df):
    return train_test_split(df, test_size=0.2, random_state=42, stratify=df["label"])

def find_default_csv():
    for p in ["Crop_recommendation.csv", "recommendation/Crop_recommendation.csv", "train/Crop_recommendation.csv"]:
        if os.path.exists(p):
            return p
    return "Crop_recommendation.csv"

train_path = sys.argv[1] if len(sys.argv) > 1 else find_default_csv()
test_path = sys.argv[2] if len(sys.argv) >= 3 else None

print(f"Loading training data from: {train_path}")
train_df = load(train_path)
test_df = load(test_path) if test_path else None

print("Train columns:", list(train_df.columns))
if test_df is not None:
    print("Test  columns:", list(test_df.columns))
    missing = [c for c in FEATURES + ["label"] if c not in test_df.columns]
    if missing:
        print("Test file is missing", missing, "-> ignoring it.")
        test_df = None

use_split = test_df is None
if test_df is not None:
    if "label" not in test_df.columns:
        print("Test file has no label column ->", list(test_df.columns))
        use_split = True
    else:
        merged = test_df.merge(train_df.drop_duplicates(), how="left", indicator=True)
        overlap = (merged["_merge"] == "both").mean()
        if overlap > 0.5:
            print(f"WARNING: {overlap*100:.0f}% of test rows also exist in the train file (data leakage).")
            use_split = True

if use_split:
    print("Using an 80/20 split of the dataset.")
    train_df, test_df = split_from(train_df)

if set(test_df["label"]) - set(train_df["label"]):
    print("NOTE: test labels not in train:", sorted(set(test_df["label"]) - set(train_df["label"])))
print(f"Train rows: {len(train_df)} | Test rows: {len(test_df)} | Target crops: {train_df['label'].nunique()}")

X_train, y_train = train_df.drop(columns="label"), train_df["label"]
X_test, y_test = test_df.drop(columns="label")[X_train.columns], test_df["label"]
X = X_train

models = {
    "RandomForest": RandomForestClassifier(n_estimators=300, random_state=42),
    "DecisionTree": DecisionTreeClassifier(random_state=42),
    "KNN": KNeighborsClassifier(n_neighbors=5),
    "NaiveBayes": GaussianNB(),
}
scores, fitted = {}, {}
for name, m in models.items():
    m.fit(X_train, y_train)
    scores[name] = accuracy_score(y_test, m.predict(X_test))
    fitted[name] = m
    print(f"{name:14s} test accuracy: {scores[name]*100:.2f}%")

best = max(scores, key=scores.get)
print("\nBest model by test accuracy:", best)
model = fitted["RandomForest"]
print("Selected model: RandomForest (superior stability & explainability via feature importance)")
pred = model.predict(X_test)
print(classification_report(y_test, pred))

# Save plots
os.makedirs("evaluation/crop_recommendation", exist_ok=True)
os.makedirs("recommendation", exist_ok=True)

fig, ax = plt.subplots(figsize=(11, 9))
ConfusionMatrixDisplay.from_predictions(y_test, pred, ax=ax, xticks_rotation=90, colorbar=False)
plt.tight_layout()
plt.savefig("evaluation/crop_recommendation/confusion_matrix.png", dpi=150)
plt.savefig("recommendation/confusion_matrix.png", dpi=150)
plt.close()

if hasattr(model, "feature_importances_"):
    imp = pd.Series(model.feature_importances_, index=X.columns).sort_values()
    imp.plot(kind="barh", title="Feature Importance - Crop Recommendation")
    plt.tight_layout()
    plt.savefig("evaluation/crop_recommendation/feature_importance.png", dpi=150)
    plt.savefig("recommendation/feature_importance.png", dpi=150)
    plt.close()

# typical range of each feature per crop (used to EXPLAIN predictions)
profile = {}
for crop, g in train_df.groupby("label"):
    profile[crop] = {f: (float(g[f].mean()), float(g[f].quantile(0.05)), float(g[f].quantile(0.95)))
                     for f in X.columns}
importance = (dict(zip(X.columns, map(float, model.feature_importances_)))
              if hasattr(model, "feature_importances_") else {})

bundle = {
    "model": model,
    "features": list(X.columns),
    "profile": profile,
    "importance": importance,
    "test_accuracy": float(scores["RandomForest"]),
}
joblib.dump(bundle, "crop_model.pkl")
joblib.dump(bundle, "recommendation/crop_model.pkl")
print("Saved artifacts: crop_model.pkl, evaluation/crop_recommendation/confusion_matrix.png, feature_importance.png")

# quick demo prediction
sample = pd.DataFrame([[90, 42, 43, 20.9, 82.0, 6.5, 202.9]], columns=X.columns)
print("Sample recommendation for rice profile:", model.predict(sample)[0])
