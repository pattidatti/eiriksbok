import React, { createContext, useContext, useState, type ReactNode } from 'react';

type TabType = 'MAP' | 'VILLAGE' | 'INVENTORY' | 'MARKET' | 'UPGRADES' | 'SKILLS' | 'DIPLOMACY' | 'HIERARCHY' | 'PROFILE';
type MinigameType = 'WORK' | 'CHOP' | 'CRAFT' | 'MILL' | 'DEFEND' | 'EXPLORE' | 'MINE' | 'QUARRY' | 'PATROL' | 'FORAGE' | null;

interface SimulationContextType {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    viewMode: string;
    setViewMode: (mode: string) => void;
    isMarketOpen: boolean;
    setMarketOpen: (isOpen: boolean) => void;
    activeMinigame: MinigameType;
    setActiveMinigame: (game: MinigameType) => void;
    actionLoading: string | null;
    setActionLoading: (action: string | null) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<TabType>('MAP');
    const [viewMode, setViewMode] = useState<string>('global');
    const [isMarketOpen, setMarketOpen] = useState(false);
    const [activeMinigame, setActiveMinigame] = useState<MinigameType>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Sync activeTab with interactions
    // e.g. opening market might switch tab or overlay
    const handleSetMarketOpen = (isOpen: boolean) => {
        setMarketOpen(isOpen);
        if (isOpen) setActiveTab('MARKET');
        else if (activeTab === 'MARKET') setActiveTab('MAP');
    };

    return (
        <SimulationContext.Provider value={{
            activeTab,
            setActiveTab,
            viewMode,
            setViewMode,
            isMarketOpen,
            setMarketOpen: handleSetMarketOpen,
            activeMinigame,
            setActiveMinigame,
            actionLoading,
            setActionLoading
        }}>
            {children}
        </SimulationContext.Provider>
    );
};

export const useSimulation = () => {
    const context = useContext(SimulationContext);
    if (!context) {
        throw new Error('useSimulation must be used within a SimulationProvider');
    }
    return context;
};
