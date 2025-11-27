import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { SubjectPage } from './pages/SubjectPage';
import { LessonPage } from './pages/LessonPage';
import './App.css';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path=":subjectId" element={<SubjectPage />} />
          <Route path=":subjectId/:topicId/:lessonId" element={<LessonPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
