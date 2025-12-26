import type { Resources, Role, SimulationMarket } from './types';

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
    PEASANT: { gold: 10, grain: 5, wood: 0, iron: 0, manpower: 1 },
    SOLDIER: { gold: 20, grain: 10, wood: 0, iron: 5, manpower: 1 },
    MERCHANT: { gold: 200, grain: 50, wood: 50, iron: 50, manpower: 0 }
};

export const EVENTS = {
    TAX_COLLECTION: 'TAX_COLLECTION',
    MARKET_UPDATE: 'MARKET_UPDATE',
    WAR_DECLARED: 'WAR_DECLARED',
};
