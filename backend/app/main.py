import os
from fastapi import FastAPI
from dotenv import load_dotenv
from app.api.speech import router as speech_router
from app.api.recipe import router as recipe_router
from app.api.speak import router as speak_router
from app.api.auth import router as auth_router

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI()

app.include_router(speech_router)
app.include_router(recipe_router)
app.include_router(speak_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "Moms-touch API is running!"}