import express from 'express';
import multer from 'multer';

const router = express.Router();
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

export default router;