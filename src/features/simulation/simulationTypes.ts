// Types definition for Simulation
export type Role = 'KING' | 'BARON' | 'PEASANT' | 'SOLDIER' | 'MERCHANT';

export type ActionType = 'WORK' | 'CHOP' | 'FORAGE' | 'MINE' | 'RAID' | 'TAX' | 'TAX_PEASANTS' | 'TAX_ROYAL' | 'MILL' | 'SMELT' | 'SAWMILL' | 'BAKERY' | 'REFINE' | 'CRAFT' | 'QUARRY' | 'REPAIR' | 'HUNT' | 'GATHER_WOOL' | 'GATHER_HONEY' | 'PRAY' | 'FEAST' | 'CONTRIBUTE' | 'CONSTRUCT' | 'SLEEP' | 'EAT' | 'PLANT' | 'HARVEST' | 'BAKE' | 'WEAVE' | 'MIX' | 'DEFEND' | 'EXPLORE' | 'PATROL' | 'MAINTAIN_CROP';

export interface ActionCost extends Partial<Resources> {
    stamina?: number;
}


export type SkillType = 'FARMING' | 'WOODCUTTING' | 'MINING' | 'CRAFTING' | 'STEWARDSHIP' | 'COMBAT' | 'TRADING' | 'THEOLOGY';

export interface Buff {
    id: string; // unique instance id
    type: string; // e.g. STAMINA_SAVE
    value: number; // e.g. 0.2 (20%)
    label: string; // "Lett til beins"
    description?: string; // "20% mindre stamina bruk"
    expiresAt: number; // timestamp
    sourceItem?: string; // "omelette"
}

export interface SkillData {
    level: number;
    xp: number;
    maxXp: number;
}

export type ResourceType = 'gold' | 'grain' | 'wood' | 'iron_ore' | 'plank' | 'cloth' | 'iron_ingot';

export interface Resources {
    gold: number;
    grain: number;
    flour: number;
    bread: number; // Tiered food
    wood: number;
    plank: number; // Refined wood (was timber)
    iron_ore: number; // Raw iron
    iron_ingot: number; // Refined iron
    stone: number;
    swords: number;
    armor: number;
    favor: number;
    wool: number;
    cloth: number;
    honey: number;
    meat: number;
    glass: number;
    manpower: number;
    egg: number;
    omelette: number;
}


export type EquipmentSlot = 'MAIN_HAND' | 'OFF_HAND' | 'HEAD' | 'BODY' | 'FEET' | 'TRINKET' | 'AXE' | 'PICKAXE' | 'SCYTHE' | 'HAMMER' | 'BOW' | 'TRAP' | 'CONSUMABLE';

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

export interface RoleStats {
    level: number;
    xp: number;
    skills: Record<SkillType, SkillData>;
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
    activeSessions?: {
        roomPin: string;
        name: string;
        role: Role;
        regionId?: string;
        lastPlayed: number;
    }[];
    lastActive: number;
}

export interface ActiveProcess {
    id: string;          // unique guid
    type: 'CROP' | 'CRAFT' | 'COOP' | 'MILL' | 'WELL'; // Extensible
    itemId: string;      // e.g. 'grain'
    startedAt: number;   // timestamp
    duration: number;    // ms
    readyAt: number;     // timestamp
    notified: boolean;   // has the user been toasted?
    locationId: string;  // e.g. 'fields'

    // Active Maintenance
    maintainCount?: number;
    yieldBonus?: number; // e.g. 0.05 for 5%
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
    activeBuffs?: Buff[]; // Buffs like "Lett til beins"
    upgrades: string[]; // List of IDs of purchased upgrades
    skills: Record<SkillType, SkillData>;
    equipment: Partial<Record<EquipmentSlot, EquipmentItem>>;
    achievements?: Achievement[];
    inventory?: EquipmentItem[];
    history?: string[];
    avatar?: string;

    activeProcesses?: ActiveProcess[]; // NEW: For timers (crops, crafting)

    buildings?: Record<string, {
        level: number;
        progress: Partial<Resources>;
    }>;

    roleStats?: Partial<Record<Role, RoleStats>>; // Separate progress for each role

    online?: boolean;
    hasSeenIntro?: boolean; // New onboarding flag
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
    bread: MarketItem; // Added
    wood: MarketItem;
    plank: MarketItem; // Added (was timber)
    iron_ore: MarketItem; // Added
    iron_ingot: MarketItem; // Added
    stone: MarketItem;
    swords: MarketItem;
    armor: MarketItem;
    wool: MarketItem;
    cloth: MarketItem;
    honey: MarketItem;
    meat: MarketItem;
    glass: MarketItem; // Added
    iron?: MarketItem; // Legacy support
}

export interface CoupData {
    lastRulerChange: number;
    bribeProgress: number; // 0-100
    challengerId?: string; // Last/main challenger
    challengerName?: string;
    contributions: Record<string, { name: string, amount: number }>; // Track for candidates
    preVotes: Record<string, string>; // voterId -> candidateId (Shadow Pledges)
}

export interface ElectionCandidate {
    id: string;
    name: string;
    votes: number;
    weightedVotes: number;
    contribution: number;
}

export interface ElectionState {
    startedAt: number;
    expiresAt: number;
    candidates: Record<string, ElectionCandidate>;
    votes: Record<string, { candidateId: string, weight: number }>; // voterId -> selection
}

export interface SimulationRegion {
    id: string; // Usually the Baron's player ID
    name: string;
    rulerId?: string; // Player ID of current ruler
    taxRate: number; // Percentage 0-100
    defenseLevel: number;
    rulerName: string;
    coup?: CoupData;
    activeElection?: ElectionState;

    // Phase 3: Baron Warfare
    garrison?: Garrison;
    fortification?: Fortification;
    activeSiege?: ActiveSiege;
}

export interface Garrison {
    swords: number; // Attack Power Stacks
    armor: number;  // Defense/Mitigation Stacks
    morale: number; // 0-100 modifier
}

export interface Fortification {
    hp: number;
    maxHp: number;
    level: number; // Wall Tier
}

export interface ThroneRoomData {
    mode: 'PVP' | 'PVE';
    occupation: number; // 0-100
    plundered: boolean;
    bossHp: number; // For PvP (Baron) or PvE (Steward)
    maxBossHp: number;
    defendingPlayerId?: string; // If PvP

    // Race Data (Multi-Occupier)
    occupiers?: Record<string, ThroneOccupier>;

    // Legacy / Global State
    // occupation: number; // Still used for "Highest Progress" display? Or just display highest? Let's keep it for compatibility if needed, but logic uses occupiers.
    lastTick?: number;
}

export interface ThroneOccupier {
    id: string;
    name: string;
    armor: number; // Current armor stack
    progress: number; // 0-100%
    joinedAt: number;
    // status effects?
}

export interface SiegeStats {
    damageDealt: number;
    damageTaken: number;
    armorDonated: number;
    ticksOnThrone: number;
}

export interface SiegeParticipant {
    lane: 0 | 1 | 2;
    hp: number;
    name: string;
    stats?: SiegeStats;
}

export interface ActiveSiege {
    phase: 'BREACH' | 'COURTYARD' | 'THRONE_ROOM';
    startedAt: number;
    lastTick: number;
    attackers: Record<string, SiegeParticipant>;
    defenders: Record<string, SiegeParticipant>; // Includes Garrison units

    // Phase 2 Data
    bossHp?: number;
    maxBossHp?: number;
    bossTargetLane?: 0 | 1 | 2;

    // Phase 3 Data
    throne?: ThroneRoomData;
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

export type TradeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export interface TradeOffer {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string; // Specific player
    receiverName: string;
    offer: Partial<Resources>; // What sender gives (Escrowed)
    demand: Partial<Resources>; // What sender wants
    status: TradeStatus;
    createdAt: number;
    expiresAt: number;
}


export type GameStatus = 'LOBBY' | 'PLAYING' | 'PAUSED' | 'FINISHED';

export interface SimulationMessage {
    id?: string;
    content: string;
    type?: 'SYSTEM' | 'CHAT' | 'SEASON_CHANGE' | 'WEATHER_CHANGE' | 'VOTE_START' | 'VOTE_RESULT' | 'EVENT_SPAWN';
    timestamp: number;
    senderId?: string;
    senderName?: string;
    senderRole?: Role;
    isPremiere?: boolean;
}

export interface SimulationRoom {

    pin: string;
    name?: string; // Server Name
    status: GameStatus;
    settings: string; // 'feudal_europe'
    hostName?: string;
    isPublic?: boolean;

    // Global State
    market: SimulationMarket; // @deprecated Use markets
    markets: Record<string, SimulationMarket>; // Keyed by regionId
    regions: Record<string, SimulationRegion>;
    players: Record<string, SimulationPlayer>;
    public_profiles?: Record<string, any>; // Lightweight profile for public listing

    world: {
        year: number;
        season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
        weather: WeatherType;
        gameTick: number; // Ticks since start
        lastTickAt: number; // Timestamp of last automation
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

        };
    };


    worldEvents: Record<string, WorldEvent>;
    diplomacy: Record<string, DiplomacyMessage>;
    trades?: Record<string, TradeOffer>;
    activeVote?: {
        lawId: string;
        title: string;
        description: string;
        votes: Record<string, 'YES' | 'NO' | 'ABSTAIN'>;
        expiresAt: number;
    };

    messages: SimulationMessage[] | Record<string, SimulationMessage>;
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
    utbytte: {
        resource: string;
        amount: number;

        // Extended for Items/Jackpots
        id?: string;
        name?: string;
        icon?: string;
        type?: 'RESOURCE' | 'ITEM';
        jackpot?: boolean;
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
