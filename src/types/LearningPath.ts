export interface LearningPathMetadata {
    id: string;
    title: string;
    description: string;
    subjectId: string;
    subjectName: string;
    topicId: string;
    year?: string;
    readTime?: string;
    fileRelativePath: string;
}

export interface LearningPathRegistry {
    updatedAt: string;
    count: number;
    paths: LearningPathMetadata[];
}
