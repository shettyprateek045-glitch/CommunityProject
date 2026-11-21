"""
Pydantic Schemas for Request & Response Data Validation
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# -----------------------------------------------------------------------------
# Location & IP Schemas
# -----------------------------------------------------------------------------
class IPLocationResponse(BaseModel):
    status: str = "success"
    lat: float = 15.3173
    lon: float = 75.7139
    village: str = "Hubballi-Dharwad"
    district: str = "Dharwad"
    state: str = "Karnataka"
    country: str = "India"
    display_name: str = "Hubballi-Dharwad, Dharwad, Karnataka, India"
    is_approximate: bool = True

# -----------------------------------------------------------------------------
# Weather Schemas
# -----------------------------------------------------------------------------
class WeatherRequest(BaseModel):
    lat: float = Field(..., description="Latitude")
    lng: Optional[float] = Field(None, description="Longitude")
    lon: Optional[float] = Field(None, description="Longitude alias")

    def get_lon(self) -> float:
        return self.lng if self.lng is not None else (self.lon if self.lon is not None else 75.0078)

class CurrentWeatherModel(BaseModel):
    temperature: float
    feels_like: float
    apparent_temperature: float = 0.0
    humidity: float
    wind_speed: float
    precipitation: float
    rain_now_mm: float = 0.0
    is_raining: bool = False
    rain_chance: float = 0.0
    rain_chance_today: float = 0.0
    weather_code: int = 0
    icon: str = "⛅"
    description: str = "Partly Cloudy"
    is_day: Optional[int] = 1
    season: str = "Kharif"
    season_name_kn: str = "ಖಾರೀಫ್"
    farming_note: str = "Favorable conditions for field preparation and crop growth."
    farming_note_kn: str = "ಹೊಲದ ತಯಾರಿ ಮತ್ತು ಬೆಳೆ ಬೆಳವಣಿಗೆಗೆ ಅನುಕೂಲಕರ ಹವಾಮಾನ."

class DailyForecastItem(BaseModel):
    date: str
    day_name: str
    max_temp: float
    min_temp: float
    rain_sum_mm: float
    rain_chance_pct: float = 0.0
    et0: Optional[float] = 0.0
    icon: str = "🌤️"
    condition: str = "Clear"

class ClimateMonthModel(BaseModel):
    month: str
    rainfall_mm: float
    temp_c: float

class WeatherAlertModel(BaseModel):
    type: str
    severity: str
    title: str
    message: str
    tip: str
    farming_tip: str

class WeatherResponse(BaseModel):
    status: str = "success"
    temperature: float
    apparent_temperature: float = 0.0
    humidity: float
    rainfall: Optional[float] = 0.0
    rainfall_mm: Optional[float] = 0.0
    rain_now_mm: float = 0.0
    is_raining: bool = False
    is_day: Optional[int] = 1
    rain_chance_today: float = 0.0
    rainfall_7d_total: float
    annual_rainfall_estimate: float
    season: str = "Kharif"
    season_name_kn: str = "ಖಾರೀಫ್"
    farming_note: str = ""
    farming_note_kn: str = ""
    last_updated: Optional[str] = None
    current: CurrentWeatherModel
    daily_7d: List[DailyForecastItem]
    hourly_rain_24h: Dict[str, Any]
    monthly_climate_12m: List[ClimateMonthModel]
    alerts: List[WeatherAlertModel]
    cached: bool = False
    source: str = "Open-Meteo Satellite Feed"

# -----------------------------------------------------------------------------
# Recommendation Schemas
# -----------------------------------------------------------------------------
class RecommendRequest(BaseModel):
    lat: Optional[float] = 15.4589
    lng: Optional[float] = 75.0078
    lon: Optional[float] = None
    location_name: Optional[str] = "Karnataka Farm Plot"
    land_acres: float = Field(default=3.0, ge=0.1, le=500.0)
    budget_inr: float = Field(default=65000.0, ge=1000.0)
    irrigation: str = Field(default="drip")
    soil_n: float = Field(default=85.0, ge=0.0, le=300.0)
    soil_p: float = Field(default=45.0, ge=0.0, le=250.0)
    soil_k: float = Field(default=42.0, ge=0.0, le=300.0)
    soil_ph: float = Field(default=6.5, ge=3.5, le=10.0)
    soil_type: str = Field(default="Clay Loam")
    previous_crop: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    rainfall: Optional[float] = None
    w_suit: Optional[float] = 0.40
    w_profit: Optional[float] = 0.40
    w_risk: Optional[float] = 0.20

class FertilizerAdviceItem(BaseModel):
    nutrient: str
    current: float
    ideal_min: float
    ideal_max: float
    status: str
    advice: str

class GrowthCalendarItem(BaseModel):
    stage: str
    days: str
    action: str
    action_kn: Optional[str] = None

class HistoricalPriceItem(BaseModel):
    month: str
    price: float

class CropRecommendationItem(BaseModel):
    crop: str
    crop_key: str
    name: str
    display_name: str
    kannada_name: str
    suitability_pct: float
    raw_suitability: float
    yield_per_acre_qtl: float
    total_yield_qtl: float
    cost_per_acre_inr: float
    total_cost_inr: float
    unit_price_inr: float
    total_revenue_inr: float
    net_profit_inr: float
    exceeds_budget: bool
    risk_score: float
    risk_badge: str
    risk_level: str
    risk_color: str
    risk_factors: Dict[str, float]
    season: str
    duration_days: int
    water_need_level: str
    water_need_mm: float
    rotation_category: str
    reasons: List[str]
    fertilizer_advice: List[FertilizerAdviceItem]
    calendar: List[GrowthCalendarItem]
    growth_calendar: List[GrowthCalendarItem]
    price_trend: List[float]
    historical_prices: List[HistoricalPriceItem]
    price_source: str
    composite_score: float = 0.0

class AlternativeCropItem(BaseModel):
    crop: str
    display_name: str
    kannada_name: str
    condition: str
    condition_kn: str
    action_required: str
    action_required_kn: str
    potential_benefit: str
    potential_benefit_kn: str

class ExplainabilityFeatureItem(BaseModel):
    feature: str
    importance: float
    importance_pct: float

class RecommendResponse(BaseModel):
    status: str = "success"
    top_crops: List[CropRecommendationItem]
    weather_fit_crops: Optional[List[CropRecommendationItem]] = []
    alternative_crops: Optional[List[AlternativeCropItem]] = []
    all_candidates_count: int
    total_evaluated: int
    excluded_by_budget: List[Dict[str, Any]]
    excluded_count: int
    weights_used: Dict[str, float]
    explainability: List[ExplainabilityFeatureItem]
    inputs_summary: Dict[str, Any]
    run_id: Optional[int] = None

# -----------------------------------------------------------------------------
# Soil Photo Schemas
# -----------------------------------------------------------------------------
class SoilPhotoResponse(BaseModel):
    status: str  # "ok", "uncertain", or "not_soil"
    soil_type: str = "Clay Loam"
    confidence: float = 0.0
    is_confident: bool = False
    rejection_reason: Optional[str] = None
    rejection_reason_kn: Optional[str] = None
    gate_failed: Optional[str] = None
    soil_colour: str = "Dark brown"
    texture: str = "medium"
    moisture_level: str = "moist"
    water_holding: str = "medium"
    drainage: str = "moderate"
    organic_matter: str = "medium"
    ph_range: str = "6.5 - 7.5"
    fertility_level: str = "Moderate"
    estimated_n: float = 85.0
    estimated_p: float = 45.0
    estimated_k: float = 42.0
    estimated_ph: float = 6.8
    problems_to_watch: List[Dict[str, str]] = []
    suitable_crops: List[str] = []
    message: str = ""
    message_kn: Optional[str] = None
    top_candidates: List[Dict[str, Any]] = []
    disclaimer: str = "estimated from photo. Enter your Soil Health Card values for accuracy"

# -----------------------------------------------------------------------------
# Rotation Check Schemas
# -----------------------------------------------------------------------------
class RotationCheckRequest(BaseModel):
    crop_name: str = Field(..., description="Previous or standing crop name")
    soil_n: Optional[float] = 85.0
    soil_p: Optional[float] = 45.0
    soil_k: Optional[float] = 42.0

class RotationCheckResponse(BaseModel):
    status: str = "success"
    standing_crop: str
    matched_key: str
    display_name: str
    family: str
    fertility_impact: str  # "Improved", "Neutral", "Depleted"
    fertility_impact_kn: str
    nitrogen_fixation: bool
    biomass_addition: str
    original_npk: Dict[str, float]
    adjusted_npk: Dict[str, float]
    npk_changes: Dict[str, float]
    recommended_next_crops: List[Dict[str, Any]]
    crops_to_avoid: List[Dict[str, Any]]
    carryover_risks: List[str]
    soil_health_tips: List[str]
    soil_health_tips_kn: List[str]

# -----------------------------------------------------------------------------
# Crop Photo Rejection & Vision Schemas
# -----------------------------------------------------------------------------
class CropRotationModel(BaseModel):
    standing_crop: str
    rotation_crops: List[str]
    agronomic_reason: str
    rotation_crops_kn: Optional[str] = None
    reason_kn: Optional[str] = None

class PhotoCheckResponse(BaseModel):
    status: str  # "ok", "not_crop", or "uncertain"
    reason: Optional[str] = None
    gate_failed: Optional[str] = None
    crop_name: Optional[str] = None
    kannada_name: Optional[str] = None
    confidence: float = 0.0
    is_confident: bool = False
    top_3_guesses: List[Dict[str, Any]] = []
    rotation_recommendations: Optional[CropRotationModel] = None
    green_pixel_ratio: Optional[float] = None
    clip_prediction: Optional[str] = None
