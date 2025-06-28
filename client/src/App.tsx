import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import ScorePage from './pages/ScorePage';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li>
              <Link to="/">홈</Link>
            </li>
            <li>
              <Link to="/upload">노래 업로드</Link>
            </li>
            <li>
              <Link to="/score">점수 매기기</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={
            <div>
              <h1>노래방 점수 체크</h1>
              <p>노래를 업로드하고 점수를 매겨보세요!</p>
            </div>
          } />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/score" element={<ScorePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;