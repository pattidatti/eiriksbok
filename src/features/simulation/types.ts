export type Role = 'KING' | 'BARON' | 'PEASANT' | 'SOLDIER' | 'MERCHANT';

export type ResourceType = 'gold' | 'grain' | 'wood' | 'iron' | 'manpower';

export interface Resources {
    gold: number;
    grain: number;
    flour: number; // Processed grain
    wood: number;
    iron: number;
    swords: number; // Crafted from iron + wood
    manpower: number;
}


export interface PlayerStats {
    xp: number;
    level: number;
    reputation: number;
    contribution: number;
}


export interface PlayerStatus {
    hp: number;
    morale: number;
    stamina: number; // Used to limit rapid actions
    legitimacy: number; // For Kings/Barons (0-100)
    authority: number; // Power to command (0-100)
    isJailed: boolean;
    isFrozen: boolean; // e.g. awaiting judgement
}


export interface PlayerUpgrade {
    id: string;
    name: string;
    description: string;
    cost: Partial<Resources>;
    benefit: string;
}


export interface SimulationPlayer {
    id: string;
    name: string;
    role: Role;
    regionId: string; // Which Baron they belong to (or 'capital' for King)
    resources: Resources;
    stats: PlayerStats;
    status: PlayerStatus;
    upgrades: string[]; // List of IDs of purchased upgrades
    avatar?: string;

    lastActive: number;
}

export interface MarketItem {
    price: number;
    stock: number;
    demand: number; // multiplier
}

export interface SimulationMarket {
    grain: MarketItem;
    wood: MarketItem;
    iron: MarketItem;
}

export interface SimulationRegion {
    id: string; // Usually the Baron's player ID
    name: string;
    taxRate: number; // Percentage 0-100
    defenseLevel: number;
    rulerName: string;
}

export type GameStatus = 'LOBBY' | 'PLAYING' | 'PAUSED' | 'FINISHED';

export interface SimulationRoom {
    pin: string;
    status: GameStatus;
    settings: string; // 'feudal_europe'

    // Global State
    market: SimulationMarket;
    regions: Record<string, SimulationRegion>;
    players: Record<string, SimulationPlayer>;

    world: {
        year: number;
        season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
        taxRateDetails: {
            kingTax: number; // Tax Barons pay to King
        }
    };

    messages: string[];
    questionStartTime?: number; // reusing logic for sync
}

export type EventType = 'THEFT' | 'TRADE' | 'WAR' | 'JUDGEMENT' | 'MARKET_UPDATE' | 'GLOBAL_ALERT' | 'LEGITIMACY' | 'MILL' | 'CRAFT';



export interface SimulationEvent {
    id: string;
    type: EventType;
    sourceId: string; // Player ID
    targetId?: string; // Target Player ID
    payload: any;
    timestamp: number;
    expiresAt: number;
}
