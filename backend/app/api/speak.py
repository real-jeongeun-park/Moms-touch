from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from google.oauth2 import service_account
from google.auth.transport.requests import Request
import requests
import os
import io
import base64

router = APIRouter()

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

credentials = service_account.Credentials.from_service_account_file(
    os.getenv("CREDENTIALS_PATH"),
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)

class TTSRequest(BaseModel):
    text: str
    voice: str = "ko-KR-Neural2-A"

@router.post("/text-to-speech")
async def text_to_speech(req: TTSRequest):
    try:
        if not credentials.valid or credentials.token is None:
            credentials.refresh(Request())

        url = "https://texttospeech.googleapis.com/v1/text:synthesize"

        payload = {
            "input": {"text": req.text},
            "voice": {
                "languageCode": "ko-KR",
                "name": req.voice,
            },
            "audioConfig": {
                "audioEncoding": "MP3",
                "speakingRate": 0.95,
                "pitch": 0.0,
            },
        }

        response = requests.post(
            url,
            json=payload,
            headers={"Authorization": f"Bearer {credentials.token}"}
        )
        response.raise_for_status()

        audio_bytes = base64.b64decode(response.json()["audioContent"])

    except Exception as e:
        print(f"❌ 에러: {e}")
        raise 

    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=tts.mp3"}
    )