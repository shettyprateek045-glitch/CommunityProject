import os
import random
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(BASE_DIR, "Agricultural-crops")
dst = os.path.join(BASE_DIR, "crops_split")
ratio = 0.8
random.seed(42)

if not os.path.exists(src):
    raise FileNotFoundError(f"Source folder not found: {src}")

for cls in os.listdir(src):
    cls_path = os.path.join(src, cls)
    if not os.path.isdir(cls_path):
        continue
    imgs = [f for f in os.listdir(cls_path) if f.lower().endswith((".jpg", ".jpeg", ".png"))]
    random.shuffle(imgs)
    n = int(len(imgs) * ratio)
    for split, files in (("train", imgs[:n]), ("val", imgs[n:])):
        out = os.path.join(dst, split, cls)
        os.makedirs(out, exist_ok=True)
        for f in files:
            shutil.copy(os.path.join(cls_path, f), os.path.join(out, f))
print("Split complete: dataset organized into train/ and val/ splits in crops_split/")
