import os
import numpy as np
import librosa
import whisper
from pathlib import Path
from spleeter.separator import Separator
from spleeter.audio.adapter import AudioAdapter

def separate_audio(input_path: str, output_dir: str) -> dict:
    """
    오디오 파일을 보컬과 반주로 분리하고 고급 분석을 수행하는 함수
    
    Args:
        input_path: 분리할 오디오 파일 경로
        output_dir: 분리된 파일을 저장할 디렉토리
        
    Returns:
        분리된 파일 경로, 분석 결과가 포함된 딕셔너리
    """
    # 출력 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)
    
    # Spleeter 초기화 (2 stems: vocals and accompaniment)
    separator = Separator('spleeter:2stems')
    audio_loader = AudioAdapter.default()
    
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
    
    # Librosa를 이용한 고급 음원 분석
    try:
        # 오디오 파일 로드
        y, sr = librosa.load(input_path, sr=None)
        
        # 음원 분리 (보컬 & 반주)
        y_harmonic, y_percussive = librosa.effects.hpss(y)
        
        # 템포 및 비트 추적
        tempo, beat_frames = librosa.beat.beat_track(y=y_percussive, sr=sr)
        
        # Whisper를 이용한 가사 추출
        model = whisper.load_model("base")
        result = model.transcribe(input_path)
        
        analysis = {
            'tempo': float(tempo),
            'beats': beat_frames.tolist(),
            'lyrics': result['text']
        }
    except Exception as e:
        print(f"고급 분석 실패: {e}")
        analysis = {}
    
    return {
        "vocal_path": str(vocal_path),
        "accompaniment_path": str(accompaniment_path),
        "vocal_url": f"/separated/{Path(output_dir).name}/vocals.wav",
        "accompaniment_url": f"/separated/{Path(output_dir).name}/accompaniment.wav",
        "analysis": analysis
    }