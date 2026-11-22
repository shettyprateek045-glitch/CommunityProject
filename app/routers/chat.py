"""
Krishi Mitra AI Voice & Chat Assistant Router: Implements POST /api/assistant and POST /api/chat.
Empowers farmers with contextual agronomic advice, speech-driven action execution, and multilingual dialogue.
"""

import os
import re
import json
import httpx
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api", tags=["AI Voice & Chat Assistant"])

class ChatRequest(BaseModel):
    message: str = Field(..., description="Farmer prompt, voice transcript or question")
    session_id: Optional[str] = "default"
    lang: Optional[str] = "en"
    language: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    session_context: Optional[Dict[str, Any]] = None

    def get_lang(self) -> str:
        return self.lang or self.language or "en"

    def get_context(self) -> Dict[str, Any]:
        return self.context or self.session_context or {}

class ChatAction(BaseModel):
    type: str  # "navigate", "open_modal", "search_location", "weather_tab"
    target: str  # "history", "share", "disease-scanner", "schemes", "step-2", "step-6", etc.

class ChatResponse(BaseModel):
    status: str = "success"
    reply: str
    action: Optional[ChatAction] = None
    suggestions: List[str] = []

SYSTEM_PROMPT_TEMPLATE = """You are "Krishi Mitra" (ಕೃಷಿ ಮಿತ್ರ), a friendly, expert agronomy and agricultural planning AI assistant for the Farmer Decision Dashboard.

WEBSITE OVERVIEW & WORKFLOW:
The application is a precision agricultural decision platform running 6 sequential planning steps:
1. Location: Pinpoint field using GPS or map pinning. Automatically detects reverse-geocoded village, district, state, and coordinates.
2. Weather: Real-time satellite micro-climate from Open-Meteo, 7-day FAO-56 irrigation scheduler, 12-month climate baseline, and 5-Year Historical Weather Analysis (2021-2025) with monthly rainfall/temp charts and extreme trends.
3. Soil & Fertilizer: Soil test entry (N, P, K, pH) or AI mobile soil photo scanner with automatic nutrient estimation, plus custom fertilizer calculator (Urea, DAP, MOP bag counts and split-dosage formula).
4. Farm Profile: Farm size in acres, seasonal budget (INR), and irrigation system (drip, sprinkler, borewell, canal, rainfed).
5. Last Crop: Crop rotation memory to ensure nitrogen fixation and prevent soil-borne pest resurgence.
6. Recommendations: Multi-factor agronomic ranking yielding the Top 3 recommended crops with suitability confidence %, factor importance (soil, rainfall, temp, budget, irrigation), drought/flood/price risk scores, break-even yield and prices, and a 30-day Mandi market price trend with forecast.

Additional Core Features:
- 5-Year Historical Weather Analysis: Open-Meteo archive dataset from 2021-2025 comparing rainfall and temperatures.
- Search & Recommendation History: Google History-style view grouped by Today, Yesterday, Last 7 Days, Earlier, with multi-select bulk delete, search/filters, and full run reopen.
- Public Crop Advisory Sharing: Read-only public share links (/share/<token>), WhatsApp/SMS/Email sharing, and PDF export.
- Foliar Leaf Disease Scanner (top nav): YOLOv11 detector identifying blight, spots, and foliage health with treatment guidance.
- Govt Schemes (top nav): Official Central & Karnataka State agricultural subsidies (PM-KISAN, PMFBY, Krishi Bhagya, FRUITS, PMKSY) with direct links.
- Trilingual toggle: English, Kannada, and Hindi.

FARMER'S CURRENT SESSION CONTEXT:
{farmer_context_json}

RULES & GUIDELINES:
1. Language: Answer in {language_name}. If Kannada is selected, speak in warm, clear conversational Kannada.
2. Simplicity & Brevity: Keep explanations simple, brief, and directly actionable for farmers. Avoid academic jargon.
3. Uncertainty: If you do not have sufficient information or are uncertain, you MUST say: "I'm not sure, please consult your local agriculture officer." (In Kannada: "ನನಗೆ ಖಚಿತವಿಲ್ಲ, ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿ ಅಥವಾ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರವನ್ನು (KVK) ಸಂಪರ್ಕಿಸಿ.")
4. Accuracy: Never invent mandi prices or scheme subsidy amounts that are not in the context or official portal.
5. Voice Actions: If the user asks to navigate, search a location, open history, share results, or view weather, include the specific action in your response.
"""

def generate_intelligent_fallback_response(query: str, lang: str, context: Optional[Dict[str, Any]] = None) -> tuple[str, Optional[ChatAction], List[str]]:
    """Rule-based agronomic inference engine when external LLM API key is not configured."""
    q = query.lower().strip()
    is_kn = (lang == "kn")
    context = context or {}

    acres = context.get("acres") or context.get("land_acres") or 3.0
    loc = context.get("district") or context.get("village") or context.get("display_name") or "Bengaluru"
    top_crops = context.get("top_crops") or []
    top_crop_name = top_crops[0].get("display_name") if len(top_crops) > 0 else "Maize"
    suit_pct = int(top_crops[0].get("suitability_pct", 85)) if len(top_crops) > 0 else 85

    action = None

    # 1. Voice Command: Location Search e.g. "Recommend a crop for Bengaluru / Dharwad / Belagavi"
    m_loc = re.search(r'(?:recommend.*for|crop for|crops for|in)\s+([a-zA-Z\s]{3,20})', q)
    if m_loc and not any(k in q for k in ["weather", "history", "share", "fertilizer", "maize"]):
        target_place = m_loc.group(1).strip().title()
        action = ChatAction(type="search_location", target=target_place)
        if is_kn:
            reply = f"{target_place} ಪ್ರದೇಶಕ್ಕೆ ಸ್ಥಳವನ್ನು ನಿಗದಿಪಡಿಸಿ ಸೂಕ್ತ ಬೆಳೆಗಳನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡುತ್ತಿದ್ದೇನೆ..."
        else:
            reply = f"Setting your farm location to {target_place} and calculating optimal crop recommendations..."
        return reply, action, ["What is the weather?", "Which fertilizer?", "Open history"]

    # 2. Voice Command: Open History
    if any(k in q for k in ["open history", "show history", "view history", "past runs", "ಇತಿಹಾಸ", "ಹಿಂದಿನ ದಾಖಲೆ"]):
        action = ChatAction(type="open_modal", target="history")
        if is_kn:
            reply = "ನಿಮ್ಮ ಹಿಂದಿನ ಎಲ್ಲಾ ಶಿಫಾರಸು ದಾಖಲೆಗಳು ಮತ್ತು ಇತಿಹಾಸದ ವಿಂಡೋವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ."
        else:
            reply = "Opening your search and recommendation history. Here you can filter past runs, reopen full results, or compare them side-by-side."
        return reply, action, ["Share my result", "What is the weather?", "Which fertilizer?"]

    # 3. Voice Command: Share Result
    if any(k in q for k in ["share my result", "share result", "share crop", "share", "ಹಂಚಿಕೊಳ್ಳಿ", "ಶೇರ್"]):
        action = ChatAction(type="open_modal", target="share")
        if is_kn:
            reply = "ನಿಮ್ಮ ಬೆಳೆ ಶಿಫಾರಸು ಫಲಿತಾಂಶವನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಶೇರ್ ವಿಂಡೋವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ. ಇಲ್ಲಿಂದ ನೀವು ವಾಟ್ಸಾಪ್, ಎಸ್‌ಎಂಎಸ್ ಅಥವಾ ಲಿಂಕ್ ಮೂಲಕ ಹಂಚಿಕೊಳ್ಳಬಹುದು."
        else:
            reply = "Opening the share card. You can share your top crop recommendations via WhatsApp, SMS, Email, or copy the read-only public link."
        return reply, action, ["Open history", "Download PDF", "What is the weather?"]

    # 4. Voice Command: 5-Year Weather & Rainfall Trends
    if any(k in q for k in ["last year's rainfall", "last year rainfall", "5-year", "5 year", "historical weather", "rainfall trends", "ಮಳೆ ದಾಖಲೆ", "ಹಿಂದಿನ ಮಳೆ"]):
        action = ChatAction(type="weather_tab", target="rainfall")
        if is_kn:
            reply = "ಹಂತ 2 ರಲ್ಲಿ 5-ವರ್ಷಗಳ ಐತಿಹಾಸಿಕ ಮಳೆ ವಿಶ್ಲೇಷಣೆ (೨೦೨೧–೨೦೨೫) ಮತ್ತು ಮುಂಗಾರು ಮಳೆಯ ಪ್ರವೃತ್ತಿಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ."
        else:
            reply = f"Displaying the 5-Year Historical Weather Analysis (2021–2025) for {loc}. The charts show annual rainfall lines, drought deviations, and monsoonal distribution."
        return reply, action, ["What is the weather this week?", "Which fertilizer?", "Recommend a crop"]

    # 5. Voice Command: Current Weather & Forecast
    if any(k in q for k in ["weather this week", "weather", "forecast", "rain", "temperature", "ಹವಾಮಾನ", "ಮಳೆ ಮುನ್ಸೂಚನೆ"]):
        action = ChatAction(type="navigate", target="step-2")
        if is_kn:
            reply = f"{loc} ಪ್ರದೇಶದ ಲೈವ್ ಹವಾಮಾನ ಮತ್ತು 7 ದಿನಗಳ ಹನಿ ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಹಂತ 2 ರಲ್ಲಿ ವೀಕ್ಷಿಸಬಹುದು."
        else:
            reply = f"Navigating to Step 2 (Weather). Here you can inspect live micro-climate, 7-day rainfall forecast, and FAO-56 irrigation advice for {loc}."
        return reply, action, ["Show last year's rainfall", "Which fertilizer?", "Open history"]

    # 6. Voice Command: Fertilizer advice e.g. "Which fertilizer for maize?"
    if any(k in q for k in ["fertilizer for maize", "fertilizer for corn", "ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ ಗೊಬ್ಬರ"]):
        action = ChatAction(type="navigate", target="step-3")
        if is_kn:
            reply = "ಮೆಕ್ಕೆಜೋಳ ಬೆಳೆಗೆ (ಪ್ರತಿ ಎಕರೆಗೆ): ಯೂರಿಯಾ ೧೧೦ ಕೆಜಿ (೩ ಕಂತುಗಳಲ್ಲಿ: ಬಿತ್ತನೆಗೆ ೧/೩, ಮೊಣಕಾಲು ಎತ್ತರಕ್ಕೆ ೧/೩, ಹೂವಾಡುವಾಗ ೧/೩), ಡಿಎಪಿ ೫೫ ಕೆಜಿ ಹಾಗೂ ಎಂಒಪಿ ೪೦ ಕೆಜಿ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ."
        else:
            reply = "For Maize (per acre): Apply Urea 110 kg (split in 3 doses: 1/3 basal at sowing, 1/3 at knee-high, 1/3 at tasseling), DAP 55 kg at sowing, and MOP 40 kg. More custom doses in Step 3."
        return reply, action, ["Explain my result", "Govt schemes", "Share my result"]

    if any(k in q for k in ["fertilizer", "urea", "dap", "mop", "ಗೊಬ್ಬರ", "ಯೂರಿಯಾ"]):
        action = ChatAction(type="navigate", target="step-3")
        if is_kn:
            reply = f"ಹಂತ 3 ರಲ್ಲಿ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ರಸಗೊಬ್ಬರ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ನೋಡಿ. ನಿಮ್ಮ {acres} ಎಕರೆಗೆ ಯೂರಿಯಾ, DAP ಮತ್ತು MOP ಚೀಲಗಳ ನಿಖರ ಲೆಕ್ಕಾಚಾರ ಲಭ್ಯವಿದೆ."
        else:
            reply = f"For your {acres} acres in {loc}, open Step 3 (Fertilizer Plan). It computes commercial 50kg bags (Urea, DAP, MOP) based on your soil test values."
        return reply, action, ["Which fertilizer for maize?", "Govt schemes", "Open history"]

    # 7. Disease scanner
    if any(k in q for k in ["disease", "leaf", "pest", "scanner", "ರೋಗ", "ಎಲೆ"]):
        action = ChatAction(type="open_modal", target="disease-scanner")
        if is_kn:
            reply = "ಎಲೆ ರೋಗ ತಪಾಸಣೆ (Leaf Disease Scanner) ವಿಂಡೋವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ. ಬೆಳೆಯ ಎಲೆಯ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, AI ರೋಗ ಮತ್ತು ಚಿಕಿತ್ಸೆಯನ್ನು ತಿಳಿಸುತ್ತದೆ."
        else:
            reply = "Opening the Leaf Disease Scanner modal. Please upload a clear photo of your crop leaf to inspect for blight, leaf spots, and get treatment steps."
        return reply, action, ["How does this work?", "Which fertilizer?", "Govt schemes"]

    # 8. Govt Schemes
    if any(k in q for k in ["scheme", "subsidy", "subsidies", "ಯೋಜನೆ", "ಸಬ್ಸಿಡಿ", "fruits", "pm kisan"]):
        action = ChatAction(type="open_modal", target="schemes")
        if is_kn:
            reply = "ಸರ್ಕಾರಿ ಕೃಷಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿಗಳ ವಿಂಡೋವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ. ಇಲ್ಲಿ ಪಿಎಂ-ಕಿಸಾನ್, ಬೆಳೆ ವಿಮೆ (PMFBY), ಮತ್ತು ಕರ್ನಾಟಕ ಕೃಷಿ ಭಾಗ್ಯ ಹಾಗೂ FRUITS ಪೋರ್ಟಲ್ ವಿವರಗಳಿವೆ."
        else:
            reply = "Opening Verified Government Schemes. You can explore PM-KISAN, PMFBY crop insurance, PMKSY drip subsidies, and Karnataka FRUITS portal."
        return reply, action, ["Share my result", "Open history", "Which fertilizer?"]

    # 9. Recommendation summary
    if any(k in q for k in ["recommend", "crop", "result", "why", "ಬೆಳೆ", "ಶಿಫಾರಸು"]):
        action = ChatAction(type="navigate", target="step-6")
        if is_kn:
            reply = f"ನಿಮ್ಮ {acres} ಎಕರೆ ಜಮೀನಿಗೆ {top_crop_name} ಅತ್ಯುತ್ತಮ ಶಿಫಾರಸಾಗಿದೆ ({suit_pct}% ಸೂಕ್ತತೆ). ಇದು ನಿಮ್ಮ ಮಣ್ಣು, ಸ್ಥಳೀಯ ಹವಾಮಾನ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಲಾಭಾಂಶಕ್ಕೆ ತಕ್ಕಂತೆ ಮೊದಲ ಸ್ಥಾನದಲ್ಲಿದೆ."
        else:
            reply = f"Based on your soil nutrients, local weather, and budget for {acres} acres in {loc}, {top_crop_name} is your top recommendation ({suit_pct}% match)."
        return reply, action, ["Which fertilizer for maize?", "Share my result", "Open history"]

    # 10. Uncertain / Consult Agricultural Officer Fallback
    if is_kn:
        reply = "ನನಗೆ ಖಚಿತವಿಲ್ಲ, ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿ ಅಥವಾ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರವನ್ನು (KVK) ಸಂಪರ್ಕಿಸಿ."
    else:
        reply = "I'm not sure, please consult your local agriculture officer or Krishi Vigyan Kendra (KVK)."

    suggestions = ["What is the weather this week?", "Show last year's rainfall", "Which fertilizer for maize?", "Open history", "Share my result"]
    return reply, action, suggestions

@router.post("/assistant", response_model=ChatResponse)
@router.post("/chat", response_model=ChatResponse)
async def api_assistant(req: ChatRequest):
    """
    POST /api/assistant & POST /api/chat
    Processes farmer queries and voice commands with context-aware responses and actionable execution.
    """
    user_query = req.message.strip()
    if not user_query:
        raise HTTPException(status_code=400, detail="Empty query message")

    lang = req.get_lang().lower()
    language_name = "Kannada (ಕನ್ನಡ)" if lang == "kn" else ("Hindi (हिंदी)" if lang == "hi" else "English")
    context = req.get_context()

    # Check for LLM API keys in environment (.env)
    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")

    if gemini_key:
        try:
            prompt_content = f"{SYSTEM_PROMPT_TEMPLATE.format(farmer_context_json=json.dumps(context, indent=2), language_name=language_name)}\n\nUser Question: {user_query}"
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt_content}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 250}
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    _, action, suggestions = generate_intelligent_fallback_response(user_query, lang, context)
                    return ChatResponse(reply=text, action=action, suggestions=suggestions)
        except Exception as e:
            print(f"[ASSISTANT LLM ERROR] {e}")

    # Fallback to Agronomic Knowledge Engine
    reply, action, suggestions = generate_intelligent_fallback_response(user_query, lang, context)
    return ChatResponse(reply=reply, action=action, suggestions=suggestions)

