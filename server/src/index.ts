import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import uploadRoute from './routes/uploadRoute';
import separationRoute from './routes/separationRoute';

const app = express();
const port = 5003;

// 디렉토리 생성 (업로드 및 분리된 트랙 저장)
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const SEPARATED_DIR = path.join(__dirname, '../separated_tracks');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(SEPARATED_DIR, { recursive: true });

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use('/instrumental', express.static(path.join(__dirname, '../instrumental')));
app.use('/separated', express.static(SEPARATED_DIR)); // 분리된 음원 서빙

// 기본 라우트
app.get('/', (req, res) => {
  res.send('노래방 점수 체크 서버가 실행 중입니다!');
});

// 파일 업로드 라우트
app.use('/api', uploadRoute);

// 음원 분리 라우트 추가
app.use('/api', separationRoute);

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
  console.log(`업로드 디렉토리: ${UPLOAD_DIR}`);
  console.log(`분리된 트랙 디렉토리: ${SEPARATED_DIR}`);
});