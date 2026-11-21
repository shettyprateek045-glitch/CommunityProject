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
    disclaimer_note: "Guidance only. Always consult your local agriculture officer.",

    // Stepper
    step_loc: "1. Location",
    step_weather: "2. Weather",
    step_soil: "3. Soil & Fertilizer",
    step_farm: "4. Farm Profile",
    step_last_crop: "5. Last Crop",
    step_results: "6. Recommendations",
    btn_next: "Next ➡️",
    btn_prev: "⬅️ Back",

    // Step 1: Location
    modal_loc_title: "Allow location access",
    modal_loc_desc: "We use your location to show live weather and suggest the best crops for your farm.",
    btn_allow_location: "📍 Allow GPS Location",
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
    heading_top_crops: "Section A: Top Recommended Crops",
    subheading_top_crops: "Hard-filtered by budget, climate, and irrigation; ranked by agronomic profit score.",
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
    disclaimer_note: "ಇದು ಕೇವಲ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ. ಯಾವುದೇ ನಿರ್ಧಾರಕ್ಕೂ ಮುನ್ನ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",

    // Stepper
    step_loc: "೧. ಸ್ಥಳ",
    step_weather: "೨. ಹವಾಮಾನ",
    step_soil: "೩. ಮಣ್ಣು ಮತ್ತು ಗೊಬ್ಬರ",
    step_farm: "೪. ಹೊಲದ ವಿವರ",
    step_last_crop: "೫. ಹಿಂದಿನ ಬೆಳೆ",
    step_results: "೬. ಬೆಳೆ ಶಿಫಾರಸುಗಳು",
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
    heading_top_crops: "ವಿಭಾಗ ಎ: ಶಿಫಾರಸು ಮಾಡಿದ ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳು",
    subheading_top_crops: "ಬಜೆಟ್, ಹವಾಮಾನ ಮತ್ತು ನೀರಾವರಿ ಆಧಾರದ ಮೇಲೆ ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಶ್ರೇಣೀಕರಿಸಲಾಗಿದೆ.",
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
    disclaimer_note: "यह केवल मार्गदर्शन है। किसी भी निर्णय से पहले स्थानीय कृषि अधिकारी से परामर्श लें।",

    // Stepper
    step_loc: "१. स्थान",
    step_weather: "२. मौसम",
    step_soil: "३. मिट्टी व उर्वरक",
    step_farm: "४. खेत का विवरण",
    step_last_crop: "५. पिछली फसल",
    step_results: "६. फसल सिफारिशें",
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
    heading_top_crops: "भाग क: शीर्ष अनुशंसित फसलें",
    subheading_top_crops: "बजट, मौसम और सिंचाई सीमाओं के आधार पर छांटी और क्रमबद्ध की गई फसलें।",
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
export const farmContext = {
  lat: 15.3173,
  lon: 75.7139,
  accuracy_meters: 25.0,
  village: "Hubballi-Dharwad",
  district: "Dharwad",
  state: "Karnataka",
  country: "India",
  display_name: "Hubballi-Dharwad, Dharwad, Karnataka, India",
  soil_type: "Clay Loam",
  soil_n: 85.0,
  soil_p: 45.0,
  soil_k: 42.0,
  soil_ph: 6.8,
  land_acres: 3.0,
  budget_inr: 65000.0,
  irrigation: "drip",
  previous_crop: "gram",
  target_price_inr: 4500.0
};

let currentLang = 'en';
let currentStep = 1;
let currentUser = null;

// Map & Charts
let farmMap = null;
let farmMarker = null;
let farmCircle = null;
let climateChartInstance = null;
let mandiChartInstance = null;

// Cached API responses
let weatherData = null;
let irrigationScheduleData = null;
let soilgridsData = null;
let soilReport = null;
let rotationReport = null;
let recommendData = null;
let mandiTrendsData = null;
let verifiedSchemes = [];

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

// Throttled Reverse Geocoding (OpenStreetMap Nominatim: max 1 req/sec)
async function reverseGeocode(lat, lon) {
  const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  if (geocodeCache.has(key)) {
    return geocodeCache.get(key);
  }

  const now = Date.now();
  if (now - lastGeocodeTime < 1000) {
    await new Promise(r => setTimeout(r, 1000 - (now - lastGeocodeTime)));
  }
  lastGeocodeTime = Date.now();

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
    const resp = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'FarmerDecisionDashboard/2.0' }
    });
    if (resp.ok) {
      const data = await resp.json();
      const addr = data.address || {};
      const village = addr.village || addr.suburb || addr.town || addr.city || addr.county || "Farmland";
      const district = addr.county || addr.state_district || "";
      const state = addr.state || "Karnataka";
      const result = {
        village,
        district,
        state,
        country: addr.country || "India",
        display_name: data.display_name || `${village}, ${state}`
      };
      geocodeCache.set(key, result);
      return result;
    }
  } catch (err) {
    console.warn("Reverse geocode fetch failed:", err);
  }

  return {
    village: `Lat ${lat.toFixed(3)}, Lon ${lon.toFixed(3)}`,
    district: "Local Region",
    state: "Karnataka",
    country: "India",
    display_name: `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`
  };
}

async function updateFarmPosition(lat, lon, accuracy = 20.0, source = "manual") {
  farmContext.lat = lat;
  farmContext.lon = lon;
  farmContext.accuracy_meters = accuracy;

  const geo = await reverseGeocode(lat, lon);
  farmContext.village = geo.village;
  farmContext.district = geo.district;
  farmContext.state = geo.state;
  farmContext.display_name = geo.display_name;

  // Invalidate downstream dependent caches so weather, soil, and market re-fetch
  weatherData = null;
  irrigationScheduleData = null;
  soilgridsData = null;
  recommendData = null;
  mandiTrendsData = null;

  renderLocationDisplayCards();
  initOrUpdateFarmMap();

  // Proactively fetch SoilGrids estimate for the new coordinates
  fetchSoilGridsEstimate(lat, lon);
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
async function fetchLiveWeather(lat, lon) {
  try {
    const res = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      weatherData = await res.json();
      return weatherData;
    }
  } catch (err) {
    console.error("Live weather fetch error:", err);
  }
  return null;
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
    const res = await fetch('/api/weather/irrigation-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      irrigationScheduleData = await res.json();
      return irrigationScheduleData;
    }
  } catch (err) {
    console.error("Irrigation schedule fetch error:", err);
  }
  return null;
}

async function fetchSoilGridsEstimate(lat, lon) {
  try {
    const res = await fetch(`/api/soil/soilgrids?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      soilgridsData = await res.json();
      renderSoilGridsBadge();
      return soilgridsData;
    }
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
    const res = await fetch(`/api/prices/mandi-trends?lat=${farmContext.lat}&lon=${farmContext.lon}&target_price=${farmContext.target_price_inr}`);
    if (res.ok) {
      mandiTrendsData = await res.json();
      checkPriceAlertNotification(mandiTrendsData);
      return mandiTrendsData;
    }
  } catch (err) {
    console.error("Mandi trends error:", err);
  }
  return null;
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
              <span class="text-[10px] bg-[#2e7d32] text-emerald-100 px-2 py-0.5 rounded-full font-medium">Precision AI</span>
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

    <!-- Advisory Guidance Banner -->
    <div class="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-xs text-amber-900 font-semibold flex items-center justify-center gap-2">
      <i class="fa-solid fa-circle-exclamation text-amber-600"></i>
      <span>${t.disclaimer_note}</span>
    </div>

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
        </div>
      </div>
    </div>

    <!-- Main Stepper Panels Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
      <div id="step-panels-container">
        <section id="panel-step-1" class="step-panel space-y-6"></section>
        <section id="panel-step-2" class="step-panel space-y-6 hidden"></section>
        <section id="panel-step-3" class="step-panel space-y-6 hidden"></section>
        <section id="panel-step-4" class="step-panel space-y-6 hidden"></section>
        <section id="panel-step-5" class="step-panel space-y-6 hidden"></section>
        <section id="panel-step-6" class="step-panel space-y-6 hidden"></section>
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

            <div class="text-[11px] text-amber-800 font-semibold bg-amber-100/70 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <span>${t.disclaimer_note}</span>
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

    <!-- Side-by-Side Run Comparison & History Modal -->
    <div id="modal-history" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-5 max-h-[88vh] flex flex-col border border-slate-100">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800">${t.modal_compare_title}</h3>
              <p class="text-xs text-slate-500">Compare cost, revenue, profit and crop suitability across runs</p>
            </div>
          </div>
          <button id="btn-close-history" class="text-slate-400 hover:text-slate-600 text-xl cursor-pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- History Runs Selection & Compare Table -->
        <div id="history-content-container" class="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
          <div class="text-center py-8 text-slate-400">Loading saved runs...</div>
        </div>
      </div>
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
  const savedLocations = JSON.parse(localStorage.getItem('farmer_saved_locations') || '[]');

  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-[#1b5e20] text-2xl flex items-center justify-center shadow-inner">
            <i class="fa-solid fa-location-dot"></i>
          </div>
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-slate-900">${t.card_current_loc}</h2>
            <p class="text-xs text-slate-500">${t.pin_drag_hint}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" id="btn-use-browser-gps" class="px-3.5 py-1.5 rounded-xl bg-[#1b5e20] hover:bg-[#2e7d32] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer">
            <i class="fa-solid fa-location-crosshairs"></i>
            <span>${t.btn_allow_location}</span>
          </button>
        </div>
      </div>

      <!-- Current Location Display Card -->
      <div class="p-5 rounded-2xl bg-earth-50 border border-earth-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>📍</span>
            <span id="loc-display-village">${farmContext.village || "Hubballi-Dharwad"}</span>, 
            <span id="loc-display-state" class="text-slate-600 font-semibold">${farmContext.district ? farmContext.district + ", " : ""}${farmContext.state}</span>
          </div>
          <div class="text-xs text-slate-500 font-mono flex items-center gap-3">
            <span>Lat: <strong class="text-slate-700">${farmContext.lat.toFixed(4)}° N</strong></span>
            <span>Lon: <strong class="text-slate-700">${farmContext.lon.toFixed(4)}° E</strong></span>
            <span>Accuracy: <strong class="text-emerald-700">±${(farmContext.accuracy_meters || 20).toFixed(0)}m</strong></span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button type="button" id="btn-save-this-loc" class="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-bookmark text-amber-600"></i>
            <span>${t.btn_save_loc}</span>
          </button>
        </div>
      </div>

      <!-- Interactive Leaflet Map Container -->
      <div class="space-y-2">
        <div id="farm-leaflet-map" style="height: 340px; width: 100%; border-radius: 1.25rem; border: 1px solid #cbd5e1; z-index: 10;"></div>
      </div>

      <!-- Manual Village Search & Saved Locations Bar -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <!-- Search -->
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

        <!-- Saved Locations -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">${t.saved_locations}</label>
          <div id="saved-locations-list" class="flex flex-wrap gap-2 text-xs">
            ${savedLocations.length > 0 ? savedLocations.map((l, i) => `
              <button type="button" data-idx="${i}" class="btn-load-saved-loc px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 rounded-lg text-slate-800 font-medium transition cursor-pointer">
                📌 ${l.name}
              </button>
            `).join('') : `<span class="text-slate-400 text-[11px]">No saved locations yet. Save current spot for 1-click recall.</span>`}
          </div>
        </div>
      </div>

    </div>
  `;

  bindLocationStepListeners();
  setTimeout(initOrUpdateFarmMap, 100);
}

function bindLocationStepListeners() {
  const btnGps = document.getElementById("btn-use-browser-gps");
  if (btnGps) {
    btnGps.onclick = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await updateFarmPosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, "gps");
          },
          (err) => {
            alert("Could not retrieve GPS coordinates. Please drag the pin on the map or enter your town manually.");
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        alert("Geolocation not supported by this browser.");
      }
    };
  }

  const btnSaveLoc = document.getElementById("btn-save-this-loc");
  if (btnSaveLoc) {
    btnSaveLoc.onclick = () => {
      const saved = JSON.parse(localStorage.getItem('farmer_saved_locations') || '[]');
      saved.push({
        name: farmContext.village || "Karnataka Farm",
        lat: farmContext.lat,
        lon: farmContext.lon
      });
      localStorage.setItem('farmer_saved_locations', JSON.stringify(saved.slice(-6)));
      renderLocationStepView(document.getElementById("panel-step-1"));
    };
  }

  document.querySelectorAll(".btn-load-saved-loc").forEach(btn => {
    btn.onclick = async () => {
      const idx = parseInt(btn.getAttribute("data-idx") || "0");
      const saved = JSON.parse(localStorage.getItem('farmer_saved_locations') || '[]');
      if (saved[idx]) {
        await updateFarmPosition(saved[idx].lat, saved[idx].lon, 15.0, "saved");
      }
    };
  });

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
  if (v) v.innerText = farmContext.village || "Karnataka Farm";
  if (s) s.innerText = (farmContext.district ? farmContext.district + ", " : "") + farmContext.state;
}

// ============================================================================
// 8. Step 2: Weather & FAO-56 Irrigation Schedule
// ============================================================================
async function renderWeatherStepView(container) {
  const t = I18N[currentLang];

  if (!weatherData) {
    container.innerHTML = `
      <div class="bg-white rounded-3xl p-10 text-center space-y-4 border border-slate-100 shadow-sm">
        <div class="inline-block animate-spin text-4xl text-emerald-600"><i class="fa-solid fa-cloud-sun"></i></div>
        <h3 class="text-base font-bold text-slate-800">Fetching live weather from Open-Meteo...</h3>
        <p class="text-xs text-slate-500">Querying live satellite micro-climate for coordinates (${farmContext.lat.toFixed(4)}, ${farmContext.lon.toFixed(4)}).</p>
      </div>
    `;
    await fetchLiveWeather(farmContext.lat, farmContext.lon);
    await fetchIrrigationSchedule();
    if (currentStep === 2) renderWeatherStepView(container);
    return;
  }

  const cur = weatherData.current || {};
  const daily = weatherData.daily_7d || [];
  const isDay = cur.is_day !== undefined ? cur.is_day : 1;
  const dayNightBadge = isDay === 1
    ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-200/30 text-amber-100 text-[10px] font-bold">☀️ Daytime</span>`
    : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-900/40 text-indigo-100 text-[10px] font-bold">🌙 Nighttime</span>`;

  const lastUpdated = cur.last_updated || new Date().toLocaleTimeString();

  // 7-Day irrigation schedule cards
  const irriDays = (irrigationScheduleData && irrigationScheduleData.daily_schedule) || [];
  const sowingAdvice = (irrigationScheduleData && irrigationScheduleData.sowing_window_advice) || {};

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
              <span class="text-[10px] text-emerald-200/80">Updated: ${lastUpdated}</span>
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
            <span class="text-lg font-bold text-amber-300">${(weatherData.rainfall_7d_total || 0).toFixed(1)} mm</span>
          </div>
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
              ${irriDays.map(d => `
                <tr class="hover:bg-slate-50">
                  <td class="p-2.5 font-bold text-slate-800">${d.date}</td>
                  <td class="p-2.5 text-slate-600">${d.etc_water_demand_mm.toFixed(1)} mm</td>
                  <td class="p-2.5 text-blue-700 font-semibold">${d.forecast_rainfall_mm.toFixed(1)} mm</td>
                  <td class="p-2.5 font-bold ${d.net_irrigation_depth_mm > 0 ? 'text-amber-700' : 'text-emerald-700'}">
                    ${d.net_irrigation_depth_mm.toFixed(1)} mm
                  </td>
                  <td class="p-2.5 font-bold text-slate-800">${d.liters_needed_per_acre.toLocaleString()} L</td>
                  <td class="p-2.5 text-slate-600">${d.drip_runtime_hours.toFixed(1)} hrs</td>
                </tr>
              `).join('')}
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

    </div>
  `;

  const btnRefresh = document.getElementById("btn-refresh-weather-step");
  if (btnRefresh) {
    btnRefresh.onclick = async () => {
      weatherData = null;
      await renderWeatherStepView(container);
    };
  }

  renderClimateChart(weatherData.monthly_climate_12m);
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
          data: data.map(d => d.rain_mm),
          backgroundColor: '#3b82f6',
          borderRadius: 4,
          yAxisID: 'y'
        },
        {
          label: 'Avg Temp (°C)',
          data: data.map(d => d.temp_avg),
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
          <span class="text-[11px] text-emerald-800 font-medium">Used for crop suitability and fertilizer dosages</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>${t.lbl_soil_n}</span>
              <button type="button" id="mic-soil-n" class="text-slate-400 hover:text-emerald-700 cursor-pointer text-xs"><i class="fa-solid fa-microphone"></i></button>
            </label>
            <input type="number" id="input-soil-n" value="${farmContext.soil_n}" min="0" max="300" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white" />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>${t.lbl_soil_p}</span>
              <button type="button" id="mic-soil-p" class="text-slate-400 hover:text-emerald-700 cursor-pointer text-xs"><i class="fa-solid fa-microphone"></i></button>
            </label>
            <input type="number" id="input-soil-p" value="${farmContext.soil_p}" min="0" max="250" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white" />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>${t.lbl_soil_k}</span>
              <button type="button" id="mic-soil-k" class="text-slate-400 hover:text-emerald-700 cursor-pointer text-xs"><i class="fa-solid fa-microphone"></i></button>
            </label>
            <input type="number" id="input-soil-k" value="${farmContext.soil_k}" min="0" max="300" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white" />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>${t.lbl_soil_ph}</span>
              <button type="button" id="mic-soil-ph" class="text-slate-400 hover:text-emerald-700 cursor-pointer text-xs"><i class="fa-solid fa-microphone"></i></button>
            </label>
            <input type="number" id="input-soil-ph" step="0.1" value="${farmContext.soil_ph}" min="4.0" max="9.5" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white" />
          </div>

          <div class="col-span-2 sm:col-span-1">
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">${t.lbl_soil_type}</label>
            <select id="input-soil-type-select" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white">
              <option value="Clay Loam" ${farmContext.soil_type === 'Clay Loam' ? 'selected' : ''}>Clay Loam</option>
              <option value="Black Cotton" ${farmContext.soil_type === 'Black Cotton' ? 'selected' : ''}>Black Cotton</option>
              <option value="Red Loam" ${farmContext.soil_type === 'Red Loam' ? 'selected' : ''}>Red Loam</option>
              <option value="Alluvial" ${farmContext.soil_type === 'Alluvial' ? 'selected' : ''}>Alluvial</option>
              <option value="Sandy Loam" ${farmContext.soil_type === 'Sandy Loam' ? 'selected' : ''}>Sandy Loam</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Soil Photo Upload Box -->
      <div class="p-6 rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70 transition space-y-4 text-center">
        <input type="file" id="input-soil-file" accept="image/*" class="hidden" capture="environment" />
        <div id="soil-upload-empty" class="space-y-3 cursor-pointer" onclick="document.getElementById('input-soil-file').click()">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-[#1b5e20] text-2xl flex items-center justify-center mx-auto shadow-inner">
            <i class="fa-solid fa-camera"></i>
          </div>
          <div>
            <div class="text-sm font-bold text-slate-800">${t.lbl_soil_photo_box}</div>
            <p class="text-xs text-slate-500">${t.soil_photo_hint}</p>
          </div>
        </div>

        <!-- Non-Soil Rejection Alert -->
        <div id="soil-rejection-alert" class="hidden p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-left space-y-1">
          <div class="font-bold text-rose-900">❌ ${t.soil_reject_title}</div>
          <p class="text-rose-700 font-medium">${t.soil_reject_msg}</p>
        </div>

        <!-- Uncertainty Alert (<60%) -->
        <div id="soil-uncertain-alert" class="hidden p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-left space-y-1">
          <div class="font-bold text-amber-900">${t.lbl_uncertain_soil}</div>
        </div>
      </div>

      <!-- Interactive Fertilizer Plan Calculator Section -->
      <div class="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-5">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">${t.heading_fertilizer_calc}</h3>
            <p class="text-xs text-slate-500">Calculates whole-farm commercial bags (Urea, DAP, MOP) and organic balance</p>
          </div>
          <button type="button" id="btn-run-fertilizer-calc" class="px-4 py-2 rounded-xl bg-[#1b5e20] hover:bg-[#2e7d32] text-white text-xs font-bold transition shadow-xs cursor-pointer">
            ${t.btn_calc_fertilizer}
          </button>
        </div>

        <div id="fertilizer-calc-results" class="space-y-4">
          <div class="text-center py-4 text-xs text-slate-400">Click "Calculate Fertilizer Doses" to generate whole-farm commercial bag requirements.</div>
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
  if (soilFileInput) {
    soilFileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const rejectAlert = document.getElementById("soil-rejection-alert");
      const uncertainAlert = document.getElementById("soil-uncertain-alert");
      rejectAlert.classList.add("hidden");
      uncertainAlert.classList.add("hidden");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const resp = await fetch("/api/photo/analyze-soil", { method: "POST", body: formData });
        if (resp.ok) {
          const res = await resp.json();
          if (res.status === "not_soil") {
            rejectAlert.classList.remove("hidden");
          } else if (res.status === "uncertain" || (res.confidence && res.confidence < 60)) {
            uncertainAlert.classList.remove("hidden");
          } else {
            farmContext.soil_type = res.soil_type;
            if (soilTypeSelect) soilTypeSelect.value = res.soil_type;
            alert(`Detected Soil: ${res.soil_type} (${res.confidence.toFixed(1)}% confidence)`);
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
      const resContainer = document.getElementById("fertilizer-calc-results");
      resContainer.innerHTML = `<div class="text-center py-4 text-xs text-slate-500">Calculating nutrient gap and commercial bags...</div>`;
      const plan = await fetchFertilizerPlan(farmContext.previous_crop || "maize");
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
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Commercial Fertilizer Dosage (${plan.acres} Acres)</span>
        <span class="text-xs font-bold text-emerald-800">Total Fertilizer Cost: ₹${comm.total_cost_inr ? comm.total_cost_inr.toLocaleString() : '0'}</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
        <div class="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
          <span class="text-slate-500 text-[10px] block">DAP (50kg bags)</span>
          <strong class="text-base text-slate-800">${comm.dap_bags || 0} bags</strong>
          <span class="text-[10px] text-slate-500 block">Total: ₹${(comm.dap_cost_inr || 0).toLocaleString()}</span>
        </div>

        <div class="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
          <span class="text-slate-500 text-[10px] block">Urea (45kg bags)</span>
          <strong class="text-base text-slate-800">${comm.urea_bags || 0} bags</strong>
          <span class="text-[10px] text-slate-500 block">Total: ₹${(comm.urea_cost_inr || 0).toLocaleString()}</span>
        </div>

        <div class="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
          <span class="text-slate-500 text-[10px] block">MOP (50kg bags)</span>
          <strong class="text-base text-slate-800">${comm.mop_bags || 0} bags</strong>
          <span class="text-[10px] text-slate-500 block">Total: ₹${(comm.mop_cost_inr || 0).toLocaleString()}</span>
        </div>

        <div class="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
          <span class="text-slate-500 text-[10px] block">FYM (Farm Compost)</span>
          <strong class="text-base text-slate-800">${comm.fym_organic_tons || 0} tons</strong>
          <span class="text-[10px] text-slate-500 block">Total: ₹${(comm.fym_cost_inr || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>

    <!-- Step-by-Step Formula Explanation -->
    <div class="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
      <span class="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">Formula Breakdown Behind Dosages:</span>
      <ul class="list-disc list-inside space-y-1 text-slate-600">
        ${(plan.formulas_explained || []).map(f => `<li>${f}</li>`).join('')}
      </ul>
      <div class="pt-2 text-[10px] text-amber-800 font-semibold">
        💡 Note: Always apply phosphorus and potash basal at sowing, and split urea doses at 30 & 60 days. ${I18N[currentLang].disclaimer_note}
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
      <div class="bg-white rounded-3xl p-10 text-center space-y-4 border border-slate-100 shadow-sm">
        <div class="inline-block animate-spin text-4xl text-emerald-600"><i class="fa-solid fa-spinner"></i></div>
        <h3 class="text-base font-bold text-slate-800">Calculating agronomic recommendations & mandi prices...</h3>
        <p class="text-xs text-slate-500">Applying strict hard filters (budget, water feasibility, climate suitability) for ${farmContext.land_acres} acres.</p>
      </div>
    `;

    try {
      const payload = {
        lat: farmContext.lat,
        lon: farmContext.lon,
        acres: farmContext.land_acres,
        budget_inr: farmContext.budget_inr,
        irrigation: farmContext.irrigation,
        soil_type: farmContext.soil_type,
        soil_n: farmContext.soil_n,
        soil_p: farmContext.soil_p,
        soil_k: farmContext.soil_k,
        soil_ph: farmContext.soil_ph,
        previous_crop: farmContext.previous_crop
      };

      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        recommendData = await res.json();
      }
    } catch (err) {
      console.error("Recommend fetch error:", err);
    }

    await fetchMandiTrends();
    if (currentStep === 6) renderResultsStepView(container);
    return;
  }

  const topCrops = (recommendData && recommendData.top_crops) || [];
  const weatherFitCrops = (recommendData && recommendData.weather_fit_crops) || [];
  const alternativeCrops = (recommendData && recommendData.alternative_crops) || [];

  const renderCropCard = (c, rank) => {
    const riskBadgeColor = c.risk_badge === 'Low' ? 'bg-emerald-100 text-emerald-800' : (c.risk_badge === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800');

    return `
      <div class="crop-card bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition hover:shadow-md">
        <div class="p-5 sm:p-6 space-y-4">
          <div class="flex items-start justify-between flex-wrap gap-2">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-full bg-[#1b5e20] text-white flex items-center justify-center font-bold text-sm shadow-xs">#${rank}</span>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900">${currentLang === 'kn' ? c.kannada_name : (currentLang === 'hi' ? c.display_name : c.display_name)}</h3>
                <span class="text-xs text-slate-500 font-medium">${c.season} • ${c.duration_days} days • Water: ${c.water_need_level}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-full bg-emerald-50 text-[#1b5e20] border border-emerald-200 font-bold text-xs">
                ${c.suitability_pct.toFixed(0)}% Suitability
              </span>
              <span class="px-2.5 py-1 rounded-full ${riskBadgeColor} font-bold text-xs">
                ${c.risk_badge} Risk
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
              <span class="text-[10px] text-emerald-700 block">Net Margin across ${farmContext.land_acres} ac</span>
            </div>
          </div>

          <!-- Reasons list matching the numbers -->
          <div class="space-y-1">
            <ul class="text-xs text-slate-700 space-y-1 font-medium">
              ${c.reasons.map(r => `<li class="flex items-start gap-1.5"><span class="text-emerald-700">✓</span><span>${r}</span></li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  };

  container.innerHTML = `
    <div class="space-y-8">
      
      <!-- Section A: Top Recommended Crops -->
      <section class="space-y-4">
        <div>
          <h2 class="text-lg sm:text-xl font-extrabold text-slate-900">${t.heading_top_crops}</h2>
          <p class="text-xs text-slate-500">${t.subheading_top_crops}</p>
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

    </div>
  `;

  bindResultsStepListeners();
  const mandiPrices = mandiTrendsData ? (mandiTrendsData.historical_prices_30d || mandiTrendsData.trend_30d || []) : [];
  renderMandiChart(mandiPrices);
}

function bindResultsStepListeners() {
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

  for (let i = 1; i <= 6; i++) {
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
    if (currentStep === 6) nextBtn.classList.add("hidden");
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
  if (btnNext) btnNext.onclick = () => { if (currentStep < 6) navigateToStep(currentStep + 1); };

  // Language buttons (EN, KN, HI)
  const lEn = document.getElementById("lang-en");
  const lKn = document.getElementById("lang-kn");
  const lHi = document.getElementById("lang-hi");

  if (lEn) lEn.onclick = () => renderDashboardShell(document.getElementById("app"), 'en');
  if (lKn) lKn.onclick = () => renderDashboardShell(document.getElementById("app"), 'kn');
  if (lHi) lHi.onclick = () => renderDashboardShell(document.getElementById("app"), 'hi');

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

      const fd = new FormData();
      fd.append("file", file);

      try {
        const resp = await fetch("/api/photo/leaf-disease", { method: "POST", body: fd });
        if (resp.ok) {
          const res = await resp.json();
          if (res.status === "not_leaf") {
            rejAlert.classList.remove("hidden");
          } else if (res.status === "uncertain" || (res.confidence && res.confidence < 0.60)) {
            uncAlert.classList.remove("hidden");
          } else {
            card.classList.remove("hidden");
            document.getElementById("leaf-diagnosis-name").innerText = res.disease_name;
            const badge = document.getElementById("leaf-confidence-badge");
            badge.innerText = `${(res.confidence * 100).toFixed(1)}% Confidence`;
            badge.className = `px-2.5 py-1 rounded-full text-xs font-bold ${res.confidence > 0.75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`;

            document.getElementById("leaf-pathogen-txt").innerText = res.pathogen || "N/A";
            document.getElementById("leaf-symptoms-txt").innerText = res.symptoms || "N/A";
            document.getElementById("leaf-treatment-txt").innerText = res.treatment_guidance || "Consult agriculture officer.";

            const img = document.getElementById("leaf-annotated-img");
            if (res.annotated_image_base64) {
              img.src = "data:image/jpeg;base64," + res.annotated_image_base64;
              img.classList.remove("hidden");
            } else {
              img.classList.add("hidden");
            }
          }
        }
      } catch (err) {
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
      listContainer.innerHTML = schemes.map(s => `
        <div class="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="font-extrabold text-slate-900 text-sm">${s.name}</h4>
            <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">${s.type}</span>
          </div>
          <p class="text-slate-600">${s.benefit}</p>
          <div class="text-slate-500 font-medium"><strong>Eligibility:</strong> ${s.eligibility}</div>
          <div class="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span class="text-[10px] text-slate-400">Verified: ${s.last_verified}</span>
            <a href="${s.official_portal_url}" target="_blank" rel="noopener noreferrer" class="px-3 py-1 bg-[#1b5e20] text-white rounded-lg font-bold hover:bg-[#2e7d32] transition text-[11px]">
              Official Portal ↗
            </a>
          </div>
        </div>
      `).join('');
    };
  }
  if (btnCloseSchemes && modalSchemes) btnCloseSchemes.onclick = () => modalSchemes.classList.add("hidden");

  // History / Run Comparison Modal
  const btnHistory = document.getElementById("btn-history");
  const modalHistory = document.getElementById("modal-history");
  const btnCloseHistory = document.getElementById("btn-close-history");

  if (btnHistory && modalHistory) {
    btnHistory.onclick = async () => {
      modalHistory.classList.remove("hidden");
      const content = document.getElementById("history-content-container");
      content.innerHTML = `<div class="text-center py-6 text-slate-400">Loading saved farm runs...</div>`;
      try {
        const resp = await fetch("/api/history/runs");
        if (resp.ok) {
          const resData = await resp.json();
          const runs = Array.isArray(resData) ? resData : (resData.history || []);
          if (runs.length === 0) {
            content.innerHTML = `<p class="text-center py-8 text-slate-400">No past runs saved yet. Completing recommendation runs will save them here.</p>`;
            return;
          }

          content.innerHTML = `
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-700">Select runs to compare side-by-side:</span>
                <button type="button" id="btn-exec-compare" class="px-4 py-1.5 bg-[#1b5e20] text-white rounded-xl font-bold hover:bg-[#2e7d32] transition cursor-pointer">
                  Compare Selected
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="runs-checkbox-list">
                ${runs.map(r => {
                  const runId = r.id || r.run_id;
                  const loc = r.village || r.location_name || 'Farm';
                  const acres = r.acres || (r.inputs && r.inputs.land_acres) || 1.0;
                  const date = r.created_at || r.timestamp || 'Recent';
                  const budget = r.budget_inr || (r.inputs && r.inputs.budget_inr) || 0;
                  const topCrop = r.top_crop || (r.top_crops && r.top_crops[0] && r.top_crops[0].display_name) || 'Crop';
                  const profit = r.net_profit_inr || (r.top_crops && r.top_crops[0] && r.top_crops[0].net_profit_inr) || 0;
                  return `
                  <label class="p-3 bg-earth-50 rounded-xl border border-earth-200 flex items-start gap-3 cursor-pointer hover:bg-earth-100">
                    <input type="checkbox" value="${runId}" class="mt-1 run-compare-chk accent-emerald-700" />
                    <div>
                      <div class="font-bold text-slate-800">Run #${runId} - ${loc} (${acres} ac)</div>
                      <div class="text-[11px] text-slate-500">Date: ${date} • Budget: ₹${budget.toLocaleString()}</div>
                      <div class="text-[11px] text-emerald-800 font-semibold">Top Crop: ${topCrop} (Profit: ₹${profit.toLocaleString()})</div>
                    </div>
                  </label>
                  `;
                }).join('')}
              </div>

              <div id="side-by-side-compare-table" class="space-y-2"></div>
            </div>
          `;

          const btnCompare = document.getElementById("btn-exec-compare");
          if (btnCompare) {
            btnCompare.onclick = async () => {
              const selected = Array.from(document.querySelectorAll(".run-compare-chk:checked")).map(cb => parseInt(cb.value));
              if (selected.length < 2) {
                alert("Please select at least 2 runs to compare side-by-side.");
                return;
              }
              const compResp = await fetch("/api/history/compare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ run_ids: selected })
              });
              if (compResp.ok) {
                const compData = await compResp.json();
                renderComparisonTable(document.getElementById("side-by-side-compare-table"), compData);
              }
            };
          }
        }
      } catch (err) {
        content.innerHTML = `<p class="text-rose-600">Failed to load history runs.</p>`;
      }
    };
  }
  if (btnCloseHistory && modalHistory) btnCloseHistory.onclick = () => modalHistory.classList.add("hidden");
}

function renderComparisonTable(container, compData) {
  const runs = compData.runs || compData.compared_runs || [];
  container.innerHTML = `
    <div class="pt-4 border-t border-slate-200">
      <h4 class="font-bold text-slate-800 text-sm mb-2">Side-by-Side Comparison Metrics:</h4>
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
          <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th class="p-2.5">Metric</th>
              ${runs.map(r => `<th class="p-2.5">Run #${r.id || r.run_id} (${r.top_crop || r.top_crop_name || 'Crop'})</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr>
              <td class="p-2.5 font-bold text-slate-700">Land Acres</td>
              ${runs.map(r => `<td class="p-2.5">${r.acres || r.land_acres || 1.0} ac</td>`).join('')}
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-slate-700">Total Cultivation Cost</td>
              ${runs.map(r => `<td class="p-2.5 text-slate-800">₹${(r.total_cost || r.total_cost_inr || 0).toLocaleString()}</td>`).join('')}
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-slate-700">Gross Revenue</td>
              ${runs.map(r => `<td class="p-2.5 text-slate-800">₹${(r.gross_revenue || r.total_revenue || r.total_revenue_inr || 0).toLocaleString()}</td>`).join('')}
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-emerald-800">Net Profit</td>
              ${runs.map(r => `<td class="p-2.5 font-extrabold text-emerald-800">₹${(r.net_profit || r.net_profit_inr || 0).toLocaleString()}</td>`).join('')}
            </tr>
            <tr>
              <td class="p-2.5 font-bold text-slate-700">Suitability</td>
              ${runs.map(r => `<td class="p-2.5 font-bold text-emerald-700">${(r.suitability_pct || 0).toFixed(0)}%</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
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
