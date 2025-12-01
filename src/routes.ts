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
};
