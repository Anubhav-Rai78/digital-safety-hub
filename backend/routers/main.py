import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv() # Loads your .env keys

app = FastAPI()

# SECURITY: Allow your frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your GitHub Pages URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

# 1. THE HEARTBEAT (For UptimeRobot)
@app.get("/health")
async def health_check():
    return {"status": "online", "system": "Aegis Fortress"}

# 2. THE AI ANALYSIS ENDPOINT
@app.post("/analyze")
async def analyze_threat(data: dict):
    user_input = data.get("text")
    if not user_input:
        raise HTTPException(status_code=400, detail="No content provided")
    
    prompt = f"""
    Act as Aegis, a cyber-safety AI for India. 
    Analyze the following text for potential scams (UPI, KYC, Phishing):
    '{user_input}'
    Provide a verdict: SAFE, SUSPICIOUS, or SCAM. 
    Explain why in 2 simple sentences.
    """
    
    try:
        response = model.generate_content(prompt)
        return {"verdict": response.text}
    except Exception as e:
        return {"verdict": "Aegis logic error. Please manually verify."}