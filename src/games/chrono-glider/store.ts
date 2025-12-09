import { create } from 'zustand';
import { AudioManager } from './systems/AudioManager';

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

    // Player State
    isBoosting: boolean;
    setBoosting: (boosting: boolean) => void;

    // Projectiles triggers (handled via events/store for simplicity or refs in components)
    lastFired: number;
    fireProjectile: () => void;

    // Advanced Stats
    streak: number;
    multiplier: number;
    resetStreak: () => void;
    incrementStreak: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
    score: 0,
    lives: 3,
    gameState: 'menu',
    speed: 10,
    currentEventIndex: 0,
    events: [],
    feedbackTrigger: null,
    isBoosting: false,
    lastFired: 0,
    streak: 0,
    multiplier: 1,

    startGame: () => set({ gameState: 'playing', score: 0, lives: 3, speed: 10, currentEventIndex: 0, feedbackTrigger: null, isBoosting: false, streak: 0, multiplier: 1 }),
    endGame: (won) => set({ gameState: won ? 'won' : 'gameover', isBoosting: false }),
    resetGame: () => set({ gameState: 'menu', score: 0, lives: 3, currentEventIndex: 0, feedbackTrigger: null, isBoosting: false, streak: 0, multiplier: 1 }),

    addScore: (points) => set((state) => {
        // Simple heuristic: if points > 0, play sound? 
        // We probably don't want sound every frame if score trickles, but addScore is usually event based.
        // Except for powerups (500) or gates (100).
        if (points === 500) AudioManager.getInstance().playCorrect(); // Powerup sound reuse or new one?
        return { score: state.score + (points * state.multiplier) };
    }),

    loseLife: () => set((state) => {
        AudioManager.getInstance().playExplosion();
        const newLives = state.lives - 1;
        if (newLives <= 0) {
            AudioManager.getInstance().playWrong(); // Game Over sound
            return { lives: 0, gameState: 'gameover', streak: 0, multiplier: 1 };
        }
        return { lives: newLives, streak: 0, multiplier: 1 };
    }),

    nextEvent: () => set((state) => {
        const nextIndex = state.currentEventIndex + 1;
        if (nextIndex >= state.events.length) {
            AudioManager.getInstance().playCorrect(); // Win sound
            return { gameState: 'won' };
        }
        return { currentEventIndex: nextIndex };
    }),

    setEvents: (events) => set({ events }),

    increaseSpeed: () => set((state) => ({ speed: state.speed + 0.5 })),

    triggerFeedback: (type, position) => {
        if (type === 'correct') AudioManager.getInstance().playCorrect();
        if (type === 'wrong') AudioManager.getInstance().playWrong();
        set({ feedbackTrigger: { type, position, id: Date.now() } });
    },

    setBoosting: (boosting) => set((state) => {
        if (boosting && !state.isBoosting) AudioManager.getInstance().playBoost();
        return {
            isBoosting: boosting,
            speed: boosting ? 20 : 10
        };
    }),

    fireProjectile: () => {
        AudioManager.getInstance().playShoot();
        set({ lastFired: Date.now() });
    },

    resetStreak: () => set({ streak: 0, multiplier: 1 }),

    incrementStreak: () => set((state) => {
        const newStreak = state.streak + 1;
        // Multiplier categories
        let newMult = 1;
        if (newStreak >= 3) newMult = 2;
        if (newStreak >= 6) newMult = 3;
        if (newStreak >= 10) newMult = 5;

        return { streak: newStreak, multiplier: newMult };
    }),
}));
