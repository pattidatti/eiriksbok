export interface TextEntry {
    id: string;
    title: string;
    author: string;
    genre: string;
    theme?: string[];
    language?: 'bm.' | 'nn.';
    url?: string;
    content?: string[];
    publishedYear?: number;
    createdDate?: string;
    lastUpdated?: string;
    definitions?: { term: string; definition: string }[];
    reflectionTasks?: string[];
    translations?: {
        language: string;
        title: string;
        content: string[];
    }[];
    lessonPlan?: {
        learningObjectives: string[];
        preReading: string[];
        whileReading: string[];
        postReading: string[];
        writingTask?: string;
        period?: {
            title: string;
            link: string;
        };
    };
}
