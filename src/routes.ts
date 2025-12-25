import type { ComponentType } from 'react';

// Define the type for the module that contains the component
type PageModule = { default: ComponentType<any> };

// Factory function type
type PageFactory = () => Promise<PageModule>;

export const routeFactories: Record<string, PageFactory> = {
    LandingPage: () => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })),
    SubjectPage: () => import('./pages/SubjectPage').then(module => ({ default: module.SubjectPage })),
    TopicPage: () => import('./pages/TopicPage').then(module => ({ default: module.TopicPage })),
    LessonPage: () => import('./pages/LessonPage').then(module => ({ default: module.LessonPage })),
    SearchPage: () => import('./pages/SearchPage').then(module => ({ default: module.SearchPage })),
    TextLibraryPage: () => import('./pages/TextLibraryPage').then(module => ({ default: module.TextLibraryPage })),
    TextReaderPage: () => import('./pages/TextReaderPage').then(module => ({ default: module.TextReaderPage })),
    NotFoundPage: () => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })),
    ColonizationMap: () => import('./components/ColonizationMap/ColonizationMap'),
    FlashcardPage: () => import('./pages/FlashcardPage').then(module => ({ default: module.FlashcardPage })),
    PracticePage: () => import('./pages/PracticePage').then(module => ({ default: module.PracticePage })),
    QuizPage: () => import('./pages/QuizPage').then(module => ({ default: module.QuizPage })),
    ReligionPage: () => import('./pages/ReligionPage').then(module => ({ default: module.ReligionPage })),
    ReligionComparisonPage: () => import('./pages/ReligionComparisonPage').then(module => ({ default: module.ReligionComparisonPage })),
    PhilosophyComparisonPage: () => import('./pages/PhilosophyComparisonPage').then(module => ({ default: module.PhilosophyComparisonPage })),
    TopicComparisonPage: () => import('./pages/TopicComparisonPage').then(module => ({ default: module.TopicComparisonPage })),
    GlobalTimelinePage: () => import('./pages/GlobalTimelinePage'),
    QuizAdmin: () => import('./pages/quiz/QuizAdmin').then(module => ({ default: module.QuizAdmin })),
    QuizLobby: () => import('./pages/quiz/QuizLobby').then(module => ({ default: module.QuizLobby })),
    QuizHost: () => import('./pages/quiz/QuizHost').then(module => ({ default: module.QuizHost })),
    QuizPlayer: () => import('./pages/quiz/QuizPlayer').then(module => ({ default: module.QuizPlayer })),
    ChronoGamePage: () => import('./pages/ChronoGamePage'),
    DungeonGamePage: () => import('./pages/DungeonGamePage'),
    StatsPage: () => import('./pages/StatsPage').then(module => ({ default: module.StatsPage })),
    AdminDashboard: () => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })),
    ContentInventory: () => import('./pages/admin/ContentInventory').then(module => ({ default: module.ContentInventory })),
    LinkChecker: () => import('./pages/admin/LinkChecker').then(module => ({ default: module.LinkChecker })),
    ScannerPage: () => import('./pages/admin/ScannerPage').then(module => ({ default: module.ScannerPage })),
    RhetoricGamePage: () => import('./pages/RhetoricGamePage').then(module => ({ default: module.RhetoricGamePage })),
    HangmanPage: () => import('./pages/HangmanPage').then(module => ({ default: module.HangmanPage })),
    ChronoGliderPage: () => import('./games/chrono-glider/ChronoGliderPage'),
    TimelineTDPage: () => import('./pages/TimelineTDPage'),
    WordSorterGame: () => import('./games/word-sorter/WordSorterGame'),
    ConceptSnakeGame: () => import('./games/concept-snake/ConceptSnakeGame'),
    PersonGallery: () => import('./pages/PersonGallery').then(module => ({ default: module.PersonGallery })),
    PhilosophyOdyssey: () => import('./pages/PhilosophyOdysseyPage').then(module => ({ default: module.PhilosophyOdysseyPage })),
    DetectiveHubPage: () => import('./pages/DetectiveHubPage').then(module => ({ default: module.DetectiveHubPage })),
    DetectiveCasePage: () => import('./pages/DetectiveCasePage').then(module => ({ default: module.DetectiveCasePage })),
    EthicsExperimentPage: () => import('./pages/EthicsExperimentPage').then(module => ({ default: module.EthicsExperimentPage })),
    TimeTravelPage: () => import('./pages/TimeTravelPage').then(module => ({ default: module.TimeTravelPage })),
    TimeTravelGamePage: () => import('./pages/TimeTravelGamePage').then(module => ({ default: module.TimeTravelGamePage })),
};
