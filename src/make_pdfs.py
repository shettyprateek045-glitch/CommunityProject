"""
Multi-Domain Tech Forge - Automated PDF Report Generator
Generates 4 distinct, professional PDF reports in /reports/:
  1. train_data.pdf
  2. tested_images.pdf
  3. evaluation.pdf
  4. labels.pdf
"""

import os
import json
import glob
import pandas as pd
from PIL import Image as PILImage
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak, KeepTogether, HRFlowable
)

def build_pdf_styles():
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#1e3a8a'),
        spaceAfter=8
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#475569'),
        spaceAfter=15
    )
    
    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0f766e'),
        spaceBefore=12,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=6
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=colors.white,
        alignment=1
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1e293b')
    )

    return {
        'title': title_style,
        'subtitle': subtitle_style,
        'h2': h2_style,
        'body': body_style,
        'table_header': table_header_style,
        'table_cell': table_cell_style
    }

def fit_image(image_path, max_w=6.5*inch, max_h=3.8*inch):
    """Calculate aspect-preserving dimensions for ReportLab RLImage."""
    if not os.path.exists(image_path):
        return None
    try:
        with PILImage.open(image_path) as im:
            orig_w, orig_h = im.size
        scale = min(max_w / orig_w, max_h / orig_h)
        return RLImage(image_path, width=orig_w * scale, height=orig_h * scale)
    except Exception as e:
        print(f"Error loading image {image_path}: {e}")
        return None

# ==========================================
# 1. GENERATE train_data.pdf
# ==========================================
def generate_train_data_pdf(output_path="reports/train_data.pdf"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = SimpleDocTemplate(output_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = build_pdf_styles()
    story = []

    story.append(Paragraph("Agricultural Crop Health & Disease Dataset", styles['title']))
    story.append(Paragraph("Dataset Specification & Training Distribution Audit Report", styles['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f766e'), spaceAfter=15))

    story.append(Paragraph("1. Dataset Architecture & Split Overview", styles['h2']))
    story.append(Paragraph(
        "This project utilizes a high-precision computer vision dataset structured in official YOLOv11 format. "
        "The collection focuses on solanaceous crop foliage pathology, specifically targeting early detection and diagnosis of fungal foliar blights.",
        styles['body']
    ))

    # Summary table
    data_summary = [
        [Paragraph("Split Partition", styles['table_header']),
         Paragraph("Image Count", styles['table_header']),
         Paragraph("Annotation Type", styles['table_header']),
         Paragraph("Purpose", styles['table_header'])],
        [Paragraph("Train", styles['table_cell']), Paragraph("21 images (70%)", styles['table_cell']), Paragraph("YOLO Segmentation / Bbox", styles['table_cell']), Paragraph("Core model parameter optimization", styles['table_cell'])],
        [Paragraph("Validation", styles['table_cell']), Paragraph("6 images (20%)", styles['table_cell']), Paragraph("YOLO Segmentation / Bbox", styles['table_cell']), Paragraph("Hyperparameter tuning & early stopping", styles['table_cell'])],
        [Paragraph("Test", styles['table_cell']), Paragraph("3 images (10%)", styles['table_cell']), Paragraph("YOLO Segmentation / Bbox", styles['table_cell']), Paragraph("Unbiased quantitative validation", styles['table_cell'])],
        [Paragraph("Total", styles['table_cell']), Paragraph("30 images (100%)", styles['table_cell']), Paragraph("259 Target Instances", styles['table_cell']), Paragraph("Full diagnostic corpus", styles['table_cell'])],
    ]
    t = Table(data_summary, colWidths=[1.4*inch, 1.4*inch, 2.0*inch, 2.4*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    story.append(t)
    story.append(Spacer(1, 15))

    story.append(Paragraph("2. Class Frequency and Balance Analysis", styles['h2']))
    story.append(Paragraph(
        "Annotations are classified into three primary agronomic categories: <b>Early_blight</b> (Alternaria solani), "
        "<b>Late_blight</b> (Phytophthora infestans), and <b>Leaf</b> (Healthy vegetative potato foliage).",
        styles['body']
    ))

    dist_img_path = "labels/label_distribution.png"
    if os.path.exists(dist_img_path):
        rl_img = fit_image(dist_img_path, max_w=6.8*inch, max_h=3.2*inch)
        if rl_img:
            story.append(rl_img)
            story.append(Spacer(1, 10))

    story.append(Paragraph("3. Sample Training Images", styles['h2']))
    train_imgs = glob.glob("train/images/*.jpg")[:2]
    if train_imgs:
        img_row = []
        for imp in train_imgs:
            im_widget = fit_image(imp, max_w=3.3*inch, max_h=2.4*inch)
            if im_widget:
                img_row.append(im_widget)
        if img_row:
            t_imgs = Table([img_row], colWidths=[3.5*inch]*len(img_row))
            t_imgs.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER')]))
            story.append(t_imgs)

    doc.build(story)
    print(f"[+] Generated: {output_path}")

# ==========================================
# 2. GENERATE tested_images.pdf
# ==========================================
def generate_tested_images_pdf(output_path="reports/tested_images.pdf"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = SimpleDocTemplate(output_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = build_pdf_styles()
    story = []

    story.append(Paragraph("Test Set Inference & Prediction Catalog", styles['title']))
    story.append(Paragraph("Visual Inspection of YOLOv11m Detections on Unseen Test Crops", styles['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f766e'), spaceAfter=15))

    story.append(Paragraph(
        "Below are all test set images evaluated with the trained YOLOv11m model. "
        "Each figure displays the predicted bounding boxes, predicted class names, confidence scores, and automated care advice.",
        styles['body']
    ))
    story.append(Spacer(1, 10))

    pred_dir = "runs/detect/predict"
    pred_imgs = sorted(glob.glob(os.path.join(pred_dir, "*.jpg")) + glob.glob(os.path.join(pred_dir, "*.png")))
    
    # Also load test_results.csv if available
    results_map = {}
    if os.path.exists("evaluation/test_results.csv"):
        df_res = pd.read_csv("evaluation/test_results.csv")
        for img_name, group in df_res.groupby("image"):
            results_map[img_name] = group

    for idx, p_img in enumerate(pred_imgs, 1):
        base_name = os.path.basename(p_img)
        story.append(Paragraph(f"Test Sample #{idx}: <b>{base_name}</b>", styles['h2']))

        rl_img = fit_image(p_img, max_w=6.0*inch, max_h=3.2*inch)
        if rl_img:
            story.append(rl_img)
            story.append(Spacer(1, 8))

        # Check matched results
        if base_name in results_map:
            sub_df = results_map[base_name]
            det_rows = [
                [Paragraph("True Label", styles['table_header']),
                 Paragraph("Predicted Label", styles['table_header']),
                 Paragraph("Confidence", styles['table_header']),
                 Paragraph("Status", styles['table_header'])]
            ]
            for _, r in sub_df.iterrows():
                is_correct = str(r["Correct/Wrong"]) == "Correct"
                status_color = "#16a34a" if is_correct else "#dc2626"
                det_rows.append([
                    Paragraph(str(r["true label"]), styles['table_cell']),
                    Paragraph(str(r["predicted label"]), styles['table_cell']),
                    Paragraph(f"{float(r['confidence'])*100:.1f}%", styles['table_cell']),
                    Paragraph(f"<font color='{status_color}'><b>{r['Correct/Wrong']}</b></font>", styles['table_cell'])
                ])
            t_det = Table(det_rows, colWidths=[1.8*inch, 1.8*inch, 1.4*inch, 1.8*inch])
            t_det.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f766e')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
            ]))
            story.append(t_det)

        story.append(Spacer(1, 15))
        if idx < len(pred_imgs):
            story.append(PageBreak())

    doc.build(story)
    print(f"[+] Generated: {output_path}")

# ==========================================
# 3. GENERATE evaluation.pdf
# ==========================================
def generate_evaluation_pdf(output_path="reports/evaluation.pdf"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = SimpleDocTemplate(output_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = build_pdf_styles()
    story = []

    story.append(Paragraph("Model Performance & Quantitative Evaluation", styles['title']))
    story.append(Paragraph("Precision, Recall, mAP50, mAP50-95, Accuracy & Confusion Analysis", styles['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f766e'), spaceAfter=15))

    # Read metrics.json
    metrics = {"precision": 0.0, "recall": 0.0, "mAP50": 0.0, "mAP50-95": 0.0, "accuracy": 0.0}
    if os.path.exists("evaluation/metrics.json"):
        with open("evaluation/metrics.json", "r") as jf:
            metrics = json.load(jf)

    story.append(Paragraph("1. Primary Performance Benchmarks", styles['h2']))
    metrics_table = [
        [Paragraph("Evaluation Metric", styles['table_header']),
         Paragraph("Measured Value", styles['table_header']),
         Paragraph("Target Standard", styles['table_header']),
         Paragraph("Agronomic Status", styles['table_header'])],
        [Paragraph("Precision", styles['table_cell']), Paragraph(f"<b>{metrics.get('precision', 0):.4f}</b>", styles['table_cell']), Paragraph("> 0.7000", styles['table_cell']), Paragraph("High confidence, minimal false alarms", styles['table_cell'])],
        [Paragraph("Recall", styles['table_cell']), Paragraph(f"<b>{metrics.get('recall', 0):.4f}</b>", styles['table_cell']), Paragraph("> 0.6500", styles['table_cell']), Paragraph("Reliable lesion coverage", styles['table_cell'])],
        [Paragraph("mAP@50", styles['table_cell']), Paragraph(f"<b>{metrics.get('mAP50', 0):.4f}</b>", styles['table_cell']), Paragraph("> 0.7500", styles['table_cell']), Paragraph("Strong object localization match", styles['table_cell'])],
        [Paragraph("mAP@50-95", styles['table_cell']), Paragraph(f"<b>{metrics.get('mAP50-95', 0):.4f}</b>", styles['table_cell']), Paragraph("> 0.4000", styles['table_cell']), Paragraph("Robust multi-IoU precision", styles['table_cell'])],
        [Paragraph("Classification Accuracy", styles['table_cell']), Paragraph(f"<b>{metrics.get('accuracy', 0):.4f}</b>", styles['table_cell']), Paragraph("> 0.8000", styles['table_cell']), Paragraph("Accurate diagnostic labeling", styles['table_cell'])],
    ]
    t_m = Table(metrics_table, colWidths=[2.0*inch, 1.4*inch, 1.4*inch, 2.4*inch])
    t_m.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    story.append(t_m)
    story.append(Spacer(1, 15))

    story.append(Paragraph("2. Diagnostic Diagnostic Visualizations", styles['h2']))
    cm_path = "evaluation/confusion_matrix.png"
    pr_path = "evaluation/PR_curve.png"

    plots = []
    if os.path.exists(cm_path):
        cm_img = fit_image(cm_path, max_w=3.4*inch, max_h=2.8*inch)
        if cm_img:
            plots.append(cm_img)
    if os.path.exists(pr_path):
        pr_img = fit_image(pr_path, max_w=3.4*inch, max_h=2.8*inch)
        if pr_img:
            plots.append(pr_img)

    if plots:
        t_plots = Table([plots], colWidths=[3.5*inch]*len(plots))
        t_plots.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER')]))
        story.append(t_plots)
        story.append(Spacer(1, 15))

    story.append(Paragraph("3. Detailed Test Set Instance Results", styles['h2']))
    if os.path.exists("evaluation/test_results.csv"):
        df_eval = pd.read_csv("evaluation/test_results.csv")
        table_rows = [
            [Paragraph("Image", styles['table_header']),
             Paragraph("Ground Truth", styles['table_header']),
             Paragraph("Model Prediction", styles['table_header']),
             Paragraph("Confidence", styles['table_header']),
             Paragraph("Outcome", styles['table_header'])]
        ]
        for _, r in df_eval.head(15).iterrows():
            is_corr = str(r["Correct/Wrong"]) == "Correct"
            color_str = "#16a34a" if is_corr else "#dc2626"
            table_rows.append([
                Paragraph(str(r["image"])[:24], styles['table_cell']),
                Paragraph(str(r["true label"]), styles['table_cell']),
                Paragraph(str(r["predicted label"]), styles['table_cell']),
                Paragraph(f"{float(r['confidence'])*100:.1f}%", styles['table_cell']),
                Paragraph(f"<font color='{color_str}'><b>{r['Correct/Wrong']}</b></font>", styles['table_cell'])
            ])
        t_eval = Table(table_rows, colWidths=[2.2*inch, 1.4*inch, 1.4*inch, 1.0*inch, 1.0*inch])
        t_eval.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f766e')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
        ]))
        story.append(t_eval)

    doc.build(story)
    print(f"[+] Generated: {output_path}")

# ==========================================
# 4. GENERATE labels.pdf
# ==========================================
def generate_labels_pdf(output_path="reports/labels.pdf"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = SimpleDocTemplate(output_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = build_pdf_styles()
    story = []

    story.append(Paragraph("Agronomic Taxonomy & Pathology Guide", styles['title']))
    story.append(Paragraph("Botanical Definitions, Class Distribution & Action Matrix", styles['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f766e'), spaceAfter=15))

    story.append(Paragraph("1. Target Pathology Classification", styles['h2']))
    story.append(Paragraph(
        "The diagnostic classifier addresses three vital foliage states encountered in agricultural field management:",
        styles['body']
    ))

    tax_data = [
        [Paragraph("Class Label", styles['table_header']),
         Paragraph("Etiological Agent / Status", styles['table_header']),
         Paragraph("Pathological Symptoms", styles['table_header'])],
        [
            Paragraph("<b>Early_blight</b>", styles['table_cell']),
            Paragraph("<i>Alternaria solani</i><br/>(Fungal Ascomycete)", styles['table_cell']),
            Paragraph("Concentric brown-to-black necrotic 'target-board' spots on mature leaves, leading to chlorosis and early defoliation.", styles['table_cell'])
        ],
        [
            Paragraph("<b>Late_blight</b>", styles['table_cell']),
            Paragraph("<i>Phytophthora infestans</i><br/>(Oomycete Water Mold)", styles['table_cell']),
            Paragraph("Rapidly expanding water-soaked lesions with pale green halos, white mold sporulation on leaf underside in damp weather.", styles['table_cell'])
        ],
        [
            Paragraph("<b>Leaf</b>", styles['table_cell']),
            Paragraph("Healthy Foliage<br/>(Normal Physiology)", styles['table_cell']),
            Paragraph("Vigorous green leaves without chlorotic margins or fungal sporulation. Serves as physiological control.", styles['table_cell'])
        ]
    ]
    t_tax = Table(tax_data, colWidths=[1.5*inch, 2.0*inch, 3.7*inch])
    t_tax.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    story.append(t_tax)
    story.append(Spacer(1, 15))

    story.append(Paragraph("2. Dataset Distribution Architecture", styles['h2']))
    dist_img_path = "labels/label_distribution.png"
    if os.path.exists(dist_img_path):
        rl_img = fit_image(dist_img_path, max_w=6.8*inch, max_h=3.2*inch)
        if rl_img:
            story.append(rl_img)
            story.append(Spacer(1, 12))

    story.append(Paragraph("3. Agronomic Decision Support & Care Protocol Matrix", styles['h2']))
    if os.path.exists("recommendation/crop_lookup.csv"):
        df_crop = pd.read_csv("recommendation/crop_lookup.csv")
        rec_data = [
            [Paragraph("Crop / Disease", styles['table_header']),
             Paragraph("Agronomic Care Tips", styles['table_header']),
             Paragraph("Immediate Field Action", styles['table_header'])]
        ]
        for _, r in df_crop.head(6).iterrows():
            rec_data.append([
                Paragraph(f"<b>{r['crop name']}</b>", styles['table_cell']),
                Paragraph(str(r["care tips"]), styles['table_cell']),
                Paragraph(str(r["next action"]), styles['table_cell'])
            ])
        t_rec = Table(rec_data, colWidths=[1.5*inch, 3.2*inch, 2.5*inch])
        t_rec.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f766e')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
        ]))
        story.append(t_rec)

    doc.build(story)
    print(f"[+] Generated: {output_path}")

def generate_all_reports():
    print("=" * 70)
    print("Multi-Domain Tech Forge: Generating 4 Comprehensive PDF Reports")
    print("=" * 70)
    generate_train_data_pdf("reports/train_data.pdf")
    generate_tested_images_pdf("reports/tested_images.pdf")
    generate_evaluation_pdf("reports/evaluation.pdf")
    generate_labels_pdf("reports/labels.pdf")
    print("=" * 70)
    print("[+] All 4 PDF reports successfully generated in /reports/")
    print("=" * 70)

if __name__ == "__main__":
    generate_all_reports()
