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
    
    result = {
        "vocal_path": str(vocal_path),
        "accompaniment_path": str(accompaniment_path),
        "analysis": analysis
    }
    
    # 사용자 녹음 파일이 제공된 경우 음정 점수 계산
    if user_recording_path and os.path.exists(user_recording_path):
        try:
            # 참조 보컬과 사용자 녹음의 음정 추출
            ref_pitch, _ = extract_pitch(str(vocal_path))
            user_pitch, _ = extract_pitch(user_recording_path)
            
            # 음정 정확도 계산
            pitch_score = calculate_pitch_score(ref_pitch, user_pitch)
            result["pitch_score"] = pitch_score
            
            # 음정 비교 시각화
            plot_path = os.path.join(output_dir, "pitch_comparison.png")
            visualize_pitch_comparison(ref_pitch, user_pitch, plot_path)
            result["pitch_plot"] = plot_path
        except Exception as e:
            print(f"음정 분석 오류: {e}")
            result["pitch_score"] = 0
            result["pitch_plot"] = ""
    
    # 리듬 분석 수행
    if user_recording_path and os.path.exists(user_recording_path):
        try:
            # 참조 음원과 사용자 녹음의 비트 추출
            ref_beats, ref_tempo, ref_sr = detect_beats(str(vocal_path))
            user_beats, user_tempo, user_sr = detect_beats(user_recording_path)
            
            # 리듬 정확도 계산
            rhythm_score, avg_diff = calculate_rhythm_score(ref_beats, user_beats, ref_sr)
            result["rhythm_score"] = rhythm_score
            result["tempo_difference"] = abs(ref_tempo - user_tempo)
            
            # 비트 정렬 시각화
            plot_path = os.path.join(output_dir, "beat_alignment.png")
            visualize_beat_comparison(ref_beats, user_beats, ref_sr, plot_path)
            result["rhythm_plot"] = plot_path
        except Exception as e:
            print(f"리듬 분석 오류: {e}")
            result["rhythm_score"] = 0
            result["tempo_difference"] = 0
            result["rhythm_plot"] = ""
    
    return result