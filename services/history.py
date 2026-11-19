"""
Farmer Run History Management (SQLite).
Saves farmer runs, queries past runs, and supports comparison.
"""

import sqlite3
import json
import time

DB_PATH = "data/farmer_history.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS farmer_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            location_name TEXT,
            lat REAL,
            lon REAL,
            land_acres REAL,
            soil_n REAL,
            soil_p REAL,
            soil_k REAL,
            soil_ph REAL,
            soil_type TEXT,
            irrigation TEXT,
            budget REAL,
            top_crops_json TEXT,
            weather_json TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

def save_farmer_run(data):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    inputs = data.get("inputs", {})
    location = data.get("location_name", "Farming Plot")
    lat = float(data.get("lat", 15.45))
    lon = float(data.get("lon", 75.00))

    c.execute("""
        INSERT INTO farmer_runs (
            timestamp, location_name, lat, lon, land_acres,
            soil_n, soil_p, soil_k, soil_ph, soil_type,
            irrigation, budget, top_crops_json, weather_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ts,
        location,
        lat,
        lon,
        float(inputs.get("land_acres", 2.0)),
        float(inputs.get("soil_n", 80.0)),
        float(inputs.get("soil_p", 40.0)),
        float(inputs.get("soil_k", 40.0)),
        float(inputs.get("soil_ph", 6.5)),
        str(inputs.get("soil_type", "Clay Loam")),
        str(inputs.get("irrigation", "drip")),
        float(inputs.get("budget_inr", 50000.0)),
        json.dumps(data.get("top_crops", [])),
        json.dumps(data.get("weather", {}).get("current", {}))
    ))
    run_id = c.lastrowid
    conn.commit()
    conn.close()
    return run_id

def get_farmer_history(limit=15):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT id, timestamp, location_name, land_acres, budget, top_crops_json, irrigation, soil_type
        FROM farmer_runs
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = c.fetchall()
    conn.close()

    history = []
    for r in rows:
        top_crops = json.loads(r[5]) if r[5] else []
        top_name = top_crops[0]["display_name"] if top_crops else "Unknown"
        top_profit = top_crops[0]["net_profit_inr"] if top_crops else 0
        history.append({
            "id": r[0],
            "timestamp": r[1],
            "location_name": r[2],
            "land_acres": r[3],
            "budget": r[4],
            "top_crop": top_name,
            "top_profit": top_profit,
            "irrigation": r[6],
            "soil_type": r[7],
            "crops_count": len(top_crops)
        })
    return history

def get_run_by_id(run_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT id, timestamp, location_name, lat, lon, land_acres,
               soil_n, soil_p, soil_k, soil_ph, soil_type,
               irrigation, budget, top_crops_json, weather_json
        FROM farmer_runs
        WHERE id = ?
    """, (run_id,))
    r = c.fetchone()
    conn.close()
    if not r:
        return None
    return {
        "id": r[0],
        "timestamp": r[1],
        "location_name": r[2],
        "lat": r[3],
        "lon": r[4],
        "inputs": {
            "land_acres": r[5],
            "soil_n": r[6],
            "soil_p": r[7],
            "soil_k": r[8],
            "soil_ph": r[9],
            "soil_type": r[10],
            "irrigation": r[11],
            "budget_inr": r[12]
        },
        "top_crops": json.loads(r[13]) if r[13] else [],
        "weather": json.loads(r[14]) if r[14] else {}
    }
