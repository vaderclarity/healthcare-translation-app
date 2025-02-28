import openai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise RuntimeError("⚠️ Missing API key! Please set OPENAI_API_KEY in .env file.")

openai.api_key = OPENAI_API_KEY

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

class TranslationRequest(BaseModel):
    text: str
    target_language: str

@app.get("/")
def home():
    return {"message": "Healthcare Translation API with AI is running!"}

@app.post("/translate")
def translate_text(request: TranslationRequest):
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Input text cannot be empty.")

        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a medical translation AI. Ensure accurate medical terminology in translations."},
                {"role": "user", "content": f"Translate this text to {request.target_language}: {request.text}"}
            ],
            temperature=1.00,
            max_tokens=2048,
            request_timeout=30
        )

        translated_text = response["choices"][0]["message"]["content"].strip()
        return {"translated_text": translated_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation Error: {str(e)}")
