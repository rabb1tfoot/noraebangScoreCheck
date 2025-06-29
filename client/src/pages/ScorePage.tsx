import React, { useState, useEffect, useRef } from 'react';

const ScorePage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [songs, setSongs] = useState<Array<{filename: string, path: string}>>([]);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  useEffect(() => {
    // 녹음 초기화
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          
          mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };
          
          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            setRecordedAudio(audioBlob);
            setAudioUrl(URL.createObjectURL(audioBlob));
            audioChunksRef.current = [];
          };
        })
        .catch(err => console.error('마이크 접근 오류:', err));
    }
  }, []);

  const handleStartRecording = () => {
    if (mediaRecorderRef.current) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    setIsRecording(false);
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

      {audioUrl && (
        <div className="audio-preview">
          <audio src={audioUrl} controls />
          <button onClick={handleSubmitRecording}>점수 계산</button>
        </div>
      )}

      {score !== null && (
        <div className="score-result">
          <h3>당신의 점수: {score}점</h3>
          <p>10점 만점 중 {score}점을 획득하셨습니다!</p>
        </div>
      )}
    </div>
  );
};

export default ScorePage;