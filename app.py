"""
Farmer Decision Dashboard - Application Entry Point
Launches the upgraded FastAPI application via Uvicorn.
Supports:
  python app.py
  python app.py --port 5000
  python app.py --ssl (ad-hoc HTTPS for LAN mobile GPS testing)
  uvicorn app.main:app --reload
"""

import sys
import argparse
import uvicorn
from app.config import settings

def main():
    parser = argparse.ArgumentParser(description="Farmer Decision Dashboard (FastAPI Server)")
    parser.add_argument("--host", default=settings.host, help="Host address (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=settings.port, help="Port number (default: 5000)")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload on code changes")
    parser.add_argument("--ssl", action="store_true", help="Enable SSL dev mode for remote mobile GPS testing")
    args = parser.parse_args()

    ssl_keyfile = None
    ssl_certfile = None
    scheme = "https" if args.ssl else "http"

    print("=" * 78)
    print("  STARTING FARMER DECISION DASHBOARD (FASTAPI SERVER)")
    print(f"  Access live at: {scheme}://localhost:{args.port}")
    if not args.ssl:
        print("  [i] Note: Browser GPS Geolocation works seamlessly on http://localhost.")
        print("      For remote testing on mobile devices over LAN or tunnel, use ngrok or --ssl.")
    print("=" * 78)

    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        ssl_keyfile=ssl_keyfile,
        ssl_certfile=ssl_certfile
    )

if __name__ == "__main__":
    main()
