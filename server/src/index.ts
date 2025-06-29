import express from 'express';
import cors from 'cors';
import path from 'path';
import uploadRoute from './routes/uploadRoute';

const app = express();
const port = 5002;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use('/instrumental', express.static(path.join(__dirname, '../instrumental')));

// 기본 라우트
app.get('/', (req, res) => {
  res.send('노래방 점수 체크 서버가 실행 중입니다!');
});

// 파일 업로드 라우트
app.use('/api', uploadRoute);

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});