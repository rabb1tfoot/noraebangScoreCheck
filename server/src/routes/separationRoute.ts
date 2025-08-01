import express, { Request, Response } from 'express';
import { separateAudio } from '../services/audioSeparator';
import * as path from 'path';

const router = express.Router();

// 분리된 음원 파일 서빙을 위한 정적 디렉토리 설정
const SEPARATED_DIR = path.resolve(process.cwd(), 'separated_tracks');
router.use('/separated', express.static(SEPARATED_DIR));

// 음원 분리 API
router.post('/separate-audio', async (req: Request, res: Response) => {
  try {
    const { audioUrl } = req.body;
    
    if (!audioUrl) {
      return res.status(400).json({ error: 'audioUrl 필드가 필요합니다.' });
    }

    // audioUrl에서 실제 파일 경로 추출 (업로드 디렉토리 기준)
    const audioPath = path.resolve(process.cwd(), 'uploads', path.basename(audioUrl));
    
    // 음원 분리 실행
    const { vocalPath, accompanimentPath, analysis } = await separateAudio(audioPath);
    
    // URL 경로 생성
    const vocalUrl = `/separated/${path.relative(SEPARATED_DIR, vocalPath)}`;
    const accompanimentUrl = `/separated/${path.relative(SEPARATED_DIR, accompanimentPath)}`;
    
    res.json({
      vocalUrl,
      accompanimentUrl,
      analysis
    });
  } catch (error) {
    console.error('음원 분리 오류:', error);
    res.status(500).json({ error: '음원 분리 중 오류가 발생했습니다.' });
  }
});

export default router;