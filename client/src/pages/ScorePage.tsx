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
  
  // 분리된 트랙 상태 추가
  const [separatedTracks, setSeparatedTracks] = useState<{
    vocalUrl: string;
    accompanimentUrl: string;
  } | null>(null);
  const [isSeparating, setIsSeparating] = useState(false);

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

  // 선택된 노래 변경 시 음원 분리 처리
  useEffect(() => {
    const separateAudio = async () => {
      if (!selectedSong) return;
      
      setIsSeparating(true);
      try {
        const response = await fetch('http://localhost:5002/api/separate-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioUrl: selectedSong })
        });
        
        if (response.ok) {
          const data = await response.json();
          setSeparatedTracks({
            vocalUrl: data.vocalUrl,
            accompanimentUrl: data.accompanimentUrl
          });
        } else {
          console.error('음원 분리 실패:', await response.text());
        }
      } catch (error) {
        console.error('음원 분리 요청 오류:', error);
      } finally {
        setIsSeparating(false);
      }
    };

    if (selectedSong) {
      separateAudio();
    }
  }, [selectedSong]);

  const handleStartRecording = () => {
    if (mediaRecorderRef.current) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // 녹음 시작 시 반주 재생
      if (!isPlaying && separatedTracks?.accompanimentUrl) {
        handlePlayInstrumental();
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // 녹음 중지 시 반주 정지
      if (isPlaying) {
        player?.stop();
        setIsPlaying(false);
      }
    }
  };

  const handlePlayInstrumental = () => {
    if (isPlaying) {
      player?.stop();
      setIsPlaying(false);
      return;
    }

    if (!separatedTracks?.accompanimentUrl) return;

    const newPlayer = new Howl({
      src: [separatedTracks.accompanimentUrl],
      format: ['wav'],
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
          disabled={isRecording || isPlaying || isSeparating}
        >
          <option value="">-- 노래 선택 --</option>
          {songs.map(song => (
            <option key={song.filename} value={song.filename}>
              {song.filename}
            </option>
          ))}
        </select>
        
        {selectedSong && (
          <div>
            <button
              onClick={handlePlayInstrumental}
              disabled={isRecording || isPlaying || isSeparating || !separatedTracks}
            >
              {isPlaying ? '연주 중지' : '반주 재생'}
            </button>
            {isSeparating && <span>음원 분리 중...</span>}
          </div>
        )}
      </div>
      
      <div className="recording-section">
        <div className="controls">
          <button
            onClick={handleStartRecording}
            disabled={!separatedTracks || isPlaying || isRecording || isSeparating}
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