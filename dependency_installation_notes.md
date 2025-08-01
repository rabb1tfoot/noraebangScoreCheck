# 종속성 설치 문제 해결 기록

## 문제
- spleeter와 librosa 버전 충돌 (spleeter는 librosa 0.8.0 요구, 우리는 0.9.1 사용 시도)
- setuptools 최신 버전에서 타입 서브스크립팅 오류 발생
- Python 3.8.10 환경에서의 호환성 문제

## 해결 과정
1. librosa 버전을 0.8.0으로 다운그레이드
2. setuptools를 58.0.4로 다운그레이드
3. pip를 23.0.1로 업그레이드
4. whisper 대신 openai-whisper 패키지 사용
5. TensorFlow 2.3.0 및 호환되는 NumPy(1.18.5) 설치

## 설치된 패키지 버전
```
fastapi==0.110.0
uvicorn[standard]==0.29.0
spleeter==2.1.0
numpy==1.18.5
pydantic==2.6.4
python-multipart==0.0.9
librosa==0.8.0
openai-whisper
```

## 추가 사항
- Python 3.8.10 환경에서 안정적인 설치 확인
- 가상 환경 경로: `server/python-service/venv`