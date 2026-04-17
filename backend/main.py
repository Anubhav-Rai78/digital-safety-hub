import os
import uvicorn
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, find_dotenv
from google import genai
from google.genai import types
from supabase import create_client, Client

# --- 1. SECURE KEY DISCOVERY ---
env_path = find_dotenv()
if not env_path:
    env_path = Path(__file__).resolve().parent.parent / ".env"

load_dotenv(env_path)

# Credentials
api_key = os.getenv("GEMINI_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

print(f"\n--- AEGIS CORE DIAGNOSTICS ---")
if all([api_key, supabase_url, supabase_key]):
    print(f"✅ VAULT OPENED: Gemini Link & Supabase Database Connected.")
else:
    print(f"❌ FATAL: Credentials missing in .env.")
print(f"------------------------------\n")

if not api_key:
    raise ValueError("System Shutdown: API Key missing.")

# --- 2. APP & CLIENT SETUP ---
app = FastAPI(title="Aegis Fortress")

# CORS is vital for your frontend to talk to Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Client
client = genai.Client(
    api_key=api_key,
    http_options=types.HttpOptions(api_version="v1")
)

# Database Client
supabase_db: Client = create_client(supabase_url, supabase_key)

# --- 3. SYSTEM INSTRUCTION ---
SYSTEM_INSTRUCTION = (
    "You are the Aegis Digital Safety Guardian for India. Protect users from "
    "UPI, KYC, and Job scams. Rules:\n"
    "1. For suspicious text: Provide '🚨 VERDICT: SCAM' or '✅ VERDICT: SAFE' + 1 sentence explanation.\n"
    "2. For safety questions: Provide 3-4 actionable tips for India.\n"
    "3. Be professional and concise."
)

# --- 4. ROUTES ---

@app.get("/")
async def root():
    """Health check route for UptimeRobot and Render"""
    return {"message": "Aegis Shield is Online", "status": "Secure"}

@app.get("/api/analyze")
async def analyze_text(text: str):
    try:
        # Step A: AI Analysis
        full_prompt = f"{SYSTEM_INSTRUCTION}\n\nUSER INPUT: {text}"
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=full_prompt
        )
        ai_reply = response.text or "Analysis inconclusive."

        # Step B: Persistence
        try:
            verdict_label = "SCAM" if "🚨" in ai_reply else "SAFE"
            supabase_db.table("scam_reports").insert({
                "content": text,
                "verdict": verdict_label,
                "explanation": ai_reply,
                "category": "Direct User Inquiry"
            }).execute()
        except Exception as db_err:
            print(f"⚠️ DB Error: {db_err}")

        return {"reply": ai_reply}

    except Exception as e:
        if "429" in str(e):
            return {"reply": "🛡️ Shield Cooling Down (Quota). Try again in 60s."}
        return {"reply": f"Shield Error: {str(e)}"}

if __name__ == "__main__":
    # Render uses the PORT environment variable, defaulting to 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)