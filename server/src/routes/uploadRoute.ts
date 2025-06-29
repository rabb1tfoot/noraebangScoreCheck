import express from 'express';
import multer from 'multer';

const router = express.Router();
import fs from 'fs';
import path from 'path';

const upload = multer({ dest: 'uploads/' });

// 레퍼런스 노래 업로드 및 분리
router.post('/upload', upload.single('song'), (req, res) => {
  try {
    // 파일 처리 로직 (추후 구현)
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: '파일이 제공되지 않았습니다.' });
    }

    // 보컬/악기 분리 API 호출 (추후 구현)
    // const separated = separateVocalAndInstrument(file.path);

    res.status(200).json({ 
      message: '파일 업로드 성공', 
      filename: file.originalname,
      // separated
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

export default router;