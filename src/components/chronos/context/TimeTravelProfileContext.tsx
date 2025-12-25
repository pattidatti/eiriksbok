import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ChronosProfile, ChronosRunLog } from '../../data/chronos/types';

interface TimeTravelProfileContextType {
    profile: ChronosProfile | null;
    isLoading: boolean;
    saveRun: (log: ChronosRunLog) => void;
    unlockScenario: (scenarioId: string) => void;
    unlockTrophy: (trophyId: string) => void;
    addLegacyItem: (itemId: string) => void;
    resetProfile: () => void;
}

const STORAGE_KEY = 'chronos_profile_v1';

const DEFAULT_PROFILE: ChronosProfile = {
    id: 'local_user',
    name: 'Tidsreisende',
    created: Date.now(),
    unlockedScenarios: ['roman-soldier'], // Default unlocked
    trophies: [],
    graveyard: [],
    legacyItems: [],
    totalRuns: 0,
    totalWins: 0
};

const TimeTravelProfileContext = createContext<TimeTravelProfileContextType | undefined>(undefined);

export const TimeTravelProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<ChronosProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load Profile
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setProfile(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse profile", e);
                setProfile(DEFAULT_PROFILE);
            }
        } else {
            setProfile(DEFAULT_PROFILE);
        }
        setIsLoading(false);
    }, []);

    // Save Profile Effect
    useEffect(() => {
        if (profile) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        }
    }, [profile]);

    const saveRun = (log: ChronosRunLog) => {
        if (!profile) return;
        setProfile((prev: ChronosProfile | null) => {
            if (!prev) return null;
            return {
                ...prev,
                graveyard: [log, ...prev.graveyard],
                totalRuns: prev.totalRuns + 1,
                totalWins: log.result === 'victory' ? prev.totalWins + 1 : prev.totalWins
            };
        });
    };

    const addLegacyItem = (itemId: string) => {
        if (!profile) return;
        if (!profile.legacyItems.includes(itemId)) {
            setProfile((prev: ChronosProfile | null) => prev ? ({
                ...prev,
                legacyItems: [...prev.legacyItems, itemId]
            }) : null);
        }
    };

    const unlockScenario = (scenarioId: string) => {
        if (!profile) return;
        if (!profile.unlockedScenarios.includes(scenarioId)) {
            setProfile((prev: ChronosProfile | null) => prev ? ({
                ...prev,
                unlockedScenarios: [...prev.unlockedScenarios, scenarioId]
            }) : null);
        }
    };

    const unlockTrophy = (trophyId: string) => {
        if (!profile) return;
        if (!profile.trophies.includes(trophyId)) {
            setProfile((prev: ChronosProfile | null) => prev ? ({
                ...prev,
                trophies: [...prev.trophies, trophyId]
            }) : null);
        }
    };

    const resetProfile = () => {
        setProfile(DEFAULT_PROFILE);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <TimeTravelProfileContext.Provider value={{ profile, isLoading, saveRun, unlockScenario, unlockTrophy, addLegacyItem, resetProfile }}>
            {children}
        </TimeTravelProfileContext.Provider>
    );
};

export const useTimeTravelProfile = () => {
    const context = useContext(TimeTravelProfileContext);
    if (context === undefined) {
        throw new Error('useTimeTravelProfile must be used within a TimeTravelProfileProvider');
    }
    return context;
};
