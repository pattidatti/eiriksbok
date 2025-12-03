

/**
 * Centralized routing logic for the application.
 * Use these helpers instead of manual string concatenation.
 */

export const getSubjectUrl = (subjectId: string) => `/${subjectId}`;

export const getTopicUrl = (subjectId: string, topicId: string) => `/${subjectId}/${topicId}`;

export const getSubTopicUrl = (subjectId: string, topicId: string, subTopicId: string) => `/${subjectId}/${topicId}/${subTopicId}`;

export const getLessonUrl = (subjectId: string, topicId: string, lessonId: string, subTopicId?: string) => {
    if (subTopicId) {
        return `/${subjectId}/${topicId}/${subTopicId}/${lessonId}`;
    }
    return `/${subjectId}/${topicId}/${lessonId}`;
};

export const ROUTES = {
    HOME: '/',
    SEARCH: '/sok',
    LIBRARY: '/bibliotek',
    TIMELINE: '/tidslinje',
};

// Route Factories for Lazy Loading
export const routeFactories = {
    LandingPage: () => import('../pages/LandingPage'),
    SubjectPage: () => import('../pages/SubjectPage'),
    TopicPage: () => import('../pages/TopicPage'),
    LessonPage: () => import('../pages/LessonPage'),
    SearchPage: () => import('../pages/SearchPage'),
    TextLibraryPage: () => import('../pages/TextLibraryPage'),
    TextReaderPage: () => import('../pages/TextReaderPage'),
    NotFoundPage: () => import('../pages/NotFoundPage'),
    FlashcardPage: () => import('../pages/FlashcardPage'),
    PracticePage: () => import('../pages/PracticePage'),
    QuizPage: () => import('../pages/QuizPage'),
    ReligionPage: () => import('../pages/ReligionPage'),
    ReligionComparisonPage: () => import('../pages/ReligionComparisonPage'),
    TopicComparisonPage: () => import('../pages/TopicComparisonPage'),
    GlobalTimelinePage: () => import('../pages/GlobalTimelinePage'),
};
