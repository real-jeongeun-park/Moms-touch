# 엄마손맛 (Moms-touch)

React Native + Expo 기반 레시피 앱입니다.

---

## 개발 환경 세팅

### 1. 필수 설치

- **Node.js** v18 이상 → https://nodejs.org
- **Git** → https://git-scm.com
- **Expo Go 앱** → 핸드폰에 설치 (App Store / Play Store에서 "Expo Go" 검색)

### 2. 저장소 클론

```bash
git clone https://github.com/insun9748/Moms-touch.git
cd Moms-touch
```

### 3. 패키지 설치

```bash
npm install
```

### 4. 앱 실행

```bash
npx expo start
```

터미널에 QR코드가 뜨면 핸드폰 Expo Go 앱으로 스캔하면 돼.

---

## 주요 라이브러리

| 라이브러리 | 용도 |
|---|---|
| `expo` ~54.0 | 앱 빌드/실행 |
| `react-native` 0.81 | UI 프레임워크 |
| `@react-navigation/native` | 화면 전환 |
| `@react-navigation/native-stack` | Stack 네비게이터 |
| `@react-navigation/bottom-tabs` | 하단 탭 바 |
| `react-native-safe-area-context` | SafeAreaView |
| `react-native-screens` | 네비게이션 성능 |
| `react-native-svg` | SVG (타이머 원형 그래프) |
| `expo-font` | 나눔휴먼 폰트 로드 |
| `expo-splash-screen` | 스플래시 스크린 |

---

## 폴더 구조

```
Moms-touch/
├── App.tsx                  # 네비게이터 설정
├── screens/
│   ├── Home.tsx
│   ├── Map.tsx
│   ├── MyPage.tsx
│   ├── RecipeCreate.tsx     # 말하기 / 채팅 선택
│   ├── RecipeVoice.tsx      # 녹음 전 화면
│   ├── RecipeRecording.tsx  # 녹음 중 화면
│   ├── RecipeChat.tsx       # 채팅 입력 화면
│   ├── RegionSelect.tsx     # 지역 선택 (지도)
│   ├── RecipeProcessing.tsx # AI 변환 중 화면
│   ├── RecipeReview.tsx     # 레시피 검토 + 업로드
│   ├── RecipeUploadDone.tsx # 게시 완료 화면
│   ├── RecipeDetail.tsx     # 레시피 상세 보기
│   ├── RecipeStart.tsx      # 요리 시작 화면
│   ├── RecipeFollow.tsx     # 단계별 따라하기
│   └── RecipeComplete.tsx   # 요리 완료 화면
├── assets/
│   ├── fonts/               # NanumHuman 폰트 파일
│   └── images/              # 아이콘 및 이미지
└── package.json
```

---

## 화면 흐름

```
[탭] 레시피 만들기
  → RecipeCreate (말하기 / 채팅 선택)
     → (말하기) RecipeVoice → RecipeRecording → RegionSelect → RecipeProcessing → RecipeReview → RecipeUploadDone
     → (채팅)   RecipeChat

[탭] 홈
  → RecipeDetail → RecipeStart → RecipeFollow → RecipeComplete
```

---

## 폰트

`assets/fonts/` 에 아래 파일이 있어야 합니다.

- `NanumHumanRegular.ttf`
- `NanumHumanBold.ttf`
- `NanumHumanEB.ttf`

폰트는 저작권 문제로 Git에 포함되어 있을 수 있습니다. 없으면 팀원에게 직접 받아서 `assets/fonts/` 폴더에 넣어주세요.
