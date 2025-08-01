# 노래방 점수 체크 웹앱 (vscode +rooCode deepseek r1 0528 free)

레퍼런스 노래를 업로드하고 보컬/악기를 분리한 후, 사용자가 악기 반주에 맞춰 노래를 녹음하고 점수를 받는 웹 애플리케이션

## 기술 스택
- **프론트엔드**: React 18, TypeScript, Vite, Material UI
- **백엔드**: Node.js, Express
- **음원 분석 서비스**: Python, FastAPI, Spleeter, Librosa, Whisper
- **기타**: multer (파일 업로드), cors, axios, fastdtw

## 설치 및 실행 방법

### 전제 조건
- Node.js (v18 이상)
- npm (v9 이상)
- Python 3.8.10
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
│   │   │   ├── separator.py
│   │   │   ├── pitch_analyzer.py  # 음정 분석 모듈
│   │   │   └── rhythm_analyzer.py # 리듬 분석 모듈
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
2. **음원 분리**: Spleeter 기반 보컬/반주 분리
3. **음정 분석**: Librosa 기반 음정 추출 및 정확도 계산 (DTW 알고리즘)
4. **리듬 분석**: 비트 감지 및 템포 분석을 통한 리듬 정확도 평가
5. **종합 점수**: 음정(50%) + 리듬(50%) 가중치 기반 최종 점수 산출
6. **노래 녹음**: Web Audio API 기반 사용자 보컬 녹음 기능
7. **시각화**: 음정 곡선 및 비트 정렬 시각화 리포트 생성

## 해결된 주요 문제
- 프론트엔드 서버 실행 오류 해결
- 한글 파일명 깨짐 문제 해결 (UUID 파일명 사용)
- 음원 분리 서비스 종속성 호환성 문제 해결
- 파일 처리 로직 개선 (비동기 방식)
- 음원 분리 및 분석 파이프라인 최적화
- Windows 환경에서의 Python 실행 경로 문제 해결

## 업데이트 내역 (2025-08-01)
- 음원 처리 파이프라인 개선: Librosa 및 Whisper 통합
- Python 종속성 충돌 해결: spleeter와 librosa 호환성 문제 해결
- Python 3.8.10 환경에서 안정적인 설치 보장
- 음정 분석 알고리즘 구현 완료 (pitch_analyzer.py)
- 리듬 분석 알고리즘 구현 완료 (rhythm_analyzer.py)
- 종합 점수 계산 로직 구현 (음정 50% + 리듬 50%)
- 오류 처리 미들웨어 및 예외 케이스 핸들링 구현
- 서버 측 분석 결과 처리 로직 개선
