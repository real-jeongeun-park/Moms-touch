import os
from fastapi import FastAPI
from dotenv import load_dotenv
from app.api.speech import router as speech_router

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Moms-touch API"}

app.include_router(speech_router)