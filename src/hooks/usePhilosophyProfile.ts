import { useState, useEffect, useCallback } from 'react';
import type { PhilosophyProfile, PhilosophyAxis } from '../data/philosophy/types';

const PROFILE_KEY = 'odyssey_philosophy_profile';

const INITIAL_PROFILE: PhilosophyProfile = {
    xp: 0,
    level: 1,
    completedQuests: [],
    alignment: {
        rationalism: 50,
        empiricism: 50,
        stoicism: 50,
        epicureanism: 50,
        idealism: 50,
        materialism: 50
    },
    achievements: [],
    lastActive: Date.now()
};

const XP_PER_LEVEL = 1000;

export const usePhilosophyProfile = () => {
    const [profile, setProfile] = useState<PhilosophyProfile>(INITIAL_PROFILE);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(PROFILE_KEY);
        if (stored) {
            try {
                setProfile(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse philosophy profile', e);
            }
        }
        setIsLoaded(true);
    }, []);

    const saveProfile = useCallback((newProfile: PhilosophyProfile) => {
        setProfile(newProfile);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    }, []);

    const addXp = useCallback((amount: number) => {
        setProfile(prev => {
            const newXp = prev.xp + amount;
            const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
            const updatedProfile = {
                ...prev,
                xp: newXp,
                level: newLevel,
                lastActive: Date.now()
            };
            localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
            return updatedProfile;
        });
    }, []);

    const updateAlignment = useCallback((changes: Partial<Record<PhilosophyAxis, number>>) => {
        setProfile(prev => {
            const newAlignment = { ...prev.alignment };
            (Object.keys(changes) as PhilosophyAxis[]).forEach(axis => {
                const change = changes[axis] || 0;
                // Clamping between 0 and 100
                newAlignment[axis] = Math.max(0, Math.min(100, (newAlignment[axis] || 50) + change));
            });

            const updatedProfile = {
                ...prev,
                alignment: newAlignment,
                lastActive: Date.now()
            };
            localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
            return updatedProfile;
        });
    }, []);

    const completeQuest = useCallback((questId: string, xpReward: number) => {
        setProfile(prev => {
            if (prev.completedQuests.includes(questId)) return prev;

            const newXp = prev.xp + xpReward;
            const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
            const updatedProfile = {
                ...prev,
                completedQuests: [...prev.completedQuests, questId],
                xp: newXp,
                level: newLevel,
                lastActive: Date.now()
            };
            localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
            return updatedProfile;
        });
    }, []);

    return {
        profile,
        isLoaded,
        addXp,
        updateAlignment,
        completeQuest,
        resetProfile: () => saveProfile(INITIAL_PROFILE)
    };
};
