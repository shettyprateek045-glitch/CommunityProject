/**
 * Farmer Decision Dashboard - TypeScript Type Definitions
 * Precision Agronomic & Multi-Modal Decision Support System
 */

export type LangCode = 'en' | 'kn';
export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

export interface LocationData {
  display_name: string;
  village: string;
  district: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  source: string;
  is_approximate?: boolean;
}

export interface CurrentWeather {
  temperature: number;
  feels_like: number;
  apparent_temperature?: number;
  humidity: number;
  wind_speed: number;
  precipitation: number;
  rain_now_mm?: number;
  is_raining?: boolean;
  rain_chance: number;
  rain_chance_today?: number;
  weather_code: number;
  icon: string;
  description: string;
  season?: string;
  season_name_kn?: string;
  farming_note?: string;
  farming_note_kn?: string;
}

export interface DailyForecastDay {
  date: string;
  day_name: string;
  max_temp: number;
  min_temp: number;
  rain_sum_mm: number;
  rain_chance_pct?: number;
  icon: string;
  condition: string;
}

export interface ClimateMonth {
  month: string;
  rainfall_mm: number;
  temp_c: number;
}

export interface WeatherAlert {
  type: string;
  severity: string;
  title: string;
  message: string;
  tip: string;
  farming_tip: string;
}

export interface WeatherResponse {
  status: string;
  temperature: number;
  apparent_temperature?: number;
  humidity: number;
  rainfall_mm: number;
  rain_now_mm?: number;
  is_raining?: boolean;
  rain_chance_today?: number;
  rainfall_7d_total: number;
  annual_rainfall_estimate: number;
  season?: string;
  season_name_kn?: string;
  farming_note?: string;
  farming_note_kn?: string;
  current: CurrentWeather;
  daily_7d: DailyForecastDay[];
  hourly_rain_24h: {
    times: string[];
    rain_mm: number[];
  };
  monthly_climate_12m: ClimateMonth[];
  alerts: WeatherAlert[];
  cached: boolean;
  source: string;
}

export interface FertilizerTip {
  nutrient: string;
  current: number;
  ideal_min: number;
  ideal_max: number;
  status: string;
  advice: string;
}

export interface GrowthStage {
  stage: string;
  days: string;
  action: string;
  action_kn?: string;
}

export interface HistoricalPrice {
  month: string;
  price: number;
}

export interface CropRecommendation {
  crop: string;
  crop_key: string;
  name: string;
  display_name: string;
  kannada_name: string;
  suitability_pct: number;
  raw_suitability: number;
  yield_per_acre_qtl: number;
  total_yield_qtl: number;
  cost_per_acre_inr: number;
  total_cost_inr: number;
  unit_price_inr: number;
  total_revenue_inr: number;
  net_profit_inr: number;
  exceeds_budget: boolean;
  is_water_infeasible?: boolean;
  risk_score: number;
  risk_badge: string;
  risk_level: string;
  risk_color: string;
  risk_factors: {
    water_deficit_pct: number;
    price_volatility_pct: number;
    weather_alert_penalty: number;
  };
  season: string;
  duration_days: number;
  water_need_level: string;
  water_need_mm: number;
  rotation_category: string;
  reasons: string[];
  fertilizer_advice: FertilizerTip[];
  calendar: GrowthStage[];
  growth_calendar: GrowthStage[];
  price_trend: number[];
  historical_prices: HistoricalPrice[];
  price_source: string;
  composite_score: number;
}

export interface AlternativeCropItem {
  crop: string;
  display_name: string;
  kannada_name: string;
  condition: string;
  condition_kn: string;
  action_required: string;
  action_required_kn: string;
  potential_benefit: string;
  potential_benefit_kn: string;
}

export interface RecommendResponse {
  status: string;
  top_crops: CropRecommendation[];
  weather_fit_crops?: CropRecommendation[];
  alternative_crops?: AlternativeCropItem[];
  all_candidates_count: number;
  total_evaluated: number;
  excluded_by_budget: Array<{ crop: string; cost: number; budget: number }>;
  excluded_count: number;
  weights_used: { suitability: number; profit: number; risk: number };
  explainability: Array<{ feature: string; importance: number; importance_pct: number }>;
  inputs_summary: any;
  run_id?: number;
}

export interface SoilProblemItem {
  issue: string;
  fix: string;
  issue_kn?: string;
  fix_kn?: string;
}

export interface SoilPhotoResponse {
  status: 'ok' | 'uncertain' | 'not_soil';
  soil_type: string;
  confidence: number;
  is_confident: boolean;
  rejection_reason?: string;
  rejection_reason_kn?: string;
  gate_failed?: string;
  soil_colour?: string;
  texture?: string;
  moisture_level?: string;
  water_holding?: string;
  drainage?: string;
  organic_matter?: string;
  ph_range?: string;
  fertility_level?: string;
  estimated_n?: number;
  estimated_p?: number;
  estimated_k?: number;
  estimated_ph?: number;
  problems_to_watch?: SoilProblemItem[];
  suitable_crops?: string[];
  message: string;
  message_kn?: string;
  top_candidates: Array<{ soil: string; confidence: number }>;
  disclaimer: string;
}

export interface RotationCheckResponse {
  status: string;
  standing_crop: string;
  matched_key: string;
  display_name: string;
  family: string;
  fertility_impact: 'Improved' | 'Neutral' | 'Depleted';
  fertility_impact_kn: string;
  nitrogen_fixation: boolean;
  biomass_addition: string;
  original_npk: { n: number; p: number; k: number };
  adjusted_npk: { n: number; p: number; k: number };
  npk_changes: { n_change: number; p_change: number; k_change: number };
  recommended_next_crops: Array<{ crop: string; reason: string }>;
  crops_to_avoid: Array<{ crop: string; reason: string }>;
  carryover_risks: string[];
  soil_health_tips: string[];
  soil_health_tips_kn: string[];
}

export interface CropRotationRecommendation {
  standing_crop: string;
  rotation_crops: string[];
  agronomic_reason: string;
  rotation_crops_kn?: string;
  reason_kn?: string;
}

export interface PhotoCheckResponse {
  status: 'ok' | 'not_crop' | 'uncertain';
  reason?: string;
  gate_failed?: string;
  crop_name?: string;
  kannada_name?: string;
  confidence: number;
  is_confident: boolean;
  top_3_guesses: Array<{ class: string; confidence: number }>;
  rotation_recommendations?: CropRotationRecommendation;
  green_pixel_ratio?: number;
  clip_prediction?: string;
}

export interface HistoryRecord {
  id: number;
  created_at: string;
  location_name: string;
  lat: number;
  lon: number;
  land_acres: number;
  budget_inr: number;
  top_crop: string;
  expected_profit: number;
}
