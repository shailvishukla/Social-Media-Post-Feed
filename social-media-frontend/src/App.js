import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PostFeed from './components/PostFeed';
import NewPost from './components/NewPost';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<PostFeed />} />
          <Route path="/new" element={<NewPost />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
