export interface Concept {
    id: string;
    term: string;
    definition: string;
    example?: string;
    // Compatibility fields for legacy/different formats
    title?: string;
    description?: string;
}

export interface Connection {
    from: string;
    to: string;
    label: string;
}

export interface Context {
    connections: Connection[];
}

export interface QuizQuestion {
    question: string;
    options: string[];
    answer?: string;
    correctAnswer?: number; // Index of correct answer
    sourceUrl?: string;
    sourceTitle?: string;
    type?: 'multiple_choice' | 'boolean' | 'sorting';
}

export interface MapData {
    center: [number, number];
    zoom: number;
    markers?: Array<{
        position: [number, number];
        title: string;
        description?: string;
    }>;
}

export type ContentBlock =
    | { type: 'text'; content?: string; text?: string; title?: string }
    | { type: 'header'; content: string }
    | { type: 'image'; src: string; caption?: string; alt: string }
    | { type: 'component'; name: string; props?: Record<string, unknown> }
    | { type: 'section'; title?: string; content: ContentBlock[] }
    | { type: 'list'; items: string[] }
    | { type: 'link'; text: string; url: string; icon?: string };

export interface Lesson {
    id: string;
    title: string;
    subject: string;
    topic: string;
    content?: ContentBlock[]; // New flexible content
    // Rich layout fields
    heroImage?: string;
    readTime?: string;
    details?: string[];
    externalUrl?: string;
    layout?: 'standard' | 'rich';
    year?: string;
    category?: string;
    // Legacy fields for backward compatibility
    concepts?: Concept[];
    context?: Context;
    quiz?: QuizQuestion[];

    fact?: string;
    mapData?: MapData;
    tags?: string[];
    comparison_tags?: string[];
    relatedLink?: { text: string; url: string; };
    quote?: Quote;
    flashcards?: { front: string; back: string }[];
}

export interface Quote {
    text: string;
    source?: string;
    reference?: string;
}

export interface ManifestLesson {
    id: string;
    title: string;
    date?: string;
    createdDate?: string;
    updatedDate?: string;
    lastUpdated?: string;
    description?: string;
    image?: string;
    tags?: string[];
    definitions?: { term: string; definition: string }[];
    content?: string;
    mapData?: MapData;
}

export interface TopicTool {
    id: string;
    title: string;
    description?: string;
    link: string;
    icon?: string;
}

export interface ManifestSubTopic {
    id: string;
    title: string;
    description?: string;
    image?: string;
    lessons: ManifestLesson[];
    tools?: TopicTool[];
}

export interface ManifestTopic {
    id: string;
    title: string;
    image?: string;
    description?: string;
    lessons?: ManifestLesson[];
    subTopics?: ManifestSubTopic[];
    tags?: string[];
    tools?: TopicTool[];
}

export interface ManifestSubject {
    id: string;
    title: string;
    topics: ManifestTopic[];
    tools?: TopicTool[];
}

export interface SidebarConfig {
    showTimeline?: boolean;
    showRelated?: boolean;
    showConcepts?: boolean;
    showTools?: boolean;
}

export interface Manifest {
    subjects: ManifestSubject[];
}

export interface InteractiveComponentProps {
    data?: unknown;
    onComplete?: () => void;
    className?: string;
}
export interface Religion {
    id: string;
    name: string;
    color?: string;
    icon?: string;
    dimensions: {
        ritual?: any; // Tina Rich Text
        narrative?: any;
        experiential?: any;
        social?: any;
        ethical?: any;
        doctrinal?: any;
        material?: any;
    };
}

export interface GlobalTimelineEvent {
    id: string;
    title: string;
    description?: string;
    startDate: number;
    endDate?: number | null;
    displayDate: string;
    type: 'lesson' | 'text' | 'event';
    subjectId: string;
    topicId?: string;
    link: string;
    tags?: string[];
    // Extended fields for compatibility with InteractiveArticle
    content?: ContentBlock[];
    year?: string;
    details?: string[];
    category?: string;
    readTime?: string;
    heroImage?: string;
    url?: string;

    fact?: string;
    mapData?: MapData;
}

// Text Analysis Game Types
export interface TextAnalysisCategory {
    id: string; // e.g., 'etos'
    label: string; // e.g., 'Etos'
    color: string; // e.g., 'blue-500' - standard Tailwind colors
    description: string; // Tooltip info
}

export interface TextAnalysisSpan {
    id: string;
    start: number; // Character index start
    end: number;   // Character index end
    categoryId: string; // e.g. 'etos'
    explanation: string; // Shown after discovery
}

export interface TextAnalysisGameData {
    id: string;
    title: string;
    text: string; // The full text content
    categories: TextAnalysisCategory[];
    solutions: TextAnalysisSpan[];
}
