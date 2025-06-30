import os
from pathlib import Path
from spleeter.separator import Separator
from spleeter.audio.adapter import AudioAdapter

def separate_audio(input_path: str, output_dir: str) -> dict:
    """
    오디오 파일을 보컬과 반주로 분리하는 함수
    
    Args:
        input_path: 분리할 오디오 파일 경로
        output_dir: 분리된 파일을 저장할 디렉토리
        
    Returns:
        분리된 파일 경로 정보가 포함된 딕셔너리
    """
    # 출력 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)
    
    # Spleeter 초기화 (2 stems: vocals and accompaniment)
    separator = Separator('spleeter:2stems')
    audio_loader = AudioAdapter.default()
    
    # 오디오 로드
    # 오디오 로드 (MP3 직접 지원)
    sample_rate = 44100
    waveform, _ = audio_loader.load(input_path, sample_rate=sample_rate)
    
    # 오디오 분리
    prediction = separator.separate(waveform)
    
    # 분리된 트랙 저장 (MP3 형식으로 저장)
    vocal_path = Path(output_dir) / "vocals.mp3"
    accompaniment_path = Path(output_dir) / "accompaniment.mp3"
    
    audio_loader.save(str(vocal_path), prediction['vocals'], sample_rate, codec='mp3')
    audio_loader.save(str(accompaniment_path), prediction['accompaniment'], sample_rate, codec='mp3')
    
    return {
        "vocal_path": str(vocal_path),
        "accompaniment_path": str(accompaniment_path),
        "vocal_url": f"/separated/{Path(output_dir).name}/vocals.wav",
        "accompaniment_url": f"/separated/{Path(output_dir).name}/accompaniment.wav"
    }