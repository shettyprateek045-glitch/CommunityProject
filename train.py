from ultralytics import YOLO

if __name__ == "__main__":
    model = YOLO("yolo11m-cls.pt")
    model.train(
        data=r"C:\Users\Admin\Downloads\Community Project\crops_split",
        epochs=40,
        imgsz=224,
        batch=16,
        device=0,
        workers=4,
    )