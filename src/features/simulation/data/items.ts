import type { Resources, Role, PlayerUpgrade, EquipmentItem, EquipmentSlot, ItemTemplate, SkillType, SkillData } from '../simulationTypes';

export const RESOURCE_DETAILS: Record<string, { label: string, icon: string }> = {
    gold: { label: 'Gull', icon: '💰' },
    grain: { label: 'Korn', icon: '🌾' },
    flour: { label: 'Mel', icon: '🧂' },
    bread: { label: 'Brød', icon: '🍞' },
    wood: { label: 'Ved', icon: '🪵' },
    plank: { label: 'Planker', icon: '🪵' },
    iron_ore: { label: 'Jernmalm', icon: '🪨' },
    iron_ingot: { label: 'Jernbarre', icon: '🧱' },
    stone: { label: 'Stein', icon: '🏔️' },
    swords: { label: 'Sverd', icon: '⚔️' },
    armor: { label: 'Rustning', icon: '🛡️' },
    favor: { label: 'Gunst', icon: '✨' },
    honey: { label: 'Honning', icon: '🍯' },
    meat: { label: 'Kjøtt', icon: '🍗' },
    wool: { label: 'Ull', icon: '🧶' },
    cloth: { label: 'Stoff', icon: '📜' },
    glass: { label: 'Glass', icon: '🥛' },
    egg: { label: 'Egg', icon: '🥚' },
    omelette: { label: 'Omelett', icon: '🍳' }
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
        { id: 'armory', name: 'Våpenkammer', description: 'Dobbelt så effektiv rekruttering.', cost: { gold: 150 }, benefit: 'DRAFT_BONUS' },
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
        { id: 'caravan', name: 'Karavane', description: 'Tjen penger på handel med utlandet.', cost: { gold: 300, wood: 50 }, benefit: 'CARAVAN' }
    ]
};

export const INITIAL_RESOURCES: Record<Role, Resources> = {
    KING: { gold: 1000, grain: 500, flour: 200, bread: 50, wood: 200, plank: 50, iron_ore: 0, iron_ingot: 20, stone: 100, swords: 50, armor: 20, favor: 0, wool: 50, cloth: 20, honey: 0, meat: 0, glass: 0, manpower: 0, egg: 0, omelette: 0 },
    BARON: { gold: 300, grain: 100, flour: 50, bread: 20, wood: 50, plank: 20, iron_ore: 0, iron_ingot: 10, stone: 20, swords: 10, armor: 10, favor: 0, wool: 20, cloth: 5, honey: 0, meat: 0, glass: 0, manpower: 0, egg: 0, omelette: 0 },
    PEASANT: { gold: 20, grain: 30, flour: 5, bread: 10, wood: 0, plank: 0, iron_ore: 0, iron_ingot: 0, stone: 0, swords: 0, armor: 0, favor: 0, wool: 10, cloth: 0, honey: 0, meat: 0, glass: 0, manpower: 0, egg: 0, omelette: 0 },
    SOLDIER: { gold: 50, grain: 10, flour: 10, bread: 10, wood: 0, plank: 0, iron_ore: 0, iron_ingot: 0, stone: 0, swords: 5, armor: 2, favor: 0, wool: 0, cloth: 0, honey: 0, meat: 0, glass: 0, manpower: 0, egg: 0, omelette: 0 },
    MERCHANT: { gold: 500, grain: 50, flour: 50, bread: 20, wood: 50, plank: 20, iron_ore: 0, iron_ingot: 5, stone: 50, swords: 5, armor: 2, favor: 0, wool: 20, cloth: 10, honey: 0, meat: 0, glass: 0, manpower: 0, egg: 0, omelette: 0 }
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
    PEASANT: {},
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

export const ITEM_TEMPLATES: Record<string, ItemTemplate> = {
    tools: { id: 'tools', name: 'Verktøy', icon: '🛠️', type: 'MAIN_HAND', durability: 100, maxDurability: 100, level: 1, description: 'Grunnleggende verktøy.' },
    weapon: { id: 'weapon', name: 'Sverd', icon: '⚔️', type: 'MAIN_HAND', durability: 100, maxDurability: 100, level: 1, description: 'Et enkelt sverd.' },
    armor: { id: 'armor', name: 'Rustning', icon: '🧥', type: 'BODY', durability: 100, maxDurability: 100, level: 1, description: 'Beskyttende rustning.' },
    stone_axe: { id: 'stone_axe', name: 'Steinøks', icon: '🪓', type: 'AXE', durability: 30, maxDurability: 30, level: 1, description: 'Primitiv øks hugget fra mørke fjell. Sagnet sier at de første fedrene brukte slike til å bane vei gjennom de tette skogene før sivilisasjonens inntog. +1 Utbytte.', stats: { yieldBonus: 1 }, relevantActions: ['CHOP'], nextTierId: 'iron_axe' },
    stone_pickaxe: { id: 'stone_pickaxe', name: 'Steinhakke', icon: '⛏️', type: 'PICKAXE', durability: 30, maxDurability: 30, level: 1, description: 'En enkel hakke i flint og tre. Brukt i generasjoner av de som søker fjellets hemmeligheter. +1 Utbytte.', stats: { yieldBonus: 1 }, relevantActions: ['MINE', 'QUARRY'], nextTierId: 'iron_pickaxe' },
    rusty_axe: { id: 'rusty_axe', name: 'Rusten Øks', icon: '🪓', type: 'AXE', durability: 50, maxDurability: 50, level: 1, description: 'Et glemt relikvie fra en svunnen tid, nå bare en skygge av sin fordums prakt. Sløv og upålitelig.', stats: { yieldBonus: 0 }, relevantActions: ['CHOP'], nextTierId: 'stone_axe' },
    iron_axe: { id: 'iron_axe', name: 'Jernøks', icon: '🪓', type: 'AXE', durability: 100, maxDurability: 100, level: 3, description: 'Smid i landsbyens esse under fullmånen. Jernet synger når det treffer treverket. +3 Utbytte.', stats: { yieldBonus: 3 }, relevantActions: ['CHOP'], nextTierId: 'steel_axe' },
    iron_pickaxe: { id: 'iron_pickaxe', name: 'Jernhakke', icon: '⛏️', type: 'PICKAXE', durability: 100, maxDurability: 100, level: 3, description: 'Tung og balansert. Laget for å trenge dypt inn i rikets rike årer. +3 Utbytte.', stats: { yieldBonus: 3 }, relevantActions: ['MINE', 'QUARRY'], nextTierId: 'steel_pickaxe' },
    royal_scepter: { id: 'royal_scepter', name: 'Kongens Septer', icon: '👑', type: 'MAIN_HAND', durability: 200, maxDurability: 200, level: 10, description: 'Et symbol på guddommelig rett og folkets vilje. Det glitrer med en makt som kan bøye selve skjebnen. +20% Flaks.', stats: { luckBonus: 0.2 } },

    steel_axe: { id: 'steel_axe', name: 'Ståløks', icon: '🪓', type: 'AXE', durability: 200, maxDurability: 200, level: 8, description: 'Mesterlig stål. +8 Utbytte, 20% raskere arbeid.', stats: { yieldBonus: 8, speedBonus: 1.2 }, relevantActions: ['CHOP'] },
    steel_hja: { id: 'steel_hja', name: 'Stålhjå', icon: '🌾', type: 'SCYTHE', durability: 120, maxDurability: 120, level: 4, description: 'Sylskarp hjå. +5 Utbytte, 10% raskere høsting.', stats: { yieldBonus: 5, speedBonus: 1.1 }, relevantActions: ['WORK', 'HØST', 'GATHER_WOOL', 'GATHER_HONEY'] },
    stone_sickle: { id: 'stone_sickle', name: 'Steinsigd', icon: '🌾', type: 'SCYTHE', durability: 40, maxDurability: 40, level: 1, description: 'Enkel sigd for jordbruk. +1 Utbytte ved kornhøsting.', stats: { yieldBonus: 1 }, relevantActions: ['WORK', 'GATHER_WOOL', 'GATHER_HONEY'] },
    blacksmith_hammer: { id: 'blacksmith_hammer', name: 'Smedhammer', icon: '🔨', type: 'HAMMER', durability: 200, maxDurability: 200, level: 5, description: 'Mesterverktøy. 20% raskere smiing.', stats: { speedBonus: 1.2 }, relevantActions: ['CRAFT', 'REFINE', 'SMELT'] },
    shears: { id: 'shears', name: 'Saks', icon: '✂️', type: 'MAIN_HAND', durability: 50, maxDurability: 50, level: 3, description: 'Brukt til å klippe sauer. Helt nødvendig for ull-produksjon.', stats: { yieldBonus: 2 }, relevantActions: ['GATHER_WOOL'] },
    iron_sword: { id: 'iron_sword', name: 'Jernsverd', icon: '⚔️', type: 'MAIN_HAND', durability: 100, maxDurability: 100, level: 5, description: 'Standard sverd. +10 Angrepskraft.', stats: { attack: 10 }, relevantActions: ['DEFEND', 'PATROL', 'EXPLORE', 'HUNT'], nextTierId: 'steel_sword' },
    steel_sword: { id: 'steel_sword', name: 'Stålsverd', icon: '⚔️', type: 'MAIN_HAND', durability: 250, maxDurability: 250, level: 10, description: 'Dødelig stål. +25 Angrep, 10% raskere hugg.', stats: { attack: 25, speedBonus: 1.1 }, relevantActions: ['DEFEND', 'PATROL', 'EXPLORE', 'HUNT'] },
    tunic: { id: 'tunic', name: 'Slitt Tunika', icon: '👕', type: 'BODY', durability: 20, maxDurability: 20, level: 1, description: 'Gammel og hullete. Minimal beskyttelse.', stats: { defense: 1 }, relevantActions: ['DEFEND', 'PATROL'], nextTierId: 'leather_armor' },
    leather_armor: { id: 'leather_armor', name: 'Lærrustning', icon: '🧥', type: 'BODY', durability: 80, maxDurability: 80, level: 3, description: 'Herdet skinn. +5 Forsvar.', stats: { defense: 5 }, relevantActions: ['DEFEND', 'PATROL'], nextTierId: 'iron_armor' },
    whetstone: { id: 'whetstone', name: 'Bryne', icon: '🪨', type: 'OFF_HAND', durability: 10, maxDurability: 10, level: 1, description: 'Bruk bryne for å holde verktøy skarpe. Gir +1 i utbytte på de fleste sanke-oppgaver.', stats: { yieldBonus: 1 }, relevantActions: ['CHOP', 'MINE', 'QUARRY', 'WORK', 'GATHER_WOOL'] },

    // Hunting Gear
    hunting_bow: { id: 'hunting_bow', name: 'Jaktbue', icon: '🏹', type: 'BOW', durability: 80, maxDurability: 80, level: 1, description: 'En stødig bue av barlind. +2 Utbytte.', stats: { yieldBonus: 2 }, relevantActions: ['HUNT'], nextTierId: 'longbow' },
    longbow: { id: 'longbow', name: 'Langbue', icon: '🏹', type: 'BOW', durability: 150, maxDurability: 150, level: 5, description: 'En mektig langbue som krever styrke å spenne. +5 Utbytte, 10% raskere.', stats: { yieldBonus: 5, speedBonus: 1.1 }, relevantActions: ['HUNT'] },
    hunting_trap: { id: 'hunting_trap', name: 'Jaktfelle', icon: '🕸️', type: 'TRAP', durability: 30, maxDurability: 30, level: 1, description: 'En enkel snarefangst-felle. +1 Utbytte ved småviltjakt.', stats: { yieldBonus: 1 }, relevantActions: ['HUNT', 'FORAGE'] },

    // Consumables
    omelette: { id: 'omelette', name: 'Omelett', icon: '🍳', type: 'CONSUMABLE', durability: 1, maxDurability: 1, level: 1, description: 'En næringsrik frokost. Gir buff: "Lett til beins" (20% mindre stamina kostnad i 15 min).', stats: {}, relevantActions: ['CONSUME'] },
    bread: { id: 'bread', name: 'Brød', icon: '🍞', type: 'CONSUMABLE', durability: 1, maxDurability: 1, level: 1, description: 'Ferskt brød fra bakeriet. Gjenoppretter +20 Stamina.', stats: {}, relevantActions: ['CONSUME'] }
};
