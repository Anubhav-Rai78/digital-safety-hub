import os
import uvicorn
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, find_dotenv
from google import genai
from google.genai import types

# --- 1. SECURE KEY DISCOVERY ---
env_path = find_dotenv()
if not env_path:
    env_path = Path(__file__).resolve().parent.parent / ".env"

load_dotenv(env_path)
api_key = os.getenv("GEMINI_API_KEY")

print(f"\n--- AEGIS CORE DIAGNOSTICS ---")
if api_key and api_key.startswith("AIza"):
    print(f"✅ VAULT OPENED: Key loaded from {env_path}")
else:
    print(f"❌ FATAL: Could not find .env or GEMINI_API_KEY at {env_path}")
print(f"------------------------------\n")

if not api_key:
    raise ValueError("System Shutdown: API Key missing.")

# --- 2. APP SETUP ---
app = FastAPI(title="Aegis Fortress")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(
    api_key=api_key,
    http_options=types.HttpOptions(api_version="v1")
)

# --- 3. AEGIS SYSTEM PROMPT ---
SYSTEM_INSTRUCTION = (
    "You are the Aegis Digital Safety Guardian for India. Your goal is to protect users "
    "from digital fraud (UPI, KYC, Job scams, etc.).\n\n"
    "RESPONSE RULES:\n"
    "1. If the user provides a suspicious message/SMS/link: Start with '🚨 VERDICT: SCAM' "
    "or '✅ VERDICT: SAFE'. Then provide a 1-2 sentence explanation of the red flags.\n"
    "2. If the user asks for advice or a general question (e.g., 'How to stay safe?'): "
    "Do NOT just say 'Safe'. Provide 3-4 bullet points of high-impact advice specific to India.\n"
    "3. Tone: Professional, protective, and concise. Use emojis for clarity."
)

@app.get("/api/analyze")
async def analyze_text(text: str):
    try:
        # Combine instructions with user input
        full_prompt = f"{SYSTEM_INSTRUCTION}\n\nUSER INPUT: {text}"
        
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=full_prompt
        )
        
        return {"reply": response.text or "Aegis analysis was inconclusive."}

    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg:
            return {"reply": "🛡️ Shield Cooling Down: Quota limit reached. Please wait 60s."}
        return {"reply": f"Shield Error: {error_msg}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)