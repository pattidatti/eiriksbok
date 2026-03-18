import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DeviceProgress, Level } from '../data/virkemiddelverkstedet/types';

const DEFAULT_PROGRESS: DeviceProgress = {
    completedExercises: [],
    levelUnlocked: 1,
    bestScore: 0,
    currentStreak: 0,
    maxStreak: 0,
};

interface VirkemiddelState {
    progress: Record<string, DeviceProgress>;
    totalPoints: number;

    getDeviceProgress: (deviceId: string) => DeviceProgress;
    completeExercise: (deviceId: string, exerciseId: string, points: number) => void;
    unlockLevel: (deviceId: string, level: Exclude<Level, 1>) => void;
    incrementStreak: (deviceId: string) => void;
    resetStreak: (deviceId: string) => void;
    addPoints: (points: number) => void;
    resetAll: () => void;
}

export const useVirkemiddelStore = create<VirkemiddelState>()(
    persist(
        (set, get) => ({
            progress: {},
            totalPoints: 0,

            getDeviceProgress: (deviceId) => {
                return get().progress[deviceId] || { ...DEFAULT_PROGRESS };
            },

            completeExercise: (deviceId, exerciseId, points) =>
                set((state) => {
                    const current = state.progress[deviceId] || { ...DEFAULT_PROGRESS };
                    if (current.completedExercises.includes(exerciseId)) return state;
                    return {
                        progress: {
                            ...state.progress,
                            [deviceId]: {
                                ...current,
                                completedExercises: [...current.completedExercises, exerciseId],
                                bestScore: current.bestScore + points,
                            },
                        },
                        totalPoints: state.totalPoints + points,
                    };
                }),

            unlockLevel: (deviceId, level) =>
                set((state) => {
                    const current = state.progress[deviceId] || { ...DEFAULT_PROGRESS };
                    if (current.levelUnlocked >= level) return state;
                    return {
                        progress: {
                            ...state.progress,
                            [deviceId]: { ...current, levelUnlocked: level },
                        },
                    };
                }),

            incrementStreak: (deviceId) =>
                set((state) => {
                    const current = state.progress[deviceId] || { ...DEFAULT_PROGRESS };
                    const newStreak = current.currentStreak + 1;
                    return {
                        progress: {
                            ...state.progress,
                            [deviceId]: {
                                ...current,
                                currentStreak: newStreak,
                                maxStreak: Math.max(current.maxStreak, newStreak),
                            },
                        },
                    };
                }),

            resetStreak: (deviceId) =>
                set((state) => {
                    const current = state.progress[deviceId] || { ...DEFAULT_PROGRESS };
                    return {
                        progress: {
                            ...state.progress,
                            [deviceId]: { ...current, currentStreak: 0 },
                        },
                    };
                }),

            addPoints: (points) =>
                set((state) => ({
                    totalPoints: state.totalPoints + points,
                })),

            resetAll: () => set({ progress: {}, totalPoints: 0 }),
        }),
        {
            name: 'virkemiddelverkstedet',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
