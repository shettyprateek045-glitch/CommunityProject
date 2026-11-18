from flask import Flask, request, render_template_string
from ultralytics import YOLO
import os

app = Flask(__name__)

# Locate available model weight
CANDIDATE_PATHS = [
    "crop_model.pt",
    "weights/crop_model.pt",
    "weights/best.pt",
    "runs/classify/train/weights/best.pt"
]
selected_weights = next((p for p in CANDIDATE_PATHS if os.path.exists(p)), None)
if not selected_weights:
    raise FileNotFoundError(f"Trained YOLO crop model not found. Checked: {CANDIDATE_PATHS}")

print(f"Loading Crop Identifier model from: {selected_weights}")
model = YOLO(selected_weights)
os.makedirs("uploads", exist_ok=True)

PAGE = """
<!DOCTYPE html>
<html>
<head>
  <title>Crop Identifier</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h2 { color: #2e7d32; }
    .card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    button { background: #2e7d32; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px; margin-top: 10px; }
    button:hover { background: #1b5e20; }
    .result { margin-top: 20px; padding: 15px; background: #e8f5e9; border-left: 5px solid #2e7d32; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🌾 Agricultural Crop Identifier</h2>
    <p>Upload a foliage or field image to classify the crop species using YOLOv11m.</p>
    <form method="post" enctype="multipart/form-data">
      <input type="file" name="image" accept="image/*" required><br>
      <button type="submit">Predict Crop</button>
    </form>
    {% if result %}
      <div class="result">
        <h3>Identified: <strong>{{ result }}</strong></h3>
        <p>Confidence: <strong>{{ conf }}%</strong></p>
      </div>
    {% endif %}
  </div>
</body>
</html>
"""

@app.route("/", methods=["GET", "POST"])
def index():
    result = conf = None
    if request.method == "POST":
        f = request.files.get("image")
        if f and f.filename:
            path = os.path.join("uploads", f.filename)
            f.save(path)
            r = model.predict(path, imgsz=224, verbose=False)[0]
            result = r.names[r.probs.top1]
            conf = round(float(r.probs.top1conf) * 100, 1)
    return render_template_string(PAGE, result=result, conf=conf)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
