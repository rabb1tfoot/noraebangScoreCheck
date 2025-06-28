# 노래방 점수 체크 웹앱

레퍼런스 노래를 업로드하고 보컬/악기를 분리한 후, 사용자가 악기 반주에 맞춰 노래를 녹음하고 점수를 받는 웹 애플리케이션

## 기술 스택
- **프론트엔드**: React 18, TypeScript, Vite, Material UI
- **백엔드**: Node.js, Express, MongoDB, Mongoose
- **기타**: multer (파일 업로드), cors

## 설치 및 실행 방법

### 전제 조건
- Node.js (v18 이상)
- npm (v9 이상)

### 설치
```bash
# 루트 디렉토리에서
npm install

# 클라이언트 디렉토리에서
cd client && npm install

# 서버 디렉토리에서
cd ../server && npm install
```

### 실행
```bash
# 루트 디렉토리에서 동시 실행
npm run dev

# 또는 별도 실행
# 서버 실행
npm run server --prefix server

# 클라이언트 실행
npm run dev --prefix client
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
│   ├── src/
│   │   ├── routes/      # API 라우트
│   │   └── index.ts     # 서버 진입점
├── package.json         # 루트 패키지 관리
└── README.md            # 이 파일
```

## 주요 기능
1. **노래 업로드**: MP3 파일 업로드 및 서버 저장
2. **보컬/악기 분리**: 업로드된 노래 분리 처리 (추후 구현)
3. **노래 녹음**: 사용자 보컬 녹음 기능 (추후 구현)
4. **점수 평가**: 원본과 녹음 비교 점수화 (추후 구현)