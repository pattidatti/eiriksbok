export interface ChronosStat {
    id: string;
    label: string;
    icon: string; // lucide icon name
    value: number;
    max: number;
    category?: 'attribute' | 'relation';
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
    recipes?: ChronosRecipe[]; // Available recipes
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



export interface ChronosMapPoint {
    id: string;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    label: string;
    icon?: string; // Lucide icon name
    nextNodeId: string;
}

export interface ChronosNode {
    id: string;
    text: string;
    choices: ChronosChoice[];
    speaker?: string;
    backgroundImage?: string;
    isEnd?: boolean;
    endType?: 'victory' | 'defeat';
    minigame?: ChronosMinigame;
    journalPrompt?: string; // If present, shows text area before choices

    // Map System
    uiType?: 'default' | 'map';
    mapConfig?: {
        image: string;
        points: ChronosMapPoint[];
    };
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

// Phase 9.1: Persistence Types
export interface ChronosRunLog {
    id: string;
    scenarioId: string;
    date: number;
    result: 'victory' | 'defeat' | 'retired';
    daysSurvived: number;
    score: number;
    endingNodeId: string;
}

export interface ChronosProfile {
    id: string; // "local_user" for now
    name: string;
    created: number;
    unlockedScenarios: string[];
    trophies: string[];
    graveyard: ChronosRunLog[];
    legacyItems: string[];
    totalRuns: number;
    totalWins: number;
}

// Phase 9.3: Advanced Mechanics
export interface ChronosRecipe {
    id: string;
    label: string;
    ingredients: string[]; // ['herb', 'linen']
    result: string; // 'bandage'
}

export interface ChronosBattleConfig {
    enemyName: string;
    enemyHealth: number;
    playerHealth: number;
    winNodeId: string;
    lossNodeId: string;
    moves: Array<{
        id: string;
        label: string;
        type: 'attack' | 'defend' | 'maneuver';
        counters: string[]; // Types this move beats (rock beats scissors)
    }>;
}

export type ChronosMinigame =
    | {
        type: 'dice';
        config: {
            targetScore: number;
            wager?: number;
            winNodeId: string;
            lossNodeId: string;
        }
    }
    | { type: 'battle'; config: ChronosBattleConfig }
    | {
        type: 'justice';
        config: {
            onComplete: { nextNodeId: string };
            cases: Array<{
                id: string;
                title: string;
                description: string;
                accused: string;
                crime: string;
                options: {
                    mercy: { label: string; feedback: string; effects?: ChronosEffect };
                    harsh: { label: string; feedback: string; effects?: ChronosEffect };
                };
            }>;
        };
    };
