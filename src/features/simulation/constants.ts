import type { Resources, Role, SimulationMarket, PlayerUpgrade } from './types';

export const INITIAL_MARKET: SimulationMarket = {
    grain: { price: 10, stock: 1000, demand: 1.0 },
    wood: { price: 15, stock: 500, demand: 1.0 },
    iron: { price: 25, stock: 200, demand: 1.0 },
};

export const ROLE_DEFINITIONS: Record<Role, { label: string, description: string }> = {
    KING: { label: 'Konge', description: 'Styrer riket, krever skatt og dømmer i store saker.' },
    BARON: { label: 'Baron', description: 'Styrer en region, krever inn skatt fra bønder, og beskytter mot krig.' },
    PEASANT: { label: 'Bonde', description: 'Produserer mat og ressurser. Betaler skatt.' },
    SOLDIER: { label: 'Soldat', description: 'Beskytter riket og deltar i raids.' },
    MERCHANT: { label: 'Kjøpmann', description: 'Tjener penger på handel og markedsspekulasjon.' }
};

export const INITIAL_RESOURCES: Record<Role, Resources> = {
    KING: { gold: 1000, grain: 500, flour: 200, wood: 200, iron: 100, swords: 50, manpower: 50 },
    BARON: { gold: 300, grain: 100, flour: 50, wood: 50, iron: 20, swords: 10, manpower: 10 },
    PEASANT: { gold: 20, grain: 30, flour: 5, wood: 0, iron: 0, swords: 0, manpower: 1 },
    SOLDIER: { gold: 50, grain: 10, flour: 10, wood: 0, iron: 10, swords: 5, manpower: 1 },
    MERCHANT: { gold: 500, grain: 50, flour: 50, wood: 50, iron: 50, swords: 0, manpower: 0 }
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
    SOLDIER: [],
    MERCHANT: []
};

export const ACTION_COSTS = {
    WORK: { flour: 1, stamina: 10 }, // Need flour to work efficiently
    CHOP: { flour: 1, stamina: 15 },
    RAID: { flour: 5, stamina: 40 },
    TAX: { stamina: 20 },
    MILL: { grain: 10, stamina: 20 }, // 10 grain -> 10 flour
    CRAFT: { iron: 10, wood: 5, stamina: 30 }, // 10 iron + 5 wood -> 10 swords
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
};

export const EVENTS = {
    TAX_COLLECTION: 'TAX_COLLECTION',
    MARKET_UPDATE: 'MARKET_UPDATE',
    WAR_DECLARED: 'WAR_DECLARED',
};

export const WORLD_EVENT_TEMPLATES = [
    { type: 'RAID', title: 'Vikinger på horisonten!', description: 'Et vikingskip er sett nær kysten. Forsvar jordene før de stjeler kornet!', locationId: 'fields' },
    { type: 'RAID', title: 'Banditt-leir funnet', description: 'Banditter har slått seg ned i skogen. De stjeler ved hver time!', locationId: 'forest' },
    { type: 'QUEST', title: 'Den Hellige Gral?', description: 'Rykter sier en eremitt ved klosteret har funnet noe verdifullt.', locationId: 'village' },
    { type: 'QUEST', title: 'Markedsdag i nabolaget', description: 'En sjelden mulighet for god handel på grensen.', locationId: 'marketplace' }
];

