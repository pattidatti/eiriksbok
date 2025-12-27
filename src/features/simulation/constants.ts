import type { Resources, Role, SimulationMarket, PlayerUpgrade } from './types';

export const INITIAL_MARKET: SimulationMarket = {
    grain: { price: 10, stock: 500, demand: 1.0 },
    flour: { price: 15, stock: 100, demand: 1.0 },
    wood: { price: 15, stock: 300, demand: 1.0 },
    iron: { price: 25, stock: 150, demand: 1.0 },
    stone: { price: 20, stock: 200, demand: 1.0 },
    swords: { price: 80, stock: 20, demand: 1.0 },
    armor: { price: 120, stock: 10, demand: 1.0 },
    tools: { price: 60, stock: 30, demand: 1.0 },
};

export const RESOURCE_DETAILS: Record<string, { label: string, icon: string }> = {
    gold: { label: 'Gull', icon: '💰' },
    grain: { label: 'Korn', icon: '🌾' },
    flour: { label: 'Mel', icon: '🧂' },
    bread: { label: 'Brød', icon: '🍞' },
    wood: { label: 'Ved', icon: '🪵' },
    timber: { label: 'Tømmer', icon: '🪜' },
    iron_ore: { label: 'Jernmalm', icon: '🪨' },
    iron_ingot: { label: 'Jernbarre', icon: '🧱' },
    iron: { label: 'Jern', icon: '⛓️' },
    stone: { label: 'Stein', icon: '🏔️' },
    swords: { label: 'Sverd', icon: '⚔️' },
    armor: { label: 'Rustning', icon: '🛡️' },
    tools: { label: 'Verktøy', icon: '⚒️' },
    manpower: { label: 'Arbeidskraft', icon: '👥' },
    favor: { label: 'Gunst', icon: '✨' }
};

export const ROLE_DEFINITIONS: Record<Role, { label: string, description: string }> = {
    KING: { label: 'Konge', description: 'Styrer riket, krever skatt og dømmer i store saker.' },
    BARON: { label: 'Baron', description: 'Styrer en region, krever inn skatt fra bønder, og beskytter mot krig.' },
    PEASANT: { label: 'Bonde', description: 'Produserer mat og ressurser. Betaler skatt.' },
    SOLDIER: { label: 'Soldat', description: 'Beskytter riket og deltar i raids.' },
    MERCHANT: { label: 'Kjøpmann', description: 'Tjener penger på handel og markedsspekulasjon.' }
};

export const INITIAL_RESOURCES: Record<Role, Resources> = {
    KING: { gold: 1000, grain: 500, flour: 200, bread: 50, wood: 200, timber: 50, iron_ore: 0, iron_ingot: 20, iron: 100, stone: 100, swords: 50, armor: 20, tools: 10, manpower: 50, favor: 0 },
    BARON: { gold: 300, grain: 100, flour: 50, bread: 20, wood: 50, timber: 20, iron_ore: 0, iron_ingot: 10, iron: 20, stone: 20, swords: 10, armor: 10, tools: 5, manpower: 10, favor: 0 },
    PEASANT: { gold: 20, grain: 30, flour: 5, bread: 5, wood: 0, timber: 0, iron_ore: 0, iron_ingot: 0, iron: 0, stone: 0, swords: 0, armor: 0, tools: 1, manpower: 1, favor: 0 },
    SOLDIER: { gold: 50, grain: 10, flour: 10, bread: 10, wood: 0, timber: 0, iron_ore: 0, iron_ingot: 0, iron: 10, stone: 0, swords: 5, armor: 2, tools: 0, manpower: 1, favor: 0 },
    MERCHANT: { gold: 500, grain: 50, flour: 50, bread: 20, wood: 50, timber: 20, iron_ore: 0, iron_ingot: 5, iron: 50, stone: 50, swords: 5, armor: 2, tools: 5, manpower: 0, favor: 0 }
};


export const UPGRADES_LIST: Record<Role, PlayerUpgrade[]> = {
    PEASANT: [
        { id: 'iron_plow', name: 'Jernplog', description: 'Øker kornhøst med +5.', cost: { gold: 50, wood: 10 }, benefit: 'YIELD_GRAIN' },
        { id: 'fence', name: 'Solid Gjerde', description: 'Beskytter mot småtyveri.', cost: { wood: 50 }, benefit: 'DEFENSE_REGION' },
        { id: 'cow', name: 'Melkeku', description: 'Gir passivt 2 gull per minutt (simulert via actions).', cost: { gold: 80 }, benefit: 'PASSIVE_GOLD' },
        { id: 'roof', name: 'Tett Tak', description: 'Bedre hvile. Mer utholdenhet.', cost: { wood: 20, gold: 10 }, benefit: 'STAMINA_REGEN' }
    ],
    BARON: [
        { id: 'stone_keep', name: 'Steintårn', description: 'Gjør raiding av deg mye vanskeligere.', cost: { gold: 200, wood: 100 }, benefit: 'FORTRESS' },
        { id: 'armory', name: 'Våpenkammer', description: 'Dobbelt så effektiv rekruttering.', cost: { gold: 150, iron: 50 }, benefit: 'DRAFT_BONUS' },
        { id: 'stables', name: 'Staller', description: 'Raskere raids.', cost: { gold: 100, wood: 50 }, benefit: 'RAID_SPEED' }
    ],
    KING: [
        { id: 'cathedral', name: 'Katedral', description: 'Øker din legitimitet og skattevilje.', cost: { gold: 500, stone: 200 } as any, benefit: 'ROYAL_AUTHORITY' },
        { id: 'royal_guard', name: 'Kongelig Garde', description: 'Uovervinnelig defensiv styrke.', cost: { gold: 400, iron: 100 }, benefit: 'ELITE_DEFENSE' }
    ],
    SOLDIER: [
        { id: 'knight_armor', name: 'Ridderrustning', description: 'Du tar mindre skade og ser tøffere ut.', cost: { gold: 100, swords: 5 }, benefit: 'ARMOR' },
        { id: 'warhorse', name: 'Stridshest', description: 'Gjør deg til en Ridder. 2x XP fra kamp.', cost: { gold: 200, grain: 100 }, benefit: 'KNIGHT' }
    ],

    MERCHANT: [
        { id: 'trade_license', name: 'Handelsbrev', description: 'Bedre salgspriser på markedet.', cost: { gold: 150 }, benefit: 'MARKET_BONUS' },
        { id: 'accounting_books', name: 'Regnskapsbøker', description: 'Gir passivt 5 gull per minutt.', cost: { gold: 200, wood: 20 }, benefit: 'PASSIVE_GOLD_HIGH' },
        { id: 'caravan', name: 'Karavane', description: 'Tjen penger på handel med utlandet.', cost: { gold: 300, wood: 50, tools: 5 }, benefit: 'CARAVAN' }
    ]
};

export const ACTION_COSTS = {
    WORK: { bread: 1, stamina: 10 },
    CHOP: { bread: 1, stamina: 15 },
    FORAGE: { stamina: 40 }, // Emergency action: High effort, small reward
    MINE: { bread: 1, stamina: 25 },
    RAID: { bread: 3, stamina: 40 },
    TAX: { stamina: 20 },
    MILL: { grain: 10, stamina: 20 },
    CRAFT: { iron_ingot: 5, timber: 10, stamina: 30 },
    CRAFT_ARMOR: { iron_ingot: 10, timber: 5, stamina: 40 },
    CRAFT_TOOLS: { iron_ingot: 2, timber: 5, stamina: 25 },
    QUARRY: { bread: 1, stamina: 20 },
    REPAIR: { iron_ingot: 1, timber: 1, gold: 5, stamina: 15 },
    PRAY: { stamina: 15 },
    FEAST: { bread: 30, gold: 100, stamina: 10 },
    CONTRIBUTE: { stamina: 10 },
    CONSTRUCT: { stamina: 20 }
};



export const SEASONS = {
    Spring: { label: 'Vår', yieldMod: 1.0, staminaMod: 1.0, color: '#4ade80' },
    Summer: { label: 'Sommer', yieldMod: 1.2, staminaMod: 1.0, color: '#fbbf24' },
    Autumn: { label: 'Høst', yieldMod: 1.5, staminaMod: 1.0, color: '#f97316' },
    Winter: { label: 'Vinter', yieldMod: 0.0, staminaMod: 1.5, color: '#38bdf8' }
};

export const WEATHER = {
    Clear: { label: 'Klart Vær', desc: 'Ideelle forhold for alt arbeid.', mod: 1.0, icon: '☀️', speedMod: 1.0, staminaMod: 1.0 },
    Rain: { label: 'Regn', desc: 'Glatte forhold. Minispill går litt fortere.', mod: 0.9, icon: '🌧️', speedMod: 1.2, staminaMod: 1.0 },
    Storm: { label: 'Storm', desc: 'Farlig vær. Høy stamina-kostnad og lavt utbytte!', mod: 0.5, icon: '⛈️', speedMod: 1.5, staminaMod: 2.0 },
    Fog: { label: 'Tåke', desc: 'Dårlig sikt. Vanskeligere å treffe blinker.', mod: 0.8, icon: '🌫️', speedMod: 0.8, staminaMod: 1.0 }
};


export const LEVEL_XP = [0, 100, 300, 700, 1500, 3000, 6000];

export const ROLE_TITLES: Record<Role, string[]> = {
    PEASANT: ['Trell', 'Leilending', 'Selveier', 'Storbondi', 'Odalbonde'],
    BARON: ['Landmann', 'Væpner', 'Ridder', 'Baron', 'Grev'],
    KING: ['Prins', 'Hertug', 'Konungr'],
    SOLDIER: ['Rekrutt', 'Vakt', 'Kjempe', 'Høvding'],
    MERCHANT: ['Gutt', 'Svenn', 'Mester', 'Hanseat']
};


export const REWARDS = {
    WORK: { grain: 10, xp: 5 },
    CHOP: { wood: 5, xp: 5 },
    FORAGE: { bread: 1, xp: 2 }, // Emergency food
};

export const EVENTS = {
    TAX_COLLECTION: 'TAX_COLLECTION',
    MARKET_UPDATE: 'MARKET_UPDATE',
    WAR_DECLARED: 'WAR_DECLARED',
};

export const WORLD_EVENT_TEMPLATES = [
    { type: 'RAID', title: 'Vikinger på horisonten!', description: 'Et vikingskip er sett nær kysten. Forsvar jordene før de stjeler kornet!', locationId: 'fields' },
    { type: 'RAID', title: 'Bandittleir funnet', description: 'Banditter har slått seg ned i skogen. De stjeler ved hver time!', locationId: 'forest' },
    { type: 'QUEST', title: 'Den Hellige Gral?', description: 'Rykter sier en eremitt ved klosteret har funnet noe verdifullt.', locationId: 'village' },
    { type: 'QUEST', title: 'Markedsdag i nabolaget', description: 'En sjelden mulighet for god handel på grensen.', locationId: 'marketplace' }
];

export const LAW_TEMPLATES = [
    { id: 'tax_cut', label: 'Skattekutt', description: 'Alle skatter halveres i 10 minutter. Lojaliteten stiger.' },
    { id: 'peace', label: 'Fredsavtale', description: 'Ingen raids tillatt de neste 10 minuttene.' },
    { id: 'salt_tax', label: 'Saltskatt', description: 'Øker kornprisene, men reduserer lojalitet.' },
    { id: 'conscription', label: 'Verneplikt', description: 'Soldater koster mindre å verve, men bønder jobber 20% tregere.' }
];

export const VILLAGE_BUILDINGS: Record<string, any> = {
    sawmill: {
        id: 'sawmill',
        name: 'Sagbruk',
        description: 'Gjør det mulig å foredle Ved til Tømmer.',
        requirements: { wood: 100, stone: 50 },
        unlocks: ['REFINE_TIMBER']
    },
    windmill: {
        id: 'windmill',
        name: 'Vindmølle',
        description: 'Gjør det mulig å foredle Korn til Mel mer effektivt.',
        requirements: { timber: 50, stone: 100 },
        unlocks: ['REFINE_FLOUR_ADVANCED']
    },
    smeltery: {
        id: 'smeltery',
        name: 'Smeltehytte',
        description: 'Gjør det mulig å smelte Jernmalm til Jernbarrer.',
        requirements: { stone: 150, wood: 100 },
        unlocks: ['REFINE_IRON_INGOT']
    },
    great_forge: {
        id: 'great_forge',
        name: 'Storsmie',
        description: 'Gjør det mulig å lage avanserte verktøy og våpen.',
        requirements: { iron_ingot: 50, timber: 50, stone: 100 },
        unlocks: ['CRAFT_ADVANCED']
    },
    bakery: {
        id: 'bakery',
        name: 'Bakeri',
        description: 'Gjør det mulig å bake Brød fra Mel.',
        requirements: { stone: 50, timber: 20 },
        unlocks: ['CRAFT_BREAD']
    }
};

export const REFINERY_RECIPES: Record<string, any> = {
    timber: { input: { wood: 5 }, output: { timber: 1 }, buildingId: 'sawmill', stamina: 10, xp: 5 },
    flour: { input: { grain: 10 }, output: { flour: 10 }, buildingId: 'windmill', stamina: 15, xp: 8 },
    iron_ingot: { input: { iron_ore: 5, wood: 2 }, output: { iron_ingot: 1 }, buildingId: 'smeltery', stamina: 20, xp: 12 },
    bread: { input: { flour: 2 }, output: { bread: 1 }, buildingId: 'bakery', stamina: 5, xp: 3 }
};

export const GAME_BALANCE = {
    TAX: {
        PEASANT_RATE_DEFAULT: 0.15,
        PEASANT_RATE_CUT: 0.07,
        ROYAL_RATE: 0.20,
        LOYALTY_PENALTY_PEASANT: 10,
        LOYALTY_PENALTY_BARON: 5
    },
    YIELD: {
        WORK_GRAIN: 10,
        CHOP_WOOD: 5,
        MINE_ORE: 5,
        QUARRY_STONE: 8,
        PLOW_BONUS: 5,
        SUMMER_WOOD_BONUS: 2
    },
    DURABILITY: {
        MAX: 100,
        LOSS_WORK: 5,
        LOSS_COMBAT_WEAPON: 10,
        LOSS_COMBAT_ARMOR: 15,
        REPAIR_AMOUNT: 30
    },
    MARKET: {
        GRAIN_VOLATILITY: 0.1,
        WOOD_VOLATILITY: 0.2,
        SELL_RATIO: 0.8
    },
    MINIGAME: {
        BASE_MULTIPLIER: 0.5, // Even if you fail completely, you get 50%
        PERFORMANCE_WEIGHT: 1.0, // 100% score adds 100% -> Total 1.5x
        CRAFTING_WEIGHT: 1.5, // Crafting can yield up to 2.0x
        THRESHOLD_GREAT: 0.8 // Score needed for "Great!" message
    },
    RELIGION: {
        PRAY_MIN: 1,
        PRAY_MAX: 5,
        XP_PRAY: 2
    },
    MONUMENT: {
        STEP_PROGRESS: 10,
        TARGET: 1000,
        XP_REWARD: 15
    },
    COMBAT: {
        RAID_LOOT_FACTOR: 0.4, // Takes 40% of victim's resources
        DEFEND_GOLD_BASE: 20,
        XP_WIN: 20,
        XP_LOSS: 0
    },
    LUCKY_DROP: {
        CHANCE: 0.05, // 5% chance for a lucky drop
        MULTIPLIER: 2.0 // Lucky drop double the resource yield
    }
};



