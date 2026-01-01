export interface POI {
    id: string;
    label: string;
    icon: string;
    top: string;
    left: string;
    // Overrides for specific regions in Barony View
    ost?: { top: string, left: string };
    vest?: { top: string, left: string };
    // Overrides for specific hubs in Village View
    village?: { top: string, left: string };
    roles: string[];
    actions: { id: string, label: string, cost?: string }[];
    parentId?: string; // Links to a hub POI
    isHub?: boolean;   // If true, clicking this enters the local view
    isInterior?: boolean; // If true, disable external weather effects
}

export const POINTS_OF_INTEREST: POI[] = [
    // --- GLOBAL HUBS ---
    {
        id: 'fields', label: 'Åkrene', icon: '🌾', top: '22%', left: '42%',
        vest: { top: '35%', left: '70%' },
        ost: { top: '35%', left: '45%' },
        roles: ['PEASANT', 'BARON', 'KING'],
        actions: [], isHub: true
    },
    {
        id: 'forest', label: 'Skogen', icon: '🌲', top: '25%', left: '80%',
        vest: { top: '15%', left: '60%' },
        ost: { top: '27%', left: '14%' },
        roles: ['PEASANT', 'BARON', 'KING'],
        actions: [], isHub: true
    },
    {
        id: 'castle', label: 'Slottet', icon: '🏰', top: '66%', left: '86%',
        vest: { top: '40%', left: '30%' },
        ost: { top: '40%', left: '68%' },
        roles: ['BARON', 'KING', 'SOLDIER'],
        actions: [], isHub: true
    },
    {
        id: 'peasant_farm', label: 'Husmannsplassen', icon: '🛖', top: '30%', left: '60%',
        vest: { top: '85%', left: '72%' },
        ost: { top: '75%', left: '30%' },
        roles: ['PEASANT', 'BARON', 'KING'],
        actions: [], isHub: true
    },
    {
        id: 'market', label: 'Markedet', icon: '⚖️', top: '70%', left: '25%',
        vest: { top: '70%', left: '37%' },
        ost: { top: '70%', left: '63%' },
        roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'],
        actions: [{ id: 'MARKET_VIEW', label: 'Åpne Handel', cost: 'Gratis' }]
    },
    {
        id: 'village', label: 'Landsbyen', icon: '🏠', top: '42%', left: '42%',
        vest: { top: '50%', left: '52%' },
        ost: { top: '55%', left: '44%' },
        roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'],
        actions: [], isHub: true
    },
    {
        id: 'mine', label: 'Gruve-distriktet', icon: '⛏️', top: '12%', left: '25%',
        vest: { top: '13%', left: '39%' },
        ost: { top: '20%', left: '60%' },
        roles: ['PEASANT', 'BARON', 'KING'],
        actions: [], isHub: true
    },
    {
        id: 'monastery', label: 'Klosteret', icon: '⛪', top: '16%', left: '55%',
        vest: { top: '50%', left: '78%' },
        ost: { top: '50%', left: '27%' },
        roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'],
        actions: [], isHub: true
    },
    {
        id: 'border', label: 'Grensen', icon: '⚔️', top: '85%', left: '80%',
        vest: { top: '15%', left: '10%' },
        ost: { top: '15%', left: '10%' },
        roles: ['BARON'],
        actions: [{ id: 'RAID', label: 'Plyndre Nabo', cost: '-40⚡' }]
    },

    // --- CASTLE LOCAL ---
    {
        id: 'throne_room', label: 'Tronsalen', icon: '👑', top: '40%', left: '50%', roles: ['KING'], parentId: 'castle',
        actions: [
            { id: 'TAX_ROYAL', label: 'Kongelig Skatt', cost: 'King Only' },
            { id: 'DECREE', label: 'Utsted Dekret', cost: 'King Only' }
        ]
    },
    {
        id: 'barracks', label: 'Kasernen', icon: '🗡️', top: '60%', left: '30%', roles: ['BARON', 'KING', 'SOLDIER'], parentId: 'castle',
        actions: [{ id: 'DRAFT', label: 'Verve Soldater', cost: '-5g -10🍞' }]
    },
    {
        id: 'royal_chambers', label: 'Kongens Kammer', icon: '🛌', top: '30%', left: '70%', roles: ['BARON', 'KING'], parentId: 'castle',
        actions: [{ id: 'REST', label: 'Hvile i Kammeret', cost: '-1🍞 +30⚡' }]
    },

    // --- VILLAGE LOCAL HUB (CITY) ---
    {
        id: 'village_square', label: 'Landsbytorg', icon: '⛲', top: '50%', left: '50%',
        village: { top: '48%', left: '50%' },
        roles: ['PEASANT', 'BARON', 'KING'], parentId: 'village',
        actions: [
            { id: 'REST', label: 'Hvile på torget', cost: '+10⚡' }
        ]
    },
    {
        id: 'tavern', label: 'Vertshuset', icon: '🍺', top: '35%', left: '75%',
        village: { top: '75%', left: '80%' },
        roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER'], parentId: 'village',
        actions: [
            { id: 'ENTER_TAVERN', label: 'Gå inn', cost: 'Gratis' },
            { id: 'REST_BASIC', label: 'Hvile i Salen', cost: 'Gratis' },
            { id: 'REST_COMFY', label: 'Bestille Kammer', cost: '-5g' },
            { id: 'REST_ROYAL', label: 'Kongelig Suite', cost: '-20g' }
        ], isHub: true, isInterior: true
    },

    {
        id: 'bakery', label: 'Bakeri', icon: '🍞', top: '80%', left: '30%',
        village: { top: '38%', left: '35%' },
        roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [],
        isHub: true, isInterior: true
    },


    {
        id: 'great_forge', label: 'Storsmie', icon: '⚒️', top: '35%', left: '15%',
        village: { top: '48%', left: '23%' },
        roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [],
        isHub: true, isInterior: true
    },
    {
        id: 'windmill', label: 'Vindmølle', icon: '🌬️', top: '20%', left: '37%',
        village: { top: '25%', left: '17%' },
        roles: ['PEASANT', 'BARON', 'KING'], parentId: 'village',
        actions: [
            { id: 'REFINE_flour', label: 'Male Mel', cost: '-15⚡ -10korn' }
        ], isHub: true, isInterior: true
    },
    {
        id: 'smeltery', label: 'Smeltehytte', icon: '🔥', top: '60%', left: '95%',
        village: { top: '75%', left: '12%' },
        roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [
            { id: 'REFINE_IRON_BASIC', label: 'Smelte Jern', cost: '-20⚡ -5malm' },
            { id: 'REFINE_IRON_FAST', label: 'Industri-smelting', cost: '-30⚡ -10malm' },
            { id: 'REFINE_STEEL', label: 'Smelte Stål', cost: '-50⚡ -20malm' }
        ], isHub: true, isInterior: true
    },
    {
        id: 'sawmill', label: 'Sagbruk', icon: '🪚', top: '55%', left: '15%',
        village: { top: '70%', left: '45%' },
        roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [
            { id: 'REFINE_PLANK_BASIC', label: 'Sag Planker', cost: '-10⚡ -5ved' },
            { id: 'REFINE_PLANK_FAST', label: 'Hurtig-saging', cost: '-15⚡ -5ved' }
        ], isHub: true, isInterior: true
    },



    {
        id: 'weavery', label: 'Veveri', icon: '🧶', top: '50%', left: '85%',
        village: { top: '45%', left: '65%' },
        roles: ['PEASANT', 'BARON', 'MERCHANT'], parentId: 'village',
        actions: [],
        isHub: true, isInterior: true
    },


    {
        id: 'watchtower', label: 'Vaktårn', icon: '🏰', top: '15%', left: '68%',
        village: { top: '25%', left: '82%' },
        roles: ['BARON', 'SOLDIER'], parentId: 'village',
        actions: [],
        isHub: true, isInterior: true
    },

    {
        id: 'stables', label: 'Stall', icon: '🐴', top: '80%', left: '80%',
        village: { top: '45%', left: '90%' },
        roles: ['BARON', 'SOLDIER', 'KING'], parentId: 'village',
        actions: [],
        isHub: true, isInterior: true
    },

    {
        id: 'well', label: 'Bybrønn', icon: '💧', top: '69%', left: '60%',
        village: { top: '48%', left: '50%' },
        roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [],
        isHub: true
    },

    {
        id: 'apothecary', label: 'Apoteker', icon: '🌿', top: '20%', left: '82%',
        village: { top: '60%', left: '92%' },
        roles: ['PEASANT', 'BARON', 'KING', 'MERCHANT'], parentId: 'village',
        actions: [],
        isHub: true, isInterior: true
    },
    // --- GREAT FORGE INTERIOR ---
    {
        id: 'forge_anvil', label: 'Ambolt', icon: '🔨', top: '50%', left: '40%', roles: ['PEASANT', 'BARON'], parentId: 'great_forge',
        actions: [
            { id: 'OPEN_CRAFTING', label: 'Åpne Smia', cost: 'Gratis' }
        ]
    },
    {
        id: 'forge_upgrades', label: 'Tegneark', icon: '📜', top: '40%', left: '75%', roles: ['PEASANT', 'BARON'], parentId: 'great_forge',
        actions: [{ id: 'BUILDING_UPGRADE_great_forge', label: 'Oppgrader Smia', cost: 'Varierer' }]
    },
    // --- BAKERY INTERIOR ---
    {
        id: 'bakery_oven', label: 'Bakerovn', icon: '🔥', top: '50%', left: '50%', roles: ['PEASANT', 'BARON'], parentId: 'bakery',
        actions: [
            { id: 'REFINE', label: 'Åpne Bakeriet', cost: 'Gratis' }
        ]
    },
    {
        id: 'bakery_upgrades', label: 'Tegneark', icon: '📜', top: '30%', left: '80%', roles: ['PEASANT', 'BARON'], parentId: 'bakery',
        actions: [{ id: 'BUILDING_UPGRADE_bakery', label: 'Oppgrader Bakeriet', cost: 'Varierer' }]
    },
    // --- WINDMILL INTERIOR ---
    {
        id: 'windmill_stones', label: 'Kvernsteiner', icon: '⚙️', top: '50%', left: '40%', roles: ['PEASANT', 'BARON'], parentId: 'windmill',
        actions: [
            { id: 'REFINE', label: 'Åpne Mølla', cost: 'Gratis' }
        ]
    },
    {
        id: 'windmill_upgrades', label: 'Tegneark', icon: '📜', top: '40%', left: '80%', roles: ['PEASANT', 'BARON'], parentId: 'windmill',
        actions: [{ id: 'BUILDING_UPGRADE_windmill', label: 'Oppgrader Mølla', cost: 'Varierer' }]
    },
    // --- SAWMILL INTERIOR ---
    {
        id: 'sawmill_blade', label: 'Saga', icon: '🪚', top: '50%', left: '40%', roles: ['PEASANT', 'BARON'], parentId: 'sawmill',
        actions: [
            { id: 'REFINE', label: 'Åpne Sagbruket', cost: 'Gratis' }
        ]
    },
    {
        id: 'sawmill_upgrades', label: 'Tegneark', icon: '📜', top: '40%', left: '80%', roles: ['PEASANT', 'BARON'], parentId: 'sawmill',
        actions: [{ id: 'BUILDING_UPGRADE_sawmill', label: 'Oppgrader Sagbruket', cost: 'Varierer' }]
    },
    // --- SMELTERY INTERIOR ---
    {
        id: 'smeltery_furnace', label: 'Smelteovn', icon: '🔥', top: '50%', left: '30%', roles: ['PEASANT', 'BARON'], parentId: 'smeltery',
        actions: [
            { id: 'REFINE', label: 'Åpne Smeltehytta', cost: 'Gratis' }
        ]
    },
    {
        id: 'smeltery_upgrades', label: 'Tegneark', icon: '📜', top: '40%', left: '80%', roles: ['PEASANT', 'BARON'], parentId: 'smeltery',
        actions: [{ id: 'BUILDING_UPGRADE_smeltery', label: 'Oppgrader Smeltehytta', cost: 'Varierer' }]
    },
    // --- WEAVERY INTERIOR ---
    {
        id: 'weavery_loom', label: 'Vevstol', icon: '🧶', top: '50%', left: '40%', roles: ['PEASANT', 'BARON', 'MERCHANT'], parentId: 'weavery',
        actions: [
            { id: 'REFINE', label: 'Åpne Veveriet', cost: 'Gratis' }
        ]
    },
    {
        id: 'weavery_upgrades', label: 'Tegneark', icon: '📜', top: '40%', left: '80%', roles: ['PEASANT', 'BARON'], parentId: 'weavery',
        actions: [{ id: 'BUILDING_UPGRADE_weavery', label: 'Oppgrader Veveriet', cost: 'Varierer' }]
    },
    // --- STABLES INTERIOR ---
    {
        id: 'stables_stall', label: 'Stallplass', icon: '🐴', top: '50%', left: '40%', roles: ['BARON', 'SOLDIER', 'KING'], parentId: 'stables',
        actions: [
            { id: 'MOUNT_HORSE', label: 'Ri ut', cost: '-5⚡' }
        ]
    },
    {
        id: 'stables_upgrades', label: 'Tegneark', icon: '📜', top: '40%', left: '80%', roles: ['BARON', 'KING'], parentId: 'stables',
        actions: [{ id: 'BUILDING_UPGRADE_stables', label: 'Oppgrader Stallen', cost: 'Varierer' }]
    },
    // --- WATCHTOWER INTERIOR ---
    {
        id: 'watchtower_top', label: 'Vaktpost', icon: '🏰', top: '30%', left: '50%', roles: ['BARON', 'SOLDIER'], parentId: 'watchtower',
        actions: [
            { id: 'PATROL', label: 'Patruljer', cost: '-30⚡' }
        ]
    },
    {
        id: 'watchtower_upgrades', label: 'Tegneark', icon: '📜', top: '50%', left: '80%', roles: ['BARON'], parentId: 'watchtower',
        actions: [{ id: 'BUILDING_UPGRADE_watchtower', label: 'Oppgrader Tårnet', cost: 'Varierer' }]
    },
    // --- APOTHECARY INTERIOR ---
    {
        id: 'apothecary_bench', label: 'Arbeidsbenk', icon: '🧪', top: '50%', left: '40%', roles: ['PEASANT', 'BARON'], parentId: 'apothecary',
        actions: [
            { id: 'OPEN_CRAFTING', label: 'Åpne Apoteket', cost: 'Gratis' }
        ]
    },
    {
        id: 'apothecary_upgrades', label: 'Tegneark', icon: '📜', top: '40%', left: '80%', roles: ['PEASANT', 'BARON'], parentId: 'apothecary',
        actions: [{ id: 'BUILDING_UPGRADE_apothecary', label: 'Oppgrader Apoteket', cost: 'Varierer' }]
    },
    // --- WELL INTERIOR (Courtyard) ---
    {
        id: 'well_water', label: 'Brønnkum', icon: '💧', top: '50%', left: '50%', roles: ['PEASANT', 'BARON'], parentId: 'well',
        actions: [
            { id: 'GATHER_WATER', label: 'Hent Vann', cost: '-10⚡' }
        ]
    },
    {
        id: 'well_upgrades', label: 'Tegneark', icon: '📜', top: '40%', left: '80%', roles: ['PEASANT', 'BARON'], parentId: 'well',
        actions: [{ id: 'BUILDING_UPGRADE_well', label: 'Oppgrader Brønnen', cost: 'Varierer' }]
    },




    // --- TAVERN LOCAL ---
    {
        id: 'tavern_bar', label: 'Baren', icon: '🍗', top: '30%', left: '30%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'tavern',
        actions: [
            { id: 'BUY_MEAL', label: 'Kjøp Måltid', cost: '-5g +10⚡' },
            { id: 'REST_BASIC', label: 'Hvile i Salen', cost: 'Gratis' },
            { id: 'REST_COMFY', label: 'Bestille Kammer', cost: '-5g' },
            { id: 'REST_ROYAL', label: 'Kongelig Suite', cost: '-20g' }
        ]
    },
    {
        id: 'tavern_gambling', label: 'Spillebordet', icon: '🎲', top: '50%', left: '50%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'tavern',
        actions: [{ id: 'OPEN_DICE_GAME', label: 'Spill Terninger', cost: 'Min. 0.5g' }]
    },
    {
        id: 'tavern_gossip', label: 'Lokalbefolkningen', icon: '🗣️', top: '40%', left: '70%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'tavern',
        actions: [{ id: 'CHAT_LOCAL', label: 'Snakk med folk', cost: 'Gratis' }]
    },
    {
        id: 'tavern_upgrades', label: 'Tegneark', icon: '📜', top: '25%', left: '85%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'tavern',
        actions: [{ id: 'BUILDING_UPGRADE_tavern', label: 'Oppgrader Vertshuset', cost: 'Varierer' }]
    },

    // --- FIELDS LOCAL ---
    {
        id: 'grain_fields', label: 'Kornåker', icon: '🌾', top: '50%', left: '20%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'fields',
        actions: [
            { id: 'PLANT', label: 'Så Korn', cost: '-5 korn -25⚡' }
        ]
    },
    {
        id: 'sheep_pasture', label: 'Sauebeite', icon: '🐑', top: '35%', left: '65%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'fields',
        actions: [
            { id: 'GATHER_WOOL', label: 'Klipp Sauer', cost: '-15⚡' }
        ]
    },
    {
        id: 'beehives', label: 'Bikuber', icon: '🍯', top: '75%', left: '70%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'fields',
        actions: [
            { id: 'GATHER_HONEY', label: 'Samle Honning', cost: '-20⚡' }
        ]
    },




    // --- INDUSTRY LOCAL ---
    {
        id: 'mine_shaft', label: 'Jern-gruva', icon: '⛏️', top: '50%', left: '12%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'mine',
        actions: [{ id: 'MINE', label: 'Bryte Malm', cost: '-25⚡ -1🍞' }]
    },
    {
        id: 'quarry_poi', label: 'Steinhuggeriet', icon: '🪨', top: '40%', left: '85%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'mine',
        actions: [{ id: 'QUARRY', label: 'Hugge Stein', cost: '-20⚡ -1🍞' }]
    },





    // --- FOREST LOCAL ---
    {
        id: 'forest_clearing', label: 'Hogstfeltet', icon: '🪓', top: '60%', left: '30%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'forest',
        actions: [
            { id: 'CHOP', label: 'Hugge Ved', cost: '-15⚡ -1🍞' }
        ]
    },
    {
        id: 'hunting_grounds', label: 'Jaktmarker', icon: '🏹', top: '30%', left: '75%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'forest',
        actions: [
            { id: 'HUNT', label: 'Dra på Jakt', cost: '-30⚡ -2🍞' }
        ]
    },
    {
        id: 'forest_forage', label: 'Bærplukking', icon: '🍓', top: '60%', left: '90%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'forest',
        actions: [{ id: 'FORAGE', label: 'Sanke Mat (Nød)', cost: '-40⚡' }]
    },





    // --- MONASTERY LOCAL ---
    {
        id: 'monastery_chapel', label: 'Klosterkirken', icon: '⛪', top: '50%', left: '50%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'monastery',
        actions: [{ id: 'PRAY', label: 'Be en Bønn', cost: '-15⚡' }]
    },

    // --- PEASANT FARM LOCAL ---
    {
        id: 'farm_house', label: 'Inne i Stugo', icon: '🏠', top: '52%', left: '58%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'peasant_farm',
        actions: [], isHub: true, isInterior: true
    },
    {
        id: 'stugo_bed', label: 'Senga', icon: '🛌', top: '65%', left: '42%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'farm_house',
        actions: [{ id: 'SLEEP', label: 'Sove tungt', cost: 'Full ⚡' }]
    },
    {
        id: 'stugo_fireplace', label: 'Peisen', icon: '🔥', top: '55%', left: '80%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'farm_house',
        actions: [{ id: 'EAT', label: 'Sitte ved varmen', cost: '-1🍞 +40⚡' }]
    },
    {
        id: 'farm_well', label: 'Brønnen', icon: '💧', top: '60%', left: '27%', roles: ['PEASANT'], parentId: 'peasant_farm',
        actions: [{ id: 'REST', label: 'Drikke vann', cost: '+5⚡' }]
    },
    {
        id: 'farm_upgrade_spot', label: 'Tegneark', icon: '📜', top: '40%', left: '15%', roles: ['PEASANT'], parentId: 'farm_house',
        actions: [{ id: 'BUILDING_UPGRADE_farm_house', label: 'Bygg ut gården', cost: 'Varierer' }]
    },
    {
        id: 'chicken_coop', label: 'Hønsehus', icon: '🐔', top: '40%', left: '75%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'peasant_farm',
        actions: [
            { id: 'OPEN_CHICKEN_COOP', label: 'Gå inn til hønene', cost: 'Gratis' }
        ]
    },


    // --- VILLAGE CONSTRUCTION LOCAL ---
    {
        id: 'construction_site', label: 'Byggeplass', icon: '🏗️', top: '50%', left: '50%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'village_construction',
        actions: [{ id: 'CONSTRUCT', label: 'Bidra til prosjektet', cost: '-20⚡' }]
    }
];
