# -*- coding: utf-8 -*-
"""
test_demo_suite.py
Runs the complete test suite against all 10 demo images in demo_test_images/
Prints the exact output returned by the system for each image.
"""

import os
from app.services.soil_service import predict_soil_image
from app.services.leaf_disease_service import analyze_leaf_disease

print("=" * 80)
print("     VERIFYING 5 DEMO SOIL IMAGES (STEP 3 & STEP 7 SOIL UPLOAD)")
print("=" * 80)

soil_dir = "demo_test_images/soil"
for fname in sorted(os.listdir(soil_dir)):
    fpath = os.path.join(soil_dir, fname)
    with open(fpath, "rb") as f:
        res = predict_soil_image(f.read())
    is_soil = res.get("is_soil")
    st = res.get("soil_type")
    conf = res.get("confidence", 0)
    print(f"\n[FILE]: {fname}")
    print(f"  -> Valid Soil Detected: {is_soil}")
    print(f"  -> Predicted Soil Type: {st}")
    print(f"  -> Confidence Score:    {conf:.1f}%")
    print(f"  -> Estimated Nutrients: N={res.get('estimated_n', 'N/A')} kg/ha | P={res.get('estimated_p', 'N/A')} kg/ha | K={res.get('estimated_k', 'N/A')} kg/ha | pH={res.get('estimated_ph', 'N/A')}")
    print(f"  -> Management Advisory: {res.get('management_tip', res.get('message', 'N/A'))[:100]}...")

print("\n" + "=" * 80)
print("  VERIFYING 5 DEMO LEAF DISEASE IMAGES (STEP 7 & FOLIAR SCANNER)")
print("=" * 80)

disease_dir = "demo_test_images/disease"
for fname in sorted(os.listdir(disease_dir)):
    fpath = os.path.join(disease_dir, fname)
    with open(fpath, "rb") as f:
        res = analyze_leaf_disease(f.read())
    is_leaf = res.get("is_leaf")
    dis = res.get("disease_name", res.get("class_key"))
    conf = res.get("confidence_pct", res.get("confidence", 0) * 100)
    status = res.get("status")
    print(f"\n[FILE]: {fname}")
    print(f"  -> Valid Foliage Detected: {is_leaf}")
    print(f"  -> Detection Status:       {status}")
    print(f"  -> Diagnosed Condition:    {dis}")
    print(f"  -> Confidence Score:       {conf:.1f}%")
    print(f"  -> Pathogen Type:          {res.get('pathogen', 'None')}")
    print(f"  -> Severity Level:         {res.get('severity', 'None')}")
    print(f"  -> Treatment Summary:      {res.get('treatment_guidance', res.get('symptoms', 'None'))[:100]}...")

print("\n" + "=" * 80)
print("     DEMO VERIFICATION SUITE COMPLETE")
print("=" * 80)
