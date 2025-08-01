import numpy as np
import librosa
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean
import matplotlib.pyplot as plt
import os

def detect_beats(audio_path: str) -> tuple:
    """
    오디오 파일에서 비트 위치와 템포 추출
    Args:
        audio_path: 오디오 파일 경로
    Returns:
        비트 프레임 인덱스 배열, 템포
    """
    y, sr = librosa.load(audio_path)
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    return beat_frames, tempo, sr

def calculate_rhythm_score(ref_beats: np.ndarray, user_beats: np.ndarray, sr: int) -> float:
    """
    참조 비트와 사용자 비트 비교하여 리듬 정확도 계산
    Args:
        ref_beats: 참조 비트 프레임 배열
        user_beats: 사용자 비트 프레임 배열
        sr: 샘플링 레이트
    Returns:
        리듬 정확도 점수 (0~100)
    """
    # 프레임을 시간(초)으로 변환
    ref_times = librosa.frames_to_time(ref_beats, sr=sr)
    user_times = librosa.frames_to_time(user_beats, sr=sr)
    
    # DTW를 사용해 시간 축 정렬
    distance, path = fastdtw(
        ref_times.reshape(-1, 1), 
        user_times.reshape(-1, 1), 
        dist=euclidean
    )
    
    # 정렬된 시간 차이 계산
    time_diffs = []
    for ref_idx, user_idx in path:
        time_diffs.append(abs(ref_times[ref_idx] - user_times[user_idx]))
    
    # 평균 시간 오차 (초)
    mean_time_diff = np.mean(time_diffs)
    
    # 오차가 0.1초 이내인 비율 계산 (리듬 정확도)
    in_time_ratio = np.mean(np.array(time_diffs) < 0.1)
    
    # 점수 변환 (0~100)
    return round(in_time_ratio * 100, 2), mean_time_diff

def visualize_beat_comparison(ref_beats: np.ndarray, user_beats: np.ndarray, sr: int, output_path: str):
    """
    비트 비교 결과 시각화
    Args:
        ref_beats: 참조 비트 프레임 배열
        user_beats: 사용자 비트 프레임 배열
        sr: 샘플링 레이트
        output_path: 이미지 저장 경로
    """
    plt.figure(figsize=(15, 5))
    
    # 비트 시간 계산
    ref_times = librosa.frames_to_time(ref_beats, sr=sr)
    user_times = librosa.frames_to_time(user_beats, sr=sr)
    
    # 비트 플롯 (수직선으로 표시)
    plt.vlines(ref_times, 0, 1, color='r', alpha=0.5, label='Reference')
    plt.vlines(user_times, 0, 0.8, color='b', alpha=0.5, label='User')
    
    plt.xlabel('Time (s)')
    plt.title('Beat Alignment')
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

if __name__ == "__main__":
    # 테스트 코드
    ref_audio = "path/to/reference_audio.wav"
    user_audio = "path/to/user_audio.wav"
    
    ref_beats, ref_tempo, ref_sr = detect_beats(ref_audio)
    user_beats, user_tempo, user_sr = detect_beats(user_audio)
    
    score, avg_diff = calculate_rhythm_score(ref_beats, user_beats, ref_sr)
    print(f"Rhythm Accuracy: {score}%")
    print(f"Average Time Difference: {avg_diff:.3f}s")
    
    # 시각화 저장
    os.makedirs("rhythm_plots", exist_ok=True)
    visualize_beat_comparison(ref_beats, user_beats, ref_sr, "rhythm_plots/comparison.png")