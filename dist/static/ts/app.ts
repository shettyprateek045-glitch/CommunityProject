/**
 * Farmer Decision Dashboard - Frontend TypeScript Application
 * Orchestrates 6-step precision agronomic stepper, centered location modal,
 * real-time Open-Meteo micro-climate, non-soil rejection vision gate,
 * pedological soil report, crop rotation engine, and 3-section recommendation matrix.
 */

import {
  LangCode,
  StepId,
  LocationData,
  WeatherResponse,
  SoilPhotoResponse,
  RotationCheckResponse,
  RecommendResponse,
  CropRecommendation,
  AlternativeCropItem
} from './types';
import { I18N } from './i18n';
import {
  renderDashboardShell,
  renderLocationStep,
  renderWeatherStep,
  renderSoilStep,
  renderFarmProfileStep,
  renderRotationStep,
  renderResultsStep
} from './components';

declare const Chart: any;

// ============================================================================
// Application State
// ============================================================================
let currentLang: LangCode = 'en';
let currentStep: StepId = 1;

// Location State
let currentLocation: LocationData = {
  display_name: "Dharwad, Karnataka, India",
  village: "Hubballi-Dharwad",
  district: "Dharwad",
  state: "Karnataka",
  country: "India",
  lat: 15.3173,
  lon: 75.7139,
  source: "default",
  is_approximate: false
};
let isLocationSet = false;

// Weather State
let weatherData: WeatherResponse | null = null;
let climateChartInstance: any = null;

// Soil State
let soilReport: SoilPhotoResponse | null = null;
let soilN = 85.0;
let soilP = 45.0;
let soilK = 42.0;
let soilPh = 6.8;
let soilType = "Clay Loam";

// Farm State
let landAcres = 3.0;
let budgetInr = 65000.0;
let irrigation = "drip";

// Rotation State
let previousCrop: string | null = "gram";
let rotationReport: RotationCheckResponse | null = null;

// Recommendations State
let recommendData: RecommendResponse | null = null;

// ============================================================================
// Initialization
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.getElementById("app");
  if (!appContainer) return;

  // 1. Mount DOM shell
  renderDashboardShell(appContainer, currentLang);

  // 2. Render initial step views
  renderCurrentStepView();

  // 3. Bind global event listeners
  bindGlobalListeners();

  // 4. Pre-fetch real-time weather in background for default coordinates
  fetchLiveWeather(currentLocation.lat, currentLocation.lon);
});

// ============================================================================
// Step Router & View Management
// ============================================================================
function navigateToStep(step: StepId) {
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

  // Render content for current step
  renderCurrentStepView();
}

function renderCurrentStepView() {
  if (currentStep === 1) {
    const p1 = document.getElementById("panel-step-1");
    if (p1) {
      renderLocationStep(p1, currentLocation, currentLang);
      bindLocationStepListeners();
    }
  } else if (currentStep === 2) {
    const p2 = document.getElementById("panel-step-2");
    if (p2) {
      if (!weatherData) {
        p2.innerHTML = `
          <div class="bg-white rounded-3xl p-10 text-center space-y-4 border border-slate-100 shadow-sm">
            <div class="inline-block animate-spin text-4xl text-emerald-600"><i class="fa-solid fa-cloud-sun"></i></div>
            <h3 class="text-base font-bold text-slate-800">${currentLang === 'kn' ? 'ಹವಾಮಾನ ವಿವರಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...' : 'Fetching live weather from Open-Meteo...'}</h3>
            <p class="text-xs text-slate-500">${currentLang === 'kn' ? 'ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ, ಉಪಗ್ರಹ ಹವಾಮಾನ ಮತ್ತು ಹವಾಮಾನ ದಾಖಲೆಗಳನ್ನು ಸಿಂಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ.' : 'Syncing live satellite micro-climate from Open-Meteo.'}</p>
          </div>
        `;
        fetchLiveWeather(currentLocation.lat, currentLocation.lon).then(() => {
          if (weatherData && currentStep === 2) {
            renderWeatherStep(
              p2,
              weatherData.current,
              weatherData.daily_7d,
              weatherData.rainfall_7d_total,
              weatherData.annual_rainfall_estimate,
              currentLang
            );
            bindWeatherStepListeners();
            renderClimateChart(weatherData.monthly_climate_12m);
          }
        });
      } else {
        renderWeatherStep(
          p2,
          weatherData.current,
          weatherData.daily_7d,
          weatherData.rainfall_7d_total,
          weatherData.annual_rainfall_estimate,
          currentLang
        );
        bindWeatherStepListeners();
        renderClimateChart(weatherData.monthly_climate_12m);
      }
    }
  } else if (currentStep === 3) {
    const p3 = document.getElementById("panel-step-3");
    if (p3) {
      renderSoilStep(p3, soilReport, currentLang);
      bindSoilStepListeners();
    }
  } else if (currentStep === 4) {
    const p4 = document.getElementById("panel-step-4");
    if (p4) {
      renderFarmProfileStep(p4, landAcres, budgetInr, irrigation, currentLang);
      bindFarmStepListeners();
    }
  } else if (currentStep === 5) {
    const p5 = document.getElementById("panel-step-5");
    if (p5) {
      if (!rotationReport && previousCrop) {
        executeRotationCheck(previousCrop);
      }
      renderRotationStep(p5, rotationReport, currentLang);
      bindRotationStepListeners();
    }
  } else if (currentStep === 6) {
    const p6 = document.getElementById("panel-step-6");
    if (p6) {
      fetchRecommendationsAndRender(p6);
    }
  }
}

// ============================================================================
// Step 1: Centered Location Modal & Geolocation Handling
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
        // Retry once with IP-based fallback
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

async function setLocationAndProceed(lat: number, lon: number, isApproximate: boolean = false) {
  const modal = document.getElementById("modal-location-entry");
  
  // Call reverse geocode
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

  isLocationSet = true;

  // Close modal
  if (modal) modal.classList.add("hidden");

  // Fetch real-time weather if not already loaded
  if (!weatherData) {
    await fetchLiveWeather(currentLocation.lat, currentLocation.lon);
  }

  // Automatically transition to Step 2
  navigateToStep(2);
}

// ============================================================================
// Step 2: Real-time Weather Management
// ============================================================================
async function fetchLiveWeather(lat: number, lon: number) {
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

function renderClimateChart(monthly: any[]) {
  const canvas = document.getElementById("chart-climate-canvas") as HTMLCanvasElement;
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

// ============================================================================
// Step 3: Soil Photo Upload & Non-Soil Gate
// ============================================================================
async function handleSoilPhotoUpload(file: File) {
  const previewImg = document.getElementById("soil-preview-img") as HTMLImageElement;
  const previewContainer = document.getElementById("soil-upload-preview-container");
  const emptyUpload = document.getElementById("soil-upload-empty");
  const spinner = document.getElementById("soil-upload-spinner");
  const rejectionBox = document.getElementById("soil-rejection-alert");
  const rejectionText = document.getElementById("soil-rejection-text");
  const reportCard = document.getElementById("soil-report-card");

  // Show preview
  if (previewImg) {
    previewImg.src = URL.createObjectURL(file);
  }
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
      const data: SoilPhotoResponse = await res.json();
      soilReport = data;

      if (spinner) spinner.classList.add("hidden");

      if (data.status === "not_soil") {
        // NON-SOIL REJECTION GATE TRIGGERED
        console.warn("[SOIL REJECTION]", data.rejection_reason);
        if (rejectionBox) rejectionBox.classList.remove("hidden");
        if (rejectionText) {
          rejectionText.textContent = currentLang === 'kn' ? (data.rejection_reason_kn || data.rejection_reason || "") : (data.rejection_reason || "");
        }
        if (reportCard) reportCard.classList.add("hidden");
        return;
      }

      // VALID SOIL PHOTO
      if (rejectionBox) rejectionBox.classList.add("hidden");
      if (reportCard) reportCard.classList.remove("hidden");

      // Auto-calibrate parameters
      soilType = data.soil_type;
      soilN = data.estimated_n || 85;
      soilP = data.estimated_p || 45;
      soilK = data.estimated_k || 42;
      soilPh = data.estimated_ph || 6.8;

      // Update UI elements in Step 3
      renderCurrentStepView();
    }
  } catch (e) {
    console.error("[SOIL UPLOAD ERROR]", e);
    if (spinner) spinner.classList.add("hidden");
  }
}

// ============================================================================
// Step 5: Crop Rotation Check
// ============================================================================
async function executeRotationCheck(cropKey: string) {
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
      renderCurrentStepView();
    }
  } catch (e) {
    console.error("[ROTATION CHECK ERROR]", e);
  }
}

// ============================================================================
// Step 6: Fetch Recommendations & Render Results
// ============================================================================
async function fetchRecommendationsAndRender(container: HTMLElement) {
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
      temperature: weatherData?.current.temperature || 26.5,
      humidity: weatherData?.current.humidity || 68.0,
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

      renderResultsStep(
        container,
        recommendData?.top_crops || [],
        recommendData?.weather_fit_crops || [],
        recommendData?.alternative_crops || [],
        currentLang
      );
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
// Event Listeners Binding
// ============================================================================
function bindGlobalListeners() {
  // Modal Buttons
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
      // Reveal search input
      const searchBox = document.getElementById("inline-loc-search-box");
      if (searchBox) searchBox.classList.remove("hidden");
      if (!weatherData) {
        fetchLiveWeather(currentLocation.lat, currentLocation.lon);
      }
    });
  }

  // Stepper Header Buttons
  document.querySelectorAll(".step-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const s = parseInt(btn.getAttribute("data-step") || "1") as StepId;
      navigateToStep(s);
    });
  });

  // Stepper Bottom Prev/Next
  const btnPrev = document.getElementById("btn-step-prev");
  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      if (currentStep > 1) {
        navigateToStep((currentStep - 1) as StepId);
      }
    });
  }

  const btnNext = document.getElementById("btn-step-next");
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      if (currentStep < 6) {
        navigateToStep((currentStep + 1) as StepId);
      }
    });
  }

  // Language Toggle
  const btnEn = document.getElementById("lang-en");
  const btnKn = document.getElementById("lang-kn");

  if (btnEn && btnKn) {
    btnEn.addEventListener("click", () => {
      currentLang = 'en';
      const appContainer = document.getElementById("app");
      if (appContainer) renderDashboardShell(appContainer, currentLang);
      bindGlobalListeners();
      const modal = document.getElementById("modal-location-entry");
      if (modal) modal.classList.add("hidden"); // already visited
      navigateToStep(currentStep);
    });

    btnKn.addEventListener("click", () => {
      currentLang = 'kn';
      const appContainer = document.getElementById("app");
      if (appContainer) renderDashboardShell(appContainer, currentLang);
      bindGlobalListeners();
      const modal = document.getElementById("modal-location-entry");
      if (modal) modal.classList.add("hidden"); // already visited
      navigateToStep(currentStep);
    });
  }

  // PDF Export
  const btnPdf = document.getElementById("btn-export-pdf");
  if (btnPdf) {
    btnPdf.addEventListener("click", () => {
      window.print();
    });
  }

  // History Modal
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
            listContainer.innerHTML = records.map((r: any) => `
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
  const inputSearch = document.getElementById("input-search-place") as HTMLInputElement;
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
          resultsContainer.innerHTML = results.map((r: any) => `
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
      renderCurrentStepView();
    });
  }
}

function bindSoilStepListeners() {
  const fileInput = document.getElementById("input-soil-file") as HTMLInputElement;
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
      renderCurrentStepView();
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
      // Focus on manual soil selector
      const select = document.getElementById("input-soil-type-select") as HTMLSelectElement;
      if (select) select.focus();
    });
  }

  // Sync inputs
  const inN = document.getElementById("input-soil-n") as HTMLInputElement;
  const inP = document.getElementById("input-soil-p") as HTMLInputElement;
  const inK = document.getElementById("input-soil-k") as HTMLInputElement;
  const inPh = document.getElementById("input-soil-ph") as HTMLInputElement;
  const inType = document.getElementById("input-soil-type-select") as HTMLSelectElement;

  if (inN) inN.addEventListener("input", () => { soilN = parseFloat(inN.value) || 85; });
  if (inP) inP.addEventListener("input", () => { soilP = parseFloat(inP.value) || 45; });
  if (inK) inK.addEventListener("input", () => { soilK = parseFloat(inK.value) || 42; });
  if (inPh) inPh.addEventListener("input", () => { soilPh = parseFloat(inPh.value) || 6.8; });
  if (inType) inType.addEventListener("change", () => { soilType = inType.value; });
}

function bindFarmStepListeners() {
  const inLand = document.getElementById("input-farm-land") as HTMLInputElement;
  const slideLand = document.getElementById("slider-farm-land") as HTMLInputElement;
  const inBudget = document.getElementById("input-farm-budget") as HTMLInputElement;
  const slideBudget = document.getElementById("slider-farm-budget") as HTMLInputElement;
  const selectIrr = document.getElementById("select-farm-irrigation") as HTMLSelectElement;

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
