import axios from 'axios';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';

// Python 서비스 설정
const PYTHON_SERVICE_URL = 'http://localhost:8000/separate';

export async function separateAudio(audioPath: string, userRecordingPath?: string): Promise<{
  vocalPath: string,
  accompanimentPath: string,
  analysis: any,
  pitch_score?: number,
  pitch_plot?: string,
  rhythm_score?: number,
  tempo_difference?: number,
  rhythm_plot?: string,
  total_score?: number
}> {
  try {
    // FormData 생성
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioPath), {
      filename: path.basename(audioPath),
      contentType: 'audio/mpeg'
    });
    
    // 사용자 녹음 파일이 있을 경우 추가
    if (userRecordingPath) {
      formData.append('user_recording', fs.createReadStream(userRecordingPath), {
        filename: path.basename(userRecordingPath),
        contentType: 'audio/wav'
      });
    }

    // Python 서비스로 요청 전송
    const response = await axios.post(PYTHON_SERVICE_URL, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    return {
      vocalPath: response.data.vocal_path,
      accompanimentPath: response.data.accompaniment_path,
      analysis: response.data.analysis || {},
      pitch_score: response.data.pitch_score,
      pitch_plot: response.data.pitch_plot,
      rhythm_score: response.data.rhythm_score,
      tempo_difference: response.data.tempo_difference,
      rhythm_plot: response.data.rhythm_plot,
      total_score: response.data.total_score
    };
  } catch (error) {
    console.error('음원 분리 및 분석 실패:', error);
    throw new Error('음원 처리 중 오류가 발생했습니다.');
  }
}