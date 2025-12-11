import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PageSkeleton } from './components/Skeleton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { routeFactories } from './routes';
import { UpdatePrompt } from './components/UpdatePrompt';
import { AdminGuard } from './components/AdminGuard';
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
const QuizAdmin = React.lazy(routeFactories.QuizAdmin);
const QuizLobby = React.lazy(routeFactories.QuizLobby);
const QuizHost = React.lazy(routeFactories.QuizHost);
const QuizPlayer = React.lazy(routeFactories.QuizPlayer);
const ReligionPage = React.lazy(routeFactories.ReligionPage);
const ReligionComparisonPage = React.lazy(routeFactories.ReligionComparisonPage);
const TopicComparisonPage = React.lazy(routeFactories.TopicComparisonPage);
const GlobalTimelinePage = React.lazy(routeFactories.GlobalTimelinePage);
const ChronoGamePage = React.lazy(routeFactories.ChronoGamePage);
const DungeonGamePage = React.lazy(routeFactories.DungeonGamePage);
const RhetoricGamePage = React.lazy(routeFactories.RhetoricGamePage);
const HangmanPage = React.lazy(routeFactories.HangmanPage);
const ChronoGliderPage = React.lazy(routeFactories.ChronoGliderPage);
const TimelineTDPage = React.lazy(routeFactories.TimelineTDPage);
const StatsPage = React.lazy(routeFactories.StatsPage);
const AdminDashboard = React.lazy(routeFactories.AdminDashboard);
const ContentInventory = React.lazy(routeFactories.ContentInventory);
const LinkChecker = React.lazy(routeFactories.LinkChecker);
const ScannerPage = React.lazy(routeFactories.ScannerPage);
const WordSorterGame = React.lazy(routeFactories.WordSorterGame);
const ConceptSnakeGame = React.lazy(routeFactories.ConceptSnakeGame);

import { usePresence } from './hooks/usePresence';

function App() {
  return (
    <BrowserRouter
      basename={import.meta.env.BASE_URL}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  usePresence(); // Initialize global presence tracking

  return (
    <>
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
              <Route path="oving/chrono" element={<ChronoGamePage />} />
              <Route path="oving/dungeon" element={<DungeonGamePage />} />
              <Route path="oving/retorikk" element={<RhetoricGamePage />} />
              <Route path="oving/hengemann" element={<HangmanPage />} />
              <Route path="oving/chrono-glider" element={<ChronoGliderPage />} />
              <Route path="oving/tidslinje-td" element={<TimelineTDPage />} />
              <Route path="oving/konsept-snake" element={<ConceptSnakeGame />} />

              <Route path="admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
              <Route path="admin/stats" element={<AdminGuard><StatsPage /></AdminGuard>} />
              <Route path="admin/inventory" element={<AdminGuard><ContentInventory /></AdminGuard>} />
              <Route path="admin/links" element={<AdminGuard><LinkChecker /></AdminGuard>} />
              <Route path="admin/scanner" element={<AdminGuard><ScannerPage /></AdminGuard>} />

              {/* Quiz Battle Routes */}
              <Route path="quiz-battle" element={<QuizLobby />} />
              <Route path="quiz-battle/admin-999" element={<QuizAdmin />} /> {/* "Secret" url for now */}
              <Route path="quiz-battle/host/:pin" element={<QuizHost />} />
              <Route path="quiz-battle/play/:pin" element={<QuizPlayer />} />

              <Route path="krle/sammenlign" element={<ReligionComparisonPage />} />
              <Route path="krle/sammenlign/tema/:tag" element={<TopicComparisonPage />} />
              <Route path="krle/religion/:religionId" element={<ReligionPage />} />

              <Route path=":subjectId" element={<SubjectPage />} />
              <Route path=":subjectId/:topicId" element={<TopicPage />} />
              <Route path=":subjectId/:topicId/:subTopicId" element={<TopicPage />} />
              <Route path=":subjectId/:topicId/:subTopicId/:lessonId" element={<LessonPage />} />
              <Route path="/norsk/ordklasser/sortering" element={<WordSorterGame />} />
              <Route path=":subjectId/:topicId/:lessonId" element={<LessonPage />} />

              {/* Backward compatibility / direct access */}
              <Route path="flashcards" element={<FlashcardPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default App;
