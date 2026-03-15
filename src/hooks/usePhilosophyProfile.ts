import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PhilosophyProfile, PhilosophyAxis, Achievement } from '../data/philosophy/types';
import { QUEST_REGISTRY } from '../data/philosophy/questRegistry';

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
        materialism: 50,
        individualism: 50,
        collectivism: 50,
        existentialism: 50,
        essentialism: 50,
        skepticism: 50,
        dogmatism: 50,
    },
    achievements: [],
    lastActive: Date.now()
};

const XP_PER_LEVEL = 1000;

const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-quest',
        title: 'Nysgjerrig',
        description: 'Fullfort din forste filosofiske dialog.',
        icon: 'sparkles',
        condition: (p) => p.completedQuests.length >= 1,
    },
    {
        id: 'antikken-komplett',
        title: 'Oldtidskjenner',
        description: 'Fullfort alle dialoger fra Antikken.',
        icon: 'scroll',
        condition: (p) => {
            const antikkenIds = Object.values(QUEST_REGISTRY)
                .filter(q => q.era === 'antikken' && !q.isSecondary)
                .map(q => q.id);
            return antikkenIds.every(id => p.completedQuests.includes(id));
        },
    },
    {
        id: 'five-quests',
        title: 'Filosof',
        description: 'Fullfort fem filosofiske dialoger.',
        icon: 'brain',
        condition: (p) => p.completedQuests.length >= 5,
    },
    {
        id: 'ten-quests',
        title: 'Dyptenker',
        description: 'Fullfort ti filosofiske dialoger.',
        icon: 'graduation-cap',
        condition: (p) => p.completedQuests.length >= 10,
    },
    {
        id: 'all-primary',
        title: 'Mester av Odysseen',
        description: 'Fullfort alle primerdialoger.',
        icon: 'trophy',
        condition: (p) => {
            const primaryIds = Object.values(QUEST_REGISTRY)
                .filter(q => !q.isSecondary)
                .map(q => q.id);
            return primaryIds.every(id => p.completedQuests.includes(id));
        },
    },
];

function migrateProfile(stored: PhilosophyProfile): PhilosophyProfile {
    const alignment = { ...INITIAL_PROFILE.alignment };
    if (stored.alignment) {
        for (const key of Object.keys(alignment) as PhilosophyAxis[]) {
            if (key in stored.alignment) {
                alignment[key] = stored.alignment[key];
            }
        }
    }
    return { ...stored, alignment };
}

export const usePhilosophyProfile = () => {
    const [profile, setProfile] = useState<PhilosophyProfile>(INITIAL_PROFILE);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(PROFILE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setProfile(migrateProfile(parsed));
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

    const updateAlignment = useCallback((changes: Partial<Record<string, number>>) => {
        setProfile(prev => {
            const newAlignment = { ...prev.alignment };
            const validAxes = Object.keys(INITIAL_PROFILE.alignment) as PhilosophyAxis[];

            for (const [axis, change] of Object.entries(changes)) {
                if (!change) continue;
                if (validAxes.includes(axis as PhilosophyAxis)) {
                    newAlignment[axis as PhilosophyAxis] = Math.max(0, Math.min(100, (newAlignment[axis as PhilosophyAxis] || 50) + change));
                }
            }

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
            const newCompleted = [...prev.completedQuests, questId];

            const tempProfile: PhilosophyProfile = {
                ...prev,
                completedQuests: newCompleted,
                xp: newXp,
                level: newLevel,
            };
            const earnedAchievements = ACHIEVEMENTS
                .filter(a => a.condition(tempProfile))
                .map(a => a.id);

            const updatedProfile = {
                ...tempProfile,
                achievements: earnedAchievements,
                lastActive: Date.now()
            };
            localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
            return updatedProfile;
        });
    }, []);

    const earnedAchievements = useMemo(() => {
        return ACHIEVEMENTS.filter(a => a.condition(profile));
    }, [profile]);

    const progress = useMemo(() => {
        const primaryQuests = Object.values(QUEST_REGISTRY).filter(q => !q.isSecondary);
        const completed = primaryQuests.filter(q => profile.completedQuests.includes(q.id));
        return {
            completed: completed.length,
            total: primaryQuests.length,
            percent: primaryQuests.length > 0 ? Math.round((completed.length / primaryQuests.length) * 100) : 0,
        };
    }, [profile]);

    return {
        profile,
        isLoaded,
        addXp,
        updateAlignment,
        completeQuest,
        resetProfile: () => saveProfile(INITIAL_PROFILE),
        earnedAchievements,
        progress,
        ACHIEVEMENTS,
    };
};
