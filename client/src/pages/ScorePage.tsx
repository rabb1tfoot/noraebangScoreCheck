import React, { useState } from 'react';

const ScorePage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleStartRecording = () => {
    // 녹음 시작 로직 (추후 구현)
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    // 녹음 중지 및 점수 계산 로직 (추후 구현)
    setIsRecording(false);
    // 임시 점수 설정
    setScore(Math.floor(Math.random() * 10) + 1);
  };

  return (
    <div className="score-page">
      <h2>노래 녹음 및 점수 확인</h2>
      
      <div className="recording-controls">
        {!isRecording ? (
          <button onClick={handleStartRecording}>녹음 시작</button>
        ) : (
          <button onClick={handleStopRecording}>녹음 중지</button>
        )}
      </div>

      {score && (
        <div className="score-result">
          <h3>당신의 점수: {score}점</h3>
          <p>10점 만점 중 {score}점을 획득하셨습니다!</p>
        </div>
      )}
    </div>
  );
};

export default ScorePage;