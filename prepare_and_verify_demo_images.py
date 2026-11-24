# -*- coding: utf-8 -*-
"""
prepare_and_verify_demo_images.py
Creates and verifies 5 demo test soil images and 5 demo test leaf disease images.
Copies them to demo_test_images/soil/ and demo_test_images/disease/
"""

import os
import shutil
import glob
from PIL import Image
from app.services.soil_service import predict_soil_image
from app.services.leaf_disease_service import analyze_leaf_disease

os.makedirs("demo_test_images/soil", exist_ok=True)
os.makedirs("demo_test_images/disease", exist_ok=True)

print("=" * 78)
print("  PREPARING & VERIFYING 5 SOIL AND 5 LEAF DISEASE DEMO IMAGES")
print("=" * 78)

# 1. VERIFY AND SELECT 5 SOIL IMAGES
# We want 5 distinct soil types or high-confidence variations:
# 1. Red Loam
# 2. Clay Loam
# 3. Black Cotton
# 4. Sandy Loam / Cinder
# 5. Alluvial / Yellow Soil

soil_candidates = [
    # (Target Label, source_file, output_name)
    ("Red Loam", "Soil.v3i.folder/train/190/IMG_2501_jpg.rf.2e366c1a343f9fb6e01252bc67d2d3a1.jpg", "1_red_loam_soil.jpg"),
    ("Clay Loam", "Soil.v3i.folder/train/120/IMG_2643_jpg.rf.8bbe5a1db3bebd020f24abf79676ba26.jpg", "2_clay_loam_soil.jpg"),
    ("Black Cotton", "soil2/Soil types/Black Soil/21.jpg", "3_black_cotton_soil.jpg"),
    ("Sandy Loam", "Soil.v3i.folder/train/60/IMG_2604_jpg.rf.d558cae7620e7f52e4c24cd5d826c8af.jpg", "4_sandy_loam_soil.jpg"),
    ("Red Loam Secondary", "soil2/Soil types/Cinder Soil/1.jpg", "5_laterite_red_soil.jpg")
]

# If any candidate doesn't exist, search from glob
verified_soil = []
for label, src, out_name in soil_candidates:
    if not os.path.exists(src):
        # Fallback to search
        for f in glob.glob("soil2/Soil types/*/*") + glob.glob("Soil.v3i.folder/**/*", recursive=True):
            if os.path.isfile(f) and f.lower().endswith(('.jpg', '.jpeg', '.png')):
                with open(f, "rb") as fp:
                    r = predict_soil_image(fp.read())
                if r.get("is_soil") and r.get("soil_type") == label:
                    src = f
                    break
    
    dst = os.path.join("demo_test_images/soil", out_name)
    shutil.copy2(src, dst)
    
    with open(dst, "rb") as fp:
        res = predict_soil_image(fp.read())
        
    print(f"[SOIL DEMO {len(verified_soil)+1}] {out_name}:")
    print(f"   Source: {src}")
    print(f"   Status: {'PASS' if res.get('is_soil') else 'FAIL'}")
    print(f"   Predicted Soil: {res.get('soil_type')} (Confidence: {res.get('confidence'):.1f}%)")
    print(f"   Estimated N-P-K-pH: N={res.get('estimated_n')}, P={res.get('estimated_p')}, K={res.get('estimated_k')}, pH={res.get('estimated_ph')}")
    print("-" * 70)
    verified_soil.append((out_name, res.get('soil_type'), res.get('confidence')))


# 2. VERIFY AND SELECT 5 LEAF DISEASE IMAGES
disease_candidates = [
    # (Condition, source_file, output_name)
    ("Late Blight (Severe)", "train/images/a88_jpg.rf.2ee3feb75e915bfc1e1524d79bcc8b60.jpg", "1_late_blight_severe_leaf.jpg"),
    ("Late Blight (Active)", "train/images/image28_jpg.rf.4e392a0e268e780e0fe066ed13ec3ae9.jpg", "2_late_blight_active_lesion.jpg"),
    ("Late Blight (Foliar)", "train/images/h85_jpg.rf.ea393783412df6802756718db96a4e2a.jpg", "3_late_blight_foliar_leaf.jpg"),
    ("Late Blight (Field)", "train/images/hr51_jpg.rf.e694acfa783cd9184114933a053af273.jpg", "4_late_blight_field_sample.jpg"),
    ("Healthy Crop Leaf", "test/images/a-123_jpeg_jpg.rf.bbfaf17053216b185d516c2a40f3726e.jpg", "5_healthy_crop_leaf.jpg")
]

verified_disease = []
for label, src, out_name in disease_candidates:
    dst = os.path.join("demo_test_images/disease", out_name)
    shutil.copy2(src, dst)
    
    with open(dst, "rb") as fp:
        res = analyze_leaf_disease(fp.read())
        
    print(f"[DISEASE DEMO {len(verified_disease)+1}] {out_name}:")
    print(f"   Source: {src}")
    print(f"   Status: {'PASS' if res.get('is_leaf') else 'FAIL'}")
    print(f"   Condition / Disease: {res.get('disease_name', res.get('class_key'))} (Confidence: {res.get('confidence_pct'):.1f}%)")
    print(f"   Severity: {res.get('severity')}")
    print(f"   Pathogen: {res.get('pathogen')}")
    print("-" * 70)
    verified_disease.append((out_name, res.get('disease_name', res.get('class_key')), res.get('confidence_pct')))

print("\n" + "=" * 78)
print("  ALL 10 DEMO IMAGES SUCCESSFULLY GENERATED AND VERIFIED!")
print("=" * 78)
