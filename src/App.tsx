import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PageSkeleton } from './components/Skeleton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { routeFactories } from './routes';
import { UpdatePrompt } from './components/UpdatePrompt';
import './App.css';

// Lazy load pages using centralized factories
const LandingPage = React.lazy(routeFactories.LandingPage);
const SubjectPage = React.lazy(routeFactories.SubjectPage);
const TopicPage = React.lazy(routeFactories.TopicPage);
const LessonPage = React.lazy(routeFactories.LessonPage);
// const LessonPage = React.lazy(() => import('./pages/LessonPageDebug').then(module => ({ default: module.LessonPage })));
const SearchPage = React.lazy(routeFactories.SearchPage);
const TextLibraryPage = React.lazy(routeFactories.TextLibraryPage);
const TextReaderPage = React.lazy(routeFactories.TextReaderPage);
const NotFoundPage = React.lazy(routeFactories.NotFoundPage);
const FlashcardPage = React.lazy(routeFactories.FlashcardPage);
const PracticePage = React.lazy(routeFactories.PracticePage);
const QuizPage = React.lazy(routeFactories.QuizPage);
const ReligionPage = React.lazy(routeFactories.ReligionPage);
const ReligionComparisonPage = React.lazy(routeFactories.ReligionComparisonPage);
const TopicComparisonPage = React.lazy(routeFactories.TopicComparisonPage);
const GlobalTimelinePage = React.lazy(routeFactories.GlobalTimelinePage);

function App() {
  return (
    <BrowserRouter
      basename={import.meta.env.BASE_URL}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <UpdatePrompt />
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<LandingPage />} />
              <Route path="sok" element={<SearchPage />} />
              <Route path="norsk/bibliotek" element={<TextLibraryPage />} />
              <Route path="norsk/bibliotek/:textId" element={<TextReaderPage />} />
              <Route path="tidslinje" element={<GlobalTimelinePage />} />

              {/* Static routes must come before dynamic :subjectId routes */}
              <Route path="oving" element={<PracticePage />} />
              <Route path="oving/flashcards" element={<FlashcardPage />} />
              <Route path="oving/quiz" element={<QuizPage />} />

              <Route path="krle/sammenlign" element={<ReligionComparisonPage />} />
              <Route path="krle/sammenlign/tema/:tag" element={<TopicComparisonPage />} />
              <Route path="krle/religion/:religionId" element={<ReligionPage />} />

              <Route path=":subjectId" element={<SubjectPage />} />
              <Route path=":subjectId/:topicId" element={<TopicPage />} />
              <Route path=":subjectId/:topicId/:subTopicId" element={<TopicPage />} />
              <Route path=":subjectId/:topicId/:subTopicId/:lessonId" element={<LessonPage />} />
              <Route path=":subjectId/:topicId/:lessonId" element={<LessonPage />} />

              {/* Backward compatibility / direct access */}
              <Route path="flashcards" element={<FlashcardPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
