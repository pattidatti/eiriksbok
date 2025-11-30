import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { SubjectPage } from './pages/SubjectPage';
import { TopicPage } from './pages/TopicPage';
import { LessonPage } from './pages/LessonPage';
import { SearchPage } from './pages/SearchPage';
import { TextLibraryPage } from './pages/TextLibraryPage';
import { TextReaderPage } from './pages/TextReaderPage';
import ColonizationMap from './components/ColonizationMap/ColonizationMap';
import './App.css';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="sok" element={<SearchPage />} />
          <Route path="norsk/bibliotek" element={<TextLibraryPage />} />
          <Route path="norsk/bibliotek/:textId" element={<TextReaderPage />} />
          <Route path=":subjectId" element={<SubjectPage />} />
          <Route path=":subjectId/:topicId" element={<TopicPage />} />
          <Route path=":subjectId/:topicId/:subTopicId" element={<TopicPage />} />
          <Route path=":subjectId/:topicId/:subTopicId/:lessonId" element={<LessonPage />} />
          <Route path=":subjectId/:topicId/:lessonId" element={<LessonPage />} />
          <Route path="colonization" element={<ColonizationMap />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
