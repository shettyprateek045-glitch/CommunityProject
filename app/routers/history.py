"""
History & Export Router: Implements GET /api/history and POST /api/export-pdf
"""

from fastapi import APIRouter, HTTPException, Request, Response
from services.history import get_farmer_history, get_run_by_id
from services.export_pdf import generate_advisory_pdf

router = APIRouter(prefix="/api", tags=["History & PDF Export"])

@router.get("/history/runs")
@router.get("/history")
async def api_history(limit: int = 20):
    """GET /api/history or /api/history/runs: Fetches recent farmer advisory runs from SQLite."""
    try:
        hist = get_farmer_history(limit=limit)
        return hist
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

@router.get("/history/{run_id}")
async def api_history_item(run_id: int):
    """GET /api/history/{run_id}: Fetches a specific run record."""
    item = get_run_by_id(run_id)
    if not item:
        raise HTTPException(status_code=404, detail="Advisory record not found")
    return {"status": "success", "record": item}

@router.post("/history/compare")
async def api_history_compare(request: Request):
    """
    POST /api/history/compare: Compares two or more past runs side-by-side:
    location, land acres, budget, top crops (cost, revenue, net profit, suitability).
    """
    try:
        body = await request.json()
        run_ids = body.get("run_ids", [])
        if not run_ids or len(run_ids) < 2:
            raise HTTPException(status_code=400, detail="Please select at least 2 runs to compare.")

        compared_runs = []
        for rid in run_ids:
            item = get_run_by_id(int(rid))
            if item:
                top_crops = item.get("top_crops", [])
                top_crop = top_crops[0] if top_crops else {}
                acres_val = float(item["inputs"].get("land_acres") or 1.0)
                profit_val = float(top_crop.get("net_profit_inr", 0))
                profit_per_ac = round(profit_val / max(0.1, acres_val), 0)
                compared_runs.append({
                    "run_id": item["id"],
                    "timestamp": item["timestamp"],
                    "location_name": item["location_name"],
                    "lat": item.get("lat"),
                    "lon": item.get("lon"),
                    "land_acres": acres_val,
                    "budget": item["inputs"].get("budget_inr", 0),
                    "soil_type": item["inputs"].get("soil_type", "Clay Loam"),
                    "irrigation": item["inputs"].get("irrigation", "drip"),
                    "soil_npk": f"N:{item['inputs'].get('soil_n',0)} P:{item['inputs'].get('soil_p',0)} K:{item['inputs'].get('soil_k',0)} pH:{item['inputs'].get('soil_ph',6.5)}",
                    "top_crop_name": top_crop.get("display_name", "N/A"),
                    "top_crop_kannada": top_crop.get("kannada_name", ""),
                    "suitability_pct": top_crop.get("suitability_pct", 0),
                    "total_cost": top_crop.get("total_cost_inr", 0),
                    "total_revenue": top_crop.get("total_revenue_inr", 0),
                    "net_profit": profit_val,
                    "profit_per_acre": profit_per_ac,
                    "all_top_crops": [
                        {
                            "name": c.get("display_name"),
                            "profit": c.get("net_profit_inr"),
                            "cost": c.get("total_cost_inr"),
                            "suitability": c.get("suitability_pct")
                        }
                        for c in top_crops[:3]
                    ]
                })

        return {
            "status": "success",
            "count": len(compared_runs),
            "runs": compared_runs
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")

@router.post("/export-pdf")
async def api_export_pdf(request: Request):
    """POST /api/export-pdf: Generates publication-grade ReportLab PDF advisory."""
    try:
        data = await request.json()
        pdf_bytes = generate_advisory_pdf(data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=Farmer_Advisory_Report.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")
