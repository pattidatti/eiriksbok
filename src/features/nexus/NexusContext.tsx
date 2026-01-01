import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

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

export const NexusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Mock Data for Prototype
    const [vessels, setVessels] = useState<Vessel[]>([
        {
            id: 'v1',
            name: 'Eirik The Elder',
            role: 'Baron',
            location: 'Lysheim',
            gold: 15420,
            health: 85,
            lastPlayed: new Date(Date.now() - 3600000), // 1 hour ago
            isDead: false,
        },
        {
            id: 'v2',
            name: 'Kael',
            role: 'Peasant',
            location: 'Deep Woods',
            gold: 120,
            health: 40,
            lastPlayed: new Date(Date.now() - 86400000), // 1 day ago
            isDead: false,
        }
    ]);

    const [metaProfile, setMetaProfile] = useState<MetaProfile>({
        operatorName: 'SystemAdmin',
        soulRank: 12,
        soulExp: 2450,
        nextRankExp: 5000,
        achievedTitles: ['Architect', 'Time-Weaver']
    });

    const [activeVesselId, setActiveVesselId] = useState<string | null>(null);

    const navigate = useNavigate();

    const selectVessel = (vesselId: string) => {
        setActiveVesselId(vesselId);
        // Simulate "Possession" delay then navigate
        setTimeout(() => {
            navigate(`/sim/play/${vesselId}/map`);
        }, 1500);
    };

    const createVessel = (name: string, role: string) => {
        const newVessel: Vessel = {
            id: `v${Date.now()}`,
            name,
            role,
            location: 'Starting Zone',
            gold: 0,
            health: 100,
            lastPlayed: new Date(),
            isDead: false
        };
        setVessels(prev => [...prev, newVessel]);
    };

    const deleteVessel = (vesselId: string) => {
        setVessels(prev => prev.filter(v => v.id !== vesselId));
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
