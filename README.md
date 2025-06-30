# 노래방 점수 체크 웹앱 (vscode +rooCode deepseek r1 0528 free)

레퍼런스 노래를 업로드하고 보컬/악기를 분리한 후, 사용자가 악기 반주에 맞춰 노래를 녹음하고 점수를 받는 웹 애플리케이션

## 기술 스택
- **프론트엔드**: React 18, TypeScript, Vite, Material UI
- **백엔드**: Node.js, Express
- **음원 분리 서비스**: Python, FastAPI, Spleeter
- **기타**: multer (파일 업로드), cors, axios

## 설치 및 실행 방법

### 전제 조건
- Node.js (v18 이상)
- npm (v9 이상)
- Python 3.9 이상
- pip

### 설치
```bash
# 루트 디렉토리에서
npm install

# 클라이언트 디렉토리에서
cd client && npm install

# 서버 디렉토리에서
cd ../server && npm install

# Python 서비스 종속성 설치
cd ../server/python-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 실행
```bash
# Python 서비스 실행 (포트 8000)
cd server/python-service
venv\Scripts\activate
python src/main.py

# Node.js 서버 실행 (포트 5003)
cd server
npm run server

# 프론트엔드 실행 (포트 3000)
cd client
npm run dev
```

## 디렉토리 구조
```
.
├── client/              # 프론트엔드
│   ├── src/
│   │   ├── pages/       # 페이지 컴포넌트
│   │   ├── App.tsx      # 메인 앱
│   │   └── main.tsx     # 진입점
├── server/              # 백엔드
│   ├── python-service/  # 음원 분리 서비스
│   │   ├── src/
│   │   │   ├── main.py
│   │   │   └── separator.py
│   ├── src/
│   │   ├── routes/      # API 라우트
│   │   └── index.ts     # 서버 진입점
├── uploads/             # 업로드된 파일
├── vocal/               # 분리된 보컬 파일
├── instrumental/        # 분리된 반주 파일
├── package.json         # 루트 패키지 관리
└── README.md            # 이 파일
```

## 주요 기능
1. **노래 업로드**: MP3 파일 업로드 및 서버 저장 (한글 파일명 지원)
2. **보컬/악기 분리**: Spleeter 기반 음원 분리 처리
3. **노래 녹음**: 사용자 보컬 녹음 기능 (구현 중)
4. **점수 평가**: 원본과 녹음 비교 점수화 (구현 중)

## 해결된 주요 문제
- 프론트엔드 서버 실행 오류 해결
- 한글 파일명 깨짐 문제 해결 (UUID 파일명 사용)
- 음원 분리 서비스 종속성 호환성 문제 해결
- 파일 처리 로직 개선 (비동기 방식)
