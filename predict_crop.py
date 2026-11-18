"""Crop recommendation - prediction with confidence and explanation.
Usage:  py predict_crop.py N P K temperature humidity ph rainfall
Example: py predict_crop.py 90 42 43 20.9 82 6.5 202.9
"""
import sys, os, joblib, pandas as pd

def load(path="crop_model.pkl"):
    if not os.path.exists(path):
        alt = os.path.join("recommendation", "crop_model.pkl")
        if os.path.exists(alt):
            path = alt
    if not os.path.exists(path):
        raise FileNotFoundError(f"Trained model not found at '{path}'. Run train_crop.py first.")
    return joblib.load(path)

def recommend(bundle, values, top=3):
    feats = bundle["features"]
    row = pd.DataFrame([values], columns=feats)
    proba = bundle["model"].predict_proba(row)[0]
    classes = bundle["model"].classes_
    out = []
    for i in proba.argsort()[::-1][:top]:
        crop = classes[i]
        checks = []
        for f, v in zip(feats, values):
            mean, lo, hi = bundle["profile"][crop][f]
            checks.append({"feature": f, "value": v, "typical_low": lo, "typical_high": hi,
                           "ok": lo <= v <= hi})
        out.append({"crop": crop, "confidence": float(proba[i]), "checks": checks})
    return out

if __name__ == "__main__":
    if len(sys.argv) != 8:
        sys.exit("Usage: python predict_crop.py <N> <P> <K> <temperature> <humidity> <ph> <rainfall>\nExample: python predict_crop.py 90 42 43 20.9 82 6.5 202.9")
    bundle = load()
    vals = [float(v) for v in sys.argv[1:8]]
    print(f"\nTop Recommendations (Evaluated Test Accuracy: {bundle.get('test_accuracy', 0)*100:.2f}%):")
    for rank, r in enumerate(recommend(bundle, vals), 1):
        print(f"\n#{rank}  {r['crop'].upper()}  ({r['confidence']*100:.1f}% confidence)")
        for c in r["checks"]:
            mark = "within typical range" if c["ok"] else "OUTSIDE typical range"
            print(f"   {c['feature']:12s} {c['value']:>8.2f}   typical {c['typical_low']:.1f} to {c['typical_high']:.1f}   {mark}")
