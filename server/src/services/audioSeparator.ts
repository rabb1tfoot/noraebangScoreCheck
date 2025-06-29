import axios from 'axios';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';

// Python 서비스 설정
const PYTHON_SERVICE_URL = 'http://localhost:8000/separate';

export async function separateAudio(audioPath: string): Promise<{ vocalPath: string, accompanimentPath: string }> {
  try {
    // FormData 생성
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioPath), {
      filename: path.basename(audioPath),
      contentType: 'audio/mpeg'
    });

    // Python 서비스로 요청 전송
    const response = await axios.post(PYTHON_SERVICE_URL, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    return {
      vocalPath: response.data.vocal_path,
      accompanimentPath: response.data.accompaniment_path
    };
  } catch (error) {
    console.error('음원 분리 실패:', error);
    throw new Error('음원 분리 처리 중 오류가 발생했습니다.');
  }
}