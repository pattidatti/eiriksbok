export type Position = {
    x: number;
    y: number;
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type SnakeSegment = Position;

export type FoodType = 'CORRECT' | 'WRONG';

export type FoodItem = {
    id: string;
    position: Position;
    text: string;
    type: FoodType;
};

export type ConceptLevel = {
    id: string;
    name: string;
    topic: string;
    description: string;
    targetConcept: string; // The concept the snake represents e.g., "Metafor"
    correctExamples: string[];
    wrongExamples: string[];
    backgroundColor?: string;
    snakeColor?: string;
};
