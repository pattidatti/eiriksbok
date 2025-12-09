import { create } from 'zustand';

export type GameState = 'menu' | 'playing' | 'gameover' | 'won';

export interface TimelineEvent {
    id: string;
    title: string;
    year: number;
    description: string;
    displayDate?: string;
}

export interface GameStore {
    score: number;
    lives: number;
    gameState: GameState;
    speed: number;
    currentEventIndex: number;
    events: TimelineEvent[];

    // Actions
    startGame: () => void;
    endGame: (won: boolean) => void;
    resetGame: () => void;
    addScore: (points: number) => void;
    loseLife: () => void;
    nextEvent: () => void;
    setEvents: (events: TimelineEvent[]) => void;
    increaseSpeed: () => void;

    // Feedback
    feedbackTrigger: { type: 'correct' | 'wrong', position: [number, number, number], id: number } | null;
    triggerFeedback: (type: 'correct' | 'wrong', position: [number, number, number]) => void;
}

export const useGameStore = create<GameStore>((set) => ({
    score: 0,
    lives: 3,
    gameState: 'menu',
    speed: 10,
    currentEventIndex: 0,
    events: [],
    feedbackTrigger: null,

    startGame: () => set({ gameState: 'playing', score: 0, lives: 3, speed: 10, currentEventIndex: 0, feedbackTrigger: null }),
    endGame: (won) => set({ gameState: won ? 'won' : 'gameover' }),
    resetGame: () => set({ gameState: 'menu', score: 0, lives: 3, currentEventIndex: 0, feedbackTrigger: null }),

    addScore: (points) => set((state) => ({ score: state.score + points })),

    loseLife: () => set((state) => {
        const newLives = state.lives - 1;
        if (newLives <= 0) {
            return { lives: 0, gameState: 'gameover' };
        }
        return { lives: newLives };
    }),

    nextEvent: () => set((state) => {
        const nextIndex = state.currentEventIndex + 1;
        if (nextIndex >= state.events.length) {
            return { gameState: 'won' };
        }
        return { currentEventIndex: nextIndex };
    }),

    setEvents: (events) => set({ events }),

    increaseSpeed: () => set((state) => ({ speed: state.speed + 0.5 })),

    triggerFeedback: (type, position) => set({ feedbackTrigger: { type, position, id: Date.now() } }),
}));
