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
};
