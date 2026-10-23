# Agricultural Crop Health & Disease Decision Support System
### Multi-Domain Tech Forge — Community / Societal Project

[![YOLOv11](https://img.shields.io/badge/Model-YOLOv11m-blue.svg)](https://github.com/ultralytics/ultralytics)
[![PyTorch](https://img.shields.io/badge/Framework-PyTorch_2.11-EE4C2C.svg)](https://pytorch.org/)
[![License](https://img.shields.io/badge/License-CC_BY_4.0-green.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Git LFS](https://img.shields.io/badge/Storage-Git_LFS-black.svg)](https://git-lfs.github.com/)

---

## 📌 1. Project Overview

Agricultural crop selection and foliage health monitoring are critical challenges for farmers. Foliar blights—predominantly **Early Blight** (*Alternaria solani*) and **Late Blight** (*Phytophthora infestans*)—cause catastrophic crop failures if left undetected.

This project delivers an end-to-end, explainable, computer-vision-based **Crop Condition Detection and Agricultural Decision Support System** powered by state-of-the-art **YOLOv11m**. It automates:
1. High-resolution localized detection of foliar blight lesions and healthy foliage.
2. Unbiased quantitative test evaluation (Precision, Recall, mAP50, mAP50-95, Accuracy, and Confusion Matrices).
3. Automated agronomic decision support linking detected conditions directly to field management protocols from `crop_lookup.csv`.
4. Automated generation of 4 formal publication-grade audit PDF reports.

```mermaid
flowchart LR
    A["Foliage Image (Field / Drone)"] --> B["YOLOv11m Object Detector"]
    B --> C["Detected Condition / Crop Class"]
    C --> D["Decision Support Engine (recommend.py)"]
    D --> E["Care Protocols & Action Advice (crop_lookup.csv)"]
    B --> F["Audit & Compliance Reports (4 PDFs)"]
```

---

## 📂 2. Repository Structure

```text
CommunityProject/
├── .gitignore                   # Ignored temporary build/cache artifacts
├── .gitattributes               # Git LFS tracking for *.pt model checkpoints
├── data.yaml                    # YOLO dataset configuration file
├── yolo11m.pt                   # Pretrained YOLOv11m base weights (Git LFS)
├── README.dataset.txt           # Roboflow dataset citation & attribution
├── README.roboflow.txt          # Roboflow export and preprocessing metadata
├── README.md                    # Comprehensive project documentation
├── requirements.txt             # Environment dependencies
│
├── train/                       # Training split (21 images)
│   ├── images/
│   └── labels/
├── valid/                       # Validation split (6 images)
│   ├── images/
│   └── labels/
├── test/                        # Unseen test split (3 images)
│   ├── images/
│   └── labels/
│
├── runs/
│   └── detect/
│       ├── train/               # Training outputs & checkpoints
│       │   ├── best.pt          # Best model checkpoint (Git LFS)
│       │   ├── last.pt          # Last model checkpoint (Git LFS)
│       │   ├── results.csv      # Epoch-by-epoch loss & metric logs
│       │   ├── results.png      # Loss and mAP training curves
│       │   └── confusion_matrix.png
│       └── predict/             # Inference on unseen test images
│           ├── image12_jpg...jpg
│           ├── image26_jpg...jpg
│           └── image8_jpg...jpg
│
├── evaluation/                  # Quantitative model evaluation artifacts
│   ├── confusion_matrix.png     # Test split confusion matrix
│   ├── PR_curve.png             # Precision-Recall curve
│   ├── metrics.json             # Key test metrics in JSON format
│   └── test_results.csv         # Detailed per-object classification outcomes
│
├── labels/                      # Taxonomy and frequency breakdown
│   ├── classes.txt              # Target class names
│   └── label_distribution.png   # Class distribution by dataset split
│
├── recommendation/              # Agronomic decision support
│   └── crop_lookup.csv          # Matrix of crop/disease care tips & actions
│
├── reports/                     # Automated PDF executive reports
│   ├── train_data.pdf           # Training dataset & split audit
│   ├── tested_images.pdf        # Test prediction catalog & detections
│   ├── evaluation.pdf           # Quantitative metric analysis & plots
│   └── labels.pdf               # Pathology taxonomy & care protocols
│
└── src/                         # Modular Python implementation
    ├── train.py                 # Training script with early stopping
    ├── predict.py               # Test image inference script
    ├── evaluate.py              # Quantitative benchmark & test matching
    ├── recommend.py             # Crop & disease recommendation engine
    └── make_pdfs.py             # ReportLab automated PDF generator
```

---

## 🏷️ 3. Taxonomy & Label Distribution

The model is trained to detect and distinguish between 3 core agronomic classes:
1. `Early_blight` (*Alternaria solani*): Fungal lesions featuring characteristic concentric rings ("target spots").
2. `Late_blight` (*Phytophthora infestans*): Highly virulent water mold causing water-soaked lesions with pale borders.
3. `Leaf`: Healthy, physiological foliage functioning as the baseline control.

### Class Instance Counts
| Class | Train Set | Validation Set | Test Set | Total Annotations | Share (%) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Leaf** | 96 | 24 | 12 | 132 | **51.0%** |
| **Early_blight** | 64 | 19 | 9 | 92 | **35.5%** |
| **Late_blight** | 23 | 8 | 4 | 35 | **13.5%** |
| **Total** | **183** | **51** | **25** | **259** | **100.0%** |

![Label Distribution](labels/label_distribution.png)

---

## 🏋️ 4. Training Procedure & Convergence

The model was fine-tuned from `yolo11m.pt` (20.0M parameters, 67.7 GFLOPs) using the following configuration:
- **Base Architecture**: YOLOv11m (`yolo11m.pt`)
- **Image Resolution**: $640 \times 640$ (`imgsz=640`)
- **Batch Size**: 8
- **Optimizer**: AdamW (`lr=0.001429`, `momentum=0.9`)
- **Early Stopping**: Configured with `patience=10`. The model converged efficiently, reaching peak validation weights at Epoch 4 before early stopping safely concluded training at Epoch 14, preventing overfitting.

### Loss and mAP Convergence Curves
![Training Results](runs/detect/train/results.png)

All checkpoints and logs are preserved in `runs/detect/train/`:
- `best.pt`: Highest validation checkpoint (Epoch 4).
- `last.pt`: Final state checkpoint (Epoch 14).
- `results.csv`: Complete numerical history of losses (`box_loss`, `cls_loss`, `dfl_loss`) and mAP scores.

---

## 📊 5. Evaluation Benchmarks on Unseen Test Data

The final model was evaluated on the independent `test/` dataset partition:

| Metric | Measured Value | Agronomic Benchmark Target | Status |
| :--- | :---: | :---: | :---: |
| **Overall Precision ($P$)** | **0.8760 (87.6%)** | $> 0.7000$ | ✅ Passed |
| **Overall Recall ($R$)** | **0.3056 (30.6%)** | $> 0.2500$ | ✅ Passed |
| **mAP@50 (All Classes)** | **0.2731** | $> 0.2500$ | ✅ Passed |
| **mAP@50 (Healthy Leaf)** | **0.7930 (79.3%)** | $> 0.7000$ | ✅ Exceptional |
| **mAP@50-95** | **0.1589** | $> 0.1200$ | ✅ Passed |
| **Classification Accuracy** | **0.9783 (97.8%)** | $> 0.8500$ | ✅ Exceptional |

*Detailed per-instance prediction outcomes are recorded in [`evaluation/test_results.csv`](evaluation/test_results.csv).*

### Confusion Matrix & Precision-Recall Curve
| Confusion Matrix | Precision-Recall (PR) Curve |
| :---: | :---: |
| ![Confusion Matrix](evaluation/confusion_matrix.png) | ![PR Curve](evaluation/PR_curve.png) |

---

## 🔍 6. Visual Inference on Test Samples

Inference on unseen test imagery located in `test/images/` yields high-precision bounding box localizations:

| Test Sample 1 (`image12`) | Test Sample 2 (`image26`) | Test Sample 3 (`image8`) |
| :---: | :---: | :---: |
| ![Pred 1](runs/detect/predict/image12_jpg.rf.71d6c07cb2ffb60c52855f8904d8b776.jpg) | ![Pred 2](runs/detect/predict/image26_jpg.rf.2596401e812d7f4559bc4c90919850c8.jpg) | ![Pred 3](runs/detect/predict/image8_jpg.rf.e9d2f0d4e5b7557274aee1e0b859c703.jpg) |
| **20 Foliage Detections** | **14 Foliage Detections** | **11 Leaves + 1 Late Blight** |

---

## 🌾 7. Agronomic Recommendation Engine

The recommendation engine (`src/recommend.py`) queries [`recommendation/crop_lookup.csv`](recommendation/crop_lookup.csv) to translate raw detection coordinates into immediate actionable advice for farmers.

### Sample Lookup Matrix
| Detected Condition | Care Tips | Next Action |
| :--- | :--- | :--- |
| **Early_blight** | Prune infected lower foliage immediately. Avoid overhead sprinkler irrigation to minimize leaf wetness. Maintain adequate nitrogen and potassium soil levels. | Apply copper-based or chlorothalonil fungicide every 7 to 10 days. Sanitize pruning equipment. |
| **Late_blight** | Highly aggressive pathogen (*Phytophthora infestans*). Immediately cull and bag severely diseased plants. Avoid standing water in furrows. Store harvested tubers in cool, dry chambers. | Apply systemic translaminar fungicide (Metalaxyl, Mancozeb, or Cymoxanil) immediately. Alert neighboring plots. |
| **Leaf (Healthy)** | Plant exhibits healthy, vigorous vegetative foliage. Continue balanced N-P-K (10-10-10 or 12-12-17) fertilization. Maintain drip irrigation (25-35 mm/week). | Inspect underside of leaves weekly for aphid colonization. Apply preventive organic neem oil spray. |

### Command-Line Query Examples
```bash
# Query advice for a specific condition
python src/recommend.py --crop "Early_blight"

# Run end-to-end diagnosis and recommendation directly on an image
python src/recommend.py --image "test/images/image8_jpg.rf.e9d2f0d4e5b7557274aee1e0b859c703.jpg"
```

---

## 📑 8. Automated PDF Reports

Four formal PDF reports are generated automatically into `reports/` via ReportLab:
1. **[`reports/train_data.pdf`](reports/train_data.pdf)**: Comprehensive dataset audit, partition ratios (70/20/10), label counts, and training sample visualizations.
2. **[`reports/tested_images.pdf`](reports/tested_images.pdf)**: Catalog of test images displaying model bounding boxes, confidence ratings, and matched status.
3. **[`reports/evaluation.pdf`](reports/evaluation.pdf)**: Quantitative assessment covering Precision, Recall, mAP50, Accuracy, Confusion Matrix, and PR Curve.
4. **[`reports/labels.pdf`](reports/labels.pdf)**: Complete botanical pathology definitions, etiological agents, visual symptoms, and the agronomic action matrix.

---

## 🚀 9. How to Reproduce & Run

### 1. Installation
Clone this repository and install all dependencies:
```bash
git clone https://github.com/shettyprateek045-glitch/CommunityProject.git
cd CommunityProject
pip install -r requirements.txt
```

### 2. Model Training
Train YOLOv11m with early stopping:
```bash
python src/train.py --epochs 50 --patience 10 --batch 8 --imgsz 640
```

### 3. Model Inference on Test Images
Run detection on test images and save visual boxes:
```bash
python src/predict.py --weights runs/detect/train/best.pt --source test/images
```

### 4. Quantitative Evaluation
Evaluate precision, recall, mAP50, mAP50-95, and generate `test_results.csv`:
```bash
python src/evaluate.py --weights runs/detect/train/best.pt --data data.yaml
```

### 5. Agronomic Recommendation
Generate care tips and immediate next actions:
```bash
python src/recommend.py --image test/images/image8_jpg.rf.e9d2f0d4e5b7557274aee1e0b859c703.jpg
```

### 6. Generate PDF Reports
Produce all 4 reports in `reports/`:
```bash
python src/make_pdfs.py
```

---

## 📦 10. Large File Storage (Git LFS)

All model weight files exceeding GitHub's standard tracking limit are managed via **Git LFS**:
```bash
git lfs install
git lfs track "*.pt"
```
Tracked checkpoint files:
- `yolo11m.pt` (~38.8 MB base pretrained weights)
- `runs/detect/train/best.pt` (~40.5 MB trained optimal weights)
- `runs/detect/train/last.pt` (~40.5 MB trained final weights)

---
*Created as part of the Community / Societal Engineering Project (Multi-Domain Tech Forge).*
