"""
Report Router: Implements POST /api/report/pdf and GET /api/report/pdf
Generates an agronomic decision advisory PDF report using ReportLab.
"""

import io
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

router = APIRouter(prefix="/api/report", tags=["Report Generator"])

class ReportRequest(BaseModel):
    farmer_name: Optional[str] = "Farmer Ramesh"
    location: Optional[str] = "Karnataka Farm Plot"
    lat: Optional[float] = 12.9716
    lon: Optional[float] = 77.5946
    acres: Optional[float] = 3.0
    budget_inr: Optional[float] = 65000.0
    irrigation: Optional[str] = "Drip Irrigation"
    soil_n: Optional[float] = 85.0
    soil_p: Optional[float] = 45.0
    soil_k: Optional[float] = 42.0
    soil_ph: Optional[float] = 6.5
    soil_type: Optional[str] = "Clay Loam"
    temperature: Optional[float] = 26.5
    humidity: Optional[float] = 65.0
    rainfall: Optional[float] = 950.0
    top_crops: Optional[list] = []

@router.post("/pdf")
async def generate_pdf_report(req: ReportRequest):
    """Generates an agronomic advisory PDF report and returns it as a binary stream."""
    try:
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
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            textColor=colors.HexColor('#1b5e20'),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor('#558b2f'),
            spaceAfter=12
        )
        section_style = ParagraphStyle(
            'SectionStyle',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            textColor=colors.HexColor('#2e7d32'),
            spaceBefore=10,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            textColor=colors.HexColor('#2d3748'),
            spaceAfter=4
        )

        elements = []

        # 1. Header Banner
        elements.append(Paragraph("Farmer Decision Support Report", title_style))
        elements.append(Paragraph(f"Generated on {datetime.now().strftime('%d %B %Y, %I:%M %p')} | Precision Agronomic Advisory", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2e7d32'), spaceAfter=10))

        # 2. Farm & Environmental Summary Table
        farm_data = [
            [
                Paragraph(f"<b>Location:</b> {req.location} ({req.lat:.4f}°N, {req.lon:.4f}°E)", body_style),
                Paragraph(f"<b>Land Area:</b> {req.acres:.1f} Acres", body_style)
            ],
            [
                Paragraph(f"<b>Soil Type:</b> {req.soil_type} (pH: {req.soil_ph:.1f})", body_style),
                Paragraph(f"<b>Seasonal Budget:</b> ₹{int(req.budget_inr):,}", body_style)
            ],
            [
                Paragraph(f"<b>Soil N-P-K:</b> N: {req.soil_n:.0f} | P: {req.soil_p:.0f} | K: {req.soil_k:.0f} kg/ha", body_style),
                Paragraph(f"<b>Irrigation Method:</b> {req.irrigation.title()}", body_style)
            ],
            [
                Paragraph(f"<b>Weather:</b> Temp: {req.temperature:.1f}°C | Humidity: {req.humidity:.0f}%", body_style),
                Paragraph(f"<b>Est. Rainfall:</b> {req.rainfall:.0f} mm/year", body_style)
            ]
        ]
        farm_table = Table(farm_data, colWidths=[270, 270])
        farm_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f8e9')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#c5e1a5')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e0e0e0')),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        elements.append(farm_table)
        elements.append(Spacer(1, 10))

        # 3. Top 3 Recommended Crops
        elements.append(Paragraph("Top 3 Recommended Crops (Agronomic & Financial Match)", section_style))
        crop_rows = [["Rank", "Crop Name", "Suitability", "Est. Yield", "Cost / Acre", "Gross Revenue", "Net Profit", "Risk"]]

        top_3 = req.top_crops[:3] if req.top_crops else []
        if not top_3:
            # Default placeholder rows if empty
            top_3 = [
                {"name": "Maize (Corn)", "suitability_pct": 55.1, "total_yield_qtl": 78.0, "cost_per_acre_inr": 16500, "total_revenue_inr": 183300, "net_profit_inr": 133800, "risk_badge": "Low"},
                {"name": "Wheat", "suitability_pct": 46.0, "total_yield_qtl": 57.0, "cost_per_acre_inr": 16500, "total_revenue_inr": 139650, "net_profit_inr": 90150, "risk_badge": "Low"},
                {"name": "Sunflower", "suitability_pct": 44.2, "total_yield_qtl": 25.5, "cost_per_acre_inr": 14000, "total_revenue_inr": 132600, "net_profit_inr": 90600, "risk_badge": "Low"}
            ]

        for idx, c in enumerate(top_3):
            crop_rows.append([
                f"#{idx+1}",
                str(c.get("name", "Crop")),
                f"{c.get('suitability_pct', 50):.1f}%",
                f"{c.get('total_yield_qtl', 0):.1f} qtl",
                f"₹{int(c.get('cost_per_acre_inr', 15000)):,}",
                f"₹{int(c.get('total_revenue_inr', 0)):,}",
                f"₹{int(c.get('net_profit_inr', 0)):,}",
                str(c.get("risk_badge", "Low"))
            ])

        crop_table = Table(crop_rows, colWidths=[35, 115, 65, 65, 70, 75, 75, 40])
        crop_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1b5e20')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 8.5),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('ALIGN', (1,1), (1,-1), 'LEFT'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e0')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f7fafc')]),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        elements.append(crop_table)
        elements.append(Spacer(1, 10))

        # 4. Crop Calendar & Nutrition Breakdown
        elements.append(Paragraph("Crop Calendar & Agronomic Milestones", section_style))
        cal_data = [
            ["Stage", "Timeline", "Actionable Guidance"],
            ["Sowing & Basal Dosing", "Day 0 - 15", "100% P (DAP) & K (MOP) + 33% Urea at field preparation."],
            ["Vegetative Growth", "Day 15 - 45", "First split Urea application after weeding; maintain root-zone moisture."],
            ["Flowering & Grain Filling", "Day 45 - 75", "Critical irrigation window; foliar micronutrient spray."],
            ["Harvest & Post-Harvest", "Day 75 - Maturity", "Crop dry-down, timely harvesting, and clean storage prep."]
        ]
        cal_table = Table(cal_data, colWidths=[130, 100, 310])
        cal_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2e7d32')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 8.5),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e0')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f7fafc')]),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        elements.append(cal_table)
        elements.append(Spacer(1, 14))

        # 5. Disclaimer Footer
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cbd5e0'), spaceAfter=6))
        elements.append(Paragraph(
            "<b>Advisory Notice:</b> This report is generated algorithmically using Random Forest predictive models, "
            "satellite weather forecasts (Open-Meteo), and historical APMC Mandi trends. Soil and climate recommendations "
            "are provided as advisory decision support. Consult your local agriculture extension officer before purchasing inputs.",
            body_style
        ))

        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=Farmer_Decision_Report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
