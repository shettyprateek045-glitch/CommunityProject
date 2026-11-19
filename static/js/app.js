/**
 * Farmer Decision Dashboard - Frontend Client Application (ES Module)
 * Implements 6-step precision agronomic stepper, centered location modal,
 * real-time Open-Meteo micro-climate, non-soil rejection vision gate,
 * pedological soil report, crop rotation engine, and 3-section recommendation matrix.
 */

// ============================================================================
// 1. Bilingual Translations Dictionary (English & Kannada)
// ============================================================================
const I18N = {
  en: {
    app_title: "Farmer Decision Dashboard",
    app_subtitle: "Precision Agronomic Planning, Market Forecasting & Smart Irrigation",
    nav_history: "Past Runs",
    btn_export_pdf: "Export PDF",

    // Stepper
    step_loc: "1. Location",
    step_weather: "2. Weather",
    step_soil: "3. Soil",
    step_farm: "4. Farm Profile",
    step_last_crop: "5. Last Crop",
    step_results: "6. Results",
    btn_next: "Next ➡️",
    btn_prev: "⬅️ Back",

    // Step 1: Location Modal & Card
    modal_loc_title: "Allow location access",
    modal_loc_desc: "We use your location to show live weather and suggest the best crops for your farm.",
    btn_allow_location: "📍 Allow location",
    btn_enter_manually: "⌨️ Enter manually",
    loc_detecting: "Detecting your location via GPS...",
    loc_needs_https: "⚠️ Location access requires HTTPS (or localhost). Please enter your village manually.",
    loc_denied_help: "Location permission blocked. To re-enable: click the lock/settings icon next to the URL in your browser -> Permissions -> Allow Location, then refresh.",
    card_current_loc: "Current Location",
    btn_change_loc: "Change location",
    lbl_village_search: "Search Village, Town or District",
    btn_search: "Search",

    // Step 2: Weather Card
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
    heading_historical_climate: "12-Month Climate Baseline",

    // Step 3: Soil Photo & Report
    heading_soil_section: "Soil Analysis & Health Card",
    subheading_soil: "Upload a surface soil photo or select your soil type and Soil Health Card values manually.",
    lbl_soil_photo_box: "Upload Soil Photo (Camera / Gallery)",
    soil_photo_hint: "Accepts JPG, PNG, WebP up to 10MB. Hold camera steady in bright daylight.",
    btn_choose_soil_manual: "⌨️ Enter soil parameters manually",
    soil_reject_title: "❌ Not a Soil Image",
    soil_reject_msg: "Please upload a clear, close-up photo of bare soil.",
    btn_soil_retake: "📷 Retake Photo",
    lbl_good_examples: "✅ Good: Close-up photo of bare farmland soil in daylight.",
    lbl_bad_examples: "❌ Bad: Plant foliage, screenshots, people, vehicles, rooms, or blurry photos.",
    heading_soil_report: "Pedological Soil Report",
    lbl_soil_type: "Identified Soil Type:",
    lbl_uncertain_soil: "⚠️ Not sure (<60%). Please confirm your soil type in the dropdown below.",
    lbl_soil_colour: "Color:",
    lbl_soil_texture: "Texture:",
    lbl_soil_moisture: "Visible Moisture:",
    lbl_water_holding: "Water-Holding Capacity:",
    lbl_drainage: "Drainage Rate:",
    lbl_organic_matter: "Organic Matter Level:",
    lbl_ph_range: "Typical pH Range:",
    lbl_fertility_level: "Fertility Level:",
    lbl_estimated_npk_badge: "⚠️ Estimated from photo. Enter your Soil Health Card values for accuracy.",
    lbl_problems_to_watch: "Problems to Watch & Simple Actionable Fixes:",
    lbl_suitable_crops: "Naturally Adapted Crops:",
    lbl_soil_n: "Available Nitrogen (N, kg/ha)",
    lbl_soil_p: "Available Phosphorus (P, kg/ha)",
    lbl_soil_k: "Available Potassium (K, kg/ha)",
    lbl_soil_ph: "Soil pH Level",

    // Step 4: Farm Profile
    heading_farm_profile: "Farm Land & Economic Parameters",
    lbl_land_size: "Land Size (Acres)",
    lbl_budget: "Cultivation Budget (INR ₹)",
    lbl_irrigation: "Irrigation System Available",

    // Step 5: Crop Rotation
    heading_rotation_section: "Previous Crop & Soil Rotation Impact",
    subheading_rotation: "Select the previous standing crop to adjust available nutrients and break pest/pathogen cycles.",
    lbl_select_previous: "Select Previous / Standing Crop:",
    heading_rotation_report: "Soil Fertility & Rotation Impact Report",
    lbl_family: "Botanical Family:",
    lbl_fertility_impact: "Fertility Impact:",
    lbl_adjusted_npk: "Rotation-Adjusted Soil NPK (kg/ha):",
    lbl_recommended_succession: "Recommended Next Rotational Crops:",
    lbl_crops_to_avoid: "Crops to Avoid (Pathogen / Pest Cycles):",
    lbl_soil_health_tips: "Agronomic Soil Health Guidance:",

    // Step 6: Recommendations
    heading_top_crops: "Section A: Top 5 Recommended Crops",
    subheading_top_crops: "Ranked by weighted composite score: agronomic suitability, net profit margin, and weather risk score.",
    heading_weather_fit: "Section B: Top 3 Crops for Current Weather",
    subheading_weather_fit: "Crops perfectly adapted to current temperature, moisture, and seasonal outlook.",
    heading_alternatives: "Section C: Top 3 Strategic Alternatives",
    subheading_alternatives: "High-impact actions to boost returns if you upgrade irrigation, expand working capital, or balance nutrients.",
    lbl_condition: "Condition:",
    lbl_action: "Action Required:",
    lbl_benefit: "Projected Benefit:",
    heading_whatif: "Interactive What-If Simulation Sliders",
    lbl_weights: "Ranking Priority Weights (Suitability / Profit / Safety):",
    suitability: "Suitability",
    yield: "Yield",
    cost: "Cost",
    revenue: "Revenue",
    profit: "Net Profit",
    risk: "Risk",
    why_this_crop: "Agronomic Advantages",
    fertilizer_tag: "NPK Balancing Guidance",
    growth_calendar_tag: "Cultivation Timeline"
  },
  kn: {
    app_title: "ರೈತ ನಿರ್ಧಾರ ಬೆಂಬಲ ವ್ಯವಸ್ಥೆ",
    app_subtitle: "ನಿಖರ ಕೃಷಿ ಯೋಜನೆ, ಮಾರುಕಟ್ಟೆ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ",
    nav_history: "ಹಿಂದಿನ ದಾಖಲೆಗಳು",
    btn_export_pdf: "ವರದಿ ಡೌನ್‌ಲೋಡ್ (PDF)",

    // Stepper
    step_loc: "೧. ಸ್ಥಳ",
    step_weather: "೨. ಹವಾಮಾನ",
    step_soil: "೩. ಮಣ್ಣು",
    step_farm: "೪. ಹೊಲದ ವಿವರ",
    step_last_crop: "೫. ಹಿಂದಿನ ಬೆಳೆ",
    step_results: "೬. ಶಿಫಾರಸುಗಳು",
    btn_next: "ಮುಂದೆ ➡️",
    btn_prev: "⬅️ ಹಿಂದಕ್ಕೆ",

    // Step 1: Location Modal & Card
    modal_loc_title: "ಸ್ಥಳ ಪ್ರವೇಶವನ್ನು ಅನುಮತಿಸಿ",
    modal_loc_desc: "ನಿಮ್ಮ ಜಮೀನಿಗೆ ಲೈವ್ ಹವಾಮಾನ ಮತ್ತು ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳನ್ನು ಸೂಚಿಸಲು ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಬಳಸುತ್ತೇವೆ.",
    btn_allow_location: "📍 ಸ್ಥಳ ಅನುಮತಿಸಿ",
    btn_enter_manually: "⌨️ ಹಸ್ತಚಾಲಿತವಾಗಿ ನಮೂದಿಸಿ",
    loc_detecting: "ಜಿಪಿಎಸ್ ಮೂಲಕ ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...",
    loc_needs_https: "⚠️ ಸ್ಥಳ ಪ್ರವೇಶಕ್ಕೆ HTTPS ಅಗತ್ಯವಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಊರಿನ ಹೆಸರನ್ನು ಟೈಪ್ ಮಾಡಿ.",
    loc_denied_help: "ಸ್ಥಳ ಪ್ರವೇಶ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ವಿಳಾಸ ಪಟ್ಟಿಯಲ್ಲಿರುವ ಲಾಕ್ ಐಕಾನ್ ಒತ್ತಿ ಸ್ಥಳ ಪ್ರವೇಶವನ್ನು 'Allow' ಮಾಡಿ.",
    card_current_loc: "ಪ್ರಸ್ತುತ ಸ್ಥಳ",
    btn_change_loc: "ಸ್ಥಳ ಬದಲಾಯಿಸಿ",
    lbl_village_search: "ಹಳ್ಳಿ, ಪಟ್ಟಣ ಅಥವಾ ಜಿಲ್ಲೆಯನ್ನು ಹುಡುಕಿ",
    btn_search: "ಹುಡುಕಿ",

    // Step 2: Weather Card
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
    heading_historical_climate: "೧೨ ತಿಂಗಳ ಹವಾಮಾನ ದಾಖಲೆ",

    // Step 3: Soil Photo & Report
    heading_soil_section: "ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್",
    subheading_soil: "ಮೇಲ್ಪದರದ ಮಣ್ಣಿನ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಮೌಲ್ಯಗಳನ್ನು ನಮೂದಿಸಿ.",
    lbl_soil_photo_box: "ಮಣ್ಣಿನ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (ಕ್ಯಾಮೆರಾ / ಗ್ಯಾಲರಿ)",
    soil_photo_hint: "ಗರಿಷ್ಠ 10MB. ಬೆಳಕಿನಲ್ಲಿ ಅಲುಗಾಡಿಸದೆ ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆಯಿರಿ.",
    btn_choose_soil_manual: "⌨️ ಮಣ್ಣಿನ ವಿವರಗಳನ್ನು ಕೈಯಾರೆ ನಮೂದಿಸಿ",
    soil_reject_title: "❌ ಇದು ಮಣ್ಣಿನ ಚಿತ್ರವಲ್ಲ",
    soil_reject_msg: "ದಯವಿಟ್ಟು ಬರಿಯ ಕೃಷಿ ಮಣ್ಣಿನ ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    btn_soil_retake: "📷 ಮತ್ತೆ ಫೋಟೋ ತೆಗೆಯಿರಿ",
    lbl_good_examples: "✅ ಸರಿಯಾದ ಚಿತ್ರ: ಹೊಲದ ಬರಿಯ ಮಣ್ಣಿನ ಸ್ಪಷ್ಟ ಫೋಟೋ.",
    lbl_bad_examples: "❌ ತಪ್ಪಾದ ಚಿತ್ರ: ಗಿಡದ ಎಲೆಗಳು, ಪರದೆಯ ಸ್ಕ್ರೀನ್‌ಶಾಟ್, ಮನುಷ್ಯರು, ವಾಹನಗಳು.",
    heading_soil_report: "ಮಣ್ಣಿನ ಗುಣಲಕ್ಷಣಗಳ ವರದಿ",
    lbl_soil_type: "ಗುರುತಿಸಲಾದ ಮಣ್ಣಿನ ಪ್ರಕಾರ:",
    lbl_uncertain_soil: "⚠️ ಅನಿಶ್ಚಿತ (<60%). ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಡ್ರಾಪ್‌ಡೌನ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಮಣ್ಣಿನ ಪ್ರಕಾರ ದೃಢೀಕರಿಸಿ.",
    lbl_soil_colour: "ಬಣ್ಣ:",
    lbl_soil_texture: "ಕಣ ರಚನೆ:",
    lbl_soil_moisture: "ತೇವಾಂಶ ಮಟ್ಟ:",
    lbl_water_holding: "ನೀರು ಹಿಡಿದಿಡುವ ಶಕ್ತಿ:",
    lbl_drainage: "ನೀರು ಬಸಿಯುವಿಕೆ:",
    lbl_organic_matter: "ಜೈವಿಕ ಇಂಗಾಲ:",
    lbl_ph_range: "ಸಾಮಾನ್ಯ pH ವ್ಯಾಪ್ತಿ:",
    lbl_fertility_level: "ಫಲವತ್ತತೆಯ ಮಟ್ಟ:",
    lbl_estimated_npk_badge: "⚠️ ಫೋಟೋ ಆಧಾರಿತ ಅಂದಾಜು. ನಿಖರತೆಗಾಗಿ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಮೌಲ್ಯಗಳನ್ನು ನಮೂದಿಸಿ.",
    lbl_problems_to_watch: "ಗಮನಿಸಬೇಕಾದ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಸರಳ ಪರಿಹಾರಗಳು:",
    lbl_suitable_crops: "ನೈಸರ್ಗಿಕವಾಗಿ ಸೂಕ್ತವಾದ ಬೆಳೆಗಳು:",
    lbl_soil_n: "ಸಾರಜನಕ (N, kg/ha)",
    lbl_soil_p: "ರಂಜಕ (P, kg/ha)",
    lbl_soil_k: "ಪೊಟ್ಯಾಶ್ (K, kg/ha)",
    lbl_soil_ph: "ಮಣ್ಣಿನ pH ಮಟ್ಟ",

    // Step 4: Farm Profile
    heading_farm_profile: "ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಆರ್ಥಿಕ ವಿವರಗಳು",
    lbl_land_size: "ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)",
    lbl_budget: "ಒಟ್ಟು ಬಂಡವಾಳ (INR ₹)",
    lbl_irrigation: "ಲಭ್ಯವಿರುವ ನೀರಾವರಿ ಪದ್ಧತಿ",

    // Step 5: Crop Rotation
    heading_rotation_section: "ಹಿಂದಿನ ಬೆಳೆ ಮತ್ತು ಮಣ್ಣಿನ ಫಲವತ್ತತೆ",
    subheading_rotation: "ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳ ಸಮತೋಲನ ಮತ್ತು ಕೀಟ ನಿಯಂತ್ರಣಕ್ಕಾಗಿ ಹಿಂದಿನ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    lbl_select_previous: "ಹಿಂದಿನ / ಪ್ರಸ್ತುತ ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ:",
    heading_rotation_report: "ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಮತ್ತು ಬೆಳೆ ಪರಿವರ್ತನೆ ವರದಿ",
    lbl_family: "ಸಸ್ಯವರ್ಗ ಕುಟುಂಬ:",
    lbl_fertility_impact: "ಫಲವತ್ತತೆಯ ಮೇಲಿನ ಪರಿಣಾಮ:",
    lbl_adjusted_npk: "ಪರಿಷ್ಕೃತ ಲಭ್ಯವಿರುವ NPK (kg/ha):",
    lbl_recommended_succession: "ಮುಂದೆ ಬೆಳೆಯಲು ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು:",
    lbl_crops_to_avoid: "ತಪ್ಪಿಸಬೇಕಾದ ಬೆಳೆಗಳು (ರೋಗ ಹರಡುವ ಅಪಾಯ):",
    lbl_soil_health_tips: "ಕೃಷಿ ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಸಲಹೆಗಳು:",

    // Step 6: Recommendations
    heading_top_crops: "ವಿಭಾಗ ಎ: ಟಾಪ್ ೫ ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು",
    subheading_top_crops: "ಮಣ್ಣಿನ ಹೊಂದಾಣಿಕೆ, ಲಾಭದ ಅಂದಾಜು ಮತ್ತು ಹವಾಮಾನ ಸುರಕ್ಷತೆಯ ಆಧಾರದ ಮೇಲೆ ಶ್ರೇಣೀಕರಿಸಲಾಗಿದೆ.",
    heading_weather_fit: "ವಿಭಾಗ ಬಿ: ಪ್ರಸ್ತುತ ಹವಾಮಾನಕ್ಕೆ ಸೂಕ್ತವಾದ ೩ ಬೆಳೆಗಳು",
    subheading_weather_fit: "ಇಂದಿನ ತಾಪಮಾನ ಮತ್ತು ಮಳೆಗೆ ಪರಿಪೂರ್ಣವಾಗಿ ಹೊಂದಿಕೊಳ್ಳುವ ಬೆಳೆಗಳು.",
    heading_alternatives: "ವಿಭಾಗ ಸಿ: ಷರತ್ತುಬದ್ಧ ಪರ್ಯಾಯ ಬೆಳೆಗಳು (ಕ್ರಮಗಳು ಮತ್ತು ಲಾಭ)",
    subheading_alternatives: "ಹನಿ ನೀರಾವರಿ ಅಳವಡಿಕೆ, ಬಜೆಟ್ ಹೆಚ್ಚಳ ಅಥವಾ ಮಣ್ಣಿನ ಪೋಷಣೆ ಮೂಲಕ ಲಾಭ ಹೆಚ್ಚಿಸುವ ಮಾರ್ಗಗಳು.",
    lbl_condition: "ಷರತ್ತು:",
    lbl_action: "ಕೈಗೊಳ್ಳಬೇಕಾದ ಕ್ರಮ:",
    lbl_benefit: "ಸಾಧ್ಯವಿರುವ ಲಾಭ:",
    heading_whatif: "ಲೈವ್ ಸ್ಲೈಡರ್ ಸಿಮ್ಯುಲೇಶನ್",
    lbl_weights: "ಆದ್ಯತೆಯ ತೂಕ (ಹೊಂದಾಣಿಕೆ / ಲಾಭ / ಸುರಕ್ಷತೆ):",
    suitability: "ಹೊಂದಾಣಿಕೆ",
    yield: "ಇಳುವರಿ",
    cost: "ಖರ್ಚು",
    revenue: "ಆದಾಯ",
    profit: "ನಿವ್ವಳ ಲಾಭ",
    risk: "ಅಪಾಯ",
    why_this_crop: "ಕೃಷಿ ಅನುಕೂಲಗಳು",
    fertilizer_tag: "ಗೊಬ್ಬರ ನಿರ್ವಹಣೆ ಸಲಹೆ",
    growth_calendar_tag: "ಬೆಳೆ ಬೆಳವಣಿಗೆಯ ಹಂತಗಳು"
  }
};

// ============================================================================
// 2. Application State
// ============================================================================
let currentLang = 'en';
let currentStep = 1;

let currentLocation = {
  display_name: "Hubballi-Dharwad, Dharwad, Karnataka, India",
  village: "Hubballi-Dharwad",
  district: "Dharwad",
  state: "Karnataka",
  country: "India",
  lat: 15.3173,
  lon: 75.7139,
  source: "default",
  is_approximate: false
};

let weatherData = null;
let climateChartInstance = null;

let soilReport = null;
let soilN = 85.0;
let soilP = 45.0;
let soilK = 42.0;
let soilPh = 6.8;
let soilType = "Clay Loam";

let landAcres = 3.0;
let budgetInr = 65000.0;
let irrigation = "drip";

let previousCrop = "gram";
let rotationReport = null;

let recommendData = null;

// ============================================================================
// 3. DOM Shell Renderer
// ============================================================================
function renderDashboardShell(container, lang) {
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
          <button id="btn-history" class="px-3 py-1.5 rounded-lg bg-[#2e7d32] hover:bg-[#33691e] text-emerald-100 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer">
            <i class="fa-solid fa-clock-rotate-left"></i>
            <span class="hidden md:inline">${t.nav_history}</span>
          </button>

          <button id="btn-export-pdf" class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition cursor-pointer">
            <i class="fa-solid fa-file-pdf"></i>
            <span>${t.btn_export_pdf}</span>
          </button>

          <div class="inline-flex rounded-lg bg-[#0d3810] p-0.5 border border-emerald-800">
            <button id="lang-en" class="px-2.5 py-1 text-xs font-semibold rounded-md ${lang === 'en' ? 'bg-[#2e7d32] text-white' : 'text-emerald-300'} transition cursor-pointer">EN</button>
            <button id="lang-kn" class="px-2.5 py-1 text-xs font-semibold rounded-md ${lang === 'kn' ? 'bg-[#2e7d32] text-white' : 'text-emerald-300'} transition cursor-pointer">ಕನ್ನಡ</button>
          </div>
        </div>
      </div>
    </header>

    <!-- 6-Step Workflow Stepper Navigation Header -->
    <div class="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex items-center justify-between overflow-x-auto pb-1 gap-2 no-scrollbar" id="stepper-bar">
          <!-- Step 1 -->
          <button type="button" data-step="1" class="step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer bg-emerald-700 text-white shadow-xs">
            <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span>${t.step_loc}</span>
          </button>
          <div class="h-0.5 w-4 bg-slate-200 shrink-0"></div>

          <!-- Step 2 -->
          <button type="button" data-step="2" class="step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer text-slate-600 hover:bg-slate-100">
            <span class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-700">2</span>
            <span>${t.step_weather}</span>
          </button>
          <div class="h-0.5 w-4 bg-slate-200 shrink-0"></div>

          <!-- Step 3 -->
          <button type="button" data-step="3" class="step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer text-slate-600 hover:bg-slate-100">
            <span class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-700">3</span>
            <span>${t.step_soil}</span>
          </button>
          <div class="h-0.5 w-4 bg-slate-200 shrink-0"></div>

          <!-- Step 4 -->
          <button type="button" data-step="4" class="step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer text-slate-600 hover:bg-slate-100">
            <span class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-700">4</span>
            <span>${t.step_farm}</span>
          </button>
          <div class="h-0.5 w-4 bg-slate-200 shrink-0"></div>

          <!-- Step 5 -->
          <button type="button" data-step="5" class="step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer text-slate-600 hover:bg-slate-100">
            <span class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-700">5</span>
            <span>${t.step_last_crop}</span>
          </button>
          <div class="h-0.5 w-4 bg-slate-200 shrink-0"></div>

          <!-- Step 6 -->
          <button type="button" data-step="6" class="step-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer text-slate-600 hover:bg-slate-100">
            <span class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-700">6</span>
            <span>${t.step_results}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Dynamic Step Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
      
      <!-- Stepper Panels Container -->
      <div id="step-panels-container">
        <!-- Panel 1: Location -->
        <section id="panel-step-1" class="step-panel space-y-6"></section>

        <!-- Panel 2: Weather -->
        <section id="panel-step-2" class="step-panel space-y-6 hidden"></section>

        <!-- Panel 3: Soil -->
        <section id="panel-step-3" class="step-panel space-y-6 hidden"></section>

        <!-- Panel 4: Farm Profile -->
        <section id="panel-step-4" class="step-panel space-y-6 hidden"></section>

        <!-- Panel 5: Crop Rotation -->
        <section id="panel-step-5" class="step-panel space-y-6 hidden"></section>

        <!-- Panel 6: Recommendations -->
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

    <!-- Modal 1: Centered Location Modal Pop-up on Entry (Step 1 Requirement) -->
    <div id="modal-location-entry" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 text-center transform transition-all border border-slate-100">
        <div class="w-16 h-16 rounded-full bg-emerald-100 text-[#1b5e20] text-3xl flex items-center justify-center mx-auto shadow-inner">
          <i class="fa-solid fa-location-dot"></i>
        </div>
        
        <div class="space-y-2">
          <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900" id="txt-modal-loc-title">
            ${t.modal_loc_title}
            <span class="block text-sm sm:text-base font-semibold text-emerald-800 mt-1">ಸ್ಥಳ ಪ್ರವೇಶವನ್ನು ಅನುಮತಿಸಿ</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed" id="txt-modal-loc-desc">
            ${t.modal_loc_desc}
            <span class="block text-[11px] sm:text-xs text-slate-500 mt-0.5">ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ನೇರ ಹವಾಮಾನ ಮತ್ತು ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡಲು ಬಳಸುತ್ತೇವೆ.</span>
          </p>
        </div>

        <!-- Detection Status / Loading Banner -->
        <div id="modal-loc-status" class="hidden p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2">
          <i class="fa-solid fa-circle-notch fa-spin text-emerald-600"></i>
          <span id="txt-modal-status">${t.loc_detecting}</span>
        </div>

        <!-- Error / Warning Banner -->
        <div id="modal-loc-error" class="hidden p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-medium text-left space-y-1 border border-rose-200">
          <div class="font-bold flex items-center gap-1.5 text-rose-900">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span id="modal-error-title">Location Notice</span>
          </div>
          <p id="modal-error-desc" class="text-[11px] leading-relaxed"></p>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3 pt-2">
          <button type="button" id="btn-modal-detect-location" class="w-full py-3.5 px-4 rounded-2xl bg-[#1b5e20] hover:bg-[#2e7d32] text-white text-sm font-bold shadow-lg shadow-emerald-900/20 transition flex items-center justify-center gap-2 cursor-pointer">
            <i class="fa-solid fa-location-crosshairs text-base"></i>
            <span id="txt-btn-allow-loc">${t.btn_allow_location}</span>
          </button>

          <button type="button" id="btn-modal-enter-manually" class="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer">
            <span id="txt-btn-enter-manually">${t.btn_enter_manually}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal 2: SQLite Past History Modal -->
    <div id="modal-history" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left text-emerald-700"></i>
            <span>Farmer Advisory History (SQLite)</span>
          </h3>
          <button id="btn-close-history" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div id="history-list-content" class="overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
          <div class="text-center py-8 text-slate-400">Loading saved farm runs...</div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// 4. Step Renderers
// ============================================================================
function renderLocationStepView(container) {
  const t = I18N[currentLang];
  const approxBadge = currentLocation.is_approximate
    ? `<span class="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Approximate Location</span>`
    : `<span class="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">GPS Verified</span>`;

  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-[#1b5e20] text-2xl flex items-center justify-center shadow-inner">
            <i class="fa-solid fa-location-dot"></i>
          </div>
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-slate-900">${t.card_current_loc}</h2>
            <p class="text-xs text-slate-500">Auto-detected via browser coordinates</p>
          </div>
        </div>
        ${approxBadge}
      </div>

      <!-- Current Location Plain-Text Card -->
      <div class="p-5 rounded-2xl bg-earth-50 border border-earth-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>📍</span>
            <span id="loc-display-village">${currentLocation.village || "Karnataka Farm"}</span>, 
            <span id="loc-display-state" class="text-slate-600 font-semibold">${currentLocation.district ? currentLocation.district + ", " : ""}${currentLocation.state}</span>
          </div>
          <div class="text-xs text-slate-500 font-mono flex items-center gap-3">
            <span>Lat: <strong class="text-slate-700">${currentLocation.lat.toFixed(4)}° N</strong></span>
            <span>Lon: <strong class="text-slate-700">${currentLocation.lon.toFixed(4)}° E</strong></span>
            <span class="text-slate-400">(${currentLocation.source})</span>
          </div>
        </div>

        <button type="button" id="btn-toggle-change-loc" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer shrink-0">
          <i class="fa-solid fa-pen-to-square text-emerald-700"></i>
          <span>${t.btn_change_loc}</span>
        </button>
      </div>

      <!-- Inline Place Search Container (Hidden by default, opened by Change Location) -->
      <div id="inline-loc-search-box" class="hidden p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">${t.lbl_village_search}</label>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <input type="text" id="input-search-place" class="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none bg-white" placeholder="e.g. Dharwad, Mandya, Belagavi, Davanagere" />
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-3.5 text-slate-400 text-xs"></i>
          </div>
          <button type="button" id="btn-execute-place-search" class="px-5 bg-[#1b5e20] hover:bg-[#2e7d32] text-white text-xs font-bold rounded-xl transition cursor-pointer">
            ${t.btn_search}
          </button>
        </div>
        <div id="place-search-results" class="space-y-1.5 max-h-48 overflow-y-auto text-xs"></div>
      </div>

      <div class="text-xs text-slate-500 flex items-center gap-2">
        <i class="fa-solid fa-circle-info text-emerald-600"></i>
        <span>Coordinates automatically calibrate Open-Meteo satellite weather and local soil suitability.</span>
      </div>

    </div>
  `;

  bindLocationStepListeners();
}

function renderWeatherStepView(container) {
  const t = I18N[currentLang];

  if (!weatherData) {
    container.innerHTML = `
      <div class="bg-white rounded-3xl p-10 text-center space-y-4 border border-slate-100 shadow-sm">
        <div class="inline-block animate-spin text-4xl text-emerald-600"><i class="fa-solid fa-cloud-sun"></i></div>
        <h3 class="text-base font-bold text-slate-800">${currentLang === 'kn' ? 'ಹವಾಮಾನ ವಿವರಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...' : 'Fetching live weather from Open-Meteo...'}</h3>
        <p class="text-xs text-slate-500">${currentLang === 'kn' ? 'ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ, ಉಪಗ್ರಹ ಹವಾಮಾನ ಮತ್ತು ಹವಾಮಾನ ದಾಖಲೆಗಳನ್ನು ಸಿಂಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ.' : 'Syncing live satellite micro-climate from Open-Meteo.'}</p>
      </div>
    `;
    fetchLiveWeather(currentLocation.lat, currentLocation.lon).then(() => {
      if (weatherData && currentStep === 2) {
        renderWeatherStepView(container);
      }
    });
    return;
  }
  const cur = weatherData.current;
  const daily = weatherData.daily_7d;

  const rainStatusHtml = (cur.rain_now_mm && cur.rain_now_mm > 0.1) || cur.is_raining
    ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-bold text-xs"><i class="fa-solid fa-cloud-showers-heavy text-blue-600"></i> ${t.lbl_raining_now} ${(cur.rain_now_mm || 1.2).toFixed(1)} mm</span>`
    : `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs"><i class="fa-solid fa-sun text-amber-600"></i> ${t.lbl_no_rain_now}</span>`;

  const seasonText = currentLang === 'kn' ? (cur.season_name_kn || "ಖಾರೀಫ್ (ಮುಂಗಾರು)") : (cur.season || "Kharif");
  const farmingNote = currentLang === 'kn' ? (cur.farming_note_kn || cur.farming_note || "") : (cur.farming_note || "");

  const dailyCardsHtml = daily.map(d => `
    <div class="p-3 rounded-2xl bg-earth-50 border border-earth-200 text-center space-y-1 shrink-0 w-28">
      <span class="text-[10px] font-bold text-slate-600 block">${d.day_name}</span>
      <span class="text-2xl block">${d.icon}</span>
      <div class="text-xs font-bold text-slate-800">${d.max_temp.toFixed(0)}° / <span class="text-slate-500 font-normal">${d.min_temp.toFixed(0)}°</span></div>
      <div class="text-[10px] text-blue-700 font-semibold">${d.rain_sum_mm.toFixed(1)} mm</div>
      ${d.rain_chance_pct !== undefined ? `<div class="text-[9px] text-slate-500">${d.rain_chance_pct.toFixed(0)}% rain</div>` : ''}
    </div>
  `).join('');

  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      
      <!-- Current Weather Banner Header -->
      <div class="bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] rounded-3xl p-6 sm:p-8 text-white space-y-5 shadow-md">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center space-x-4">
            <span class="text-5xl">${cur.icon}</span>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-3xl sm:text-4xl font-extrabold tracking-tight">${cur.temperature.toFixed(1)}°C</span>
                <span class="text-xs bg-white/20 text-emerald-100 px-2 py-0.5 rounded-full font-semibold">${t.lbl_feels_like} ${(cur.apparent_temperature || cur.feels_like || cur.temperature).toFixed(1)}°C</span>
              </div>
              <p class="text-sm text-emerald-100 font-medium">${cur.description}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            ${rainStatusHtml}
            <button type="button" id="btn-refresh-weather-step" class="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
              <i class="fa-solid fa-arrows-rotate"></i>
              <span>${t.btn_refresh_weather}</span>
            </button>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/20 text-xs">
          <div class="bg-white/10 rounded-2xl p-3">
            <span class="text-emerald-200 block text-[11px]">${t.lbl_humidity}</span>
            <span class="text-lg font-bold">${cur.humidity.toFixed(0)}%</span>
          </div>
          <div class="bg-white/10 rounded-2xl p-3">
            <span class="text-emerald-200 block text-[11px]">${t.lbl_wind}</span>
            <span class="text-lg font-bold">${cur.wind_speed.toFixed(1)} km/h</span>
          </div>
          <div class="bg-white/10 rounded-2xl p-3">
            <span class="text-emerald-200 block text-[11px]">${t.lbl_rain_chance}</span>
            <span class="text-lg font-bold text-amber-200">${(cur.rain_chance_today || cur.rain_chance || 0).toFixed(0)}%</span>
          </div>
          <div class="bg-white/10 rounded-2xl p-3">
            <span class="text-emerald-200 block text-[11px]">${t.lbl_7d_rain}</span>
            <span class="text-lg font-bold text-amber-300">${weatherData.rainfall_7d_total.toFixed(1)} mm</span>
          </div>
        </div>

        <!-- Season & Farming Advisory Note -->
        <div class="p-4 rounded-2xl bg-white/15 border border-white/10 space-y-1.5">
          <div class="text-xs font-bold text-amber-200 flex items-center gap-2">
            <span>📅 ${t.lbl_season} <strong>${seasonText}</strong></span>
          </div>
          <p class="text-xs text-white leading-relaxed font-medium">
            ${farmingNote}
          </p>
        </div>
      </div>

      <!-- 7-Day Mini Agro Forecast -->
      <div class="space-y-3">
        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">${t.heading_7d_forecast}</h3>
        <div class="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          ${dailyCardsHtml}
        </div>
      </div>

      <!-- 12-Month Climate Chart Container -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">${t.heading_historical_climate}</h3>
          <span class="text-xs text-slate-500 font-semibold">Annual Est: <strong class="text-slate-800">${weatherData.annual_rainfall_estimate.toFixed(0)} mm</strong></span>
        </div>
        <div class="h-56 w-full rounded-2xl border border-slate-200 p-3 bg-slate-50">
          <canvas id="chart-climate-canvas"></canvas>
        </div>
      </div>

    </div>
  `;

  bindWeatherStepListeners();
  renderClimateChart(weatherData.monthly_climate_12m);
}

function renderSoilStepView(container) {
  const t = I18N[currentLang];

  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      
      <div class="space-y-1">
        <h2 class="text-lg sm:text-xl font-bold text-slate-900">${t.heading_soil_section}</h2>
        <p class="text-xs text-slate-500">${t.subheading_soil}</p>
      </div>

      <!-- Photo Upload Box -->
      <div class="p-6 rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70 transition space-y-4 text-center">
        <input type="file" id="input-soil-file" accept="image/jpeg,image/png,image/webp" class="hidden" capture="environment" />
        
        <div id="soil-upload-empty" class="space-y-3 cursor-pointer" onclick="document.getElementById('input-soil-file').click()">
          <div class="w-14 h-14 rounded-full bg-emerald-100 text-[#1b5e20] text-2xl flex items-center justify-center mx-auto shadow-inner">
            <i class="fa-solid fa-camera"></i>
          </div>
          <div>
            <div class="text-sm font-bold text-slate-800">${t.lbl_soil_photo_box}</div>
            <p class="text-xs text-slate-500">${t.soil_photo_hint}</p>
          </div>
          <button type="button" class="px-5 py-2 rounded-xl bg-[#1b5e20] hover:bg-[#2e7d32] text-white text-xs font-bold shadow-xs transition">
            <i class="fa-solid fa-upload mr-1.5"></i> Select or Snap Photo
          </button>
        </div>

        <!-- Preview & Progress Container -->
        <div id="soil-upload-preview-container" class="hidden space-y-3">
          <img id="soil-preview-img" class="h-44 w-auto mx-auto rounded-2xl shadow-md border border-slate-200 object-cover" src="" alt="Soil Preview" />
          <div class="flex items-center justify-center gap-3">
            <span id="soil-upload-spinner" class="text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <i class="fa-solid fa-circle-notch fa-spin text-emerald-600"></i> Analyzing soil texture and pedology...
            </span>
            <button type="button" id="btn-remove-soil-photo" class="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold">
              <i class="fa-solid fa-trash mr-1 text-rose-500"></i> Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Non-Soil Rejection Alert Box (Shown only when status === 'not_soil') -->
      <div id="soil-rejection-alert" class="hidden p-6 rounded-3xl bg-rose-50 border border-rose-200 space-y-4">
        <div class="flex items-start gap-3">
          <span class="text-2xl text-rose-600">❌</span>
          <div class="space-y-1">
            <h4 class="text-sm font-bold text-rose-900">${t.soil_reject_title}</h4>
            <p id="soil-rejection-text" class="text-xs text-rose-700 leading-relaxed font-medium">${t.soil_reject_msg}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div class="p-3 rounded-2xl bg-white border border-emerald-200 space-y-1">
            <span class="font-bold text-emerald-900">${t.lbl_good_examples}</span>
          </div>
          <div class="p-3 rounded-2xl bg-white border border-rose-200 space-y-1">
            <span class="font-bold text-rose-900">${t.lbl_bad_examples}</span>
          </div>
        </div>

        <div class="pt-2 flex gap-3">
          <button type="button" id="btn-retake-soil" class="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition shadow-xs cursor-pointer">
            ${t.btn_soil_retake}
          </button>
          <button type="button" id="btn-skip-to-manual-soil" class="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer">
            ${t.btn_choose_soil_manual}
          </button>
        </div>
      </div>

      <!-- Pedological Soil Report Card (Shown when valid soil is detected) -->
      <div id="soil-report-card" class="${soilReport && soilReport.status !== 'not_soil' ? '' : 'hidden'} space-y-5">
        <div class="p-6 rounded-3xl bg-earth-50 border border-earth-200 space-y-5">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="space-y-0.5">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">${t.heading_soil_report}</span>
              <h3 class="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span id="soil-report-type">${soilReport ? soilReport.soil_type : "Clay Loam"}</span>
                <span id="soil-conf-badge" class="text-xs px-2.5 py-0.5 rounded-full font-bold ${soilReport && soilReport.is_confident ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                  ${soilReport ? soilReport.confidence.toFixed(1) + '% confidence' : 'Verified'}
                </span>
              </h3>
            </div>
            <span class="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-medium">
              ${t.lbl_estimated_npk_badge}
            </span>
          </div>

          <!-- Soil Characteristics Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div class="bg-white p-3 rounded-2xl border border-slate-200">
              <span class="text-slate-500 text-[10px] block">${t.lbl_soil_colour}</span>
              <strong id="soil-val-colour" class="text-slate-800">${soilReport ? (soilReport.soil_colour || "Dark brown") : "Dark brown"}</strong>
            </div>
            <div class="bg-white p-3 rounded-2xl border border-slate-200">
              <span class="text-slate-500 text-[10px] block">${t.lbl_soil_texture}</span>
              <strong id="soil-val-texture" class="text-slate-800">${soilReport ? (soilReport.texture || "medium") : "medium"}</strong>
            </div>
            <div class="bg-white p-3 rounded-2xl border border-slate-200">
              <span class="text-slate-500 text-[10px] block">${t.lbl_water_holding}</span>
              <strong id="soil-val-water" class="text-slate-800">${soilReport ? (soilReport.water_holding || "high") : "high"}</strong>
            </div>
            <div class="bg-white p-3 rounded-2xl border border-slate-200">
              <span class="text-slate-500 text-[10px] block">${t.lbl_drainage}</span>
              <strong id="soil-val-drainage" class="text-slate-800">${soilReport ? (soilReport.drainage || "moderate") : "moderate"}</strong>
            </div>
          </div>

          <!-- Problems to watch & fixes -->
          <div class="space-y-2">
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">${t.lbl_problems_to_watch}</span>
            <div id="soil-problems-list" class="space-y-2 text-xs">
              ${soilReport && soilReport.problems_to_watch ? soilReport.problems_to_watch.map(p => `
                <div class="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <div class="font-bold text-slate-800">⚠️ ${currentLang === 'kn' ? (p.issue_kn || p.issue) : p.issue}</div>
                  <div class="text-emerald-800 font-medium">💡 Fix: ${currentLang === 'kn' ? (p.fix_kn || p.fix) : p.fix}</div>
                </div>
              `).join('') : ''}
            </div>
          </div>

          <!-- Suitable crops -->
          <div class="space-y-1.5">
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">${t.lbl_suitable_crops}</span>
            <div id="soil-suitable-tags" class="flex flex-wrap gap-1.5 text-xs">
              ${soilReport && soilReport.suitable_crops ? soilReport.suitable_crops.map(c => `
                <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-semibold text-[11px]">${c}</span>
              `).join('') : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Soil Parameters Manual Entry & Calibration -->
      <div class="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Soil Health Card Parameters</span>
          <span class="text-[11px] text-emerald-800 font-medium">Calibrated with crop decision engine</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">${t.lbl_soil_n}</label>
            <input type="number" id="input-soil-n" value="${soilN}" min="0" max="300" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-white" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">${t.lbl_soil_p}</label>
            <input type="number" id="input-soil-p" value="${soilP}" min="0" max="250" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-white" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">${t.lbl_soil_k}</label>
            <input type="number" id="input-soil-k" value="${soilK}" min="0" max="300" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-white" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">${t.lbl_soil_ph}</label>
            <input type="number" id="input-soil-ph" step="0.1" value="${soilPh}" min="4.0" max="9.5" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-white" />
          </div>
          <div class="col-span-2 sm:col-span-1">
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">${t.lbl_soil_type}</label>
            <select id="input-soil-type-select" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-white">
              <option value="Clay Loam" ${soilType === 'Clay Loam' ? 'selected' : ''}>Clay Loam</option>
              <option value="Black Cotton" ${soilType === 'Black Cotton' ? 'selected' : ''}>Black Cotton</option>
              <option value="Red Loam" ${soilType === 'Red Loam' ? 'selected' : ''}>Red Loam</option>
              <option value="Alluvial" ${soilType === 'Alluvial' ? 'selected' : ''}>Alluvial</option>
              <option value="Sandy Loam" ${soilType === 'Sandy Loam' ? 'selected' : ''}>Sandy Loam</option>
            </select>
          </div>
        </div>
      </div>

    </div>
  `;

  bindSoilStepListeners();
}

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
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">${t.lbl_land_size}</label>
          <div class="flex items-center gap-3">
            <input type="number" id="input-farm-land" step="0.5" min="0.5" max="100" value="${landAcres}" class="w-24 px-3 py-2 text-base font-bold text-slate-800 border border-slate-300 rounded-xl bg-white" />
            <span class="text-sm text-slate-600 font-semibold">Acres</span>
          </div>
          <input type="range" id="slider-farm-land" min="0.5" max="25" step="0.5" value="${landAcres}" class="w-full accent-emerald-700" />
        </div>

        <!-- Budget -->
        <div class="p-5 rounded-2xl bg-earth-50 border border-earth-200 space-y-3">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">${t.lbl_budget}</label>
          <div class="flex items-center gap-2">
            <span class="text-base font-bold text-slate-500">₹</span>
            <input type="number" id="input-farm-budget" step="5000" min="5000" max="1000000" value="${budgetInr}" class="w-full px-3 py-2 text-base font-bold text-slate-800 border border-slate-300 rounded-xl bg-white" />
          </div>
          <input type="range" id="slider-farm-budget" min="10000" max="300000" step="5000" value="${budgetInr}" class="w-full accent-emerald-700" />
        </div>

        <!-- Irrigation -->
        <div class="p-5 rounded-2xl bg-earth-50 border border-earth-200 space-y-3">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">${t.lbl_irrigation}</label>
          <select id="select-farm-irrigation" class="w-full px-3 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600 outline-none">
            <option value="drip" ${irrigation === 'drip' ? 'selected' : ''}>Drip Irrigation (ಹನಿ ನೀರಾವರಿ)</option>
            <option value="sprinkler" ${irrigation === 'sprinkler' ? 'selected' : ''}>Sprinkler (ತುಂತುರು ನೀರಾವರಿ)</option>
            <option value="borewell" ${irrigation === 'borewell' ? 'selected' : ''}>Borewell (ಬೋರ್‌ವೆಲ್)</option>
            <option value="canal" ${irrigation === 'canal' ? 'selected' : ''}>Canal (ಕಾಲುವೆ ನೀರಾವರಿ)</option>
            <option value="rainfed" ${irrigation === 'rainfed' ? 'selected' : ''}>Rainfed (ಮಳೆಯಾಶ್ರಿತ)</option>
          </select>
          <p class="text-[11px] text-slate-500">Irrigation method dictates crop water suitability and reduces deficit risks.</p>
        </div>
      </div>
    </div>
  `;

  bindFarmStepListeners();
}

function renderRotationStepView(container) {
  const t = I18N[currentLang];

  if (!rotationReport && previousCrop) {
    executeRotationCheck(previousCrop);
  }

  const cropsList = [
    { key: "gram", name: "Gram / Chickpea (ಕಡಲೆ)", icon: "🌱" },
    { key: "soyabean", name: "Soybean (ಸೋಯಾಬೀನ್)", icon: "🌿" },
    { key: "vigna-radiati(Mung)", name: "Moong / Urad (ಹೆಸರು / ಉದ್ದು)", icon: "🌾" },
    { key: "maize", name: "Maize / Corn (ಮುಸುಕಿನ ಜೋಳ)", icon: "🌽" },
    { key: "rice", name: "Rice / Paddy (ಭತ್ತ)", icon: "🍚" },
    { key: "cotton", name: "Cotton (ಹತ್ತಿ)", icon: "🧶" },
    { key: "wheat", name: "Wheat (ಗೋಧಿ)", icon: "🌾" },
    { key: "sugarcane", name: "Sugarcane (ಕಬ್ಬು)", icon: "🎋" },
    { key: "tomato", name: "Tomato (ಟೊಮೆಟೊ)", icon: "🍅" },
    { key: "chilli", name: "Chilli (ಮೆಣಸಿನಕಾಯಿ)", icon: "🌶️" },
    { key: "jowar", name: "Jowar / Sorghum (ಜೋಳ)", icon: "🌾" },
    { key: "sunflower", name: "Sunflower (ಸೂರ್ಯಕಾಂತಿ)", icon: "🌻" }
  ];

  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      <div class="space-y-1">
        <h2 class="text-lg sm:text-xl font-bold text-slate-900">${t.heading_rotation_section}</h2>
        <p class="text-xs text-slate-500">${t.subheading_rotation}</p>
      </div>

      <!-- Standing Crop Selection Chips -->
      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">${t.lbl_select_previous}</label>
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5" id="rotation-crop-chips">
          ${cropsList.map(c => `
            <button type="button" data-crop="${c.key}" class="rotation-chip p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${previousCrop === c.key ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}">
              <span class="text-2xl">${c.icon}</span>
              <span class="text-[11px] font-bold leading-tight">${c.name}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Rotation Fertility Report Card -->
      <div id="rotation-report-card" class="${rotationReport ? '' : 'hidden'} space-y-5">
        <div class="p-6 rounded-3xl bg-earth-50 border border-earth-200 space-y-5">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">${t.heading_rotation_report}</span>
              <h3 class="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span id="rot-crop-name">${rotationReport ? rotationReport.display_name : ""}</span>
                <span id="rot-family-badge" class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white text-slate-700 border border-slate-200">
                  ${rotationReport ? rotationReport.family : ""}
                </span>
              </h3>
            </div>
            <div id="rot-impact-badge" class="px-3.5 py-1.5 rounded-full font-bold text-xs ${rotationReport && rotationReport.fertility_impact === 'Improved' ? 'bg-emerald-100 text-emerald-800' : (rotationReport && rotationReport.fertility_impact === 'Depleted' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800')}">
              ${rotationReport ? (currentLang === 'kn' ? rotationReport.fertility_impact_kn : rotationReport.fertility_impact + ' Fertility') : ''}
            </div>
          </div>

          <!-- Adjusted NPK values -->
          <div class="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">${t.lbl_adjusted_npk}</span>
            <div class="grid grid-cols-3 gap-3 text-center">
              <div class="p-2.5 rounded-xl bg-slate-50">
                <span class="text-[10px] text-slate-500 block">Nitrogen (N)</span>
                <strong class="text-base text-slate-800">${rotationReport ? rotationReport.adjusted_npk.n : 85} kg/ha</strong>
                <span class="text-[10px] ${rotationReport && rotationReport.npk_changes.n_change >= 0 ? 'text-emerald-600' : 'text-rose-600'} block">
                  ${rotationReport && rotationReport.npk_changes.n_change >= 0 ? '+' : ''}${rotationReport ? rotationReport.npk_changes.n_change : 0} kg/ha
                </span>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-50">
                <span class="text-[10px] text-slate-500 block">Phosphorus (P)</span>
                <strong class="text-base text-slate-800">${rotationReport ? rotationReport.adjusted_npk.p : 45} kg/ha</strong>
                <span class="text-[10px] ${rotationReport && rotationReport.npk_changes.p_change >= 0 ? 'text-emerald-600' : 'text-rose-600'} block">
                  ${rotationReport && rotationReport.npk_changes.p_change >= 0 ? '+' : ''}${rotationReport ? rotationReport.npk_changes.p_change : 0} kg/ha
                </span>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-50">
                <span class="text-[10px] text-slate-500 block">Potassium (K)</span>
                <strong class="text-base text-slate-800">${rotationReport ? rotationReport.adjusted_npk.k : 42} kg/ha</strong>
                <span class="text-[10px] ${rotationReport && rotationReport.npk_changes.k_change >= 0 ? 'text-emerald-600' : 'text-rose-600'} block">
                  ${rotationReport && rotationReport.npk_changes.k_change >= 0 ? '+' : ''}${rotationReport ? rotationReport.npk_changes.k_change : 0} kg/ha
                </span>
              </div>
            </div>
          </div>

          <!-- Recommended Next Crops -->
          <div class="space-y-2">
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">${t.lbl_recommended_succession}</span>
            <div class="space-y-2 text-xs">
              ${rotationReport && rotationReport.recommended_next_crops ? rotationReport.recommended_next_crops.map(r => `
                <div class="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2">
                  <span class="text-emerald-700 font-bold">✅ ${r.crop}:</span>
                  <span class="text-emerald-950 font-medium">${r.reason}</span>
                </div>
              `).join('') : ''}
            </div>
          </div>

          <!-- Crops to avoid -->
          ${rotationReport && rotationReport.crops_to_avoid && rotationReport.crops_to_avoid.length > 0 ? `
            <div class="space-y-2">
              <span class="text-xs font-bold text-rose-900 uppercase tracking-wider">${t.lbl_crops_to_avoid}</span>
              <div class="space-y-2 text-xs">
                ${rotationReport.crops_to_avoid.map(a => `
                  <div class="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2">
                    <span class="text-rose-700 font-bold">⛔ ${a.crop}:</span>
                    <span class="text-rose-950 font-medium">${a.reason}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Soil health tips -->
          <div class="space-y-2">
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">${t.lbl_soil_health_tips}</span>
            <ul class="list-disc list-inside space-y-1 text-xs text-slate-700 font-medium">
              ${rotationReport ? (currentLang === 'kn' ? rotationReport.soil_health_tips_kn : rotationReport.soil_health_tips).map(tip => `
                <li>${tip}</li>
              `).join('') : ''}
            </ul>
          </div>
        </div>
      </div>

    </div>
  `;

  bindRotationStepListeners();
}

function renderResultsStepView(container) {
  if (!recommendData) {
    fetchRecommendationsAndRender(container);
    return;
  }

  const t = I18N[currentLang];
  const topCrops = recommendData.top_crops || [];
  const weatherFitCrops = recommendData.weather_fit_crops || [];
  const alternativeCrops = recommendData.alternative_crops || [];

  const renderCropCard = (c, rank) => {
    const riskBadgeColor = c.risk_badge === 'Low' ? 'bg-emerald-100 text-emerald-800' : (c.risk_badge === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800');

    return `
      <div class="crop-card bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition hover:shadow-md">
        <div class="p-5 sm:p-6 space-y-4">
          <div class="flex items-start justify-between flex-wrap gap-2">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-full bg-[#1b5e20] text-white flex items-center justify-center font-bold text-sm shadow-xs">#${rank}</span>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900">${currentLang === 'kn' ? c.kannada_name : c.display_name}</h3>
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

          <!-- Economics Grid -->
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
              <span class="text-[10px] text-emerald-700 block">Net Margin</span>
            </div>
          </div>

          <!-- Advantages Reasons -->
          <div class="space-y-1">
            <ul class="text-xs text-slate-700 space-y-1 font-medium">
              ${c.reasons.map(r => `<li class="flex items-start gap-1.5"><span class="text-emerald-700">✓</span><span>${r}</span></li>`).join('')}
            </ul>
          </div>

          <!-- Expandable Details Toggle -->
          <details class="text-xs group border-t border-slate-100 pt-3">
            <summary class="font-bold text-[#1b5e20] hover:text-[#2e7d32] cursor-pointer flex items-center justify-between">
              <span>View Detailed Fertilizer Advice & Growth Timeline</span>
              <i class="fa-solid fa-chevron-down group-open:rotate-180 transition"></i>
            </summary>
            
            <div class="mt-3 space-y-4 pt-2">
              <!-- Fertilizer Advice -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span class="text-[11px] font-bold text-slate-800 uppercase tracking-wider">${t.fertilizer_tag}</span>
                <div class="space-y-1.5">
                  ${c.fertilizer_advice.map(f => `
                    <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-1">
                      <strong class="text-slate-800">${f.nutrient}:</strong>
                      <span class="text-slate-600 font-medium">${f.advice}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Cultivation stages -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span class="text-[11px] font-bold text-slate-800 uppercase tracking-wider">${t.growth_calendar_tag}</span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  ${c.calendar.map(st => `
                    <div class="p-2 rounded-xl bg-white border border-slate-200">
                      <div class="font-bold text-slate-800 text-[11px]">${st.stage} (${st.days})</div>
                      <div class="text-[10px] text-slate-600">${st.action}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    `;
  };

  container.innerHTML = `
    <div class="space-y-8">
      
      <!-- Section A: Top 5 Recommended Crops -->
      <section class="space-y-4">
        <div>
          <h2 class="text-lg sm:text-xl font-extrabold text-slate-900">${t.heading_top_crops}</h2>
          <p class="text-xs text-slate-500">${t.subheading_top_crops}</p>
        </div>
        <div class="space-y-4">
          ${topCrops.map((c, i) => renderCropCard(c, i + 1)).join('')}
        </div>
      </section>

      <!-- Section B: Top 3 for Current Weather -->
      <section class="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h2 class="text-lg sm:text-xl font-extrabold text-slate-900">${t.heading_weather_fit}</h2>
          <p class="text-xs text-slate-500">${t.subheading_weather_fit}</p>
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

      <!-- Section C: Top 3 Conditional Strategic Alternatives -->
      <section class="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h2 class="text-lg sm:text-xl font-extrabold text-slate-900">${t.heading_alternatives}</h2>
          <p class="text-xs text-slate-500">${t.subheading_alternatives}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${alternativeCrops.map(alt => `
            <div class="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div class="space-y-1">
                <span class="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">${t.lbl_condition} ${currentLang === 'kn' ? alt.condition_kn : alt.condition}</span>
                <h4 class="font-extrabold text-slate-900 text-base">${currentLang === 'kn' ? alt.kannada_name : alt.display_name}</h4>
              </div>
              <div class="text-xs space-y-2">
                <div class="p-3 rounded-2xl bg-white border border-amber-200/80">
                  <span class="font-bold text-slate-700 block text-[11px]">${t.lbl_action}</span>
                  <span class="text-slate-600 font-medium">${currentLang === 'kn' ? alt.action_required_kn : alt.action_required}</span>
                </div>
                <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span class="font-bold text-emerald-900 block text-[11px]">${t.lbl_benefit}</span>
                  <span class="text-emerald-800 font-medium">${currentLang === 'kn' ? alt.potential_benefit_kn : alt.potential_benefit}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

    </div>
  `;
}

// ============================================================================
// 5. Navigation & View Switcher
// ============================================================================
function navigateToStep(step) {
  currentStep = step;

  // Update Stepper Header Buttons
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

  // Toggle Step Panels
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

  // Toggle Prev/Next Buttons
  const btnPrev = document.getElementById("btn-step-prev");
  const btnNext = document.getElementById("btn-step-next");
  const t = I18N[currentLang];

  if (btnPrev) {
    if (currentStep === 1) {
      btnPrev.classList.add("hidden");
    } else {
      btnPrev.classList.remove("hidden");
    }
  }

  if (btnNext) {
    if (currentStep === 6) {
      btnNext.classList.add("hidden");
    } else {
      btnNext.classList.remove("hidden");
      btnNext.textContent = t.btn_next;
    }
  }

  // Render current panel content
  renderCurrentStep();
}

function renderCurrentStep() {
  const container = document.getElementById(`panel-step-${currentStep}`);
  if (!container) return;

  if (currentStep === 1) {
    renderLocationStepView(container);
  } else if (currentStep === 2) {
    renderWeatherStepView(container);
  } else if (currentStep === 3) {
    renderSoilStepView(container);
  } else if (currentStep === 4) {
    renderFarmStepView(container);
  } else if (currentStep === 5) {
    renderRotationStepView(container);
  } else if (currentStep === 6) {
    renderResultsStepView(container);
  }
}

// ============================================================================
// 6. Geolocation, Weather & Soil Logic
// ============================================================================
function detectUserLocation() {
  const modalStatus = document.getElementById("modal-loc-status");
  const modalError = document.getElementById("modal-loc-error");
  const modalErrorDesc = document.getElementById("modal-error-desc");
  const t = I18N[currentLang];

  if (modalStatus) modalStatus.classList.remove("hidden");
  if (modalError) modalError.classList.add("hidden");

  // HTTPS Security Context Validation
  if (window.isSecureContext === false && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    console.warn("[GPS] Page is not running in a secure context (HTTPS required for mobile geolocation).");
    if (modalStatus) modalStatus.classList.add("hidden");
    if (modalError && modalErrorDesc) {
      modalError.classList.remove("hidden");
      modalErrorDesc.textContent = t.loc_needs_https;
    }
    return;
  }

  if (!navigator.geolocation) {
    console.warn("[GPS] Geolocation API unsupported.");
    if (modalStatus) modalStatus.classList.add("hidden");
    if (modalError && modalErrorDesc) {
      modalError.classList.remove("hidden");
      modalErrorDesc.textContent = t.gps_unsupported;
    }
    return;
  }

  // Geolocation Call triggered from user click gesture
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      console.log(`[GPS SUCCESS] Latitude: ${lat}, Longitude: ${lon}, Accuracy: ${position.coords.accuracy}m`);

      await setLocationAndProceed(lat, lon, false);
    },
    (error) => {
      console.error(`[GPS ERROR] Code: ${error.code}, Message: ${error.message}`);
      if (modalStatus) modalStatus.classList.add("hidden");

      if (error.code === error.PERMISSION_DENIED) {
        if (modalError && modalErrorDesc) {
          modalError.classList.remove("hidden");
          modalErrorDesc.textContent = t.loc_denied_help;
        }
      } else {
        // Fallback to approximate IP location
        console.log("[GPS] Falling back to approximate IP location...");
        fallbackToIPLocation();
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

async function fallbackToIPLocation() {
  const modalStatus = document.getElementById("modal-loc-status");
  const modalError = document.getElementById("modal-loc-error");
  const modalErrorDesc = document.getElementById("modal-error-desc");

  try {
    const res = await fetch("/api/ip-location");
    if (res.ok) {
      const data = await res.json();
      console.log("[IP LOCATION SUCCESS]", data);
      await setLocationAndProceed(data.lat, data.lon, true);
      return;
    }
  } catch (e) {
    console.error("[IP LOCATION ERROR]", e);
  }

  if (modalStatus) modalStatus.classList.add("hidden");
  if (modalError && modalErrorDesc) {
    modalError.classList.remove("hidden");
    modalErrorDesc.textContent = "Could not detect location. Please use manual search.";
  }
}

async function setLocationAndProceed(lat, lon, isApproximate = false) {
  const modal = document.getElementById("modal-location-entry");
  
  try {
    const res = await fetch("/api/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon })
    });

    if (res.ok) {
      const data = await res.json();
      const locInfo = data.location || {};
      currentLocation = {
        display_name: locInfo.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        village: locInfo.village || "Karnataka Farm",
        district: locInfo.district || "Agricultural Belt",
        state: locInfo.state || "Karnataka",
        country: locInfo.country || "India",
        lat: lat,
        lon: lon,
        source: locInfo.source || (isApproximate ? "IP Approximate" : "GPS Sensor"),
        is_approximate: isApproximate
      };

      if (data.weather) {
        weatherData = data.weather;
      }
    }
  } catch (e) {
    console.error("[GEOCODE ERROR]", e);
    currentLocation = {
      display_name: `Coordinates (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
      village: "Rural Plot",
      district: "Dharwad",
      state: "Karnataka",
      country: "India",
      lat: lat,
      lon: lon,
      source: isApproximate ? "IP Approximate" : "GPS",
      is_approximate: isApproximate
    };
  }

  // Close modal
  if (modal) modal.classList.add("hidden");

  // Fetch real-time weather if not loaded
  if (!weatherData) {
    await fetchLiveWeather(currentLocation.lat, currentLocation.lon);
  }

  // Automatically transition to Step 2
  navigateToStep(2);
}

async function fetchLiveWeather(lat, lon) {
  try {
    const res = await fetch("/api/weather", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon })
    });
    if (res.ok) {
      weatherData = await res.json();
    }
  } catch (e) {
    console.error("[WEATHER FETCH ERROR]", e);
  }
}

function renderClimateChart(monthly) {
  const canvas = document.getElementById("chart-climate-canvas");
  if (!canvas || typeof Chart === 'undefined') return;

  if (climateChartInstance) {
    climateChartInstance.destroy();
  }

  const labels = monthly.map(m => m.month);
  const rainVals = monthly.map(m => m.rainfall_mm);
  const tempVals = monthly.map(m => m.temp_c);

  climateChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Monthly Rainfall (mm)",
          data: rainVals,
          backgroundColor: "rgba(59, 130, 246, 0.75)",
          borderRadius: 6,
          yAxisID: "y"
        },
        {
          label: "Mean Temperature (°C)",
          data: tempVals,
          type: "line",
          borderColor: "rgba(234, 88, 12, 1)",
          backgroundColor: "rgba(234, 88, 12, 0.2)",
          borderWidth: 2.5,
          tension: 0.3,
          yAxisID: "y1"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          title: { display: true, text: "Rainfall (mm)", font: { size: 10 } },
          grid: { color: "rgba(226, 232, 240, 0.6)" }
        },
        y1: {
          position: "right",
          title: { display: true, text: "Temp (°C)", font: { size: 10 } },
          grid: { drawOnChartArea: false }
        }
      },
      plugins: {
        legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } }
      }
    }
  });
}

async function handleSoilPhotoUpload(file) {
  const previewImg = document.getElementById("soil-preview-img");
  const previewContainer = document.getElementById("soil-upload-preview-container");
  const emptyUpload = document.getElementById("soil-upload-empty");
  const spinner = document.getElementById("soil-upload-spinner");
  const rejectionBox = document.getElementById("soil-rejection-alert");
  const rejectionText = document.getElementById("soil-rejection-text");
  const reportCard = document.getElementById("soil-report-card");

  if (previewImg) previewImg.src = URL.createObjectURL(file);
  if (emptyUpload) emptyUpload.classList.add("hidden");
  if (previewContainer) previewContainer.classList.remove("hidden");
  if (spinner) spinner.classList.remove("hidden");
  if (rejectionBox) rejectionBox.classList.add("hidden");
  if (reportCard) reportCard.classList.add("hidden");

  const formData = new FormData();
  formData.append("photo", file);

  try {
    const res = await fetch("/api/soil-photo", {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      soilReport = data;

      if (spinner) spinner.classList.add("hidden");

      if (data.status === "not_soil") {
        console.warn("[SOIL REJECTION GATE TRIGGERED]", data.rejection_reason);
        if (rejectionBox) rejectionBox.classList.remove("hidden");
        if (rejectionText) {
          rejectionText.textContent = currentLang === 'kn' ? (data.rejection_reason_kn || data.rejection_reason || "") : (data.rejection_reason || "");
        }
        if (reportCard) reportCard.classList.add("hidden");
        return;
      }

      // Soil identified
      if (rejectionBox) rejectionBox.classList.add("hidden");
      if (reportCard) reportCard.classList.remove("hidden");

      soilType = data.soil_type;
      soilN = data.estimated_n || 85;
      soilP = data.estimated_p || 45;
      soilK = data.estimated_k || 42;
      soilPh = data.estimated_ph || 6.8;

      renderCurrentStep();
    }
  } catch (e) {
    console.error("[SOIL UPLOAD ERROR]", e);
    if (spinner) spinner.classList.add("hidden");
  }
}

async function executeRotationCheck(cropKey) {
  previousCrop = cropKey;
  try {
    const res = await fetch("/api/rotation-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        crop_name: cropKey,
        soil_n: soilN,
        soil_p: soilP,
        soil_k: soilK
      })
    });

    if (res.ok) {
      rotationReport = await res.json();
      console.log("[ROTATION REPORT]", rotationReport);
      renderCurrentStep();
    }
  } catch (e) {
    console.error("[ROTATION CHECK ERROR]", e);
  }
}

async function fetchRecommendationsAndRender(container) {
  container.innerHTML = `
    <div class="text-center py-16 space-y-4">
      <div class="w-16 h-16 rounded-full bg-emerald-100 text-[#1b5e20] text-3xl flex items-center justify-center mx-auto shadow-inner">
        <i class="fa-solid fa-seedling fa-bounce"></i>
      </div>
      <h3 class="text-lg font-bold text-slate-800">Calculating Crop Suitability & Financial Margins...</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto">Synthesizing soil parameters, live Open-Meteo weather, and Mandi price volatility.</p>
    </div>
  `;

  try {
    const payload = {
      lat: currentLocation.lat,
      lng: currentLocation.lon,
      location_name: currentLocation.display_name,
      land_acres: landAcres,
      budget_inr: budgetInr,
      irrigation: irrigation,
      soil_n: soilN,
      soil_p: soilP,
      soil_k: soilK,
      soil_ph: soilPh,
      soil_type: soilType,
      previous_crop: previousCrop,
      temperature: weatherData?.current?.temperature || 26.5,
      humidity: weatherData?.current?.humidity || 68.0,
      rainfall: weatherData?.annual_rainfall_estimate || 950.0
    };

    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      recommendData = await res.json();
      console.log("[RECOMMEND RESULTS]", recommendData);

      renderResultsStepView(container);
    }
  } catch (e) {
    console.error("[RECOMMEND ERROR]", e);
    container.innerHTML = `
      <div class="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
        Failed to load recommendations. Please check parameters and try again.
      </div>
    `;
  }
}

// ============================================================================
// 7. Event Listeners
// ============================================================================
function bindGlobalListeners() {
  const btnModalDetect = document.getElementById("btn-modal-detect-location");
  if (btnModalDetect) {
    btnModalDetect.addEventListener("click", () => {
      detectUserLocation();
    });
  }

  const btnModalManual = document.getElementById("btn-modal-enter-manually");
  if (btnModalManual) {
    btnModalManual.addEventListener("click", () => {
      const modal = document.getElementById("modal-location-entry");
      if (modal) modal.classList.add("hidden");
      navigateToStep(1);
      const searchBox = document.getElementById("inline-loc-search-box");
      if (searchBox) searchBox.classList.remove("hidden");
      if (!weatherData) {
        fetchLiveWeather(currentLocation.lat, currentLocation.lon);
      }
    });
  }

  document.querySelectorAll(".step-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const s = parseInt(btn.getAttribute("data-step") || "1");
      navigateToStep(s);
    });
  });

  const btnPrev = document.getElementById("btn-step-prev");
  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      if (currentStep > 1) {
        navigateToStep(currentStep - 1);
      }
    });
  }

  const btnNext = document.getElementById("btn-step-next");
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      if (currentStep < 6) {
        navigateToStep(currentStep + 1);
      }
    });
  }

  const btnEn = document.getElementById("lang-en");
  const btnKn = document.getElementById("lang-kn");

  if (btnEn && btnKn) {
    btnEn.addEventListener("click", () => {
      currentLang = 'en';
      const appContainer = document.getElementById("app");
      if (appContainer) renderDashboardShell(appContainer, currentLang);
      bindGlobalListeners();
      const modal = document.getElementById("modal-location-entry");
      if (modal) modal.classList.add("hidden");
      navigateToStep(currentStep);
    });

    btnKn.addEventListener("click", () => {
      currentLang = 'kn';
      const appContainer = document.getElementById("app");
      if (appContainer) renderDashboardShell(appContainer, currentLang);
      bindGlobalListeners();
      const modal = document.getElementById("modal-location-entry");
      if (modal) modal.classList.add("hidden");
      navigateToStep(currentStep);
    });
  }

  const btnPdf = document.getElementById("btn-export-pdf");
  if (btnPdf) {
    btnPdf.addEventListener("click", () => {
      window.print();
    });
  }

  const btnHistory = document.getElementById("btn-history");
  const modalHistory = document.getElementById("modal-history");
  const btnCloseHistory = document.getElementById("btn-close-history");

  if (btnHistory && modalHistory) {
    btnHistory.addEventListener("click", async () => {
      modalHistory.classList.remove("hidden");
      const listContainer = document.getElementById("history-list-content");
      if (!listContainer) return;
      try {
        const res = await fetch("/api/history");
        if (res.ok) {
          const records = await res.json();
          if (records.length === 0) {
            listContainer.innerHTML = `<div class="text-center py-6 text-slate-400">No advisory history saved yet.</div>`;
          } else {
            listContainer.innerHTML = records.map((r) => `
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <strong class="text-slate-800">${r.location_name || "Farm Plot"}</strong>
                  <div class="text-[11px] text-slate-500">${r.land_acres} Acres • ₹${r.budget_inr.toLocaleString()}</div>
                </div>
                <div class="text-right">
                  <span class="text-emerald-700 font-bold block">${r.top_crop || ""}</span>
                  <span class="text-[10px] text-slate-400">${new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            `).join('');
          }
        }
      } catch (e) {
        listContainer.innerHTML = `<div class="text-rose-500">Could not load history.</div>`;
      }
    });
  }

  if (btnCloseHistory && modalHistory) {
    btnCloseHistory.addEventListener("click", () => {
      modalHistory.classList.add("hidden");
    });
  }
}

function bindLocationStepListeners() {
  const btnToggleChange = document.getElementById("btn-toggle-change-loc");
  const searchBox = document.getElementById("inline-loc-search-box");
  const inputSearch = document.getElementById("input-search-place");
  const btnSearch = document.getElementById("btn-execute-place-search");
  const resultsContainer = document.getElementById("place-search-results");

  if (btnToggleChange && searchBox) {
    btnToggleChange.addEventListener("click", () => {
      searchBox.classList.toggle("hidden");
      if (!searchBox.classList.contains("hidden") && inputSearch) {
        inputSearch.focus();
      }
    });
  }

  const executeSearch = async () => {
    if (!inputSearch || !resultsContainer) return;
    const q = inputSearch.value.trim();
    if (!q) return;

    resultsContainer.innerHTML = `<div class="py-2 text-slate-500">Searching places...</div>`;
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const json = await res.json();
        const results = json.result || [];
        if (results.length === 0) {
          resultsContainer.innerHTML = `<div class="py-2 text-slate-400">No matching places found.</div>`;
        } else {
          resultsContainer.innerHTML = results.map((r) => `
            <div class="place-item p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 cursor-pointer flex items-center justify-between" data-lat="${r.lat}" data-lon="${r.lon}" data-name="${r.display_name}">
              <div class="font-semibold text-slate-800">${r.display_name}</div>
              <span class="text-[10px] text-slate-400 font-mono">${parseFloat(r.lat).toFixed(2)}, ${parseFloat(r.lon).toFixed(2)}</span>
            </div>
          `).join('');

          document.querySelectorAll(".place-item").forEach(item => {
            item.addEventListener("click", async () => {
              const lat = parseFloat(item.getAttribute("data-lat") || "15.3173");
              const lon = parseFloat(item.getAttribute("data-lon") || "75.7139");
              await setLocationAndProceed(lat, lon, false);
            });
          });
        }
      }
    } catch (e) {
      resultsContainer.innerHTML = `<div class="py-2 text-rose-500">Search error.</div>`;
    }
  };

  if (btnSearch) {
    btnSearch.addEventListener("click", executeSearch);
  }

  if (inputSearch) {
    inputSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") executeSearch();
    });
  }
}

function bindWeatherStepListeners() {
  const btnRefresh = document.getElementById("btn-refresh-weather-step");
  if (btnRefresh) {
    btnRefresh.addEventListener("click", async () => {
      btnRefresh.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Updating...`;
      await fetchLiveWeather(currentLocation.lat, currentLocation.lon);
      renderCurrentStep();
    });
  }
}

function bindSoilStepListeners() {
  const fileInput = document.getElementById("input-soil-file");
  const btnRemove = document.getElementById("btn-remove-soil-photo");
  const btnRetake = document.getElementById("btn-retake-soil");
  const btnSkip = document.getElementById("btn-skip-to-manual-soil");

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      if (fileInput.files && fileInput.files[0]) {
        handleSoilPhotoUpload(fileInput.files[0]);
      }
    });
  }

  if (btnRemove) {
    btnRemove.addEventListener("click", () => {
      soilReport = null;
      renderCurrentStep();
    });
  }

  if (btnRetake) {
    btnRetake.addEventListener("click", () => {
      if (fileInput) fileInput.click();
    });
  }

  if (btnSkip) {
    btnSkip.addEventListener("click", () => {
      const rejectionBox = document.getElementById("soil-rejection-alert");
      if (rejectionBox) rejectionBox.classList.add("hidden");
      const select = document.getElementById("input-soil-type-select");
      if (select) select.focus();
    });
  }

  const inN = document.getElementById("input-soil-n");
  const inP = document.getElementById("input-soil-p");
  const inK = document.getElementById("input-soil-k");
  const inPh = document.getElementById("input-soil-ph");
  const inType = document.getElementById("input-soil-type-select");

  if (inN) inN.addEventListener("input", () => { soilN = parseFloat(inN.value) || 85; });
  if (inP) inP.addEventListener("input", () => { soilP = parseFloat(inP.value) || 45; });
  if (inK) inK.addEventListener("input", () => { soilK = parseFloat(inK.value) || 42; });
  if (inPh) inPh.addEventListener("input", () => { soilPh = parseFloat(inPh.value) || 6.8; });
  if (inType) inType.addEventListener("change", () => { soilType = inType.value; });
}

function bindFarmStepListeners() {
  const inLand = document.getElementById("input-farm-land");
  const slideLand = document.getElementById("slider-farm-land");
  const inBudget = document.getElementById("input-farm-budget");
  const slideBudget = document.getElementById("slider-farm-budget");
  const selectIrr = document.getElementById("select-farm-irrigation");

  if (inLand && slideLand) {
    inLand.addEventListener("input", () => {
      landAcres = parseFloat(inLand.value) || 3.0;
      slideLand.value = String(landAcres);
    });
    slideLand.addEventListener("input", () => {
      landAcres = parseFloat(slideLand.value) || 3.0;
      inLand.value = String(landAcres);
    });
  }

  if (inBudget && slideBudget) {
    inBudget.addEventListener("input", () => {
      budgetInr = parseFloat(inBudget.value) || 65000;
      slideBudget.value = String(budgetInr);
    });
    slideBudget.addEventListener("input", () => {
      budgetInr = parseFloat(slideBudget.value) || 65000;
      inBudget.value = String(budgetInr);
    });
  }

  if (selectIrr) {
    selectIrr.addEventListener("change", () => {
      irrigation = selectIrr.value;
    });
  }
}

function bindRotationStepListeners() {
  document.querySelectorAll(".rotation-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const crop = chip.getAttribute("data-crop");
      if (crop) {
        executeRotationCheck(crop);
      }
    });
  });
}

// ============================================================================
// 8. Bootstrap On Load
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.getElementById("app");
  if (!appContainer) return;

  renderDashboardShell(appContainer, currentLang);
  renderCurrentStep();
  bindGlobalListeners();

  // Pre-fetch live weather for default coordinates
  fetchLiveWeather(currentLocation.lat, currentLocation.lon);
});
