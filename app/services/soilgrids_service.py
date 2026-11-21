"""
ISRIC SoilGrids 2.0 Integration Service
Queries the official ISRIC SoilGrids REST API to fetch location-specific
physical and chemical soil estimates (pH, Sand %, Clay %, Organic Carbon).
All outputs are explicitly labeled as estimates to be refined by Soil Health Cards.
"""

import sqlite3
import time
import json
import httpx
from typing import Dict, Any, Optional

CACHE_DB = "data/agro_cache.db"

def _init_db():
    import os
    os.makedirs("data", exist_ok=True)
    conn = sqlite3.connect(CACHE_DB)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS soilgrids_cache (
            key TEXT PRIMARY KEY,
            data TEXT,
            timestamp REAL
        )
    """)
    conn.commit()
    conn.close()

_init_db()

async def fetch_soilgrids_estimate(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetches real physical soil properties from ISRIC SoilGrids REST API v2.0.
    Properties queried:
      - phh2o: Soil pH in H2O x 10 (0-5cm depth)
      - sand: Sand content in g/kg (0-5cm depth)
      - clay: Clay content in g/kg (0-5cm depth)
      - soc: Soil Organic Carbon in dg/kg (0-5cm depth)
    """
    cache_key = f"{round(lat, 2)}_{round(lon, 2)}"
    conn = sqlite3.connect(CACHE_DB)
    c = conn.cursor()
    c.execute("SELECT data, timestamp FROM soilgrids_cache WHERE key = ?", (cache_key,))
    row = c.fetchone()
    if row and (time.time() - row[1]) < 86400 * 30:  # Cache for 30 days
        conn.close()
        return json.loads(row[0])
    conn.close()

    url = (
        f"https://rest.isric.org/soilgrids/v2.0/properties/query?"
        f"lat={lat}&lon={lon}"
        f"&property=phh2o&property=sand&property=clay&property=soc"
        f"&depth=0-5cm"
    )
    headers = {"User-Agent": "FarmerDecisionDashboard/2.1 (contact: agro-precision@community-project.org)"}

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                d = resp.json()
                layers = d.get("properties", {}).get("layers", [])
                extracted = {}
                for layer in layers:
                    name = layer.get("name")
                    depths = layer.get("depths", [])
                    if depths:
                        val = depths[0].get("values", {}).get("mean")
                        extracted[name] = val

                # Conversions per ISRIC SoilGrids 2.0 specification:
                # phh2o is in pH x 10
                raw_ph = extracted.get("phh2o")
                ph_val = round(raw_ph / 10.0, 1) if raw_ph is not None else 6.8

                # sand & clay are in g/kg (divide by 10 to get %)
                raw_sand = extracted.get("sand")
                sand_pct = round(raw_sand / 10.0, 1) if raw_sand is not None else 45.0

                raw_clay = extracted.get("clay")
                clay_pct = round(raw_clay / 10.0, 1) if raw_clay is not None else 28.0

                # soc is in dg/kg (decigrams per kg = g/kg / 10)
                raw_soc = extracted.get("soc")
                soc_g_kg = round(raw_soc / 10.0, 1) if raw_soc is not None else 18.0

                # Determine soil texture classification
                if clay_pct >= 35.0:
                    soil_type_estimate = "Black Cotton"
                elif sand_pct >= 60.0:
                    soil_type_estimate = "Sandy Loam"
                elif ph_val < 6.0:
                    soil_type_estimate = "Red Loam"
                elif clay_pct >= 25.0:
                    soil_type_estimate = "Clay Loam"
                else:
                    soil_type_estimate = "Alluvial"

                # Estimate N, P, K from organic carbon and soil texture
                # Nitrogen is closely correlated with Soil Organic Carbon:
                est_n = round(float(np_clip(soc_g_kg * 4.2, 40.0, 140.0)), 1)
                est_p = round(float(np_clip(35.0 - (clay_pct * 0.2), 15.0, 60.0)), 1)
                est_k = round(float(np_clip(clay_pct * 1.8 + 20.0, 30.0, 120.0)), 1)

                result = {
                    "status": "success",
                    "source": "ISRIC SoilGrids 250m Global Satellite/Survey Estimate",
                    "is_estimate": True,
                    "ph": ph_val,
                    "soil_ph": ph_val,
                    "sand_pct": sand_pct,
                    "clay_pct": clay_pct,
                    "soc_g_kg": soc_g_kg,
                    "organic_carbon_g_kg": soc_g_kg,
                    "soil_type": soil_type_estimate,
                    "soil_texture_class": soil_type_estimate,
                    "estimated_n": est_n,
                    "estimated_p": est_p,
                    "estimated_k": est_k,
                    "disclaimer": "Estimate based on ISRIC SoilGrids 250m survey. Please confirm with your local Soil Health Card test values."
                }

                # Save to SQLite cache
                conn = sqlite3.connect(CACHE_DB)
                c = conn.cursor()
                c.execute("INSERT OR REPLACE INTO soilgrids_cache (key, data, timestamp) VALUES (?, ?, ?)",
                          (cache_key, json.dumps(result), time.time()))
                conn.commit()
                conn.close()

                return result
    except Exception as e:
        print(f"[SOILGRIDS API WARNING] {e}")

    # Fallback default regional profile if SoilGrids is temporarily unreachable
    return {
        "status": "fallback",
        "source": "Regional Agro-Climatic Baseline Estimate",
        "is_estimate": True,
        "ph": 7.2,
        "sand_pct": 42.0,
        "clay_pct": 32.0,
        "soc_g_kg": 16.5,
        "soil_type": "Clay Loam",
        "estimated_n": 80.0,
        "estimated_p": 40.0,
        "estimated_k": 45.0,
        "disclaimer": "Regional estimate. Please refine using your Soil Health Card test values."
    }

def np_clip(val: float, low: float, high: float) -> float:
    return max(low, min(high, val))
