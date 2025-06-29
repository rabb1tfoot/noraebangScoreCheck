from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
import os
import uuid
from separator import separate_audio  # separator 모듈에서 분리 함수 임포트

app = FastAPI()

# 환경 변수 설정
UPLOAD_DIR = Path("uploads")
SEPARATED_DIR = Path("separated")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(SEPARATED_DIR, exist_ok=True)

@app.post("/separate")
async def separate_audio_endpoint(file: UploadFile = File(...)):
    # 파일 유효성 검사
    if file.content_type != "audio/mpeg":
        raise HTTPException(status_code=400, detail="MP3 파일만 업로드 가능합니다.")
    
    # 고유 파일명 생성
    file_id = str(uuid.uuid4())
    input_path = UPLOAD_DIR / f"{file_id}.mp3"
    output_dir = SEPARATED_DIR / file_id
    
    # 파일 저장
    try:
        contents = await file.read()
        with open(input_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 저장 실패: {str(e)}")
    
    # 음원 분리 실행
    try:
        result = separate_audio(input_path, output_dir)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"음원 분리 실패: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)