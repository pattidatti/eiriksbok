import React, { useState } from 'react';
import type { SimulationPlayer, SimulationRoom } from './types';

interface POI {
    id: string;
    label: string;
    icon: string;
    top: string;
    left: string;
    roles: string[];
    actions: { id: string, label: string, cost?: string }[];
    parentId?: string; // Links to a hub POI
    isHub?: boolean;   // If true, clicking this enters the local view
}

const POINTS_OF_INTEREST: POI[] = [
    // --- GLOBAL HUBS ---
    {
        id: 'fields', label: 'Åkrene', icon: '🌾', top: '22%', left: '28%', roles: ['PEASANT'],
        actions: [], isHub: true
    },
    {
        id: 'forest', label: 'Skogen', icon: '🌲', top: '18%', left: '80%', roles: ['PEASANT'],
        actions: [{ id: 'CHOP', label: 'Hugge Ved', cost: '-15⚡ -1🍞' }]
    },
    {
        id: 'castle', label: 'Slottet', icon: '🏰', top: '55%', left: '80%', roles: ['BARON', 'KING', 'SOLDIER'],
        actions: [], isHub: true
    },
    {
        id: 'market', label: 'Markedet', icon: '⚖️', top: '70%', left: '30%', roles: ['PEASANT', 'BARON', 'KING', 'MERCHANT'],
        actions: [{ id: 'MARKET_VIEW', label: 'Åpne Handel', cost: 'Gratis' }]
    },
    {
        id: 'village', label: 'Landsbyen', icon: '🏠', top: '42%', left: '42%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'],
        actions: [], isHub: true
    },
    {
        id: 'mine', label: 'Gruve-distriktet', icon: '⛏️', top: '8%', left: '60%', roles: ['PEASANT'],
        actions: [], isHub: true
    },
    {
        id: 'monastery', label: 'Klosteret', icon: '⛪', top: '10%', left: '45%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'],
        actions: [{ id: 'PRAY', label: 'Be en Bønn', cost: '-15⚡' }]
    },
    {
        id: 'monument', label: 'Rikets Monument', icon: '🏗️', top: '50%', left: '50%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'],
        actions: [{ id: 'CONTRIBUTE', label: 'Bidra til Bygget', cost: '-30🌾 -20🪵 -50g' }]
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

    // --- VILLAGE LOCAL ---
    {
        id: 'village_square', label: 'Landsbytorg', icon: '🗺️', top: '50%', left: '50%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'village',
        actions: [
            { id: 'REST', label: 'Hvile & Spise', cost: '-1🍞 +30⚡' },
            { id: 'REPAIR', label: 'Reparer Utstyr', cost: '-5g -1⛓️ -1🪵' },
            { id: 'FEAST', label: 'Arranger Gjestebud', cost: '-100g -30🍞' }
        ]
    },
    {
        id: 'blacksmith', label: 'Smien', icon: '⚒️', top: '30%', left: '30%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER'], parentId: 'village',
        actions: [
            { id: 'CRAFT_SWORDS', label: 'Smie Sverd', cost: '-30⚡ -5⛓️ -10🪵' },
            { id: 'CRAFT_ARMOR', label: 'Smie Rustninger', cost: '-40⚡ -10⛓️ -5🪵' },
            { id: 'CRAFT_TOOLS', label: 'Lage Verktøy', cost: '-25⚡ -2⛓️ -5🪵' }
        ]
    },
    {
        id: 'sawmill', label: 'Sagbruk', icon: '🪚', top: '25%', left: '70%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'village',
        actions: [{ id: 'REFINE', label: 'Produser Tømmer', cost: 'Tømmer' }]
    },
    {
        id: 'smeltery', label: 'Smeltehytte', icon: '🔥', top: '15%', left: '55%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'village',
        actions: [{ id: 'REFINE_IRON', label: 'Smelte Jern', cost: 'Jernbarrer' }]
    },
    {
        id: 'bakery', label: 'Bakeri', icon: '🥐', top: '65%', left: '45%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'village',
        actions: [{ id: 'REFINE_BREAD', label: 'Bake Brød', cost: 'Brød' }]
    },

    // --- FIELDS LOCAL ---
    {
        id: 'grain_fields', label: 'Kornåker', icon: '🌾', top: '50%', left: '30%', roles: ['PEASANT'], parentId: 'fields',
        actions: [{ id: 'WORK', label: 'Høste Korn', cost: '-10⚡ -1🍞' }]
    },
    {
        id: 'windmill', label: 'Vindmølle', icon: '⚙️', top: '40%', left: '65%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER', 'MERCHANT'], parentId: 'fields',
        actions: [{ id: 'REFINE_FLOUR', label: 'Male Mel', cost: 'Mel' }]
    },

    // --- INDUSTRY LOCAL ---
    {
        id: 'mine_shaft', label: 'Jern-gruva', icon: '⛏️', top: '40%', left: '40%', roles: ['PEASANT'], parentId: 'mine',
        actions: [{ id: 'MINE', label: 'Bryte Malm', cost: '-25⚡ -1🍞' }]
    },
    {
        id: 'quarry_poi', label: 'Steinhuggeriet', icon: '🪨', top: '60%', left: '60%', roles: ['PEASANT'], parentId: 'mine',
        actions: [{ id: 'QUARRY', label: 'Hugge Stein', cost: '-20⚡ -1🍞' }]
    }
];


interface WorldMapProps {
    player: SimulationPlayer;
    room: SimulationRoom;
    onAction: (action: any) => void;
    onOpenMarket: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ player, room, onAction, onOpenMarket }) => {
    const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [viewMode, setViewMode] = useState<string>('global');

    const handlePOIAction = (_poiId: string, actionId: string) => {
        if (actionId === 'MARKET_VIEW') {
            onOpenMarket();
        } else if (actionId === 'REFINE') {
            onAction({ type: 'REFINE', recipeId: 'timber' });
        } else if (actionId === 'REFINE_FLOUR') {
            onAction({ type: 'REFINE', recipeId: 'flour' });
        } else if (actionId === 'REFINE_IRON') {
            onAction({ type: 'REFINE', recipeId: 'iron_ingot' });
        } else if (actionId === 'REFINE_BREAD') {
            onAction({ type: 'REFINE', recipeId: 'bread' });
        } else if (actionId.startsWith('CRAFT_')) {
            const subType = actionId.replace('CRAFT_', '');
            onAction({ type: 'CRAFT', subType });
        } else {
            onAction(actionId);
        }
        setSelectedPOI(null);
    };

    const weather = room.world?.weather || 'Clear';

    // Get current map background
    const getBackground = () => {
        switch (viewMode) {
            case 'village': return '/map_village_street.png';
            case 'castle': return '/map_castle_interior.png';
            case 'fields': return '/map_farm_fields.png';
            case 'mine': return '/map_mountain_pass.png';
            default: return '/simulation_map_v2.png';
        }
    };

    return (
        <div className={`relative h-full max-h-full max-w-full aspect-square rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-white/5 bg-slate-900 transition-all duration-1000 ${weather === 'Rain' ? 'brightness-90 contrast-110' : weather === 'Storm' ? 'brightness-75 contrast-125' : weather === 'Fog' ? 'sepia-[0.3] contrast-75' : ''}`}>
            {/* The Map Background */}
            <img
                src={getBackground()}
                alt="Map View"
                className={`w-full h-full object-cover transition-all duration-1000 ${weather === 'Fog' ? 'blur-sm' : ''} ${viewMode !== 'global' ? 'grayscale-[0.2]' : 'opacity-80'}`}
                onError={(e) => {
                    e.currentTarget.src = '/simulation_map_v2.png';
                    e.currentTarget.className += ' opacity-30';
                }}
            />

            {/* Back Button */}
            {viewMode !== 'global' && (
                <button
                    onClick={() => setViewMode('global')}
                    className="absolute top-6 left-6 z-50 bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl border border-white/10 flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                >
                    ⬅ Tilbake til Riket
                </button>
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

            {/* Event Markers (Dynamic) */}
            {room.worldEvents && Object.values(room.worldEvents).map((event: any) => {
                const poi = POINTS_OF_INTEREST.find(p => p.id === event.locationId);
                if (!poi) return null;
                const isCorrectView = viewMode === 'global' ? !poi.parentId : poi.parentId === viewMode;
                if (!isCorrectView) return null;

                return (
                    <div
                        key={event.id}
                        style={{ top: poi.top, left: poi.left }}
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


            {/* Overlay Grid / Pins */}
            {POINTS_OF_INTEREST.map(poi => {
                const isCorrectView = viewMode === 'global' ? !poi.parentId : poi.parentId === viewMode;
                if (!isCorrectView) return null;

                const isRelevant = poi.roles.includes(player.role) || poi.id === 'market' || poi.isHub;
                const settlementBuildings = ['sawmill', 'windmill', 'smeltery', 'bakery'];
                if (settlementBuildings.includes(poi.id)) {
                    const b = room.world.settlement?.buildings?.[poi.id];
                    if (!b || b.level < 1) return null;
                }

                return (
                    <div
                        key={poi.id}
                        style={{ top: poi.top, left: poi.left }}
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
                                {poi.id === 'monument_poi' && (room.world.monumentProgress || 0) >= 1000 ? '🏛️' : poi.icon}
                            </div>
                            <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-2 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-indigo-600/30">
                                {poi.label}
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

            {/* Action Popup */}
            {selectedPOI && (
                <div className="absolute inset-x-6 bottom-6 z-30 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden border border-white/10">

                        {/* POI Illustration Header */}
                        <div className="h-40 w-full bg-slate-800 relative overflow-hidden">
                            <img
                                src={
                                    selectedPOI.id === 'monument'
                                        ? ((room.world.monumentProgress || 0) >= 1000 ? '/poi/monument_finished.png' : '/poi/monument.png')
                                        : `/poi/${selectedPOI.id}.png`
                                }
                                alt={selectedPOI.label}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent pointer-events-none" />
                            <div className="absolute bottom-6 left-8 text-white">
                                <span className="text-xs font-black uppercase text-indigo-400 tracking-[0.2em] mb-1 block">Lokasjon</span>
                                <h3 className="font-black flex items-center gap-3 text-4xl tracking-tighter">
                                    {selectedPOI.label}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedPOI(null)}
                                className="absolute top-6 right-6 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="space-y-3">
                                {selectedPOI.actions
                                    .filter(a => {
                                        if (a.id === 'TAX_PEASANTS' && player.role !== 'BARON') return false;
                                        if (a.id === 'TAX_ROYAL' && player.role !== 'KING') return false;
                                        if (a.id === 'DECREE' && player.role !== 'KING') return false;
                                        if (a.id === 'RAID' && player.role !== 'BARON') return false;
                                        if (a.id === 'REST' && selectedPOI.id === 'village_square' && (player.role === 'KING' || player.role === 'BARON')) return false;
                                        if (a.id === 'FEAST' && player.role !== 'KING' && player.role !== 'BARON') return false;
                                        if (selectedPOI.id === 'grain_fields' && player.role !== 'PEASANT') return false;
                                        if (selectedPOI.id === 'forest' && player.role !== 'PEASANT') return false;
                                        if (selectedPOI.id === 'mine_shaft' && player.role !== 'PEASANT') return false;
                                        if (selectedPOI.id === 'quarry' && player.role !== 'PEASANT') return false;
                                        return true;
                                    })
                                    .map(action => (
                                        <button
                                            key={action.id}
                                            onClick={() => handlePOIAction(selectedPOI.id, action.id)}
                                            className="group flex justify-between items-center w-full bg-white/5 hover:bg-indigo-600 p-6 rounded-2xl border border-white/5 transition-all outline-none"
                                        >
                                            <span className="font-black text-white text-lg group-hover:translate-x-1 transition-transform">{action.label}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover:text-white bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20 transition-colors uppercase">{action.cost}</span>
                                        </button>
                                    ))
                                }
                                {selectedPOI.actions.length === 0 && (
                                    <div className="text-center py-8 bg-black/20 rounded-2xl border border-white/5">
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest italic leading-relaxed">
                                            Handlingsrommet er begrenset.<br />Dine plikter ligger et annet sted.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
