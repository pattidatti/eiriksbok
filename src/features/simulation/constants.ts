import type { Resources, Role, SimulationMarket, PlayerUpgrade, SkillType, SkillData, EquipmentItem, EquipmentSlot, ResourceType } from './simulationTypes';

export const INITIAL_MARKET: SimulationMarket = {
    grain: { price: 10, stock: 500, demand: 1.0 },
    flour: { price: 15, stock: 100, demand: 1.0 },
    wood: { price: 15, stock: 300, demand: 1.0 },
    iron: { price: 25, stock: 150, demand: 1.0 },
    stone: { price: 20, stock: 200, demand: 1.0 },
    swords: { price: 80, stock: 20, demand: 1.0 },
    armor: { price: 120, stock: 10, demand: 1.0 },
    tools: { price: 60, stock: 30, demand: 1.0 },
    wool: { price: 12, stock: 200, demand: 1.0 },
    cloth: { price: 45, stock: 50, demand: 1.0 },
    honey: { price: 30, stock: 50, demand: 1.0 },
    meat: { price: 25, stock: 100, demand: 1.0 },
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
    favor: { label: 'Gunst', icon: '✨' },
    honey: { label: 'Honning', icon: '🍯' },
    meat: { label: 'Kjøtt', icon: '🍗' },
    wool: { label: 'Ull', icon: '🧶' },
    cloth: { label: 'Stoff', icon: '📜' },
    glass: { label: 'Glass', icon: '🥛' }
};


export const ROLE_DEFINITIONS: Record<Role, { label: string, description: string }> = {
    KING: { label: 'Konge', description: 'Styrer riket, krever skatt og dømmer i store saker.' },
    BARON: { label: 'Baron', description: 'Styrer en region, krever inn skatt fra bønder, og beskytter mot krig.' },
    PEASANT: { label: 'Bonde', description: 'Produserer mat og ressurser. Betaler skatt.' },
    SOLDIER: { label: 'Soldat', description: 'Beskytter riket og deltar i raids.' },
    MERCHANT: { label: 'Kjøpmann', description: 'Tjener penger på handel og markedsspekulasjon.' }
};

export const INITIAL_RESOURCES: Record<Role, Resources> = {
    KING: { gold: 1000, grain: 500, flour: 200, bread: 50, wood: 200, timber: 50, iron_ore: 0, iron_ingot: 20, iron: 100, stone: 100, swords: 50, armor: 20, tools: 10, manpower: 50, favor: 0, wool: 50, cloth: 20, honey: 0, meat: 0, glass: 0 },
    BARON: { gold: 300, grain: 100, flour: 50, bread: 20, wood: 50, timber: 20, iron_ore: 0, iron_ingot: 10, iron: 20, stone: 20, swords: 10, armor: 10, tools: 5, manpower: 10, favor: 0, wool: 20, cloth: 5, honey: 0, meat: 0, glass: 0 },
    PEASANT: { gold: 20, grain: 30, flour: 5, bread: 5, wood: 0, timber: 0, iron_ore: 0, iron_ingot: 0, iron: 0, stone: 0, swords: 0, armor: 0, tools: 1, manpower: 1, favor: 0, wool: 10, cloth: 0, honey: 0, meat: 0, glass: 0 },
    SOLDIER: { gold: 50, grain: 10, flour: 10, bread: 10, wood: 0, timber: 0, iron_ore: 0, iron_ingot: 0, iron: 10, stone: 0, swords: 5, armor: 2, tools: 0, manpower: 1, favor: 0, wool: 0, cloth: 0, honey: 0, meat: 0, glass: 0 },
    MERCHANT: { gold: 500, grain: 50, flour: 50, bread: 20, wood: 50, timber: 20, iron_ore: 0, iron_ingot: 5, iron: 50, stone: 50, swords: 5, armor: 2, tools: 5, manpower: 0, favor: 0, wool: 20, cloth: 10, honey: 0, meat: 0, glass: 0 }

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
    TAX_PEASANTS: { stamina: 25 },
    TAX_ROYAL: { stamina: 30 },
    MILL: { grain: 10, stamina: 20 },
    SMELT: { ore: 5, wood: 2, stamina: 15 },
    SAWMILL: { wood: 5, stamina: 15 },
    BAKERY: { flour: 5, stamina: 10 },
    REFINE: { stamina: 15 }, // Fix for zero-stamina exploit
    CRAFT: { stamina: 30 }, // Base stamina, resources come from recipe
    QUARRY: { bread: 1, stamina: 20 },
    REPAIR: { iron_ingot: 1, timber: 1, gold: 5, stamina: 15 },
    PRAY: { stamina: 15 },
    FEAST: { bread: 30, gold: 100, stamina: 10 },
    CONTRIBUTE: { stamina: 10 },
    CONSTRUCT: { stamina: 20 },
    SLEEP: { stamina: 0 },
    EAT: { bread: 1, stamina: 0 }
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

export const RANK_BENEFITS: Record<string, string[][]> = {
    PEASANT: [
        ['Basis rettigheter som bonde.'],
        ['+10% resurseffektivitet ved innhøsting.'],
        ['Redusert skattetreff (-5%) fra din lensherre.'],
        ['Låser opp bruk av spesialverktøy og ploger.'],
        ['Fullstendig selveie: Maksimal frihet og prestisje.']
    ],
    BARON: [
        ['Rett til å kreve inn skatt i din region.'],
        ['+20% forsvarsstyrke for dine vakter.'],
        ['Låser opp bygging av avanserte steinborger.'],
        ['Høyere status i Tinget: Dine stemmer teller mer.'],
        ['Maksimal autoritet og kontroll over landegrenser.']
    ],
    KING: [
        ['Gunst fra undersåttene og rett til tronen.'],
        ['Nasjonal autoritet: Kan passere lover uten Tinget.'],
        ['Gudegitt makt: Maksimal legitimitet og kontroll.']
    ],
    SOLDIER: [
        ['Grunnleggende kamptrening og utstyr.'],
        ['+15% skade i raids og forsvar.'],
        ['Låser opp bruk av tunge rustninger og hester.'],
        ['Elite-kriger: Fryktet over hele riket.']
    ],
    MERCHANT: [
        ['Rett til å drive handel på markedsplassen.'],
        ['Bedre priser ved kjøp og salg (+10%).'],
        ['Låser opp utlandshandel og karavaner.'],
        ['Finansfyrste: Kontrollerer markedstrender.']
    ]
};

export const ACHIEVEMENT_TITLES: Record<string, string> = {
    'Første korn': 'Den Flittige',
    'Mesterbygger': 'Arkitekten',
    'Kriger': 'Den Tapre',
    'Rikmann': 'Den Velstående',
    'Diplomat': 'Budbringeren',
    'Helgen': 'Den Hellige',
    'Storbruker': 'Odalbonden',
    'Smed': 'Hammermesteren'
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
            4: { requirements: { timber: 50, stone: 100, gold: 600, tools: 5 }, unlocks: ['FARM_UPGRADE_ELITE'], bonus: '+50% Stamina fra hvile' },
            5: { requirements: { timber: 100, stone: 200, gold: 1000, iron_ingot: 20, tools: 10 }, unlocks: ['FARM_UPGRADE_GODLY'], bonus: 'Restaurerer all Stamina ved hvile' }
        }
    },
    sawmill: {

        id: 'sawmill',
        name: 'Sagbruk',
        icon: '🪚',
        locationId: 'village', // Moved to Village hub
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
        locationId: 'village', // Moved to Village hub
        description: 'Gjør det mulig å smelte Jernmalm til Jernbarrer.',
        levels: {
            1: { requirements: {}, unlocks: ['REFINE_IRON_BASIC'], bonus: 'Base produksjon' },
            2: { requirements: { stone: 150, wood: 100, gold: 200 }, unlocks: ['REFINE_IRON_FAST'], bonus: '+10% Mining XP' },
            3: { requirements: { stone: 300, timber: 50, gold: 600 }, unlocks: ['REFINE_STEEL'], bonus: 'Låser opp Stål-smelting' }
        }
    },
    great_forge: {
        id: 'great_forge',
        name: 'Storsmie',
        icon: '⚒️',
        locationId: 'village',
        description: 'Gjør det mulig å lage avanserte verktøy og våpen.',
        levels: {
            1: { requirements: {}, unlocks: ['stone_axe', 'stone_pickaxe'], bonus: 'Base produksjon' },
            2: { requirements: { iron_ingot: 20, timber: 30, gold: 300 }, unlocks: ['iron_axe', 'iron_pickaxe', 'iron_sword'], bonus: '+10% Crafting XP' },
            3: { requirements: { iron_ingot: 100, timber: 100, gold: 1000 }, unlocks: ['steel_axe', 'steel_sword', 'repair_advanced'], bonus: 'Låser opp Mester-utstyr' }
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
    timber: { label: 'Tømmer', icon: '🪜', input: { wood: 5 }, outputResource: 'timber', outputAmount: 1, buildingId: 'sawmill', stamina: 10, xp: 5 },
    flour: { label: 'Fint Mel', icon: '🧂', input: { grain: 10 }, outputResource: 'flour', outputAmount: 10, buildingId: 'windmill', stamina: 15, xp: 8 },
    iron_ingot: { label: 'Jernbarre', icon: '🧱', input: { iron_ore: 5, wood: 2 }, outputResource: 'iron_ingot', outputAmount: 1, buildingId: 'smeltery', stamina: 20, xp: 12 },
    bread: { label: 'Bondebrød', icon: '🍞', input: { flour: 2 }, outputResource: 'bread', outputAmount: 5, buildingId: 'bakery', stamina: 5, xp: 3 },
    pie: { label: 'Kjøttpai', icon: '🥧', input: { flour: 4, meat: 2 }, outputResource: 'bread', outputAmount: 15, buildingId: 'bakery', stamina: 15, xp: 10 },
    mead: { label: 'Mjød', icon: '🍺', input: { honey: 5 }, outputResource: 'stamina', outputAmount: 20, buildingId: 'tavern', stamina: 5, xp: 5 },
    cloth: { label: 'Lin-stoff', icon: '🧶', input: { wool: 5 }, outputResource: 'cloth', outputAmount: 1, buildingId: 'weavery', stamina: 15, xp: 10 }
};


export const CRAFTING_RECIPES: Record<string, any> = {
    // TIER 1 - Stone/Wood (Lvl 1 Forge)
    stone_axe: { label: 'Steinøks', icon: '🪓', input: { stone: 10, wood: 5, gold: 5 }, outputItemId: 'stone_axe', buildingId: 'great_forge', level: 1, stamina: 15, xp: 10, description: 'Et enkelt redskap for tømmerhogst.' },
    stone_pickaxe: { label: 'Steinhakke', icon: '⛏️', input: { stone: 10, wood: 5, gold: 5 }, outputItemId: 'stone_pickaxe', buildingId: 'great_forge', level: 1, stamina: 15, xp: 10, description: 'En primitiv hakke for gruvearbeid.' },

    // TIER 2 - Iron (Lvl 2 Forge)
    iron_axe: { label: 'Jernøks', icon: '🪓', input: { iron_ingot: 5, timber: 2, gold: 50 }, outputItemId: 'iron_axe', buildingId: 'great_forge', level: 2, stamina: 25, xp: 20, description: 'Et solid verktøy av jern.' },
    iron_pickaxe: { label: 'Jernhakke', icon: '⛏️', input: { iron_ingot: 5, timber: 2, gold: 50 }, outputItemId: 'iron_pickaxe', buildingId: 'great_forge', level: 2, stamina: 25, xp: 20, description: 'Effektiv hakke for dypere graving.' },
    iron_sword: { label: 'Jernsverd', icon: '⚔️', input: { iron_ingot: 10, timber: 2, gold: 100 }, outputItemId: 'iron_sword', buildingId: 'great_forge', level: 2, stamina: 40, xp: 35, description: 'Et skarpt sverd for krigere.' },

    // TIER 3 - Steel/Master (Lvl 3 Forge)
    steel_axe: { label: 'Ståløks', icon: '🪓', input: { iron_ingot: 20, timber: 10, gold: 250 }, outputItemId: 'steel_axe', buildingId: 'great_forge', level: 3, stamina: 50, xp: 50, description: 'Mesterlig utformet øks av herdet stål.' },
    steel_sword: { label: 'Stålsverd', icon: '⚔️', input: { iron_ingot: 30, timber: 5, gold: 500 }, outputItemId: 'steel_sword', buildingId: 'great_forge', level: 3, stamina: 80, xp: 100, description: 'Det ultimate våpenet for en herre.' }
};


export const GAME_BALANCE = {
    MARKET: {
        SELL_RATIO: 0.8,
        PRICE_IMPACT_BUY: 0.005, // 0.5% price increase per unit bought
        PRICE_IMPACT_SELL: 0.005, // 0.5% price decrease per unit sold
        MIN_PRICE_MULTIPLIER: 0.2, // Min price is 20% of base
        MAX_PRICE_MULTIPLIER: 5.0, // Max price is 500% of base
        VISCOSITY: 100 // Dampening factor if we used a more complex model, but we stick to linear % for now
    },
    TAX: {
        PEASANT_RATE_DEFAULT: 0.15,
        PEASANT_RATE_CUT: 0.07,
        ROYAL_RATE: 0.20,
        LOYALTY_PENALTY_PEASANT: 10,
        LOYALTY_PENALTY_BARON: 5
    },
    GATHERING: {
        NO_TOOL_PENALTY: 0.75, // 75% reduction
    },
    YIELD: {
        WORK_GRAIN: 10,
        CHOP_WOOD: 5,
        MINE_ORE: 5,
        QUARRY_STONE: 8,
        FORAGE_BREAD: 1,
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
    COMBAT: {
        RAID_LOOT_FACTOR: 0.4, // Takes 40% of victim's resources
        DEFEND_GOLD_BASE: 20,
        XP_WIN: 20,
        XP_LOSS: 0
    },
    LUCKY_DROP: {
        CHANCE: 0.05, // 5% chance for a lucky drop
        MULTIPLIER: 2.0 // Lucky drop double the resource yield
    },
    PASSIVE_INCOME: {
        COW: 2, // Gold per min
        ACCOUNTING_BOOKS: 5,
        CARAVAN: 10
    },
    SKILLS: {
        GATHERING_BONUS: 0.1, // +10% per level
        REFINING_BONUS: 0.1,  // +10% per level (unified from 5%)
        CRAFTING_XP: 25,
        REFINING_XP: 10
    }
};

export const REPAIR_CONFIG: Record<string, { material: ResourceType, goldCost: number, staminaCost: number, slots: EquipmentSlot[] }> = {
    great_forge: {
        material: 'iron_ingot',
        goldCost: 20,
        staminaCost: 15,
        slots: ['MAIN_HAND', 'OFF_HAND', 'HEAD', 'BODY', 'FEET']
    },
    weavery: {
        material: 'cloth',
        goldCost: 10,
        staminaCost: 10,
        slots: ['BODY', 'FEET', 'HEAD']
    },
    sawmill: {
        material: 'timber',
        goldCost: 5,
        staminaCost: 10,
        slots: ['OFF_HAND', 'MAIN_HAND']
    }
};


export const SKILL_DETAILS: Record<SkillType, { label: string, description: string, xpSource: string, bonuses: Record<number, string> }> = {
    FARMING: {
        label: 'Jordbruk',
        description: 'Evnen til å dyrke jorden og høste korn.',
        xpSource: 'Høst korn på jordene eller arbeid i vindmøllen.',
        bonuses: {
            2: '+5% kornhøst',
            5: '+15% kornhøst, låser opp Stålhjå',
            10: '+30% kornhøst, mulighet for dobbel avling'
        }
    },
    WOODCUTTING: {
        label: 'Skogbruk',
        description: 'Felling av trær og foredling av tømmer.',
        xpSource: 'Hugg ved i skogen eller arbeid på sagbruket.',
        bonuses: {
            2: '+10% ved-yield',
            5: '+25% ved-yield, låser opp Jernøks',
            10: 'Sjanse for å finne sjelden tømmer'
        }
    },
    MINING: {
        label: 'Gruvedrift',
        description: 'Utvinning av malm og verdifulle mineraler.',
        xpSource: 'Arbeid i gruvene eller steinbruddet.',
        bonuses: {
            3: '+10% malm-utbytte',
            7: 'Redusert stamina-bruk ved graving',
            10: 'Låser opp utvinning av edle metaller'
        }
    },
    CRAFTING: {
        label: 'Håndverk',
        description: 'Smiing av våpen, rustninger og verktøy.',
        xpSource: 'Lag gjenstander i smia eller bakeriet.',
        bonuses: {
            2: 'Bedre sjanse for høyere kvalitet',
            5: 'Redusert materialkostnad (-10%)',
            10: 'Mesterhåndverk: Gjenstander har +20% holdbarhet'
        }
    },
    STEWARDSHIP: {
        label: 'Forvaltning',
        description: 'Ledelse, økonomi og styring av landområder.',
        xpSource: 'Samle inn skatt, passere lover eller styre regioner.',
        bonuses: {
            5: '+10% skatteinntekter',
            10: 'Redusert lojalitetstap ved høy skatt',
            15: 'Låser opp avanserte lover'
        }
    },
    COMBAT: {
        label: 'Strid',
        description: 'Kampferdighet og forsvar av riket.',
        xpSource: 'Delta i raids, forsvar regionen eller tren på vaktposten.',
        bonuses: {
            3: '+10% angrepsstyrke',
            7: 'Bedre forsvar med skjold',
            10: 'Låser opp spesialangrep'
        }
    },
    TRADING: {
        label: 'Handel',
        description: 'Kjøp og salg av varer på markedet.',
        xpSource: 'Kjøp og selg varer, eller send ut karavaner.',
        bonuses: {
            2: '5% bedre priser',
            5: '15% bedre priser, se markedstrender',
            10: 'Ingen markedsavgifter'
        }
    },
    THEOLOGY: {
        label: 'Teologi',
        description: 'Tro og forståelse av det guddommelige.',
        xpSource: 'Be i kirken eller bidra til katedralen.',
        bonuses: {
            5: 'Økt stamina-regenerering',
            10: 'Låser opp mirakler',
            15: 'Guds gunst beskytter mot ulykker'
        }
    }
};


export const INITIAL_SKILLS: Record<Role, Record<SkillType, SkillData>> = {
    PEASANT: {
        FARMING: { level: 1, xp: 0, maxXp: 100 },
        WOODCUTTING: { level: 1, xp: 0, maxXp: 100 },
        MINING: { level: 0, xp: 0, maxXp: 100 },
        CRAFTING: { level: 0, xp: 0, maxXp: 100 },
        STEWARDSHIP: { level: 0, xp: 0, maxXp: 100 },
        COMBAT: { level: 0, xp: 0, maxXp: 100 },
        TRADING: { level: 0, xp: 0, maxXp: 100 },
        THEOLOGY: { level: 0, xp: 0, maxXp: 100 }
    },
    BARON: {
        FARMING: { level: 3, xp: 0, maxXp: 300 },
        WOODCUTTING: { level: 3, xp: 0, maxXp: 300 },
        MINING: { level: 1, xp: 0, maxXp: 100 },
        CRAFTING: { level: 1, xp: 0, maxXp: 100 },
        STEWARDSHIP: { level: 5, xp: 0, maxXp: 1000 },
        COMBAT: { level: 3, xp: 0, maxXp: 300 },
        TRADING: { level: 3, xp: 0, maxXp: 300 },
        THEOLOGY: { level: 1, xp: 0, maxXp: 100 }
    },
    KING: {
        FARMING: { level: 1, xp: 0, maxXp: 100 },
        WOODCUTTING: { level: 1, xp: 0, maxXp: 100 },
        MINING: { level: 1, xp: 0, maxXp: 100 },
        CRAFTING: { level: 1, xp: 0, maxXp: 100 },
        STEWARDSHIP: { level: 10, xp: 0, maxXp: 5000 },
        COMBAT: { level: 5, xp: 0, maxXp: 1500 },
        TRADING: { level: 5, xp: 0, maxXp: 1500 },
        THEOLOGY: { level: 5, xp: 0, maxXp: 1500 }
    },
    SOLDIER: {
        FARMING: { level: 1, xp: 0, maxXp: 100 },
        WOODCUTTING: { level: 1, xp: 0, maxXp: 100 },
        MINING: { level: 0, xp: 0, maxXp: 100 },
        CRAFTING: { level: 1, xp: 0, maxXp: 100 },
        STEWARDSHIP: { level: 0, xp: 0, maxXp: 100 },
        COMBAT: { level: 5, xp: 0, maxXp: 1500 },
        TRADING: { level: 0, xp: 0, maxXp: 100 },
        THEOLOGY: { level: 0, xp: 0, maxXp: 100 }
    },
    MERCHANT: {
        FARMING: { level: 1, xp: 0, maxXp: 100 },
        WOODCUTTING: { level: 1, xp: 0, maxXp: 100 },
        MINING: { level: 0, xp: 0, maxXp: 100 },
        CRAFTING: { level: 2, xp: 0, maxXp: 200 },
        STEWARDSHIP: { level: 1, xp: 0, maxXp: 100 },
        COMBAT: { level: 0, xp: 0, maxXp: 100 },
        TRADING: { level: 5, xp: 0, maxXp: 1500 },
        THEOLOGY: { level: 0, xp: 0, maxXp: 100 }
    }
};


export const INITIAL_EQUIPMENT: Record<Role, Partial<Record<EquipmentSlot, EquipmentItem>>> = {
    PEASANT: {
        AXE: { id: 'rusty_axe', name: 'Rusten Øks', icon: '🪓', type: 'AXE', durability: 50, maxDurability: 50, level: 1, stats: { yieldBonus: 0 } },
        PICKAXE: { id: 'stone_pickaxe', name: 'Steinhakke', icon: '⛏️', type: 'PICKAXE', durability: 30, maxDurability: 30, level: 1, stats: { yieldBonus: 1 } },
        SCYTHE: { id: 'stone_sickle', name: 'Steinsigd', icon: '🌾', type: 'SCYTHE', durability: 40, maxDurability: 40, level: 1, stats: { yieldBonus: 1 } },
        BODY: { id: 'tunic', name: 'Slitt Tunika', icon: '👕', type: 'BODY', durability: 20, maxDurability: 20, level: 1, stats: { defense: 1 } }
    },
    BARON: {
        MAIN_HAND: { id: 'iron_sword', name: 'Jernsverd', icon: '⚔️', type: 'MAIN_HAND', durability: 100, maxDurability: 100, level: 5, stats: { attack: 10 } },
        BODY: { id: 'fine_clothes', name: 'Fie Klær', icon: '👘', type: 'BODY', durability: 50, maxDurability: 50, level: 5, stats: { defense: 2, speedBonus: 1.1 } }
    },
    KING: {
        MAIN_HAND: { id: 'royal_scepter', name: 'Kongens Septer', icon: '👑', type: 'MAIN_HAND', durability: 200, maxDurability: 200, level: 10, stats: { luckBonus: 0.2 } },
        HEAD: { id: 'crown', name: 'Krone', icon: '👑', type: 'HEAD', durability: 100, maxDurability: 100, level: 10, stats: { luckBonus: 0.1 } }
    },
    SOLDIER: {
        MAIN_HAND: { id: 'iron_sword', name: 'Jernsverd', icon: '⚔️', type: 'MAIN_HAND', durability: 100, maxDurability: 100, level: 3, stats: { attack: 8 } },
        OFF_HAND: { id: 'wooden_shield', name: 'Treskjold', icon: '🛡️', type: 'OFF_HAND', durability: 50, maxDurability: 50, level: 2, stats: { defense: 5 } },
        BODY: { id: 'leather_armor', name: 'Lærrustning', icon: '🧥', type: 'BODY', durability: 80, maxDurability: 80, level: 2, stats: { defense: 5 } }
    },
    MERCHANT: {
        MAIN_HAND: { id: 'walking_stick', name: 'Vandrestav', icon: '🦯', type: 'MAIN_HAND', durability: 50, maxDurability: 50, level: 2, stats: { speedBonus: 1.05 } },
        TRINKET: { id: 'abacus', name: 'Kuleramme', icon: '🧮', type: 'TRINKET', durability: 100, maxDurability: 100, level: 3, stats: { yieldBonus: 2 } }
    }
};

import type { ItemTemplate } from './simulationTypes';

export const ITEM_TEMPLATES: Record<string, ItemTemplate> = {
    // --- GENERIC / FALLBACKS ---
    tools: {
        id: 'tools',
        name: 'Verktøy',
        icon: '🛠️',
        type: 'MAIN_HAND',
        durability: 100,
        maxDurability: 100,
        level: 1,
        description: 'Grunnleggende verktøy.'
    },
    weapon: {
        id: 'weapon',
        name: 'Sverd',
        icon: '⚔️',
        type: 'MAIN_HAND',
        durability: 100,
        maxDurability: 100,
        level: 1,
        description: 'Et enkelt sverd.'
    },
    armor: {
        id: 'armor',
        name: 'Rustning',
        icon: '🧥',
        type: 'BODY',
        durability: 100,
        maxDurability: 100,
        level: 1,
        description: 'Beskyttende rustning.'
    },

    // --- TOOLS ---
    stone_axe: {
        id: 'stone_axe',
        name: 'Steinøks',
        icon: '🪓',
        type: 'AXE',
        durability: 30,
        maxDurability: 30,
        level: 1,
        description: 'Primitiv øks. +1 Utbytte ved tømmerhogst.',
        stats: { yieldBonus: 1 },
        // @ts-ignore
        relevantActions: ['CHOP'],
        nextTierId: 'iron_axe'
    },
    stone_pickaxe: {
        id: 'stone_pickaxe',
        name: 'Steinhakke',
        icon: '⛏️',
        type: 'PICKAXE',
        durability: 30,
        maxDurability: 30,
        level: 1,
        description: 'Enkel hakke. +1 Utbytte ved gruvedrift.',
        stats: { yieldBonus: 1 },
        // @ts-ignore
        relevantActions: ['MINE', 'QUARRY'],
        nextTierId: 'iron_pickaxe'
    },
    rusty_axe: {
        id: 'rusty_axe',
        name: 'Rusten Øks',
        icon: '🪓',
        type: 'AXE',
        durability: 50,
        maxDurability: 50,
        level: 1,
        description: 'Gammel og sløv. Gir ingen utbytte-bonus.',
        stats: { yieldBonus: 0 },
        // @ts-ignore
        relevantActions: ['CHOP'],
        nextTierId: 'stone_axe'
    },
    iron_axe: {
        id: 'iron_axe',
        name: 'Jernøks',
        icon: '🪓',
        type: 'AXE',
        durability: 100,
        maxDurability: 100,
        level: 3,
        description: 'Solid jernøks. +3 Utbytte ved tømmerhogst.',
        stats: { yieldBonus: 3 },
        // @ts-ignore
        relevantActions: ['CHOP'],
        nextTierId: 'steel_axe'
    },
    iron_pickaxe: {
        id: 'iron_pickaxe',
        name: 'Jernhakke',
        icon: '⛏️',
        type: 'PICKAXE',
        durability: 100,
        maxDurability: 100,
        level: 3,
        description: 'Effektiv hakke. +3 Utbytte ved gruvedrift.',
        stats: { yieldBonus: 3 },
        // @ts-ignore
        relevantActions: ['MINE', 'QUARRY'],
        nextTierId: 'steel_pickaxe'
    },
    steel_axe: {
        id: 'steel_axe',
        name: 'Ståløks',
        icon: '🪓',
        type: 'AXE',
        durability: 200,
        maxDurability: 200,
        level: 8,
        description: 'Mesterlig stål. +8 Utbytte, 20% raskere arbeid.',
        stats: { yieldBonus: 8, speedBonus: 1.2 },
        // @ts-ignore
        relevantActions: ['CHOP']
    },
    steel_hja: {
        id: 'steel_hja',
        name: 'Stålhjå',
        icon: '🌾',
        type: 'SCYTHE',
        durability: 120,
        maxDurability: 120,
        level: 4,
        description: 'Sylskarp hjå. +5 Utbytte, 10% raskere høsting.',
        stats: { yieldBonus: 5, speedBonus: 1.1 },
        // @ts-ignore
        relevantActions: ['WORK', 'HØST']
    },
    stone_sickle: {
        id: 'stone_sickle',
        name: 'Steinsigd',
        icon: '🌾',
        type: 'SCYTHE',
        durability: 40,
        maxDurability: 40,
        level: 1,
        description: 'Enkel sigd for jordbruk. +1 Utbytte ved kornhøsting.',
        stats: { yieldBonus: 1 },
        // @ts-ignore
        relevantActions: ['WORK']
    },
    blacksmith_hammer: {
        id: 'blacksmith_hammer',
        name: 'Smedhammer',
        icon: '🔨',
        type: 'HAMMER',
        durability: 200,
        maxDurability: 200,
        level: 5,
        description: 'Mesterverktøy. 20% raskere smiing.',
        stats: { speedBonus: 1.2 },
        // @ts-ignore
        relevantActions: ['CRAFT', 'REFINE', 'SMELT']
    },

    // --- WEAPONS ---
    iron_sword: {
        id: 'iron_sword',
        name: 'Jernsverd',
        icon: '⚔️',
        type: 'MAIN_HAND',
        durability: 100,
        maxDurability: 100,
        level: 5,
        description: 'Standard sverd. +10 Angrepskraft.',
        stats: { attack: 10 },
        // @ts-ignore
        relevantActions: ['DEFEND', 'PATROL', 'EXPLORE'],
        nextTierId: 'steel_sword'
    },
    steel_sword: {
        id: 'steel_sword',
        name: 'Stålsverd',
        icon: '⚔️',
        type: 'MAIN_HAND',
        durability: 250,
        maxDurability: 250,
        level: 10,
        description: 'Dødelig stål. +25 Angrep, 10% raskere hugg.',
        stats: { attack: 25, speedBonus: 1.1 },
        // @ts-ignore
        relevantActions: ['DEFEND', 'PATROL', 'EXPLORE']
    },


    // Armor / Clothing
    tunic: {
        id: 'tunic',
        name: 'Slitt Tunika',
        icon: '👕',
        type: 'BODY',
        durability: 20,
        maxDurability: 20,
        level: 1,
        description: 'Gammel og hullete. Minimal beskyttelse.',
        stats: { defense: 1 },
        // @ts-ignore
        relevantActions: ['DEFEND', 'PATROL'],
        nextTierId: 'leather_armor'
    },
    leather_armor: {
        id: 'leather_armor',
        name: 'Lærrustning',
        icon: '🧥',
        type: 'BODY',
        durability: 80,
        maxDurability: 80,
        level: 3,
        description: 'Herdet skinn. +5 Forsvar.',
        stats: { defense: 5 },
        // @ts-ignore
        relevantActions: ['DEFEND', 'PATROL'],
        nextTierId: 'iron_armor'
    },

    // Offhand
    whetstone: {
        id: 'whetstone',
        name: 'Bryne',
        icon: '🪨',
        type: 'OFF_HAND',
        durability: 10,
        maxDurability: 10,
        level: 1,
        description: 'Hold verktøy skarpe. +1 Utbytte-bonus.',
        stats: { yieldBonus: 1 },
        relevantActions: ['CHOP', 'MINE', 'QUARRY', 'WORK']
    }
};

