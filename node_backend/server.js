/**
 * Farmer Decision Dashboard - Node.js Server (JavaScript)
 * Standalone companion backend server supporting Express, static assets,
 * Open-Meteo proxy, Nominatim geocoding, and Python ML bridge.
 */

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static assets
app.use('/static', express.static(path.join(__dirname, '../static')));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../templates/index.html'));
});

// Helper: Python Bridge
function runPythonBridge(action, payload) {
  return new Promise((resolve, reject) => {
    const pythonExe = process.env.PYTHON_PATH || 'python';

    const child = spawn(pythonExe, ['-c', `
import sys, json
from services.engine import compute_farmer_recommendations
from services.weather import reverse_geocode, get_live_weather, get_historical_climate, forward_geocode
from services.history import get_farmer_history, save_farmer_run

action = sys.argv[1]
data = json.loads(sys.stdin.read()) if not sys.stdin.isatty() else {}

if action == "location":
    lat = float(data.get("lat", 15.4589))
    lon = float(data.get("lon", 75.0078))
    loc = reverse_geocode(lat, lon)
    wx = get_live_weather(lat, lon)
    climate = get_historical_climate(lat, lon)
    print(json.dumps({"status": "success", "location": loc, "weather": wx, "climate": climate}))
elif action == "geocode":
    q = data.get("q", "")
    res = forward_geocode(q)
    print(json.dumps({"status": "success", "result": res}))
elif action == "recommend" or action == "whatif":
    recs = compute_farmer_recommendations(
        land_acres=float(data.get("land_acres", 3.0)),
        soil_n=float(data.get("soil_n", 85)),
        soil_p=float(data.get("soil_p", 45)),
        soil_k=float(data.get("soil_k", 42)),
        soil_ph=float(data.get("soil_ph", 6.5)),
        soil_type=str(data.get("soil_type", "Clay Loam")),
        irrigation=str(data.get("irrigation", "drip")),
        budget_inr=float(data.get("budget_inr", 65000)),
        temp_c=float(data.get("temp_c", 26.5)),
        humidity=float(data.get("humidity", 65.0)),
        rainfall_annual=float(data.get("annual_rain", 950.0))
    )
    if action == "recommend":
        run_record = {
            "inputs": data,
            "location_name": data.get("location_name", "Plot"),
            "lat": float(data.get("lat", 15.4589)),
            "lon": float(data.get("lon", 75.0078)),
            "top_crops": recs["top_crops"],
            "weather": data.get("weather", {})
        }
        run_id = save_farmer_run(run_record)
        print(json.dumps({"status": "success", "run_id": run_id, "recommendations": recs, "weather": data.get("weather"), "climate": data.get("climate")}))
    else:
        print(json.dumps({"status": "success", "top_crops": recs["top_crops"], "excluded_by_budget": recs["excluded_by_budget"], "explainability": recs["explainability"]}))
elif action == "history":
    hist = get_farmer_history(20)
    print(json.dumps({"status": "success", "history": hist}))
elif action == "compare":
    from services.history import get_run_by_id
    run_ids = data.get("run_ids", [])
    compared_runs = []
    for rid in run_ids:
        item = get_run_by_id(int(rid))
        if item:
            top_crops = item.get("top_crops", [])
            top_crop = top_crops[0] if top_crops else {}
            acres_val = float(item["inputs"].get("land_acres", 1.0))
            profit_val = float(top_crop.get("net_profit_inr", 0))
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
                "profit_per_acre": round(profit_val / max(0.1, acres_val), 0)
            })
    print(json.dumps({"status": "success", "count": len(compared_runs), "runs": compared_runs}))
else:
    print(json.dumps({"status": "error", "message": "Unknown action"}))
`, action]);

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (d) => { stdoutData += d.toString(); });
    child.stderr.on('data', (d) => { stderrData += d.toString(); });

    child.on('close', (code) => {
      if (code === 0) {
        try {
          const parsed = JSON.parse(stdoutData.trim());
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse python output: ${stdoutData}`));
        }
      } else {
        reject(new Error(`Python process exited with code ${code}: ${stderrData}`));
      }
    });

    if (payload) {
      child.stdin.write(JSON.stringify(payload));
      child.stdin.end();
    }
  });
}

// API Endpoints
app.post('/api/location', async (req, res) => {
  try {
    const result = await runPythonBridge('location', req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/geocode', async (req, res) => {
  try {
    const q = req.query.q;
    const result = await runPythonBridge('geocode', { q });
    res.json(result);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/recommend', async (req, res) => {
  try {
    const result = await runPythonBridge('recommend', req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/whatif', async (req, res) => {
  try {
    const result = await runPythonBridge('whatif', req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const result = await runPythonBridge('history', {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/history/runs', async (req, res) => {
  try {
    const result = await runPythonBridge('history', {});
    const runs = (result && result.history) ? result.history : result;
    res.json(runs);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/history/compare', async (req, res) => {
  try {
    const result = await runPythonBridge('compare', req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌾 Node.js Farmer Decision Dashboard listening at http://localhost:${PORT}`);
  });
}

module.exports = app;
