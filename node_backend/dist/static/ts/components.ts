/**
 * Farmer Decision Dashboard - Pure TypeScript DOM Component Builder
 * Constructs all DOM elements programmatically without hardcoded static HTML or Leaflet maps.
 */

import { I18N } from './i18n';
import { LangCode, StepId, LocationData, CurrentWeather, DailyForecastDay, ClimateMonth, SoilPhotoResponse, RotationCheckResponse, CropRecommendation, AlternativeCropItem } from './types';

export function renderDashboardShell(container: HTMLElement, lang: LangCode) {
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

    <!-- Modal 1: Centered Location Modal Pop-up on Entry -->
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

/**
 * Step 1: Plain-Text Location Card & Inline Search (NO MAP)
 */
export function renderLocationStep(container: HTMLElement, loc: LocationData, lang: LangCode) {
  const t = I18N[lang] || I18N['en'];
  const approxBadge = loc.is_approximate ? `<span class="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Approximate Location</span>` : `<span class="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">GPS Verified</span>`;

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
            <span id="loc-display-village">${loc.village || "Karnataka Farm"}</span>, 
            <span id="loc-display-state" class="text-slate-600 font-semibold">${loc.district ? loc.district + ", " : ""}${loc.state}</span>
          </div>
          <div class="text-xs text-slate-500 font-mono flex items-center gap-3">
            <span>Lat: <strong class="text-slate-700">${loc.lat.toFixed(4)}° N</strong></span>
            <span>Lon: <strong class="text-slate-700">${loc.lon.toFixed(4)}° E</strong></span>
            <span class="text-slate-400">(${loc.source})</span>
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

      <!-- Info note -->
      <div class="text-xs text-slate-500 flex items-center gap-2">
        <i class="fa-solid fa-circle-info text-emerald-600"></i>
        <span>Coordinates will be used to automatically fetch Open-Meteo satellite weather and local soil suitability.</span>
      </div>

    </div>
  `;
}

/**
 * Step 2: Real-time Weather Card, 7-Day Mini Forecast & 12-Month Climate Chart
 */
export function renderWeatherStep(container: HTMLElement, wx: CurrentWeather, daily: DailyForecastDay[], 7d_rain: number, annual_rain: number, lang: LangCode) {
  const t = I18N[lang] || I18N['en'];
  const rainStatusHtml = (wx.rain_now_mm && wx.rain_now_mm > 0.1) || wx.is_raining
    ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-bold text-xs"><i class="fa-solid fa-cloud-showers-heavy text-blue-600"></i> ${t.lbl_raining_now} ${wx.rain_now_mm ? wx.rain_now_mm.toFixed(1) : '1.2'} mm</span>`
    : `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs"><i class="fa-solid fa-sun text-amber-600"></i> ${t.lbl_no_rain_now}</span>`;

  const seasonText = lang === 'kn' ? (wx.season_name_kn || "ಖಾರೀಫ್ (ಮುಂಗಾರು)") : (wx.season || "Kharif");
  const farmingNote = lang === 'kn' ? (wx.farming_note_kn || wx.farming_note || "") : (wx.farming_note || "");

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
            <span class="text-5xl">${wx.icon}</span>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-3xl sm:text-4xl font-extrabold tracking-tight">${wx.temperature.toFixed(1)}°C</span>
                <span class="text-xs bg-white/20 text-emerald-100 px-2 py-0.5 rounded-full font-semibold">${t.lbl_feels_like} ${(wx.apparent_temperature || wx.feels_like || wx.temperature).toFixed(1)}°C</span>
              </div>
              <p class="text-sm text-emerald-100 font-medium">${wx.description}</p>
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
            <span class="text-lg font-bold">${wx.humidity.toFixed(0)}%</span>
          </div>
          <div class="bg-white/10 rounded-2xl p-3">
            <span class="text-emerald-200 block text-[11px]">${t.lbl_wind}</span>
            <span class="text-lg font-bold">${wx.wind_speed.toFixed(1)} km/h</span>
          </div>
          <div class="bg-white/10 rounded-2xl p-3">
            <span class="text-emerald-200 block text-[11px]">${t.lbl_rain_chance}</span>
            <span class="text-lg font-bold text-amber-200">${(wx.rain_chance_today || wx.rain_chance || 0).toFixed(0)}%</span>
          </div>
          <div class="bg-white/10 rounded-2xl p-3">
            <span class="text-emerald-200 block text-[11px]">${t.lbl_7d_rain}</span>
            <span class="text-lg font-bold text-amber-300">${7d_rain.toFixed(1)} mm</span>
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
          <span class="text-xs text-slate-500 font-semibold">Annual Est: <strong class="text-slate-800">${annual_rain.toFixed(0)} mm</strong></span>
        </div>
        <div class="h-56 w-full rounded-2xl border border-slate-200 p-3 bg-slate-50">
          <canvas id="chart-climate-canvas"></canvas>
        </div>
      </div>

    </div>
  `;
}

/**
 * Step 3: Soil Photo Upload, Non-Soil Rejection Gate, & Pedological Soil Report
 */
export function renderSoilStep(container: HTMLElement, soilReport: SoilPhotoResponse | null, lang: LangCode) {
  const t = I18N[lang] || I18N['en'];

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
              <strong id="soil-val-colour" class="text-slate-800">${soilReport ? soilReport.soil_colour : "Dark brown"}</strong>
            </div>
            <div class="bg-white p-3 rounded-2xl border border-slate-200">
              <span class="text-slate-500 text-[10px] block">${t.lbl_soil_texture}</span>
              <strong id="soil-val-texture" class="text-slate-800">${soilReport ? soilReport.texture : "medium"}</strong>
            </div>
            <div class="bg-white p-3 rounded-2xl border border-slate-200">
              <span class="text-slate-500 text-[10px] block">${t.lbl_water_holding}</span>
              <strong id="soil-val-water" class="text-slate-800">${soilReport ? soilReport.water_holding : "high"}</strong>
            </div>
            <div class="bg-white p-3 rounded-2xl border border-slate-200">
              <span class="text-slate-500 text-[10px] block">${t.lbl_drainage}</span>
              <strong id="soil-val-drainage" class="text-slate-800">${soilReport ? soilReport.drainage : "moderate"}</strong>
            </div>
          </div>

          <!-- Problems to watch & fixes -->
          <div class="space-y-2">
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">${t.lbl_problems_to_watch}</span>
            <div id="soil-problems-list" class="space-y-2 text-xs">
              ${soilReport && soilReport.problems_to_watch ? soilReport.problems_to_watch.map(p => `
                <div class="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                  <div class="font-bold text-slate-800">⚠️ ${lang === 'kn' ? (p.issue_kn || p.issue) : p.issue}</div>
                  <div class="text-emerald-800 font-medium">💡 Fix: ${lang === 'kn' ? (p.fix_kn || p.fix) : p.fix}</div>
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
            <input type="number" id="input-soil-n" value="${soilReport ? (soilReport.estimated_n || 85) : 85}" min="0" max="300" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-white" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">${t.lbl_soil_p}</label>
            <input type="number" id="input-soil-p" value="${soilReport ? (soilReport.estimated_p || 45) : 45}" min="0" max="250" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-white" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">${t.lbl_soil_k}</label>
            <input type="number" id="input-soil-k" value="${soilReport ? (soilReport.estimated_k || 42) : 42}" min="0" max="300" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-white" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">${t.lbl_soil_ph}</label>
            <input type="number" id="input-soil-ph" step="0.1" value="${soilReport ? (soilReport.estimated_ph || 6.8) : 6.8}" min="4.0" max="9.5" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-white" />
          </div>
          <div class="col-span-2 sm:col-span-1">
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">${t.lbl_soil_type}</label>
            <select id="input-soil-type-select" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 bg-white">
              <option value="Clay Loam" ${soilReport && soilReport.soil_type === 'Clay Loam' ? 'selected' : ''}>Clay Loam</option>
              <option value="Black Cotton" ${soilReport && soilReport.soil_type === 'Black Cotton' ? 'selected' : ''}>Black Cotton</option>
              <option value="Red Loam" ${soilReport && soilReport.soil_type === 'Red Loam' ? 'selected' : ''}>Red Loam</option>
              <option value="Alluvial" ${soilReport && soilReport.soil_type === 'Alluvial' ? 'selected' : ''}>Alluvial</option>
              <option value="Sandy Loam" ${soilReport && soilReport.soil_type === 'Sandy Loam' ? 'selected' : ''}>Sandy Loam</option>
            </select>
          </div>
        </div>
      </div>

    </div>
  `;
}

/**
 * Step 4: Farm Land & Economics Profile
 */
export function renderFarmProfileStep(container: HTMLElement, land: number, budget: number, irrigation: string, lang: LangCode) {
  const t = I18N[lang] || I18N['en'];

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
            <input type="number" id="input-farm-land" step="0.5" min="0.5" max="100" value="${land}" class="w-24 px-3 py-2 text-base font-bold text-slate-800 border border-slate-300 rounded-xl bg-white" />
            <span class="text-sm text-slate-600 font-semibold">Acres</span>
          </div>
          <input type="range" id="slider-farm-land" min="0.5" max="25" step="0.5" value="${land}" class="w-full accent-emerald-700" />
        </div>

        <!-- Budget -->
        <div class="p-5 rounded-2xl bg-earth-50 border border-earth-200 space-y-3">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">${t.lbl_budget}</label>
          <div class="flex items-center gap-2">
            <span class="text-base font-bold text-slate-500">₹</span>
            <input type="number" id="input-farm-budget" step="5000" min="5000" max="1000000" value="${budget}" class="w-full px-3 py-2 text-base font-bold text-slate-800 border border-slate-300 rounded-xl bg-white" />
          </div>
          <input type="range" id="slider-farm-budget" min="10000" max="300000" step="5000" value="${budget}" class="w-full accent-emerald-700" />
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
}

/**
 * Step 5: Crop Rotation Impact & Soil Health Card Calibration
 */
export function renderRotationStep(container: HTMLElement, rotationReport: RotationCheckResponse | null, lang: LangCode) {
  const t = I18N[lang] || I18N['en'];

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
            <button type="button" data-crop="${c.key}" class="rotation-chip p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${rotationReport && rotationReport.matched_key === c.key ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}">
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
              ${rotationReport ? (lang === 'kn' ? rotationReport.fertility_impact_kn : rotationReport.fertility_impact + ' Fertility') : ''}
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
              ${rotationReport ? (lang === 'kn' ? rotationReport.soil_health_tips_kn : rotationReport.soil_health_tips).map(tip => `
                <li>${tip}</li>
              `).join('') : ''}
            </ul>
          </div>
        </div>
      </div>

    </div>
  `;
}

/**
 * Step 6: 3 Output Sections (Top 5 Overall, Top 3 Weather Fit, Top 3 Alternatives) & What-If Sliders
 */
export function renderResultsStep(
  container: HTMLElement,
  topCrops: CropRecommendation[],
  weatherFitCrops: CropRecommendation[],
  alternativeCrops: AlternativeCropItem[],
  lang: LangCode
) {
  const t = I18N[lang] || I18N['en'];

  const renderCropCard = (c: CropRecommendation, rank: number) => {
    const riskBadgeColor = c.risk_badge === 'Low' ? 'bg-emerald-100 text-emerald-800' : (c.risk_badge === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800');

    return `
      <div class="crop-card bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition hover:shadow-md">
        <div class="p-5 sm:p-6 space-y-4">
          <div class="flex items-start justify-between flex-wrap gap-2">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-full bg-[#1b5e20] text-white flex items-center justify-center font-bold text-sm shadow-xs">#${rank}</span>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900">${lang === 'kn' ? c.kannada_name : c.display_name}</h3>
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
                <h4 class="font-extrabold text-slate-900 text-base">${lang === 'kn' ? c.kannada_name : c.display_name}</h4>
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
                <span class="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">${t.lbl_condition} ${lang === 'kn' ? alt.condition_kn : alt.condition}</span>
                <h4 class="font-extrabold text-slate-900 text-base">${lang === 'kn' ? alt.kannada_name : alt.display_name}</h4>
              </div>
              <div class="text-xs space-y-2">
                <div class="p-3 rounded-2xl bg-white border border-amber-200/80">
                  <span class="font-bold text-slate-700 block text-[11px]">${t.lbl_action}</span>
                  <span class="text-slate-600 font-medium">${lang === 'kn' ? alt.action_required_kn : alt.action_required}</span>
                </div>
                <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span class="font-bold text-emerald-900 block text-[11px]">${t.lbl_benefit}</span>
                  <span class="text-emerald-800 font-medium">${lang === 'kn' ? alt.potential_benefit_kn : alt.potential_benefit}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

    </div>
  `;
}
