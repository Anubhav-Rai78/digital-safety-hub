"""
main.py — Digital Safety Hub API Entry Point
=============================================
Wires everything together. This file's only job:
  - Create the FastAPI app
  - Register middleware
  - Mount versioned routers
  - Handle startup diagnostics

All business logic lives in routers/.
All DB access lives in db.py.
All schemas live in models.py.
All settings live in config.py.
"""

import os
import uvicorn
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from dotenv import load_dotenv, find_dotenv

# ── 1. SECURE KEY DISCOVERY (same pattern as TechFest) ───────────────────────
_env_path = find_dotenv()
if not _env_path:
    _env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)

SUPABASE_URL  = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY  = os.getenv("SUPABASE_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# ── 2. STARTUP DIAGNOSTICS ───────────────────────────────────────────────────
print("\n--- DIGITAL SAFETY HUB — BACKEND DIAGNOSTICS ---")
if SUPABASE_URL and SUPABASE_KEY:
    print("✅ Supabase credentials loaded.")
else:
    print("❌ FATAL: SUPABASE_URL or SUPABASE_KEY missing.")
    print("   → Set them in .env (local) or Render environment variables (production).")
if GEMINI_API_KEY:
    print("✅ Gemini API key loaded. Aegis AI chat is active.")
else:
    print("⚠️  GEMINI_API_KEY missing. /api/analyze will return a safe fallback.")
print("─────────────────────────────────────────────────\n")

if not (SUPABASE_URL and SUPABASE_KEY):
    raise ValueError(
        "Startup aborted: SUPABASE_URL and SUPABASE_KEY must be set. "
        "Check your .env file or Render environment variables."
    )
# Gemini is optional — app starts without it, analyze route returns fallback message

# ── 3. SUPABASE CLIENT (singleton, only place it's created) ──────────────────
from supabase import create_client, Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── 3b. GEMINI CLIENT (optional — only created if key is present) ─────────────
# Gemini key lives in .env on Render. The browser never sees it.
# If key is missing, /api/analyze returns a safe "unavailable" message.
_gemini_client = None
if GEMINI_API_KEY:
    try:
        from google import genai
        from google.genai import types as genai_types
        _gemini_client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options=genai_types.HttpOptions(api_version="v1")
        )
        print("✅ Gemini client initialised.")
    except Exception as e:
        print(f"⚠️  Gemini client failed to initialise: {e}")
        _gemini_client = None

# Aegis system instruction — defines how Gemini responds for this app
_AEGIS_SYSTEM = (
    "You are the Aegis Digital Safety Guardian for India. "
    "Your job is to protect users from digital scams and fraud. Rules:\n"
    "1. For suspicious text/messages: Provide '🚨 VERDICT: SCAM' or '✅ VERDICT: SAFE' "
    "followed by a 1-2 sentence plain-English explanation.\n"
    "2. For safety questions: Provide 3-4 actionable tips specific to India "
    "(mention 1930 helpline or cybercrime.gov.in where relevant).\n"
    "3. Be concise, professional, and never alarmist.\n"
    "4. Never ask for personal details. Never provide legal or financial advice."
)

# ── 4. PYDANTIC MODELS (inline — no separate file needed for this scope) ─────
from pydantic import BaseModel, Field, field_validator
from typing import Optional

class QuizSubmitRequest(BaseModel):
    name: Optional[str] = Field(default=None, max_length=100)
    score: int = Field(..., ge=0, le=10)
    total: int = Field(default=10, ge=1, le=10)

    @field_validator("name")
    @classmethod
    def sanitise_name(cls, v):
        if v is not None:
            v = v.strip()
            return v if v else None
        return v

class TipSubmitRequest(BaseModel):
    scam_type: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = Field(default=None, max_length=500)

    @field_validator("scam_type")
    @classmethod
    def normalise_scam_type(cls, v):
        return v.strip().lower().replace(" ", "_").replace("-", "_")

    @field_validator("description")
    @classmethod
    def sanitise_description(cls, v):
        if v is not None:
            v = v.strip()
            return v if v else None
        return v

# ── 5. APP FACTORY ────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs once on startup — confirms DB reachability."""
    try:
        supabase.table("quiz_results").select("id").limit(1).execute()
        print("✅ Supabase connection verified on startup.")
    except Exception as e:
        print(f"⚠️  Supabase startup ping failed: {e}")
        print("   → App will still start. DB errors will surface per-request.")
    yield  # App runs here
    print("Digital Safety Hub API shutting down.")


app = FastAPI(
    title="Digital Safety Hub API",
    version="1.0.0",
    description=(
        "Public API for the Digital Safety Hub. "
        "Handles quiz result storage, aggregate stats, and community scam tip submissions. "
        "All routes versioned under /v1/. "
        "Any frontend, mobile app, or third-party tool can consume these endpoints."
    ),
    lifespan=lifespan,
)

# ── 6. CORS — Public API, any caller allowed (same as TechFest) ──────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 7. GLOBAL ERROR HANDLER ───────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catches any unhandled exception.
    Returns a clean JSON error instead of a 500 HTML page.
    Frontend api.js can read this reliably.
    """
    print(f"Unhandled error on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "An unexpected error occurred. Please try again."},
    )


# ── 8. ROUTES ─────────────────────────────────────────────────────────────────

# ── /v1/health ────────────────────────────────────────────────────────────────
@app.get("/v1/health", tags=["Health"])
async def health():
    """
    UptimeRobot keep-alive endpoint.
    Also used by api.js to check service availability before making calls.
    Returns 200 as long as the process is running.
    """
    return {
        "status": "ok",
        "service": "Digital Safety Hub API",
        "version": "1.0.0",
    }


# ── /v1/quiz/submit ───────────────────────────────────────────────────────────
@app.post("/v1/quiz/submit", tags=["Quiz"])
async def quiz_submit(data: QuizSubmitRequest):
    """
    Called by quiz.js after the user completes all 10 questions.
    Stores name (optional), score, and total in quiz_results table.
    Returns the inserted row ID so the frontend can confirm persistence.

    Supabase table required:
        CREATE TABLE quiz_results (
            id           BIGSERIAL PRIMARY KEY,
            name         TEXT,
            score        INTEGER NOT NULL,
            total        INTEGER NOT NULL DEFAULT 10,
            submitted_at TIMESTAMP DEFAULT NOW()
        );
    """
    try:
        payload = {
            "name": data.name or "Anonymous",
            "score": data.score,
            "total": data.total,
        }
        result = supabase.table("quiz_results").insert(payload).execute()
        inserted = result.data[0] if result.data else {}
        return {
            "status": "success",
            "message": f"Result saved. Score: {data.score}/{data.total}",
            "id": inserted.get("id"),
        }
    except Exception as e:
        print(f"⚠️  quiz_submit DB error: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": "Could not save result. Please try again."},
        )


# ── /v1/quiz/stats ────────────────────────────────────────────────────────────
@app.get("/v1/quiz/stats", tags=["Quiz"])
async def quiz_stats():
    """
    Called by quiz.js on the result screen to render the community chart.
    Returns: total takers, average score, and score distribution (0–10 → count).
    Frontend uses distribution to build the ApexCharts bar chart with "You" annotation.

    Falls back gracefully if DB is empty or unreachable.
    """
    try:
        rows = supabase.table("quiz_results").select("score").execute()

        if not rows.data:
            return {
                "total_takers": 0,
                "avg_score": 0.0,
                "distribution": {},
            }

        scores = [r["score"] for r in rows.data]
        total_takers = len(scores)
        avg_score = round(sum(scores) / total_takers, 1)

        # Build distribution map: score (0–10) → count
        distribution: dict[str, int] = {}
        for s in scores:
            key = str(s)
            distribution[key] = distribution.get(key, 0) + 1

        return {
            "total_takers": total_takers,
            "avg_score": avg_score,
            "distribution": distribution,
        }

    except Exception as e:
        print(f"⚠️  quiz_stats DB error: {e}")
        # Graceful degradation — frontend handles empty stats silently
        return {
            "total_takers": 0,
            "avg_score": 0.0,
            "distribution": {},
        }


# ── /v1/tips/submit ───────────────────────────────────────────────────────────
@app.post("/v1/tips/submit", tags=["Community Tips"])
async def tips_submit(data: TipSubmitRequest):
    """
    Called by scams.js when user clicks "I faced this" on a scam card.
    Stores the scam_type (normalised slug) and optional description.
    The count for that scam type increments automatically via /v1/tips/count.

    Supabase table required:
        CREATE TABLE community_tips (
            id           BIGSERIAL PRIMARY KEY,
            scam_type    TEXT NOT NULL,
            description  TEXT,
            submitted_at TIMESTAMP DEFAULT NOW()
        );
    """
    try:
        payload = {
            "scam_type": data.scam_type,
            "description": data.description or "",
        }
        supabase.table("community_tips").insert(payload).execute()
        return {
            "status": "success",
            "message": "Thank you for sharing your experience.",
            "scam_type": data.scam_type,
        }
    except Exception as e:
        print(f"⚠️  tips_submit DB error: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": "Could not save tip. Please try again."},
        )


# ── /v1/tips/count ────────────────────────────────────────────────────────────
@app.get("/v1/tips/count", tags=["Community Tips"])
async def tips_count():
    """
    Called by scams.js on page load to display "X people reported this" on each card.
    Returns a dict of scam_type slug → count.
    e.g. {"otp_scam": 47, "upi_fraud": 23, "phishing": 18, ...}

    Falls back gracefully — scam cards still render if this fails,
    just without the community count badge.
    """
    try:
        rows = supabase.table("community_tips").select("scam_type").execute()

        counts: dict[str, int] = {}
        for row in rows.data or []:
            key = row["scam_type"]
            counts[key] = counts.get(key, 0) + 1

        return {
            "counts": counts,
            "total": sum(counts.values()),
        }

    except Exception as e:
        print(f"⚠️  tips_count DB error: {e}")
        # Graceful degradation — scam cards still work without counts
        return {"counts": {}, "total": 0}


# ── /api/analyze ──────────────────────────────────────────────────────────────
@app.get("/api/analyze", tags=["Aegis AI"])
async def analyze(text: str):
    """
    Called by Aegis AI chat in main.js.
    Proxies the user's query to Gemini — the browser never touches Gemini directly.
    Gemini API key stays safely in .env on Render.

    Falls back gracefully if Gemini key is missing or quota is exceeded.
    """
    if not _gemini_client:
        return {
            "reply": (
                "⚠️ Aegis AI is not configured on this deployment. "
                "Add GEMINI_API_KEY to your Render environment variables to activate it."
            )
        }

    try:
        full_prompt = f"{_AEGIS_SYSTEM}\n\nUSER INPUT: {text}"
        response = _gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt
        )
        reply = response.text or "Analysis inconclusive. Please try again."

        # Persist to Supabase for audit trail (non-blocking — failure won't break the response)
        try:
            verdict_label = "SCAM" if "🚨" in reply else "SAFE"
            supabase.table("scam_reports").insert({
                "content": text,
                "verdict": verdict_label,
                "explanation": reply,
                "category": "Aegis AI Chat"
            }).execute()
        except Exception as db_err:
            print(f"⚠️  analyze audit log DB error (non-fatal): {db_err}")

        return {"reply": reply}

    except Exception as e:
        err_str = str(e)
        if "429" in err_str:
            return {"reply": "🛡️ Aegis is cooling down (API quota exceeded). Please wait 60 seconds and try again."}
        print(f"⚠️  Gemini analyze error: {e}")
        return JSONResponse(
            status_code=500,
            content={"reply": "⚠️ Aegis encountered an error. Please try again shortly."}
        )


# ── 9. ENTRY POINT ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Render injects PORT via environment variable. Default to 8000 locally.
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)