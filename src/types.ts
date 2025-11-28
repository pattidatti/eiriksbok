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

export interface Lesson {
    id: string;
    title: string;
    subject: string;
    topic: string;
    concepts: Concept[];
    context: Context;
    quiz: QuizQuestion[];
}

export interface ManifestLesson {
    id: string;
    title: string;
    date?: string;
    tags?: string[];
    description?: string;
}

export interface ManifestSubTopic {
    id: string;
    title: string;
    lessons: ManifestLesson[];
}

export interface ManifestTopic {
    id: string;
    title: string;
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
