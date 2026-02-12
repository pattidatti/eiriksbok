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
    | { type: 'text' | 'paragraph'; content?: string; text?: string; title?: string; value?: string }
    | { type: 'header'; content?: string; text?: string; value?: string }
    | { type: 'subheader'; content?: string; text?: string; value?: string }
    | { type: 'image'; src: string; caption?: string; alt?: string; content?: string }
    | { type: 'component'; name: string; props?: Record<string, unknown>; component?: string }
    | { type: 'section'; title?: string; content: ContentBlock[] }
    | { type: 'list'; items: string[]; ordered?: boolean }
    | { type: 'link'; text: string; url: string; icon?: string; value?: string }
    | { type: 'poem'; title?: string; content: string; author?: string }
    | { type: 'comparison'; before: { label?: string; content: string }; after: { label?: string; content: string } }
    | { type: 'video'; url: string; title?: string; value?: string }
    | { type: 'quote'; content: string; author?: string; source?: string }
    | { type: 'expandable'; title: string; content: string }
    | { type: 'info' | 'info_box'; title?: string; content: string }
    | { type: 'comparison_card'; items: { title: string; content: string; color: string }[] }
    | { type: 'quiz'; questions: QuizQuestion[] }
    | { type: 'task'; title?: string; content?: string; text?: string }
    | { type: 'undefined';[key: string]: any };


export interface Lesson {
    id: string;
    title: string;
    subject: string;
    topic: string;
    description?: string;
    engine?: string;
    content?: ContentBlock[]; // New flexible content
    // Rich layout fields
    heroImage?: string;
    readTime?: string;
    details?: string[];
    keyPoints?: string[];
    externalUrl?: string;
    layout?: 'standard' | 'rich' | 'tool' | 'learning-path';
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
    learningPathData?: LearningPathData;
    learningPaths?: { id: string; title: string; url: string }[];
    presentation?: PresentationData;
    lessonPlan?: LessonPlan;
}

export interface LessonPlan {
    learningObjectives: string[];
    preReading: string[];
    whileReading: string[];
    postReading: string[];
    writingTask?: string | string[];
    period?: {
        title: string;
        link: string;
    };
}

export interface Quote {
    text: string;
    source?: string;
    reference?: string;
}

export interface ManifestLesson {
    id: string;
    title: string;
    year?: string;
    layout?: 'standard' | 'rich' | 'tool' | 'learning-path';
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
    showAudio?: boolean;
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
}export interface Philosopher {
    id: string;
    name: string;
    color?: string;
    dimensions: {
        metafysikk?: any; // Tina Rich Text or string
        epistemologi?: any;
        etikk?: any;
        menneskesyn?: any;
        samfunnssyn?: any;
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

export interface LearningPathStep {
    id: string;
    title: string;
    type: 'fakta' | 'refleksjon' | 'utfordring' | 'gruppe' | 'ressurs' | 'oving' | 'oppgave';
    content: string;
    icon?: string;
    links?: { title: string; url: string; external?: boolean }[];
    tasks?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    phase?: string;
    component?: {
        name: string;
        props?: Record<string, any>;
    };
}

export interface LearningPathData {
    id: string;
    title: string;
    description: string;
    steps: LearningPathStep[];
    targetTopicId?: string;
    targetSubjectId?: string;
    presentation?: PresentationData;
}

// --- Presentation & Slide System ---

export type SlideLayout =
    | 'title'      // Big central title
    | 'content'    // Progressive points + Image
    | 'comparison' // Two columns for comparison
    | 'interactive'// Full-screen focused component
    | 'quote'      // Large quote focus
    | 'discussion' // Discussion prompts/tasks focus
    | 'summary';   // Wrap-up points

export interface SlideRevealItem {
    id: string;
    text: string;
    type?: 'bullet' | 'summary' | 'key-fact';
}

export interface Slide {
    id: string;
    title: string;
    layout: SlideLayout;

    // Content for the student (Projector)
    summary?: string;
    points?: SlideRevealItem[];
    image?: string;

    // Teacher-only data (Laptop)
    teacherNotes?: string;
    depthLevel?: number; // 0-10 for pacing/detail level
    talkingPoints?: string[];

    // Interactive integration
    component?: {
        name: string;
        props?: Record<string, any>;
    };

    // Transitions & Visuals
    backgroundOpacity?: number;
    visualEffect?: 'blur' | 'scale' | 'none';

    // Source tracking
    sourceBlockId?: string; // Reference back to the original content block
}

export interface PresentationData {
    id: string;
    title: string;
    slides: Slide[];
    config?: {
        theme?: 'dark' | 'light' | 'sepia';
        transitionSpeed?: number;
        showTimer?: boolean;
        autoGenerateFromContent?: boolean; // If true, we use the mapper
    };
}
