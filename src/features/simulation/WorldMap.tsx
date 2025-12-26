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
}

const POINTS_OF_INTEREST: POI[] = [
    {
        id: 'fields', label: 'Åkrene', icon: '🌾', top: '22%', left: '28%', roles: ['PEASANT'],
        actions: [
            { id: 'WORK', label: 'Høste Korn', cost: '-10⚡ -1🥖' },
            { id: 'MILL', label: 'Male Korn', cost: '-20⚡ -10🌾' }
        ]
    },
    {
        id: 'forest', label: 'Skogen', icon: '🌲', top: '18%', left: '80%', roles: ['PEASANT'],
        actions: [{ id: 'CHOP', label: 'Hugge Ved', cost: '-15⚡ -1🥖' }]
    },
    {
        id: 'castle', label: 'Slottet', icon: '🏰', top: '55%', left: '80%', roles: ['BARON', 'KING'],
        actions: [
            { id: 'TAX_PEASANTS', label: 'Regjonal Skatt', cost: 'Baron Only' },
            { id: 'TAX_ROYAL', label: 'Kongelig Skatt', cost: 'King Only' },
            { id: 'DRAFT', label: 'Verve Soldater', cost: '-5g -10🥖' },
            { id: 'DECREE', label: 'Utsted Dekret', cost: 'King Only' }
        ]
    },
    {
        id: 'market', label: 'Markedet', icon: '⚖️', top: '70%', left: '30%', roles: ['PEASANT', 'BARON', 'KING'],
        actions: [
            { id: 'MARKET_VIEW', label: 'Åpne Handel', cost: 'Gratis' }
        ]
    },
    {
        id: 'village', label: 'Landsbyen', icon: '🏠', top: '42%', left: '42%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER'],
        actions: [
            { id: 'REST', label: 'Hvile & Spise', cost: '-1🥖 +30⚡' },
            { id: 'REPAIR', label: 'Reparer Utstyr', cost: '-5g -2⛏️ -2🪵' },
            { id: 'FEAST', label: 'Arranger Gjestebud', cost: '-100g -30🥖' }
        ]
    },
    {
        id: 'blacksmith', label: 'Smien', icon: '⚒️', top: '45%', left: '32%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER'],
        actions: [
            { id: 'CRAFT_SWORDS', label: 'Smie Sverd', cost: '-30⚡ -10⛏️ -5🪵' },
            { id: 'CRAFT_ARMOR', label: 'Smie Rustninger', cost: '-40⚡ -15⛏️ -2🪵' },
            { id: 'CRAFT_TOOLS', label: 'Lage Verktøy', cost: '-25⚡ -5⛏️ -10🪵' }
        ]
    },
    {
        id: 'mine', label: 'Jern-gruva', icon: '⛏️', top: '8%', left: '60%', roles: ['PEASANT'],
        actions: [
            { id: 'MINE', label: 'Bryte Malm', cost: '-25⚡ -1🥖' }
        ]
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

    const handlePOIAction = (_poiId: string, actionId: string) => {
        if (actionId === 'MARKET_VIEW') {
            onOpenMarket();
        } else if (actionId.startsWith('CRAFT_')) {
            const subType = actionId.replace('CRAFT_', '');
            onAction({ type: 'CRAFT', subType });
        } else {
            onAction(actionId);
        }
        setSelectedPOI(null);
    };

    const weather = room.world?.weather || 'Clear';

    return (
        <div className={`relative w-full max-w-2xl mx-auto aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-900/20 bg-amber-50 transition-all duration-1000 ${weather === 'Rain' ? 'brightness-90 contrast-110' : weather === 'Storm' ? 'brightness-75 contrast-125' : weather === 'Fog' ? 'sepia-[0.3] contrast-75' : ''}`}>
            {/* The Map Background */}
            <img
                src="/simulation_map_v2.png"
                alt="Kingdom Map"
                className={`w-full h-full object-cover opacity-90 transition-all duration-1000 ${weather === 'Fog' ? 'blur-sm' : ''}`}
            />


            {/* Weather Overlay Effects */}
            {weather === 'Rain' && (
                <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
                    <div className="w-full h-full animate-pulse bg-blue-500/10" />
                </div>
            )}
            {weather === 'Storm' && (
                <div className="absolute inset-0 pointer-events-none z-10 transition-colors duration-100">
                    <div className="w-full h-full animate-[pulse_0.1s_infinite] bg-white/5 opacity-0 group-hover:opacity-100" />
                </div>
            )}

            {/* Event Markers (Dynamic) */}
            {room.worldEvents && Object.values(room.worldEvents).map((event: any) => {
                const poi = POINTS_OF_INTEREST.find(p => p.id === event.locationId);
                if (!poi) return null;

                return (
                    <div
                        key={event.id}
                        style={{ top: poi.top, left: poi.left }}
                        className="absolute -translate-x-1/2 -translate-y-[150%] z-30"
                    >
                        <button
                            onClick={() => setSelectedEvent(event)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(255,255,255,0.8)] border-4 animate-bounce ${event.type === 'RAID' ? 'bg-red-600 border-red-900 text-white' : 'bg-yellow-400 border-yellow-700 text-slate-800'}`}
                        >
                            {event.type === 'RAID' ? '☠️' : '⭐'}
                        </button>
                    </div>
                );
            })}


            {/* Overlay Grid / Pins */}
            {POINTS_OF_INTEREST.map(poi => {
                const isRelevant = poi.roles.includes(player.role) || poi.id === 'market' || poi.id === 'village';

                return (
                    <div
                        key={poi.id}
                        style={{ top: poi.top, left: poi.left }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                    >
                        <button
                            onClick={() => setSelectedPOI(poi)}
                            className={`flex flex-col items-center transition-all ${isRelevant ? 'scale-100' : 'scale-75 opacity-40 grayscale'}`}
                        >
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg border-2 border-white transition-all ${selectedPOI?.id === poi.id ? 'bg-amber-500 scale-125 ring-4 ring-amber-500/30' : 'bg-white/90 hover:bg-amber-100'}`}>
                                {poi.id === 'monument' && (room.world.monumentProgress || 0) >= 1000 ? '🏛️' : poi.icon}
                            </div>
                            {poi.id === 'monument' && (
                                <div className="w-10 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500"
                                        style={{ width: `${(room.world.monumentProgress || 0) / 10}%` }}
                                    />
                                </div>
                            )}

                            <span className="bg-amber-900/80 text-white text-xs font-black uppercase px-2 py-0.5 rounded-full mt-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {poi.label}
                            </span>
                        </button>
                    </div>
                );
            })}

            {/* Event Info Modal */}
            {selectedEvent && (
                <div className="absolute inset-x-4 bottom-4 z-40 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl border-t-4 border-red-600 p-6">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className={`text-xs font-black uppercase px-2 py-1 rounded-full ${selectedEvent.type === 'RAID' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {selectedEvent.type === 'RAID' ? 'Raid i gang' : 'Sagnomsust Oppdrag'}
                                </span>
                                <h3 className="text-2xl font-black text-slate-900 mt-2">{selectedEvent.title}</h3>
                            </div>
                            <button onClick={() => setSelectedEvent(null)} className="text-slate-400 text-xl">✕</button>
                        </div>
                        <p className="text-base text-slate-600 mb-6 leading-relaxed">{selectedEvent.description}</p>
                        <button
                            onClick={() => {
                                onAction({ type: selectedEvent.type === 'RAID' ? 'DEFEND' : 'EXPLORE', eventId: selectedEvent.id });
                                setSelectedEvent(null);
                            }}
                            className={`w-full py-4 rounded-xl font-black uppercase text-base shadow-lg ${selectedEvent.type === 'RAID' ? 'bg-red-600 text-white' : 'bg-yellow-400 text-slate-900'}`}
                        >
                            {selectedEvent.type === 'RAID' ? 'KJEMP MOT INNTRERNGERNE! ⚔️' : 'UTFORSK OMRÅDET! 🧭'}
                        </button>
                    </div>
                </div>
            )}

            {/* Action Popup */}
            {selectedPOI && (
                <div className="absolute inset-x-4 bottom-4 z-30 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-t-4 border-amber-600">

                        {/* POI Illustration Header */}
                        <div className="h-32 w-full bg-slate-200 relative">
                            <img
                                src={
                                    selectedPOI.id === 'monument'
                                        ? ((room.world.monumentProgress || 0) >= 1000 ? '/poi/monument_finished.png' : '/poi/monument.png')
                                        : `/poi/${selectedPOI.id}.png`
                                }
                                alt={selectedPOI.label}
                                className="w-full h-full object-cover"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                            <div className="absolute bottom-3 left-5 text-white">
                                <h3 className="font-black flex items-center gap-3 text-shadow-md text-xl">
                                    <span className="text-4xl">{selectedPOI.icon}</span> {selectedPOI.label}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedPOI(null)}
                                className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm transition-colors text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-5 pt-3">

                            {selectedPOI.actions
                                .filter(a => {
                                    if (a.id === 'TAX_PEASANTS' && player.role !== 'BARON') return false;
                                    if (a.id === 'TAX_ROYAL' && player.role !== 'KING') return false;
                                    if (a.id === 'DECREE' && player.role !== 'KING') return false;
                                    if (a.id === 'RAID' && player.role !== 'BARON') return false;
                                    if (a.id === 'FEAST' && player.role !== 'KING' && player.role !== 'BARON') return false;
                                    if (selectedPOI.id === 'fields' && player.role !== 'PEASANT') return false;
                                    if (selectedPOI.id === 'forest' && player.role !== 'PEASANT') return false;
                                    return true;

                                })
                                .map(action => (
                                    <button
                                        key={action.id}
                                        onClick={() => handlePOIAction(selectedPOI.id, action.id)}
                                        className="flex justify-between items-center w-full bg-slate-50 hover:bg-amber-50 p-5 mb-2 last:mb-0 rounded-xl border border-slate-100 transition-colors text-left"
                                    >
                                        <span className="font-bold text-slate-800 text-lg">{action.label}</span>
                                        <span className="text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{action.cost}</span>
                                    </button>
                                ))
                            }
                            {selectedPOI.actions.length === 0 && (
                                <p className="text-xs text-slate-400 italic py-2">Ingen handlinger tilgjengelig for din rolle her.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
