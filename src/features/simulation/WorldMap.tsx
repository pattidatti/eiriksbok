import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SimulationPlayer } from './simulationTypes';
import { VILLAGE_BUILDINGS, CRAFTING_RECIPES } from './constants';
import { useSimulation } from './SimulationContext';



import { TAVERN_NPCS } from './TavernData';
import type { TavernNPC } from './TavernData';
import { TavernDiceGame } from './TavernDiceGame';
import { FloatingActionTooltip } from './components/FloatingActionTooltip';
import { SimulationAtmosphereLayer } from './components/SimulationAtmosphereLayer';
import { SimulationProcessHUD } from './components/SimulationProcessHUD';
import { SimulationMapWindow } from './components/ui/SimulationMapWindow';




interface POI {
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
}

const POINTS_OF_INTEREST: POI[] = [
    // --- GLOBAL HUBS ---
    {
        id: 'fields', label: 'Åkrene', icon: '🌾', top: '22%', left: '%',
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
        ], isHub: true
    },

    {
        id: 'bakery', label: 'Bakeri', icon: '🍞', top: '80%', left: '30%',
        village: { top: '38%', left: '35%' },
        roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [],
        isHub: true
    },


    {
        id: 'great_forge', label: 'Storsmie', icon: '⚒️', top: '35%', left: '15%',
        village: { top: '48%', left: '23%' },
        roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [],
        isHub: true
    },
    {
        id: 'windmill', label: 'Vindmølle', icon: '🌬️', top: '20%', left: '37%',
        village: { top: '25%', left: '17%' },
        roles: ['PEASANT', 'BARON', 'KING'], parentId: 'village',
        actions: [
            { id: 'REFINE_FLOUR_BASIC', label: 'Male Mel', cost: '-15⚡ -10korn' },
            { id: 'REFINE_FLOUR_FAST', label: 'Hurtig-maling', cost: '-20⚡ -15korn' }
        ], isHub: true
    },
    {
        id: 'smeltery', label: 'Smeltehytte', icon: '🔥', top: '60%', left: '95%',
        village: { top: '75%', left: '12%' },
        roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [
            { id: 'REFINE_IRON_BASIC', label: 'Smelte Jern', cost: '-20⚡ -5malm' },
            { id: 'REFINE_IRON_FAST', label: 'Industri-smelting', cost: '-30⚡ -10malm' },
            { id: 'REFINE_STEEL', label: 'Smelte Stål', cost: '-50⚡ -20malm' }
        ], isHub: true
    },
    {
        id: 'sawmill', label: 'Sagbruk', icon: '🪚', top: '55%', left: '15%',
        village: { top: '70%', left: '45%' },
        roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [
            { id: 'REFINE_TIMBER_BASIC', label: 'Sag Tømmer', cost: '-10⚡ -5ved' },
            { id: 'REFINE_TIMBER_FAST', label: 'Hurtig-saging', cost: '-15⚡ -5ved' }
        ], isHub: true
    },



    {
        id: 'weavery', label: 'Veveri', icon: '🧶', top: '50%', left: '85%',
        village: { top: '45%', left: '65%' },
        roles: ['PEASANT', 'BARON', 'MERCHANT'], parentId: 'village',
        actions: [],
        isHub: true
    },


    {
        id: 'watchtower', label: 'Vaktårn', icon: '🏰', top: '15%', left: '68%',
        village: { top: '25%', left: '82%' },
        roles: ['BARON', 'SOLDIER'], parentId: 'village',
        actions: [],
        isHub: true
    },

    {
        id: 'stables', label: 'Stall', icon: '🐴', top: '80%', left: '80%',
        village: { top: '45%', left: '90%' },
        roles: ['BARON', 'SOLDIER', 'KING'], parentId: 'village',
        actions: [],
        isHub: true
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
        isHub: true
    },
    // --- GREAT FORGE INTERIOR ---
    {
        id: 'forge_anvil', label: 'Ambolt', icon: '🔨', top: '50%', left: '40%', roles: ['PEASANT', 'BARON'], parentId: 'great_forge',
        actions: [
            { id: 'stone_axe', label: 'Smi eller reparer', cost: '-10stein -5ved' },
            { id: 'stone_pickaxe', label: 'Smi Steinhakke', cost: '-10stein -5ved' },
            { id: 'iron_axe', label: 'Smi Jernøks', cost: '-5b -2t' },
            { id: 'iron_pickaxe', label: 'Smi Jernhakke', cost: '-5b -2t' },
            { id: 'iron_sword', label: 'Smi Jernsverd', cost: '-10b -2t' },
            { id: 'REPAIR', label: 'Reparer Utstyr', cost: '-5g -10jern' }
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
            { id: 'CRAFT_BREAD', label: 'Bake Brød', cost: '-10⚡ -2mel' },
            { id: 'CRAFT_PIE', label: 'Bake Pai', cost: '-20⚡ -4mel' },
            { id: 'CRAFT_FEAST', label: 'Gildemåltid', cost: '-50⚡ -10mel' }
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
            { id: 'REFINE_FLOUR_BASIC', label: 'Male Mel', cost: '-15⚡ -10korn' },
            { id: 'REFINE_FLOUR_FAST', label: 'Hurtig-maling', cost: '-20⚡ -15korn' }
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
            { id: 'REFINE_TIMBER_BASIC', label: 'Sag Tømmer', cost: '-10⚡ -5ved' },
            { id: 'REFINE_TIMBER_FAST', label: 'Hurtig-saging', cost: '-15⚡ -5ved' }
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
            { id: 'REFINE_IRON_BASIC', label: 'Smelte Jern', cost: '-20⚡ -5malm' },
            { id: 'REFINE_IRON_FAST', label: 'Industri-smelting', cost: '-30⚡ -10malm' },
            { id: 'REFINE_STEEL', label: 'Smelte Stål', cost: '-50⚡ -20malm' }
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
            { id: 'REFINE_CLOTH_BASIC', label: 'Vev Stoff', cost: '-15⚡ -5ull' },
            { id: 'REFINE_CLOTH_FAST', label: 'Hurtig-veving', cost: '-20⚡ -5ull' }
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
            { id: 'CRAFT_MEDICINE', label: 'Lag Medisin', cost: '-20⚡' }
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
        actions: [], isHub: true
    },
    {
        id: 'stugo_bed', label: 'Senga', icon: '🛌', top: '65%', left: '42%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'farm_house',
        actions: [{ id: 'SLEEP', label: 'Sove tungt', cost: '+60⚡' }]
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


    // --- VILLAGE CONSTRUCTION LOCAL ---
    {
        id: 'construction_site', label: 'Byggeplass', icon: '🏗️', top: '50%', left: '50%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'village_construction',
        actions: [{ id: 'CONSTRUCT', label: 'Bidra til prosjektet', cost: '-20⚡' }]
    }
];


interface WorldMapProps {
    player: SimulationPlayer;
    world: any;
    worldEvents?: any;
    players?: Record<string, SimulationPlayer>;
    onAction: (action: any) => void;
    onOpenMarket: () => void;
    room: any;
}

export const WorldMap: React.FC<WorldMapProps> = React.memo(({ player, room, world, worldEvents, players, onAction, onOpenMarket }) => {

    const {
        setActiveTab,
        setProductionContext,
        viewMode,
        setViewMode,
        viewingRegionId: ctxViewingRegionId,
        setViewingRegionId,
        activeTab
    } = useSimulation();

    // Initialize viewing region if not set in context
    React.useEffect(() => {
        if (!ctxViewingRegionId) {
            setViewingRegionId(player.regionId || 'capital');
        }
    }, [ctxViewingRegionId, player.regionId, setViewingRegionId]);

    const viewingRegionId = ctxViewingRegionId || player.regionId || 'capital';

    const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [upgradingBuildingId, setUpgradingBuildingId] = useState<string | null>(null);

    const [dialogNPC, setDialogNPC] = useState<TavernNPC | null>(null);
    const [dialogStep, setDialogStep] = useState<string>('start');
    const [isDiceGameOpen, setIsDiceGameOpen] = useState(false);

    const getViewLevel = (mode: string): number => {
        if (mode === 'kingdom') return 0;
        if (mode === 'global') return 1;
        const poi = POINTS_OF_INTEREST.find(p => p.id === mode);
        if (poi?.parentId) return 3;
        return 2;
    };

    // Track navigation direction for animations
    const [lastViewMode, setLastViewMode] = useState(viewMode);
    const [direction, setDirection] = useState<'in' | 'out'>('in');

    if (viewMode !== lastViewMode) {
        const prevLevel = getViewLevel(lastViewMode);
        const currLevel = getViewLevel(viewMode);

        if (currLevel > prevLevel) setDirection('in');
        else if (currLevel < prevLevel) setDirection('out');

        setLastViewMode(viewMode);
    }

    // ESC Key Handling: Hierarchical
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                // Only handle if we are on the MAP tab
                if (activeTab !== 'MAP') return;

                // Priority 1: Close active Overlays/Windows
                if (upgradingBuildingId) { setUpgradingBuildingId(null); return; }
                if (isDiceGameOpen) { setIsDiceGameOpen(false); return; }
                if (dialogNPC) { setDialogNPC(null); return; }
                if (selectedEvent) { setSelectedEvent(null); return; }
                if (selectedPOI) { setSelectedPOI(null); return; }

                // Priority 2: Return to MAP tab if elsewhere
                // (Though usually this component is only rendered in MAP tab)

                // Priority 3: Navigate Up Hierarchy
                if (viewMode !== 'kingdom') {
                    const currentHub = POINTS_OF_INTEREST.find(p => p.id === viewMode);
                    const parentHub = currentHub?.parentId ? POINTS_OF_INTEREST.find(p => p.id === currentHub.parentId) : null;

                    if (viewMode === 'global') {
                        setViewMode('kingdom');
                    } else if (parentHub) {
                        setViewMode(parentHub.id);
                    } else {
                        setViewMode('global');
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewMode, upgradingBuildingId, isDiceGameOpen, dialogNPC, selectedEvent, selectedPOI, setViewMode, activeTab]);




    // Reset viewing region to player's region when opening action (optional, but keeps context safe)
    // Actually, we want persistence during browsing.

    const handlePOIAction = (poiId: string, actionId: string) => {

        // Helper: Is this a production workstation?
        const getProductionContext = (pId: string): { buildingId: string, type: 'REFINE' | 'CRAFT' } | null => {
            if (pId === 'windmill_stones') return { buildingId: 'windmill', type: 'REFINE' };
            if (pId === 'sawmill_blade') return { buildingId: 'sawmill', type: 'REFINE' };
            if (pId === 'smeltery_furnace') return { buildingId: 'smeltery', type: 'REFINE' };
            if (pId === 'bakery_oven') return { buildingId: 'bakery', type: 'REFINE' };
            if (pId === 'weavery_loom') return { buildingId: 'weavery', type: 'REFINE' };
            if (pId === 'forge_anvil') return { buildingId: 'great_forge', type: 'CRAFT' };
            return null;
        };

        const prodCtx = getProductionContext(poiId);
        if (prodCtx && (actionId.startsWith('REFINE_') || actionId.startsWith('CRAFT_') || CRAFTING_RECIPES[actionId] || actionId === 'REPAIR')) {
            setProductionContext({
                ...prodCtx,
                initialView: actionId === 'REPAIR' ? 'REPAIR' : 'PRODUCE'
            });
            setActiveTab('PRODUCTION');
            setSelectedPOI(null);
            return;
        }

        // PERMISSION CHECK: STRICT
        // Players (except maybe King?) cannot act in other regions
        // Allow King to act anywhere? User said "player from another barony". King is usually above.
        // Let's assume King can act anywhere, others only at home.
        const isHomeRegion = viewingRegionId === player.regionId;
        const isKing = player.role === 'KING';

        if (!isHomeRegion && !isKing && actionId !== 'MARKET_VIEW') { // Market might be global?
            alert("Du har ingen myndighet i dette baroniet.");
            return;
        }

        if (actionId === 'MARKET_VIEW') {
            onOpenMarket();
        } else if (actionId.startsWith('REFINE_')) {
            const recipeKey = actionId.replace('REFINE_', '').split('_')[0].toLowerCase();
            const recipeMap: any = {
                'timber': 'timber',
                'flour': 'flour',
                'iron': 'iron_ingot',
                'steel': 'iron_ingot', // Currently same, could be different later
                'cloth': 'cloth'
            };
            onAction({ type: 'REFINE', recipeId: recipeMap[recipeKey] || recipeKey });
        } else if (actionId.startsWith('CRAFT_')) {
            const subType = actionId.replace('CRAFT_', '').toLowerCase();
            // Check if it's a refinery recipe (like bread/pie) or item crafting
            if (subType === 'bread' || subType === 'pie' || subType === 'mead') {
                onAction({ type: 'REFINE', recipeId: subType });
            } else {
                onAction({ type: 'CRAFT', subType });
            }
        } else if (actionId in CRAFTING_RECIPES) {
            onAction({ type: 'CRAFT', subType: actionId });

        } else if (actionId.startsWith('BUILDING_UPGRADE_')) {
            const bId = actionId.replace('BUILDING_UPGRADE_', '');
            setUpgradingBuildingId(bId);


        } else if (actionId === 'OPEN_DICE_GAME') {
            setIsDiceGameOpen(true);
        } else if (actionId === 'CHAT_LOCAL') {
            const randomNPC = TAVERN_NPCS[Math.floor(Math.random() * TAVERN_NPCS.length)];
            setDialogNPC(randomNPC);
            setDialogStep('start');
        } else if (actionId === 'BUY_MEAL') {
            onAction({ type: 'BUY_MEAL' });
        } else {
            onAction(actionId);
        }
        setSelectedPOI(null);
    };

    const weather = world?.weather || 'Clear';

    // Get current map background
    const getBackground = () => {
        if (viewMode === 'kingdom') return '/map_kingdom_169.png';

        switch (viewMode) {
            case 'village': return '/map_village_hub_1610.png';
            case 'village_construction': return '/map_village_construction.png';
            case 'castle': return '/map_castle_interior.png';
            case 'fields': return '/map_farm_fields.png';
            case 'peasant_farm': {
                const level = world?.settlement?.buildings?.farm_house?.level || 1;
                if (level > 1) return `/map_peasant_farm_lvl${level}.png`;
                return '/map_peasant_farm.png';
            }
            case 'farm_house': {
                const level = world?.settlement?.buildings?.farm_house?.level || 1;
                if (level > 1) return `/map_stugo_interior_lvl${level}.png`;
                return '/map_stugo_interior.png';
            }
            case 'mine': return '/map_mountain_pass.png';
            case 'forest': return '/map_forest.png';
            case 'monastery': return '/map_monastery.png';
            case 'tavern': return '/map_tavern_interior.png';
            case 'great_forge': return '/map_forge_interior.png';
            case 'bakery': return '/map_bakery_interior.png';
            case 'windmill': return '/map_windmill_interior.png';
            case 'sawmill': return '/map_sawmill_interior.png';
            case 'smeltery': return '/map_smeltery_interior.png';
            case 'weavery': return '/map_weavery_interior.png';
            case 'stables': return '/map_stables_interior.png';
            case 'watchtower': return '/map_watchtower_interior.png';
            case 'well': return '/map_well_interior.png';
            case 'apothecary': return '/map_apothecary_interior.png';

            case 'global':
                if (viewingRegionId === 'region_ost') {
                    return '/map_barony_ost_169.png';
                }
                if (viewingRegionId === 'capital') {
                    return '/map_hovedstad_169.png';
                }
                return '/map_barony_vest_v2_1610.png';
            default: return '/map_barony_vest_v2_1610.png';
        }
    };

    // Find specific barons for map layout
    const playersArr = Object.values(players || {});
    const baronVest = playersArr.find(p => p.role === 'BARON' && p.regionId === 'region_vest');
    const baronOst = playersArr.find(p => p.role === 'BARON' && p.regionId === 'region_ost');

    // Determine Aspect Ratio based on map type
    const isWidescreen =
        viewMode === 'kingdom' ||
        (viewMode === 'global' && (viewingRegionId === 'region_ost' || viewingRegionId === 'capital'));

    const aspectRatioClass = isWidescreen ? 'aspect-video' : 'aspect-[16/10]';

    const containerVariants = {
        initial: (dir: 'in' | 'out') => ({
            opacity: 0,
            scale: dir === 'in' ? 0.9 : 1.1, // Zoom In starts small, Zoom Out starts large
            filter: 'blur(10px)',
        }),
        animate: {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as any,
                staggerChildren: 0.05
            }
        },
        exit: (dir: 'in' | 'out') => ({
            opacity: 0,
            scale: dir === 'in' ? 1.1 : 0.9, // Zoom In exits large, Zoom Out exits small
            filter: 'blur(10px)',
            pointerEvents: 'none',
            transition: {
                duration: 0.4,
                ease: [0.7, 0, 0.84, 0] as any
            }
        })
    };

    const mapKey = `${viewMode}-${viewingRegionId}`;

    return (
        <>
            <div className={`relative w-full max-w-full max-h-full mx-auto ${aspectRatioClass} rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-white/5 bg-slate-950 transition-all duration-1000`}>

                <AnimatePresence mode="popLayout" custom={direction}>
                    <motion.div
                        key={mapKey}
                        custom={direction}
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute inset-0 w-full h-full will-change-transform"
                    >
                        {/* The Map Background */}
                        <motion.img
                            src={getBackground()}
                            alt="Map View"
                            className={`w-full h-full object-cover ${weather === 'Fog' ? 'blur-sm' : ''}`}
                            onError={(e) => {
                                e.currentTarget.src = '/simulation_map_v2.png';
                                e.currentTarget.className += ' opacity-30';
                            }}
                        />

                        {/* Atmospheric Overlays - Only for outdoor locations */}
                        {(() => {
                            const indoorViews = ['castle', 'farm_house', 'tavern', 'great_forge', 'bakery', 'windmill', 'sawmill', 'smeltery', 'weavery', 'stables', 'watchtower', 'well', 'apothecary'];
                            const isOutdoor = !indoorViews.includes(viewMode);

                            if (!isOutdoor) return null;

                            return (
                                <SimulationAtmosphereLayer
                                    weather={weather as any}
                                    season={world?.season || 'Spring'}
                                    hideClouds={viewMode === 'forest'}
                                />
                            );
                        })()}

                        {/* KINGDOM MAP PINS */}
                        {viewMode === 'kingdom' && (
                            <>
                                {/* CAPITAL PIN (Center) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-30 group"
                                >
                                    <button
                                        onClick={() => {
                                            setViewingRegionId('capital');
                                            setViewMode('global');
                                        }}
                                        className="flex flex-col items-center hover:scale-110 transition-transform"
                                    >
                                        <div className="text-6xl drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] animate-pulse">🏰</div>
                                        <div className="bg-black/80 text-amber-400 px-4 py-2 rounded-xl mt-2 font-black uppercase tracking-widest text-xs border border-amber-500/50 shadow-xl backdrop-blur-md">
                                            Kongeriket
                                        </div>
                                    </button>
                                </motion.div>

                                {/* BARONY VEST PIN (West/Left map region) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="absolute top-[65%] left-[15%] -translate-x-1/2 -translate-y-1/2 z-30 group"
                                >
                                    <button
                                        onClick={() => {
                                            setViewingRegionId('region_vest');
                                            setViewMode('global');
                                        }}
                                        className="flex flex-col items-center hover:scale-110 transition-transform"
                                    >
                                        <div className="text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🏯</div>
                                        <div className="bg-black/80 text-indigo-300 px-3 py-1 rounded-xl mt-2 font-bold text-[10px] uppercase tracking-wider border border-white/10 shadow-xl backdrop-blur-md whitespace-nowrap">
                                            {baronVest?.name || 'Baroni Vest'}
                                        </div>
                                    </button>
                                </motion.div>

                                {/* BARONY OST PIN (East/Right map region) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="absolute top-[65%] left-[85%] -translate-x-1/2 -translate-y-1/2 z-30 group"
                                >
                                    <button
                                        onClick={() => {
                                            setViewingRegionId('region_ost');
                                            setViewMode('global');
                                        }}
                                        className="flex flex-col items-center hover:scale-110 transition-transform"
                                    >
                                        <div className="text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🏘️</div>
                                        <div className="bg-black/80 text-emerald-300 px-3 py-1 rounded-xl mt-2 font-bold text-[10px] uppercase tracking-wider border border-white/10 shadow-xl backdrop-blur-md whitespace-nowrap">
                                            {baronOst?.name || 'Baroni Øst'}
                                        </div>
                                    </button>
                                </motion.div>
                            </>
                        )}

                        {/* Event Markers (Dynamic) - ONLY IN GLOBAL/LOCAL VIEW, NOT KINGDOM */}
                        {viewMode !== 'kingdom' && worldEvents && Object.values(worldEvents).map((event: any) => {
                            const poi = POINTS_OF_INTEREST.find(p => p.id === event.locationId);
                            if (!poi) return null;
                            const isCorrectView = viewMode === 'global' ? !poi.parentId : poi.parentId === viewMode;
                            if (!isCorrectView) return null;

                            const isBarony = viewMode === 'global';
                            const isOst = isBarony && viewingRegionId === 'region_ost';
                            const isVest = isBarony && (viewingRegionId === 'region_vest' || viewingRegionId === 'capital');
                            const isVillage = viewMode === 'village';

                            let top = poi.top;
                            let left = poi.left;

                            if (isVillage && poi.village) {
                                top = poi.village.top;
                                left = poi.village.left;
                            } else if (isOst && poi.ost) {
                                top = poi.ost.top;
                                left = poi.ost.left;
                            } else if (isVest && poi.vest) {
                                top = poi.vest.top;
                                left = poi.vest.left;
                            }

                            return (
                                <motion.div
                                    key={event.id}
                                    style={{ top, left }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute -translate-x-1/2 -translate-y-[150%] z-30"
                                >
                                    <button
                                        onClick={() => setSelectedEvent(event)}
                                        className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(255,255,255,0.4)] border-4 animate-bounce hover:scale-110 transition-transform ${event.type === 'RAID' ? 'bg-rose-600 border-rose-900 text-white' : 'bg-amber-400 border-amber-700 text-slate-800'}`}
                                    >
                                        {event.type === 'RAID' ? '☠️' : '⭐'}
                                    </button>
                                </motion.div>
                            );
                        })}

                        {/* Overlay Grid / Pins - ONLY IN GLOBAL/LOCAL VIEW */}
                        {viewMode !== 'kingdom' && POINTS_OF_INTEREST.map(poi => {
                            const isCorrectView = viewMode === 'global' ? !poi.parentId : poi.parentId === viewMode;
                            if (!isCorrectView) return null;

                            const isRelevant = poi.roles.includes(player.role) || poi.id === 'market' || poi.isHub;
                            const isResourceNode = ['grain_fields', 'forest_clearing', 'mine_shaft', 'quarry_poi', 'forest_forage'].includes(poi.id);

                            const isBarony = viewMode === 'global';
                            const isOst = isBarony && viewingRegionId === 'region_ost';
                            const isVest = isBarony && (viewingRegionId === 'region_vest' || viewingRegionId === 'capital');
                            const isVillage = viewMode === 'village';

                            let top = poi.top;
                            let left = poi.left;

                            if (isVillage && poi.village) {
                                top = poi.village.top;
                                left = poi.village.left;
                            } else if (isOst && poi.ost) {
                                top = poi.ost.top;
                                left = poi.ost.left;
                            } else if (isVest && poi.vest) {
                                top = poi.vest.top;
                                left = poi.vest.left;
                            }

                            return (
                                <motion.div
                                    key={poi.id}
                                    style={{ top, left }}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                                >
                                    <button
                                        onClick={() => {
                                            if (poi.isHub) {
                                                setViewMode(poi.id);
                                            } else {
                                                setSelectedPOI(poi);
                                            }
                                        }}
                                        className={`flex flex-col items-center transition-all ${isRelevant ? 'scale-100' : 'scale-75 opacity-40 grayscale pointer-events-none'}`}
                                    >
                                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-4xl shadow-2xl border-2 transition-all duration-300 group-hover:scale-110 ${selectedPOI?.id === poi.id ? 'bg-indigo-600 border-indigo-400 ring-4 ring-indigo-500/30' : 'bg-slate-900/90 backdrop-blur-xl border-white/10 hover:bg-slate-800'}`}>
                                            {poi.icon}
                                        </div>
                                        <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-2 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-indigo-600/30">
                                            {isResourceNode ? 'KLIKK FOR Å STARTE' : poi.label}
                                        </span>
                                    </button>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                {/* HUD Overlay (Timer/Yields) - Static, outside AnimatePresence for persistence */}
                <SimulationProcessHUD player={player} />



                {/* Navigation Buttons - Persist across transitions */}
                {viewMode === 'global' ? (
                    // Show "To Kingdom" button
                    <button
                        onClick={() => {
                            setViewMode('kingdom');
                            setSelectedPOI(null);
                        }}
                        className="absolute top-6 left-6 z-50 bg-indigo-900/90 backdrop-blur-md text-indigo-100 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl border border-indigo-500/30 flex items-center gap-2 hover:bg-indigo-800 transition-all active:scale-95 group"
                    >
                        <span className="text-xl group-hover:-translate-x-1 transition-transform">🌍</span> Til Kongeriket
                    </button>
                ) : viewMode !== 'kingdom' ? (
                    // Show "Back" button (Hierarchical)
                    (() => {
                        const currentHub = POINTS_OF_INTEREST.find(p => p.id === viewMode);
                        const parentHub = currentHub?.parentId ? POINTS_OF_INTEREST.find(p => p.id === currentHub.parentId) : null;
                        const backLabel = parentHub ? parentHub.label : (viewingRegionId === 'capital' ? 'Hovedstaden' : 'Baroniet');

                        return (
                            <button
                                onClick={() => {
                                    if (parentHub) {
                                        setViewMode(parentHub.id);
                                    } else {
                                        setViewMode('global');
                                    }
                                    setSelectedPOI(null);
                                }}
                                className="absolute top-6 left-6 z-50 bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl border border-white/10 flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                            >
                                ⬅ Tilbake til {backLabel}
                            </button>
                        );
                    })()
                ) : null}

                {/* Event Info Modal */}
                {selectedEvent && (
                    <div className="absolute inset-x-6 bottom-6 z-40 animate-in slide-in-from-bottom-8 duration-500">
                        <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/10 p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${selectedEvent.type === 'RAID' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-500'}`}>
                                        {selectedEvent.type === 'RAID' ? '🔥 Akutt Trussel' : '📜 Spesielt Oppdrag'}
                                    </span>
                                    <h3 className="text-3xl font-black text-white mt-4 tracking-tighter">{selectedEvent.title}</h3>
                                </div>
                                <button onClick={() => setSelectedEvent(null)} className="w-10 h-10 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-colors">✕</button>
                            </div>
                            <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed italic opacity-80">"{selectedEvent.description}"</p>
                            <button
                                onClick={() => {
                                    onAction({ type: selectedEvent.type === 'RAID' ? 'DEFEND' : 'EXPLORE', eventId: selectedEvent.id });
                                    setSelectedEvent(null);
                                }}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl transition-all active:scale-95 ${selectedEvent.type === 'RAID' ? 'bg-rose-600 text-white shadow-rose-600/20' : 'bg-amber-500 text-slate-950 shadow-amber-500/20'}`}
                            >
                                {selectedEvent.type === 'RAID' ? 'TIL VÅPEN! ⚔️' : 'UTFORSK OMRÅDET! 🧭'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Action Tooltip (Floating) */}
                {selectedPOI && (
                    <FloatingActionTooltip
                        poi={selectedPOI}
                        player={player}
                        room={room}
                        viewingRegionId={viewingRegionId}
                        onAction={(actionPayload) => {
                            const actionType = typeof actionPayload === 'string' ? actionPayload : actionPayload.type;

                            // Local UI Actions (Must go through handlePOIAction)
                            if (
                                actionType === 'OPEN_DICE_GAME' ||
                                actionType === 'CHAT_LOCAL' ||
                                actionType === 'MARKET_VIEW' ||
                                actionType === 'BUY_MEAL' ||
                                actionType.startsWith('BUILDING_UPGRADE_') ||
                                actionType.startsWith('REFINE_') ||
                                actionType.startsWith('CRAFT_') ||
                                (typeof CRAFTING_RECIPES !== 'undefined' && actionType in CRAFTING_RECIPES)
                            ) {
                                handlePOIAction(selectedPOI.id, actionType);
                            } else {
                                // Direct dispatch for others (incl. variants objects)
                                if (typeof actionPayload === 'string') {
                                    handlePOIAction(selectedPOI.id, actionPayload);
                                } else {
                                    onAction(actionPayload);
                                    setSelectedPOI(null);
                                }
                            }
                        }}
                        onClose={() => setSelectedPOI(null)}
                    />
                )}


                {/* BUILDING HUB OVERLAY REMOVED IN FAVOR OF IMMERSIVE HUBS */}




                {/* Dialog Overlay */}
                {
                    dialogNPC && (
                        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
                            <div className="bg-slate-900 border-2 border-amber-600/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
                                {/* Header */}
                                <div className="bg-slate-950 p-6 border-b border-white/5 flex gap-4 items-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-amber-500/50 flex items-center justify-center text-3xl shadow-inner">
                                        👤
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-amber-500">{dialogNPC.name}</h3>
                                        <p className="text-sm text-slate-400 italic font-medium">{dialogNPC.role}</p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 space-y-6">
                                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-2 opacity-50">{dialogNPC.description}</div>
                                    <p className="text-slate-300 text-lg leading-relaxed italic border-l-4 border-amber-500/20 pl-4 py-2">
                                        "{dialogNPC.conversation[dialogStep]?.text || "..."}"
                                    </p>

                                    {/* Options */}
                                    <div className="grid gap-3 pt-4">
                                        {dialogNPC.conversation[dialogStep]?.options.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    if (opt.nextId === 'EXIT') {
                                                        setDialogNPC(null);
                                                        // Optional: Award a small XP for talking
                                                        onAction({ type: 'CHAT_LOCAL', performance: 1.0 });
                                                    } else {
                                                        setDialogStep(opt.nextId);
                                                    }
                                                }}
                                                className="w-full text-left bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/50 border border-white/10 p-4 rounded-xl transition-all font-medium text-slate-200 active:scale-[0.98]"
                                            >
                                                <span className="text-amber-500 mr-2">💬</span> {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Dice Game Overlay */}
                {
                    isDiceGameOpen && (
                        <TavernDiceGame
                            playerGold={player.resources?.gold || 0}
                            onClose={() => setIsDiceGameOpen(false)}
                            onPlay={(result) => {
                                onAction({ type: 'GAMBLE_RESULT', ...result });
                            }}
                        />
                    )
                }


                {/* BUILDING UPGRADE MODAL */}
                {
                    upgradingBuildingId && (() => {
                        const buildingDef = VILLAGE_BUILDINGS[upgradingBuildingId];
                        if (!buildingDef) return null;

                        const isPrivate = upgradingBuildingId === 'farm_house';
                        const buildingState = isPrivate
                            ? (player.buildings?.[upgradingBuildingId] || { level: 1, progress: {} })
                            : (world?.settlement?.buildings?.[upgradingBuildingId] || { id: upgradingBuildingId, level: 1, progress: {}, contributions: {} });

                        const currentLevel = (buildingState.level as number) || 1;
                        const nextLevel = currentLevel + 1;
                        const currentLevelDef = buildingDef.levels[currentLevel];
                        const nextLevelDef = buildingDef.levels[nextLevel];

                        return (
                            <SimulationMapWindow
                                title={`${buildingDef.name}`}
                                icon={<span className="text-4xl">{buildingDef.icon}</span>}
                                onClose={() => setUpgradingBuildingId(null)}
                                headerRight={
                                    <div className="flex items-center gap-3">
                                        <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Nivå {currentLevel}</span>
                                        <span className="hidden md:inline text-[10px] text-slate-500 font-bold uppercase tracking-widest">{currentLevelDef?.bonus}</span>
                                    </div>
                                }
                            >
                                <div className="space-y-8 py-4 relative">
                                    <div className="bg-slate-900/80 rounded-[2rem] p-8 w-full border border-white/5 text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                                        <p className="text-indigo-300 text-sm font-bold mb-4 uppercase tracking-widest flex items-center justify-center gap-2">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                            Bonus ved neste nivå: {nextLevelDef?.bonus || 'Maksimal effekt'}
                                        </p>
                                        <p className="text-slate-400 text-sm leading-relaxed italic opacity-80">
                                            "{buildingDef.description}"
                                        </p>
                                    </div>

                                    {nextLevelDef ? (
                                        <div className="w-full space-y-8">
                                            <div className="text-left">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Byggeprogresjon (Nivå {nextLevel})</div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {Object.entries(nextLevelDef.requirements || {}).map(([res, targetAmt]: [any, any]) => {
                                                        const currentAmt = Math.floor((buildingState.progress as any)?.[res] || 0);
                                                        const progress = Math.min(100, (currentAmt / targetAmt) * 100);
                                                        const playerHas = Math.floor((player.resources as any)?.[res] || 0);
                                                        const needed = targetAmt - currentAmt;
                                                        const canGive = playerHas > 0 && needed > 0;
                                                        const giveAmount = Math.min(playerHas, needed);

                                                        return (
                                                            <div key={res} className="p-5 bg-slate-900/70 rounded-2xl border border-white/5 space-y-3">
                                                                <div className="flex justify-between items-end">
                                                                    <span className="text-xs font-black uppercase text-slate-300 tracking-widest">{res}</span>
                                                                    <span className="text-xs font-bold text-slate-500">{currentAmt} / {targetAmt}</span>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                                                        <div
                                                                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                                                                            style={{ width: `${progress}%` }}
                                                                        />
                                                                    </div>

                                                                    {needed > 0 ? (
                                                                        canGive ? (
                                                                            <button
                                                                                onClick={() => onAction({
                                                                                    type: 'CONTRIBUTE_TO_UPGRADE',
                                                                                    buildingId: upgradingBuildingId,
                                                                                    resource: res,
                                                                                    amount: giveAmount
                                                                                })}
                                                                                className="w-full py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20 uppercase tracking-widest"
                                                                            >
                                                                                Bidra {giveAmount} {res}
                                                                            </button>
                                                                        ) : (
                                                                            <div className="w-full py-2 bg-rose-900/10 border border-rose-500/10 text-rose-500/60 text-[9px] font-black rounded-xl text-center uppercase tracking-widest">
                                                                                Mangler {res}
                                                                            </div>
                                                                        )
                                                                    ) : (
                                                                        <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest text-center py-1">Krav møtt ✓</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Contributors List for Global Buildings */}
                                            {!isPrivate && (buildingState as any).contributions && Object.keys((buildingState as any).contributions).length > 0 && (
                                                <div className="w-full bg-indigo-500/5 rounded-3xl p-6 border border-indigo-500/10">
                                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                                        Siste bidrag fra riket
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {Object.entries((buildingState as any).contributions).slice(0, 4).map(([pId, data]: [string, any]) => (
                                                            <div key={pId} className="flex justify-between items-center bg-black/20 px-4 py-3 rounded-xl border border-white/5">
                                                                <span className="text-xs font-bold text-slate-200">{data.name}</span>
                                                                <div className="flex gap-2">
                                                                    {Object.entries(data.resources || {}).map(([r, a]: [any, any]) => (
                                                                        <span key={r} className="text-[10px] font-black text-emerald-400">+{a}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Final Upgrade Button */}
                                            {(() => {
                                                const isReady = Object.entries(nextLevelDef.requirements).every(([res, amt]) => ((buildingState.progress as any)?.[res] || 0) >= (amt as number));
                                                if (!isReady) return null;
                                                return (
                                                    <button
                                                        onClick={() => {
                                                            onAction({ type: 'CONTRIBUTE_TO_UPGRADE', buildingId: upgradingBuildingId, resource: 'dummy', amount: 0 }); // Trigger check
                                                            setUpgradingBuildingId(null);
                                                        }}
                                                        className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-[1.5rem] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 animate-bounce mt-4 shadow-emerald-600/20"
                                                    >
                                                        Fullfør Oppgradering 🏗️
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="py-12 px-10 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] text-center w-full">
                                            <div className="text-emerald-400 font-black uppercase tracking-widest text-lg mb-2">Mesterverk fullført! 🏆</div>
                                            <div className="text-slate-400 text-sm font-medium">Denne bygningen har nådd sitt maksimale potensial.</div>
                                        </div>
                                    )}
                                </div>
                            </SimulationMapWindow>
                        );
                    })()
                }

            </div >

        </>
    );
});

WorldMap.displayName = 'WorldMap';
