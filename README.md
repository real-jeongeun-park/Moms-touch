# 엄마손맛 (Moms-touch)

> 할머니·엄마의 손맛 레시피를 **말로 들려주면** AI가 정리해주고, 지역별로 공유·따라할 수 있는 모바일 앱

집안 어른들의 입에서 입으로 전해지던 레시피를 디지털로 보존하자는 아이디어에서 시작했습니다.
복잡한 입력 없이 **음성으로 말하거나 채팅**만 하면, AI가 재료·난이도·소요시간·조리 단계를 자동으로 구조화해 레시피로 만들어 줍니다.

<img width="2560" height="1440" alt="일확천금팀_1" src="https://github.com/user-attachments/assets/8bfd3119-e76b-46f0-a5a5-ea55288375d3" />
<img width="2560" height="1440" alt="일확천금팀_10" src="https://github.com/user-attachments/assets/6a075007-4a93-4b1d-b31a-8478fe31de85" />
<img width="2560" height="1440" alt="일확천금팀_21" src="https://github.com/user-attachments/assets/30946d94-e5f6-4462-adca-b6ac542f7443" />
<img width="2560" height="1440" alt="일확천금팀_22" src="https://github.com/user-attachments/assets/62ffac89-b522-4156-936e-2b21f6219184" />
<img width="2560" height="1440" alt="일확천금팀_23" src="https://github.com/user-attachments/assets/f9f4e635-ea0f-418e-8756-1b56dc3897af" />
<img width="2560" height="1440" alt="일확천금팀_25" src="https://github.com/user-attachments/assets/a573e2d2-9b42-4e6d-9987-dec746fc66c0" />

---

## 주요 기능

- **레시피 만들기**
  - **음성 녹음** → Google STT로 받아쓰기 → GPT가 레시피로 변환
  - **채팅 입력** → GPT가 레시피로 변환
  - 변환된 레시피를 **검토 화면에서 직접 수정**(제목·설명·지역·난이도·소요시간·재료·단계) 후 업로드
- **지역별 레시피** — 지도에서 지역을 골라 그 지역의 손맛 레시피 탐색
- **맞춤 추천** — 온보딩에서 받은 선호(지역·난이도)를 바탕으로 추천 TOP 3
- **따라하기** — 단계별 가이드 + **TTS 음성 안내**, 완료 시 "레시피 도전자" 집계
- **좋아요(하트)** — 마음에 든 레시피 저장, 마이페이지에서 모아보기
- **프로필** — 내가 만든 레시피 / 좋아요 누른 레시피, 통계(레시피 수 · 도전자 수 · 받은 좋아요 수)

---

## 기술 스택

### 프론트엔드 (`/frontend`)
| 항목 | 사용 기술 |
|---|---|
| 프레임워크 | React Native 0.81 + **Expo ~54** |
| 언어 | TypeScript |
| 네비게이션 | React Navigation (Native Stack + Bottom Tabs) |
| 로컬 저장 | AsyncStorage (로그인 유저 정보) |
| 오디오 | expo-audio / expo-av (녹음·재생) |
| 폰트 | NanumHuman (expo-font) |

### 백엔드 (`/backend`)
| 항목 | 사용 기술 |
|---|---|
| 프레임워크 | **FastAPI** (Python) |
| DB | PostgreSQL 16 (Docker) + psycopg2, **커넥션 풀** |
| AI 레시피 변환 | OpenAI **GPT-4o-mini** |
| 음성 인식(STT) | Google Cloud Speech-to-Text + ffmpeg |
| 음성 합성(TTS) | Google Cloud Text-to-Speech |
| 개발용 터널 | ngrok |

---

## 프로젝트 구조

```
Moms-touch/
├── frontend/                  # React Native (Expo) 앱
│   ├── App.tsx                # 네비게이터 / 폰트 / 초기 라우팅
│   ├── screens/               # 화면 컴포넌트
│   └── assets/                # 폰트·이미지
│
└── backend/                   # FastAPI 서버
    ├── app/
    │   ├── main.py            # 앱 진입점 (라우터 등록)
    │   ├── db.py              # DB 커넥션 풀 (get_conn / put_conn)
    │   └── api/
    │       ├── auth.py        # 회원가입 / 로그인 / 선호 설정
    │       ├── recipe.py      # 레시피 생성·조회·좋아요·추천·프로필
    │       ├── speech.py      # 음성 → 텍스트 (STT)
    │       └── speak.py       # 텍스트 → 음성 (TTS)
    ├── docker-compose.yml     # PostgreSQL 컨테이너
    ├── init_db.sql            # 테이블 스키마
    └── sample_data.sql        # 샘플 데이터
```

### 화면 흐름

```
[앱 시작] ProfileSetup(닉네임) → OnboardingPreferences(선호) → Main

[탭] 레시피 만들기
  → RecipeCreate (말하기 / 채팅 선택)
     ├ (말하기) RecipeVoice → RecipeRecording → RegionSelect
     │            → RecipeProcessing → RecipeReview(수정) → RecipeUploadDone
     └ (채팅)   RecipeChat → RecipeReview → RecipeUploadDone

[탭] 홈 / 손맛 보관함(지도) / 마이페이지
  → RecipeDetail → RecipeStart → RecipeFollow(단계별+TTS) → RecipeComplete
  → UserProfile (작성자 프로필)
```

---

## 데이터베이스 스키마

| 테이블 | 설명 |
|---|---|
| `users` | 사용자(닉네임 기반) |
| `user_preferences` | 선호 지역 / 음식 종류 / 난이도 |
| `recipes` | 레시피 (재료는 jsonb, `use_count` = 도전자 수) |
| `recipe_steps` | 레시피 조리 단계 |
| `recipe_follows` | 좋아요(하트) 관계 |

전체 스키마는 [`backend/init_db.sql`](backend/init_db.sql) 참고.

---

## 실행 방법

### 사전 준비
- Node.js v18+, Git
- 핸드폰에 **Expo Go** 앱 설치
- Python 3.10+, Docker (백엔드용)
- ffmpeg (STT 변환용)

### 1) 백엔드

```bash
cd backend

# 1. DB 컨테이너 실행
docker compose up -d

# 2. 의존성 설치
pip install fastapi uvicorn psycopg2-binary python-dotenv openai \
            google-cloud-speech ffmpeg-python requests

# 3. .env 작성 (아래 환경변수 참고)

# 4. 스키마 적용 (최초 1회)
#    init_db.sql 을 DB에 실행

# 5. 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**`backend/.env`** (Git에 올리지 않음 / 키 노출 주의)
```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/moms_touch
OPENAI_API_KEY=sk-...
CREDENTIALS_PATH=./google_credentials.json   # Google Cloud 서비스 계정 키
```

### 2) 프론트엔드

```bash
cd frontend
npm install
npx expo start          # 또는 폰이 다른 네트워크면: npx expo start --tunnel
```
터미널 QR을 Expo Go로 스캔하면 실행됩니다.

**`frontend/.env`**
```env
EXPO_PUBLIC_API_URL=https://<백엔드 주소>   # 로컬은 ngrok 등으로 외부 노출 필요
```

>  실기기(폰)에서 테스트하려면 백엔드를 ngrok 등으로 외부에 노출하고, 그 주소를 `EXPO_PUBLIC_API_URL`에 넣어야 합니다.

---

## API 요약

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/auth/signup` | 회원가입(닉네임) |
| POST | `/auth/login` | 로그인 |
| POST | `/preferences` | 선호 설정 저장 |
| POST | `/speech-to-text` | 음성 파일 → 텍스트 |
| POST | `/text-to-speech` | 텍스트 → 음성(MP3) |
| POST | `/generate-recipe` | 텍스트 → AI 레시피 변환 |
| POST | `/save-recipe` | 레시피 저장 |
| GET | `/recipes` | 전체/지역별 레시피 목록 |
| GET | `/recipes/recommended` | 맞춤 추천 |
| GET | `/recipes/{id}` | 레시피 상세 |
| POST | `/recipes/{id}/use` | 따라하기 완료(도전자 +1) |
| POST · DELETE | `/recipe-follows` | 좋아요 추가 / 취소 |
| GET | `/users/{id}/recipes/made` | 내가 만든 레시피 |
| GET | `/users/{id}/recipes/followed` | 좋아요 누른 레시피 |
| GET | `/users/by-nickname/{nickname}/profile` | 유저 프로필(레시피·통계) |

---

## 참고

- `backend/.env`, `frontend/.env`, `google_credentials.json` 등 **민감 정보는 Git에 올리지 않습니다.**
- 폰트(`NanumHuman*.ttf`)와 Google Cloud 키는 저작권/보안상 별도 공유가 필요할 수 있습니다.
