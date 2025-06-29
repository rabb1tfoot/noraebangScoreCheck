import React, { useState, useEffect } from 'react';

const ScorePage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [songs, setSongs] = useState<Array<{filename: string, path: string}>>([]);

  useEffect(() => {
    // 서버에서 노래 목록 가져오기
    const fetchSongs = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/songs');
        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error('노래 목록 가져오기 실패:', error);
      }
    };

    fetchSongs();
  }, []);

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

      <div className="song-list">
        <h3>업로드된 노래</h3>
        <ul>
          {songs.map(song => (
            <li key={song.filename}>
              {song.filename}
              <button onClick={() => console.log('선택:', song.filename)}>선택</button>
            </li>
          ))}
        </ul>
      </div>
      
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