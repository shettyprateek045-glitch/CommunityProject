import os, random, shutil

src = r"C:\Users\Admin\Downloads\Community Project\Agricultural-crops"
dst = r"C:\Users\Admin\Downloads\Community Project\crops_split"
ratio = 0.8
random.seed(42)

exts = (".jpg", ".jpeg", ".png", ".bmp", ".webp")
total = 0

for cls in os.listdir(src):
    cls_path = os.path.join(src, cls)
    if not os.path.isdir(cls_path):
        continue
    imgs = [f for f in os.listdir(cls_path) if f.lower().endswith(exts)]
    random.shuffle(imgs)
    n = int(len(imgs) * ratio)
    for split, files in (("train", imgs[:n]), ("val", imgs[n:])):
        out = os.path.join(dst, split, cls)
        os.makedirs(out, exist_ok=True)
        for f in files:
            shutil.copy(os.path.join(cls_path, f), os.path.join(out, f))
    print(f"{cls}: {len(imgs)} images")
    total += len(imgs)

print("total images:", total)