"""
History & Export Router: Implements GET /api/history and POST /api/export-pdf
"""

from fastapi import APIRouter, HTTPException, Request, Response
from services.history import get_farmer_history, get_run_by_id
from services.export_pdf import generate_advisory_pdf

router = APIRouter(prefix="/api", tags=["History & PDF Export"])

@router.get("/history")
async def api_history(limit: int = 20):
    """GET /api/history: Fetches recent farmer advisory runs from SQLite."""
    try:
        hist = get_farmer_history(limit=limit)
        return {"status": "success", "history": hist}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

@router.get("/history/{run_id}")
async def api_history_item(run_id: int):
    """GET /api/history/{run_id}: Fetches a specific run record."""
    item = get_run_by_id(run_id)
    if not item:
        raise HTTPException(status_code=404, detail="Advisory record not found")
    return {"status": "success", "record": item}

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
