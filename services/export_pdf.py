"""
PDF Export Service: Generates formal publication-grade Farmer Decision Advisory Reports
using ReportLab. Includes inputs, weather conditions, top recommended crops,
economic profit analysis, fertilizer advisory, and risk ratings.
"""

import os
import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_advisory_pdf(data):
    """
    Generates a PDF byte stream from recommendation and weather data.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#1b5e20")   # Deep Forest Green
    accent_color = colors.HexColor("#2e7d32")    # Leaf Green
    light_bg = colors.HexColor("#f1f8e9")        # Pale Green

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=primary_color,
        alignment=0
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#555555"),
        alignment=0
    )
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#222222")
    )
    bold_body = ParagraphStyle(
        "BoldBody",
        parent=body_style,
        fontName="Helvetica-Bold"
    )

    elements = []

    # 1. Header Banner
    elements.append(Paragraph("🌾 FARMER DECISION SUPPORT ADVISORY REPORT", title_style))
    elements.append(Paragraph(f"Multi-Domain Tech Forge | Generated: {datetime.now().strftime('%B %d, %Y - %I:%M %p')}", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceAfter=12, spaceBefore=6))

    # 2. Location & Field Summary Table
    location_name = data.get("location_name") or data.get("location", "Local Farming Area")
    inputs = data.get("inputs") or {
        "land_acres": data.get("land_acres", 2),
        "soil_type": data.get("soil", {}).get("type", "Clay Loam") if isinstance(data.get("soil"), dict) else data.get("soil_type", "Clay Loam"),
        "irrigation": data.get("irrigation", "Drip"),
        "soil_n": data.get("soil", {}).get("n", 80) if isinstance(data.get("soil"), dict) else data.get("soil_n", 80),
        "soil_p": data.get("soil", {}).get("p", 40) if isinstance(data.get("soil"), dict) else data.get("soil_p", 40),
        "soil_k": data.get("soil", {}).get("k", 40) if isinstance(data.get("soil"), dict) else data.get("soil_k", 40),
        "soil_ph": data.get("soil", {}).get("ph", 6.5) if isinstance(data.get("soil"), dict) else data.get("soil_ph", 6.5),
        "budget_inr": data.get("budget_inr", 50000)
    }
    weather = data.get("weather", {}).get("current", {})

    info_data = [
        [
            Paragraph("<b>Farm Location:</b>", body_style), Paragraph(str(location_name), body_style),
            Paragraph("<b>Land Size:</b>", body_style), Paragraph(f"{inputs.get('land_acres', 2)} Acres", body_style)
        ],
        [
            Paragraph("<b>Soil Type:</b>", body_style), Paragraph(str(inputs.get("soil_type", "Clay Loam")), body_style),
            Paragraph("<b>Irrigation Facility:</b>", body_style), Paragraph(str(inputs.get("irrigation", "Drip")).capitalize(), body_style)
        ],
        [
            Paragraph("<b>Soil N-P-K (kg/ha):</b>", body_style), Paragraph(f"N:{inputs.get('soil_n', 80)} | P:{inputs.get('soil_p', 40)} | K:{inputs.get('soil_k', 40)}", body_style),
            Paragraph("<b>Soil pH:</b>", body_style), Paragraph(f"{inputs.get('soil_ph', 6.5)}", body_style)
        ],
        [
            Paragraph("<b>Current Weather:</b>", body_style), Paragraph(f"{weather.get('temperature', 26.5)}°C, Humidity: {weather.get('humidity', 65)}%", body_style),
            Paragraph("<b>Working Budget:</b>", body_style), Paragraph(f"₹{inputs.get('budget_inr', 50000):,.0f}", body_style)
        ]
    ]

    t_info = Table(info_data, colWidths=[110, 160, 110, 160])
    t_info.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), light_bg),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#c8e6c9")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e8f5e9")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_info)
    elements.append(Spacer(1, 10))

    # 3. Top 5 Recommended Crops Table
    elements.append(Paragraph("1. Top Ranked Crop Recommendations & Financial Projection", section_heading))
    
    crops = data.get("top_crops", [])
    crop_table_data = [
        [
            Paragraph("<b>Rank & Crop</b>", bold_body),
            Paragraph("<b>Suitability</b>", bold_body),
            Paragraph("<b>Yield (Qtl)</b>", bold_body),
            Paragraph("<b>Cost (₹)</b>", bold_body),
            Paragraph("<b>Revenue (₹)</b>", bold_body),
            Paragraph("<b>Net Profit (₹)</b>", bold_body),
            Paragraph("<b>Risk</b>", bold_body)
        ]
    ]

    for rank, c in enumerate(crops[:5], 1):
        risk_color = "#2e7d32" if c["risk_badge"] == "Low" else ("#e65100" if c["risk_badge"] == "Medium" else "#c62828")
        crop_table_data.append([
            Paragraph(f"<b>#{rank} {c['display_name']}</b><br/><font color='#666' size=7>{c.get('kannada_name','')}</font>", body_style),
            Paragraph(f"<b>{c['suitability_pct']}%</b>", body_style),
            Paragraph(f"{c['total_yield_qtl']}", body_style),
            Paragraph(f"₹{c['total_cost_inr']:,.0f}", body_style),
            Paragraph(f"₹{c['total_revenue_inr']:,.0f}", body_style),
            Paragraph(f"<b><font color='#1b5e20'>₹{c['net_profit_inr']:,.0f}</font></b>", body_style),
            Paragraph(f"<font color='{risk_color}'><b>{c['risk_badge']}</b></font>", body_style)
        ])

    t_crops = Table(crop_table_data, colWidths=[120, 65, 65, 75, 75, 85, 55])
    t_crops.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8f5e9")),
        ("LINEBELOW", (0, 0), (-1, 0), 1.5, primary_color),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dddddd")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ALIGN", (1, 1), (-1, -1), "CENTER")
    ]))
    elements.append(t_crops)
    elements.append(Spacer(1, 10))

    # 4. Tailored Field Agronomic & Fertilizer Advisory
    elements.append(Paragraph("2. Agronomic Insights & Nutrient Management Guide", section_heading))
    if crops:
        top_crop = crops[0]
        elements.append(Paragraph(f"<b>Primary Focus Crop: {top_crop['display_name']} ({top_crop.get('kannada_name','')})</b>", bold_body))
        
        # Reasons
        elements.append(Paragraph("<b>Why this crop is recommended:</b>", body_style))
        for r in top_crop.get("reasons", []):
            elements.append(Paragraph(f"• {r}", body_style))
        elements.append(Spacer(1, 4))

        # Fertilizer
        elements.append(Paragraph("<b>Fertilizer & Soil Nutrient Balancing:</b>", body_style))
        for f in top_crop.get("fertilizer_advice", []):
            if isinstance(f, dict):
                f_text = f"<b>{f.get('nutrient', 'Nutrient')} ({f.get('status', 'info').upper()}):</b> {f.get('advice', '')}"
            else:
                f_text = str(f)
            elements.append(Paragraph(f"• {f_text}", body_style))
        elements.append(Spacer(1, 4))

        # Calendar
        elements.append(Paragraph("<b>Crop Growth & Action Calendar:</b>", body_style))
        cal_data = [["Growth Phase", "Timeline", "Action Protocol"]]
        for stage in top_crop.get("calendar", []):
            cal_data.append([stage["stage"], stage["days"], stage["action"]])
        
        t_cal = Table(cal_data, colWidths=[140, 110, 290])
        t_cal.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f8e9")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        elements.append(t_cal)

    elements.append(Spacer(1, 12))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#aaaaaa"), spaceAfter=6))
    elements.append(Paragraph("<b>Notice:</b> Economic figures and crop recommendations are computational estimates based on machine learning models and Agmarknet Mandi benchmarks. Field trials and local Krishi Vigyan Kendra (KVK) consultation are recommended before large-scale sowing.", subtitle_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
