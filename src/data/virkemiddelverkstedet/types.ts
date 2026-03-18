export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type ApplyLevel = 1 | 2 | 3;
export type WorkshopMode = 'analyser' | 'bruk';

export interface DeviceTheory {
    definition: string;
    howToRecognize: string;
    examples: {
        text: string;
        explanation: string;
    }[];
    commonMistakes?: string;
}

export interface LiteraryDevice {
    id: string;
    name: string;
    emoji: string;
    shortDescription: string;
    color: string;
    category: 'virkemiddel' | 'analyse';
    theory: DeviceTheory;
}

export interface HighlightData {
    type: 'highlight';
    text: string;
    correctRanges: {
        words: string;
        explanation: string;
    }[];
}

export interface ExplainData {
    type: 'explain';
    text: string;
    highlightedWords: string;
    question: string;
    options: {
        text: string;
        correct: boolean;
        feedback: string;
    }[];
}

export interface IdentifyData {
    type: 'identify';
    text: string;
    options: {
        deviceId: string;
        label: string;
        correct: boolean;
        feedback: string;
    }[];
}

export interface MatchData {
    type: 'match';
    pairs: {
        example: string;
        label: string;
    }[];
}

export interface WriteData {
    type: 'write';
    prompt: string;
    hint?: string;
    exampleAnswer: string;
}

export interface FillBlankData {
    type: 'fill-blank';
    textBefore: string;
    textAfter: string;
    correctAnswers: string[];
    explanation: string;
}

export interface SortData {
    type: 'sort';
    categories: { id: string; label: string }[];
    items: { text: string; categoryId: string }[];
}

export interface TrueFalseData {
    type: 'true-false';
    statement: string;
    correct: boolean;
    explanation: string;
}

export interface FindErrorData {
    type: 'find-error';
    text: string;
    errorDescription: string;
    options: {
        text: string;
        correct: boolean;
        feedback: string;
    }[];
}

export type ExerciseData =
    | HighlightData
    | ExplainData
    | IdentifyData
    | MatchData
    | WriteData
    | FillBlankData
    | SortData
    | TrueFalseData
    | FindErrorData;

export interface Exercise {
    id: string;
    deviceId: string;
    level: Level | ApplyLevel;
    instruction: string;
    data: ExerciseData;
}

export interface DeviceProgress {
    completedExercises: string[];
    levelUnlocked: Level;
    bestScore: number;
    currentStreak: number;
    maxStreak: number;
}

export type ViewState =
    | { view: 'grid' }
    | { view: 'theory'; deviceId: string }
    | { view: 'levels'; deviceId: string }
    | { view: 'exercise'; deviceId: string; level: Level | ApplyLevel }
    | { view: 'completion'; deviceId: string; level: Level | ApplyLevel; score: number }
    | { view: 'mastery'; deviceId: string };
