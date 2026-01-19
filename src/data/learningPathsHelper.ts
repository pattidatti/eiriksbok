import rawData from './learningPaths.json';
import type { LearningPathRegistry } from '../types/LearningPath';

export const learningPathsData = rawData as unknown as LearningPathRegistry;
