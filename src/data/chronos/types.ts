export interface ChronosStat {
    id: string;
    label: string;
    icon: string; // lucide icon name
    value: number;
    max: number;
}

export interface ChronosItem {
    id: string;
    name: string;
    description?: string;
    icon?: string;
}

export interface ChronosConfig {
    stats: ChronosStat[];
    items?: ChronosItem[]; // Available items definitions
    theme?: {
        primaryColor: string;
        font?: string;
    };
}

export interface ChronosEffect {
    [statId: string]: number; // e.g. "discipline": 10
}

export interface ChronosCondition {
    statId: string;
    operator: '>' | '<' | '>=' | '<=' | '==';
    value: number;
}

export interface ChronosEnvironment {
    time: 'day' | 'night' | 'dawn' | 'dusk';
    weather: 'clear' | 'rain' | 'fog' | 'storm';
}

export interface ChronosChoice {
    id: string;
    text: string;
    nextNodeId: string;
    effects?: ChronosEffect;
    condition?: ChronosCondition;
    // Inventory System
    checkInventory?: {
        hasItem?: string; // Requires this item to show/enable
        lacksItem?: string;
    };
    updateInventory?: {
        add?: string;
        remove?: string;
    };
    // Environment System
    updateEnvironment?: Partial<ChronosEnvironment>;
}

export interface ChronosMinigame {
    type: 'dice';
    config: {
        targetScore: number;
        wager?: number;
        winNodeId: string;
        lossNodeId: string;
    };
}

export interface ChronosNode {
    id: string;
    text: string;
    speaker?: string;
    backgroundImage?: string;
    choices: ChronosChoice[];
    isEnd?: boolean;
    endType?: 'victory' | 'defeat';
    minigame?: ChronosMinigame;
    journalPrompt?: string; // If present, shows text area before choices
}

export interface ChronosEntry {
    day: number;
    text: string;
    timestamp: number;
}

export interface ChronosScenario {
    id: string;
    title: string;
    era: string;
    year: string;
    role: string;
    summary: string;
    config: ChronosConfig;
    nodes: {
        [nodeId: string]: ChronosNode;
    };
    startingNodeId: string;
    randomEvents?: string[]; // IDs of nodes that can be triggered randomly
}
