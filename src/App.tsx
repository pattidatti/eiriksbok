import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PageSkeleton } from './components/Skeleton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { routeFactories } from './routes';
import './App.css';

// Lazy load pages using centralized factories
const LandingPage = React.lazy(routeFactories.LandingPage);
const SubjectPage = React.lazy(routeFactories.SubjectPage);
const TopicPage = React.lazy(routeFactories.TopicPage);
const LessonPage = React.lazy(routeFactories.LessonPage);
const SearchPage = React.lazy(routeFactories.SearchPage);
const TextLibraryPage = React.lazy(routeFactories.TextLibraryPage);
const TextReaderPage = React.lazy(routeFactories.TextReaderPage);
const NotFoundPage = React.lazy(routeFactories.NotFoundPage);
const ColonizationMap = React.lazy(routeFactories.ColonizationMap);
const FlashcardPage = React.lazy(routeFactories.FlashcardPage);

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
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
              <Route path="flashcards" element={<FlashcardPage />} />
              <Route path="colonization" element={<ColonizationMap />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
