import React, { useState } from 'react';

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('파일을 선택해주세요');
      return;
    }

    const formData = new FormData();
    formData.append('song', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadStatus(`업로드 성공: ${data.filename}`);
      } else {
        setUploadStatus('업로드 실패');
      }
    } catch (error) {
      setUploadStatus('서버 연결 실패');
    }
  };

  return (
    <div className="upload-page">
      <h2>레퍼런스 노래 업로드</h2>
      <input type="file" accept=".mp3" onChange={handleFileChange} />
      <button onClick={handleUpload}>업로드</button>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default UploadPage;