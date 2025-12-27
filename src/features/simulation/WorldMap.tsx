import React, { useState } from 'react';
import type { SimulationPlayer, SimulationRoom } from './simulationTypes';
import { VILLAGE_BUILDINGS } from './constants';
import { TAVERN_NPCS } from './TavernData';
import type { TavernNPC } from './TavernData';
import { TavernDiceGame } from './TavernDiceGame';
import { MINIGAME_VARIANTS } from './SimulationMinigames';
import { checkActionRequirements, getActionCostString, getActionEquipment } from './utils/actionUtils';

interface POI {
    id: string;
    label: string;
    icon: string;
    top: string;
    left: string;
    // Overrides for Ost/Coastal map style
    ost?: { top: string, left: string };
    roles: string[];
    actions: { id: string, label: string, cost?: string }[];
    parentId?: string; // Links to a hub POI
    isHub?: boolean;   // If true, clicking this enters the local view
}

const POINTS_OF_INTEREST: POI[] = [
    // --- GLOBAL HUBS ---
    {
        id: 'fields', label: 'Åkrene', icon: '🌾', top: '22%', left: '28%',
        ost: { top: '25%', left: '32%' },
        roles: ['PEASANT', 'BARON', 'KING'],
        actions: [], isHub: true
    },
    {
        id: 'forest', label: 'Skogen', icon: '🌲', top: '25%', left: '80%',
        ost: { top: '20%', left: '65%' },
        roles: ['PEASANT', 'BARON', 'KING'],
        actions: [], isHub: true
    },
    {
        id: 'castle', label: 'Slottet', icon: '🏰', top: '66%', left: '86%',
        ost: { top: '35%', left: '85%' },
        roles: ['BARON', 'KING', 'SOLDIER'],
        actions: [], isHub: true
    },
    {
        id: 'peasant_farm', label: 'Husmannsplassen', icon: '🛖', top: '30%', left: '60%',
        ost: { top: '62%', left: '35%' },
        roles: ['PEASANT', 'BARON', 'KING'],
        actions: [], isHub: true
    },
    {
        id: 'market', label: 'Markedet', icon: '⚖️', top: '70%', left: '25%',
        ost: { top: '77%', left: '45%' },
        roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'],
        actions: [{ id: 'MARKET_VIEW', label: 'Åpne Handel', cost: 'Gratis' }]
    },
    {
        id: 'village', label: 'Landsbyen', icon: '🏠', top: '42%', left: '42%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'],
        actions: [], isHub: true
    },
    {
        id: 'mine', label: 'Gruve-distriktet', icon: '⛏️', top: '12%', left: '25%',
        ost: { top: '12%', left: '30%' },
        roles: ['PEASANT', 'BARON', 'KING'],
        actions: [], isHub: true
    },
    {
        id: 'monastery', label: 'Klosteret', icon: '⛪', top: '16%', left: '55%',
        ost: { top: '60%', left: '90%' },
        roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'],
        actions: [], isHub: true
    },
    {
        id: 'border', label: 'Grensen', icon: '⚔️', top: '85%', left: '80%', roles: ['BARON'],
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

    // --- VILLAGE LOCAL HUB ---
    {
        id: 'village_square', label: 'Landsbytorg', icon: '⛲', top: '50%', left: '50%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'village',
        actions: [
            { id: 'REST', label: 'Hvile på torget', cost: '+10⚡' },
            { id: 'CONSTRUCT_BUILDING', label: 'Oppgrader Torget', cost: 'Se Bygg' }
        ]
    },
    {
        id: 'tavern', label: 'Vertshuset', icon: '🍺', top: '35%', left: '75%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER'], parentId: 'village',
        actions: [{ id: 'ENTER_TAVERN', label: 'Gå inn', cost: 'Gratis' }], isHub: true
    },
    {
        id: 'bakery', label: 'Bakeri', icon: '🍞', top: '55%', left: '75%', roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [
            { id: 'REFINE_BREAD', label: 'Bake Brød', cost: '-10⚡ -2mel' },
            { id: 'CONSTRUCT_BUILDING', label: 'Bygg Bakeri', cost: 'Se Bygg' }
        ],
        isHub: true
    },
    {
        id: 'blacksmith', label: 'Storsmie', icon: '⚒️', top: '35%', left: '15%', roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [
            { id: 'CRAFT', label: 'Smi Utstyr', cost: 'Varierer' },
            { id: 'CONSTRUCT_BUILDING', label: 'Bygg Smie', cost: 'Se Bygg' }
        ],
        isHub: true
    },
    {
        id: 'sawmill', label: 'Sagbruk', icon: '🪚', top: '65%', left: '15%', roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [
            { id: 'REFINE', label: 'Sag Tømmer', cost: '-10⚡ -5ved' },
            { id: 'CONSTRUCT_BUILDING', label: 'Bygg Sagbruk', cost: 'Se Bygg' }
        ],
        isHub: true
    },
    {
        id: 'windmill', label: 'Vindmølle', icon: '🌬️', top: '20%', left: '35%', roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [
            { id: 'REFINE_FLOUR', label: 'Male Mel', cost: '-15⚡ -10korn' },
            { id: 'CONSTRUCT_BUILDING', label: 'Bygg Mølle', cost: 'Se Bygg' }
        ],
        isHub: true
    },
    {
        id: 'smeltery', label: 'Smeltehytte', icon: '🔥', top: '75%', left: '85%', roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [
            { id: 'REFINE_IRON', label: 'Smelte Jern', cost: '-20⚡ -5malm' },
            { id: 'CONSTRUCT_BUILDING', label: 'Bygg Hytte', cost: 'Se Bygg' }
        ],
        isHub: true
    },
    {
        id: 'weaving_mill', label: 'Veveri', icon: '🧶', top: '65%', left: '60%', roles: ['PEASANT', 'BARON', 'MERCHANT'], parentId: 'village',
        actions: [
            { id: 'REFINE_CLOTH', label: 'Vev Stoff', cost: '-15⚡ -5ull' },
            { id: 'CONSTRUCT_BUILDING', label: 'Bygg Veveri', cost: 'Se Bygg' }
        ],
        isHub: true
    },
    {
        id: 'watchtower', label: 'Vaktårn', icon: '🏰', top: '15%', left: '60%', roles: ['BARON', 'SOLDIER'], parentId: 'village',
        actions: [
            { id: 'PATROL', label: 'Patruljer', cost: '-30⚡' },
            { id: 'CONSTRUCT_BUILDING', label: 'Bygg Tårn', cost: 'Se Bygg' }
        ],
        isHub: true
    },
    {
        id: 'stables', label: 'Stall', icon: '🐴', top: '80%', left: '35%', roles: ['BARON', 'SOLDIER', 'KING'], parentId: 'village',
        actions: [
            { id: 'MOUNT_HORSE', label: 'Ri ut', cost: '-5⚡' },
            { id: 'CONSTRUCT_BUILDING', label: 'Bygg Stall', cost: 'Se Bygg' }
        ],
        isHub: true
    },
    {
        id: 'well', label: 'Bybrønn', icon: '💧', top: '50%', left: '50%', roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [
            { id: 'GATHER_WATER', label: 'Hent Vann', cost: '-10⚡' },
            { id: 'CONSTRUCT_BUILDING', label: 'Grav Brønn', cost: 'Se Bygg' }
        ],
        isHub: true
    },
    {
        id: 'apothecary', label: 'Apotek', icon: '🌿', top: '45%', left: '85%', roles: ['PEASANT', 'BARON'], parentId: 'village',
        actions: [
            { id: 'CRAFT_MEDICINE', label: 'Lag Medisin', cost: '-20⚡' },
            { id: 'CONSTRUCT_BUILDING', label: 'Bygg Apotek', cost: 'Se Bygg' }
        ],
        isHub: true
    },

    // --- TAVERN LOCAL ---
    {
        id: 'tavern_bar', label: 'Baren', icon: '🍗', top: '30%', left: '30%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'tavern',
        actions: [{ id: 'BUY_MEAL', label: 'Kjøp Måltid', cost: '-5g +10⚡' }]
    },
    {
        id: 'tavern_gambling', label: 'Spillebordet', icon: '🎲', top: '50%', left: '50%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'tavern',
        actions: [{ id: 'OPEN_DICE_GAME', label: 'Spill Terninger', cost: 'Min. 0.5g' }]
    },
    {
        id: 'tavern_gossip', label: 'Lokalbefolkningen', icon: '🗣️', top: '40%', left: '70%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'tavern',
        actions: [{ id: 'CHAT_LOCAL', label: 'Snakk med folk', cost: 'Gratis' }]
    },

    // --- FIELDS LOCAL ---
    {
        id: 'grain_fields', label: 'Kornåker', icon: '🌾', top: '50%', left: '30%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'fields',
        actions: [{ id: 'WORK', label: 'Høste Korn', cost: '-10⚡ -1🍞' }]
    },
    {
        id: 'windmill', label: 'Vindmølle', icon: '⚙️', top: '40%', left: '65%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'fields',
        actions: [{ id: 'REFINE_FLOUR', label: 'Male Mel', cost: 'Mel' }]
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
        id: 'forest_clearing', label: 'Hogstfeltet', icon: '🪓', top: '60%', left: '40%', roles: ['PEASANT', 'BARON', 'KING'], parentId: 'forest',
        actions: [{ id: 'CHOP', label: 'Hugge Ved', cost: '-15⚡ -1🍞' }]
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
        id: 'farm_upgrade_spot', label: 'Utvidelser', icon: '🏗️', top: '55%', left: '80%', roles: ['PEASANT'], parentId: 'peasant_farm',
        actions: [{ id: 'UPGRADE_FARM', label: 'Bygg ut gården', cost: 'Varierer' }]
    },

    // --- VILLAGE CONSTRUCTION LOCAL ---
    {
        id: 'construction_site', label: 'Byggeplass', icon: '🏗️', top: '50%', left: '50%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'village_construction',
        actions: [{ id: 'CONSTRUCT', label: 'Bidra til prosjektet', cost: '-20⚡' }]
    }
];


interface WorldMapProps {
    player: SimulationPlayer;
    room: SimulationRoom;
    onAction: (action: any) => void;
    onOpenMarket: () => void;
    initialViewMode?: string;
}

export const WorldMap: React.FC<WorldMapProps> = ({ player, room, onAction, onOpenMarket, initialViewMode = 'global' }) => {
    const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [viewMode, setViewMode] = useState<string>(initialViewMode);
    const [viewingRegionId, setViewingRegionId] = useState<string>(player.regionId || 'capital');
    const [dialogNPC, setDialogNPC] = useState<TavernNPC | null>(null);
    const [dialogStep, setDialogStep] = useState<string>('start');
    const [isDiceGameOpen, setIsDiceGameOpen] = useState(false);

    // Reset viewing region to player's region when opening action (optional, but keeps context safe)
    // Actually, we want persistence during browsing.

    const handlePOIAction = (_poiId: string, actionId: string) => {
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
        } else if (actionId === 'REFINE' || actionId === 'REFINE_FLOUR' || actionId === 'REFINE_IRON' || actionId === 'REFINE_BREAD') {
            const recipeMap: any = {
                'REFINE': 'timber',
                'REFINE_FLOUR': 'flour',
                'REFINE_IRON': 'iron_ingot',
                'REFINE_BREAD': 'bread'
            };
            onAction({ type: 'REFINE', recipeId: recipeMap[actionId] });
        } else if (actionId.startsWith('CRAFT_')) {
            const itemType = actionId.replace('CRAFT_', '').toLowerCase();
            onAction({ type: 'CRAFT', itemType });
        } else if (actionId === 'FARM_UPGRADE') {
            // Check if player has farm upgrades
            onAction({ type: 'UPGRADE', upgradeId: 'peasant_farm_level' });
        } else if (actionId === 'OPEN_DICE_GAME') {
            setIsDiceGameOpen(true);
        } else if (actionId === 'CHAT_LOCAL') {
            const randomNPC = TAVERN_NPCS[Math.floor(Math.random() * TAVERN_NPCS.length)];
            setDialogNPC(randomNPC);
            setDialogStep('start');
        } else {
            onAction(actionId);
        }
        setSelectedPOI(null);
    };

    const weather = room.world?.weather || 'Clear';

    // Get current map background
    const getBackground = () => {
        if (viewMode === 'kingdom') return '/map_kingdom.png';

        switch (viewMode) {
            case 'village': return '/map_village_hub.png';
            case 'village_construction': return '/map_village_construction.png';
            case 'castle': return '/map_castle_interior.png';
            case 'fields': return '/map_farm_fields.png';
            case 'peasant_farm': return '/map_peasant_farm.png';
            case 'farm_house': return '/map_stugo_interior.jpg';
            case 'mine': return '/map_mountain_pass.png';
            case 'forest': return '/map_forest.png';
            case 'monastery': return '/map_monastery.png';
            case 'tavern': return '/map_tavern_interior.png';
            case 'global':
                // Check region ID for viewingRegionId
                if (viewingRegionId === 'region_ost') {
                    return '/map_barony_2.png';
                }
                return '/simulation_map_v2.png'; // Default Green Valley (Vest)
            default: return '/simulation_map_v2.png';
        }
    };

    // Find specific barons for map layout
    const playersArr = Object.values(room.players || {});
    const baronVest = playersArr.find(p => p.role === 'BARON' && p.regionId === 'region_vest');
    const baronOst = playersArr.find(p => p.role === 'BARON' && p.regionId === 'region_ost');

    return (
        <>
            <div className={`relative h-full max-h-full max-w-full aspect-square rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-white/5 bg-slate-900 transition-all duration-1000 ${weather === 'Rain' ? 'brightness-90 contrast-110' : weather === 'Storm' ? 'brightness-75 contrast-125' : weather === 'Fog' ? 'sepia-[0.3] contrast-75' : ''}`}>

                {/* The Map Background */}
                <img
                    src={getBackground()}
                    alt="Map View"
                    className={`w-full h-full object-cover transition-all duration-1000 ${weather === 'Fog' ? 'blur-sm' : ''} ${viewMode !== 'global' && viewMode !== 'kingdom' ? 'grayscale-[0.2]' : 'opacity-80'}`}
                    onError={(e) => {
                        e.currentTarget.src = '/simulation_map_v2.png';
                        e.currentTarget.className += ' opacity-30';
                    }}
                />

                {/* Navigation Buttons */}
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


                {/* KINGDOM MAP PINS */}
                {viewMode === 'kingdom' && (
                    <>
                        {/* CAPITAL PIN (Center) */}
                        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-30 group">
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
                        </div>

                        {/* BARONY VEST PIN (West/Left map region) */}
                        {baronVest && (
                            <div className="absolute top-[60%] left-[25%] -translate-x-1/2 -translate-y-1/2 z-30 group">
                                <button
                                    onClick={() => {
                                        setViewingRegionId(baronVest.regionId);
                                        setViewMode('global');
                                    }}
                                    className="flex flex-col items-center hover:scale-110 transition-transform"
                                >
                                    <div className="text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🏯</div>
                                    <div className="bg-black/80 text-indigo-300 px-3 py-1 rounded-xl mt-2 font-bold text-[10px] uppercase tracking-wider border border-white/10 shadow-xl backdrop-blur-md whitespace-nowrap">
                                        {baronVest.name} (Vest)
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* BARONY OST PIN (East/Right map region) */}
                        {baronOst && (
                            <div className="absolute top-[40%] left-[75%] -translate-x-1/2 -translate-y-1/2 z-30 group">
                                <button
                                    onClick={() => {
                                        setViewingRegionId(baronOst.regionId);
                                        setViewMode('global');
                                    }}
                                    className="flex flex-col items-center hover:scale-110 transition-transform"
                                >
                                    <div className="text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🏘️</div>
                                    <div className="bg-black/80 text-emerald-300 px-3 py-1 rounded-xl mt-2 font-bold text-[10px] uppercase tracking-wider border border-white/10 shadow-xl backdrop-blur-md whitespace-nowrap">
                                        {baronOst.name} (Øst)
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* More Barons? Stack them or place randomly if needed. For now 2 is requirement. */}
                    </>
                )}


                {/* Weather Overlay Effects */}
                {weather === 'Rain' && (
                    <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
                        <div className="w-full h-full animate-pulse bg-blue-500/10" />
                    </div>
                )}
                {weather === 'Storm' && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="w-full h-full animate-[pulse_0.1s_infinite] bg-white/5" />
                    </div>
                )}

                {/* Event Markers (Dynamic) - ONLY IN GLOBAL/LOCAL VIEW, NOT KINGDOM */}
                {viewMode !== 'kingdom' && room.worldEvents && Object.values(room.worldEvents).map((event: any) => {
                    const poi = POINTS_OF_INTEREST.find(p => p.id === event.locationId);
                    if (!poi) return null;
                    const isCorrectView = viewMode === 'global' ? !poi.parentId : poi.parentId === viewMode;
                    if (!isCorrectView) return null;

                    const isOst = viewingRegionId === 'region_ost';

                    const top = isOst && poi.ost ? poi.ost.top : poi.top;
                    const left = isOst && poi.ost ? poi.ost.left : poi.left;

                    return (
                        <div
                            key={event.id}
                            style={{ top, left }}
                            className="absolute -translate-x-1/2 -translate-y-[150%] z-30"
                        >
                            <button
                                onClick={() => setSelectedEvent(event)}
                                className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(255,255,255,0.4)] border-4 animate-bounce hover:scale-110 transition-transform ${event.type === 'RAID' ? 'bg-rose-600 border-rose-900 text-white' : 'bg-amber-400 border-amber-700 text-slate-800'}`}
                            >
                                {event.type === 'RAID' ? '☠️' : '⭐'}
                            </button>
                        </div>
                    );
                })}


                {/* Overlay Grid / Pins - ONLY IN GLOBAL/LOCAL VIEW */}
                {viewMode !== 'kingdom' && POINTS_OF_INTEREST.map(poi => {
                    const isCorrectView = viewMode === 'global' ? !poi.parentId : poi.parentId === viewMode;
                    if (!isCorrectView) return null;

                    const isRelevant = poi.roles.includes(player.role) || poi.id === 'market' || poi.isHub;
                    // Removed hiding logic to allow construction UI

                    const isResourceNode = ['grain_fields', 'forest_clearing', 'mine_shaft', 'quarry_poi', 'forest_forage'].includes(poi.id);

                    const isOst = viewingRegionId === 'region_ost';

                    const top = isOst && poi.ost ? poi.ost.top : poi.top;
                    const left = isOst && poi.ost ? poi.ost.left : poi.left;

                    return (
                        <div
                            key={poi.id}
                            style={{ top, left }}
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
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-4xl shadow-2xl border-2 transition-all group-hover:rotate-12 ${selectedPOI?.id === poi.id ? 'bg-indigo-600 border-indigo-400 ring-4 ring-indigo-500/30' : 'bg-slate-900/90 backdrop-blur-xl border-white/10 hover:border-indigo-500 hover:bg-slate-800'}`}>
                                    {poi.icon}
                                </div>
                                <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-2 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-indigo-600/30">
                                    {isResourceNode ? 'KLIKK FOR Å STARTE' : poi.label}
                                </span>
                            </button>
                        </div>
                    );
                })}

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
                    <>
                        <div className="absolute inset-0 z-[90]" onClick={() => setSelectedPOI(null)} />
                        <div
                            style={{
                                top: (viewingRegionId === 'region_ost' && selectedPOI.ost ? selectedPOI.ost.top : selectedPOI.top),
                                left: (viewingRegionId === 'region_ost' && selectedPOI.ost ? selectedPOI.ost.left : selectedPOI.left),
                                transform: `translate(${parseFloat(selectedPOI.left) > 80 ? '-95%' : parseFloat(selectedPOI.left) < 20 ? '-5%' : '-50%'}, ${parseFloat(selectedPOI.top) < 25 ? '3rem' : 'calc(-100% - 1rem)'})`
                            }}
                            className="absolute z-[100] animate-in fade-in zoom-in duration-200 pointer-events-auto"
                        >
                            <div className="bg-slate-900/98 backdrop-blur-3xl border border-white/20 rounded-[1.8rem] p-4 shadow-[0_25px_60px_rgba(0,0,0,0.6)] min-w-[260px] w-max max-w-[320px] relative">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl drop-shadow-md">{selectedPOI.icon}</span>
                                        <h3 className="font-black text-white text-sm uppercase tracking-[0.15em] leading-tight opacity-90">{selectedPOI.label}</h3>
                                    </div>
                                    <button onClick={() => setSelectedPOI(null)} className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full w-7 h-7 flex items-center justify-center">✕</button>
                                </div>

                                {/* Actions */}
                                <div className="space-y-2.5">
                                    {selectedPOI.actions
                                        .filter(a => {
                                            if (a.id === 'TAX_PEASANTS' && player.role !== 'BARON') return false;
                                            if (a.id === 'TAX_ROYAL' && player.role !== 'KING') return false;
                                            if (a.id === 'DECREE' && player.role !== 'KING') return false;
                                            if (a.id === 'RAID' && player.role !== 'BARON') return false;
                                            if (a.id === 'REST' && selectedPOI.id === 'village_square' && (player.role === 'KING' || player.role === 'BARON')) return false;
                                            if (a.id === 'FEAST' && player.role !== 'KING' && player.role !== 'BARON') return false;
                                            return true;
                                        })
                                        .map(action => {
                                            // CHECK: Is this a building specific action?
                                            const buildingId = selectedPOI.id;
                                            const isBuildingAction = ['bakery', 'windmill', 'sawmill', 'smeltery', 'blacksmith', 'weaving_mill', 'watchtower', 'stables', 'well', 'apothecary'].includes(buildingId);
                                            const isBuilt = (room.world.settlement?.buildings?.[buildingId]?.level || 0) >= 1;

                                            // If it's a building action but the building isn't built, show ONLY construction option (unless it IS the construction action)
                                            if (isBuildingAction && !isBuilt && action.id !== 'CONSTRUCT_BUILDING') return null;
                                            if (isBuildingAction && isBuilt && action.id === 'CONSTRUCT_BUILDING') return null;

                                            // Use Centralized Validation
                                            const currentSeason = (room.world?.season || 'Spring') as any;
                                            const currentWeather = (room.world?.weather || 'Clear') as any;

                                            // Permission Check override (not handled deeply in util)
                                            let canAfford = true;
                                            let missingReason = '';

                                            if (viewingRegionId !== player.regionId && player.role !== 'KING' && action.id !== 'MARKET_VIEW') {
                                                canAfford = false;
                                                missingReason = "Ikke ditt baroni";
                                            } else {
                                                const check = checkActionRequirements(player, action.id, currentSeason, currentWeather);
                                                if (!check.success) {
                                                    canAfford = false;
                                                    missingReason = check.reason || 'Krav ikke møtt';
                                                }
                                            }

                                            const costLabel = getActionCostString(action.id, currentSeason, currentWeather) || action.cost;

                                            const equipment = getActionEquipment(player, action.id);
                                            const variants = MINIGAME_VARIANTS[action.id];

                                            return (
                                                <div key={action.id} className="w-full">
                                                    {/* Main Action Button (If no variants, or purely as header if variants exist?) 
                                                        Actually, if variants exist, we DO NOT want a single main button that starts nothing.
                                                        If variants exist, we show the header/cost/equipment as a block, then the buttons below.
                                                     */}

                                                    {!variants || variants.length === 0 ? (
                                                        <button
                                                            onClick={() => handlePOIAction(selectedPOI.id, action.id)}
                                                            disabled={!canAfford}
                                                            className={`group flex flex-col w-full px-4 py-3 rounded-xl border transition-all text-left gap-1.5 ${canAfford ? 'bg-white/5 hover:bg-indigo-600/90 border-white/5 shadow-sm active:scale-[0.98]' : 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed'}`}
                                                        >
                                                            <div className="flex justify-between items-center w-full">
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className={`text-base font-bold transition-transform truncate ${canAfford ? 'text-white' : 'text-slate-400'}`}>{action.label}</span>
                                                                    {!canAfford && <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-0.5 opacity-90">{missingReason}</span>}
                                                                </div>
                                                                {costLabel && (
                                                                    <span className={`text-xs font-black uppercase tracking-tight px-2 py-1 rounded-lg border flex-shrink-0 ${canAfford ? 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:text-white group-hover:bg-amber-500/30' : 'text-slate-600 border-white/5'}`}>
                                                                        {costLabel}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {/* Equipment Info */}
                                                            {equipment.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mt-1 pt-2 border-t border-white/5">
                                                                    {equipment.map((item) => (
                                                                        <div key={item.id} className="flex items-center gap-1.5 text-[10px] bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                                                                            <span>{item.icon}</span>
                                                                            <span className="text-slate-300 font-bold">{item.name}</span>
                                                                            {(item.stats?.yieldBonus || 0) > 0 && <span className="text-emerald-400 font-bold">+{item.stats?.yieldBonus} Utbytte</span>}
                                                                            {(item.stats?.speedBonus || 0) > 1 && <span className="text-blue-400 font-bold">+{Math.round(((item.stats?.speedBonus || 1) - 1) * 100)}% Fart</span>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        /* VARIANTS DISPLAY */
                                                        <div className={`flex flex-col w-full p-3 rounded-xl border gap-2 ${canAfford ? 'bg-slate-950/50 border-white/10' : 'bg-black/20 border-white/5 opacity-50'}`}>
                                                            {/* Header & Cost */}
                                                            <div className="flex justify-between items-center w-full border-b border-white/5 pb-2">
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className={`text-sm font-bold truncate ${canAfford ? 'text-white' : 'text-slate-500'}`}>{action.label}</span>
                                                                    {!canAfford && <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-0.5 opacity-90">{missingReason}</span>}
                                                                </div>
                                                                {costLabel && (
                                                                    <span className={`text-xs font-black uppercase tracking-tight px-2 py-1 rounded-lg border flex-shrink-0 ${canAfford ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-slate-600 border-white/5'}`}>
                                                                        {costLabel}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Equipment Info (Shared) */}
                                                            {equipment.length > 0 && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {equipment.map((item) => (
                                                                        <div key={item.id} className="flex items-center gap-1.5 text-[10px] bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                                                                            <span>{item.icon}</span>
                                                                            <span className="text-slate-300 font-bold">{item.name}</span>
                                                                            {(item.stats?.yieldBonus || 0) > 0 && <span className="text-emerald-400 font-bold">+{item.stats?.yieldBonus} Utbytte</span>}
                                                                            {(item.stats?.speedBonus || 0) > 1 && <span className="text-blue-400 font-bold">+{Math.round(((item.stats?.speedBonus || 1) - 1) * 100)}% Fart</span>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Variant Buttons */}
                                                            <div className="grid grid-cols-1 gap-1.5 mt-1">
                                                                {variants.map(variant => (
                                                                    <button
                                                                        key={variant.id}
                                                                        onClick={() => onAction({ type: action.id, method: variant.id })}
                                                                        disabled={!canAfford}
                                                                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left group ${canAfford ? 'bg-white/5 hover:bg-indigo-600 border-white/5 hover:border-indigo-400 active:scale-[0.98]' : 'bg-transparent border-transparent cursor-not-allowed'}`}
                                                                    >
                                                                        <span className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">{variant.icon}</span>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-sm text-white group-hover:text-white">{variant.label}</span>
                                                                            <span className="text-[10px] text-slate-400 group-hover:text-indigo-200 leading-none mt-0.5">{variant.desc}</span>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    }
                                    {selectedPOI.actions.length === 0 && (
                                        <div className="text-center py-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest italic opacity-50">
                                            Ingen handlinger her
                                        </div>
                                    )}
                                </div>
                            </div>


                            {/* Tooltip Tail */}
                            <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900/98 rotate-45 border-white/20 ${parseFloat(selectedPOI.top) < 25 ? '-top-2 border-l border-t' : '-bottom-2 border-r border-b'} shadow-2xl`} />
                        </div>
                    </>
                )
                }


                {/* CONSTRUCTION OVERLAY SITE */}
                {
                    (() => {
                        const buildingDef = VILLAGE_BUILDINGS[viewMode];
                        const currentLevel = (room.world.settlement?.buildings?.[viewMode]?.level || 0);

                        if (buildingDef && currentLevel < 1) {
                            return (
                                <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500">
                                    <div className="bg-slate-900 border-2 border-dashed border-white/20 rounded-[3rem] p-12 max-w-2xl w-full text-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-[url('/patterns/grid.png')] opacity-10" />

                                        <div className="relative z-10 w-full flex flex-col items-center">
                                            <div className="w-24 h-24 bg-indigo-500/20 text-indigo-300 rounded-full flex items-center justify-center text-5xl mb-6 border-2 border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.3)] animate-pulse">
                                                🏗️
                                            </div>
                                            <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">{buildingDef.name}</h2>
                                            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-8">Under Planlegging</div>

                                            <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-md italic">
                                                "{buildingDef.description}"
                                            </p>

                                            <div className="grid grid-cols-2 gap-4 mb-10 w-full">
                                                {Object.entries(buildingDef.requirements || {}).map(([res, amt]) => {
                                                    const hasEnough = (player.resources[res as keyof typeof player.resources] || 0) >= (amt as number);
                                                    return (
                                                        <div key={res} className={`flex items-center justify-between p-4 rounded-xl border ${hasEnough ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                                                            <span className="capitalize text-sm font-bold text-slate-300">{res}</span>
                                                            <span className={`text-xl font-black ${hasEnough ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                {amt as number}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                onClick={() => {
                                                    handlePOIAction(viewMode, 'CONSTRUCT_BUILDING');
                                                }}
                                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 text-lg"
                                            >
                                                Start Bygging
                                            </button>

                                            <button onClick={() => setViewMode('village')} className="mt-6 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest">
                                                Avbryt
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()
                }

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
                            playerGold={player.resources.gold || 0}
                            onClose={() => setIsDiceGameOpen(false)}
                            onPlay={(result) => {
                                onAction({ type: 'GAMBLE_RESULT', ...result });
                            }}
                        />
                    )
                }

            </div >
        </>
    );
};
