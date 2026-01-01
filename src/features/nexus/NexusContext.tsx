import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulationAuth } from '../simulation/SimulationAuthContext';

// Types for the Nexus Meta-Layer
interface Vessel {
    id: string;
    name: string;
    role: string;
    location: string;
    gold: number;
    health: number;
    lastPlayed: Date;
    isDead: boolean;
}

interface MetaProfile {
    operatorName: string; // The Player's meta-name
    soulRank: number;
    soulExp: number;
    nextRankExp: number;
    achievedTitles: string[];
}

interface NexusContextType {
    // State
    vessels: Vessel[];
    metaProfile: MetaProfile;
    activeVesselId: string | null;

    // Actions
    selectVessel: (vesselId: string) => void;
    createVessel: (name: string, role: string) => void;
    deleteVessel: (vesselId: string) => void;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

// Real Data from Account (Active Sessions)
export const NexusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { account } = useSimulationAuth();

    // Local "Draft" Vessels (Characters created but not yet deployed)
    const [draftVessels, setDraftVessels] = useState<Vessel[]>([]);

    // Combine Active and Draft vessels
    const [testVessel, setTestVessel] = useState<Vessel | null>(null);

    // Fetch TEST server character specifically
    React.useEffect(() => {
        if (!account?.uid) return;
        const fetchTestChar = async () => {
            try {
                const { ref, get } = await import('firebase/database');
                const { simulationDb } = await import('../simulation/simulationFirebase');
                const snapshot = await get(ref(simulationDb, `simulation_rooms/TEST/players/${account.uid}`));

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setTestVessel({
                        id: 'TEST',
                        name: data.name,
                        role: data.role,
                        location: 'TEST SERVER (Active)',
                        gold: data.resources?.gold || 0,
                        health: data.status?.hp || 100,
                        lastPlayed: new Date(data.lastActive || Date.now()),
                        isDead: data.status?.hp <= 0,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch TEST character", err);
            }
        };
        fetchTestChar();
    }, [account?.uid]);

    const vessels: Vessel[] = [
        ...(testVessel ? [testVessel] : []),
        ...(account?.activeSessions || []).map(s => ({
            id: s.roomPin,
            name: s.name,
            role: s.role,
            location: s.roomPin,
            gold: 0,
            health: 100,
            lastPlayed: new Date(s.lastPlayed),
            isDead: false,
            type: 'ACTIVE' as const
        })),
        ...draftVessels
    ];

    const [metaProfile, setMetaProfile] = useState<MetaProfile>({
        operatorName: account?.displayName || 'Unknown Operator',
        soulRank: account?.globalLevel || 1,
        soulExp: account?.globalXp || 0,
        nextRankExp: 1000 * (account?.globalLevel || 1),
        achievedTitles: account?.unlockedAchievements || []
    });

    const [activeVesselId, setActiveVesselId] = useState<string | null>(null);

    const navigate = useNavigate();

    const selectVessel = (vesselId: string) => {
        setActiveVesselId(vesselId);

        const vessel = vessels.find(v => v.id === vesselId);
        if (!vessel) return;

        // Simulate "Possession" delay then navigate
        setTimeout(() => {
            if (vessel.location.startsWith('DRAFT')) {
                // It's a Draft - Go to Lobby to Deploy
                navigate('/sim', {
                    state: {
                        prefilledName: vessel.name,
                        prefilledRole: vessel.role,
                        isDeploying: true
                    }
                });
            } else {
                // It's an Active Session - Go to Room
                navigate(`/sim/play/${vessel.id}`);
            }
            setActiveVesselId(null); // Reset loader
        }, 1500);
    };

    const createVessel = (name: string, role: string) => {
        const newVessel: Vessel = {
            id: `draft_${Date.now()}`,
            name,
            role,
            location: 'DRAFT_MODE', // Marker for draft
            gold: 0,
            health: 100,
            lastPlayed: new Date(),
            isDead: false
        };
        setDraftVessels(prev => [...prev, newVessel]);
    };

    const deleteVessel = (vesselId: string) => {
        setDraftVessels(prev => prev.filter(v => v.id !== vesselId));
        // Note: Cannot delete active sessions from here yet
    };

    return (
        <NexusContext.Provider value={{
            vessels,
            metaProfile,
            activeVesselId,
            selectVessel,
            createVessel,
            deleteVessel
        }}>
            {children}
        </NexusContext.Provider>
    );
};

export const useNexus = () => {
    const context = useContext(NexusContext);
    if (!context) {
        throw new Error('useNexus must be used within a NexusProvider');
    }
    return context;
};
