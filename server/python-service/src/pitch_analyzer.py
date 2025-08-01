import numpy as np
import librosa
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean
import matplotlib.pyplot as plt
import os

def extract_pitch(audio_path: str, hop_length: int = 512) -> np.ndarray:
    """
    오디오 파일에서 음정(F0) 추출
    Args:
        audio_path: 오디오 파일 경로
        hop_length: 분석 프레임 간격
    Returns:
        음정 배열 (Hz 단위) 및 샘플링 레이트
    """
    y, sr = librosa.load(audio_path)
    f0, voiced_flag, _ = librosa.pyin(
        y, 
        fmin=librosa.note_to_hz('C2'), 
        fmax=librosa.note_to_hz('C7'),
        sr=sr,
        hop_length=hop_length,
        fill_na=0.0
    )
    return f0, sr

def align_pitches(ref_pitch: np.ndarray, user_pitch: np.ndarray) -> tuple:
    """
    DTW를 사용해 두 음정 시퀀스 시간 축 정렬
    Args:
        ref_pitch: 참조 음정 배열
        user_pitch: 사용자 음정 배열
    Returns:
        정렬된 참조 음정, 사용자 음정
    """
    # 유효한 값만 필터링 (0은 무음 구간)
    ref_valid = ref_pitch[ref_pitch > 0]
    user_valid = user_pitch[user_pitch > 0]
    
    # DTW를 통한 시간 축 정렬
    distance, path = fastdtw(
        ref_valid.reshape(-1, 1), 
        user_valid.reshape(-1, 1), 
        dist=euclidean
    )
    
    aligned_ref = np.zeros(len(path))
    aligned_user = np.zeros(len(path))
    
    for i, (ref_idx, user_idx) in enumerate(path):
        aligned_ref[i] = ref_valid[ref_idx]
        aligned_user[i] = user_valid[user_idx]
        
    return aligned_ref, aligned_user

def calculate_pitch_score(ref_pitch: np.ndarray, user_pitch: np.ndarray) -> float:
    """
    참조 음정과 사용자 음정 비교하여 점수 계산
    Args:
        ref_pitch: 참조 음정 배열
        user_pitch: 사용자 음정 배열
    Returns:
        음정 정확도 점수 (0~100)
    """
    # 정렬된 음정 획득
    aligned_ref, aligned_user = align_pitches(ref_pitch, user_pitch)
    
    # 음정 차이 계산 (반음 단위)
    pitch_diff = np.abs(librosa.hz_to_midi(aligned_ref) - librosa.hz_to_midi(aligned_user))
    
    # 오차가 1반음 이내인 비율 계산
    in_tune_ratio = np.mean(pitch_diff < 1.0)
    
    # 점수 변환 (0~100)
    return round(in_tune_ratio * 100, 2)

def visualize_pitch_comparison(ref_pitch: np.ndarray, user_pitch: np.ndarray, output_path: str):
    """
    음정 비교 결과 시각화
    Args:
        ref_pitch: 참조 음정 배열
        user_pitch: 사용자 음정 배열
        output_path: 이미지 저장 경로
    """
    plt.figure(figsize=(15, 5))
    
    # MIDI 음계로 변환
    ref_midi = librosa.hz_to_midi(ref_pitch)
    user_midi = librosa.hz_to_midi(user_pitch)
    
    # 유효한 구간만 플롯
    ref_valid = ref_midi[ref_midi > 0]
    user_valid = user_midi[user_midi > 0]
    
    plt.plot(ref_valid, label='Reference', alpha=0.7)
    plt.plot(user_valid, label='User', alpha=0.7)
    plt.ylabel('Pitch (MIDI Note)')
    plt.xlabel('Time (frames)')
    plt.title('Pitch Comparison')
    plt.legend()
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

if __name__ == "__main__":
    # 테스트 코드
    ref_audio = "path/to/reference_audio.wav"
    user_audio = "path/to/user_audio.wav"
    
    ref_pitch, _ = extract_pitch(ref_audio)
    user_pitch, _ = extract_pitch(user_audio)
    
    score = calculate_pitch_score(ref_pitch, user_pitch)
    print(f"Pitch Accuracy: {score}%")
    
    # 시각화 저장
    os.makedirs("pitch_plots", exist_ok=True)
    visualize_pitch_comparison(ref_pitch, user_pitch, "pitch_plots/comparison.png")