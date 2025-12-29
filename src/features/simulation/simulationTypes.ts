// Types definition for Simulation
export type Role = 'KING' | 'BARON' | 'PEASANT' | 'SOLDIER' | 'MERCHANT';

export type SkillType = 'FARMING' | 'WOODCUTTING' | 'MINING' | 'CRAFTING' | 'STEWARDSHIP' | 'COMBAT' | 'TRADING' | 'THEOLOGY';

export interface SkillData {
    level: number;
    xp: number;
    maxXp: number;
}

export type ResourceType = 'gold' | 'grain' | 'wood' | 'iron' | 'manpower' | 'timber' | 'cloth' | 'iron_ingot';

export interface Resources {
    gold: number;
    grain: number;
    flour: number;
    bread: number; // Tiered food
    wood: number;
    timber: number; // Refined wood
    iron_ore: number; // Raw iron
    iron_ingot: number; // Refined iron
    iron: number; // Legacy, will migrate or keep as generic
    stone: number;
    swords: number;
    armor: number;
    tools: number;
    manpower: number;
    favor: number;
    wool: number;
    cloth: number;
    honey: number;
    meat: number;
    glass: number;
}


export type EquipmentSlot = 'MAIN_HAND' | 'OFF_HAND' | 'HEAD' | 'BODY' | 'FEET' | 'TRINKET';

export interface ItemStats {
    yieldBonus?: number;
    speedBonus?: number; // 1.0 is base, 1.1 is 10% faster
    luckBonus?: number; // 0-100%
    defense?: number;
    attack?: number;
}

export interface EquipmentItem {
    id: string;
    name: string;
    icon: string;
    type: EquipmentSlot;
    description?: string;
    stats?: ItemStats;
    durability: number;
    maxDurability: number;
    level: number; // Item level requirement or tier
    relevantActions?: string[];
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
    loyalty: number; // For Peasants/Barons (0-100)
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

export interface Achievement {
    id: string;
    name: string;
    icon: string;
    unlockedAt: number;
}

export interface Quest {
    id: string;
    name: string;
    description: string;
    status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
    progress: number;
    target: number;
}

export interface SimulationAccount {
    uid: string;
    displayName: string;
    globalXp: number;
    globalLevel: number;
    totalGoldEarned: number;
    unlockedAchievements: string[];
    characterHistory: {
        roomPin: string;
        name: string;
        role: Role;
        level: number;
        timestamp: number;
    }[];
    lastActive: number;
}

export interface SimulationPlayer {
    id: string; // Room-specific character ID
    uid?: string; // Global User ID (nullable for legacy/guest)
    name: string;
    role: Role;
    regionId: string; // Which Baron they belong to (or 'capital' for King)
    resources: Resources;
    stats: PlayerStats;
    status: PlayerStatus;
    upgrades: string[]; // List of IDs of purchased upgrades
    skills: Record<SkillType, SkillData>;
    equipment: Partial<Record<EquipmentSlot, EquipmentItem>>;
    achievements?: Achievement[];
    inventory?: EquipmentItem[];
    history?: string[];
    avatar?: string;

    buildings?: Record<string, {
        level: number;
        progress: Partial<Resources>;
    }>;

    lastActive: number;
}


export interface MarketItem {
    price: number;
    stock: number;
    demand: number; // multiplier
}

export interface SimulationMarket {
    grain: MarketItem;
    flour: MarketItem;
    wood: MarketItem;
    iron: MarketItem;
    stone: MarketItem;
    swords: MarketItem;
    armor: MarketItem;
    tools: MarketItem;
    wool: MarketItem;
    cloth: MarketItem;
}

export interface SimulationRegion {
    id: string; // Usually the Baron's player ID
    name: string;
    taxRate: number; // Percentage 0-100
    defenseLevel: number;
    rulerName: string;
}

export type WeatherType = 'Clear' | 'Rain' | 'Storm' | 'Fog';

export interface WorldEvent {
    id: string;
    type: 'RAID' | 'QUEST';
    title: string;
    description: string;
    locationId: string; // POI ID (e.g. 'fields')
    expiresAt: number;
    payload?: any; // Extra data (rewards, threat level)
}

export interface DiplomacyMessage {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string; // Can be 'ALL_RULERS' or specific player ID
    content: string;
    timestamp: number;
}


export type GameStatus = 'LOBBY' | 'PLAYING' | 'PAUSED' | 'FINISHED';

export interface SimulationRoom {

    pin: string;
    status: GameStatus;
    settings: string; // 'feudal_europe'
    hostName?: string;
    isPublic?: boolean;

    // Global State
    market: SimulationMarket; // @deprecated Use markets
    markets: Record<string, SimulationMarket>; // Keyed by regionId
    regions: Record<string, SimulationRegion>;
    players: Record<string, SimulationPlayer>;

    world: {
        year: number;
        season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
        weather: WeatherType;
        taxRateDetails: {
            kingTax: number; // Tax Barons pay to King
        };
        monumentProgress?: number; // Shared construction
        activeLaws?: string[]; // Global modifiers
        settlement?: {
            buildings: Record<string, {
                id: string;
                level: number;
                progress: Partial<Resources>; // current resources contributed for next level
                contributions: Record<string, { name: string, resources: Partial<Resources> }>; // player contributions
            }>;
            activeProjectId?: string;
        };
    };


    worldEvents: Record<string, WorldEvent>;
    diplomacy: Record<string, DiplomacyMessage>;
    activeVote?: {
        lawId: string;
        title: string;
        description: string;
        votes: Record<string, 'YES' | 'NO' | 'ABSTAIN'>;
        expiresAt: number;
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

export interface ActionResult {
    success: boolean;
    timestamp: number;
    message: string;
    yields: {
        resource: string;
        amount: number;
        bonus?: boolean;
    }[];
    xp: {
        skill: string;
        amount: number;
        levelUp?: boolean;
    }[];
    durability: {
        slot: string;
        item: string;
        amount: number;
        broken?: boolean;
    }[];
}

export interface ItemTemplate {
    id: string;
    name: string;
    icon: string;
    type: EquipmentSlot;
    description: string;
    stats?: ItemStats;
    level: number;
    relevantActions?: string[];
    nextTierId?: string;
    durability: number;
    maxDurability: number;
}
