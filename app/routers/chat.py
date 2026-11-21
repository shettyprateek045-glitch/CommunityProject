"""
Krishi Mitra AI Chatbot Router: Implements POST /api/chat
Empowers farmers with contextual agronomic advice, navigation triggers, and multilingual (English & Kannada) dialogue.
"""

import os
import json
import httpx
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api", tags=["AI Chatbot"])

class ChatRequest(BaseModel):
    message: str = Field(..., description="Farmer prompt or question")
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
    type: str  # e.g., "navigate", "open_modal", "filter"
    target: str  # e.g., "disease-scanner", "schemes", "step-2", "step-6"

class ChatResponse(BaseModel):
    status: str = "success"
    reply: str
    action: Optional[ChatAction] = None
    suggestions: List[str] = []

SYSTEM_PROMPT_TEMPLATE = """You are "Krishi Mitra" (ಕೃಷಿ ಮಿತ್ರ), a friendly, expert agronomy and agricultural planning AI assistant for the Farmer Decision Dashboard.

WEBSITE OVERVIEW & WORKFLOW:
The application is a precision agricultural decision platform running 6 sequential planning steps:
1. Location: Pinpoint field using GPS or map pinning. Automatically detects reverse-geocoded village, district, state, and coordinates.
2. Weather: Real-time satellite micro-climate from Open-Meteo, 7-day FAO-56 irrigation scheduler, and 12-month climate baseline chart.
3. Soil & Fertilizer: Soil test entry (N, P, K, pH) or AI mobile soil photo scanner with automatic nutrient estimation, plus custom fertilizer calculator (Urea, DAP, MOP bag counts and split-dosage formula).
4. Farm Profile: Farm size in acres, seasonal budget (INR), and irrigation system (drip, sprinkler, borewell, canal, rainfed).
5. Last Crop: Crop rotation memory to ensure nitrogen fixation and prevent soil-borne pest resurgence.
6. Recommendations: Multi-factor agronomic ranking yielding the Top 3 recommended crops with suitability confidence %, factor importance (soil, rainfall, temp, budget, irrigation), drought/flood/price risk scores, break-even yield and prices, and a 30-day Mandi market price trend with forecast.
Additional Features:
- Foliar Leaf Disease Scanner (top nav): YOLOv11 detector identifying blight, spots, and foliage health with treatment guidance.
- Govt Schemes (top nav): Official Central & Karnataka State agricultural subsidies (PM-KISAN, PMFBY, Krishi Bhagya, FRUITS, PMKSY) with direct links.
- Trilingual toggle: English, Kannada, and Hindi.

FARMER'S CURRENT SESSION CONTEXT:
{farmer_context_json}

RULES & GUIDELINES:
1. Language: Answer in {language_name}. If Kannada is selected, speak in warm, clear conversational Kannada.
2. Simplicity: Keep explanations brief, clear, and actionable for farmers. Avoid dense academic jargon.
3. Uncertainty: If you do not have sufficient information, say: "I'm not sure, please consult your local agriculture officer."
4. Accuracy: Never invent mandi prices or scheme subsidy amounts that are not in the context or official portal.
5. Navigation: If the farmer asks to see or open a tool (e.g. leaf disease scanner, weather, govt schemes, recommendations), indicate this in your response so the UI can navigate.
"""

def generate_intelligent_fallback_response(query: str, lang: str, context: Optional[Dict[str, Any]] = None) -> tuple[str, Optional[ChatAction], List[str]]:
    """Rule-based agronomic inference engine when external LLM API key is not configured."""
    q = query.lower().strip()
    is_kn = (lang == "kn")
    context = context or {}

    acres = context.get("acres") or context.get("land_acres") or 3.0
    loc = context.get("district") or context.get("village") or "Karnataka"
    top_crops = context.get("top_crops") or []
    top_crop_name = top_crops[0].get("name") if len(top_crops) > 0 else "Maize"
    suit_pct = top_crops[0].get("suitability_pct") if len(top_crops) > 0 else 75

    action = None

    # Navigation intents
    if any(k in q for k in ["disease", "leaf", "pest", "scanner", "ರೋಗ", "ಎಲೆ"]):
        action = ChatAction(type="open_modal", target="disease-scanner")
        if is_kn:
            reply = "ಖಂಡಿತ! ಎಲೆ ರೋಗ ತಪಾಸಣೆ (Leaf Disease Scanner) ವಿಂಡೋವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮ ಬೆಳೆಯ ಎಲೆಯ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, AI ರೋಗ ಮತ್ತು ಪರಿಹಾರಗಳನ್ನು ತಿಳಿಸುತ್ತದೆ."
        else:
            reply = "Opening the Leaf Disease Scanner modal now. Please upload a clear photo of your crop leaf to inspect for blight, leaf spots, and get treatment steps."
        suggestions = ["How does this work?", "Which fertilizer?", "Govt schemes"]
        return reply, action, suggestions

    if any(k in q for k in ["scheme", "subsidy", "subsidies", "ಯೋಜನೆ", "ಸಬ್ಸಿಡಿ", "fruits", "pm kisan"]):
        action = ChatAction(type="open_modal", target="schemes")
        if is_kn:
            reply = "ಸರ್ಕಾರಿ ಕೃಷಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿಗಳ ವಿಂಡೋವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ. ಇಲ್ಲಿ ಪಿಎಂ-ಕಿಸಾನ್, ಬೆಳೆ ವಿಮೆ (PMFBY), ಮತ್ತು ಕರ್ನಾಟಕ ಕೃಷಿ ಭಾಗ್ಯ ಹಾಗೂ FRUITS ಪೋರ್ಟಲ್ ವಿವರಗಳಿವೆ."
        else:
            reply = "Opening Verified Government Schemes & Subsidies. You can explore PM-KISAN, PMFBY crop insurance, PMKSY drip subsidies, and Karnataka FRUITS portal with official links."
        suggestions = ["Explain my result", "Upload leaf photo", "Which fertilizer?"]
        return reply, action, suggestions

    if any(k in q for k in ["weather", "rain", "temperature", "ಹವಾಮಾನ", "ಮಳೆ", "ಬಿಸಿಲು"]):
        action = ChatAction(type="navigate", target="step-2")
        if is_kn:
            reply = f"{loc} ಪ್ರದೇಶದ ಲೈವ್ ಹವಾಮಾನ ಮತ್ತು 7 ದಿನಗಳ ಹನಿ ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಹಂತ 2 ರಲ್ಲಿ ವೀಕ್ಷಿಸಬಹುದು."
        else:
            reply = f"Navigating to Step 2 (Weather). Here you can inspect live satellite temperature, humidity, rain forecast, and FAO-56 smart irrigation schedules for {loc}."
        suggestions = ["Which fertilizer?", "Explain my result", "Govt schemes"]
        return reply, action, suggestions

    if any(k in q for k in ["recommend", "crop", "result", "why", "ಬೆಳೆ", "ಶಿಫಾರಸು", "ಯಾವ ಬೆಳೆ"]):
        action = ChatAction(type="navigate", target="step-6")
        if is_kn:
            reply = f"ನಿಮ್ಮ {acres} ಎಕರೆ ಜಮೀನಿಗೆ {top_crop_name} ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ ({suit_pct}% ಸೂಕ್ತತೆ). ಇದು ನಿಮ್ಮ ಮಣ್ಣಿನ ಪ್ರಕಾರ, ಹವಾಮಾನ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಲಾಭಾಂಶಕ್ಕೆ ತಕ್ಕಂತೆ ಮೊದಲ ಸ್ಥಾನದಲ್ಲಿದೆ."
        else:
            reply = f"Based on your soil nutrients, local micro-climate, and budget for {acres} acres in {loc}, {top_crop_name} is your top recommendation ({suit_pct}% suitability) with optimal net profit margins."
        suggestions = ["Which fertilizer?", "Crop calendar", "Govt schemes"]
        return reply, action, suggestions

    if any(k in q for k in ["fertilizer", "urea", "dap", "mop", "ಗೊಬ್ಬರ", "ಯೂರಿಯಾ", "ಡಿಎಪಿ"]):
        action = ChatAction(type="navigate", target="step-3")
        if is_kn:
            reply = f"ಹಂತ 3 ರಲ್ಲಿ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ರಸಗೊಬ್ಬರ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ನೋಡಿ. ನಿಮ್ಮ {acres} ಎಕರೆಗೆ ಯೂರಿಯಾ, DAP ಮತ್ತು MOP ಚೀಲಗಳ ನಿಖರ ಲೆಕ್ಕಾಚಾರ ಲಭ್ಯವಿದೆ."
        else:
            reply = f"For your {acres} acres, consult the Fertilizer Calculator on Step 3. It calculates exact commercial 50kg bags (Urea, DAP, MOP) and gives split-dosage schedules."
        suggestions = ["Explain my result", "Upload leaf photo", "Govt schemes"]
        return reply, action, suggestions

    if any(k in q for k in ["calendar", "sowing", "harvest", "ವೇಳಾಪಟ್ಟಿ", "ಬಿತ್ತನೆ"]):
        action = ChatAction(type="navigate", target="step-6")
        if is_kn:
            reply = f"{top_crop_name} ಬೆಳೆಗೆ ಬಿತ್ತನೆಯಿಂದ ಕೊಯ್ಲಿನವರೆಗೆ ಸಂಪೂರ್ಣ ಬೆಳವಣಿಗೆ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಮುಂದಿನ ಋತುವಿನ ಬೆಳೆ ಪರಿವರ್ತನೆ ಸಲಹೆಗಳು ಹಂತ 6 ರಲ್ಲಿದೆ."
        else:
            reply = f"In Step 6, each recommended crop provides a complete growth calendar with sowing windows, fertilizer stages, critical irrigation stages, and crop rotation advice."
        suggestions = ["Which fertilizer?", "Govt schemes", "Upload leaf photo"]
        return reply, action, suggestions

    # Default / General assistance
    if is_kn:
        reply = "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಮಿತ್ರ. ಬೆಳೆ ಶಿಫಾರಸು, ಗೊಬ್ಬರದ ಲೆಕ್ಕಾಚಾರ, ಹವಾಮಾನ, ಎಲೆ ರೋಗ ತಪಾಸಣೆ ಅಥವಾ ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿಗಳ ಬಗ್ಗೆ ನೀವು ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು."
    else:
        reply = "Hello! I am Krishi Mitra, your farming decision assistant. Ask me about your crop recommendations, fertilizer calculations, weather alerts, disease diagnostics, or government schemes."

    suggestions = ["How does this work?", "Explain my result", "Which fertilizer?", "Govt schemes", "Upload leaf photo"]
    return reply, action, suggestions

@router.post("/chat", response_model=ChatResponse)
async def api_chat(req: ChatRequest):
    """
    POST /api/chat
    Interacts with Krishi Mitra AI assistant using either configured LLM API (Gemini/OpenAI) or local agronomic inference engine.
    """
    user_query = req.message.strip()
    if not user_query:
        raise HTTPException(status_code=400, detail="Empty message")

    lang = req.get_lang().lower()
    language_name = "Kannada (ಕನ್ನಡ)" if lang == "kn" else ("Hindi (हिंदी)" if lang == "hi" else "English")
    context = req.get_context()

    # Check for LLM API keys in environment
    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")

    if gemini_key:
        try:
            prompt_content = f"{SYSTEM_PROMPT_TEMPLATE.format(farmer_context_json=json.dumps(context, indent=2), language_name=language_name)}\n\nUser Question: {user_query}"
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt_content}]}],
                "generationConfig": {"temperature": 0.3, "maxOutputTokens": 300}
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    # Detect navigation intent
                    _, action, suggestions = generate_intelligent_fallback_response(user_query, lang, context)
                    return ChatResponse(reply=text, action=action, suggestions=suggestions)
        except Exception as e:
            print(f"[CHAT LLM ERROR] {e}")

    # Fallback / Built-in Agronomic Engine
    reply, action, suggestions = generate_intelligent_fallback_response(user_query, lang, context)
    return ChatResponse(reply=reply, action=action, suggestions=suggestions)
