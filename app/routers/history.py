"""
History & Export Router: Implements GET, DELETE, and bulk operations for search/recommendation history,
and POST /api/export-pdf.
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Request, Response, Query, Depends
from services.history import (
    get_farmer_history,
    get_run_by_id,
    delete_run_by_id,
    bulk_delete_runs,
    clear_history,
    create_share_link,
    get_share_link,
    revoke_share_link
)
from services.export_pdf import generate_advisory_pdf
from app.dependencies import get_current_user_optional
from app.models.user import User

router = APIRouter(prefix="/api", tags=["History & PDF Export"])

@router.get("/history/runs")
@router.get("/history")
async def api_history(
    q: Optional[str] = Query(None, description="Search query for crop or village"),
    crop: Optional[str] = Query(None, description="Filter by crop name"),
    location: Optional[str] = Query(None, description="Filter by location/village"),
    start_date: Optional[str] = Query(None, description="Filter by start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="Filter by end date YYYY-MM-DD"),
    limit: int = Query(50, ge=1, le=200),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    GET /api/history: Fetches farmer advisory runs with search, crop/location/date filters.
    """
    try:
        user_id = str(user.id) if user else "guest"
        hist = get_farmer_history(
            user_id=user_id,
            q=q,
            crop=crop,
            location=location,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
        return hist
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

@router.delete("/history/clear")
async def api_history_clear(
    timeframe: str = Query("all", description="Timeframe: 'hour', 'today', or 'all'"),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    DELETE /api/history/clear?timeframe=hour|today|all
    Deletes runs matching the given timeframe for the user.
    """
    try:
        user_id = str(user.id) if user else "guest"
        count = clear_history(timeframe=timeframe, user_id=user_id)
        return {"status": "success", "deleted_count": count, "timeframe": timeframe}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear history: {str(e)}")

@router.post("/history/bulk-delete")
async def api_history_bulk_delete(
    request: Request,
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    POST /api/history/bulk-delete
    Body: { "ids": [1, 2, 3] }
    """
    try:
        body = await request.json()
        ids = body.get("ids", [])
        if not ids:
            raise HTTPException(status_code=400, detail="No run IDs provided for deletion.")
        int_ids = [int(i) for i in ids]
        user_id = str(user.id) if user else "guest"
        count = bulk_delete_runs(int_ids, user_id=user_id)
        return {"status": "success", "deleted_count": count}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk delete failed: {str(e)}")

@router.delete("/history/{run_id}")
async def api_history_delete(
    run_id: int,
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    DELETE /api/history/{run_id}: Deletes a single history entry.
    """
    try:
        user_id = str(user.id) if user else "guest"
        deleted = delete_run_by_id(run_id, user_id=user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="History record not found or already deleted.")
        return {"status": "success", "deleted_id": run_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

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

# -----------------------------------------------------------------------------
# Public Share Endpoints
# -----------------------------------------------------------------------------
@router.post("/share/create")
async def api_share_create(request: Request):
    """
    POST /api/share/create
    Body: { "run_id": 123, "summary": {...} }
    Generates a secure random share token and returns public URL.
    """
    try:
        body = await request.json()
        run_id = body.get("run_id")
        summary = body.get("summary") or {}
        token = create_share_link(run_id=int(run_id) if run_id else None, summary_data=summary)
        return {
            "status": "success",
            "token": token,
            "share_url": f"/share/{token}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Share link generation failed: {str(e)}")

@router.get("/share/{token}")
async def api_share_get(token: str):
    """
    GET /api/share/{token}: Returns public read-only crop advisory summary.
    """
    record = get_share_link(token)
    if not record or not record.get("is_active"):
        raise HTTPException(status_code=404, detail="Shared advisory link is invalid, expired, or was revoked.")
    return {"status": "success", "share": record}

@router.post("/share/revoke")
async def api_share_revoke(request: Request):
    """
    POST /api/share/revoke: Revokes public access to a shared link token.
    Body: { "token": "xyz" }
    """
    try:
        body = await request.json()
        token = body.get("token")
        if not token:
            raise HTTPException(status_code=400, detail="Token parameter is required.")
        success = revoke_share_link(token)
        return {"status": "success", "revoked": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Revoke operation failed: {str(e)}")

