import type { Resources } from '../simulationTypes';

export const CROP_DATA: Record<string, { label: string, seed: string, yieldResource: string, duration: number, minYield: number, maxYield: number, xp: number }> = {
    grain: {
        label: 'Kornåker',
        seed: 'grain',
        yieldResource: 'grain',
        duration: 3 * 60 * 1000,
        minYield: 15,
        maxYield: 25,
        xp: 20
    }
};

export const VILLAGE_BUILDINGS: Record<string, { id: string, name: string, icon: string, locationId: string, description: string, levels: Record<number, { requirements: Partial<Resources>, unlocks: string[], bonus: string }> }> = {
    farm_house: {
        id: 'farm_house',
        name: 'Gårdshuset',
        icon: '🏠',
        locationId: 'peasant_farm',
        description: 'Ditt personlige hjem. Oppgraderinger gir bedre hvile og mer matlagingsplass.',
        levels: {
            1: { requirements: {}, unlocks: ['SLEEP', 'EAT'], bonus: 'Base hvile' },
            2: { requirements: { wood: 50, gold: 100 }, unlocks: ['FARM_UPGRADE'], bonus: '+20% Stamina fra peisen' },
            3: { requirements: { timber: 20, stone: 50, gold: 300 }, unlocks: ['FARM_UPGRADE_MASTER'], bonus: '+30% Stamina fra senga' },
            4: { requirements: { timber: 50, stone: 100, gold: 600 }, unlocks: ['FARM_UPGRADE_ELITE'], bonus: '+50% Stamina fra hvile' },
            5: { requirements: { timber: 100, stone: 200, gold: 1000, iron_ingot: 20 }, unlocks: ['FARM_UPGRADE_GODLY'], bonus: 'Restaurerer all Stamina ved hvile' }
        }
    },
    sawmill: {
        id: 'sawmill',
        name: 'Sagbruk',
        icon: '🪚',
        locationId: 'village',
        description: 'Gjør det mulig å foredle Ved til Tømmer.',
        levels: {
            1: { requirements: {}, unlocks: ['REFINE_TIMBER_BASIC'], bonus: 'Base produksjon' },
            2: { requirements: { wood: 100, stone: 50, gold: 100 }, unlocks: ['REFINE_TIMBER_FAST'], bonus: '+10% Woodcutting XP' },
            3: { requirements: { timber: 50, stone: 150, gold: 300 }, unlocks: ['REFINE_TIMBER_MASTER'], bonus: 'Låser opp Tier 3 verktøy' }
        }
    },
    windmill: {
        id: 'windmill',
        name: 'Vindmølle',
        icon: '🌬️',
        locationId: 'village',
        description: 'Gjør det mulig å foredle Korn til Mel mer effektivt.',
        levels: {
            1: { requirements: {}, unlocks: ['REFINE_FLOUR_BASIC'], bonus: 'Base produksjon' },
            2: { requirements: { timber: 30, stone: 50, gold: 150 }, unlocks: ['REFINE_FLOUR_FAST'], bonus: '+10% Farming XP' },
            3: { requirements: { timber: 100, stone: 200, gold: 500 }, unlocks: ['REFINE_FLOUR_AUTO'], bonus: 'Sjanse for dobbel avling' }
        }
    },
    smeltery: {
        id: 'smeltery',
        name: 'Smeltehytte',
        icon: '🔥',
        locationId: 'village',
        description: 'Gjør det mulig å smelte Jernmalm til Jernbarrer.',
        levels: {
            1: { requirements: {}, unlocks: ['REFINE_IRON_BASIC'], bonus: 'Base produksjon' },
            2: { requirements: { stone: 150, wood: 100, gold: 200 }, unlocks: ['REFINE_IRON_FAST'], bonus: '+10% Mining XP' },
            3: { requirements: { stone: 300, timber: 50, gold: 600 }, unlocks: ['REFINE_STEEL', 'glass'], bonus: 'Låser opp Stål og Glass' }
        }
    },
    great_forge: {
        id: 'great_forge',
        name: 'Storsmie',
        icon: '⚒️',
        locationId: 'village',
        description: 'Gjør det mulig å lage avanserte verktøy og våpen.',
        levels: {
            1: { requirements: {}, unlocks: ['stone_axe', 'stone_pickaxe', 'stone_sickle', 'whetstone'], bonus: 'Base produksjon' },
            2: { requirements: { iron_ingot: 20, timber: 30, gold: 300 }, unlocks: ['iron_axe', 'iron_pickaxe', 'iron_sword', 'leather_armor', 'shears'], bonus: '+10% Crafting XP' },
            3: { requirements: { iron_ingot: 100, timber: 100, gold: 1000 }, unlocks: ['steel_axe', 'steel_sword', 'blacksmith_hammer', 'repair_advanced'], bonus: 'Låser opp Mester-utstyr' }
        }
    },
    bakery: {
        id: 'bakery',
        name: 'Bakeri',
        icon: '🍞',
        locationId: 'village',
        description: 'Gjør det mulig å bake Brød fra Mel.',
        levels: {
            1: { requirements: {}, unlocks: ['CRAFT_BREAD'], bonus: 'Base produksjon' },
            2: { requirements: { stone: 50, timber: 20, gold: 100 }, unlocks: ['CRAFT_PIE'], bonus: 'Bedre stamina fra mat' },
            3: { requirements: { stone: 150, timber: 50, gold: 400 }, unlocks: ['CRAFT_FEAST'], bonus: 'Låser opp Gildemåltid' }
        }
    },
    tavern: {
        id: 'tavern',
        name: 'Vertshuset',
        icon: '🍺',
        locationId: 'village',
        description: 'Et sted for hvile og rykter. Øker stamina-regenerering.',
        levels: {
            1: { requirements: {}, unlocks: ['ENTER_TAVERN', 'REST_BASIC', 'BUY_MEAL', 'OPEN_DICE_GAME', 'CHAT_LOCAL'], bonus: 'Standard hvile' },
            2: { requirements: { wood: 100, stone: 50, gold: 250 }, unlocks: ['REST_COMFY'], bonus: 'Dobbel stamina-regen' },
            3: { requirements: { timber: 50, stone: 150, gold: 750 }, unlocks: ['REST_ROYAL'], bonus: 'Gjenoppretter all stamina raskt' }
        }
    },
    weavery: {
        id: 'weavery',
        name: 'Veveri',
        icon: '🧶',
        locationId: 'village',
        description: 'Foredler Ull til Stoff for videre salg eller klær.',
        levels: {
            1: { requirements: {}, unlocks: ['REFINE_CLOTH_BASIC'], bonus: 'Base produksjon' },
            2: { requirements: { timber: 40, stone: 30, gold: 150 }, unlocks: ['REFINE_CLOTH_FAST'], bonus: '+10% Trading XP' },
            3: { requirements: { timber: 100, stone: 100, gold: 400 }, unlocks: ['REFINE_CLOTH_MASTER'], bonus: 'Låser opp Silke-produksjon' }
        }
    },
    well: {
        id: 'well',
        name: 'Bybrønn',
        icon: '💧',
        locationId: 'village',
        description: 'Gir tilgang til ferskvann for baking og hygiene.',
        levels: {
            1: { requirements: {}, unlocks: ['GATHER_WATER'], bonus: 'Basiskilde' },
            2: { requirements: { stone: 50, gold: 50 }, unlocks: ['GATHER_WATER_FAST'], bonus: 'Bedre vanntilgang' },
            3: { requirements: { stone: 150, gold: 200 }, unlocks: ['GATHER_WATER_MASTER'], bonus: 'Hellig kilde: +5 Stamina ved drikking' }
        }
    },
    apothecary: {
        id: 'apothecary',
        name: 'Apoteker',
        icon: '🌿',
        locationId: 'village',
        description: 'Fremstiller medisin og salver.',
        levels: {
            1: { requirements: {}, unlocks: ['CRAFT_MEDICINE'], bonus: 'Basis urter' },
            2: { requirements: { timber: 20, wood: 50, gold: 150 }, unlocks: ['CRAFT_POISON'], bonus: 'Kunnskap om gift' },
            3: { requirements: { timber: 50, glass: 20, gold: 500 }, unlocks: ['CRAFT_ELIXIR'], bonus: 'Livseliksir' }
        }
    },
    watchtower: {
        id: 'watchtower',
        name: 'Vaktårn',
        icon: '🏰',
        locationId: 'village',
        description: 'Bedre oversikt og forsvar av landsbyen.',
        levels: {
            1: { requirements: {}, unlocks: ['PATROL'], bonus: '+5 Forsvar' },
            2: { requirements: { stone: 100, timber: 50, gold: 200 }, unlocks: ['SCOUT'], bonus: '+15 Forsvar' },
            3: { requirements: { stone: 300, timber: 100, gold: 800 }, unlocks: ['VOLLEY'], bonus: 'Bueskytter-støtte i kamp' }
        }
    },
    stables: {
        id: 'stables',
        name: 'Stall',
        icon: '🐴',
        locationId: 'village',
        description: 'Muliggjør raskere reise og kavaleri.',
        levels: {
            1: { requirements: {}, unlocks: ['MOUNT_HORSE'], bonus: 'Transport' },
            2: { requirements: { timber: 50, wood: 50, gold: 150 }, unlocks: ['BREED_WARHORSE'], bonus: 'Stridshester' },
            3: { requirements: { timber: 150, iron_ingot: 20, gold: 400 }, unlocks: ['KNIGHT_TRAINING'], bonus: 'Riddere' }
        }
    }
};

export const REFINERY_RECIPES: Record<string, any> = {
    timber: { label: 'Tømmer', icon: '🪜', input: { wood: 5 }, outputResource: 'timber', outputAmount: 1, buildingId: 'sawmill', stamina: 10, xp: 5, skill: 'WOODCUTTING' },
    flour: { label: 'Fint Mel', icon: '🧂', input: { grain: 10 }, outputResource: 'flour', outputAmount: 10, buildingId: 'windmill', stamina: 15, xp: 8, skill: 'FARMING' },
    iron_ingot: { label: 'Jernbarre', icon: '🧱', input: { iron_ore: 5, wood: 2 }, outputResource: 'iron_ingot', outputAmount: 1, buildingId: 'smeltery', stamina: 20, xp: 12, skill: 'CRAFTING' },
    bread: { label: 'Bondebrød', icon: '🍞', input: { flour: 2 }, outputResource: 'bread', outputAmount: 5, buildingId: 'bakery', stamina: 5, xp: 3, skill: 'CRAFTING' },
    pie: { label: 'Kjøttpai', icon: '🥧', input: { flour: 4, meat: 2 }, outputResource: 'bread', outputAmount: 15, buildingId: 'bakery', stamina: 15, xp: 10, skill: 'CRAFTING' },
    mead: { label: 'Mjød', icon: '🍺', input: { honey: 5 }, outputResource: 'stamina', outputAmount: 20, buildingId: 'tavern', stamina: 5, xp: 5, skill: 'CRAFTING' },
    cloth: { label: 'Lin-stoff', icon: '🧶', input: { wood: 5 }, outputResource: 'cloth', outputAmount: 1, buildingId: 'weavery', stamina: 15, xp: 10, skill: 'CRAFTING' },
    glass: { label: 'Glass', icon: '🥛', input: { stone: 10, wood: 5 }, outputResource: 'glass', outputAmount: 1, buildingId: 'smeltery', requiredLevel: 3, stamina: 25, xp: 15, skill: 'CRAFTING' }
};

export const CRAFTING_RECIPES: Record<string, any> = {
    stone_axe: { label: 'Steinøks', icon: '🪓', input: { stone: 10, wood: 5, gold: 5 }, outputItemId: 'stone_axe', buildingId: 'great_forge', level: 1, stamina: 15, xp: 10, description: 'Et enkelt redskap for tømmerhogst.', skill: 'CRAFTING' },
    stone_pickaxe: { label: 'Steinhakke', icon: '⛏️', input: { stone: 10, wood: 5, gold: 5 }, outputItemId: 'stone_pickaxe', buildingId: 'great_forge', level: 1, stamina: 15, xp: 10, description: 'En primitiv hakke for gruvearbeid.', skill: 'CRAFTING' },
    stone_sickle: { label: 'Steinsigd', icon: '🌾', input: { stone: 5, wood: 5, gold: 10 }, outputItemId: 'stone_sickle', buildingId: 'great_forge', level: 1, stamina: 10, xp: 5, description: 'Enkel sigd for kornhøsting.', skill: 'CRAFTING' },
    whetstone: { label: 'Bryne', icon: '🪨', input: { stone: 15, gold: 20 }, outputItemId: 'whetstone', buildingId: 'great_forge', level: 1, stamina: 10, xp: 5, description: 'Brukt for å slipe verktøy og øke utbyttet.', skill: 'CRAFTING' },
    iron_axe: { label: 'Jernøks', icon: '🪓', input: { iron_ingot: 5, timber: 2, gold: 50 }, outputItemId: 'iron_axe', buildingId: 'great_forge', level: 2, stamina: 25, xp: 20, description: 'Et solid verktøy av jern.', skill: 'CRAFTING' },
    iron_pickaxe: { label: 'Jernhakke', icon: '⛏️', input: { iron_ingot: 5, timber: 2, gold: 50 }, outputItemId: 'iron_pickaxe', buildingId: 'great_forge', level: 2, stamina: 25, xp: 20, description: 'Effektiv hakke for dypere graving.', skill: 'CRAFTING' },
    iron_sword: { label: 'Jernsverd', icon: '⚔️', input: { iron_ingot: 10, timber: 2, gold: 100 }, outputItemId: 'iron_sword', buildingId: 'great_forge', level: 2, stamina: 40, xp: 35, description: 'Et skarpt sverd for krigere.', skill: 'CRAFTING' },
    leather_armor: { label: 'Lærrustning', icon: '🧥', input: { cloth: 10, gold: 150 }, outputItemId: 'leather_armor', buildingId: 'great_forge', level: 2, stamina: 30, xp: 25, description: 'God beskyttelse for en reisende.', skill: 'CRAFTING' },
    shears: { label: 'Saks', icon: '✂️', input: { iron_ingot: 5, gold: 100 }, outputItemId: 'shears', buildingId: 'great_forge', level: 2, stamina: 20, xp: 15, description: 'Nødvendig for å klippe sauer og få ull.', skill: 'CRAFTING' },
    steel_axe: { label: 'Ståløks', icon: '🪓', input: { iron_ingot: 20, timber: 10, gold: 250 }, outputItemId: 'steel_axe', buildingId: 'great_forge', level: 3, stamina: 50, xp: 50, description: 'Mesterlig utformet øks av herdet stål.', skill: 'CRAFTING' },
    steel_sword: { label: 'Stålsverd', icon: '⚔️', input: { iron_ingot: 30, timber: 5, gold: 500 }, outputItemId: 'steel_sword', buildingId: 'great_forge', level: 3, stamina: 80, xp: 100, description: 'Det ultimate våpenet for en herre.', skill: 'CRAFTING' },
    blacksmith_hammer: { label: 'Smedhammer', icon: '🔨', input: { iron_ingot: 15, timber: 5, gold: 200 }, outputItemId: 'blacksmith_hammer', buildingId: 'great_forge', level: 3, stamina: 40, xp: 50, description: 'Mesterverktøy for en ekte smed.', skill: 'CRAFTING' }
};
