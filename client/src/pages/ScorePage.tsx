import React, { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

const ScorePage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [songs, setSongs] = useState<Array<{filename: string, path: string}>>([]);
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [player, setPlayer] = useState<Howl | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // 서버에서 노래 목록 가져오기
    const fetchSongs = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/songs');
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
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePlayInstrumental = () => {
    if (isPlaying) {
      player?.stop();
      setIsPlaying(false);
      return;
    }

    if (!selectedSong) return;

    const instrumentalUrl = `http://localhost:5002/instrumental/instrumental_${selectedSong}`;
    const newPlayer = new Howl({
      src: [instrumentalUrl],
      format: ['mp3'],
      onend: () => setIsPlaying(false),
    });

    newPlayer.play();
    setPlayer(newPlayer);
    setIsPlaying(true);
  };

  const handleSubmitRecording = async () => {
    if (!recordedAudio) return;
    
    try {
      const formData = new FormData();
      formData.append('audio', recordedAudio, 'recording.wav');
      
      const response = await fetch('http://localhost:5002/api/score', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        setScore(result.score);
      } else {
        console.error('점수 계산 실패');
      }
    } catch (error) {
      console.error('서버 연결 오류:', error);
    }
  };

  return (
    <div className="score-page">
      <h2>노래 녹음 및 점수 확인</h2>

      <div className="song-selection">
        <h3>연주할 노래 선택</h3>
        <select 
          value={selectedSong || ''} 
          onChange={(e) => setSelectedSong(e.target.value)}
          disabled={isRecording || isPlaying}
        >
          <option value="">-- 노래 선택 --</option>
          {songs.map(song => (
            <option key={song.filename} value={song.filename}>
              {song.filename}
            </option>
          ))}
        </select>
        
        {selectedSong && (
          <button 
            onClick={handlePlayInstrumental}
            disabled={isRecording || isPlaying}
          >
            {isPlaying ? '연주 중지' : '반주 재생'}
          </button>
        )}
      </div>
      
      <div className="recording-section">
        <div className="controls">
          <button 
            onClick={handleStartRecording} 
            disabled={!selectedSong || isPlaying || isRecording}
          >
            녹음 시작
          </button>
          <button 
            onClick={handleStopRecording} 
            disabled={!isRecording}
          >
            녹음 중지
          </button>
        </div>
        
        {audioUrl && (
          <div className="audio-preview">
            <h4>내 녹음</h4>
            <audio src={audioUrl} controls />
            <button onClick={handleSubmitRecording}>점수 계산</button>
          </div>
        )}
      </div>

      {score !== null && (
        <div className="score-result">
          <h3>당신의 점수: {score}점</h3>
          <p>10점 만점 중 {score}점을 획득하셨습니다!</p>
        </div>
      )}

      <style>
        {`
          .song-selection, .recording-section {
            margin: 20px 0;
          }
          select, button {
            margin: 0 10px;
            padding: 8px 16px;
          }
          .audio-preview {
            margin-top: 20px;
          }
        `}
      </style>
    </div>
  );
};

export default ScorePage;