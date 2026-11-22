"""
Farmer Run History Management (SQLite).
Saves farmer runs per user, queries past runs with search & filters,
supports deletion (single, bulk, timeframe), and side-by-side comparison.
"""

import sqlite3
import json
import time
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

DB_PATH = "data/farmer_history.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS farmer_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT DEFAULT 'guest',
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
    # Check if user_id column exists (migration safeguard)
    c.execute("PRAGMA table_info(farmer_runs)")
    columns = [row[1] for row in c.fetchall()]
    if "user_id" not in columns:
        c.execute("ALTER TABLE farmer_runs ADD COLUMN user_id TEXT DEFAULT 'guest'")
    c.execute("CREATE INDEX IF NOT EXISTS idx_farmer_runs_user ON farmer_runs(user_id)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_farmer_runs_ts ON farmer_runs(timestamp)")

    c.execute("""
        CREATE TABLE IF NOT EXISTS share_links (
            token TEXT PRIMARY KEY,
            run_id INTEGER,
            created_at TEXT,
            is_active INTEGER DEFAULT 1,
            summary_json TEXT
        )
    """)
    c.execute("CREATE INDEX IF NOT EXISTS idx_share_tokens ON share_links(token)")
    conn.commit()
    conn.close()

init_db()

def save_farmer_run(data: Dict[str, Any], user_id: str = "guest") -> int:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    inputs = data.get("inputs", {})
    location = data.get("location_name", "Farming Plot")
    lat = float(data.get("lat", 15.45))
    lon = float(data.get("lon", 75.00))

    c.execute("""
        INSERT INTO farmer_runs (
            user_id, timestamp, location_name, lat, lon, land_acres,
            soil_n, soil_p, soil_k, soil_ph, soil_type,
            irrigation, budget, top_crops_json, weather_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        str(user_id or "guest"),
        ts,
        location,
        lat,
        lon,
        float(inputs.get("land_acres", inputs.get("acres", 2.0))),
        float(inputs.get("soil_n", 80.0)),
        float(inputs.get("soil_p", 40.0)),
        float(inputs.get("soil_k", 40.0)),
        float(inputs.get("soil_ph", 6.5)),
        str(inputs.get("soil_type", "Clay Loam")),
        str(inputs.get("irrigation", "drip")),
        float(inputs.get("budget_inr", 50000.0)),
        json.dumps(data.get("top_crops", [])),
        json.dumps(data.get("weather", {}).get("current", data.get("weather", {})))
    ))
    run_id = c.lastrowid
    conn.commit()
    conn.close()
    return run_id

def get_farmer_history(
    user_id: Optional[str] = None,
    q: Optional[str] = None,
    crop: Optional[str] = None,
    location: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 50
) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    query = """
        SELECT id, user_id, timestamp, location_name, lat, lon, land_acres,
               budget, top_crops_json, irrigation, soil_type, weather_json,
               soil_n, soil_p, soil_k, soil_ph
        FROM farmer_runs
        WHERE 1=1
    """
    params = []

    if user_id and user_id != "all":
        # Match user or guest runs
        query += " AND (user_id = ? OR user_id = 'guest')"
        params.append(str(user_id))

    if q and q.strip():
        search_pattern = f"%{q.strip()}%"
        query += " AND (location_name LIKE ? OR top_crops_json LIKE ?)"
        params.extend([search_pattern, search_pattern])

    if crop and crop.strip():
        crop_pattern = f"%{crop.strip()}%"
        query += " AND top_crops_json LIKE ?"
        params.append(crop_pattern)

    if location and location.strip():
        loc_pattern = f"%{location.strip()}%"
        query += " AND location_name LIKE ?"
        params.append(loc_pattern)

    if start_date and start_date.strip():
        query += " AND timestamp >= ?"
        params.append(f"{start_date.strip()} 00:00:00")

    if end_date and end_date.strip():
        query += " AND timestamp <= ?"
        params.append(f"{end_date.strip()} 23:59:59")

    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    c.execute(query, params)
    rows = c.fetchall()
    conn.close()

    history = []
    for r in rows:
        top_crops = json.loads(r[8]) if r[8] else []
        top_name = top_crops[0]["display_name"] if top_crops else "Unknown"
        top_profit = top_crops[0]["net_profit_inr"] if top_crops else 0
        top_crops_summary = [c.get("display_name", "") for c in top_crops[:3]]

        history.append({
            "id": r[0],
            "user_id": r[1],
            "timestamp": r[2],
            "location_name": r[3],
            "lat": r[4],
            "lon": r[5],
            "land_acres": r[6],
            "budget": r[7],
            "top_crop": top_name,
            "top_profit": top_profit,
            "irrigation": r[9],
            "soil_type": r[10],
            "weather": json.loads(r[11]) if r[11] else {},
            "soil_n": r[12],
            "soil_p": r[13],
            "soil_k": r[14],
            "soil_ph": r[15],
            "top_crops": top_crops,
            "top_crops_summary": top_crops_summary,
            "crops_count": len(top_crops)
        })
    return history

def get_run_by_id(run_id: int) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT id, user_id, timestamp, location_name, lat, lon, land_acres,
               soil_n, soil_p, soil_k, soil_ph, soil_type,
               irrigation, budget, top_crops_json, weather_json
        FROM farmer_runs
        WHERE id = ?
    """, (run_id,))
    r = c.fetchone()
    conn.close()
    if not r:
        return None
    top_crops = json.loads(r[14]) if r[14] else []
    top_crop = top_crops[0] if top_crops else {}
    return {
        "id": r[0],
        "user_id": r[1],
        "timestamp": r[2],
        "location_name": r[3],
        "lat": r[4],
        "lon": r[5],
        "land_acres": r[6],
        "budget": r[13],
        "top_crop": top_crop.get("display_name", "N/A"),
        "top_profit": top_crop.get("net_profit_inr", 0),
        "inputs": {
            "land_acres": r[6],
            "soil_n": r[7],
            "soil_p": r[8],
            "soil_k": r[9],
            "soil_ph": r[10],
            "soil_type": r[11],
            "irrigation": r[12],
            "budget_inr": r[13]
        },
        "top_crops": top_crops,
        "weather": json.loads(r[15]) if r[15] else {}
    }

def delete_run_by_id(run_id: int, user_id: Optional[str] = None) -> bool:
    """Deletes a single history run by ID."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    if user_id and user_id != "all":
        c.execute("DELETE FROM farmer_runs WHERE id = ? AND (user_id = ? OR user_id = 'guest')", (run_id, str(user_id)))
    else:
        c.execute("DELETE FROM farmer_runs WHERE id = ?", (run_id,))
    affected = c.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def bulk_delete_runs(run_ids: List[int], user_id: Optional[str] = None) -> int:
    """Deletes multiple history runs by IDs."""
    if not run_ids:
        return 0
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    placeholders = ",".join("?" for _ in run_ids)
    params = list(run_ids)
    if user_id and user_id != "all":
        query = f"DELETE FROM farmer_runs WHERE id IN ({placeholders}) AND (user_id = ? OR user_id = 'guest')"
        params.append(str(user_id))
    else:
        query = f"DELETE FROM farmer_runs WHERE id IN ({placeholders})"
    c.execute(query, params)
    affected = c.rowcount
    conn.commit()
    conn.close()
    return affected

def clear_history(timeframe: str = "all", user_id: Optional[str] = None) -> int:
    """
    Clears history runs based on timeframe: 'hour', 'today', or 'all'.
    """
    import datetime
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    now = datetime.datetime.now()
    params = []

    if timeframe == "hour":
        cutoff = (now - datetime.timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S")
        query = "DELETE FROM farmer_runs WHERE timestamp >= ?"
        params.append(cutoff)
    elif timeframe == "today":
        cutoff = now.strftime("%Y-%m-%d 00:00:00")
        query = "DELETE FROM farmer_runs WHERE timestamp >= ?"
        params.append(cutoff)
    else:  # all
        query = "DELETE FROM farmer_runs WHERE 1=1"

    if user_id and user_id != "all":
        query += " AND (user_id = ? OR user_id = 'guest')"
        params.append(str(user_id))

    c.execute(query, params)
    affected = c.rowcount
    conn.commit()
    conn.close()
    return affected


def create_share_link(run_id: Optional[int], summary_data: Dict[str, Any]) -> str:
    """Generates a random URL-safe token and creates a public share record."""
    import secrets
    token = secrets.token_urlsafe(12)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    c.execute("""
        INSERT INTO share_links (token, run_id, created_at, is_active, summary_json)
        VALUES (?, ?, ?, 1, ?)
    """, (token, run_id, ts, json.dumps(summary_data)))
    conn.commit()
    conn.close()
    return token

def get_share_link(token: str) -> Optional[Dict[str, Any]]:
    """Fetches active public share link record by token."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT token, run_id, created_at, is_active, summary_json
        FROM share_links
        WHERE token = ? AND is_active = 1
    """, (token,))
    row = c.fetchone()
    conn.close()
    if not row:
        return None
    summary = json.loads(row[4]) if row[4] else {}
    run_details = None
    if row[1]:
        run_details = get_run_by_id(row[1])
    return {
        "token": row[0],
        "run_id": row[1],
        "created_at": row[2],
        "is_active": bool(row[3]),
        "summary": summary,
        "run": run_details
    }

def revoke_share_link(token: str) -> bool:
    """Revokes a public share link token."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE share_links SET is_active = 0 WHERE token = ?", (token,))
    affected = c.rowcount
    conn.commit()
    conn.close()
    return affected > 0


