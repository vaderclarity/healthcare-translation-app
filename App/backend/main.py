from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from googletrans import Translator

app = FastAPI()

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

translator = Translator()

class TranslationRequest(BaseModel):
    text: str
    target_language: str

@app.get("/")
def home():
    return {"message": "Healthcare Translation API is running!"}

@app.post("/translate")
def translate_text(request: TranslationRequest):
    translated = translator.translate(request.text, dest=request.target_language)
    return {"translated_text": translated.text}