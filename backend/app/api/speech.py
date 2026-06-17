from fastapi import APIRouter, UploadFile, File
from google.cloud import speech
from google.oauth2 import service_account
from dotenv import load_dotenv
import ffmpeg
import tempfile
import os

router = APIRouter()

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

credentials = service_account.Credentials.from_service_account_file(
    os.getenv("CREDENTIALS_PATH")
)

@router.post("/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)):
    print("=== 요청 들어옴 ===")
    client = speech.SpeechClient(credentials=credentials)
    
    audio_data = await file.read()
    print(f"파일 크기: {len(audio_data)} bytes")

    with tempfile.NamedTemporaryFile(suffix='.m4a', delete=False) as tmp_m4a:
        tmp_m4a.write(audio_data)
        tmp_m4a_path = tmp_m4a.name

    tmp_wav_path = tmp_m4a_path.replace('.m4a', '.wav')

    try:
        print("ffmpeg 변환 시작...")
        ffmpeg.input(tmp_m4a_path).output(tmp_wav_path, ar=16000, ac=1).run(quiet=False, overwrite_output=True)
        print("ffmpeg 완료")

        with open(tmp_wav_path, 'rb') as f:
            wav_data = f.read()
        print(f"wav 크기: {len(wav_data)} bytes")

        audio = speech.RecognitionAudio(content=wav_data)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code="ko-KR",
            audio_channel_count=1,
        )

        print("Google STT 요청 중...")
        response = client.recognize(config=config, audio=audio)
        print("Google STT 완료")

        transcript = ""
        for result in response.results:
            transcript += result.alternatives[0].transcript

        print(f"결과: {transcript}")
        return {"text": transcript}

    except Exception as e:
        print(f"에러 발생: {e}")
        raise

    finally:
        os.unlink(tmp_m4a_path)
        if os.path.exists(tmp_wav_path):
            os.unlink(tmp_wav_path)