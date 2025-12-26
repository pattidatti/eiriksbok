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
    KING: { gold: 1000, grain: 500, wood: 200, iron: 100, manpower: 50 },
    BARON: { gold: 300, grain: 100, wood: 50, iron: 20, manpower: 10 },
    PEASANT: { gold: 10, grain: 10, wood: 0, iron: 0, manpower: 1 },
    SOLDIER: { gold: 20, grain: 10, wood: 0, iron: 5, manpower: 1 },
    MERCHANT: { gold: 200, grain: 50, wood: 50, iron: 50, manpower: 0 }
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
    WORK: { grain: 1, stamina: 10 },
    CHOP: { grain: 1, stamina: 15 },
    RAID: { grain: 5, stamina: 40 },
    TAX: { stamina: 20 }
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
