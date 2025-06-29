import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// 레퍼런스 노래 업로드 및 분리
router.post('/upload', upload.single('song'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: '파일이 제공되지 않았습니다.' });
    }

    // 업로드된 파일 정보
    const originalName = file.originalname;
    const tempPath = file.path;
    const targetPath = path.join('uploads', originalName);

    // 파일을 영구 저장 위치로 이동
    fs.rename(tempPath, targetPath, (err) => {
      if (err) {
        console.error('파일 이동 오류:', err);
        return res.status(500).json({ error: '파일 저장 실패' });
      }

      // 보컬 분리 처리 (가상의 함수 호출)
      // 실제 구현 시 음성 분리 라이브러리 사용
      const vocalPath = path.join('vocal', `vocal_${originalName}`);
      const instrumentalPath = path.join('instrumental', `instrumental_${originalName}`);

      // 임시로 파일 복사로 대체 (실제로는 음성 분리 알고리즘 적용)
      fs.copyFile(targetPath, vocalPath, (err) => {
        if (err) console.error('보컬 파일 생성 오류:', err);
      });
      
      fs.copyFile(targetPath, instrumentalPath, (err) => {
        if (err) console.error('반주 파일 생성 오류:', err);
      });

      res.status(200).json({ 
        message: '파일 업로드 및 처리 성공', 
        filename: originalName,
        vocalPath,
        instrumentalPath
      });
    });
  } catch (error) {
    console.error('업로드 오류:', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
});

// 업로드된 노래 목록 조회
router.get('/songs', (req, res) => {
  try {
    const uploadDir = 'uploads';
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        console.error('파일 목록 읽기 오류:', err);
        return res.status(500).json({ error: '서버 내부 오류' });
      }
      
      const songs = files
        .filter(file => file.endsWith('.mp3'))
        .map(file => ({
          filename: file,
          path: path.join(uploadDir, file)
        }));
      
      res.status(200).json(songs);
    });
  } catch (error) {
    console.error('노래 목록 조회 오류:', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
});

// 녹음된 음원 점수 계산
router.post('/score', upload.single('audio'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: '오디오 파일이 제공되지 않았습니다.' });
    }

    // 파일 처리 로직 (임시로 랜덤 점수 반환)
    const score = Math.floor(Math.random() * 10) + 1;
    
    // 실제 구현 시:
    // const score = calculateScore(file.path);
    
    res.status(200).json({ score });
  } catch (error) {
    console.error('점수 계산 오류:', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
});

export default router;