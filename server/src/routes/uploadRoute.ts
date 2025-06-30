import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    // UUID를 사용하여 파일명 생성 (한글 깨짐 문제 해결)
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// 레퍼런스 노래 업로드 및 분리
router.post('/upload', upload.single('song'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: '파일이 제공되지 않았습니다.' });
    }

    // 업로드된 파일 정보 (UUID 파일명 사용)
    const originalName = file.originalname;
    const tempPath = file.path;
    const targetPath = path.join('uploads', file.filename);

    // 파일은 이미 multer에 의해 targetPath에 저장됨
    const vocalPath = path.join('vocal', `vocal_${file.filename}`);
    const instrumentalPath = path.join('instrumental', `instrumental_${file.filename}`);

    // 디렉토리 생성 및 파일 복사 (비동기)
    fs.mkdir(path.dirname(vocalPath), { recursive: true }, (dirErr) => {
      if (dirErr) {
        console.error('보컬 디렉토리 생성 오류:', dirErr);
        return res.status(500).json({ error: '보컬 디렉토리 생성 실패' });
      }

      fs.mkdir(path.dirname(instrumentalPath), { recursive: true }, (dirErr2) => {
        if (dirErr2) {
          console.error('반주 디렉토리 생성 오류:', dirErr2);
          return res.status(500).json({ error: '반주 디렉토리 생성 실패' });
        }

        // 파일 복사
        fs.copyFile(file.path, vocalPath, (copyErr) => {
          if (copyErr) {
            console.error('보컬 파일 복사 오류:', copyErr);
            return res.status(500).json({ error: '보컬 파일 복사 실패' });
          }

          fs.copyFile(file.path, instrumentalPath, (copyErr2) => {
            if (copyErr2) {
              console.error('반주 파일 복사 오류:', copyErr2);
              return res.status(500).json({ error: '반주 파일 복사 실패' });
            }

            res.status(200).json({
              message: '파일 업로드 및 처리 성공',
              filename: originalName,
              vocalPath,
              instrumentalPath
            });
          });
        });
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