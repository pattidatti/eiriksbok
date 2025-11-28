export interface Concept {
    id: string;
    term: string;
    definition: string;
    example: string;
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
    answer: string;
}

export type ContentBlock =
    | { type: 'text'; content: string; title?: string }
    | { type: 'image'; src: string; caption?: string; alt: string }
    | { type: 'component'; name: string; props?: Record<string, any> };

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
}

export interface ManifestLesson {
    id: string;
    title: string;
    date?: string;
    tags?: string[];
    description?: string;
    image?: string;
}

export interface ManifestSubTopic {
    id: string;
    title: string;
    description?: string;
    image?: string;
    lessons: ManifestLesson[];
}

export interface ManifestTopic {
    id: string;
    title: string;
    description?: string;
    image?: string;
    lessons?: ManifestLesson[];
    subTopics?: ManifestSubTopic[];
}

export interface ManifestSubject {
    id: string;
    title: string;
    topics: ManifestTopic[];
}

export interface Manifest {
    subjects: ManifestSubject[];
}
