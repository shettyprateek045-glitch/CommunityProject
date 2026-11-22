/**
 * Farmer Decision Dashboard - Enhanced Client Application (ES Module)
 * Incorporates:
 * - Reactive shared farmContext (lat, lon, accuracy, soil, budget, acres, irrigation, etc.)
 * - Leaflet OpenStreetMap with draggable marker, accuracy radius, and throttled geocoding
 * - Real-time Open-Meteo weather with day/night detection and last-updated time
 * - 7-Day FAO-56 dual crop irrigation schedule & sowing window advisory
 * - ISRIC SoilGrids 2.0 pre-fill estimates
 * - PlantVillage YOLOv11 leaf disease scanner with non-leaf & uncertainty gates
 * - Fertilizer plan calculator with editable prices, whole-farm gaps, and pH guidance
 * - 30-day mandi price trends from data.gov.in / Agmarknet with target price alerts
 * - Trilingual UI (English, Kannada, Hindi)
 * - Side-by-side past runs comparison modal
 * - Government schemes finder modal
 * - Web Speech API voice input (kn-IN, hi-IN, en-IN)
 * - PWA Service Worker offline cache
 */

// ============================================================================
// 1. Trilingual Translations Dictionary (English, Kannada, Hindi)
// ============================================================================
const I18N = {
  en: {
    app_title: "Farmer Decision Dashboard",
    app_subtitle: "Precision Agronomic Planning, Market Forecasting & Smart Irrigation",
    nav_history: "Past Runs",
    nav_schemes: "Govt Schemes",
    nav_leaf_scanner: "Leaf Disease Scanner",
    btn_export_pdf: "Export PDF",
    disclaimer_note: "",

    // Stepper
    step_loc: "1. Location",
    step_weather: "2. Weather",
    step_soil: "3. Soil & Fertilizer",
    step_farm: "4. Farm Profile",
    step_last_crop: "5. Last Crop",
    step_results: "6. Recommendations",
    step_verify: "7. Market & Verification",
    btn_next: "Next ➡️",
    btn_prev: "⬅️ Back",

    // Step 1: Location
    modal_loc_title: "Allow location access",
    modal_loc_desc: "We use your location to show live weather and suggest the best crops for your farm.",
    btn_allow_location: "Detect My Location",
    btn_enter_manually: "⌨️ Enter Manually",
    loc_detecting: "Detecting your location via GPS...",
    card_current_loc: "Confirmed Farm Location",
    lbl_village_search: "Search Village, Town or District",
    btn_search: "Search",
    btn_save_loc: "Save Location",
    saved_locations: "Saved Locations",
    pin_drag_hint: "Drag the green pin on the map to pin-point your exact farm field.",

    // Step 2: Weather
    card_current_weather: "Real-Time Micro-Climate",
    lbl_temp: "Temperature",
    lbl_feels_like: "Feels like",
    lbl_humidity: "Humidity",
    lbl_wind: "Wind Speed",
    lbl_7d_rain: "7-Day Rain Total",
    lbl_rain_chance: "Rain Chance Today",
    lbl_raining_now: "🌧️ Raining now:",
    lbl_no_rain_now: "☀️ No rain right now",
    lbl_season: "Season:",
    lbl_farming_advisory: "Farming Advisory Note:",
    btn_refresh_weather: "🔄 Refresh Weather",
    heading_7d_forecast: "7-Day Agro-Weather Forecast",
    heading_irrigation_schedule: "7-Day Smart Irrigation Schedule (FAO-56)",
    heading_sowing_window: "Recommended Sowing Window",
    heading_historical_climate: "12-Month Climate Baseline",
    heading_5yr_weather: "5-Year Historical Weather Analysis (2021–2025)",
    subheading_5yr_weather: "Open-Meteo Historical Archive API • 5-Year Trends, Extremes & Insights",
    tab_monthly_rainfall: "🌧️ Monthly Rainfall",
    tab_monthly_temp: "🌡️ Monthly Temperature",
    tab_5yr_vs_current: "⚖️ 5-Yr Avg vs 2026 Comparison",
    insights_heading: "Agro-Climatic Insights & Trends",
    btn_retry_5yr: "Retry Analysis",

    // Step 3: Soil & Fertilizer
    heading_soil_section: "Soil Analysis, SoilGrids & Fertilizer Plan",
    subheading_soil: "Use SoilGrids estimates, upload a surface soil photo, or input Soil Health Card values.",
    btn_adopt_soilgrids: "Adopt SoilGrids Estimates",
    soilgrids_title: "ISRIC SoilGrids 2.0 Pedological Estimate",
    lbl_soil_photo_box: "Upload Soil Photo (Camera / Gallery)",
    soil_photo_hint: "Accepts JPG, PNG up to 10MB. Hold camera steady in daylight.",
    soil_reject_title: "❌ Not a Soil Image",
    soil_reject_msg: "Please upload a clear, close-up photo of bare farmland soil.",
    btn_soil_retake: "📷 Retake Photo",
    heading_soil_report: "Pedological Soil Report",
    lbl_uncertain_soil: "⚠️ Uncertain (<60%). Please confirm your soil type and Soil Health Card values manually.",
    lbl_soil_n: "Available Nitrogen (N, kg/ha)",
    lbl_soil_p: "Available Phosphorus (P, kg/ha)",
    lbl_soil_k: "Available Potassium (K, kg/ha)",
    lbl_soil_ph: "Soil pH Level",
    lbl_soil_type: "Identified Soil Type",
    heading_fertilizer_calc: "Interactive Fertilizer Plan Calculator",
    btn_calc_fertilizer: "Calculate Fertilizer Doses",

    // Leaf Disease Scanner
    heading_leaf_scanner: "Foliar Pest & Leaf Disease Scanner (PlantVillage AI)",
    leaf_upload_hint: "Upload a clear photo of an affected leaf. The AI inspects blight, spots, and foliage health.",
    leaf_reject_title: "❌ Not a Plant Leaf",
    leaf_reject_msg: "Please upload a clear close-up of a crop leaf or foliage.",
    leaf_uncertain_msg: "⚠️ Uncertain diagnosis (<60% confidence). Please retake in good lighting.",

    // Step 4: Farm Profile
    heading_farm_profile: "Farm Land & Economic Parameters",
    lbl_land_size: "Land Size (Acres)",
    lbl_budget: "Cultivation Budget (INR ₹)",
    lbl_irrigation: "Irrigation System Available",

    // Step 5: Crop Rotation
    heading_rotation_section: "Previous Crop & Soil Rotation Impact",
    lbl_select_previous: "Select Previous / Standing Crop:",

    // Step 6: Recommendations & Market
    heading_top_crops: "Section A: Top 3 Recommended Crops",
    subheading_top_crops: "Hard-filtered by budget, climate, and irrigation; top 3 crops ranked by agronomic profit score.",
    heading_weather_fit: "Section B: Crops Adapted to Current Weather",
    heading_alternatives: "Section C: Strategic Alternatives",
    heading_mandi_prices: "Nearest Mandi 30-Day Modal Price Trends",
    mandi_observation_note: "Observation from Agmarknet / data.gov.in. Not a predictive price forecast.",
    lbl_target_price: "Set Target Selling Price (₹/qtl):",
    btn_set_target: "Set Alert",
    sms_planned_badge: "SMS / WhatsApp Alerts: Planned (Govt Gateway Integration)",
    yield: "Yield",
    cost: "Total Cost",
    revenue: "Gross Revenue",
    profit: "Net Profit",
    risk: "Risk",

    // Modals
    modal_compare_title: "Side-by-Side Past Run Comparison",
    modal_schemes_title: "Verified Government Agricultural Schemes & Subsidies",
    voice_mic_title: "Speak value (Voice Input)"
  },
  kn: {
    app_title: "ರೈತ ನಿರ್ಧಾರ ಬೆಂಬಲ ವ್ಯವಸ್ಥೆ",
    app_subtitle: "ನಿಖರ ಕೃಷಿ ಯೋಜನೆ, ಮಾರುಕಟ್ಟೆ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ",
    nav_history: "ಹಿಂದಿನ ದಾಖಲೆಗಳು",
    nav_schemes: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    nav_leaf_scanner: "ಎಲೆ ರೋಗ ತಪಾಸಣೆ",
    btn_export_pdf: "ವರದಿ ಡೌನ್‌ಲೋಡ್ (PDF)",
    disclaimer_note: "",

    // Stepper
    step_loc: "೧. ಸ್ಥಳ",
    step_weather: "೨. ಹವಾಮಾನ",
    step_soil: "೩. ಮಣ್ಣು ಮತ್ತು ಗೊಬ್ಬರ",
    step_farm: "೪. ಹೊಲದ ವಿವರ",
    step_last_crop: "೫. ಹಿಂದಿನ ಬೆಳೆ",
    step_results: "೬. ಬೆಳೆ ಶಿಫಾರಸುಗಳು",
    step_verify: "೭. ಮಾರುಕಟ್ಟೆ ಮತ್ತು AI ಪರಿಶೀಲನೆ",
    btn_next: "ಮುಂದೆ ➡️",
    btn_prev: "⬅️ ಹಿಂದಕ್ಕೆ",

    // Step 1: Location
    modal_loc_title: "ಸ್ಥಳ ಪ್ರವೇಶವನ್ನು ಅನುಮತಿಸಿ",
    modal_loc_desc: "ನಿಮ್ಮ ಜಮೀನಿಗೆ ಲೈವ್ ಹವಾಮಾನ ಮತ್ತು ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳನ್ನು ಸೂಚಿಸಲು ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಬಳಸುತ್ತೇವೆ.",
    btn_allow_location: "📍 ಜಿಪಿಎಸ್ ಸ್ಥಳ ಅನುಮತಿಸಿ",
    btn_enter_manually: "⌨️ ಹಸ್ತಚಾಲಿತವಾಗಿ ನಮೂದಿಸಿ",
    loc_detecting: "ಜಿಪಿಎಸ್ ಮೂಲಕ ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...",
    card_current_loc: "ದೃಢೀಕರಿಸಿದ ಹೊಲದ ಸ್ಥಳ",
    lbl_village_search: "ಹಳ್ಳಿ, ಪಟ್ಟಣ ಅಥವಾ ಜಿಲ್ಲೆಯನ್ನು ಹುಡುಕಿ",
    btn_search: "ಹುಡುಕಿ",
    btn_save_loc: "ಸ್ಥಳ ಉಳಿಸಿ",
    saved_locations: "ಉಳಿಸಿದ ಸ್ಥಳಗಳು",
    pin_drag_hint: "ನಿಮ್ಮ ನಿಖರ ಹೊಲವನ್ನು ಗುರುತಿಸಲು ನಕ್ಷೆಯಲ್ಲಿ ಹಸಿರು ಪಿನ್ ಅನ್ನು ಎಳೆಯಿರಿ.",

    // Step 2: Weather
    card_current_weather: "ಲೈವ್ ಹವಾಮಾನ ಮಾಹಿತಿ",
    lbl_temp: "ತಾಪಮಾನ",
    lbl_feels_like: "ಅನುಭವವಾಗುವ ತಾಪಮಾನ",
    lbl_humidity: "ತೇವಾಂಶ",
    lbl_wind: "ಗಾಳಿಯ ವೇಗ",
    lbl_7d_rain: "೭ ದಿನಗಳ ಒಟ್ಟು ಮಳೆ",
    lbl_rain_chance: "ಇಂದಿನ ಮಳೆಯ ಸಂಭವನೀಯತೆ",
    lbl_raining_now: "🌧️ ಈಗ ಮಳೆ ಬೀಳುತ್ತಿದೆ:",
    lbl_no_rain_now: "☀️ ಈಗ ಮಳೆಯಿಲ್ಲ",
    lbl_season: "ಕೃಷಿ ಋತು:",
    lbl_farming_advisory: "ಕೃಷಿ ಸಲಹಾ ಟಿಪ್ಪಣಿ:",
    btn_refresh_weather: "🔄 ಹವಾಮಾನ ನವೀಕರಿಸಿ",
    heading_7d_forecast: "೭ ದಿನಗಳ ಕೃಷಿ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ",
    heading_irrigation_schedule: "೭ ದಿನಗಳ ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ (FAO-56)",
    heading_sowing_window: "ಶಿಫಾರಸು ಮಾಡಿದ ಬಿತ್ತನೆ ಸಮಯ",
    heading_historical_climate: "೧೨ ತಿಂಗಳ ಹವಾಮಾನ ದಾಖಲೆ",
    heading_5yr_weather: "೫ ವರ್ಷಗಳ ಐತಿಹಾಸಿಕ ಹವಾಮಾನ ವಿಶ್ಲೇಷಣೆ (೨೦೨೧–೨೦೨೫)",
    subheading_5yr_weather: "ಓಪನ್-ಮೆಟಿಯೊ ಆರ್ಕೈವ್ ಮಾಹಿತಿ • ೫ ವರ್ಷಗಳ ಪ್ರವೃತ್ತಿಗಳು ಮತ್ತು ಒಳನೋಟಗಳು",
    tab_monthly_rainfall: "🌧️ ಮಾಸಿಕ ಮಳೆ",
    tab_monthly_temp: "🌡️ ಮಾಸಿಕ ತಾಪಮಾನ",
    tab_5yr_vs_current: "⚖️ ೫-ವರ್ಷದ ಸರಾಸರಿ vs ೨೦೨೬ ಹೋಲಿಕೆ",
    insights_heading: "ಕೃಷಿ-ಹವಾಮಾನ ಒಳನೋಟಗಳು ಮತ್ತು ಪ್ರವೃತ್ತಿಗಳು",
    btn_retry_5yr: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",

    // Step 3: Soil & Fertilizer
    heading_soil_section: "ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ, ಸಾಯಿಲ್‌ಗ್ರಿಡ್ಸ್ ಮತ್ತು ಗೊಬ್ಬರ ಯೋಜನೆ",
    subheading_soil: "ಸಾಯಿಲ್‌ಗ್ರಿಡ್ಸ್ ಅಂದಾಜು ಬಳಸಿ, ಮಣ್ಣಿನ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಮೌಲ್ಯಗಳನ್ನು ನಮೂದಿಸಿ.",
    btn_adopt_soilgrids: "ಸಾಯಿಲ್‌ಗ್ರಿಡ್ಸ್ ಅಂದಾಜು ಸ್ವೀಕರಿಸಿ",
    soilgrids_title: "ISRIC ಸಾಯಿಲ್‌ಗ್ರಿಡ್ಸ್ ೨.೦ ಮಣ್ಣಿನ ಅಂದಾಜು",
    lbl_soil_photo_box: "ಮಣ್ಣಿನ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (ಕ್ಯಾಮೆರಾ / ಗ್ಯಾಲರಿ)",
    soil_photo_hint: "ಗರಿಷ್ಠ 10MB. ಹಗಲಿನ ಬೆಳಕಿನಲ್ಲಿ ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ.",
    soil_reject_title: "❌ ಇದು ಮಣ್ಣಿನ ಚಿತ್ರವಲ್ಲ",
    soil_reject_msg: "ದಯವಿಟ್ಟು ಹೊಲದ ಬರಿಯ ಮಣ್ಣಿನ ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    btn_soil_retake: "📷 ಮತ್ತೆ ಫೋಟೋ ತೆಗೆಯಿರಿ",
    heading_soil_report: "ಮಣ್ಣಿನ ಗುಣಲಕ್ಷಣಗಳ ವರದಿ",
    lbl_uncertain_soil: "⚠️ ಅನಿಶ್ಚಿತ (<60%). ದಯವಿಟ್ಟು ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಮೌಲ್ಯಗಳನ್ನು ನಮೂದಿಸಿ.",
    lbl_soil_n: "ಲಭ್ಯವಿರುವ ಸಾರಜನಕ (N, kg/ha)",
    lbl_soil_p: "ಲಭ್ಯವಿರುವ ರಂಜಕ (P, kg/ha)",
    lbl_soil_k: "ಲಭ್ಯವಿರುವ ಪೊಟ್ಯಾಶ್ (K, kg/ha)",
    lbl_soil_ph: "ಮಣ್ಣಿನ pH ಮಟ್ಟ",
    lbl_soil_type: "ಮಣ್ಣಿನ ಪ್ರಕಾರ",
    heading_fertilizer_calc: "ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
    btn_calc_fertilizer: "ಗೊಬ್ಬರದ ಪ್ರಮಾಣ ಲೆಕ್ಕಹಾಕಿ",

    // Leaf Disease Scanner
    heading_leaf_scanner: "ಎಲೆಯ ಕೀಟ ಮತ್ತು ರೋಗ ಪತ್ತೆ (PlantVillage AI)",
    leaf_upload_hint: "ಬಾಧಿತ ಬೆಳೆಯ ಎಲೆಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯು ಎಲೆ ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚುತ್ತದೆ.",
    leaf_reject_title: "❌ ಇದು ಸಸ್ಯದ ಎಲೆಯ ಚಿತ್ರವಲ್ಲ",
    leaf_reject_msg: "ದಯವಿಟ್ಟು ಕೃಷಿ ಬೆಳೆಯ ಎಲೆಯ ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    leaf_uncertain_msg: "⚠️ ಅನಿಶ್ಚಿತ ಪತ್ತೆ (<60%). ದಯವಿಟ್ಟು ಉತ್ತಮ ಬೆಳಕಿನಲ್ಲಿ ಮತ್ತೆ ಫೋಟೋ ತೆಗೆಯಿರಿ.",

    // Step 4: Farm Profile
    heading_farm_profile: "ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಬಂಡವಾಳ",
    lbl_land_size: "ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)",
    lbl_budget: "ಒಟ್ಟು ಬಂಡವಾಳ (INR ₹)",
    lbl_irrigation: "ಲಭ್ಯವಿರುವ ನೀರಾವರಿ ಪದ್ಧತಿ",

    // Step 5: Crop Rotation
    heading_rotation_section: "ಹಿಂದಿನ ಬೆಳೆ ಮತ್ತು ಮಣ್ಣಿನ ಫಲವತ್ತತೆ",
    lbl_select_previous: "ಹಿಂದಿನ / ಪ್ರಸ್ತುತ ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ:",

    // Step 6: Recommendations & Market
    heading_top_crops: "ವಿಭಾಗ ಎ: ಶಿಫಾರಸು ಮಾಡಿದ ಅತ್ಯುತ್ತಮ ೩ ಬೆಳೆಗಳು",
    subheading_top_crops: "ಬಜೆಟ್, ಹವಾಮಾನ ಮತ್ತು ನೀರಾವರಿ ಆಧಾರದ ಮೇಲೆ ಆಯ್ಕೆಮಾಡಿದ ಅತ್ಯುತ್ತಮ ೩ ಬೆಳೆಗಳು.",
    heading_weather_fit: "ವಿಭಾಗ ಬಿ: ಪ್ರಸ್ತುತ ಹವಾಮಾನಕ್ಕೆ ಸೂಕ್ತ ಬೆಳೆಗಳು",
    heading_alternatives: "ವಿಭಾಗ ಸಿ: ಪರ್ಯಾಯ ಲಾಭದಾಯಕ ಬೆಳೆಗಳು",
    heading_mandi_prices: "ಹತ್ತಿರದ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ೩೦ ದಿನಗಳ ದರ",
    mandi_observation_note: "ಅಗಮಾರ್ಕ್‌ನೆಟ್ / data.gov.in ನ ಅಧಿಕೃತ ವರದಿ. ಭವಿಷ್ಯದ ಊಹೆಯಲ್ಲ.",
    lbl_target_price: "ಗುರಿ ಬೆಲೆ ನಿಗದಿಪಡಿಸಿ (₹/ಕ್ವಿಂಟಾಲ್):",
    btn_set_target: "ಎಚ್ಚರಿಕೆ ನಿಗದಿಪಡಿಸಿ",
    sms_planned_badge: "SMS / WhatsApp ಸಂದೇಶ: ಯೋಜನೆಯಲ್ಲಿದೆ (ಸರ್ಕಾರಿ ಗೇಟ್‌ವೇ)",
    yield: "ಇಳುವರಿ",
    cost: "ಒಟ್ಟು ಖರ್ಚು",
    revenue: "ಒಟ್ಟು ಆದಾಯ",
    profit: "ನಿವ್ವಳ ಲಾಭ",
    risk: "ಅಪಾಯ",

    // Modals
    modal_compare_title: "ಹಿಂದಿನ ದಾಖಲೆಗಳ ಮುಖಾಮುಖಿ ಹೋಲಿಕೆ",
    modal_schemes_title: "ಸರ್ಕಾರಿ ಕೃಷಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿಗಳು",
    voice_mic_title: "ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಿ"
  },
  hi: {
    app_title: "किसान निर्णय सहायता डैशबोर्ड",
    app_subtitle: "सटीक कृषि योजना, बाजार पूर्वानुमान और स्मार्ट सिंचाई",
    nav_history: "पुराने रिकॉर्ड",
    nav_schemes: "सरकारी योजनाएं",
    nav_leaf_scanner: "पत्ती रोग जांच",
    btn_export_pdf: "पीडीएफ रिपोर्ट",
    disclaimer_note: "",

    // Stepper
    step_loc: "१. स्थान",
    step_weather: "२. मौसम",
    step_soil: "३. मिट्टी व उर्वरक",
    step_farm: "४. खेत का विवरण",
    step_last_crop: "५. पिछली फसल",
    step_results: "६. फसल सिफारिशें",
    step_verify: "७. बाजार एवं AI सत्यापन",
    btn_next: "आगे ➡️",
    btn_prev: "⬅️ पीछे",

    // Step 1: Location
    modal_loc_title: "स्थान अनुमति दें",
    modal_loc_desc: "हम आपके खेत के लिए सटीक मौसम और सर्वोत्तम फसलें सुझाने के लिए आपके स्थान का उपयोग करते हैं।",
    btn_allow_location: "📍 जीपीएस स्थान अनुमति दें",
    btn_enter_manually: "⌨️ मैन्युअल दर्ज करें",
    loc_detecting: "जीपीएस द्वारा स्थान खोजा जा रहा है...",
    card_current_loc: "पुष्ट किया गया खेत का स्थान",
    lbl_village_search: "गांव, शहर या जिला खोजें",
    btn_search: "खोजें",
    btn_save_loc: "स्थान सहेजें",
    saved_locations: "सहेजे गए स्थान",
    pin_drag_hint: "अपने सटीक खेत को चिन्हित करने के लिए नक्शे पर हरे पिन को खींचें।",

    // Step 2: Weather
    card_current_weather: "लाइव मौसम विवरण",
    lbl_temp: "तापमान",
    lbl_feels_like: "महसूस होने वाला तापमान",
    lbl_humidity: "आर्द्रता",
    lbl_wind: "हवा की गति",
    lbl_7d_rain: "७ दिनों की कुल बारिश",
    lbl_rain_chance: "आज बारिश की संभावना",
    lbl_raining_now: "🌧️ अभी बारिश हो रही है:",
    lbl_no_rain_now: "☀️ अभी बारिश नहीं है",
    lbl_season: "कृषि मौसम:",
    lbl_farming_advisory: "कृषि सलाह:",
    btn_refresh_weather: "🔄 मौसम रिफ्रेश करें",
    heading_7d_forecast: "७ दिनों का कृषि मौसम पूर्वानुमान",
    heading_irrigation_schedule: "७-दिवसीय स्मार्ट सिंचाई सारणी (FAO-56)",
    heading_sowing_window: "अनुशंसित बुवाई का समय",
    heading_historical_climate: "१२ महीने का जलवायु रिकॉर्ड",
    heading_5yr_weather: "५-वर्षीय ऐतिहासिक मौसम विश्लेषण (२०२१–२०२५)",
    subheading_5yr_weather: "ओपन-मेटियो आर्काइव डेटा • ५ वर्षों के रुझान और अंतर्दृष्टि",
    tab_monthly_rainfall: "🌧️ मासिक वर्षा",
    tab_monthly_temp: "🌡️ मासिक तापमान",
    tab_5yr_vs_current: "⚖️ ५-वर्षीय औसत बनाम २०२६ तुलना",
    insights_heading: "कृषि-जलवायु अंतर्दृष्टि और रुझान",
    btn_retry_5yr: "पुनः प्रयास करें",

    // Step 3: Soil & Fertilizer
    heading_soil_section: "मृदा विश्लेषण, सॉइल-ग्रिड्स और उर्वरक योजना",
    subheading_soil: "सॉइल-ग्रिड्स अनुमान लें, मिट्टी की फोटो अपलोड करें या मृदा स्वास्थ्य कार्ड मान भरें।",
    btn_adopt_soilgrids: "सॉइल-ग्रिड्स अनुमान अपनाएं",
    soilgrids_title: "ISRIC सॉइल-ग्रिड्स २.० मिट्टी अनुमान",
    lbl_soil_photo_box: "मिट्टी की फोटो अपलोड करें (कैमरा / गैलरी)",
    soil_photo_hint: "अधिकतम 10MB। दिन की रोशनी में स्पष्ट फोटो लें।",
    soil_reject_title: "❌ यह मिट्टी की फोटो नहीं है",
    soil_reject_msg: "कृपया खेत की खाली मिट्टी की स्पष्ट फोटो अपलोड करें।",
    btn_soil_retake: "📷 पुनः फोटो लें",
    heading_soil_report: "मृदा विशेषता रिपोर्ट",
    lbl_uncertain_soil: "⚠️ अनिश्चित (<60%)। कृपया मृदा स्वास्थ्य कार्ड मान दर्ज करें।",
    lbl_soil_n: "उपलब्ध नाइट्रोजन (N, kg/ha)",
    lbl_soil_p: "उपलब्ध फास्फोरस (P, kg/ha)",
    lbl_soil_k: "उपलब्ध पोटाश (K, kg/ha)",
    lbl_soil_ph: "मृदा pH स्तर",
    lbl_soil_type: "मिट्टी का प्रकार",
    heading_fertilizer_calc: "उर्वरक मात्रा कैलकुलेटर",
    btn_calc_fertilizer: "उर्वरक खुराक की गणना करें",

    // Leaf Disease Scanner
    heading_leaf_scanner: "पत्ती कीट व रोग पहचान (PlantVillage AI)",
    leaf_upload_hint: "प्रभावित फसल की पत्ती की स्पष्ट फोटो अपलोड करें। एआई झुलसा, धब्बे और स्वास्थ्य का विश्लेषण करेगा।",
    leaf_reject_title: "❌ यह पौधे की पत्ती नहीं है",
    leaf_reject_msg: "कृपया फसल की पत्ती की स्पष्ट फोटो अपलोड करें।",
    leaf_uncertain_msg: "⚠️ अनिश्चित पहचान (<60%)। कृपया अच्छी रोशनी में पुनः फोटो लें।",

    // Step 4: Farm Profile
    heading_farm_profile: "जमीन का आकार और बजट",
    lbl_land_size: "जमीन का आकार (एकड़)",
    lbl_budget: "खेती का कुल बजट (INR ₹)",
    lbl_irrigation: "उपलब्ध सिंचाई प्रणाली",

    // Step 5: Crop Rotation
    heading_rotation_section: "पिछली फसल और मृदा चक्र प्रभाव",
    lbl_select_previous: "पिछली / वर्तमान फसल चुनें:",

    // Step 6: Recommendations & Market
    heading_top_crops: "भाग क: शीर्ष ३ अनुशंसित फसलें",
    subheading_top_crops: "बजट, मौसम और सिंचाई सीमाओं के आधार पर चयनित शीर्ष ३ फसलें।",
    heading_weather_fit: "भाग ख: वर्तमान मौसम के अनुकूल फसलें",
    heading_alternatives: "भाग ग: रणनीतिक वैकल्पिक फसलें",
    heading_mandi_prices: "निकटतम मंडी ३०-दिवसीय मॉडल भाव",
    mandi_observation_note: "Agmarknet / data.gov.in से वास्तविक मंडी डेटा। भविष्य का अनुमान नहीं।",
    lbl_target_price: "लक्षित बिक्री भाव सेट करें (₹/क्विंटल):",
    btn_set_target: "अलर्ट सेट करें",
    sms_planned_badge: "SMS / WhatsApp अलर्ट: प्रस्तावित (सरकारी गेटवे)",
    yield: "पैदावार",
    cost: "कुल लागत",
    revenue: "सकल आय",
    profit: "शुद्ध लाभ",
    risk: "जोखिम",

    // Modals
    modal_compare_title: "पिछले रिकॉर्ड्स की तुलना",
    modal_schemes_title: "सत्यापित सरकारी कृषि योजनाएं और सब्सिडी",
    voice_mic_title: "बोलकर दर्ज करें"
  }
};

// ============================================================================
// 2. Shared Farm Context & Application State
// ============================================================================
const storedState = localStorage.getItem('farmer_app_state');
let initialContext = {
  lat: 12.9716,
  lon: 77.5946,
  accuracy_meters: 25.0,
  village: "Bengaluru",
  district: "Bengaluru",
  state: "Karnataka",
  country: "India",
  display_name: "Bengaluru, Karnataka, India",
  soil_type: "",
  soil_n: null,
  soil_p: null,
  soil_k: null,
  soil_ph: null,
  land_acres: 2.0,
  land_unit: "acres",
  budget_inr: 65000.0,
  irrigation: "drip",
  previous_crop: "gram",
  target_price_inr: 4500.0,
  location_source: "initial"
};

if (storedState) {
  try {
    const parsed = JSON.parse(storedState);
    // If stored display_name is truncated (less than 4 components), clear it so full address is loaded fresh
    if (parsed.display_name && (parsed.display_name.split(',').length < 4 || parsed.display_name.includes("Bengaluru, Bengaluru Urban 560098"))) {
      delete parsed.display_name;
    }
    initialContext = { ...initialContext, ...parsed };
  } catch(e) {}
}

export const farmContext = initialContext;

let currentLang = 'en';
let currentStep = 1;
let currentUser = null;

// Map & Charts
let farmMap = null;
let farmMarker = null;
let farmCircle = null;
let climateChartInstance = null;
let mandiChartInstance = null;
let weather5YrChartInstance = null;
let weather5YrData = null;
let weather5YrLoading = false;
let weather5YrError = null;
let weather5YrActiveTab = 'rainfall';

// Cached API responses
let weatherData = null;
let irrigationScheduleData = null;
let soilgridsData = null;
let soilReport = null;
let rotationReport = null;
let recommendData = null;
let mandiTrendsData = null;
let verifiedSchemes = [];

// Performance / Turbo Mode state (optimized for mobile / low bandwidth)
let isPerformanceMode = (function() {
  try {
    const saved = localStorage.getItem('fdd_perf_mode');
    if (saved !== null) return saved === 'true';
    if (navigator.connection && (navigator.connection.saveData || navigator.connection.effectiveType === '2g' || navigator.connection.effectiveType === '3g')) {
      return true;
    }
  } catch (e) {}
  return false;
})();

if (isPerformanceMode) {
  document.documentElement.classList.add('perf-mode');
}

// Geocoding throttle & cache
const geocodeCache = new Map();
let lastGeocodeTime = 0;

// ============================================================================
// 3. Leaflet Map Initialization & Sync
// ============================================================================
function initOrUpdateFarmMap() {
  const mapContainer = document.getElementById("farm-leaflet-map");
  if (!mapContainer || typeof L === 'undefined') return;

  const lat = farmContext.lat;
  const lon = farmContext.lon;
  const accuracy = farmContext.accuracy_meters || 30.0;

  if (!farmMap) {
    farmMap = L.map('farm-leaflet-map', {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([lat, lon], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(farmMap);

    const greenPinIcon = L.divIcon({
      className: 'custom-farm-pin',
      html: `<div style="background-color: #1b5e20; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #a7f3d0; font-size: 16px;"><i class="fa-solid fa-location-dot"></i></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34]
    });

    farmMarker = L.marker([lat, lon], {
      draggable: true,
      icon: greenPinIcon
    }).addTo(farmMap);

    farmCircle = L.circle([lat, lon], {
      radius: accuracy,
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.15,
      weight: 1.5
    }).addTo(farmMap);

    farmMarker.bindPopup(`<b>${farmContext.village || "Confirmed Farm Spot"}</b><br>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`).openPopup();

    farmMarker.on('dragend', async (e) => {
      const position = farmMarker.getLatLng();
      await updateFarmPosition(position.lat, position.lng, 10.0, "map_drag");
    });

    farmMap.on('click', async (e) => {
      farmMarker.setLatLng(e.latlng);
      await updateFarmPosition(e.latlng.lat, e.latlng.lng, 10.0, "map_click");
    });
  } else {
    farmMap.setView([lat, lon], 14);
    farmMarker.setLatLng([lat, lon]);
    farmCircle.setLatLng([lat, lon]);
    farmCircle.setRadius(accuracy);
    farmMarker.setPopupContent(`<b>${farmContext.village || "Confirmed Farm Spot"}</b><br>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
  }

  setTimeout(() => {
    if (farmMap) farmMap.invalidateSize();
  }, 250);
}

// Reverse Geocoding returning FULL ADDRESS via OpenStreetMap Nominatim (zoom=18) + Backend + BigDataCloud fallback
async function reverseGeocode(lat, lon) {
  const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  if (geocodeCache.has(key)) {
    const cached = geocodeCache.get(key);
    if (cached && cached.display_name && cached.display_name.split(',').length >= 4 && !cached.display_name.includes("Bengaluru, Bengaluru Urban 560098")) {
      return cached;
    }
  }

  // Helper to extract clean comprehensive full address
  const buildFullAddress = (addr, rawDisplayName) => {
    if (rawDisplayName && rawDisplayName.includes(',') && rawDisplayName.split(',').length >= 4) {
      return rawDisplayName;
    }
    const parts = [
      addr.amenity || addr.building || addr.house_name || addr.house_number,
      addr.road || addr.street,
      addr.neighbourhood || addr.suburb || addr.hamlet,
      addr.city_district || addr.city || addr.town || addr.village || addr.municipality,
      addr.taluk || addr.county,
      addr.state_district || addr.district,
      addr.state,
      addr.postcode,
      addr.country || "India"
    ].filter(Boolean);
    return [...new Set(parts)].join(", ");
  };

  // 1. Primary: Direct OpenStreetMap Nominatim with zoom=18 for complete full address
  try {
    const now = Date.now();
    if (now - lastGeocodeTime < 600) {
      await new Promise(r => setTimeout(r, 600 - (now - lastGeocodeTime)));
    }
    lastGeocodeTime = Date.now();

    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const resp = await fetch(osmUrl, {
      headers: { 'Accept': 'application/json' }
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data && (data.display_name || data.address)) {
        const addr = data.address || {};
        const village = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || "Bengaluru";
        let district = addr.state_district || addr.county || addr.city || "Bengaluru Urban";
        district = district.replace(/ district/i, "").replace(/ taluk/i, "").trim();
        const state = addr.state || "Karnataka";
        const country = addr.country || "India";
        const fullAddress = buildFullAddress(addr, data.display_name);

        const result = {
          village,
          district,
          state,
          country,
          display_name: fullAddress,
          raw_address: addr
        };
        geocodeCache.set(key, result);
        return result;
      }
    }
  } catch (err) {
    console.warn("Direct Nominatim reverse geocode failed, trying backend:", err);
  }

  // 2. Secondary: Internal Backend reverse-geocode proxy (uses SQLite cached Nominatim)
  try {
    const backendResp = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
    if (backendResp.ok) {
      const bData = await backendResp.json();
      const r = bData.result || bData;
      if (r && r.display_name && r.display_name.split(',').length >= 3) {
        const result = {
          village: r.village || "Bengaluru",
          district: (r.district || "Bengaluru Urban").replace(/ district/i, "").trim(),
          state: r.state || "Karnataka",
          country: r.country || "India",
          display_name: r.display_name
        };
        geocodeCache.set(key, result);
        return result;
      }
    }
  } catch (err) {
    console.warn("Backend reverse-geocode failed, trying BigDataCloud:", err);
  }

  // 3. Tertiary: BigDataCloud client API with comprehensive full administrative hierarchy
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const resp = await fetch(bdcUrl);
    if (resp.ok) {
      const data = await resp.json();
      const village = data.locality || data.city || "Bengaluru";
      let district = data.city || "Bengaluru Urban";
      if (data.localityInfo && data.localityInfo.administrative) {
        const dObj = data.localityInfo.administrative.find(a => a.adminLevel === 5 || a.adminLevel === 6);
        if (dObj) district = dObj.name.replace(/ district/i, "").replace(/ taluk/i, "");
      }
      const state = data.principalSubdivision || "Karnataka";
      
      // Filter out organizations and non-places from administrative list
      const adminList = (data.localityInfo && Array.isArray(data.localityInfo.administrative))
        ? data.localityInfo.administrative
        : [];
      const validAdmin = adminList
        .filter(a => a.name && a.description !== "organization" && !a.name.includes("Development Authority"))
        .sort((a, b) => (b.adminLevel || 0) - (a.adminLevel || 0));

      const addressParts = [];
      for (const adm of validAdmin) {
        let cleanName = adm.name.replace(/ district$/i, "").replace(/ taluk$/i, "").trim();
        if (cleanName && !addressParts.includes(cleanName)) {
          addressParts.push(cleanName);
        }
      }
      if (data.postcode && !addressParts.includes(data.postcode)) {
        addressParts.push(data.postcode);
      }
      if (data.countryName && !addressParts.includes(data.countryName)) {
        addressParts.push(data.countryName);
      }
      const fullAddress = addressParts.length >= 3 ? addressParts.join(", ") : `${village}, ${district}, ${state}, India`;

      const result = {
        village,
        district,
        state,
        country: data.countryName || "India",
        display_name: fullAddress
      };
      geocodeCache.set(key, result);
      return result;
    }
  } catch (err) {
    console.warn("BigDataCloud fallback failed:", err);
  }

  return {
    village: `Lat ${lat.toFixed(3)}, Lon ${lon.toFixed(3)}`,
    district: "Local Region",
    state: "Karnataka",
    country: "India",
    display_name: `Location at ${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E, Karnataka, India`
  };
}

async function updateFarmPosition(lat, lon, accuracy = 20.0, source = "manual") {
  farmContext.lat = lat;
  farmContext.lon = lon;
  farmContext.accuracy_meters = accuracy;
  farmContext.location_source = source;

  const geo = await reverseGeocode(lat, lon);
  farmContext.village = geo.village;
  farmContext.district = geo.district;
  farmContext.state = geo.state;
  farmContext.display_name = geo.display_name;

  // Persist updated confirmed state to localStorage
  try {
    localStorage.setItem('farmer_app_state', JSON.stringify(farmContext));
  } catch (e) {}

  // Invalidate downstream dependent caches so weather, soil, and market re-fetch
  weatherData = null;
  irrigationScheduleData = null;
  soilgridsData = null;
  recommendData = null;
  mandiTrendsData = null;

  renderLocationDisplayCards();
  initOrUpdateFarmMap();

  // Proactively pre-fetch weather, irrigation, soil, and market trends in parallel
  prefetchDashboardData(lat, lon);
}

// ============================================================================
// 4. Voice Input (Web Speech API kn-IN, hi-IN, en-IN)
// ============================================================================
function setupVoiceInput(targetInputId, micButtonId) {
  const micBtn = document.getElementById(micButtonId);
  const targetInput = document.getElementById(targetInputId);
  if (!micBtn || !targetInput) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micBtn.classList.add("hidden");
    return;
  }

  micBtn.classList.remove("hidden");
  micBtn.title = I18N[currentLang].voice_mic_title;

  micBtn.onclick = (e) => {
    e.preventDefault();
    const recognition = new SpeechRecognition();
    recognition.lang = currentLang === 'kn' ? 'kn-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN');
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    micBtn.classList.add("text-rose-500", "animate-pulse");

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // Extract numbers and decimal points
      const numericMatches = transcript.match(/[\d.]+/g);
      if (numericMatches && numericMatches.length > 0) {
        const val = parseFloat(numericMatches.join(''));
        if (!isNaN(val)) {
          targetInput.value = val;
          targetInput.dispatchEvent(new Event('input', { bubbles: true }));
          targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    };

    recognition.onerror = () => {
      micBtn.classList.remove("text-rose-500", "animate-pulse");
    };

    recognition.onend = () => {
      micBtn.classList.remove("text-rose-500", "animate-pulse");
    };

    try {
      recognition.start();
    } catch (err) {
      micBtn.classList.remove("text-rose-500", "animate-pulse");
    }
  };
}

// ============================================================================
// 5. Backend Service API Integrations
// ============================================================================
// 3. Ultra-Fast In-Memory & SessionStorage Caching + In-Flight Deduplication
// ============================================================================
const weatherCache = new Map();
const mandiCache = new Map();
const _inflightPromises = new Map();

function getFromSessionCache(key, maxAgeMs = 15 * 60 * 1000) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const item = JSON.parse(raw);
    if (Date.now() - item.time < maxAgeMs) {
      return item.data;
    }
  } catch (e) {}
  return null;
}

function saveToSessionCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, time: Date.now() }));
  } catch (e) {}
}

async function fetchLiveWeather(lat, lon) {
  try {
    const latNum = parseFloat(lat) || farmContext.lat || 12.9716;
    const lonNum = parseFloat(lon) || farmContext.lon || 77.5946;
    const cacheKey = `${latNum.toFixed(3)},${lonNum.toFixed(3)}`;

    // 1. Fast in-memory check
    const cached = weatherCache.get(cacheKey);
    if (cached && (Date.now() - cached.time < 15 * 60 * 1000)) {
      weatherData = cached.data;
      updateDashboardAlerts();
      return weatherData;
    }

    // 2. Fast sessionStorage check
    const sessionCached = getFromSessionCache(`fdd_wx_${cacheKey}`);
    if (sessionCached) {
      weatherData = sessionCached;
      weatherCache.set(cacheKey, { data: weatherData, time: Date.now() });
      updateDashboardAlerts();
      return weatherData;
    }

    // 3. Deduplicate active in-flight request
    const inflightKey = `wx_${cacheKey}`;
    if (_inflightPromises.has(inflightKey)) {
      return await _inflightPromises.get(inflightKey);
    }

    const fetchPromise = (async () => {
      try {
        const res = await fetch(`/api/weather/current?lat=${latNum}&lon=${lonNum}`);
        if (res.ok) {
          weatherData = await res.json();
          weatherCache.set(cacheKey, { data: weatherData, time: Date.now() });
          saveToSessionCache(`fdd_wx_${cacheKey}`, weatherData);
          updateDashboardAlerts();
          return weatherData;
        }
      } finally {
        _inflightPromises.delete(inflightKey);
      }
      return null;
    })();

    _inflightPromises.set(inflightKey, fetchPromise);
    return await fetchPromise;
  } catch (err) {
    console.error("Live weather fetch error:", err);
  }
  return null;
}

async function fetch5YearWeatherAnalysis(lat, lon, force = false) {
  try {
    const latNum = parseFloat(lat) || farmContext.lat || 12.9716;
    const lonNum = parseFloat(lon) || farmContext.lon || 77.5946;
    const cacheKey = `${latNum.toFixed(2)},${lonNum.toFixed(2)}`;

    if (!force) {
      if (weather5YrData && weather5YrData._latLon === cacheKey) {
        return weather5YrData;
      }
      const sessionCached = getFromSessionCache(`fdd_wx_5yr_${cacheKey}`);
      if (sessionCached) {
        weather5YrData = sessionCached;
        weather5YrData._latLon = cacheKey;
        return weather5YrData;
      }
    }

    const inflightKey = `wx_5yr_${cacheKey}`;
    if (_inflightPromises.has(inflightKey)) {
      return await _inflightPromises.get(inflightKey);
    }

    weather5YrLoading = true;
    weather5YrError = null;

    const fetchPromise = (async () => {
      try {
        const res = await fetch(`/api/weather/historical-5yr?lat=${latNum}&lon=${lonNum}`);
        if (res.ok) {
          const data = await res.json();
          data._latLon = cacheKey;
          weather5YrData = data;
          saveToSessionCache(`fdd_wx_5yr_${cacheKey}`, data);
          weather5YrLoading = false;
          return data;
        } else {
          throw new Error(`Server returned status ${res.status}`);
        }
      } catch (err) {
        console.error("5-Year weather fetch error:", err);
        weather5YrError = err.message || "Failed to load 5-year weather analysis";
        weather5YrLoading = false;
        return null;
      } finally {
        _inflightPromises.delete(inflightKey);
      }
    })();

    _inflightPromises.set(inflightKey, fetchPromise);
    return await fetchPromise;
  } catch (e) {
    console.error("fetch5YearWeatherAnalysis fatal error:", e);
    weather5YrLoading = false;
    weather5YrError = e.message;
    return null;
  }
}

async function fetchIrrigationSchedule() {
  try {
    const payload = {
      lat: farmContext.lat,
      lon: farmContext.lon,
      crop: farmContext.previous_crop || "maize",
      growth_stage: "mid",
      soil_type: farmContext.soil_type,
      irrigation_method: farmContext.irrigation,
      acres: farmContext.land_acres
    };
    const cacheKey = `${farmContext.lat.toFixed(3)},${farmContext.lon.toFixed(3)},${farmContext.irrigation}`;

    if (irrigationScheduleData) return irrigationScheduleData;

    const sessionCached = getFromSessionCache(`fdd_irri_${cacheKey}`);
    if (sessionCached) {
      irrigationScheduleData = sessionCached;
      return irrigationScheduleData;
    }

    const inflightKey = `irri_${cacheKey}`;
    if (_inflightPromises.has(inflightKey)) {
      return await _inflightPromises.get(inflightKey);
    }

    const fetchPromise = (async () => {
      try {
        const res = await fetch('/api/weather/irrigation-schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          irrigationScheduleData = await res.json();
          saveToSessionCache(`fdd_irri_${cacheKey}`, irrigationScheduleData);
          return irrigationScheduleData;
        }
      } finally {
        _inflightPromises.delete(inflightKey);
      }
      return null;
    })();

    _inflightPromises.set(inflightKey, fetchPromise);
    return await fetchPromise;
  } catch (err) {
    console.error("Irrigation schedule fetch error:", err);
  }
  return null;
}

async function fetchSoilGridsEstimate(lat, lon) {
  try {
    const latNum = parseFloat(lat) || farmContext.lat;
    const lonNum = parseFloat(lon) || farmContext.lon;
    const cacheKey = `${latNum.toFixed(3)},${lonNum.toFixed(3)}`;

    if (soilgridsData) return soilgridsData;

    const sessionCached = getFromSessionCache(`fdd_soil_${cacheKey}`);
    if (sessionCached) {
      soilgridsData = sessionCached;
      renderSoilGridsBadge();
      return soilgridsData;
    }

    const inflightKey = `soil_${cacheKey}`;
    if (_inflightPromises.has(inflightKey)) {
      return await _inflightPromises.get(inflightKey);
    }

    const fetchPromise = (async () => {
      try {
        const res = await fetch(`/api/soil/soilgrids?lat=${latNum}&lon=${lonNum}`);
        if (res.ok) {
          soilgridsData = await res.json();
          saveToSessionCache(`fdd_soil_${cacheKey}`, soilgridsData);
          renderSoilGridsBadge();
          return soilgridsData;
        }
      } finally {
        _inflightPromises.delete(inflightKey);
      }
      return null;
    })();

    _inflightPromises.set(inflightKey, fetchPromise);
    return await fetchPromise;
  } catch (err) {
    console.warn("SoilGrids fetch failed:", err);
  }
  return null;
}

async function fetchFertilizerPlan(crop = "maize") {
  try {
    const acresVal = farmContext.land_acres || 3.0;
    const payload = {
      crop,
      soil_n: farmContext.soil_n,
      soil_p: farmContext.soil_p,
      soil_k: farmContext.soil_k,
      soil_ph: farmContext.soil_ph,
      acres: acresVal,
      land_acres: acresVal,
      prices: { urea_bag_inr: 266, dap_bag_inr: 1350, mop_bag_inr: 1700, fym_ton_inr: 800 }
    };
    const res = await fetch('/api/fertilizer-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Fertilizer plan error:", err);
  }
  return null;
}

async function fetchMandiTrends() {
  try {
    const latNum = parseFloat(farmContext.lat) || 12.9716;
    const lonNum = parseFloat(farmContext.lon) || 77.5946;
    const target = farmContext.target_price_inr || 4500;
    const cacheKey = `${latNum.toFixed(3)},${lonNum.toFixed(3)},${target}`;

    const cached = mandiCache.get(cacheKey);
    if (cached && (Date.now() - cached.time < 15 * 60 * 1000)) {
      mandiTrendsData = cached.data;
      checkPriceAlertNotification(mandiTrendsData);
      return mandiTrendsData;
    }

    const sessionCached = getFromSessionCache(`fdd_mandi_${cacheKey}`);
    if (sessionCached) {
      mandiTrendsData = sessionCached;
      mandiCache.set(cacheKey, { data: mandiTrendsData, time: Date.now() });
      checkPriceAlertNotification(mandiTrendsData);
      return mandiTrendsData;
    }

    const inflightKey = `mandi_${cacheKey}`;
    if (_inflightPromises.has(inflightKey)) {
      return await _inflightPromises.get(inflightKey);
    }

    const fetchPromise = (async () => {
      try {
        const res = await fetch(`/api/prices/mandi-trends?lat=${latNum}&lon=${lonNum}&target_price=${target}`);
        if (res.ok) {
          mandiTrendsData = await res.json();
          mandiCache.set(cacheKey, { data: mandiTrendsData, time: Date.now() });
          saveToSessionCache(`fdd_mandi_${cacheKey}`, mandiTrendsData);
          checkPriceAlertNotification(mandiTrendsData);
          return mandiTrendsData;
        }
      } finally {
        _inflightPromises.delete(inflightKey);
      }
      return null;
    })();

    _inflightPromises.set(inflightKey, fetchPromise);
    return await fetchPromise;
  } catch (err) {
    console.error("Mandi trends error:", err);
  }
  return null;
}

// Background pre-fetching engine: powers instant navigation across all steps
let _prefetchDebounceTimer = null;
let _activeRecommendPromise = null;

function prefetchDashboardData(lat, lon) {
  clearTimeout(_prefetchDebounceTimer);
  _prefetchDebounceTimer = setTimeout(() => {
    const latNum = parseFloat(lat) || farmContext.lat;
    const lonNum = parseFloat(lon) || farmContext.lon;

    // Run parallel background queries so steps 2, 3, 6 load with 0ms wait
    Promise.allSettled([
      fetchLiveWeather(latNum, lonNum),
      fetchIrrigationSchedule(),
      fetchSoilGridsEstimate(latNum, lonNum),
      fetchMandiTrends()
    ]).then(() => {
      prewarmRecommendations();
    });
  }, 120);
}

async function prewarmRecommendations() {
  if (recommendData) return recommendData;
  if (_activeRecommendPromise) return _activeRecommendPromise;

  const payload = {
    lat: farmContext.lat,
    lon: farmContext.lon,
    acres: farmContext.land_acres || 3.0,
    land_acres: farmContext.land_acres || 3.0,
    budget_inr: farmContext.budget_inr || 65000.0,
    irrigation: farmContext.irrigation || "drip",
    soil_type: farmContext.soil_type || "Clay Loam",
    soil_n: farmContext.soil_n !== null ? farmContext.soil_n : 85.0,
    soil_p: farmContext.soil_p !== null ? farmContext.soil_p : 45.0,
    soil_k: farmContext.soil_k !== null ? farmContext.soil_k : 42.0,
    soil_ph: farmContext.soil_ph !== null ? farmContext.soil_ph : 6.5,
    previous_crop: farmContext.previous_crop,
    state: farmContext.state || "Karnataka",
    district: farmContext.district || "Bengaluru",
    hist_5yr_rainfall: (weather5YrData && weather5YrData.five_year_averages) ? weather5YrData.five_year_averages.annual_rainfall_mm : undefined,
    hist_5yr_temp: (weather5YrData && weather5YrData.five_year_averages) ? weather5YrData.five_year_averages.annual_temp_c : undefined
  };

  _activeRecommendPromise = (async () => {
    try {
      const [recRes, _] = await Promise.all([
        fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }),
        fetchMandiTrends()
      ]);
      if (recRes && recRes.ok) {
        recommendData = await recRes.json();
        saveToSessionCache("fdd_recommend", recommendData);
      }
    } catch (e) {
      console.warn("Prewarm recommend background error:", e);
    } finally {
      _activeRecommendPromise = null;
    }
    return recommendData;
  })();

  return _activeRecommendPromise;
}

async function fetchSchemes() {
  try {
    const res = await fetch('/api/schemes');
    if (res.ok) {
      const data = await res.json();
      verifiedSchemes = Array.isArray(data) ? data : (data.schemes || []);
      return verifiedSchemes;
    }
  } catch (err) {
    console.error("Schemes error:", err);
  }
  return [];
}

// In-app & Browser Notification for Mandi Target Price Alert
function checkPriceAlertNotification(data) {
  if (!data || !data.target_price_alert) return;
  const alertInfo = data.target_price_alert;
  if (!alertInfo.alert_triggered) return;

  // In-app alert banner
  const alertBanner = document.getElementById("mandi-price-alert-banner");
  if (alertBanner) {
    alertBanner.classList.remove("hidden");
    alertBanner.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-xl">🔔</span>
        <div>
          <strong class="font-bold text-emerald-950">${alertInfo.message}</strong>
          <p class="text-xs text-emerald-800">Current modal price is ₹${data.latest_price_inr}/qtl on ${data.date_of_last_record}.</p>
        </div>
      </div>
    `;
  }

  // Browser system notification (only if permission was previously granted by user)
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Farmer Decision Dashboard: Mandi Price Alert", {
      body: `${alertInfo.message} (₹${data.latest_price_inr}/qtl at ${data.nearest_mandi})`,
      icon: "/static/favicon.ico"
    });
  }
}

// ============================================================================
// Real-Time Dashboard Weather & Pest Warnings Banner
// ============================================================================
function updateDashboardAlerts() {
  const alertContainer = document.getElementById("dashboard-alerts-banner");
  if (!alertContainer) return;

  const alerts = [];
  const cur = weatherData && weatherData.current ? weatherData.current : null;

  if (cur) {
    if (cur.temperature >= 35) {
      alerts.push({
        type: "heat",
        icon: "fa-solid fa-temperature-arrow-up text-amber-700",
        bgColor: "bg-amber-50 border-amber-200 text-amber-900",
        badge: currentLang === 'kn' ? "ಶಾಖದ ಮುನ್ನೆಚ್ಚರಿಕೆ" : "Heat Wave Advisory",
        msg: currentLang === 'kn'
          ? `ಅಧಿಕ ತಾಪಮಾನ (${cur.temperature.toFixed(1)}°C) ದಾಖಲಾಗಿದೆ. ಬೆಳೆ ಬಾಡುವುದನ್ನು ತಡೆಯಲು ಮುಂಜಾನೆ ಅಥವಾ ಸಂಜೆ ವೇಳೆ ನೀರು ಹಾಯಿಸಿ.`
          : `Elevated temperature (${cur.temperature.toFixed(1)}°C) detected. Irrigate fields during early morning or twilight to mitigate evapotranspiration moisture loss.`
      });
    }

    const rainChance = cur.rain_chance !== undefined ? cur.rain_chance : (weatherData.forecast_7d && weatherData.forecast_7d[0] ? weatherData.forecast_7d[0].precipitation_probability : 0);
    const isRaining = cur.is_raining || (cur.precipitation && cur.precipitation > 5);
    if (rainChance > 70 || isRaining) {
      alerts.push({
        type: "rain",
        icon: "fa-solid fa-cloud-showers-heavy text-blue-700",
        bgColor: "bg-blue-50 border-blue-200 text-blue-900",
        badge: currentLang === 'kn' ? "ಭಾರಿ ಮಳೆ ಮುನ್ನೆಚ್ಚರಿಕೆ" : "Heavy Rain Warning",
        msg: currentLang === 'kn'
          ? `ಮುಂದಿನ ಗಂಟೆಗಳಲ್ಲಿ ಭಾರಿ ಮಳೆ (${rainChance || 80}% ಸಂಭವನೀಯತೆ). ಹೊಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ.`
          : `Heavy precipitation alert (${rainChance || 80}% chance). Inspect and clear farm drainage trenches to prevent crop waterlogging.`
      });
    }

    if (cur.humidity >= 75 && cur.temperature >= 22) {
      alerts.push({
        type: "pest",
        icon: "fa-solid fa-virus-covid text-rose-700",
        bgColor: "bg-rose-50 border-rose-200 text-rose-900",
        badge: currentLang === 'kn' ? "ಕೀಟ / ಎಲೆ ರೋಗ ಅಪಾಯ" : "Foliar Blight / Pest Risk",
        msg: currentLang === 'kn'
          ? `ಹೆಚ್ಚಿನ ತೇವಾಂಶ (${cur.humidity.toFixed(0)}%) ಮತ್ತು ಉಷ್ಣತೆಯು ಎಲೆ ರೋಗಕ್ಕೆ ಕಾರಣವಾಗಬಹುದು. 'ಎಲೆ ರೋಗ ತಪಾಸಣೆ' ಬಳಸಿ ಪರಿಶೀಲಿಸಿ.`
          : `High humidity (${cur.humidity.toFixed(0)}%) and seasonal warmth favor foliar fungal blight and stem borers. Inspect leaves with the Foliar Disease Scanner.`
      });
    }
  }

  if (alerts.length === 0) {
    alertContainer.innerHTML = '';
    alertContainer.classList.add('hidden');
    return;
  }

  alertContainer.classList.remove('hidden');
  alertContainer.innerHTML = alerts.map(a => `
    <div class="p-3.5 rounded-2xl border ${a.bgColor} flex items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shrink-0 shadow-xs text-sm">
          <i class="${a.icon}"></i>
        </div>
        <div>
          <span class="font-extrabold uppercase tracking-wider text-[10px] block">${a.badge}</span>
          <span class="font-medium">${a.msg}</span>
        </div>
      </div>
      <button type="button" onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-700 cursor-pointer p-1">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  `).join('');
}

// ============================================================================
// 6. DOM Shell & Navigation Header
// ============================================================================
export function renderDashboardShell(container, lang) {
  currentLang = lang;
  const t = I18N[lang] || I18N['en'];

  container.innerHTML = `
    <!-- Top Navigation Bar -->
    <header class="bg-[#1b5e20] text-white shadow-md sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-[#2e7d32] flex items-center justify-center text-amber-300 text-xl shadow-inner">
            <i class="fa-solid fa-seedling"></i>
          </div>
          <div>
            <h1 class="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span id="txt-app-title">${t.app_title}</span>
            </h1>
            <p class="text-[11px] text-emerald-200 hidden sm:block" id="txt-app-subtitle">${t.app_subtitle}</p>
          </div>
        </div>

        <div class="flex items-center space-x-2 sm:space-x-3">
          <!-- Foliar Disease Scanner Button -->
          <button id="btn-open-leaf-scanner" class="px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
            <i class="fa-solid fa-virus-covid"></i>
            <span class="hidden md:inline">${t.nav_leaf_scanner}</span>
          </button>

          <!-- Government Schemes Button -->
          <button id="btn-schemes" class="px-2.5 py-1.5 rounded-lg bg-[#2e7d32] hover:bg-[#33691e] text-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
            <i class="fa-solid fa-building-columns"></i>
            <span class="hidden md:inline">${t.nav_schemes}</span>
          </button>

          <!-- Past Runs History Button -->
          <button id="btn-history" class="px-2.5 py-1.5 rounded-lg bg-[#2e7d32] hover:bg-[#33691e] text-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
            <i class="fa-solid fa-clock-rotate-left"></i>
            <span class="hidden md:inline">${t.nav_history}</span>
          </button>

          <!-- Performance / Turbo Mode Toggle -->
          <button id="btn-toggle-perf" class="px-2.5 py-1 rounded-lg ${isPerformanceMode ? 'bg-amber-400 text-amber-950 font-bold shadow-xs' : 'bg-emerald-800 hover:bg-emerald-700 text-emerald-200'} text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer" title="Toggle Turbo Performance Mode (Faster loading & low battery usage)">
            <i class="fa-solid fa-bolt-lightning ${isPerformanceMode ? 'text-amber-950' : 'text-amber-300'}"></i>
            <span class="hidden md:inline">${isPerformanceMode ? 'Turbo Mode' : 'Fast Mode'}</span>
          </button>

          <!-- Trilingual Switcher (EN / ಕನ್ನಡ / हिंदी) -->
          <div class="inline-flex rounded-lg bg-[#0d3810] p-0.5 border border-emerald-800">
            <button id="lang-en" class="px-2 py-1 text-xs font-bold rounded-md ${lang === 'en' ? 'bg-[#2e7d32] text-white shadow-xs' : 'text-emerald-300'} transition cursor-pointer">EN</button>
            <button id="lang-kn" class="px-2 py-1 text-xs font-bold rounded-md ${lang === 'kn' ? 'bg-[#2e7d32] text-white shadow-xs' : 'text-emerald-300'} transition cursor-pointer">ಕನ್ನಡ</button>
            <button id="lang-hi" class="px-2 py-1 text-xs font-bold rounded-md ${lang === 'hi' ? 'bg-[#2e7d32] text-white shadow-xs' : 'text-emerald-300'} transition cursor-pointer">हिंदी</button>
          </div>

          <!-- User Logout -->
          <div class="flex items-center gap-2 pl-2 border-l border-emerald-800/80">
            <a href="/logout" id="btn-logout" class="px-2.5 py-1.5 rounded-lg bg-red-900/80 hover:bg-red-800 text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer" title="Sign Out">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
              <span class="hidden sm:inline">Logout</span>
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- 6-Step Workflow Stepper Navigation Header -->
    <div class="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex items-center justify-between overflow-x-auto pb-1 gap-2 no-scrollbar" id="stepper-bar">
          <button type="button" data-step="1" class="step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer bg-emerald-700 text-white shadow-xs">
            <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span>${t.step_loc}</span>
          </button>
          <div class="h-0.5 w-4 bg-slate-200 shrink-0"></div>

          <button type="button" data-step="2" class="step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer text-slate-600 hover:bg-slate-100">
            <span class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-700">2</span>
            <span>${t.step_weather}</span>
          </button>
          <div class="h-0.5 w-4 bg-slate-200 shrink-0"></div>

          <button type="button" data-step="3" class="step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer text-slate-600 hover:bg-slate-100">
            <span class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-700">3</span>
            <span>${t.step_soil}</span>
          </button>
          <div class="h-0.5 w-4 bg-slate-200 shrink-0"></div>

          <button type="button" data-step="4" class="step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer text-slate-600 hover:bg-slate-100">
            <span class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-700">4</span>
            <span>${t.step_farm}</span>
          </button>
          <div class="h-0.5 w-4 bg-slate-200 shrink-0"></div>

          <button type="button" data-step="5" class="step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer text-slate-600 hover:bg-slate-100">
            <span class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-700">5</span>
            <span>${t.step_last_crop}</span>
          </button>
          <div class="h-0.5 w-4 bg-slate-200 shrink-0"></div>

          <button type="button" data-step="6" class="step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer text-slate-600 hover:bg-slate-100">
            <span class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-700">6</span>
            <span>${t.step_results}</span>
          </button>
          <div class="h-0.5 w-4 bg-slate-200 shrink-0"></div>

          <button type="button" data-step="7" class="step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer text-slate-600 hover:bg-slate-100">
            <span class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-700">7</span>
            <span>${t.step_verify || (currentLang === 'kn' ? '೭. ಮಾರುಕಟ್ಟೆ ಮತ್ತು AI ಪರಿಶೀಲನೆ' : '7. Market & AI Verification')}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Real-Time Weather & Disease Warnings Alert Banner -->
    <div id="dashboard-alerts-banner" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-2 hidden"></div>

    <!-- Main Stepper Panels Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
      <div id="step-panels-container">
        <section id="panel-step-1" class="step-panel space-y-6"></section>
        <section id="panel-step-2" class="step-panel space-y-6 hidden"></section>
        <section id="panel-step-3" class="step-panel space-y-6 hidden"></section>
        <section id="panel-step-4" class="step-panel space-y-6 hidden"></section>
        <section id="panel-step-5" class="step-panel space-y-6 hidden"></section>
        <section id="panel-step-6" class="step-panel space-y-6 hidden"></section>
        <section id="panel-step-7" class="step-panel space-y-6 hidden"></section>
      </div>

      <!-- Stepper Bottom Navigation Bar -->
      <div class="flex items-center justify-between pt-4 border-t border-slate-200">
        <button type="button" id="btn-step-prev" class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition cursor-pointer hidden">
          ${t.btn_prev}
        </button>
        <div class="flex-1"></div>
        <button type="button" id="btn-step-next" class="px-6 py-2.5 rounded-xl bg-[#1b5e20] hover:bg-[#2e7d32] text-white font-bold text-sm shadow-md transition cursor-pointer">
          ${t.btn_next}
        </button>
      </div>
    </main>

    <!-- Global Footer -->
    <footer class="mt-auto py-5 border-t border-white/20 bg-black/50 backdrop-blur-md text-white/90 text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-slate-300">
          <i class="fa-solid fa-leaf text-emerald-400"></i>
          <span class="font-semibold">Farmer Decision Dashboard</span>
          <span class="text-white/40">•</span>
          <span>Precision Agronomy & AI Market Forecaster</span>
        </div>
        <div class="text-[11px] text-slate-300">
          <span>AI Precision Agriculture Platform</span>
        </div>
      </div>
    </footer>

    <!-- Foliar Leaf Disease Modal -->
    <div id="modal-leaf-scanner" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto border border-slate-100">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg">
              <i class="fa-solid fa-virus-covid"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">${t.heading_leaf_scanner}</h3>
              <p class="text-xs text-slate-500">Fine-tuned YOLOv11 Model (PlantVillage Benchmark: 86.2% Precision)</p>
            </div>
          </div>
          <button id="btn-close-leaf-modal" class="text-slate-400 hover:text-slate-600 text-xl cursor-pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Image Upload Box -->
          <div class="p-6 rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70 transition space-y-3 text-center cursor-pointer" onclick="document.getElementById('input-leaf-file').click()">
            <input type="file" id="input-leaf-file" accept="image/*" class="hidden" capture="environment" />
            <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 text-2xl flex items-center justify-center mx-auto">
              <i class="fa-solid fa-camera"></i>
            </div>
            <div class="text-sm font-bold text-slate-800">Upload Crop Leaf Photo</div>
            <p class="text-xs text-slate-500">${t.leaf_upload_hint}</p>
          </div>

          <!-- Leaf Rejection Alert -->
          <div id="leaf-reject-alert" class="hidden p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-1">
            <div class="font-bold text-rose-900 flex items-center gap-1.5">
              <span>❌</span> <span>${t.leaf_reject_title}</span>
            </div>
            <p class="text-rose-700">${t.leaf_reject_msg}</p>
          </div>

          <!-- Leaf Uncertainty Alert (<0.60 confidence) -->
          <div id="leaf-uncertain-alert" class="hidden p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
            <div class="font-bold text-amber-900 flex items-center gap-1.5">
              <span>⚠️</span> <span>${t.leaf_uncertain_msg}</span>
            </div>
          </div>

          <!-- Leaf Diagnosis Result Card -->
          <div id="leaf-diagnosis-card" class="hidden space-y-4 bg-earth-50 p-5 rounded-2xl border border-earth-200">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Diagnosis</span>
                <h4 id="leaf-diagnosis-name" class="text-lg font-extrabold text-slate-900"></h4>
              </div>
              <span id="leaf-confidence-badge" class="px-2.5 py-1 rounded-full text-xs font-bold"></span>
            </div>

            <!-- Annotated Bounding Box Image Preview -->
            <div class="text-center">
              <img id="leaf-annotated-img" class="max-h-60 mx-auto rounded-xl shadow-md border border-slate-200" src="" alt="Diagnosis preview" />
            </div>

            <div class="space-y-2 text-xs">
              <div class="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <span class="font-bold text-slate-800">Pathogen / Causative Agent:</span>
                <p id="leaf-pathogen-txt" class="text-slate-600"></p>
              </div>
              <div class="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <span class="font-bold text-slate-800">Visual Symptoms:</span>
                <p id="leaf-symptoms-txt" class="text-slate-600"></p>
              </div>
              <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span class="font-bold text-emerald-950">Recommended Treatment Guidance:</span>
                <p id="leaf-treatment-txt" class="text-emerald-900"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Government Schemes Modal -->
    <div id="modal-schemes" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-5 max-h-[88vh] overflow-y-auto border border-slate-100">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg">
              <i class="fa-solid fa-building-columns"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900">${t.modal_schemes_title}</h3>
              <p class="text-xs text-slate-500">Official Central & Karnataka State Subsidies</p>
            </div>
          </div>
          <button id="btn-close-schemes" class="text-slate-400 hover:text-slate-600 text-xl cursor-pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div id="schemes-list-content" class="space-y-3 text-xs">
          <div class="text-center py-8 text-slate-400">Loading verified agricultural schemes...</div>
        </div>
      </div>
    </div>

    <!-- Google History-Style Past Runs & Comparison Modal -->
    <div id="modal-history" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] flex flex-col border border-slate-100">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800">Recommendation History</h3>
              <p class="text-xs text-slate-500">Search, filter, reopen and manage saved farm runs</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Clear History Dropdown -->
            <div class="relative inline-block text-left">
              <button type="button" id="btn-clear-history-menu" class="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer">
                <i class="fa-solid fa-trash-can"></i>
                <span>Clear History</span>
                <i class="fa-solid fa-chevron-down text-[10px]"></i>
              </button>
              <div id="dropdown-clear-history" class="hidden absolute right-0 mt-1 w-44 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-30 text-xs">
                <button type="button" data-tf="hour" class="btn-clear-tf w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-700 transition font-medium">Delete Last Hour</button>
                <button type="button" data-tf="today" class="btn-clear-tf w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-700 transition font-medium">Delete Today</button>
                <button type="button" data-tf="all" class="btn-clear-tf w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-700 font-bold transition">Delete All Time</button>
              </div>
            </div>

            <button id="btn-close-history" class="text-slate-400 hover:text-slate-600 text-xl cursor-pointer p-1">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- Search & Filters Toolbar -->
        <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
          <div class="flex flex-col sm:flex-row items-center gap-2">
            <div class="relative flex-1 w-full">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400"></i>
              <input type="text" id="input-history-search" placeholder="Search by crop or location..." class="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-xs" />
            </div>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <select id="select-history-crop" class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600">
                <option value="">All Crops</option>
              </select>
              <button type="button" id="btn-toggle-history-dates" class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-100 transition whitespace-nowrap">
                <i class="fa-regular fa-calendar mr-1"></i> Dates
              </button>
            </div>
          </div>

          <!-- Collapsible Date Range Bar -->
          <div id="history-date-filter-row" class="hidden flex items-center gap-2 flex-wrap pt-1 border-t border-slate-200/60">
            <span class="text-slate-500 text-[11px]">From:</span>
            <input type="date" id="input-history-from" class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs" />
            <span class="text-slate-500 text-[11px]">To:</span>
            <input type="date" id="input-history-to" class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs" />
            <button type="button" id="btn-apply-history-filter" class="px-3 py-1 bg-emerald-700 text-white font-bold rounded-lg text-xs">Apply</button>
            <button type="button" id="btn-reset-history-filter" class="px-3 py-1 bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs">Reset</button>
          </div>
        </div>

        <!-- Multi-Select Action Banner (Appears when items are selected) -->
        <div id="history-selection-bar" class="hidden p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs animate-fadeIn">
          <div class="flex items-center gap-2">
            <span id="history-selected-count-badge" class="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold">0 selected</span>
            <span class="text-emerald-900 font-semibold">actions:</span>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="btn-history-bulk-delete" class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-1 shadow-xs cursor-pointer">
              <i class="fa-solid fa-trash"></i> <span>Delete Selected</span>
            </button>
            <button type="button" id="btn-history-compare" class="px-3 py-1.5 rounded-xl bg-[#1b5e20] hover:bg-[#2e7d32] text-white font-bold transition flex items-center gap-1 shadow-xs cursor-pointer">
              <i class="fa-solid fa-code-compare"></i> <span>Compare Selected</span>
            </button>
            <button type="button" id="btn-history-clear-selection" class="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-600 font-medium hover:bg-slate-100 transition cursor-pointer">
              Clear
            </button>
          </div>
        </div>

        <!-- Side-by-Side Comparison Output Container -->
        <div id="side-by-side-compare-table" class="space-y-3"></div>

        <!-- History Runs Content Container (Grouped by Today, Yesterday, Last 7 Days, Earlier) -->
        <div id="history-content-container" class="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
          <div class="text-center py-8 text-slate-400">Loading saved runs...</div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog for Clear History -->
    <div id="modal-confirm-clear" class="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-100 text-center">
        <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div>
          <h4 class="text-base font-bold text-slate-900" id="confirm-clear-title">Clear Recommendation History?</h4>
          <p class="text-xs text-slate-500 mt-1" id="confirm-clear-desc">Are you sure you want to delete your past runs? This action cannot be undone.</p>
        </div>
        <div class="flex items-center justify-center gap-2 pt-2">
          <button type="button" id="btn-cancel-clear" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer">Cancel</button>
          <button type="button" id="btn-confirm-clear" class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm cursor-pointer">Delete</button>
        </div>
      </div>
    </div>

    <!-- Share Searched Crops Modal -->
    <div id="modal-share" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 border border-slate-100 max-h-[92vh] flex flex-col">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg">
              <i class="fa-solid fa-share-nodes"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800">Share Searched Crops</h3>
              <p class="text-xs text-slate-500">Public link & direct messaging for farmers</p>
            </div>
          </div>
          <button id="btn-close-share" class="text-slate-400 hover:text-slate-600 text-xl cursor-pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Summary Preview Card -->
        <div id="share-card-preview" class="p-4 rounded-2xl bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] text-white space-y-2.5 text-xs shadow-sm">
          <div class="flex justify-between items-center text-[11px] text-emerald-200">
            <span id="share-preview-loc">Farm Plot</span>
            <span id="share-preview-date">Today</span>
          </div>
          <div class="font-extrabold text-base" id="share-preview-title">Top Crops Advisory</div>
          <div id="share-preview-crops" class="space-y-1 text-emerald-100"></div>
          <div class="pt-2 border-t border-white/20 flex justify-between font-bold text-amber-300">
            <span>Estimated Profit Margin:</span>
            <span id="share-preview-profit">₹0</span>
          </div>
        </div>

        <!-- Public Share URL & Copy Box -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-700 block">Read-Only Public Link (No Login Needed):</label>
          <div class="flex items-center gap-2">
            <input type="text" id="share-link-input" readonly class="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-600 select-all" />
            <button type="button" id="btn-copy-share-link" class="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-copy"></i>
              <span>Copy</span>
            </button>
          </div>
          <span id="copy-toast" class="hidden text-[11px] text-emerald-600 font-bold block">✓ Link copied to clipboard!</span>
        </div>

        <!-- Sharing Channels -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-700 block">Share Directly via:</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button type="button" id="btn-share-whatsapp" class="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer">
              <i class="fa-brands fa-whatsapp text-lg text-emerald-600"></i>
              <span>WhatsApp</span>
            </button>
            <button type="button" id="btn-share-sms" class="p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer">
              <i class="fa-solid fa-comment-sms text-lg text-blue-600"></i>
              <span>SMS</span>
            </button>
            <button type="button" id="btn-share-email" class="p-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer">
              <i class="fa-solid fa-envelope text-lg text-amber-600"></i>
              <span>Email</span>
            </button>
            <button type="button" id="btn-share-native" class="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer">
              <i class="fa-solid fa-share-nodes text-lg text-purple-600"></i>
              <span>More</span>
            </button>
          </div>
        </div>

        <!-- Revoke Link & Download Options -->
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button type="button" id="btn-download-share-card" class="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-download"></i> <span>Download Summary Card</span>
          </button>
          <button type="button" id="btn-revoke-share" class="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer text-[11px]">
            Revoke Public Link
          </button>
        </div>
      </div>
    </div>


    <!-- Floating Krishi Mitra AI Chat Button -->
    <button id="btn-krishi-chat" type="button" class="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-700 to-green-600 text-white shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition flex items-center justify-center cursor-pointer group" title="Chat with Krishi Mitra (ಕೃಷಿ ಮಿತ್ರ)">
      <div class="relative">
        <i class="fa-solid fa-robot text-2xl group-hover:hidden"></i>
        <i class="fa-solid fa-comments text-2xl hidden group-hover:inline"></i>
        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-white rounded-full animate-ping"></span>
        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-white rounded-full"></span>
      </div>
    </button>

    <!-- Krishi Mitra Chat Panel Modal / Drawer -->
    <div id="panel-krishi-chat" class="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 hidden flex-col overflow-hidden animate-fadeIn">
      <!-- Chat Header -->
      <div class="bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] text-white p-4 flex items-center justify-between shadow-xs">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl text-amber-300 shadow-inner">
            <i class="fa-solid fa-seedling"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-sm tracking-wide">Krishi Mitra</h3>
              <span class="text-[10px] bg-emerald-500/40 text-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">AI Active</span>
            </div>
            <p class="text-[11px] text-emerald-200">ಕೃಷಿ ಮಿತ್ರ • Agronomy Assistant</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button id="btn-chat-mute" type="button" class="p-2 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer" title="Toggle Voice (Mute/Unmute)">
            <i id="icon-chat-mute" class="fa-solid fa-volume-high text-xs"></i>
          </button>
          <button id="btn-chat-clear" type="button" class="p-2 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer" title="Clear Chat">
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
          <button id="btn-chat-close" type="button" class="p-2 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer" title="Close">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      </div>

      <!-- Quick Reply Chips -->
      <div class="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-[11px]">
        <button type="button" class="chat-quick-chip whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 font-medium transition cursor-pointer">How does this work?</button>
        <button type="button" class="chat-quick-chip whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 font-medium transition cursor-pointer">Explain my result</button>
        <button type="button" class="chat-quick-chip whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 font-medium transition cursor-pointer">Which fertilizer?</button>
        <button type="button" class="chat-quick-chip whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 font-medium transition cursor-pointer">Govt schemes</button>
        <button type="button" class="chat-quick-chip whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 font-medium transition cursor-pointer">Upload leaf photo</button>
      </div>

      <!-- Messages List -->
      <div id="chat-messages-list" class="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs"></div>

      <!-- Loading indicator -->
      <div id="chat-loading-indicator" class="hidden px-4 py-2 bg-slate-50/50 text-slate-400 text-xs flex items-center gap-2">
        <div class="flex space-x-1">
          <div class="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></div>
          <div class="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div class="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
        <span class="text-[11px] font-medium text-slate-500">Krishi Mitra is thinking...</span>
      </div>

      <!-- Input Form -->
      <form id="form-krishi-chat" class="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <button type="button" id="btn-chat-mic" class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 flex items-center justify-center transition cursor-pointer shrink-0" title="Voice Input (English / Kannada)">
          <i class="fa-solid fa-microphone text-sm"></i>
        </button>
        <input type="text" id="input-chat-msg" placeholder="Ask Krishi Mitra... / ಕೃಷಿ ಮಿತ್ರರನ್ನು ಕೇಳಿ..." class="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition" autocomplete="off" />
        <button type="submit" id="btn-chat-send" class="w-9 h-9 rounded-xl bg-[#1b5e20] hover:bg-[#2e7d32] text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs">
          <i class="fa-solid fa-paper-plane text-xs"></i>
        </button>
      </form>
    </div>
  `;

  bindShellListeners();
  renderCurrentStepView();
}

// ============================================================================
// 7. Step 1: Location with Leaflet OpenStreetMap
// ============================================================================
function renderLocationStepView(container) {
  const t = I18N[currentLang];

  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-[#1b5e20] text-2xl flex items-center justify-center shadow-inner">
            <i class="fa-solid fa-location-dot"></i>
          </div>
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-slate-900">${t.card_current_loc}</h2>
            <p class="text-xs text-slate-500">${t.pin_drag_hint}</p>
          </div>
        </div>
        <div class="flex flex-col items-start sm:items-end gap-1">
          <button type="button" id="btn-use-browser-gps" class="px-4 py-2 rounded-xl bg-[#1b5e20] hover:bg-[#2e7d32] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer">
            <i class="fa-solid fa-location-crosshairs"></i>
            <span>Detect My Location</span>
          </button>
          <span class="text-[10px] text-slate-500 flex items-center gap-1">
            <span>🔒</span> <span>Used only for real-time weather & crop planning (never tracked).</span>
          </span>
        </div>
      </div>

      <!-- Current Location Display Card & Text Element with id="location" -->
      <div class="p-5 rounded-2xl bg-earth-50 border border-earth-200 space-y-3">
        <div class="space-y-2 w-full">
          <div class="flex items-center justify-between">
            <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Detected Farm Location (Full Address)</label>
            <span class="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <i class="fa-solid fa-circle-check text-emerald-600"></i> Full Address
            </span>
          </div>
          <div class="flex items-start gap-2.5">
            <span class="text-xl pt-1 text-emerald-700">📍</span>
            <textarea id="location" rows="3" readonly class="w-full px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none resize-none shadow-xs leading-relaxed" placeholder="Detecting full address...">${farmContext.display_name}</textarea>
          </div>
          <div class="text-xs text-slate-500 font-mono flex items-center flex-wrap gap-3 pt-0.5">
            <span>Lat: <strong id="loc-display-lat" class="text-slate-700">${farmContext.lat.toFixed(4)}° N</strong></span>
            <span>Lon: <strong id="loc-display-lon" class="text-slate-700">${farmContext.lon.toFixed(4)}° E</strong></span>
            <span>Accuracy: <strong id="loc-display-acc" class="text-emerald-700">±${(farmContext.accuracy_meters || 20).toFixed(0)}m</strong></span>
            <span class="text-[10px] text-slate-400">⚡ Geolocation requires HTTPS or localhost</span>
          </div>
        </div>

        <!-- Real-time Location Detection Status Banner -->
        <div id="location-detect-status"></div>
      </div>

      <!-- Interactive Leaflet Map Container -->
      <div class="space-y-2">
        <div id="farm-leaflet-map" style="height: 340px; width: 100%; border-radius: 1.25rem; border: 1px solid #cbd5e1; z-index: 10;"></div>
      </div>

      <!-- Manual Village Search Bar (Full Width) -->
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">${t.lbl_village_search}</label>
        <div class="flex gap-2">
          <input type="text" id="input-search-place" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white" placeholder="e.g. Dharwad, Mandya, Belagavi, Davanagere" />
          <button type="button" id="btn-exec-search" class="px-4 bg-[#1b5e20] hover:bg-[#2e7d32] text-white text-xs font-bold rounded-xl transition cursor-pointer">
            ${t.btn_search}
          </button>
        </div>
        <div id="place-search-results" class="space-y-1 max-h-36 overflow-y-auto text-xs"></div>
      </div>

    </div>
  `;

  bindLocationStepListeners();
  setTimeout(initOrUpdateFarmMap, 100);
}

function bindLocationStepListeners() {
  const statusEl = document.getElementById("location-detect-status");

  const triggerLocationDetection = () => {
    // 2. Show loading state while detecting
    if (statusEl) {
      statusEl.innerHTML = `
        <div class="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-center gap-2">
          <i class="fa-solid fa-spinner fa-spin text-blue-600"></i>
          <span>Detecting your location...</span>
        </div>
      `;
    }

    // 1. Browser Geolocation API with enableHighAccuracy: true and 10s timeout
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          // 3 & 4. On success: get lat/lon, reverse geocode, display in #location and store in farmContext
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;

          await updateFarmPosition(lat, lon, accuracy, "gps");

          if (statusEl) {
            if (accuracy > 1000) {
              statusEl.innerHTML = `
                <div class="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between">
                  <span>⚠️ Approximate GPS location (±${(accuracy / 1000).toFixed(1)} km). Drag the green pin on the map to pinpoint your exact field.</span>
                </div>
              `;
            } else {
              statusEl.innerHTML = `
                <div class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between">
                  <span>✅ Location detected successfully: <strong>${farmContext.display_name}</strong> (±${Math.round(accuracy)}m).</span>
                </div>
              `;
            }
          }
        },
        async (err) => {
          console.warn("GPS Geolocation error:", err);
          let errorExplanation = "";

          // 5. Friendly error messages
          if (err.code === err.PERMISSION_DENIED || err.code === 1) {
            errorExplanation = `
              <div class="space-y-1">
                <div class="font-bold flex items-center gap-1.5 text-rose-900">
                  <span>🚫</span> <span>Location permission was denied.</span>
                </div>
                <p class="text-rose-800">To enable location: click the 🔒 lock / tune icon in your browser address bar → site permissions → allow <strong>Location</strong>, then click Retry.</p>
              </div>
            `;
          } else if (err.code === err.TIMEOUT || err.code === 3) {
            errorExplanation = `
              <div class="space-y-1">
                <div class="font-bold flex items-center gap-1.5 text-amber-900">
                  <span>⏱️</span> <span>Location request timed out (10-second limit).</span>
                </div>
                <p class="text-amber-800">Please check GPS signal or click Retry below.</p>
              </div>
            `;
          } else {
            errorExplanation = `
              <div class="space-y-1">
                <div class="font-bold flex items-center gap-1.5 text-amber-900">
                  <span>⚠️</span> <span>GPS position unavailable (${err.message || 'Weak signal'}).</span>
                </div>
              </div>
            `;
          }

          // 6. Fallback: estimate approximate location from IP
          if (statusEl) {
            statusEl.innerHTML = `
              <div class="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs space-y-2">
                ${errorExplanation}
                <div class="flex items-center justify-between pt-1 border-t border-amber-200">
                  <span class="text-slate-600">Resolving approximate location from IP network...</span>
                  <button type="button" id="btn-retry-gps" class="px-3 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-900 font-bold transition cursor-pointer">
                    🔄 Retry GPS
                  </button>
                </div>
              </div>
            `;
            const retryBtn = document.getElementById("btn-retry-gps");
            if (retryBtn) retryBtn.onclick = triggerLocationDetection;
          }

          try {
            const resp = await fetch("/api/ip-location");
            if (resp.ok) {
              const ip = await resp.json();
              if (ip.lat && ip.lon) {
                await updateFarmPosition(ip.lat, ip.lon, 2500, "network");
                if (statusEl) {
                  statusEl.innerHTML = `
                    <div class="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs space-y-2">
                      ${errorExplanation}
                      <div class="p-2 bg-white rounded-lg border border-amber-200 flex items-center justify-between flex-wrap gap-2">
                        <span>ℹ️ Location estimated: <strong>${farmContext.display_name}</strong> (approximate – based on network).</span>
                        <button type="button" id="btn-retry-gps-fallback" class="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-lg transition cursor-pointer">
                          🔄 Retry GPS
                        </button>
                      </div>
                    </div>
                  `;
                  const retryBtn = document.getElementById("btn-retry-gps-fallback");
                  if (retryBtn) retryBtn.onclick = triggerLocationDetection;
                }
                return;
              }
            }
          } catch (ipErr) {
            console.error("IP fallback failed:", ipErr);
          }

          if (statusEl) {
            statusEl.innerHTML = `
              <div class="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs">
                ⚠️ Could not detect position. Please drag the pin on the map or type your village below.
              </div>
            `;
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    } else {
      // 5. Unsupported browser message
      if (statusEl) {
        statusEl.innerHTML = `
          <div class="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs">
            ⚠️ Geolocation is not supported by your browser. Please type your location manually in the search box below.
          </div>
        `;
      }
      fetch("/api/ip-location")
        .then(r => r.json())
        .then(ip => {
          if (ip.lat && ip.lon) updateFarmPosition(ip.lat, ip.lon, 2500, "network");
        })
        .catch(() => {});
    }
  };

  const btnGps = document.getElementById("btn-use-browser-gps");
  if (btnGps) {
    btnGps.onclick = triggerLocationDetection;
  }

  // Auto-detect on first visit if not restored from a confirmed run
  if (farmContext.location_source === "initial") {
    triggerLocationDetection();
  }

  const btnSearch = document.getElementById("btn-exec-search");
  const inputSearch = document.getElementById("input-search-place");
  if (btnSearch && inputSearch) {
    const doSearch = async () => {
      const q = inputSearch.value.trim();
      if (!q) return;
      const resContainer = document.getElementById("place-search-results");
      resContainer.innerHTML = `<span class="text-slate-400">Searching OpenStreetMap...</span>`;
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ", India")}&limit=4`;
        const resp = await fetch(url, { headers: { 'User-Agent': 'FarmerDecisionDashboard/2.0' } });
        if (resp.ok) {
          const results = await resp.json();
          if (results.length === 0) {
            resContainer.innerHTML = `<span class="text-rose-600">No matching place found.</span>`;
            return;
          }
          resContainer.innerHTML = results.map(r => `
            <div class="p-2 bg-white rounded-lg border border-slate-200 hover:bg-emerald-50 cursor-pointer search-pick-item" data-lat="${r.lat}" data-lon="${r.lon}" data-name="${r.display_name}">
              <strong>${r.display_name.split(',')[0]}</strong> <span class="text-slate-400">(${r.display_name.split(',').slice(1, 3).join(',')})</span>
            </div>
          `).join('');

          document.querySelectorAll(".search-pick-item").forEach(item => {
            item.onclick = async () => {
              const lat = parseFloat(item.getAttribute("data-lat"));
              const lon = parseFloat(item.getAttribute("data-lon"));
              await updateFarmPosition(lat, lon, 25.0, "search");
              resContainer.innerHTML = '';
            };
          });
        }
      } catch (err) {
        resContainer.innerHTML = `<span class="text-rose-600">Search error. Try map pin.</span>`;
      }
    };
    btnSearch.onclick = doSearch;
    inputSearch.onkeydown = (e) => { if (e.key === 'Enter') doSearch(); };
  }
}

function renderLocationDisplayCards() {
  const v = document.getElementById("loc-display-village");
  const s = document.getElementById("loc-display-state");
  const latEl = document.getElementById("loc-display-lat");
  const lonEl = document.getElementById("loc-display-lon");
  const accEl = document.getElementById("loc-display-acc");
  const locInput = document.getElementById("location");

  if (v) v.innerText = farmContext.village || "Bengaluru";
  if (s) s.innerText = (farmContext.district ? farmContext.district + ", " : "") + farmContext.state;
  if (latEl) latEl.innerText = `${farmContext.lat.toFixed(4)}° N`;
  if (lonEl) lonEl.innerText = `${farmContext.lon.toFixed(4)}° E`;
  if (accEl) accEl.innerText = `±${(farmContext.accuracy_meters || 20).toFixed(0)}m`;
  if (locInput) {
    if (locInput.tagName === "INPUT" || locInput.tagName === "TEXTAREA") locInput.value = farmContext.display_name;
    else locInput.innerText = farmContext.display_name;
  }
}

// ============================================================================
// 8. Step 2: Weather & FAO-56 Irrigation Schedule
// ============================================================================
async function renderWeatherStepView(container) {
  const t = I18N[currentLang];

  if (!weatherData) {
    const sessionKey = `${farmContext.lat.toFixed(3)},${farmContext.lon.toFixed(3)}`;
    const cached = getFromSessionCache(`fdd_wx_${sessionKey}`);
    if (cached) {
      weatherData = cached;
    }
  }

  if (!weatherData) {
    container.innerHTML = `
      <div class="bg-white rounded-3xl p-10 text-center space-y-4 border border-slate-100 shadow-sm">
        <div class="inline-block animate-spin text-4xl text-emerald-600"><i class="fa-solid fa-cloud-sun"></i></div>
        <h3 class="text-base font-bold text-slate-800">Fetching live weather from Open-Meteo...</h3>
        <p class="text-xs text-slate-500">Querying live satellite micro-climate for coordinates (${farmContext.lat.toFixed(4)}, ${farmContext.lon.toFixed(4)}).</p>
      </div>
    `;
    await Promise.allSettled([
      fetchLiveWeather(farmContext.lat, farmContext.lon),
      fetchIrrigationSchedule()
    ]);
    if (currentStep === 2) renderWeatherStepView(container);
    return;
  }

  // If irrigation schedule is still pending in background, fetch without blocking UI
  if (!irrigationScheduleData) {
    fetchIrrigationSchedule().then(() => {
      if (currentStep === 2) {
        const schedEl = document.getElementById("irrigation-schedule-cards-container");
        if (schedEl && irrigationScheduleData) {
          renderWeatherStepView(container);
        }
      }
    });
  }

  // If 5-Year Weather Analysis is pending in background, fetch without blocking UI
  if (!weather5YrData && !weather5YrLoading) {
    fetch5YearWeatherAnalysis(farmContext.lat, farmContext.lon).then(() => {
      if (currentStep === 2) {
        renderWeatherStepView(container);
      }
    });
  }

  const cur = weatherData.current || {};
  const daily = weatherData.daily_7d || [];
  const isDay = cur.is_day !== undefined ? cur.is_day : 1;
  const dayNightBadge = isDay === 1
    ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-200/30 text-amber-100 text-[10px] font-bold">☀️ Daytime</span>`
    : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-900/40 text-indigo-100 text-[10px] font-bold">🌙 Nighttime</span>`;

  const lastUpdated = cur.last_updated || new Date().toLocaleTimeString();

  // 7-Day irrigation schedule cards
  const irriDays = (irrigationScheduleData && (irrigationScheduleData.daily_schedule || irrigationScheduleData.schedule_7d)) || [];
  const sowingAdvice = (irrigationScheduleData && (irrigationScheduleData.sowing_window_advice || irrigationScheduleData.sowing_window)) || {};
  const periods = weatherData.today_periods || {};
  const activePeriod = periods.current_period || "morning";
  const pastRain = weatherData.past_7d_rainfall_actual !== undefined ? weatherData.past_7d_rainfall_actual : 0;
  const nextRain = weatherData.forecast_7d_rainfall !== undefined ? weatherData.forecast_7d_rainfall : (weatherData.rainfall_7d_total || 0);

  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      
      <!-- Current Weather Hero Card -->
      <div class="bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] rounded-3xl p-6 sm:p-8 text-white space-y-5 shadow-md">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center space-x-4">
            <span class="text-5xl">${cur.icon || "⛅"}</span>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-3xl sm:text-4xl font-extrabold tracking-tight">${(cur.temperature || 24).toFixed(1)}°C</span>
                ${dayNightBadge}
              </div>
              <p class="text-sm text-emerald-100 font-medium">${cur.description || "Clear sky"}</p>
              <span class="text-[10px] text-emerald-200/80">Location: ${farmContext.village || "Bengaluru"} • Updated: ${lastUpdated}</span>
            </div>
          </div>

          <button type="button" id="btn-refresh-weather-step" class="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
            <i class="fa-solid fa-arrows-rotate"></i>
            <span>${t.btn_refresh_weather}</span>
          </button>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/20 text-xs">
          <div class="bg-white/10 rounded-2xl p-3">
            <span class="text-emerald-200 block text-[11px]">${t.lbl_humidity}</span>
            <span class="text-lg font-bold">${(cur.humidity || 50).toFixed(0)}%</span>
          </div>
          <div class="bg-white/10 rounded-2xl p-3">
            <span class="text-emerald-200 block text-[11px]">${t.lbl_wind}</span>
            <span class="text-lg font-bold">${(cur.wind_speed || 10).toFixed(1)} km/h</span>
          </div>
          <div class="bg-white/10 rounded-2xl p-3">
            <span class="text-emerald-200 block text-[11px]">Evapotranspiration (ET₀)</span>
            <span class="text-lg font-bold text-amber-200">${(cur.et0 || 4.2).toFixed(1)} mm/day</span>
          </div>
          <div class="bg-white/10 rounded-2xl p-3">
            <span class="text-emerald-200 block text-[11px]">${t.lbl_7d_rain}</span>
            <span class="text-lg font-bold text-amber-300">${(nextRain).toFixed(1)} mm</span>
          </div>
        </div>
      </div>

      <!-- Weather Alerts / Plain-Language Farm Actions -->
      ${(weatherData.alerts && weatherData.alerts.length > 0) ? `
        <div class="space-y-2">
          ${weatherData.alerts.map(a => `
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs space-y-1 text-amber-950">
              <div class="font-bold flex items-center gap-2">
                <span>⚠️</span> <span>${a.title || "Agro-Weather Alert"}</span>
              </div>
              <p class="font-medium">${a.message || a.action || ""}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Today's Time-of-Day Cards (Morning, Afternoon, Evening, Night) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Today's Time-of-Day Breakdown</h3>
          <span class="text-xs text-emerald-800 font-semibold">Active: <strong class="capitalize">${activePeriod}</strong></span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          ${['morning', 'afternoon', 'evening', 'night'].map(k => {
            const p = periods[k] || {};
            const tempVal = Number(p.temp_avg !== undefined ? p.temp_avg : (p.temp !== undefined ? p.temp : 24.0));
            const humVal = Number(p.humidity_avg !== undefined ? p.humidity_avg : (p.humidity !== undefined ? p.humidity : 55.0));
            const rainProb = Number(p.rain_prob_max !== undefined ? p.rain_prob_max : (p.rain_chance !== undefined ? p.rain_chance : 10.0));
            const rainMm = Number(p.rain_mm_total !== undefined ? p.rain_mm_total : (p.rain_mm !== undefined ? p.rain_mm : 0.0));
            const windSpeed = Number(p.wind_speed_max !== undefined ? p.wind_speed_max : (p.wind_kmh !== undefined ? p.wind_kmh : 8.0));
            const isActive = (k === activePeriod);
            const icon = k === 'morning' ? '🌅' : (k === 'afternoon' ? '☀️' : (k === 'evening' ? '🌆' : '🌙'));
            return `
              <div class="p-3.5 rounded-2xl border ${isActive ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-2 ring-emerald-400/30' : 'bg-slate-50 border-slate-200'} space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-800 flex items-center gap-1">${icon} <span class="capitalize">${k}</span></span>
                  ${isActive ? `<span class="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">NOW</span>` : ''}
                </div>
                <div class="text-base font-extrabold text-slate-900">${tempVal.toFixed(1)}°C</div>
                <div class="text-[11px] text-slate-600 space-y-0.5">
                  <div>Humidity: <strong>${Math.round(humVal)}%</strong></div>
                  <div>Rain Chance: <strong class="${rainProb > 30 ? 'text-blue-700 font-bold' : 'text-slate-700'}">${Math.round(rainProb)}% (${rainMm.toFixed(1)} mm)</strong></div>
                  <div>Wind: <strong>${windSpeed.toFixed(1)} km/h</strong></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 7-Day Micro-Climate Forecast Cards -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">7-Day Micro-Climate Forecast</h3>
          <span class="text-xs text-slate-500 font-medium">Open-Meteo High-Resolution Feed</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-xs">
          ${daily.map((d, idx) => {
            const isToday = idx === 0;
            const tMax = Number(d.max_temp !== undefined ? d.max_temp : (d.t_max !== undefined ? d.t_max : 28));
            const tMin = Number(d.min_temp !== undefined ? d.min_temp : (d.t_min !== undefined ? d.t_min : 19));
            const rSum = Number(d.rain_sum_mm !== undefined ? d.rain_sum_mm : (d.rain_mm !== undefined ? d.rain_mm : 0));
            const rProb = Number(d.rain_chance_pct !== undefined ? d.rain_chance_pct : (d.rain_prob !== undefined ? d.rain_prob : 0));
            return `
              <div class="p-3 rounded-2xl border ${isToday ? 'bg-emerald-50/70 border-emerald-400 shadow-xs' : 'bg-slate-50 border-slate-200'} text-center space-y-1.5 flex flex-col justify-between">
                <div>
                  <span class="text-[11px] font-bold ${isToday ? 'text-emerald-800' : 'text-slate-700'} block truncate">${d.day_name || d.date || 'Day'}</span>
                  <div class="text-2xl my-1">${d.icon || '⛅'}</div>
                  <span class="text-[10px] text-slate-500 font-medium block truncate">${d.condition || d.description || 'Mainly clear'}</span>
                </div>
                <div class="pt-1.5 border-t border-slate-200/60 text-[11px]">
                  <div class="font-extrabold text-slate-800">${tMax.toFixed(0)}° / <span class="text-slate-500 font-normal">${tMin.toFixed(0)}°</span></div>
                  <div class="text-[10px] ${rProb > 30 ? 'text-blue-700 font-bold' : 'text-slate-500'}">💧 ${Math.round(rProb)}% (${rSum.toFixed(1)}mm)</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Rainfall Comparison: Actual Past 7 Days vs Next 7 Days Forecast -->
      <div class="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-center">
        <div class="p-2.5 bg-white rounded-xl border border-blue-100">
          <span class="text-slate-500 text-[10px] block">Actual Past 7 Days Rain</span>
          <strong class="text-base text-blue-900">${pastRain.toFixed(1)} mm</strong>
          <span class="text-[10px] text-slate-400 block">Observed precipitation</span>
        </div>
        <div class="p-2.5 bg-white rounded-xl border border-blue-100">
          <span class="text-slate-500 text-[10px] block">Forecast Next 7 Days Rain</span>
          <strong class="text-base text-blue-900">${nextRain.toFixed(1)} mm</strong>
          <span class="text-[10px] text-slate-400 block">Satellite model prediction</span>
        </div>
        <div class="p-2.5 bg-white rounded-xl border border-blue-100">
          <span class="text-slate-500 text-[10px] block">14-Day Cumulative Rain</span>
          <strong class="text-base text-emerald-800">${(pastRain + nextRain).toFixed(1)} mm</strong>
          <span class="text-[10px] text-slate-400 block">Soil water balance index</span>
        </div>
      </div>

      <!-- Sowing Window Advisory Banner -->
      ${sowingAdvice.summary ? `
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <span>🌱 ${t.heading_sowing_window}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] ${sowingAdvice.status === 'optimal' ? 'bg-emerald-200 text-emerald-900 font-bold' : 'bg-amber-200 text-amber-900'}">${sowingAdvice.status}</span>
            </h4>
            <span class="text-[10px] text-slate-500">Source: Open-Meteo & FAO-56</span>
          </div>
          <p class="text-xs text-emerald-900 font-medium">${sowingAdvice.summary}</p>
        </div>
      ` : ''}

      <!-- 7-Day FAO-56 Smart Irrigation Schedule -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">${t.heading_irrigation_schedule}</h3>
          <span class="text-xs text-slate-500 font-medium">Method: <strong>${farmContext.irrigation}</strong> (${farmContext.land_acres} ac)</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
            <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th class="p-2.5">Date</th>
                <th class="p-2.5">ETc Water Need</th>
                <th class="p-2.5">Expected Rain</th>
                <th class="p-2.5">Irrigation Needed</th>
                <th class="p-2.5">Liters / Acre</th>
                <th class="p-2.5">Drip Run Time</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              ${irriDays.map(d => {
                const etc = Number(d.etc_water_demand_mm !== undefined ? d.etc_water_demand_mm : (d.crop_demand_etc_mm || 0));
                const rain = Number(d.forecast_rainfall_mm !== undefined ? d.forecast_rainfall_mm : (d.forecast_rain_mm || 0));
                const irr = Number(d.net_irrigation_depth_mm !== undefined ? d.net_irrigation_depth_mm : (d.irrigation_needed_mm || 0));
                const liters = Number(d.liters_needed_per_acre !== undefined ? d.liters_needed_per_acre : (d.irrigation_liters || 0));
                const runtime = Number(d.drip_runtime_hours !== undefined ? d.drip_runtime_hours : (d.duration_hours || 0));
                return `
                  <tr class="hover:bg-slate-50">
                    <td class="p-2.5 font-bold text-slate-800">${d.date || 'Day'}</td>
                    <td class="p-2.5 text-slate-600">${etc.toFixed(1)} mm</td>
                    <td class="p-2.5 text-blue-700 font-semibold">${rain.toFixed(1)} mm</td>
                    <td class="p-2.5 font-bold ${irr > 0 ? 'text-amber-700' : 'text-emerald-700'}">
                      ${irr.toFixed(1)} mm
                    </td>
                    <td class="p-2.5 font-bold text-slate-800">${Math.round(liters).toLocaleString()} L</td>
                    <td class="p-2.5 text-slate-600">${runtime.toFixed(1)} hrs</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 12-Month Climate Chart -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">${t.heading_historical_climate}</h3>
          <span class="text-xs text-slate-500 font-semibold">Annual Est: <strong class="text-slate-800">${(weatherData.annual_rainfall_estimate || 850).toFixed(0)} mm</strong></span>
        </div>
        <div class="h-56 w-full rounded-2xl border border-slate-200 p-3 bg-slate-50">
          <canvas id="chart-climate-canvas"></canvas>
        </div>
      </div>

      <!-- 5-Year Historical Weather Analysis (2021–2025) -->
      <div id="card-5yr-weather-analysis" class="space-y-4 pt-5 border-t border-slate-200">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>📊 ${t.heading_5yr_weather}</span>
              </h3>
              ${weather5YrData?.cached ? `<span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">⚡ Cached & Instant</span>` : (weather5YrData ? `<span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">🌐 Open-Meteo Archive</span>` : '')}
            </div>
            <p class="text-xs text-slate-500 font-medium">${t.subheading_5yr_weather}</p>
          </div>

          <!-- Chart Selector Tabs -->
          <div class="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold border border-slate-200 self-start sm:self-auto shadow-2xs">
            <button type="button" id="tab-5yr-rain" class="px-3 py-1.5 rounded-lg transition ${weather5YrActiveTab === 'rainfall' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              ${t.tab_monthly_rainfall}
            </button>
            <button type="button" id="tab-5yr-temp" class="px-3 py-1.5 rounded-lg transition ${weather5YrActiveTab === 'temp' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              ${t.tab_monthly_temp}
            </button>
            <button type="button" id="tab-5yr-comp" class="px-3 py-1.5 rounded-lg transition ${weather5YrActiveTab === 'comparison' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              ${t.tab_5yr_vs_current}
            </button>
          </div>
        </div>

        <!-- Chart Container with Loading/Error states -->
        <div id="container-5yr-chart-body" class="rounded-2xl border border-slate-200 p-4 bg-slate-50 min-h-[300px] flex flex-col justify-center">
          ${weather5YrLoading ? `
            <div class="py-16 text-center space-y-3">
              <div class="text-3xl text-emerald-600 animate-spin"><i class="fa-solid fa-spinner"></i></div>
              <p class="text-xs text-slate-600 font-bold">Fetching 5-year daily climate records from Open-Meteo (2021–2025)...</p>
              <p class="text-[11px] text-slate-400">Aggregating rainfall totals, temperature variations, and extreme weather events.</p>
            </div>
          ` : weather5YrError ? `
            <div class="py-12 text-center space-y-3 p-4">
              <div class="text-3xl text-amber-500"><i class="fa-solid fa-triangle-exclamation"></i></div>
              <p class="text-xs text-slate-700 font-bold">${weather5YrError}</p>
              <button type="button" id="btn-retry-5yr-fetch" class="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-sm hover:bg-emerald-800 transition">
                <i class="fa-solid fa-rotate-right mr-1"></i> ${t.btn_retry_5yr}
              </button>
            </div>
          ` : `
            <div class="h-64 sm:h-72 w-full">
              <canvas id="chart-5yr-weather-canvas"></canvas>
            </div>
          `}
        </div>

        <!-- Auto-Generated Agronomic Insights Under Charts -->
        ${(weather5YrData && !weather5YrLoading && !weather5YrError) ? `
          <div class="space-y-2 pt-1">
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>💡 ${t.insights_heading}</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              ${((currentLang === 'kn' ? (weather5YrData.insights_kn || weather5YrData.insights_en) : weather5YrData.insights_en) || []).map(ins => `
                <div class="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-xs text-slate-800 flex items-start gap-2.5">
                  <span class="text-base shrink-0">${ins.slice(0, 2)}</span>
                  <span class="font-medium leading-relaxed">${ins.slice(2).trim()}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

    </div>
  `;

  const btnRefresh = document.getElementById("btn-refresh-weather-step");
  if (btnRefresh) {
    btnRefresh.onclick = async () => {
      weatherData = null;
      await renderWeatherStepView(container);
    };
  }

  const update5YrTabsUI = () => {
    const bRain = document.getElementById("tab-5yr-rain");
    const bTemp = document.getElementById("tab-5yr-temp");
    const bComp = document.getElementById("tab-5yr-comp");
    if (!bRain || !bTemp || !bComp) return;
    const activeCls = ["bg-white", "text-emerald-800", "shadow-xs"];
    const inactiveCls = ["text-slate-600", "hover:text-slate-900"];

    [bRain, bTemp, bComp].forEach(btn => btn.classList.remove(...activeCls));
    [bRain, bTemp, bComp].forEach(btn => btn.classList.add(...inactiveCls));

    if (weather5YrActiveTab === 'rainfall') {
      bRain.classList.remove(...inactiveCls);
      bRain.classList.add(...activeCls);
    } else if (weather5YrActiveTab === 'temp') {
      bTemp.classList.remove(...inactiveCls);
      bTemp.classList.add(...activeCls);
    } else {
      bComp.classList.remove(...inactiveCls);
      bComp.classList.add(...activeCls);
    }
  };

  const tabRain = document.getElementById("tab-5yr-rain");
  const tabTemp = document.getElementById("tab-5yr-temp");
  const tabComp = document.getElementById("tab-5yr-comp");
  if (tabRain && tabTemp && tabComp) {
    tabRain.onclick = () => { weather5YrActiveTab = 'rainfall'; update5YrTabsUI(); render5YearWeatherChart(); };
    tabTemp.onclick = () => { weather5YrActiveTab = 'temp'; update5YrTabsUI(); render5YearWeatherChart(); };
    tabComp.onclick = () => { weather5YrActiveTab = 'comparison'; update5YrTabsUI(); render5YearWeatherChart(); };
  }

  const btnRetry5Yr = document.getElementById("btn-retry-5yr-fetch");
  if (btnRetry5Yr) {
    btnRetry5Yr.onclick = async () => {
      await fetch5YearWeatherAnalysis(farmContext.lat, farmContext.lon, true);
      if (currentStep === 2) renderWeatherStepView(container);
    };
  }

  renderClimateChart(weatherData.monthly_climate_12m);
  render5YearWeatherChart();
}

function renderClimateChart(data) {
  const canvas = document.getElementById("chart-climate-canvas");
  if (!canvas || !data || typeof Chart === 'undefined') return;

  if (climateChartInstance) {
    climateChartInstance.destroy();
  }

  climateChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.map(d => d.month),
      datasets: [
        {
          label: 'Rainfall (mm)',
          data: data.map(d => (d.rain_mm !== undefined ? d.rain_mm : (d.rainfall_mm !== undefined ? d.rainfall_mm : 0))),
          backgroundColor: '#3b82f6',
          borderRadius: 4,
          yAxisID: 'y'
        },
        {
          label: 'Avg Temp (°C)',
          data: data.map(d => (d.temp_avg !== undefined ? d.temp_avg : (d.temp_c !== undefined ? d.temp_c : 25))),
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b',
          type: 'line',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 } } } },
      scales: {
        y: { type: 'linear', position: 'left', title: { display: true, text: 'Rain (mm)', font: { size: 9 } } },
        y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Temp (°C)', font: { size: 9 } } }
      }
    }
  });
}

function render5YearWeatherChart() {
  const canvas = document.getElementById("chart-5yr-weather-canvas");
  if (!canvas || !weather5YrData || typeof Chart === 'undefined') return;

  if (weather5YrChartInstance) {
    weather5YrChartInstance.destroy();
  }

  const months = weather5YrData.months || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = weather5YrData.years || [2021, 2022, 2023, 2024, 2025];
  const yearColors = {
    "2021": { border: "#0284c7", bg: "rgba(2, 132, 199, 0.08)" },
    "2022": { border: "#10b981", bg: "rgba(16, 185, 129, 0.08)" },
    "2023": { border: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)" },
    "2024": { border: "#ef4444", bg: "rgba(239, 68, 68, 0.08)" },
    "2025": { border: "#8b5cf6", bg: "rgba(139, 92, 246, 0.08)" }
  };

  if (weather5YrActiveTab === 'rainfall') {
    const datasets = years.map(yr => ({
      label: `${yr} (${weather5YrData.annual_rain_by_year ? weather5YrData.annual_rain_by_year[yr] + ' mm' : yr})`,
      data: weather5YrData.monthly_rainfall_by_year ? (weather5YrData.monthly_rainfall_by_year[yr] || []) : [],
      borderColor: yearColors[yr]?.border || "#64748b",
      backgroundColor: yearColors[yr]?.bg || "transparent",
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 6
    }));

    if (weather5YrData.five_year_averages?.monthly_rainfall) {
      datasets.push({
        label: `5-Yr Average (${weather5YrData.five_year_averages.annual_rainfall_mm || 0} mm)`,
        data: weather5YrData.five_year_averages.monthly_rainfall,
        borderColor: "#0f172a",
        backgroundColor: "transparent",
        borderWidth: 3.5,
        borderDash: [6, 4],
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#0f172a"
      });
    }

    weather5YrChartInstance = new Chart(canvas, {
      type: 'line',
      data: { labels: months, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, weight: '600' } } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} mm`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Rainfall (mm)', font: { size: 11, weight: 'bold' } },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: { grid: { display: false } }
        }
      }
    });

  } else if (weather5YrActiveTab === 'temp') {
    const datasets = years.map(yr => ({
      label: `${yr} (avg ${weather5YrData.annual_temp_by_year ? weather5YrData.annual_temp_by_year[yr] + '°C' : yr})`,
      data: weather5YrData.monthly_temp_by_year ? (weather5YrData.monthly_temp_by_year[yr] || []) : [],
      borderColor: yearColors[yr]?.border || "#64748b",
      backgroundColor: yearColors[yr]?.bg || "transparent",
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 6
    }));

    if (weather5YrData.five_year_averages?.monthly_temperature) {
      datasets.push({
        label: `5-Yr Average (${weather5YrData.five_year_averages.annual_temp_c || 0}°C)`,
        data: weather5YrData.five_year_averages.monthly_temperature,
        borderColor: "#0f172a",
        backgroundColor: "transparent",
        borderWidth: 3.5,
        borderDash: [6, 4],
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#0f172a"
      });
    }

    weather5YrChartInstance = new Chart(canvas, {
      type: 'line',
      data: { labels: months, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, weight: '600' } } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}°C`
            }
          }
        },
        scales: {
          y: {
            title: { display: true, text: 'Temperature (°C)', font: { size: 11, weight: 'bold' } },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: { grid: { display: false } }
        }
      }
    });

  } else if (weather5YrActiveTab === 'comparison') {
    const avgRain = weather5YrData.five_year_averages?.monthly_rainfall || [];
    const curRain = weather5YrData.current_year_comparison?.monthly_rainfall || [];
    const avgTemp = weather5YrData.five_year_averages?.monthly_temperature || [];
    const curTemp = weather5YrData.current_year_comparison?.monthly_temperature || [];

    weather5YrChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            type: 'bar',
            label: '5-Yr Avg Rain (mm)',
            data: avgRain,
            backgroundColor: 'rgba(14, 165, 233, 0.65)',
            borderColor: '#0ea5e9',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            type: 'bar',
            label: '2026 Current Year Rain (mm)',
            data: curRain,
            backgroundColor: 'rgba(30, 64, 175, 0.85)',
            borderColor: '#1e40af',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: '5-Yr Avg Temp (°C)',
            data: avgTemp,
            borderColor: '#f59e0b',
            backgroundColor: '#f59e0b',
            borderWidth: 2,
            borderDash: [5, 4],
            tension: 0.3,
            yAxisID: 'y1'
          },
          {
            type: 'line',
            label: '2026 Current Year Temp (°C)',
            data: curTemp,
            borderColor: '#ef4444',
            backgroundColor: '#ef4444',
            borderWidth: 2.5,
            tension: 0.3,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, weight: '600' } } }
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            beginAtZero: true,
            title: { display: true, text: 'Rainfall (mm)', font: { size: 11, weight: 'bold' } },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Temperature (°C)', font: { size: 11, weight: 'bold' } },
            grid: { drawOnChartArea: false }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }
}

// ============================================================================
// 9. Step 3: Soil, SoilGrids Pre-fill & Fertilizer Plan Calculator
// ============================================================================
function renderSoilStepView(container) {
  const t = I18N[currentLang];

  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      
      <div class="space-y-1">
        <h2 class="text-lg sm:text-xl font-bold text-slate-900">${t.heading_soil_section}</h2>
        <p class="text-xs text-slate-500">${t.subheading_soil}</p>
      </div>

      <!-- ISRIC SoilGrids 2.0 Pre-Fill Card -->
      <div id="soilgrids-preview-card" class="p-5 rounded-2xl bg-earth-50 border border-earth-200 space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">🌍</span>
            <div>
              <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">${t.soilgrids_title}</h4>
              <span class="text-[10px] text-slate-500 font-mono">Location: ${farmContext.lat.toFixed(4)}° N, ${farmContext.lon.toFixed(4)}° E</span>
            </div>
          </div>
          <button type="button" id="btn-adopt-soilgrids" class="px-3 py-1.5 rounded-xl bg-[#1b5e20] hover:bg-[#2e7d32] text-white text-xs font-bold transition shadow-xs cursor-pointer">
            ${t.btn_adopt_soilgrids}
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div class="p-2.5 bg-white rounded-xl border border-slate-200">
            <span class="text-slate-500 text-[10px] block">pH Level</span>
            <strong id="sg-ph" class="text-slate-800">${soilgridsData ? soilgridsData.soil_ph : "6.8"}</strong>
          </div>
          <div class="p-2.5 bg-white rounded-xl border border-slate-200">
            <span class="text-slate-500 text-[10px] block">Sand %</span>
            <strong id="sg-sand" class="text-slate-800">${soilgridsData ? soilgridsData.sand_pct : "38"}%</strong>
          </div>
          <div class="p-2.5 bg-white rounded-xl border border-slate-200">
            <span class="text-slate-500 text-[10px] block">Clay %</span>
            <strong id="sg-clay" class="text-slate-800">${soilgridsData ? soilgridsData.clay_pct : "32"}%</strong>
          </div>
          <div class="p-2.5 bg-white rounded-xl border border-slate-200">
            <span class="text-slate-500 text-[10px] block">Org. Carbon</span>
            <strong id="sg-soc" class="text-slate-800">${soilgridsData ? soilgridsData.organic_carbon_g_kg : "12.4"} g/kg</strong>
          </div>
          <div class="p-2.5 bg-white rounded-xl border border-slate-200">
            <span class="text-slate-500 text-[10px] block">Soil Class</span>
            <strong id="sg-class" class="text-emerald-800 font-bold">${soilgridsData ? soilgridsData.soil_texture_class : "Clay Loam"}</strong>
          </div>
        </div>
      </div>

      <!-- Soil Health Card Inputs with Voice Input Mic Buttons -->
      <div class="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Soil Health Card Parameters</span>
          <span id="soil-source-badge" class="text-[11px] text-emerald-800 font-medium">Editable • Used for crop suitability and fertilizer dosages</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>${t.lbl_soil_n}</span>
              <button type="button" id="mic-soil-n" class="text-slate-400 hover:text-emerald-700 cursor-pointer text-xs"><i class="fa-solid fa-microphone"></i></button>
            </label>
            <input type="number" id="input-soil-n" value="${farmContext.soil_n !== null && farmContext.soil_n !== undefined ? farmContext.soil_n : ''}" placeholder="e.g. 85" min="0" max="300" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white" />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>${t.lbl_soil_p}</span>
              <button type="button" id="mic-soil-p" class="text-slate-400 hover:text-emerald-700 cursor-pointer text-xs"><i class="fa-solid fa-microphone"></i></button>
            </label>
            <input type="number" id="input-soil-p" value="${farmContext.soil_p !== null && farmContext.soil_p !== undefined ? farmContext.soil_p : ''}" placeholder="e.g. 45" min="0" max="250" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white" />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>${t.lbl_soil_k}</span>
              <button type="button" id="mic-soil-k" class="text-slate-400 hover:text-emerald-700 cursor-pointer text-xs"><i class="fa-solid fa-microphone"></i></button>
            </label>
            <input type="number" id="input-soil-k" value="${farmContext.soil_k !== null && farmContext.soil_k !== undefined ? farmContext.soil_k : ''}" placeholder="e.g. 42" min="0" max="300" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white" />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>${t.lbl_soil_ph}</span>
              <button type="button" id="mic-soil-ph" class="text-slate-400 hover:text-emerald-700 cursor-pointer text-xs"><i class="fa-solid fa-microphone"></i></button>
            </label>
            <input type="number" id="input-soil-ph" step="0.1" value="${farmContext.soil_ph !== null && farmContext.soil_ph !== undefined ? farmContext.soil_ph : ''}" placeholder="e.g. 6.8" min="4.0" max="9.5" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white" />
          </div>

          <div class="col-span-2 sm:col-span-1">
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">${t.lbl_soil_type}</label>
            <select id="input-soil-type-select" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white">
              <option value="" ${!farmContext.soil_type ? 'selected' : ''}>-- Select / Upload --</option>
              <option value="Red Soil" ${farmContext.soil_type === 'Red Soil' || farmContext.soil_type === 'Red Loam' ? 'selected' : ''}>Red Soil</option>
              <option value="Black Soil" ${farmContext.soil_type === 'Black Soil' || farmContext.soil_type === 'Black Cotton' ? 'selected' : ''}>Black Soil</option>
              <option value="Clay Loam" ${farmContext.soil_type === 'Clay Loam' ? 'selected' : ''}>Clay Loam</option>
              <option value="Alluvial Soil" ${farmContext.soil_type === 'Alluvial' || farmContext.soil_type === 'Alluvial Soil' ? 'selected' : ''}>Alluvial Soil</option>
              <option value="Sandy Loam" ${farmContext.soil_type === 'Sandy Loam' ? 'selected' : ''}>Sandy Loam</option>
              <option value="Laterite Soil" ${farmContext.soil_type === 'Laterite Soil' ? 'selected' : ''}>Laterite Soil</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Soil Photo Upload & Classification Gate Box -->
      <div class="p-6 rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70 transition space-y-4 text-center">
        <input type="file" id="input-soil-file" accept="image/jpeg,image/png,image/webp" class="hidden" capture="environment" />
        
        <div id="soil-upload-empty" class="space-y-3 cursor-pointer" onclick="document.getElementById('input-soil-file').click()">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-[#1b5e20] text-2xl flex items-center justify-center mx-auto shadow-inner">
            <i class="fa-solid fa-camera"></i>
          </div>
          <div>
            <div class="text-sm font-bold text-slate-800">${t.lbl_soil_photo_box}</div>
            <p class="text-xs text-slate-500">${t.soil_photo_hint}</p>
          </div>
        </div>

        <div id="soil-preview-box" class="hidden flex items-center justify-center gap-4 py-2">
          <img id="soil-preview-img" src="" alt="Soil Photo" class="w-20 h-20 object-cover rounded-2xl border-2 border-emerald-400 shadow-xs" />
          <div class="text-left">
            <button type="button" id="btn-retake-soil" class="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition shadow-xs cursor-pointer">
              📷 Retake / Upload Another
            </button>
          </div>
        </div>

        <!-- Non-Soil Strict Rejection Alert -->
        <div id="soil-rejection-alert" class="hidden p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-left space-y-1.5">
          <div class="font-bold text-rose-900 flex items-center gap-2">
            <span>❌</span> <span>Non-Soil Image Detected</span>
          </div>
          <p class="text-rose-800 font-semibold leading-relaxed">
            This doesn't look like a soil photo. Please upload a close-up of soil (top 5–10 cm, daylight, no plants/hands in frame).
          </p>
          <div id="soil-rejection-reason" class="text-[11px] text-rose-600 font-mono"></div>
        </div>

        <!-- Uncertainty Alert (<60%) -->
        <div id="soil-uncertain-alert" class="hidden p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-left space-y-1">
          <div class="font-bold text-amber-900">${t.lbl_uncertain_soil}</div>
        </div>

        <!-- Detailed Soil Report (When photo IS soil) -->
        <div id="soil-report-box" class="hidden text-left space-y-3"></div>
      </div>

      <!-- Interactive Fertilizer Plan Calculator Section -->
      <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-5">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">${t.heading_fertilizer_calc}</h3>
            <p class="text-xs text-slate-500">Calculates exact commercial bags (Urea, DAP, MOP, FYM) and split dosages</p>
          </div>
          <button type="button" id="btn-run-fertilizer-calc" class="px-4 py-2 rounded-xl bg-[#1b5e20] hover:bg-[#2e7d32] text-white text-xs font-bold transition shadow-xs cursor-pointer">
            ${t.btn_calc_fertilizer}
          </button>
        </div>

        <!-- Farm Size & Unit Inputs for Fertilizer Calculation -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">Farm Land Size</label>
            <div class="flex gap-2">
              <input type="number" id="input-fert-size" value="${farmContext.land_acres || 2.0}" min="0.1" step="0.1" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white" placeholder="e.g. 2.0" />
              <select id="select-fert-unit" class="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white">
                <option value="acres" selected>Acres</option>
                <option value="hectares">Hectares</option>
                <option value="gunthas">Gunthas</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">Target Crop for Plan</label>
            <select id="select-fert-crop" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white">
              <option value="maize" selected>Maize (Corn)</option>
              <option value="chickpea">Chickpea (Bengal Gram)</option>
              <option value="sunflower">Sunflower</option>
              <option value="ragi">Finger Millet (Ragi)</option>
              <option value="groundnut">Groundnut</option>
              <option value="tomato">Tomato</option>
              <option value="wheat">Wheat</option>
              <option value="cotton">Cotton</option>
            </select>
          </div>
        </div>

        <div id="fertilizer-calc-results" class="space-y-4">
          <div class="text-center py-4 text-xs text-slate-400">Specify farm size and click "Calculate Fertilizer Doses" to generate whole-farm commercial bag requirements.</div>
        </div>
      </div>

    </div>
  `;

  bindSoilStepListeners();
  setupVoiceInput("input-soil-n", "mic-soil-n");
  setupVoiceInput("input-soil-p", "mic-soil-p");
  setupVoiceInput("input-soil-k", "mic-soil-k");
  setupVoiceInput("input-soil-ph", "mic-soil-ph");
}

function bindSoilStepListeners() {
  const btnAdopt = document.getElementById("btn-adopt-soilgrids");
  if (btnAdopt) {
    btnAdopt.onclick = () => {
      const applyData = (sg) => {
        if (!sg) return;
        farmContext.soil_ph = sg.soil_ph || sg.ph || 6.8;
        farmContext.soil_type = sg.soil_texture_class || sg.soil_type || "Clay Loam";
        if (sg.estimated_n) farmContext.soil_n = sg.estimated_n;
        if (sg.estimated_p) farmContext.soil_p = sg.estimated_p;
        if (sg.estimated_k) farmContext.soil_k = sg.estimated_k;

        const phIn = document.getElementById("input-soil-ph");
        const typeSel = document.getElementById("input-soil-type-select");
        const nIn = document.getElementById("input-soil-n");
        const pIn = document.getElementById("input-soil-p");
        const kIn = document.getElementById("input-soil-k");

        if (phIn) phIn.value = farmContext.soil_ph;
        if (typeSel) typeSel.value = farmContext.soil_type;
        if (nIn) nIn.value = farmContext.soil_n;
        if (pIn) pIn.value = farmContext.soil_p;
        if (kIn) kIn.value = farmContext.soil_k;
        alert("Adopted ISRIC SoilGrids estimates into soil parameters!");
      };

      if (soilgridsData) {
        applyData(soilgridsData);
      } else {
        fetchSoilGridsEstimate(farmContext.lat, farmContext.lon).then(() => {
          applyData(soilgridsData);
        });
      }
    };
  }

  // Sync inputs to farmContext
  ["input-soil-n", "input-soil-p", "input-soil-k", "input-soil-ph"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.onchange = () => {
        farmContext.soil_n = parseFloat(document.getElementById("input-soil-n").value) || 85.0;
        farmContext.soil_p = parseFloat(document.getElementById("input-soil-p").value) || 45.0;
        farmContext.soil_k = parseFloat(document.getElementById("input-soil-k").value) || 42.0;
        farmContext.soil_ph = parseFloat(document.getElementById("input-soil-ph").value) || 6.8;
      };
    }
  });

  const soilTypeSelect = document.getElementById("input-soil-type-select");
  if (soilTypeSelect) {
    soilTypeSelect.onchange = () => {
      farmContext.soil_type = soilTypeSelect.value;
    };
  }

  // Soil Photo Upload handler
  const soilFileInput = document.getElementById("input-soil-file");
  const retakeBtn = document.getElementById("btn-retake-soil");
  if (retakeBtn && soilFileInput) {
    retakeBtn.onclick = () => soilFileInput.click();
  }

  if (soilFileInput) {
    soilFileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Client-side pre-validation
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit. Please upload an image under 10MB.");
        return;
      }

      const rejectAlert = document.getElementById("soil-rejection-alert");
      const rejectReason = document.getElementById("soil-rejection-reason");
      const uncertainAlert = document.getElementById("soil-uncertain-alert");
      const reportBox = document.getElementById("soil-report-box");
      const uploadEmpty = document.getElementById("soil-upload-empty");
      const previewBox = document.getElementById("soil-preview-box");
      const previewImg = document.getElementById("soil-preview-img");

      if (rejectAlert) rejectAlert.classList.add("hidden");
      if (uncertainAlert) uncertainAlert.classList.add("hidden");
      if (reportBox) reportBox.classList.add("hidden");

      // Show preview thumbnail
      if (previewBox && previewImg) {
        const objectUrl = URL.createObjectURL(file);
        previewImg.src = objectUrl;
        previewBox.classList.remove("hidden");
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const resp = await fetch("/api/photo/analyze-soil", { method: "POST", body: formData });
        if (resp.ok) {
          const res = await resp.json();

          // Soil Gate: Strict rejection of non-soil imagery
          if (res.is_soil === false || res.status === "not_soil") {
            if (rejectAlert) rejectAlert.classList.remove("hidden");
            if (rejectReason && res.reasons_if_rejected) {
              rejectReason.innerText = `Reason: ${res.reasons_if_rejected.join(', ')}`;
            }
            // Do NOT fill any soil values into inputs!
            return;
          }

          // If valid soil, show report and auto-fill
          if (res.is_soil === true) {
            const conf = res.confidence ? (res.confidence > 1 ? res.confidence : res.confidence * 100) : 85.0;
            const npkObj = res.npk || res.npk_kg_ha || {};
            const nVal = npkObj.n !== undefined ? npkObj.n : (npkObj.N !== undefined ? npkObj.N : (res.estimated_n || 120));
            const pVal = npkObj.p !== undefined ? npkObj.p : (npkObj.P !== undefined ? npkObj.P : (res.estimated_p || 35));
            const kVal = npkObj.k !== undefined ? npkObj.k : (npkObj.K !== undefined ? npkObj.K : (res.estimated_k || 160));
            const phVal = res.ph !== undefined ? res.ph : (res.estimated_ph || 6.5);
            const soilTypeName = res.soil_type || "Red Soil";

            farmContext.soil_type = soilTypeName;
            farmContext.soil_n = nVal;
            farmContext.soil_p = pVal;
            farmContext.soil_k = kVal;
            farmContext.soil_ph = phVal;

            // Auto-fill inputs and mark "(from photo)"
            const phIn = document.getElementById("input-soil-ph");
            const typeSel = document.getElementById("input-soil-type-select");
            const nIn = document.getElementById("input-soil-n");
            const pIn = document.getElementById("input-soil-p");
            const kIn = document.getElementById("input-soil-k");
            const sourceBadge = document.getElementById("soil-source-badge");

            if (phIn) phIn.value = phVal;
            if (typeSel) typeSel.value = soilTypeName;
            if (nIn) nIn.value = nVal;
            if (pIn) pIn.value = pVal;
            if (kIn) kIn.value = kVal;
            if (sourceBadge) {
              sourceBadge.innerHTML = `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">✨ Auto-filled (from photo) • Editable</span>`;
            }

            // Render Soil Report Box
            if (reportBox) {
              reportBox.innerHTML = `
                <div class="p-5 rounded-2xl bg-white border border-emerald-300 shadow-sm space-y-3">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xl">🔬</span>
                      <div>
                        <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Soil Classification Report</h4>
                        <span class="text-[10px] text-emerald-700 font-semibold">Identified: <strong>${soilTypeName}</strong> (${conf.toFixed(1)}% confidence)</span>
                      </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                      AI estimate from photo
                    </span>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span class="text-slate-500 text-[10px] block">Texture & Color</span>
                      <strong class="text-slate-800">${res.texture || 'Medium Loam'}</strong>
                      <span class="text-[10px] text-slate-500 block">${res.color || 'Dark Brown'}</span>
                    </div>
                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span class="text-slate-500 text-[10px] block">Moisture & OC</span>
                      <strong class="text-slate-800">${res.moisture || 'Adequate'}</strong>
                      <span class="text-[10px] text-slate-500 block">OC: ${res.organic_carbon || '0.68%'}</span>
                    </div>
                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span class="text-slate-500 text-[10px] block">Est. NPK Rating</span>
                      <strong class="text-slate-800">N:${nVal} P:${pVal} K:${kVal}</strong>
                      <span class="text-[10px] text-emerald-700 font-medium block">kg/ha (Medium)</span>
                    </div>
                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span class="text-slate-500 text-[10px] block">pH & EC</span>
                      <strong class="text-slate-800">pH ${phVal}</strong>
                      <span class="text-[10px] text-slate-500 block">EC: ${res.ec || '0.42 dS/m'}</span>
                    </div>
                  </div>

                  ${res.micronutrients ? `
                    <div class="text-[11px] text-slate-600 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between flex-wrap gap-2">
                      <span><strong>Micronutrient hints:</strong> Zinc (Zn): ${res.micronutrients.zinc || 'Normal'}, Iron (Fe): ${res.micronutrients.iron || 'Sufficient'}, Sulfur (S): ${res.micronutrients.sulfur || 'Adequate'}</span>
                    </div>
                  ` : ''}

                  ${res.suitable_crops ? `
                    <div class="text-[11px] text-slate-700">
                      <strong>Recommended crops for this soil:</strong> ${Array.isArray(res.suitable_crops) ? res.suitable_crops.join(', ') : res.suitable_crops}
                    </div>
                  ` : ''}

                  <div class="text-[10px] text-slate-400 italic">
                    AI estimate from photo – confirm with a soil health card / lab test. Values above are editable.
                  </div>
                </div>
              `;
              reportBox.classList.remove("hidden");
            }
          }
        }
      } catch (err) {
        console.error("Soil photo analysis error:", err);
      }
    };
  }

  // Fertilizer plan calculator button
  const btnRunFert = document.getElementById("btn-run-fertilizer-calc");
  if (btnRunFert) {
    btnRunFert.onclick = async () => {
      const sizeInput = document.getElementById("input-fert-size");
      const unitSelect = document.getElementById("select-fert-unit");
      const cropSelect = document.getElementById("select-fert-crop");
      const resContainer = document.getElementById("fertilizer-calc-results");

      let rawSize = parseFloat(sizeInput ? sizeInput.value : 0);
      const unit = unitSelect ? unitSelect.value : "acres";
      const crop = cropSelect ? cropSelect.value : (farmContext.previous_crop || "maize");

      if (isNaN(rawSize) || rawSize <= 0) {
        resContainer.innerHTML = `
          <div class="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold">
            ⚠️ Please enter a valid farm land size (> 0) to calculate fertilizer dosages.
          </div>
        `;
        return;
      }

      // Convert unit to acres
      let acres = rawSize;
      if (unit === "hectares") acres = rawSize * 2.471;
      else if (unit === "gunthas") acres = rawSize * 0.025;

      farmContext.land_acres = acres;

      resContainer.innerHTML = `<div class="text-center py-4 text-xs text-slate-500"><i class="fa-solid fa-spinner fa-spin"></i> Calculating nutrient deficit and commercial bags for ${acres.toFixed(2)} acres...</div>`;
      
      const plan = await fetchFertilizerPlan(crop);
      if (plan) {
        renderFertilizerPlanResults(resContainer, plan);
      } else {
        resContainer.innerHTML = `<div class="text-rose-600 text-xs">Failed to calculate fertilizer plan.</div>`;
      }
    };
  }
}

function renderFertilizerPlanResults(container, plan) {
  const comm = plan.commercial_fertilizers || {};
  const gap = plan.nutrient_gap_kg_per_acre || {};
  const farmGap = plan.whole_farm_nutrient_gap_kg || {};
  const phAlert = plan.ph_alert || {};
  const acres = plan.acres || farmContext.land_acres || 2.0;

  container.innerHTML = `
    <!-- Extreme pH Warning (Lime / Gypsum guidance) -->
    ${phAlert.warning ? `
      <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
        <div class="font-bold text-amber-900 flex items-center gap-1.5">
          <span>⚠️</span> <span>Extreme Soil pH Detected: ${plan.soil_ph}</span>
        </div>
        <p class="text-amber-800 font-semibold">${phAlert.amendment_needed}</p>
        <p class="text-amber-950 font-medium">${phAlert.guidance}</p>
      </div>
    ` : ''}

    <!-- Whole-Farm Commercial Fertilizer Bags Table -->
    <div class="space-y-3">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Commercial Fertilizer Dosage (${acres.toFixed(2)} Acres • ${plan.crop || 'Crop'})</span>
        <span class="text-xs font-bold text-emerald-800">Total Fertilizer Cost: ₹${comm.total_cost_inr ? comm.total_cost_inr.toLocaleString() : '0'}</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
        <div class="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
          <span class="text-slate-500 text-[10px] block">DAP (50kg bags)</span>
          <strong class="text-base text-slate-800">${comm.dap_bags || 0} bags</strong>
          <span class="text-[10px] text-slate-500 block">Total: ₹${(comm.dap_cost_inr || 0).toLocaleString()} (₹1,350/bag)</span>
        </div>

        <div class="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
          <span class="text-slate-500 text-[10px] block">Urea (45kg bags)</span>
          <strong class="text-base text-slate-800">${comm.urea_bags || 0} bags</strong>
          <span class="text-[10px] text-slate-500 block">Total: ₹${(comm.urea_cost_inr || 0).toLocaleString()} (₹266/bag)</span>
        </div>

        <div class="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
          <span class="text-slate-500 text-[10px] block">MOP (50kg bags)</span>
          <strong class="text-base text-slate-800">${comm.mop_bags || 0} bags</strong>
          <span class="text-[10px] text-slate-500 block">Total: ₹${(comm.mop_cost_inr || 0).toLocaleString()} (₹1,700/bag)</span>
        </div>

        <div class="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
          <span class="text-slate-500 text-[10px] block">FYM (Farm Compost)</span>
          <strong class="text-base text-slate-800">${comm.fym_organic_tons || comm.fym_tons || 0} tons</strong>
          <span class="text-[10px] text-slate-500 block">Total: ₹${(comm.fym_cost_inr || 0).toLocaleString()} (₹800/ton)</span>
        </div>
      </div>
    </div>

    <!-- Split-Dose Application Schedule -->
    <div class="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
      <span class="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">Split-Dose Application Timing:</span>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
        <div class="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
          <strong class="block text-emerald-950 font-bold">1. Basal (At Sowing)</strong>
          <span class="text-slate-600 block">100% DAP (${comm.dap_bags || 0} bags)</span>
          <span class="text-slate-600 block">100% MOP (${comm.mop_bags || 0} bags)</span>
          <span class="text-slate-600 block">33% Urea (${Math.round((comm.urea_bags || 0) * 0.33)} bags)</span>
          <span class="text-slate-600 block">All FYM Compost (${comm.fym_organic_tons || comm.fym_tons || 0} tons)</span>
        </div>
        <div class="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
          <strong class="block text-blue-950 font-bold">2. Vegetative (30 Days)</strong>
          <span class="text-slate-600 block">33% Urea (${Math.round((comm.urea_bags || 0) * 0.33)} bags) top-dressed</span>
          <span class="text-slate-500 block text-[10px]">Apply after first weeding / irrigation</span>
        </div>
        <div class="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
          <strong class="block text-amber-950 font-bold">3. Flowering (60 Days)</strong>
          <span class="text-slate-600 block">34% Urea (${Math.round((comm.urea_bags || 0) * 0.34)} bags) top-dressed</span>
          <span class="text-slate-500 block text-[10px]">Ensures grain filling and earhead size</span>
        </div>
      </div>
    </div>

    <!-- Step-by-Step Formula Breakdown -->
    <div class="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
      <span class="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">Formula Breakdown Behind Dosages:</span>
      <ul class="list-disc list-inside space-y-1 text-slate-600">
        ${(plan.formulas_explained || [
          `Nutrient Deficit N = (${plan.target_n_kg || 120} - ${plan.soil_n || 85}) × ${acres.toFixed(1)} ac = ${Math.round((farmGap.n_deficit_kg || 70))} kg N required.`,
          `DAP (18-46-0) supplies all required Phosphorus (${Math.round(farmGap.p_deficit_kg || 40)} kg P) in ${comm.dap_bags || 0} bags.`,
          `Urea (46% N) supplies remaining Nitrogen deficit after deducting N from DAP (${comm.urea_bags || 0} bags).`,
          `MOP (60% K2O) satisfies Potassium deficit (${Math.round(farmGap.k_deficit_kg || 50)} kg K) in ${comm.mop_bags || 0} bags.`
        ]).map(f => `<li>${f}</li>`).join('')}
      </ul>
      <div class="pt-2 text-[10px] text-amber-800 font-semibold">
        💡 Note: Always apply phosphorus and potash basal at sowing, and split urea doses at 30 & 60 days.
      </div>
    </div>

    <!-- Step-by-Step Formula Explanation -->
    <div class="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
      <span class="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">Formula Breakdown Behind Dosages:</span>
      <ul class="list-disc list-inside space-y-1 text-slate-600">
        ${(plan.formulas_explained || []).map(f => `<li>${f}</li>`).join('')}
      </ul>
      <div class="pt-2 text-[10px] text-amber-800 font-semibold">
        💡 Note: Always apply phosphorus and potash basal at sowing, and split urea doses at 30 & 60 days.
      </div>
    </div>
  `;
}

function renderSoilGridsBadge() {
  const phEl = document.getElementById("sg-ph");
  const sandEl = document.getElementById("sg-sand");
  const clayEl = document.getElementById("sg-clay");
  const socEl = document.getElementById("sg-soc");
  const classEl = document.getElementById("sg-class");

  if (phEl && soilgridsData) {
    phEl.innerText = soilgridsData.soil_ph || soilgridsData.ph || "6.8";
    sandEl.innerText = (soilgridsData.sand_pct || "45") + "%";
    clayEl.innerText = (soilgridsData.clay_pct || "28") + "%";
    socEl.innerText = (soilgridsData.organic_carbon_g_kg || soilgridsData.soc_g_kg || "18") + " g/kg";
    classEl.innerText = soilgridsData.soil_texture_class || soilgridsData.soil_type || "Clay Loam";
  }
}

// ============================================================================
// 10. Step 4: Farm Profile
// ============================================================================
function renderFarmStepView(container) {
  const t = I18N[currentLang];

  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      <div class="space-y-1">
        <h2 class="text-lg sm:text-xl font-bold text-slate-900">${t.heading_farm_profile}</h2>
        <p class="text-xs text-slate-500">Configure land parcel scale and financial constraints.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Land size -->
        <div class="p-5 rounded-2xl bg-earth-50 border border-earth-200 space-y-3">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>${t.lbl_land_size}</span>
            <button type="button" id="mic-farm-land" class="text-slate-400 hover:text-emerald-700 cursor-pointer text-xs"><i class="fa-solid fa-microphone"></i></button>
          </label>
          <div class="flex items-center gap-3">
            <input type="number" id="input-farm-land" step="0.5" min="0.5" max="100" value="${farmContext.land_acres}" class="w-24 px-3 py-2 text-base font-bold text-slate-800 border border-slate-300 rounded-xl bg-white" />
            <span class="text-sm text-slate-600 font-semibold">Acres</span>
          </div>
          <input type="range" id="slider-farm-land" min="0.5" max="25" step="0.5" value="${farmContext.land_acres}" class="w-full accent-emerald-700" />
        </div>

        <!-- Budget -->
        <div class="p-5 rounded-2xl bg-earth-50 border border-earth-200 space-y-3">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>${t.lbl_budget}</span>
            <button type="button" id="mic-farm-budget" class="text-slate-400 hover:text-emerald-700 cursor-pointer text-xs"><i class="fa-solid fa-microphone"></i></button>
          </label>
          <div class="flex items-center gap-2">
            <span class="text-base font-bold text-slate-500">₹</span>
            <input type="number" id="input-farm-budget" step="5000" min="5000" max="1000000" value="${farmContext.budget_inr}" class="w-full px-3 py-2 text-base font-bold text-slate-800 border border-slate-300 rounded-xl bg-white" />
          </div>
          <input type="range" id="slider-farm-budget" min="10000" max="300000" step="5000" value="${farmContext.budget_inr}" class="w-full accent-emerald-700" />
        </div>

        <!-- Irrigation -->
        <div class="p-5 rounded-2xl bg-earth-50 border border-earth-200 space-y-3">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">${t.lbl_irrigation}</label>
          <select id="select-farm-irrigation" class="w-full px-3 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 outline-none">
            <option value="drip" ${farmContext.irrigation === 'drip' ? 'selected' : ''}>Drip Irrigation (ಹನಿ ನೀರಾವರಿ)</option>
            <option value="sprinkler" ${farmContext.irrigation === 'sprinkler' ? 'selected' : ''}>Sprinkler (ತುಂತುರು ನೀರಾವರಿ)</option>
            <option value="borewell" ${farmContext.irrigation === 'borewell' ? 'selected' : ''}>Borewell (ಬೋರ್‌ವೆಲ್)</option>
            <option value="canal" ${farmContext.irrigation === 'canal' ? 'selected' : ''}>Canal (ಕಾಲುವೆ ನೀರಾವರಿ)</option>
            <option value="rainfed" ${farmContext.irrigation === 'rainfed' ? 'selected' : ''}>Rainfed (ಮಳೆಯಾಶ್ರಿತ)</option>
          </select>
          <p class="text-[11px] text-slate-500">Irrigation method dictates crop water suitability and reduces deficit risks.</p>
        </div>
      </div>
    </div>
  `;

  bindFarmStepListeners();
  setupVoiceInput("input-farm-land", "mic-farm-land");
  setupVoiceInput("input-farm-budget", "mic-farm-budget");
}

function bindFarmStepListeners() {
  const inLand = document.getElementById("input-farm-land");
  const slLand = document.getElementById("slider-farm-land");
  const inBud = document.getElementById("input-farm-budget");
  const slBud = document.getElementById("slider-farm-budget");
  const selIrr = document.getElementById("select-farm-irrigation");

  if (inLand && slLand) {
    inLand.oninput = () => {
      farmContext.land_acres = parseFloat(inLand.value) || 1.0;
      slLand.value = farmContext.land_acres;
    };
    slLand.oninput = () => {
      farmContext.land_acres = parseFloat(slLand.value);
      inLand.value = farmContext.land_acres;
    };
  }

  if (inBud && slBud) {
    inBud.oninput = () => {
      farmContext.budget_inr = parseFloat(inBud.value) || 20000;
      slBud.value = farmContext.budget_inr;
    };
    slBud.oninput = () => {
      farmContext.budget_inr = parseFloat(slBud.value);
      inBud.value = farmContext.budget_inr;
    };
  }

  if (selIrr) {
    selIrr.onchange = () => {
      farmContext.irrigation = selIrr.value;
    };
  }
}

// ============================================================================
// 11. Step 5: Crop Rotation
// ============================================================================
function renderRotationStepView(container) {
  const t = I18N[currentLang];

  const cropsList = [
    { key: "gram", name: "Gram / Chickpea", icon: "🌱" },
    { key: "soyabean", name: "Soybean", icon: "🌿" },
    { key: "vigna-radiati(Mung)", name: "Moong / Urad", icon: "🌾" },
    { key: "maize", name: "Maize / Corn", icon: "🌽" },
    { key: "rice", name: "Rice / Paddy", icon: "🍚" },
    { key: "cotton", name: "Cotton", icon: "🧶" },
    { key: "wheat", name: "Wheat", icon: "🌾" },
    { key: "sugarcane", name: "Sugarcane", icon: "🎋" },
    { key: "tomato", name: "Tomato", icon: "🍅" },
    { key: "chilli", name: "Chilli", icon: "🌶️" }
  ];

  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      <div class="space-y-1">
        <h2 class="text-lg sm:text-xl font-bold text-slate-900">${t.heading_rotation_section}</h2>
        <p class="text-xs text-slate-500">Select previous standing crop to adjust available nutrients and prevent pathogen cycles.</p>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">${t.lbl_select_previous}</label>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5" id="rotation-crop-chips">
          ${cropsList.map(c => `
            <button type="button" data-crop="${c.key}" class="rotation-chip p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${farmContext.previous_crop === c.key ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}">
              <span class="text-2xl">${c.icon}</span>
              <span class="text-[11px] font-bold leading-tight">${c.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll(".rotation-chip").forEach(btn => {
    btn.onclick = () => {
      farmContext.previous_crop = btn.getAttribute("data-crop");
      renderRotationStepView(container);
    };
  });
}

// ============================================================================
// 12. Step 6: Recommendations & 30-Day Mandi Price Trends
// ============================================================================
async function renderResultsStepView(container) {
  const t = I18N[currentLang];

  if (!recommendData) {
    container.innerHTML = `
      <div class="bg-white rounded-3xl p-8 sm:p-10 text-center space-y-6 border border-slate-100 shadow-sm max-w-xl mx-auto">
        <div class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-3xl mx-auto">
          <i class="fa-solid fa-wheat-awn animate-bounce"></i>
        </div>
        <div class="space-y-2">
          <h3 class="text-base sm:text-lg font-bold text-slate-800" id="progress-status-title">Calculating precision agronomic recommendations...</h3>
          <p class="text-xs text-slate-500" id="progress-status-desc">Applying soil N-P-K constraints, Open-Meteo weather models, and APMC mandi economics.</p>
        </div>
        <!-- Progress Bar -->
        <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
          <div id="rec-progress-bar" class="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-500 w-1/3"></div>
        </div>
        <div class="flex justify-between text-[11px] text-slate-400 font-medium px-1">
          <span>Soil & Climate</span>
          <span>Risk Scoring</span>
          <span>Economics & Sowing</span>
        </div>
      </div>
    `;

    // Progress bar animation step 1
    const pBar = document.getElementById("rec-progress-bar");
    const pTitle = document.getElementById("progress-status-title");
    if (pBar) pBar.style.width = "40%";

    try {
      const payload = {
        lat: farmContext.lat,
        lon: farmContext.lon,
        acres: farmContext.land_acres || 3.0,
        land_acres: farmContext.land_acres || 3.0,
        budget_inr: farmContext.budget_inr || 65000.0,
        irrigation: farmContext.irrigation || "drip",
        soil_type: farmContext.soil_type || "Clay Loam",
        soil_n: farmContext.soil_n !== null ? farmContext.soil_n : 85.0,
        soil_p: farmContext.soil_p !== null ? farmContext.soil_p : 45.0,
        soil_k: farmContext.soil_k !== null ? farmContext.soil_k : 42.0,
        soil_ph: farmContext.soil_ph !== null ? farmContext.soil_ph : 6.5,
        previous_crop: farmContext.previous_crop,
        state: farmContext.state || "Karnataka",
        district: farmContext.district || "Bengaluru",
        hist_5yr_rainfall: (weather5YrData && weather5YrData.five_year_averages) ? weather5YrData.five_year_averages.annual_rainfall_mm : undefined,
        hist_5yr_temp: (weather5YrData && weather5YrData.five_year_averages) ? weather5YrData.five_year_averages.annual_temp_c : undefined
      };

      if (pBar) pBar.style.width = "75%";
      if (pTitle) pTitle.innerText = "Ranking optimal crops by profit and risk...";

      const [res, _] = await Promise.all([
        fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }),
        fetchMandiTrends()
      ]);

      if (res && res.ok) {
        recommendData = await res.json();
        saveToSessionCache("fdd_recommend", recommendData);
      }
    } catch (err) {
      console.error("Recommend fetch error:", err);
    }

    if (pBar) pBar.style.width = "100%";
    if (currentStep === 6) renderResultsStepView(container);
    return;
  }

  const topCrops = ((recommendData && recommendData.top_crops) || []).slice(0, 3);
  const weatherFitCrops = (recommendData && recommendData.weather_fit_crops) || [];
  const alternativeCrops = (recommendData && recommendData.alternative_crops) || [];

  const renderCropCard = (c, rank) => {
    const riskBadgeColor = c.risk_badge === 'Low' ? 'bg-emerald-100 text-emerald-800' : (c.risk_badge === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800');
    const isTopCrop = (rank === 1);
    const cropName = currentLang === 'kn' ? (c.kannada_name || c.display_name) : (currentLang === 'hi' ? c.display_name : c.display_name);

    const fi = c.factor_importance || {
      soil_fit_pct: 95.8,
      rainfall_fit_pct: 88.0,
      temperature_fit_pct: 94.5,
      budget_fit_pct: 100.0,
      irrigation_fit_pct: 100.0
    };

    const rf = c.risk_factors || {
      drought_risk_pct: 15.0,
      flood_risk_pct: 10.0,
      price_risk_pct: 20.0
    };

    const be = c.break_even || {
      break_even_yield_qtl_ac: 7.0,
      break_even_price_inr_qtl: 650,
      break_even_total_qtl: 21.0,
      safety_margin_pct: 72.0
    };

    const pf = c.price_forecast || {
      current_modal: c.unit_price_inr || 2350,
      predicted_modal_30d: Math.round((c.unit_price_inr || 2350) * 1.03),
      forecast_range_min: Math.round((c.unit_price_inr || 2350) * 0.93),
      forecast_range_max: Math.round((c.unit_price_inr || 2350) * 1.07),
      trend_direction: "Upward / Bullish (+3%)"
    };

    return `
      <div class="crop-card bg-white rounded-3xl shadow-sm border ${isTopCrop ? 'border-emerald-400 ring-2 ring-emerald-500/20' : 'border-slate-200'} overflow-hidden transition hover:shadow-md space-y-4">
        <div class="p-5 sm:p-6 space-y-4">
          <!-- Card Header -->
          <div class="flex items-start justify-between flex-wrap gap-2">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-full ${isTopCrop ? 'bg-[#1b5e20] text-amber-300 ring-2 ring-amber-300/40' : 'bg-slate-700 text-white'} flex items-center justify-center font-bold text-sm shadow-xs">#${rank}</span>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-extrabold text-slate-900">${cropName}</h3>
                  ${isTopCrop ? `<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">Top Recommendation</span>` : ''}
                </div>
                <span class="text-xs text-slate-500 font-medium">${c.season} • ${c.duration_days} days • Water: ${c.water_need_level}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-full bg-emerald-50 text-[#1b5e20] border border-emerald-200 font-bold text-xs">
                ⭐ ${c.suitability_pct.toFixed(0)}% Confidence
              </span>
              <span class="px-2.5 py-1 rounded-full ${riskBadgeColor} font-bold text-xs">
                ${c.risk_badge || 'Low'} Risk
              </span>
            </div>
          </div>

          <!-- Economics Grid (Accurately scaled for farm acres) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div class="p-2.5 rounded-2xl bg-earth-50 border border-earth-200">
              <span class="text-slate-500 text-[10px] block">${t.yield}</span>
              <strong class="text-sm text-slate-800">${c.yield_per_acre_qtl.toFixed(1)} qtl/ac</strong>
              <span class="text-[10px] text-slate-500 block">Total: ${c.total_yield_qtl.toFixed(1)} qtl</span>
            </div>
            <div class="p-2.5 rounded-2xl bg-earth-50 border border-earth-200">
              <span class="text-slate-500 text-[10px] block">${t.cost}</span>
              <strong class="text-sm text-slate-800">₹${c.total_cost_inr.toLocaleString()}</strong>
              <span class="text-[10px] text-slate-500 block">₹${c.cost_per_acre_inr.toLocaleString()}/ac</span>
            </div>
            <div class="p-2.5 rounded-2xl bg-earth-50 border border-earth-200">
              <span class="text-slate-500 text-[10px] block">${t.revenue}</span>
              <strong class="text-sm text-slate-800">₹${c.total_revenue_inr.toLocaleString()}</strong>
              <span class="text-[10px] text-slate-500 block">₹${c.unit_price_inr.toLocaleString()}/qtl</span>
            </div>
            <div class="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span class="text-emerald-700 text-[10px] font-bold block">${t.profit}</span>
              <strong class="text-base text-emerald-900 font-black">₹${c.net_profit_inr.toLocaleString()}</strong>
              <span class="text-[10px] text-emerald-700 block">Net Margin (${farmContext.land_acres} ac)</span>
            </div>
          </div>

          <!-- "Why This Crop?" Panel (Feature Importance / Factors Match) -->
          <div class="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <i class="fa-solid fa-chart-pie text-emerald-700"></i>
                <span>Why This Crop? (Key Decision Factors & Agronomic Match)</span>
              </span>
              <span class="text-[10px] text-slate-500 font-semibold">Random Forest & Soil Grids SHAP</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
              <div class="p-2 bg-white rounded-xl border border-slate-200">
                <div class="flex justify-between text-slate-600 mb-1">
                  <span>Soil NPK Fit</span>
                  <strong class="text-slate-900">${fi.soil_fit_pct.toFixed(0)}%</strong>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-emerald-600 h-full rounded-full" style="width: ${fi.soil_fit_pct}%"></div>
                </div>
              </div>
              <div class="p-2 bg-white rounded-xl border border-slate-200">
                <div class="flex justify-between text-slate-600 mb-1">
                  <span>Rainfall Fit</span>
                  <strong class="text-slate-900">${fi.rainfall_fit_pct.toFixed(0)}%</strong>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-blue-600 h-full rounded-full" style="width: ${fi.rainfall_fit_pct}%"></div>
                </div>
              </div>
              <div class="p-2 bg-white rounded-xl border border-slate-200">
                <div class="flex justify-between text-slate-600 mb-1">
                  <span>Temp Fit</span>
                  <strong class="text-slate-900">${fi.temperature_fit_pct.toFixed(0)}%</strong>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-amber-600 h-full rounded-full" style="width: ${fi.temperature_fit_pct}%"></div>
                </div>
              </div>
              <div class="p-2 bg-white rounded-xl border border-slate-200">
                <div class="flex justify-between text-slate-600 mb-1">
                  <span>Budget Fit</span>
                  <strong class="text-slate-900">${fi.budget_fit_pct.toFixed(0)}%</strong>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-purple-600 h-full rounded-full" style="width: ${fi.budget_fit_pct}%"></div>
                </div>
              </div>
              <div class="p-2 bg-white rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                <div class="flex justify-between text-slate-600 mb-1">
                  <span>Irrigation Fit</span>
                  <strong class="text-slate-900">${fi.irrigation_fit_pct.toFixed(0)}%</strong>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-cyan-600 h-full rounded-full" style="width: ${fi.irrigation_fit_pct}%"></div>
                </div>
              </div>
            </div>
            <!-- Reasons List -->
            <ul class="text-xs text-slate-700 space-y-1 font-medium pt-1">
              ${c.reasons.map(r => `<li class="flex items-start gap-1.5"><span class="text-emerald-700 font-bold">✓</span><span>${r}</span></li>`).join('')}
            </ul>
          </div>

          <!-- Risk Score Breakdown & Break-Even Analysis -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <!-- Risk Breakdown -->
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span class="font-bold text-slate-800 text-[11px] block">⚠️ Multi-Factor Risk Score:</span>
              <div class="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div class="p-2 bg-white rounded-xl border border-slate-200">
                  <span class="text-slate-500 block">Drought Risk</span>
                  <strong class="${rf.drought_risk_pct > 25 ? 'text-amber-700' : 'text-emerald-700'} text-xs font-bold">${rf.drought_risk_pct.toFixed(0)}%</strong>
                </div>
                <div class="p-2 bg-white rounded-xl border border-slate-200">
                  <span class="text-slate-500 block">Flood Risk</span>
                  <strong class="${rf.flood_risk_pct > 25 ? 'text-amber-700' : 'text-emerald-700'} text-xs font-bold">${rf.flood_risk_pct.toFixed(0)}%</strong>
                </div>
                <div class="p-2 bg-white rounded-xl border border-slate-200">
                  <span class="text-slate-500 block">Price Volatility</span>
                  <strong class="${rf.price_risk_pct > 25 ? 'text-rose-700' : 'text-emerald-700'} text-xs font-bold">${rf.price_risk_pct.toFixed(0)}%</strong>
                </div>
              </div>
            </div>

            <!-- Break-Even Analysis -->
            <div class="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <span class="font-bold text-emerald-950 text-[11px] block">⚖️ Break-Even & Safety Margin:</span>
              <div class="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div class="p-2 bg-white rounded-xl border border-emerald-100">
                  <span class="text-slate-500 block">Break-even Yield</span>
                  <strong class="text-slate-900 text-xs font-bold">${be.break_even_yield_qtl_ac.toFixed(1)} qtl/ac</strong>
                </div>
                <div class="p-2 bg-white rounded-xl border border-emerald-100">
                  <span class="text-slate-500 block">Break-even Price</span>
                  <strong class="text-slate-900 text-xs font-bold">₹${be.break_even_price_inr_qtl.toLocaleString()}/qtl</strong>
                </div>
                <div class="p-2 bg-white rounded-xl border border-emerald-100">
                  <span class="text-slate-500 block">Safety Margin</span>
                  <strong class="text-emerald-800 text-xs font-bold">+${be.safety_margin_pct.toFixed(0)}%</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Crop Calendar & Schedules -->
          <div class="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-3 text-xs">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <span class="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <i class="fa-solid fa-calendar-days text-emerald-800"></i>
                <span>Crop Calendar & Advisory Milestones (${cropName})</span>
              </span>
              <span class="text-[10px] bg-emerald-100 text-[#1b5e20] px-2.5 py-0.5 rounded-full font-bold">
                Sowing: ${c.sowing_window || 'June 15 – July 15'} • Harvest: ${c.harvest_window || 'Oct 15 – Nov 15'}
              </span>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <!-- Fertilizer Schedule -->
              <div class="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <strong class="block text-emerald-900 font-bold flex items-center gap-1">
                  <i class="fa-solid fa-flask"></i> 3-Stage Fertilizer Schedule:
                </strong>
                <ul class="text-slate-600 space-y-1 pl-1">
                  ${(c.fertilizer_schedule || [
                    { stage: "Basal (Sowing)", desc: "100% P (DAP) + 100% K (MOP) + 33% N (Urea) with compost." },
                    { stage: "Vegetative (Day 30)", desc: "33% N (Urea) top-dressed after first mechanical weeding." },
                    { stage: "Flowering (Day 60)", desc: "Remaining 34% N + foliar micronutrient spray." }
                  ]).map(s => `<li>• <strong>${s.stage}:</strong> ${s.desc}</li>`).join('')}
                </ul>
              </div>

              <!-- Irrigation Schedule -->
              <div class="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <strong class="block text-blue-900 font-bold flex items-center gap-1">
                  <i class="fa-solid fa-droplet"></i> Smart Irrigation Schedule:
                </strong>
                <ul class="text-slate-600 space-y-1 pl-1">
                  ${(c.irrigation_schedule || [
                    { stage: "Initial / Sowing", frequency: "Days 0-10", guidance: "Light soaking for seedling emergence." },
                    { stage: "Tillering / Vegetative", frequency: "Every 7-10 days", guidance: "Maintain root-zone moisture." },
                    { stage: "Flowering & Grain Set", frequency: "Every 5-7 days", guidance: "Critical window; prevent moisture stress." }
                  ]).map(s => `<li>• <strong>${s.stage} (${s.frequency}):</strong> ${s.guidance}</li>`).join('')}
                </ul>
              </div>
            </div>

            <!-- Next Season Rotation Suggestion -->
            <div class="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-[11px] flex items-start gap-2">
              <i class="fa-solid fa-arrows-rotate text-purple-700 mt-0.5"></i>
              <div>
                <strong>Next Season Rotation Suggestion:</strong>
                <span>${c.rotation_suggestion || 'Rotate with Chickpea or Green Gram after harvest to restore soil biological nitrogen and disrupt fungal pathogen cycles.'}</span>
              </div>
            </div>
          </div>

          <!-- APMC Mandi Price Forecast Box -->
          <div class="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <span class="font-bold text-amber-950 text-[11px] flex items-center gap-1.5">
                <i class="fa-solid fa-chart-line text-amber-700"></i>
                <span>APMC Mandi Price Forecast (Next 30 Days):</span>
              </span>
              <span class="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold">
                ${pf.trend_direction}
              </span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div class="p-2 bg-white rounded-xl border border-amber-200">
                <span class="text-slate-500 block">Current Modal</span>
                <strong class="text-slate-900 text-xs font-bold">₹${pf.current_modal.toLocaleString()}/qtl</strong>
              </div>
              <div class="p-2 bg-white rounded-xl border border-amber-200">
                <span class="text-slate-500 block">Predicted (30d)</span>
                <strong class="text-emerald-800 text-xs font-bold">₹${pf.predicted_modal_30d.toLocaleString()}/qtl</strong>
              </div>
              <div class="p-2 bg-white rounded-xl border border-amber-200">
                <span class="text-slate-500 block">Forecast Range</span>
                <strong class="text-slate-900 text-xs font-bold">₹${pf.forecast_range_min.toLocaleString()} – ₹${pf.forecast_range_max.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          ${isTopCrop ? `
            <!-- Top Crop Action Bar: Voice Readout, WhatsApp Share, Print Advisory -->
            <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div class="flex items-center gap-2">
                <button type="button" id="btn-voice-readout" class="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-[#1b5e20] font-bold flex items-center gap-1.5 transition cursor-pointer">
                  <span>🔊</span> <span>Listen Advisory</span>
                </button>
                <button type="button" id="btn-share-whatsapp" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition cursor-pointer">
                  <span>💬</span> <span>Share on WhatsApp</span>
                </button>
              </div>
              <button type="button" id="btn-print-pdf-top" class="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold flex items-center gap-1.5 transition cursor-pointer">
                <span>🖨️</span> <span>Print Advisory</span>
              </button>
            </div>
          ` : ''}

        </div>
      </div>
    `;
  };

  container.innerHTML = `
    <div class="space-y-8">
      
      <!-- Section A: Top 3 Recommended Crops -->
      <section class="space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div>
            <h2 class="text-lg sm:text-xl font-extrabold text-slate-900">${t.heading_top_crops}</h2>
            <p class="text-xs text-slate-500">${t.subheading_top_crops}</p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="btn-share-results" class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition cursor-pointer active:scale-95">
              <i class="fa-solid fa-share-nodes"></i>
              <span>Share Result</span>
            </button>
            <button type="button" id="btn-download-pdf-report" class="px-4 py-2 rounded-xl bg-[#1b5e20] hover:bg-[#2e7d32] text-white font-bold text-xs shadow-md flex items-center gap-2 transition cursor-pointer">
              <i class="fa-solid fa-file-pdf text-amber-300"></i>
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>
        <div class="space-y-4">
          ${topCrops.length > 0 ? topCrops.map((c, i) => renderCropCard(c, i + 1)).join('') : '<p class="text-sm text-slate-500">No crops passed strict hard filters for this budget and climate.</p>'}
        </div>
      </section>

      <!-- Section B: Top 3 for Current Weather -->
      <section class="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h2 class="text-lg sm:text-xl font-extrabold text-slate-900">${t.heading_weather_fit}</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${weatherFitCrops.map(c => `
            <div class="p-5 rounded-3xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="font-extrabold text-slate-900 text-base">${currentLang === 'kn' ? c.kannada_name : c.display_name}</h4>
                <span class="text-xs bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-bold">${c.suitability_pct.toFixed(0)}% fit</span>
              </div>
              <div class="text-xs text-slate-600 space-y-1">
                <div>💧 Water need: <strong>${c.water_need_mm} mm</strong></div>
                <div>💰 Net profit: <strong class="text-emerald-800">₹${c.net_profit_inr.toLocaleString()}</strong></div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Section C: Nearest Mandi 30-Day Price Trends & Target Alert -->
      <section class="space-y-4 pt-4 border-t border-slate-200">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 class="text-lg sm:text-xl font-extrabold text-slate-900">${t.heading_mandi_prices}</h2>
            <p class="text-xs text-slate-500">${t.mandi_observation_note} (Date of last record: <strong>${mandiTrendsData ? mandiTrendsData.date_of_last_record : '2026-11-20'}</strong>)</p>
          </div>
          <span class="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-semibold border border-slate-200">
            ${t.sms_planned_badge}
          </span>
        </div>

        <!-- In-App Target Price Alert Banner -->
        <div id="mandi-price-alert-banner" class="hidden p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs"></div>

        <!-- Target Price Input & Alert Trigger -->
        <div class="p-5 rounded-2xl bg-earth-50 border border-earth-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <span class="text-xs font-bold text-slate-800">${t.lbl_target_price}</span>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-500">₹</span>
              <input type="number" id="input-target-price" value="${farmContext.target_price_inr}" step="100" class="w-32 px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-xl bg-white" />
              <button type="button" id="btn-save-target-price" class="px-3.5 py-1.5 bg-[#1b5e20] hover:bg-[#2e7d32] text-white text-xs font-bold rounded-xl transition cursor-pointer">
                ${t.btn_set_target}
              </button>
            </div>
          </div>

          <div class="text-xs text-slate-600 text-right">
            <div>Mandi: <strong class="text-slate-900">${mandiTrendsData ? mandiTrendsData.nearest_mandi : 'Hubli APMC'}</strong></div>
            <div>Latest Modal: <strong class="text-emerald-800 text-sm">₹${mandiTrendsData ? (mandiTrendsData.latest_price_inr || mandiTrendsData.modal_price) : '4850'}/qtl</strong></div>
          </div>
        </div>

        <!-- 30-Day Mandi Price Chart -->
        <div class="h-56 w-full rounded-2xl border border-slate-200 p-3 bg-slate-50">
          <canvas id="chart-mandi-canvas"></canvas>
        </div>
      </section>

      <!-- Navigation Callout to Step 7 -->
      <div class="p-6 rounded-3xl bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/20">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-900">NEXT ACTION STEP</span>
            <h4 class="text-base font-extrabold text-white">Step 7: 30-Day Market Prices & AI Verification Agent</h4>
          </div>
          <p class="text-xs text-emerald-100 max-w-xl">Inspect exact 30-day Mandi price trajectories (1 month ago vs today) for all recommended crops and verify feasibility with the Google Gemini / ChatGPT verification agent.</p>
        </div>
        <button type="button" id="btn-goto-step-7" class="shrink-0 px-6 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95">
          <span>Proceed to Step 7</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>

    </div>
  `;

  bindResultsStepListeners();
  const mandiPrices = mandiTrendsData ? (mandiTrendsData.historical_prices_30d || mandiTrendsData.trend_30d || []) : [];
  renderMandiChart(mandiPrices);
}

// ============================================================================
// Step 7: 30-Day Market Prices & AI Verification Agent State & Controllers
// ============================================================================
let step7PriceData = null;
let step7PriceLoading = false;
let step7ChartInstance = null;
let step7LLMStatus = {
  connected: false,
  provider: "local_engine",
  provider_name: "Local Agronomic Verification Engine",
  message: ""
};

let step7VerificationHistory = [
  {
    sender: "agent",
    text: "Namaskara! I am your AI Agronomic & Market Verification Agent. Ask me to verify recommended crops, analyze 30-day Mandi market price trends, or upload a photo of your field, soil card, or crop leaf.",
    text_kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಕೃಷಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಪರಿಶೀಲನಾ ಸಹಾಯಕ. ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳ ಸೂಕ್ತತೆ, 30 ದಿನಗಳ ಮಾರುಕಟ್ಟೆ ಧಾರಣೆ ಮತ್ತು ನೀವು ಅಪ್‌ಲೋಡ್ ಮಾಡುವ ಮಣ್ಣಿನ ಕಾರ್ಡ್/ಫೋಟೋವನ್ನು ಪರಿಶೀಲಿಸುತ್ತೇನೆ.",
    model_name: "AI Verification Agent",
    is_connected: false
  }
];
let step7UploadedBase64 = null;
let step7UploadedFileName = null;
let step7VoiceMuted = localStorage.getItem('fdd_verify_voice_muted') === 'true';

async function fetchStep7LLMStatus() {
  try {
    const res = await fetch("/api/verify/status");
    if (res.ok) {
      step7LLMStatus = await res.json();
      if (step7LLMStatus.connected && step7VerificationHistory.length === 1 && step7VerificationHistory[0].sender === "agent") {
        step7VerificationHistory[0].text = `Namaskara! I am your AI Agronomic & Market Verification Agent, live connected to ${step7LLMStatus.provider_name}. Ask me to verify recommended crops, analyze whether current Mandi prices are profitable, or upload field photos/documents for instant AI verification.`;
        step7VerificationHistory[0].text_kn = `ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಕೃಷಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಪರಿಶೀಲನಾ ಸಹಾಯಕ (${step7LLMStatus.provider_name} ಗೆ ಲೈವ್ ಸಂಪರ್ಕಿಸಲಾಗಿದೆ). ಬೆಳೆಗಳ ಸೂಕ್ತತೆ ಮತ್ತು 30 ದಿನಗಳ ಮಂಡಿ ಧಾರಣೆ ಪರಿಶೀಲಿಸಲು ಪ್ರಶ್ನಿಸಿ.`;
        step7VerificationHistory[0].model_name = step7LLMStatus.provider_name;
        step7VerificationHistory[0].is_connected = true;
      }
      const badge = document.getElementById("step7-llm-status-badge");
      if (badge) {
        if (step7LLMStatus.connected) {
          badge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5";
          badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>Live Connected: ${step7LLMStatus.provider_name}</span>`;
          badge.classList.remove("hidden");
        } else {
          badge.className = "hidden";
          badge.innerHTML = "";
        }
      }
    }
  } catch (e) {}
}

async function fetchStep7Prices(force = false) {
  if (step7PriceData && !force) return step7PriceData;
  step7PriceLoading = true;
  try {
    const cropsPayload = (recommendData && recommendData.top_crops && recommendData.top_crops.length > 0)
      ? recommendData.top_crops.map(c => ({
          name: (c.display_name || c.name || "maize").toLowerCase(),
          display_name: c.display_name,
          kannada_name: c.kannada_name,
          yield_per_acre_qtl: c.yield_per_acre_qtl || 20.0,
          suitability_pct: c.suitability_pct || 85.0
        }))
      : [
          { name: "maize", display_name: "Maize", kannada_name: "ಮೆಕ್ಕೆಜೋಳ", yield_per_acre_qtl: 24.0, suitability_pct: 92.0 },
          { name: "cotton", display_name: "Cotton", kannada_name: "ಹತ್ತಿ", yield_per_acre_qtl: 12.0, suitability_pct: 86.0 },
          { name: "ragi", display_name: "Finger Millet (Ragi)", kannada_name: "ರಾಗಿ", yield_per_acre_qtl: 16.0, suitability_pct: 84.0 }
        ];

    const res = await fetch("/api/prices/compare-30d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        crops: cropsPayload,
        lat: farmContext.lat,
        lon: farmContext.lon,
        land_acres: farmContext.land_acres || 3.0
      })
    });
    if (res.ok) {
      step7PriceData = await res.json();
    }
  } catch (e) {
    console.error("Step 7 prices fetch error:", e);
  } finally {
    step7PriceLoading = false;
  }
  return step7PriceData;
}

async function renderStep7MarketVerificationView(container) {
  if (!step7PriceData && !step7PriceLoading) {
    container.innerHTML = `
      <div class="py-16 text-center space-y-3 bg-white/90 backdrop-blur-md rounded-3xl border border-white/60 shadow-lg">
        <div class="text-3xl text-emerald-700 animate-spin"><i class="fa-solid fa-spinner"></i></div>
        <p class="text-xs text-slate-700 font-bold">Fetching 30-day historical Mandi prices & AI verification models...</p>
        <p class="text-[11px] text-slate-500">Comparing current modal rates against 1-month-ago benchmarks across Karnataka APMC hubs.</p>
      </div>
    `;
    await fetchStep7Prices();
  }

  const crops = step7PriceData ? step7PriceData.crops : [];
  const mandiName = step7PriceData ? step7PriceData.mandi_name : "Hubballi-Dharwad / Karnataka APMC Mandi Hub";

  container.innerHTML = `
    <div class="space-y-6 animate-fadeIn">
      
      <!-- Step 7 Header Banner -->
      <div class="bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/20">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-900 shadow-xs">
              STEP 7 • FINAL VERIFICATION
            </span>
            <span class="text-xs text-emerald-200 font-medium">30-Day Price Trajectory & Multi-Modal AI Agent</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight">
            ${currentLang === 'kn' ? '30 ದಿನಗಳ ಮಾರುಕಟ್ಟೆ ಧಾರಣೆ ಮತ್ತು AI ಪರಿಶೀಲನಾ ಸಹಾಯಕ' : '30-Day Market Prices & AI Verification Agent'}
          </h2>
          <p class="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            ${currentLang === 'kn' 
              ? 'ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳ 1 ತಿಂಗಳ ಹಿಂದಿನ ಬೆಲೆ vs ಇಂದಿನ ಧಾರಣೆಯನ್ನು ಪರಿಶೀಲಿಸಿ, ಮತ್ತು Google Gemini / ChatGPT ಪರಿಶೀಲನಾ ಸಹಾಯಕದೊಂದಿಗೆ ಧ್ವನಿ, ಪಠ್ಯ ಅಥವಾ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮೂಲಕ ದೃಢೀಕರಿಸಿ.'
              : 'Analyze factual 30-day Mandi price changes (1 month ago vs. current day) for recommended crops, and verify farm feasibility via text, voice, or photo upload with our Google Gemini & ChatGPT verification agent.'}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" id="btn-refresh-step7-prices" class="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-sm transition flex items-center gap-1.5 cursor-pointer shadow-xs" title="Refresh market data">
            <i class="fa-solid fa-arrows-rotate"></i>
            <span>Refresh Prices</span>
          </button>
        </div>
      </div>

      <!-- SECTION 1: Recommended Crops 30-Day Market Price History (1 Month Ago vs Today) -->
      <section class="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-lg space-y-5">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200/80 pb-3">
          <div>
            <h3 class="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <i class="fa-solid fa-chart-line text-emerald-700"></i>
              <span>${currentLang === 'kn' ? 'ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳ 30 ದಿನಗಳ ಮಾರುಕಟ್ಟೆ ಧಾರಣೆ ಹೋಲಿಕೆ' : 'Recommended Crops: 1 Month Ago vs. Current Day Prices'}</span>
            </h3>
            <p class="text-xs text-slate-500">Benchmark APMC: <strong>${mandiName}</strong> • Agmarknet & Data.gov.in Official Arrivals</p>
          </div>
          <span class="text-[11px] font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
            Factual Market History
          </span>
        </div>

        <!-- 30-Day Price Comparison Metric Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${crops.map(c => `
            <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="font-extrabold text-sm text-slate-900">${c.display_name}</h4>
                  <span class="text-xs text-slate-500">${c.kannada_name}</span>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  c.direction === 'up' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                }">
                  ${c.direction === 'up' ? '📈 +' : '📉 '}${c.change_pct}% (30d)
                </span>
              </div>

              <!-- Price Comparison Table Inside Card -->
              <div class="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span class="text-[10px] font-semibold text-slate-500 block uppercase">1 Month Ago</span>
                  <div class="text-sm font-extrabold text-slate-700">₹${c.price_1m_ago_inr.toLocaleString()}</div>
                  <span class="text-[10px] text-slate-400">per quintal</span>
                </div>
                <div class="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <span class="text-[10px] font-semibold text-emerald-800 block uppercase">Current Day</span>
                  <div class="text-sm font-extrabold text-emerald-900">₹${c.current_price_inr.toLocaleString()}</div>
                  <span class="text-[10px] text-emerald-700 font-bold">${c.diff_inr >= 0 ? '+' : ''}₹${c.diff_inr}/qtl</span>
                </div>
              </div>

              <!-- Revenue on Farmer's Land -->
              <div class="p-2.5 rounded-xl bg-earth-50 border border-earth-100 text-xs flex items-center justify-between">
                <span class="text-[11px] text-slate-600 font-medium">Est. Revenue (${c.total_yield_qtl.toFixed(0)} qtl):</span>
                <strong class="text-emerald-950 font-bold">₹${c.current_revenue_inr.toLocaleString()}</strong>
              </div>

              <!-- Commentary -->
              <p class="text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                ${currentLang === 'kn' ? c.summary_kn : c.summary_en}
              </p>
            </div>
          `).join('')}
        </div>

        <!-- 30-Day Multi-Line Chart -->
        <div class="pt-2">
          <div class="flex items-center justify-between pb-2 text-xs">
            <span class="font-extrabold text-slate-700">30-Day Daily Modal Price Trajectory (₹/qtl)</span>
            <span class="text-[11px] text-slate-400">Past 30 Days to Current Day</span>
          </div>
          <div class="h-64 sm:h-72 w-full rounded-2xl border border-slate-200 p-4 bg-slate-50">
            <canvas id="chart-step7-compare-canvas"></canvas>
          </div>
        </div>
      </section>

      <!-- SECTION 2: AI Agronomic & Market Verification Agent (Connected to Gemini / ChatGPT) -->
      <section class="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-lg space-y-5">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200/80 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center text-xl shadow-md">
              <i class="fa-solid fa-robot"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base sm:text-lg font-extrabold text-slate-900">
                  ${currentLang === 'kn' ? 'AI ಬೆಳೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಪರಿಶೀಲನಾ ಸಹಾಯಕ' : 'AI Crop & Market Verification Agent'}
                </h3>
                <span id="step7-llm-status-badge" class="${step7LLMStatus.connected ? 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5' : 'hidden'}">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live Connected: ${step7LLMStatus.provider_name}</span>
                </span>
              </div>
              <p class="text-xs text-slate-500">Multi-Modal Agronomy Verification • Text, Speech & Document/Photo Upload</p>
            </div>
          </div>

          <!-- Audio Mute / Unmute Toggle Button -->
          <div class="flex items-center gap-2">
            <button type="button" id="btn-step7-mute" class="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer" title="Toggle audio responses">
              <i id="icon-step7-mute" class="fa-solid ${step7VoiceMuted ? 'fa-volume-xmark text-rose-500' : 'fa-volume-high text-emerald-700'}"></i>
              <span id="text-step7-mute">${step7VoiceMuted ? 'Audio: Muted' : 'Audio: Active'}</span>
            </button>
          </div>
        </div>

        <!-- Verification Dialogue / History Stream -->
        <div id="step7-dialogue-stream" class="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 max-h-80 overflow-y-auto text-xs">
          ${step7VerificationHistory.map(m => `
            <div class="flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}">
              <div class="max-w-[85%] rounded-2xl p-3.5 ${
                m.sender === 'user'
                  ? 'bg-emerald-700 text-white rounded-br-xs shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs space-y-1'
              }">
                <div class="flex items-center gap-2 font-bold text-[11px] ${m.sender === 'user' ? 'text-emerald-100' : 'text-emerald-800'}">
                  <i class="fa-solid ${m.sender === 'user' ? 'fa-user' : 'fa-certificate'}"></i>
                  <span>${m.sender === 'user' ? 'Farmer' : (m.model_name || 'AI Verification Agent')}</span>
                  ${m.is_connected ? '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-full font-semibold">Live Cloud</span>' : ''}
                </div>
                <p class="leading-relaxed whitespace-pre-wrap">${currentLang === 'kn' && m.text_kn ? m.text_kn : m.text}</p>
                ${m.image_name ? `
                  <div class="mt-2 text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                    <i class="fa-solid fa-file-image text-emerald-600"></i>
                    <span>Attached Document: ${m.image_name}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Quick Verification Chips -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button type="button" class="step7-quick-chip whitespace-nowrap px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 font-medium transition cursor-pointer">
            🤖 Have you connected or not?
          </button>
          <button type="button" class="step7-quick-chip whitespace-nowrap px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 font-medium transition cursor-pointer">
            🔍 Verify 1-month price trend & best selling time
          </button>
          <button type="button" class="step7-quick-chip whitespace-nowrap px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 font-medium transition cursor-pointer">
            🌱 Verify soil NPK suitability for top crop
          </button>
          <button type="button" class="step7-quick-chip whitespace-nowrap px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 font-medium transition cursor-pointer">
            💰 Verify expected revenue on my farm acres
          </button>
        </div>

        <!-- Uploaded Document Preview Bar (if file selected) -->
        <div id="step7-upload-preview" class="${step7UploadedFileName ? '' : 'hidden'} p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-file-circle-check text-emerald-700 text-base"></i>
            <span id="step7-upload-filename" class="font-bold text-slate-800">${step7UploadedFileName || ''}</span>
          </div>
          <button type="button" id="btn-step7-remove-upload" class="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer">
            Remove
          </button>
        </div>

        <!-- Verification Input Controls: Photo/Document Upload + Mic + Text Form -->
        <form id="form-step7-verify" class="flex items-center gap-2 pt-2">
          <!-- Hidden File Upload Input -->
          <input type="file" id="input-step7-upload" accept="image/*,.pdf" class="hidden" />
          
          <!-- Upload Button -->
          <button type="button" id="btn-step7-choose-upload" class="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0" title="Upload Soil Card, Leaf Photo, or Mandi Receipt">
            <i class="fa-solid fa-cloud-arrow-up text-sm text-emerald-700"></i>
            <span class="hidden sm:inline">Upload Photo/Doc</span>
          </button>

          <!-- Voice Mic Button -->
          <button type="button" id="btn-step7-mic" class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-slate-200 flex items-center justify-center transition cursor-pointer shrink-0" title="Speak your question (English or Kannada)">
            <i class="fa-solid fa-microphone text-sm"></i>
          </button>

          <!-- Text Input -->
          <input type="text" id="input-step7-msg" placeholder="${currentLang === 'kn' ? 'ಬೆಳೆ ಅಥವಾ ಧಾರಣೆ ಬಗ್ಗೆ ಪ್ರಶ್ನಿಸಿ / ಅಪ್‌ಲೋಡ್ ಮಾಡಿ...' : 'Ask to verify recommended crops or market trends...'}" class="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />

          <!-- Submit Button -->
          <button type="submit" id="btn-step7-send" class="px-5 py-2.5 rounded-xl bg-[#1b5e20] hover:bg-[#2e7d32] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0">
            <span>Verify</span>
            <i class="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </form>
      </section>

      <!-- Stepper Footer Action Navigation -->
      <div class="flex items-center justify-between pt-4 border-t border-slate-200">
        <button type="button" onclick="navigateToStep(6)" class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition cursor-pointer">
          ⬅️ Back to Recommendations
        </button>
        <button type="button" onclick="window.print()" class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer">
          <i class="fa-solid fa-print"></i>
          <span>Print Advisory</span>
        </button>
      </div>

    </div>
  `;

  bindStep7Listeners(container);
  renderStep7ComparisonChart(crops);
  fetchStep7LLMStatus();
}

function renderStep7ComparisonChart(crops) {
  const canvas = document.getElementById("chart-step7-compare-canvas");
  if (!canvas || !crops || crops.length === 0 || typeof Chart === 'undefined') return;

  if (step7ChartInstance) {
    step7ChartInstance.destroy();
  }

  const sampleTrend = crops[0].trend_30d || [];
  const labels = sampleTrend.map(d => d.display_date || d.date);

  const colors = [
    { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    { border: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' }
  ];

  const datasets = crops.slice(0, 4).map((c, idx) => {
    const col = colors[idx % colors.length];
    return {
      label: `${c.display_name} (₹/qtl)`,
      data: (c.trend_30d || []).map(d => d.price_inr),
      borderColor: col.border,
      backgroundColor: col.bg,
      borderWidth: 2.5,
      tension: 0.3,
      pointRadius: 2,
      pointHoverRadius: 5,
      fill: false
    };
  });

  step7ChartInstance = new Chart(canvas, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString()}/qtl`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: {
          title: { display: true, text: 'Modal Price (₹/qtl)', font: { size: 10, weight: 'bold' } },
          ticks: { callback: v => `₹${v.toLocaleString()}` }
        }
      }
    }
  });
}

function bindStep7Listeners(container) {
  const btnRefresh = document.getElementById("btn-refresh-step7-prices");
  if (btnRefresh) {
    btnRefresh.onclick = async () => {
      await fetchStep7Prices(true);
      renderStep7MarketVerificationView(container);
    };
  }

  // Audio Mute Toggle
  const btnMute = document.getElementById("btn-step7-mute");
  const iconMute = document.getElementById("icon-step7-mute");
  const textMute = document.getElementById("text-step7-mute");
  if (btnMute) {
    btnMute.onclick = () => {
      step7VoiceMuted = !step7VoiceMuted;
      localStorage.setItem('fdd_verify_voice_muted', step7VoiceMuted ? 'true' : 'false');
      if (step7VoiceMuted && ('speechSynthesis' in window)) {
        window.speechSynthesis.cancel();
      }
      if (iconMute) iconMute.className = step7VoiceMuted ? "fa-solid fa-volume-xmark text-rose-500" : "fa-solid fa-volume-high text-emerald-700";
      if (textMute) textMute.innerText = step7VoiceMuted ? "Audio: Muted" : "Audio: Active";
    };
  }

  // Upload Handling
  const btnChooseUpload = document.getElementById("btn-step7-choose-upload");
  const inUpload = document.getElementById("input-step7-upload");
  const previewUpload = document.getElementById("step7-upload-preview");
  const fileNameEl = document.getElementById("step7-upload-filename");
  const btnRemoveUpload = document.getElementById("btn-step7-remove-upload");

  if (btnChooseUpload && inUpload) {
    btnChooseUpload.onclick = () => inUpload.click();
    inUpload.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        step7UploadedFileName = file.name;
        const reader = new FileReader();
        reader.onload = (re) => {
          step7UploadedBase64 = re.target.result;
          if (previewUpload && fileNameEl) {
            fileNameEl.innerText = file.name;
            previewUpload.classList.remove("hidden");
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }

  if (btnRemoveUpload && inUpload) {
    btnRemoveUpload.onclick = () => {
      step7UploadedBase64 = null;
      step7UploadedFileName = null;
      inUpload.value = "";
      if (previewUpload) previewUpload.classList.add("hidden");
    };
  }

  // Quick Chips
  document.querySelectorAll(".step7-quick-chip").forEach(chip => {
    chip.onclick = () => {
      const query = chip.innerText.replace(/^[^\w]+/, '').trim();
      executeStep7Verification(query, container);
    };
  });

  // Voice Input (Speech Recognition)
  const btnMic = document.getElementById("btn-step7-mic");
  const inMsg = document.getElementById("input-step7-msg");
  let sttActive = false;
  let sttInstance = null;
  if (btnMic && inMsg) {
    btnMic.onclick = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Web Speech API voice input is not supported in this browser. Please use Chrome or Edge.");
        return;
      }
      if (sttActive && sttInstance) {
        sttInstance.stop();
        return;
      }
      try {
        sttInstance = new SpeechRecognition();
        sttInstance.continuous = false;
        sttInstance.interimResults = true;
        sttInstance.lang = currentLang === 'kn' ? 'kn-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN');
        sttInstance.onstart = () => {
          sttActive = true;
          btnMic.className = "w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center transition cursor-pointer shrink-0 animate-pulse ring-2 ring-rose-400";
          inMsg.placeholder = currentLang === 'kn' ? "🎙️ ಆಲಿಸುತ್ತಿದೆ... ಮಾತನಾಡಿ..." : "🎙️ Listening... speak now...";
        };
        sttInstance.onresult = (evt) => {
          let interim = '';
          let final = '';
          for (let i = evt.resultIndex; i < evt.results.length; ++i) {
            if (evt.results[i].isFinal) final += evt.results[i][0].transcript;
            else interim += evt.results[i][0].transcript;
          }
          if (interim) inMsg.value = interim;
          if (final) {
            inMsg.value = final;
            executeStep7Verification(final, container);
          }
        };
        sttInstance.onerror = () => resetStep7Mic();
        sttInstance.onend = () => resetStep7Mic();
        sttInstance.start();
      } catch (e) {
        resetStep7Mic();
      }
    };
    function resetStep7Mic() {
      sttActive = false;
      if (btnMic) btnMic.className = "w-10 h-10 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-slate-200 flex items-center justify-center transition cursor-pointer shrink-0";
      if (inMsg) inMsg.placeholder = currentLang === 'kn' ? "ಬೆಳೆ ಅಥವಾ ಧಾರಣೆ ಬಗ್ಗೆ ಪ್ರಶ್ನಿಸಿ / ಅಪ್‌ಲೋಡ್ ಮಾಡಿ..." : "Ask to verify recommended crops or market trends...";
    }
  }

  // Form Submit
  const formVerify = document.getElementById("form-step7-verify");
  if (formVerify && inMsg) {
    formVerify.onsubmit = (e) => {
      e.preventDefault();
      const txt = inMsg.value.trim();
      if (!txt && !step7UploadedBase64) return;
      inMsg.value = "";
      executeStep7Verification(txt || "Verify uploaded document with current recommendations", container);
    };
  }
}

async function executeStep7Verification(query, container) {
  if (!query && !step7UploadedBase64) return;

  step7VerificationHistory.push({
    sender: "user",
    text: query,
    image_name: step7UploadedFileName
  });

  const streamEl = document.getElementById("step7-dialogue-stream");
  if (streamEl) {
    streamEl.innerHTML = step7VerificationHistory.map(m => `
      <div class="flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[85%] rounded-2xl p-3.5 ${
          m.sender === 'user'
            ? 'bg-emerald-700 text-white rounded-br-xs shadow-xs'
            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs space-y-1'
        }">
          <div class="flex items-center gap-2 font-bold text-[11px] ${m.sender === 'user' ? 'text-emerald-100' : 'text-emerald-800'}">
            <i class="fa-solid ${m.sender === 'user' ? 'fa-user' : 'fa-certificate'}"></i>
            <span>${m.sender === 'user' ? 'Farmer' : 'AI Verification Agent'}</span>
          </div>
          <p class="leading-relaxed whitespace-pre-wrap">${currentLang === 'kn' && m.text_kn ? m.text_kn : m.text}</p>
          ${m.image_name ? `
            <div class="mt-2 text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
              <i class="fa-solid fa-file-image text-emerald-600"></i>
              <span>Attached Document: ${m.image_name}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('') + `
      <div id="step7-thinking" class="flex justify-start">
        <div class="bg-white rounded-2xl p-3 border border-slate-200 text-slate-400 text-xs flex items-center gap-2">
          <div class="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></div>
          <div class="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div class="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          <span>Verifying agronomic viability & 30-day Mandi prices...</span>
        </div>
      </div>
    `;
    streamEl.scrollTop = streamEl.scrollHeight;
  }

  try {
    const payload = {
      message: query,
      crops: step7PriceData ? step7PriceData.crops : [],
      context: {
        district: farmContext.district || "Bengaluru",
        land_acres: farmContext.land_acres || 3.0,
        budget: farmContext.budget_inr || 65000,
        soil_n: farmContext.soil_n,
        soil_p: farmContext.soil_p,
        soil_k: farmContext.soil_k
      },
      lang: currentLang,
      image_base64: step7UploadedBase64
    };

    const res = await fetch("/api/verify/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const thinkingEl = document.getElementById("step7-thinking");
    if (thinkingEl) thinkingEl.remove();

    if (res.ok) {
      const data = await res.json();
      step7VerificationHistory.push({
        sender: "agent",
        text: data.reply,
        text_kn: data.reply,
        model_name: data.model_name,
        is_connected: data.is_connected
      });

      // Clear upload after successful submission
      step7UploadedBase64 = null;
      step7UploadedFileName = null;
      const previewUpload = document.getElementById("step7-upload-preview");
      if (previewUpload) previewUpload.classList.add("hidden");

      if (streamEl) {
        streamEl.innerHTML = step7VerificationHistory.map(m => `
          <div class="flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}">
            <div class="max-w-[85%] rounded-2xl p-3.5 ${
              m.sender === 'user'
                ? 'bg-emerald-700 text-white rounded-br-xs shadow-xs'
                : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs space-y-1'
            }">
              <div class="flex items-center gap-2 font-bold text-[11px] ${m.sender === 'user' ? 'text-emerald-100' : 'text-emerald-800'}">
                <i class="fa-solid ${m.sender === 'user' ? 'fa-user' : 'fa-certificate'}"></i>
                <span>${m.sender === 'user' ? 'Farmer' : (m.model_name || 'AI Verification Agent')}</span>
                ${m.is_connected ? '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-full font-semibold">Live Cloud</span>' : ''}
              </div>
              <p class="leading-relaxed whitespace-pre-wrap">${currentLang === 'kn' && m.text_kn ? m.text_kn : m.text}</p>
              ${m.image_name ? `
                <div class="mt-2 text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                  <i class="fa-solid fa-file-image text-emerald-600"></i>
                  <span>Attached Document: ${m.image_name}</span>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('');
        streamEl.scrollTop = streamEl.scrollHeight;
      }

      // Voice Readout if not muted
      if (!step7VoiceMuted && ('speechSynthesis' in window)) {
        try {
          window.speechSynthesis.cancel();
          const cleanSpeech = data.reply.replace(/[*_#`~]/g, '').replace(/\b(?:https?|ftp):\/\/\S+/gi, '');
          const utter = new SpeechSynthesisUtterance(cleanSpeech);
          utter.lang = currentLang === 'kn' ? 'kn-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN');
          utter.rate = 1.0;
          window.speechSynthesis.speak(utter);
        } catch (e) {}
      }
    }
  } catch (err) {
    const thinkingEl = document.getElementById("step7-thinking");
    if (thinkingEl) thinkingEl.remove();
    step7VerificationHistory.push({
      sender: "agent",
      text: "Connection error verifying with AI agent. Please check network.",
      text_kn: "ನೆಟ್‌ವರ್ಕ್ ದೋಷ: ಪರಿಶೀಲನಾ ಸಹಾಯಕ ಸಂಪರ್ಕ ಸಾಧಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
    });
  }
}

async function downloadAdvisoryPdf() {
  const btn = document.getElementById("btn-download-pdf-report");
  const origHtml = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Generating PDF...`;
  }
  try {
    const payload = {
      location_name: farmContext.display_name || `${farmContext.district || "Bengaluru"}, ${farmContext.state || "Karnataka"}`,
      lat: farmContext.lat,
      lon: farmContext.lon,
      land_acres: farmContext.land_acres || 3.0,
      budget_inr: farmContext.budget_inr || 65000.0,
      irrigation: farmContext.irrigation || "drip",
      soil_n: farmContext.soil_n !== null ? farmContext.soil_n : 85.0,
      soil_p: farmContext.soil_p !== null ? farmContext.soil_p : 45.0,
      soil_k: farmContext.soil_k !== null ? farmContext.soil_k : 42.0,
      soil_ph: farmContext.soil_ph !== null ? farmContext.soil_ph : 6.5,
      soil_type: farmContext.soil_type || "Clay Loam",
      top_crops: (recommendData && recommendData.top_crops) ? recommendData.top_crops : []
    };
    const res = await fetch('/api/report/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Farm_Advisory_Report_${(farmContext.district || 'Karnataka').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      alert("Failed to generate PDF advisory report.");
    }
  } catch (err) {
    console.error("PDF download error:", err);
    alert("Error downloading PDF report.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

// ============================================================================
// Krishi Mitra Chat State & API Client
// ============================================================================
let chatMessagesHistory = [
  {
    sender: "bot",
    text: "Hello! I am Krishi Mitra, your AI farming assistant. Ask me anything about crop recommendations, fertilizer doses, disease scanner, or government subsidies!"
  }
];

function renderChatMessages() {
  const container = document.getElementById("chat-messages-list");
  if (!container) return;

  container.innerHTML = chatMessagesHistory.map(m => {
    const isBot = (m.sender === "bot");
    return `
      <div class="flex items-start gap-2.5 ${isBot ? '' : 'flex-row-reverse'} animate-fadeIn">
        <div class="w-7 h-7 rounded-full ${isBot ? 'bg-[#1b5e20] text-amber-300' : 'bg-slate-700 text-white'} flex items-center justify-center text-xs shrink-0 shadow-xs">
          <i class="${isBot ? 'fa-solid fa-seedling' : 'fa-solid fa-user'}"></i>
        </div>
        <div class="max-w-[82%] p-3 rounded-2xl ${isBot ? 'bg-white text-slate-800 border border-slate-200 shadow-xs' : 'bg-[#1b5e20] text-white shadow-xs'} space-y-1">
          <p class="leading-relaxed whitespace-pre-wrap">${m.text}</p>
        </div>
      </div>
    `;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

let isVoiceMuted = localStorage.getItem('fdd_voice_muted') === 'true';

function speakBotText(text) {
  if (isVoiceMuted) return;
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`~]/g, '').replace(/\b(?:https?|ftp):\/\/\S+/gi, '').replace(/[()]/g, '');
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = currentLang === 'kn' ? 'kn-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN');
    utter.rate = 1.0;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
  } catch (e) {
    console.warn("TTS Error:", e);
  }
}

async function sendChatMessage(query) {
  if (!query) return;

  chatMessagesHistory.push({ sender: "user", text: query });
  renderChatMessages();

  const loadingEl = document.getElementById("chat-loading-indicator");
  if (loadingEl) loadingEl.classList.remove("hidden");

  try {
    const payload = {
      message: query,
      lang: currentLang,
      session_id: "farmer_session",
      context: {
        district: farmContext.district || "Bengaluru",
        state: farmContext.state || "Karnataka",
        village: farmContext.village || "Karnataka Farm Plot",
        lat: farmContext.lat,
        lon: farmContext.lon,
        land_acres: farmContext.land_acres || 3.0,
        budget_inr: farmContext.budget_inr || 65000.0,
        irrigation: farmContext.irrigation || "drip",
        soil_n: farmContext.soil_n !== null ? farmContext.soil_n : 85.0,
        soil_p: farmContext.soil_p !== null ? farmContext.soil_p : 45.0,
        soil_k: farmContext.soil_k !== null ? farmContext.soil_k : 42.0,
        soil_ph: farmContext.soil_ph !== null ? farmContext.soil_ph : 6.5,
        soil_type: farmContext.soil_type || "Clay Loam",
        top_crops: (recommendData && recommendData.top_crops) ? recommendData.top_crops.map(c => ({
          name: c.display_name,
          kannada_name: c.kannada_name,
          suitability_pct: c.suitability_pct,
          net_profit_inr: c.net_profit_inr,
          yield_per_acre_qtl: c.yield_per_acre_qtl
        })) : []
      }
    };

    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (loadingEl) loadingEl.classList.add("hidden");

    if (res.ok) {
      const data = await res.json();
      chatMessagesHistory.push({ sender: "bot", text: data.reply });
      renderChatMessages();

      // Speak assistant response aloud unless muted
      speakBotText(data.reply);

      // Execute voice actions
      if (data.action) {
        if (data.action.type === "open_modal") {
          if (data.action.target === "disease-scanner") {
            const modal = document.getElementById("modal-leaf-scanner");
            if (modal) modal.classList.remove("hidden");
          } else if (data.action.target === "schemes") {
            const modal = document.getElementById("modal-schemes");
            if (modal) {
              modal.classList.remove("hidden");
              fetchSchemes();
            }
          } else if (data.action.target === "history") {
            if (typeof window.openHistoryModal === 'function') {
              window.openHistoryModal();
            } else {
              const modal = document.getElementById("modal-history");
              if (modal) modal.classList.remove("hidden");
            }
          } else if (data.action.target === "share") {
            if (typeof window.openShareModal === 'function') {
              window.openShareModal();
            }
          }
        } else if (data.action.type === "navigate") {
          const match = data.action.target.match(/step-(\d+)/);
          if (match) {
            navigateToStep(parseInt(match[1]));
          }
        } else if (data.action.type === "weather_tab") {
          navigateToStep(2);
          setTimeout(() => {
            if (data.action.target === "rainfall") {
              const tab = document.getElementById("tab-5yr-rain");
              if (tab) tab.click();
            } else if (data.action.target === "temp") {
              const tab = document.getElementById("tab-5yr-temp");
              if (tab) tab.click();
            } else {
              const tab = document.getElementById("tab-5yr-comp");
              if (tab) tab.click();
            }
          }, 350);
        } else if (data.action.type === "search_location") {
          navigateToStep(1);
          setTimeout(() => {
            const locInp = document.getElementById("input-location-search");
            if (locInp) {
              locInp.value = data.action.target;
              const btnSearch = document.getElementById("btn-geocode-search");
              if (btnSearch) btnSearch.click();
            }
          }, 350);
        }
      }
    } else {
      const errReply = currentLang === 'kn'
        ? "ಕ್ಷಮಿಸಿ, ಪ್ರತಿಕ್ರಿಯೆ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ನಿಮ್ಮ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ."
        : "I'm not sure, please consult your local agriculture officer or try again.";
      chatMessagesHistory.push({
        sender: "bot",
        text: errReply
      });
      renderChatMessages();
      speakBotText(errReply);
    }
  } catch (err) {
    if (loadingEl) loadingEl.classList.add("hidden");
    chatMessagesHistory.push({
      sender: "bot",
      text: "Connection error. Please check your network."
    });
    renderChatMessages();
  }
}

function bindResultsStepListeners() {
  const btnVoice = document.getElementById("btn-voice-readout");
  if (btnVoice && recommendData && recommendData.top_crops && recommendData.top_crops.length > 0) {
    btnVoice.onclick = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const top = recommendData.top_crops[0];
        const cropName = currentLang === 'kn' ? top.kannada_name : (currentLang === 'hi' ? top.display_name : top.display_name);
        const text = currentLang === 'kn'
          ? `ಶಿಫಾರಸು ಮಾಡಿದ ಅತ್ಯುತ್ತಮ ಬೆಳೆ ${cropName}. ${farmContext.land_acres} ಎಕರೆಗೆ ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ ${Math.round(top.net_profit_inr)} ರೂಪಾಯಿಗಳು. ಒಟ್ಟು ಇಳುವರಿ ${top.total_yield_qtl.toFixed(1)} ಕ್ವಿಂಟಾಲ್.`
          : (currentLang === 'hi'
            ? `शीर्ष अनुशंसित फसल ${cropName} है। ${farmContext.land_acres} एकड़ में अनुमानित शुद्ध लाभ ${Math.round(top.net_profit_inr)} रुपये है। कुल अनुमानित उपज ${top.total_yield_qtl.toFixed(1)} क्विंटल होगी।`
            : `Top recommended crop is ${cropName}. Projected net profit across ${farmContext.land_acres} acres is ${Math.round(top.net_profit_inr)} Rupees, with total expected harvest of ${top.total_yield_qtl.toFixed(1)} quintals.`);

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = currentLang === 'kn' ? 'kn-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN');
        utter.rate = 0.95;
        window.speechSynthesis.speak(utter);
      } else {
        alert("Text-to-speech not supported in this browser.");
      }
    };
  }

  const btnWhatsapp = document.getElementById("btn-share-whatsapp");
  if (btnWhatsapp && recommendData && recommendData.top_crops && recommendData.top_crops.length > 0) {
    btnWhatsapp.onclick = () => {
      const top = recommendData.top_crops[0];
      const cropName = top.display_name;
      const msg = `🌾 AgroProfit AI Farm Advisory Report:\n📍 Location: ${farmContext.display_name}\n🌱 Recommended Crop: ${cropName}\n🚜 Land: ${farmContext.land_acres} Acres\n💰 Projected Net Profit: ₹${Math.round(top.net_profit_inr).toLocaleString()}\n📦 Expected Yield: ${top.total_yield_qtl.toFixed(1)} qtl\n💧 Irrigation: ${farmContext.irrigation}\nGenerated via AgroProfit AI.`;
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    };
  }

  const btnPrint = document.getElementById("btn-print-pdf-top");
  if (btnPrint) {
    btnPrint.onclick = () => window.print();
  }

  const btnPdf = document.getElementById("btn-download-pdf-report");
  if (btnPdf) {
    btnPdf.onclick = () => downloadAdvisoryPdf();
  }

  const btnSetTarget = document.getElementById("btn-save-target-price");
  const inTarget = document.getElementById("input-target-price");
  if (btnSetTarget && inTarget) {
    btnSetTarget.onclick = async () => {
      farmContext.target_price_inr = parseFloat(inTarget.value) || 4500.0;
      if ("Notification" in window && Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
      await fetchMandiTrends();
      alert(`Target price alert set for ₹${farmContext.target_price_inr}/qtl!`);
    };
  }

  const btnShare = document.getElementById("btn-share-results");
  if (btnShare) {
    btnShare.onclick = () => {
      if (typeof window.openShareModal === 'function') {
        window.openShareModal();
      }
    };
  }

  const btnGoStep7 = document.getElementById("btn-goto-step-7");
  if (btnGoStep7) {
    btnGoStep7.onclick = () => navigateToStep(7);
  }
}

function renderMandiChart(prices) {
  const canvas = document.getElementById("chart-mandi-canvas");
  if (!canvas || !prices || !prices.length || typeof Chart === 'undefined') return;

  if (mandiChartInstance) {
    mandiChartInstance.destroy();
  }

  const labels = prices.map(p => p.display_date || p.date);
  const dataVals = prices.map(p => p.modal_price_inr !== undefined ? p.modal_price_inr : p.modal_price);

  mandiChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Modal Price (₹/qtl)',
        data: dataVals,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { title: { display: true, text: '₹/qtl', font: { size: 9 } } }
      }
    }
  });
}

// ============================================================================
// 13. Navigation & Shell Listeners
// ============================================================================
export function navigateToStep(step) {
  currentStep = step;

  document.querySelectorAll(".step-btn").forEach(btn => {
    const s = parseInt(btn.getAttribute("data-step") || "1");
    if (s === currentStep) {
      btn.className = "step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer bg-emerald-700 text-white shadow-xs";
    } else if (s < currentStep) {
      btn.className = "step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer text-emerald-800 bg-emerald-50 hover:bg-emerald-100";
    } else {
      btn.className = "step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer text-slate-500 hover:bg-slate-100";
    }
  });

  for (let i = 1; i <= 7; i++) {
    const p = document.getElementById(`panel-step-${i}`);
    if (p) {
      if (i === currentStep) {
        p.classList.remove("hidden");
      } else {
        p.classList.add("hidden");
      }
    }
  }

  const prevBtn = document.getElementById("btn-step-prev");
  const nextBtn = document.getElementById("btn-step-next");
  if (prevBtn) {
    if (currentStep > 1) prevBtn.classList.remove("hidden");
    else prevBtn.classList.add("hidden");
  }
  if (nextBtn) {
    if (currentStep === 7) nextBtn.classList.add("hidden");
    else nextBtn.classList.remove("hidden");
  }

  renderCurrentStepView();
}

function renderCurrentStepView() {
  const container = document.getElementById(`panel-step-${currentStep}`);
  if (!container) return;

  if (currentStep === 1) renderLocationStepView(container);
  else if (currentStep === 2) renderWeatherStepView(container);
  else if (currentStep === 3) renderSoilStepView(container);
  else if (currentStep === 4) renderFarmStepView(container);
  else if (currentStep === 5) renderRotationStepView(container);
  else if (currentStep === 6) renderResultsStepView(container);
  else if (currentStep === 7) renderStep7MarketVerificationView(container);
}

function bindShellListeners() {
  // Stepper Header click
  document.querySelectorAll(".step-btn").forEach(btn => {
    btn.onclick = () => {
      const step = parseInt(btn.getAttribute("data-step") || "1");
      navigateToStep(step);
    };
  });

  // Bottom Prev / Next
  const btnPrev = document.getElementById("btn-step-prev");
  const btnNext = document.getElementById("btn-step-next");
  if (btnPrev) btnPrev.onclick = () => { if (currentStep > 1) navigateToStep(currentStep - 1); };
  if (btnNext) btnNext.onclick = () => { if (currentStep < 7) navigateToStep(currentStep + 1); };

  // Language buttons (EN, KN, HI)
  const lEn = document.getElementById("lang-en");
  const lKn = document.getElementById("lang-kn");
  const lHi = document.getElementById("lang-hi");

  if (lEn) lEn.onclick = () => renderDashboardShell(document.getElementById("app"), 'en');
  if (lKn) lKn.onclick = () => renderDashboardShell(document.getElementById("app"), 'kn');
  if (lHi) lHi.onclick = () => renderDashboardShell(document.getElementById("app"), 'hi');

  // Performance / Turbo Mode Button
  const btnPerf = document.getElementById("btn-toggle-perf");
  if (btnPerf) {
    btnPerf.onclick = () => {
      isPerformanceMode = !isPerformanceMode;
      try {
        localStorage.setItem('fdd_perf_mode', isPerformanceMode ? 'true' : 'false');
      } catch (e) {}
      if (isPerformanceMode) {
        document.documentElement.classList.add('perf-mode');
      } else {
        document.documentElement.classList.remove('perf-mode');
      }
      renderDashboardShell(document.getElementById("app"), currentLang);
    };
  }

  // Leaf Disease Modal open/close
  const btnOpenLeaf = document.getElementById("btn-open-leaf-scanner");
  const modalLeaf = document.getElementById("modal-leaf-scanner");
  const btnCloseLeaf = document.getElementById("btn-close-leaf-modal");

  if (btnOpenLeaf && modalLeaf) btnOpenLeaf.onclick = () => modalLeaf.classList.remove("hidden");
  if (btnCloseLeaf && modalLeaf) btnCloseLeaf.onclick = () => modalLeaf.classList.add("hidden");

  // Foliar Leaf photo upload
  const leafFileInput = document.getElementById("input-leaf-file");
  if (leafFileInput) {
    leafFileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const rejAlert = document.getElementById("leaf-reject-alert");
      const uncAlert = document.getElementById("leaf-uncertain-alert");
      const card = document.getElementById("leaf-diagnosis-card");

      rejAlert.classList.add("hidden");
      uncAlert.classList.add("hidden");
      card.classList.add("hidden");

      // Show loading indicator
      let loadingEl = document.getElementById("leaf-loading-indicator");
      if (!loadingEl) {
        loadingEl = document.createElement("div");
        loadingEl.id = "leaf-loading-indicator";
        loadingEl.className = "p-6 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-2 text-xs text-blue-900";
        loadingEl.innerHTML = `<div class="inline-block animate-spin text-2xl text-blue-600"><i class="fa-solid fa-spinner"></i></div><div class="font-bold">Analyzing leaf with PlantVillage AI...</div><div class="text-[11px] text-blue-700">Detecting foliar blight, lesions, and symptoms.</div>`;
        card.parentNode.insertBefore(loadingEl, card);
      }
      loadingEl.classList.remove("hidden");

      const fd = new FormData();
      fd.append("photo", file);
      fd.append("file", file);

      try {
        const resp = await fetch("/api/photo/leaf-disease", { method: "POST", body: fd });
        loadingEl.classList.add("hidden");
        if (resp.ok) {
          const res = await resp.json();
          if (res.status === "not_leaf" || res.is_leaf === false) {
            rejAlert.classList.remove("hidden");
            const rejTxt = rejAlert.querySelector("p");
            const reason = currentLang === 'kn' ? (res.rejection_reason_kn || res.rejection_reason) : (currentLang === 'hi' ? (res.rejection_reason_hi || res.rejection_reason) : res.rejection_reason);
            if (rejTxt && reason) rejTxt.innerText = reason;
          } else if (res.status === "uncertain" || (res.confidence_pct && res.confidence_pct < 60) || (res.confidence && res.confidence < 0.60 && res.confidence <= 1.0)) {
            uncAlert.classList.remove("hidden");
            const msg = currentLang === 'kn' ? (res.message_kn || res.message) : (currentLang === 'hi' ? (res.message_hi || res.message) : res.message);
            if (msg) {
              uncAlert.innerHTML = `
                <div class="font-bold text-amber-900 flex items-center gap-1.5">
                  <span>⚠️</span> <span>Low Confidence / Uncertain Diagnosis</span>
                </div>
                <p class="text-amber-800 text-xs">${msg}</p>
              `;
            }
          } else {
            card.classList.remove("hidden");
            const diseaseName = currentLang === 'kn' ? (res.disease_name_kn || res.disease_name) : (currentLang === 'hi' ? (res.disease_name_hi || res.disease_name) : res.disease_name);
            document.getElementById("leaf-diagnosis-name").innerText = diseaseName;

            const confPct = res.confidence_pct !== undefined ? res.confidence_pct : (res.confidence > 1 ? res.confidence : res.confidence * 100);
            const badge = document.getElementById("leaf-confidence-badge");
            badge.innerText = `${confPct.toFixed(1)}% Confidence`;
            badge.className = `px-2.5 py-1 rounded-full text-xs font-bold ${confPct >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`;

            document.getElementById("leaf-pathogen-txt").innerText = res.pathogen || "N/A";
            document.getElementById("leaf-symptoms-txt").innerText = (currentLang === 'kn' ? (res.symptoms_kn || res.symptoms) : (currentLang === 'hi' ? (res.symptoms_hi || res.symptoms) : res.symptoms)) || "N/A";

            const treatmentSteps = currentLang === 'kn' ? (res.treatment_steps_kn || res.treatment_steps) : (currentLang === 'hi' ? (res.treatment_steps_hi || res.treatment_steps) : res.treatment_steps);
            const treatmentTxt = Array.isArray(treatmentSteps) ? treatmentSteps.join('\n\n') : (res.treatment_guidance || "Consult local agriculture officer.");
            document.getElementById("leaf-treatment-txt").innerText = treatmentTxt;

            const img = document.getElementById("leaf-annotated-img");
            const imgSrc = res.annotated_image || (res.annotated_image_base64 ? `data:image/jpeg;base64,${res.annotated_image_base64}` : null);
            if (imgSrc) {
              img.src = imgSrc;
              img.classList.remove("hidden");
            } else {
              img.classList.add("hidden");
            }
          }
        } else {
          loadingEl.classList.add("hidden");
          rejAlert.classList.remove("hidden");
          const rejTxt = rejAlert.querySelector("p");
          if (rejTxt) rejTxt.innerText = `Analysis error (${resp.status}). Please try a clearer leaf photo.`;
        }
      } catch (err) {
        loadingEl.classList.add("hidden");
        console.error("Leaf scanner error:", err);
      }
    };
  }

  // Schemes Modal
  const btnSchemes = document.getElementById("btn-schemes");
  const modalSchemes = document.getElementById("modal-schemes");
  const btnCloseSchemes = document.getElementById("btn-close-schemes");

  if (btnSchemes && modalSchemes) {
    btnSchemes.onclick = async () => {
      modalSchemes.classList.remove("hidden");
      const listContainer = document.getElementById("schemes-list-content");
      listContainer.innerHTML = `<div class="text-center py-6 text-slate-400">Loading government schemes...</div>`;
      const schemesData = await fetchSchemes();
      const schemes = Array.isArray(schemesData) ? schemesData : (schemesData.schemes || []);
      listContainer.innerHTML = schemes.map(s => {
        const portalUrl = s.official_portal_url || s.portal_url || '#';
        const category = s.category || s.type || 'Government Scheme';
        const name = (currentLang === 'kn' && s.name_kn) ? s.name_kn : ((currentLang === 'hi' && s.name_hi) ? s.name_hi : s.name);
        const benefit = (currentLang === 'kn' && s.benefit_kn) ? s.benefit_kn : ((currentLang === 'hi' && s.benefit_hi) ? s.benefit_hi : s.benefit);
        const eligibility = (currentLang === 'kn' && s.eligibility_kn) ? s.eligibility_kn : ((currentLang === 'hi' && s.eligibility_hi) ? s.eligibility_hi : s.eligibility);
        const eligibilityLabel = currentLang === 'kn' ? 'ಅರ್ಹತೆ:' : (currentLang === 'hi' ? 'पात्रता:' : 'Eligibility:');
        const verifiedLabel = currentLang === 'kn' ? 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ:' : (currentLang === 'hi' ? 'सत्यापित:' : 'Verified:');
        const portalBtnText = currentLang === 'kn' ? 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ↗' : (currentLang === 'hi' ? 'आधिकारिक पोर्टल ↗' : 'Official Portal ↗');

        return `
        <div class="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-2 hover:border-emerald-300 transition">
          <div class="flex items-center justify-between gap-2">
            <h4 class="font-extrabold text-slate-900 text-sm leading-snug">${name}</h4>
            <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">${category}</span>
          </div>
          <p class="text-slate-600 leading-relaxed">${benefit}</p>
          <div class="text-slate-500 font-medium"><strong>${eligibilityLabel}</strong> ${eligibility}</div>
          <div class="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span class="text-[10px] text-slate-400">${verifiedLabel} ${s.last_verified || '2026-11-20'}</span>
            <a href="${portalUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-[#1b5e20] hover:bg-[#2e7d32] text-white rounded-lg font-bold transition text-[11px] inline-flex items-center gap-1 shadow-xs cursor-pointer">
              <span>${portalBtnText}</span>
            </a>
          </div>
        </div>
      `}).join('');
    };
  }
  if (btnCloseSchemes && modalSchemes) btnCloseSchemes.onclick = () => modalSchemes.classList.add("hidden");

  // ============================================================================
  // Features 3 & 4: Google History & Share Crop Advisory
  // ============================================================================
  const btnHistory = document.getElementById("btn-history");
  const modalHistory = document.getElementById("modal-history");
  const btnCloseHistory = document.getElementById("btn-close-history");
  const historyContent = document.getElementById("history-content-container");
  const modalConfirmClear = document.getElementById("modal-confirm-clear");
  const dropdownClear = document.getElementById("dropdown-clear-history");
  const modalShare = document.getElementById("modal-share");
  const btnCloseShare = document.getElementById("btn-close-share");

  let activeHistoryRuns = [];
  let currentShareToken = null;
  let clearTargetTimeframe = "all";

  // Reopen result from history
  window.reopenHistoryRun = async function(runId) {
    try {
      const res = await fetch(`/api/history/${runId}`);
      if (res.ok) {
        const data = await res.json();
        const r = data.record || data;
        if (r.inputs) {
          farmContext.land_acres = r.inputs.land_acres || farmContext.land_acres;
          farmContext.soil_n = r.inputs.soil_n !== undefined ? r.inputs.soil_n : farmContext.soil_n;
          farmContext.soil_p = r.inputs.soil_p !== undefined ? r.inputs.soil_p : farmContext.soil_p;
          farmContext.soil_k = r.inputs.soil_k !== undefined ? r.inputs.soil_k : farmContext.soil_k;
          farmContext.soil_ph = r.inputs.soil_ph !== undefined ? r.inputs.soil_ph : farmContext.soil_ph;
          farmContext.soil_type = r.inputs.soil_type || farmContext.soil_type;
          farmContext.irrigation = r.inputs.irrigation || farmContext.irrigation;
          farmContext.budget_inr = r.inputs.budget_inr || farmContext.budget_inr;
        }
        farmContext.lat = r.lat || farmContext.lat;
        farmContext.lon = r.lon || farmContext.lon;
        farmContext.village = r.location_name || farmContext.village;
        farmContext.display_name = r.location_name || farmContext.display_name;

        recommendData = {
          top_crops: r.top_crops || [],
          weather_fit_crops: (r.top_crops || []).slice(0, 3),
          alternative_crops: (r.top_crops || []).slice(3, 6),
          run_id: r.id,
          timestamp: r.timestamp
        };

        if (modalHistory) modalHistory.classList.add("hidden");
        navigateToStep(6);
      }
    } catch (e) {
      console.error("Reopen history error:", e);
    }
  };

  // Delete single run
  window.deleteSingleRun = async function(runId, e) {
    if (e) e.stopPropagation();
    if (!confirm(`Delete history entry #${runId}?`)) return;
    try {
      const res = await fetch(`/api/history/${runId}`, { method: 'DELETE' });
      if (res.ok) {
        loadAndRenderHistory();
      }
    } catch (err) {
      console.error("Delete run error:", err);
    }
  };

  // Group runs into Today, Yesterday, Last 7 Days, Earlier
  function groupRuns(runs) {
    const groups = { today: [], yesterday: [], last7days: [], earlier: [] };
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - (24 * 60 * 60 * 1000);
    const last7DaysStart = todayStart - (7 * 24 * 60 * 60 * 1000);

    runs.forEach(r => {
      const dt = new Date((r.timestamp || "").replace(/-/g, "/")).getTime() || Date.now();
      if (dt >= todayStart) groups.today.push(r);
      else if (dt >= yesterdayStart) groups.yesterday.push(r);
      else if (dt >= last7DaysStart) groups.last7days.push(r);
      else groups.earlier.push(r);
    });
    return groups;
  }

  // Load and render history with filters
  async function loadAndRenderHistory() {
    if (!historyContent) return;
    historyContent.innerHTML = `<div class="py-8 text-center text-slate-400 space-y-2"><div class="text-2xl animate-spin text-emerald-600"><i class="fa-solid fa-spinner"></i></div><p>Loading history records...</p></div>`;

    const q = document.getElementById("input-history-search")?.value.trim() || "";
    const crop = document.getElementById("select-history-crop")?.value || "";
    const fromDate = document.getElementById("input-history-from")?.value || "";
    const toDate = document.getElementById("input-history-to")?.value || "";

    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (crop) params.append("crop", crop);
    if (fromDate) params.append("start_date", fromDate);
    if (toDate) params.append("end_date", toDate);

    try {
      const res = await fetch(`/api/history?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      const runs = Array.isArray(data) ? data : (data.history || []);
      activeHistoryRuns = runs;

      // Populate crop dropdown options dynamically
      const cropSelect = document.getElementById("select-history-crop");
      if (cropSelect && cropSelect.children.length <= 1) {
        const cropSet = new Set();
        runs.forEach(r => {
          if (r.top_crop && r.top_crop !== "Unknown") cropSet.add(r.top_crop);
          (r.top_crops_summary || []).forEach(c => { if (c) cropSet.add(c); });
        });
        cropSet.forEach(c => {
          const opt = document.createElement("option");
          opt.value = c;
          opt.textContent = c;
          cropSelect.appendChild(opt);
        });
        if (crop) cropSelect.value = crop;
      }

      if (runs.length === 0) {
        historyContent.innerHTML = `
          <div class="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div class="text-3xl text-slate-300"><i class="fa-solid fa-magnifying-glass"></i></div>
            <h4 class="font-bold text-slate-700">No matching history found</h4>
            <p class="text-xs text-slate-400">Search criteria didn't match any saved recommendation runs.</p>
          </div>
        `;
        return;
      }

      const grouped = groupRuns(runs);
      const groupLabels = [
        { key: "today", title: "📅 Today" },
        { key: "yesterday", title: "📅 Yesterday" },
        { key: "last7days", title: "📅 Last 7 Days" },
        { key: "earlier", title: "📅 Earlier" }
      ];

      let html = `<div class="space-y-6">`;

      groupLabels.forEach(grp => {
        const items = grouped[grp.key];
        if (!items || items.length === 0) return;

        html += `
          <div class="space-y-2.5">
            <div class="flex items-center gap-2 pb-1 border-b border-slate-200">
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">${grp.title}</span>
              <span class="px-2 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">${items.length}</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${items.map(r => {
                const runId = r.id;
                const loc = r.location_name || "Plot Location";
                const acres = Number(r.land_acres || 1.0);
                const budget = Number(r.budget || 0);
                const topCrop = r.top_crop || "Recommended Crop";
                const profit = Number(r.top_profit || 0);

                return `
                  <div class="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-400 transition space-y-2.5 group">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex items-start gap-2.5">
                        <input type="checkbox" value="${runId}" class="history-item-chk mt-1 w-4 h-4 accent-emerald-700 rounded cursor-pointer" />
                        <div>
                          <div class="font-bold text-slate-900 text-xs flex items-center gap-1.5 flex-wrap">
                            <span>📍 ${loc}</span>
                            <span class="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">${acres} ac</span>
                          </div>
                          <span class="text-[10px] text-slate-400">${r.timestamp}</span>
                        </div>
                      </div>
                      <div class="text-right shrink-0">
                        <span class="text-xs font-black text-emerald-700">₹${profit.toLocaleString()}</span>
                        <span class="block text-[10px] text-slate-400">Net Profit</span>
                      </div>
                    </div>

                    <div class="p-2 bg-slate-50 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
                      <div>Top Crop: <strong class="text-slate-900">${topCrop}</strong></div>
                      <div>Budget: <strong>₹${budget.toLocaleString()}</strong></div>
                    </div>

                    <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <button type="button" onclick="reopenHistoryRun(${runId})" class="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer">
                        <i class="fa-solid fa-eye"></i> <span>Reopen</span>
                      </button>
                      <div class="flex items-center gap-2">
                        <button type="button" onclick="openShareModalForRun(${runId})" class="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer">
                          <i class="fa-solid fa-share-nodes"></i> <span>Share</span>
                        </button>
                        <button type="button" onclick="deleteSingleRun(${runId}, event)" class="text-slate-400 hover:text-rose-600 transition cursor-pointer p-0.5" title="Delete run">
                          <i class="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      });

      html += `</div>`;
      historyContent.innerHTML = html;

      // Bind checkbox change listeners
      const updateSelectionBar = () => {
        const checked = document.querySelectorAll(".history-item-chk:checked");
        const bar = document.getElementById("history-selection-bar");
        const badge = document.getElementById("history-selected-count-badge");
        if (bar && badge) {
          if (checked.length > 0) {
            bar.classList.remove("hidden");
            badge.innerText = `${checked.length} selected`;
          } else {
            bar.classList.add("hidden");
          }
        }
      };

      document.querySelectorAll(".history-item-chk").forEach(chk => {
        chk.onchange = updateSelectionBar;
      });

    } catch (e) {
      historyContent.innerHTML = `<p class="py-6 text-center text-rose-600 text-xs">Failed to load history: ${e.message}</p>`;
    }
  }

  // Clear History Dropdown & Dialog Triggers
  const btnClearMenu = document.getElementById("btn-clear-history-menu");
  if (btnClearMenu && dropdownClear) {
    btnClearMenu.onclick = (e) => {
      e.stopPropagation();
      dropdownClear.classList.toggle("hidden");
    };
    document.addEventListener("click", () => dropdownClear.classList.add("hidden"));
  }

  document.querySelectorAll(".btn-clear-tf").forEach(btn => {
    btn.onclick = () => {
      clearTargetTimeframe = btn.getAttribute("data-tf") || "all";
      const title = document.getElementById("confirm-clear-title");
      const desc = document.getElementById("confirm-clear-desc");
      if (title && desc) {
        if (clearTargetTimeframe === "hour") {
          title.innerText = "Delete Last Hour's History?";
          desc.innerText = "All recommendations saved in the last 60 minutes will be deleted permanently.";
        } else if (clearTargetTimeframe === "today") {
          title.innerText = "Delete Today's History?";
          desc.innerText = "All recommendation runs created today will be permanently deleted.";
        } else {
          title.innerText = "Clear Entire Recommendation History?";
          desc.innerText = "Every saved farm run will be deleted from your database. This cannot be undone.";
        }
      }
      if (modalConfirmClear) modalConfirmClear.classList.remove("hidden");
      if (dropdownClear) dropdownClear.classList.add("hidden");
    };
  });

  const btnCancelClear = document.getElementById("btn-cancel-clear");
  if (btnCancelClear && modalConfirmClear) {
    btnCancelClear.onclick = () => modalConfirmClear.classList.add("hidden");
  }

  const btnConfirmClear = document.getElementById("btn-confirm-clear");
  if (btnConfirmClear && modalConfirmClear) {
    btnConfirmClear.onclick = async () => {
      btnConfirmClear.disabled = true;
      btnConfirmClear.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Deleting...`;
      try {
        await fetch(`/api/history/clear?timeframe=${clearTargetTimeframe}`, { method: 'DELETE' });
        modalConfirmClear.classList.add("hidden");
        loadAndRenderHistory();
      } catch (err) {
        alert("Failed to clear history.");
      } finally {
        btnConfirmClear.disabled = false;
        btnConfirmClear.innerText = "Delete";
      }
    };
  }

  // Multi-Select Bulk Delete
  const btnBulkDelete = document.getElementById("btn-history-bulk-delete");
  if (btnBulkDelete) {
    btnBulkDelete.onclick = async () => {
      const selected = Array.from(document.querySelectorAll(".history-item-chk:checked")).map(cb => parseInt(cb.value));
      if (selected.length === 0) return;
      if (!confirm(`Delete ${selected.length} selected history record(s)?`)) return;
      btnBulkDelete.disabled = true;
      try {
        await fetch("/api/history/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selected })
        });
        loadAndRenderHistory();
      } catch (err) {
        alert("Bulk delete failed.");
      } finally {
        btnBulkDelete.disabled = false;
      }
    };
  }

  // Multi-Select Compare
  const btnHistoryCompare = document.getElementById("btn-history-compare");
  if (btnHistoryCompare) {
    btnHistoryCompare.onclick = async () => {
      const selected = Array.from(document.querySelectorAll(".history-item-chk:checked")).map(cb => parseInt(cb.value));
      const targetContainer = document.getElementById("side-by-side-compare-table");
      if (selected.length < 2) {
        alert("Please select at least 2 runs to compare side-by-side.");
        return;
      }
      try {
        const compResp = await fetch("/api/history/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ run_ids: selected })
        });
        if (compResp.ok) {
          const compData = await compResp.json();
          renderComparisonTable(targetContainer, compData);
          targetContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (e) {
        console.error("Compare error:", e);
      }
    };
  }

  const btnClearSelection = document.getElementById("btn-history-clear-selection");
  if (btnClearSelection) {
    btnClearSelection.onclick = () => {
      document.querySelectorAll(".history-item-chk").forEach(chk => chk.checked = false);
      const bar = document.getElementById("history-selection-bar");
      if (bar) bar.classList.add("hidden");
    };
  }

  // Search & Filter Listeners
  let searchDebounceTimer = null;
  const inputSearch = document.getElementById("input-history-search");
  if (inputSearch) {
    inputSearch.oninput = () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(loadAndRenderHistory, 300);
    };
  }

  const selectCrop = document.getElementById("select-history-crop");
  if (selectCrop) {
    selectCrop.onchange = loadAndRenderHistory;
  }

  const btnToggleDates = document.getElementById("btn-toggle-history-dates");
  const dateFilterRow = document.getElementById("history-date-filter-row");
  if (btnToggleDates && dateFilterRow) {
    btnToggleDates.onclick = () => dateFilterRow.classList.toggle("hidden");
  }

  const btnApplyFilter = document.getElementById("btn-apply-history-filter");
  if (btnApplyFilter) btnApplyFilter.onclick = loadAndRenderHistory;

  const btnResetFilter = document.getElementById("btn-reset-history-filter");
  if (btnResetFilter) {
    btnResetFilter.onclick = () => {
      if (inputSearch) inputSearch.value = "";
      if (selectCrop) selectCrop.value = "";
      const fFrom = document.getElementById("input-history-from");
      const fTo = document.getElementById("input-history-to");
      if (fFrom) fFrom.value = "";
      if (fTo) fTo.value = "";
      loadAndRenderHistory();
    };
  }

  window.openHistoryModal = function() {
    if (modalHistory) {
      modalHistory.classList.remove("hidden");
      loadAndRenderHistory();
    }
  };

  if (btnHistory && modalHistory) {
    btnHistory.onclick = window.openHistoryModal;
  }
  if (btnCloseHistory && modalHistory) {
    btnCloseHistory.onclick = () => modalHistory.classList.add("hidden");
  }

  // ============================================================================
  // Share Feature Implementation (Modal, Web Share API, WhatsApp, SMS, Revoke)
  // ============================================================================
  window.openShareModalForRun = async function(runId) {
    const run = activeHistoryRuns.find(r => r.id === runId);
    if (!run) return;
    openShareModalWithPayload(run.id, {
      location: run.location_name,
      acres: run.land_acres,
      budget: run.budget,
      top_crops: run.top_crops || [],
      top_profit: run.top_profit,
      date: run.timestamp
    });
  };

  const btnShareResults = document.getElementById("btn-share-results");
  window.openShareModal = function() {
    if (recommendData) {
      openShareModalWithPayload(recommendData.run_id, {
        location: farmContext.display_name || farmContext.village || "Bengaluru",
        acres: farmContext.land_acres,
        budget: farmContext.budget_inr,
        top_crops: recommendData.top_crops || [],
        top_profit: recommendData.top_crops?.[0]?.net_profit_inr || 0,
        date: new Date().toLocaleDateString()
      });
    } else if (modalShare) {
      modalShare.classList.remove("hidden");
    }
  };
  if (btnShareResults) {
    btnShareResults.onclick = window.openShareModal;
  }

  async function openShareModalWithPayload(runId, summary) {
    if (!modalShare) return;
    modalShare.classList.remove("hidden");

    // Populate preview
    const locEl = document.getElementById("share-preview-loc");
    const dateEl = document.getElementById("share-preview-date");
    const cropsEl = document.getElementById("share-preview-crops");
    const profitEl = document.getElementById("share-preview-profit");

    if (locEl) locEl.innerText = summary.location || "Farm Plot";
    if (dateEl) dateEl.innerText = summary.date || new Date().toLocaleDateString();
    if (profitEl) profitEl.innerText = `₹${Number(summary.top_profit || 0).toLocaleString()}`;

    const top3 = (summary.top_crops || []).slice(0, 3);
    if (cropsEl) {
      cropsEl.innerHTML = top3.map((c, i) => `
        <div class="flex justify-between">
          <span>#${i+1} ${c.display_name || c.name} (${c.suitability_pct ? c.suitability_pct.toFixed(0) : 90}% match)</span>
          <strong>₹${Number(c.net_profit_inr || 0).toLocaleString()}</strong>
        </div>
      `).join('');
    }

    // Call backend to generate token
    const linkInput = document.getElementById("share-link-input");
    if (linkInput) linkInput.value = "Generating secure share link...";

    try {
      const res = await fetch("/api/share/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run_id: runId, summary: summary })
      });
      if (res.ok) {
        const d = await res.json();
        currentShareToken = d.token;
        const fullUrl = window.location.origin + d.share_url;
        if (linkInput) linkInput.value = fullUrl;

        // Configure share channels
        const shareText = `🌾 Crop Recommendation Advisory for ${summary.location}: Top Crops: ${top3.map(c => c.display_name).join(', ')}. Est. Profit: ₹${Number(summary.top_profit || 0).toLocaleString()}. View report: ${fullUrl}`;

        const btnWa = document.getElementById("btn-share-whatsapp");
        if (btnWa) btnWa.onclick = () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');

        const btnSms = document.getElementById("btn-share-sms");
        if (btnSms) btnSms.onclick = () => window.open(`sms:?body=${encodeURIComponent(shareText)}`, '_self');

        const btnEmail = document.getElementById("btn-share-email");
        if (btnEmail) btnEmail.onclick = () => window.open(`mailto:?subject=${encodeURIComponent("Crop Advisory Report - " + summary.location)}&body=${encodeURIComponent(shareText)}`, '_self');

        const btnNative = document.getElementById("btn-share-native");
        if (btnNative) {
          btnNative.onclick = async () => {
            if (navigator.share) {
              try {
                await navigator.share({
                  title: `Crop Advisory - ${summary.location}`,
                  text: shareText,
                  url: fullUrl
                });
              } catch (e) {}
            } else {
              copyShareLink();
            }
          };
        }
      }
    } catch (e) {
      if (linkInput) linkInput.value = "Failed to create share link.";
    }
  }

  function copyShareLink() {
    const input = document.getElementById("share-link-input");
    const toast = document.getElementById("copy-toast");
    if (input && input.value) {
      navigator.clipboard.writeText(input.value);
      if (toast) {
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 3000);
      }
    }
  }

  const btnCopy = document.getElementById("btn-copy-share-link");
  if (btnCopy) btnCopy.onclick = copyShareLink;

  const btnRevoke = document.getElementById("btn-revoke-share");
  if (btnRevoke) {
    btnRevoke.onclick = async () => {
      if (!currentShareToken) return;
      if (!confirm("Revoke this public share link? Anyone with this link will no longer be able to view the result.")) return;
      try {
        await fetch("/api/share/revoke", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: currentShareToken })
        });
        alert("Share link revoked successfully.");
        if (modalShare) modalShare.classList.add("hidden");
      } catch (e) {
        alert("Failed to revoke share link.");
      }
    };
  }

  const btnDownloadShareCard = document.getElementById("btn-download-share-card");
  if (btnDownloadShareCard) {
    btnDownloadShareCard.onclick = () => window.print();
  }

  if (btnCloseShare && modalShare) {
    btnCloseShare.onclick = () => modalShare.classList.add("hidden");
  }

  // ============================================================================
  // Krishi Mitra AI Chatbot Event Listeners & Voice Recognition
  // ============================================================================
  const btnKrishi = document.getElementById("btn-krishi-chat");
  const panelKrishi = document.getElementById("panel-krishi-chat");
  const btnChatClose = document.getElementById("btn-chat-close");
  const btnChatClear = document.getElementById("btn-chat-clear");
  const formChat = document.getElementById("form-krishi-chat");
  const inputChat = document.getElementById("input-chat-msg");
  const btnChatMic = document.getElementById("btn-chat-mic");

  if (btnKrishi && panelKrishi) {
    btnKrishi.onclick = () => {
      const isHidden = panelKrishi.classList.contains("hidden");
      if (isHidden) {
        panelKrishi.classList.remove("hidden");
        panelKrishi.classList.add("flex");
        renderChatMessages();
        if (inputChat) inputChat.focus();
      } else {
        panelKrishi.classList.add("hidden");
        panelKrishi.classList.remove("flex");
      }
    };
  }

  if (btnChatClose && panelKrishi) {
    btnChatClose.onclick = () => {
      panelKrishi.classList.add("hidden");
      panelKrishi.classList.remove("flex");
    };
  }

  if (btnChatClear) {
    btnChatClear.onclick = () => {
      chatMessagesHistory = [{
        sender: "bot",
        text: currentLang === 'kn'
          ? "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಮಿತ್ರ (Krishi Mitra). ಬೆಳೆ ಶಿಫಾರಸು, ಗೊಬ್ಬರದ ಲೆಕ್ಕಾಚಾರ, ಎಲೆ ರೋಗ ತಪಾಸಣೆ ಅಥವಾ ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿಗಳ ಬಗ್ಗೆ ಏನು ತಿಳಿಯಬೇಕಿದೆ?"
          : "Hello! I am Krishi Mitra, your AI farming assistant. Ask me anything about crop recommendations, fertilizer doses, disease scanner, or government subsidies!"
      }];
      renderChatMessages();
    };
  }

  // Quick reply chips
  document.querySelectorAll(".chat-quick-chip").forEach(chip => {
    chip.onclick = () => {
      const prompt = chip.innerText.trim();
      sendChatMessage(prompt);
    };
  });

  // Submit chat form
  if (formChat && inputChat) {
    formChat.onsubmit = (e) => {
      e.preventDefault();
      const txt = inputChat.value.trim();
      if (!txt) return;
      inputChat.value = "";
      sendChatMessage(txt);
    };
  }

  // Mute / Voice Reply Toggle Button
  const btnChatMute = document.getElementById("btn-chat-mute");
  const iconChatMute = document.getElementById("icon-chat-mute");
  function updateMuteBtnUI() {
    if (iconChatMute) {
      if (isVoiceMuted) {
        iconChatMute.className = "fa-solid fa-volume-xmark text-xs text-rose-300";
        if (btnChatMute) btnChatMute.title = "Voice Replies: Muted (Click to Unmute)";
      } else {
        iconChatMute.className = "fa-solid fa-volume-high text-xs text-emerald-100";
        if (btnChatMute) btnChatMute.title = "Voice Replies: Active (Click to Mute)";
      }
    }
  }
  if (btnChatMute) {
    updateMuteBtnUI();
    btnChatMute.onclick = () => {
      isVoiceMuted = !isVoiceMuted;
      localStorage.setItem('fdd_voice_muted', isVoiceMuted ? 'true' : 'false');
      if (isVoiceMuted && ('speechSynthesis' in window)) {
        window.speechSynthesis.cancel();
      }
      updateMuteBtnUI();
    };
  }

  // Web Speech API Voice Input (English + Kannada)
  let voiceActive = false;
  let recognitionInstance = null;
  if (btnChatMic && inputChat) {
    btnChatMic.onclick = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        chatMessagesHistory.push({
          sender: "bot",
          text: currentLang === 'kn'
            ? "⚠️ ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ Web Speech API ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು Chrome ಅಥವಾ Edge ಬಳಸಿ, ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ."
            : "⚠️ Web Speech API voice recognition is not supported in this browser. Please use Google Chrome or Edge, or type your question below."
        });
        renderChatMessages();
        return;
      }

      if (voiceActive && recognitionInstance) {
        recognitionInstance.stop();
        return;
      }

      try {
        recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.maxAlternatives = 1;
        recognitionInstance.lang = currentLang === 'kn' ? 'kn-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN');

        recognitionInstance.onstart = () => {
          voiceActive = true;
          btnChatMic.className = "w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center transition cursor-pointer shrink-0 animate-pulse shadow-md ring-2 ring-rose-400";
          inputChat.placeholder = currentLang === 'kn' ? "🎙️ ಆಲಿಸುತ್ತಿದೆ... ಮಾತನಾಡಿ..." : "🎙️ Listening... speak now...";
        };

        recognitionInstance.onresult = (evt) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = evt.resultIndex; i < evt.results.length; ++i) {
            if (evt.results[i].isFinal) {
              finalTranscript += evt.results[i][0].transcript;
            } else {
              interimTranscript += evt.results[i][0].transcript;
            }
          }
          if (interimTranscript && !finalTranscript) {
            inputChat.value = interimTranscript;
          }
          if (finalTranscript) {
            inputChat.value = finalTranscript;
            sendChatMessage(finalTranscript);
          }
        };

        recognitionInstance.onerror = (err) => {
          console.warn("Speech recognition error:", err);
          resetVoiceBtn();
          if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
            chatMessagesHistory.push({
              sender: "bot",
              text: currentLang === 'kn'
                ? "⚠️ ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಧ್ವನಿ ಆಜ್ಞೆಗಳನ್ನು ಬಳಸಲು ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿಸಿ ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ."
                : "⚠️ Microphone permission was denied. Please allow microphone access in your browser settings to use voice commands, or type your question below."
            });
            renderChatMessages();
          }
        };

        recognitionInstance.onend = () => {
          resetVoiceBtn();
        };

        recognitionInstance.start();
      } catch (err) {
        console.error("Speech recognition startup error:", err);
        resetVoiceBtn();
      }
    };

    function resetVoiceBtn() {
      voiceActive = false;
      if (btnChatMic) {
        btnChatMic.className = "w-9 h-9 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 flex items-center justify-center transition cursor-pointer shrink-0";
      }
      if (inputChat) {
        inputChat.placeholder = currentLang === 'kn' ? "ಕೃಷಿ ಮಿತ್ರರನ್ನು ಕೇಳಿ..." : "Ask Krishi Mitra...";
      }
    }
  }
}

function renderComparisonTable(container, compData) {
  const runs = compData.runs || compData.compared_runs || [];
  if (!container || runs.length === 0) return;

  const maxProfit = Math.max(...runs.map(r => Number(r.net_profit || r.net_profit_inr || 0)));

  container.innerHTML = `
    <div class="p-4 bg-white rounded-2xl border-2 border-emerald-500/80 shadow-md space-y-3 animate-fadeIn">
      <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
            <i class="fa-solid fa-scale-balanced"></i>
          </div>
          <div>
            <h4 class="font-extrabold text-slate-800 text-sm">Side-by-Side Past Run Comparison</h4>
            <span class="text-[11px] text-slate-500">Comparing ${runs.length} selected historical farming scenarios</span>
          </div>
        </div>
        <button type="button" id="btn-close-compare-tbl" class="text-xs px-2.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center gap-1">
          <i class="fa-solid fa-xmark"></i> <span>Close Table</span>
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
          <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th class="p-3 w-40 bg-slate-200/70">Parameter</th>
              ${runs.map(r => {
                const profit = Number(r.net_profit || r.net_profit_inr || 0);
                const isWinner = profit > 0 && profit === maxProfit;
                return `
                <th class="p-3 min-w-[160px] ${isWinner ? 'bg-emerald-50/80 border-b-2 border-emerald-600' : ''}">
                  <div class="flex items-center justify-between">
                    <span>Run #${r.run_id || r.id}</span>
                    ${isWinner ? '<span class="text-[10px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded shadow-xs">👑 Top Profit</span>' : ''}
                  </div>
                  <div class="text-[11px] font-normal text-slate-500">${r.timestamp ? r.timestamp.split(' ')[0] : 'Recent'}</div>
                </th>
                `;
              }).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-700">Top Recommended Crop</td>
              ${runs.map(r => `
                <td class="p-3">
                  <span class="font-bold text-slate-900">${r.top_crop_name || r.top_crop || 'Crop'}</span>
                  ${r.top_crop_kannada ? `<span class="block text-[11px] text-slate-500">${r.top_crop_kannada}</span>` : ''}
                </td>
              `).join('')}
            </tr>
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-700">Crop Suitability</td>
              ${runs.map(r => `
                <td class="p-3">
                  <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">${(r.suitability_pct || 0).toFixed(0)}% Match</span>
                </td>
              `).join('')}
            </tr>
            <tr class="hover:bg-slate-50 bg-emerald-50/30">
              <td class="p-3 font-bold text-emerald-950">Net Profit (Total)</td>
              ${runs.map(r => {
                const profit = Number(r.net_profit || r.net_profit_inr || 0);
                const isWinner = profit > 0 && profit === maxProfit;
                return `
                <td class="p-3 ${isWinner ? 'font-black text-emerald-900 text-sm' : 'font-extrabold text-emerald-700 text-sm'}">
                  ₹${profit.toLocaleString()}
                </td>
                `;
              }).join('')}
            </tr>
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-700">Profit / Acre</td>
              ${runs.map(r => {
                const acres = Number(r.land_acres || r.acres || 1.0);
                const profit = Number(r.net_profit || r.net_profit_inr || 0);
                const perAc = r.profit_per_acre || Math.round(profit / Math.max(0.1, acres));
                return `
                <td class="p-3 font-bold text-emerald-800">
                  ₹${Number(perAc).toLocaleString()} / ac
                </td>
                `;
              }).join('')}
            </tr>
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-700">Total Cultivation Cost</td>
              ${runs.map(r => `
                <td class="p-3 text-slate-800">₹${Number(r.total_cost || r.total_cost_inr || 0).toLocaleString()}</td>
              `).join('')}
            </tr>
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-700">Expected Gross Revenue</td>
              ${runs.map(r => `
                <td class="p-3 text-slate-800 font-semibold">₹${Number(r.total_revenue || r.gross_revenue || r.total_revenue_inr || 0).toLocaleString()}</td>
              `).join('')}
            </tr>
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-700">Land Area & Irrigation</td>
              ${runs.map(r => `
                <td class="p-3 text-slate-700">
                  <span class="font-bold">${r.land_acres || r.acres || 1.0} acres</span>
                  <span class="block text-[11px] text-slate-500 capitalize">💧 ${r.irrigation || 'Drip'}</span>
                </td>
              `).join('')}
            </tr>
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-700">Farmer Budget</td>
              ${runs.map(r => `
                <td class="p-3 text-slate-800">₹${Number(r.budget || 0).toLocaleString()}</td>
              `).join('')}
            </tr>
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-700">Soil Nutrients & Type</td>
              ${runs.map(r => `
                <td class="p-3 text-slate-700 text-[11px]">
                  <span class="font-semibold block">${r.soil_type || 'Clay Loam'}</span>
                  <span class="text-slate-500 font-mono">${r.soil_npk || 'Standard NPK'}</span>
                </td>
              `).join('')}
            </tr>
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-700">Location</td>
              ${runs.map(r => `
                <td class="p-3 text-slate-600 text-[11px] truncate max-w-[180px]" title="${r.location_name || ''}">
                  ${r.location_name || 'Karnataka Plot'}
                </td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const btnClose = document.getElementById("btn-close-compare-tbl");
  if (btnClose) {
    btnClose.onclick = () => {
      container.innerHTML = "";
    };
  }
}

// ============================================================================
// 14. Application Bootstrap & Service Worker Registration
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.getElementById("app");
  if (appContainer) {
    renderDashboardShell(appContainer, currentLang);
  }

  // Register PWA Service Worker for offline dashboard capability
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js')
      .then(reg => console.log("Service Worker registered successfully:", reg.scope))
      .catch(err => console.warn("Service Worker registration failed:", err));
  }
});
