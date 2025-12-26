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
        id: 'forest', label: 'Skogen', icon: '🌲', top: '18%', left: '65%', roles: ['PEASANT'],
        actions: [{ id: 'CHOP', label: 'Hugge Ved', cost: '-15⚡ -1🥖' }]
    },
    {
        id: 'castle', label: 'Slottet', icon: '🏰', top: '48%', left: '72%', roles: ['BARON', 'KING'],
        actions: [
            { id: 'TAX_PEASANTS', label: 'Regjonal Skatt', cost: 'Baron Only' },
            { id: 'TAX_ROYAL', label: 'Kongelig Skatt', cost: 'King Only' },
            { id: 'DRAFT', label: 'Verve Soldater', cost: '-5g -10🥖' },
            { id: 'DECREE', label: 'Utsted Dekret', cost: 'King Only' }
        ]
    },
    {
        id: 'market', label: 'Markedet', icon: '⚖️', top: '68%', left: '38%', roles: ['PEASANT', 'BARON', 'KING'],
        actions: [
            { id: 'MARKET_VIEW', label: 'Åpne Handel', cost: 'Gratis' }
        ]
    },
    {
        id: 'village', label: 'Landsbyen', icon: '🏠', top: '45%', left: '40%', roles: ['PEASANT', 'BARON', 'KING', 'SOLDIER'],
        actions: [
            { id: 'REST', label: 'Hvile & Spise', cost: '-1🥖 +30⚡' },
            { id: 'CRAFT', label: 'Smie Sverd', cost: '-30⚡ -10⛏️ -5🪵' }
        ]
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
        } else {
            onAction(actionId);
        }
        setSelectedPOI(null);
    };

    const weather = room.world?.weather || 'Clear';

    return (
        <div className={`relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-900/20 bg-amber-50 transition-all duration-1000 ${weather === 'Rain' ? 'brightness-90 contrast-110' : weather === 'Storm' ? 'brightness-75 contrast-125' : weather === 'Fog' ? 'sepia-[0.3] contrast-75' : ''}`}>
            {/* The Map Background */}
            <img
                src="/simulation_map.png"
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
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white transition-all ${selectedPOI?.id === poi.id ? 'bg-amber-500 scale-125 ring-4 ring-amber-500/30' : 'bg-white/90 hover:bg-amber-100'}`}>
                                {poi.icon}
                            </div>
                            <span className="bg-amber-900/80 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {poi.label}
                            </span>
                        </button>
                    </div>
                );
            })}

            {/* Event Info Modal */}
            {selectedEvent && (
                <div className="absolute inset-x-4 bottom-4 z-40 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl border-t-4 border-red-600 p-5">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${selectedEvent.type === 'RAID' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {selectedEvent.type === 'RAID' ? 'Raid i gang' : 'Sagnomsust Oppdrag'}
                                </span>
                                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedEvent.title}</h3>
                            </div>
                            <button onClick={() => setSelectedEvent(null)} className="text-slate-400">✕</button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">{selectedEvent.description}</p>
                        <button
                            onClick={() => {
                                onAction({ type: selectedEvent.type === 'RAID' ? 'DEFEND' : 'EXPLORE', eventId: selectedEvent.id });
                                setSelectedEvent(null);
                            }}
                            className={`w-full py-3 rounded-xl font-black uppercase text-sm shadow-lg ${selectedEvent.type === 'RAID' ? 'bg-red-600 text-white' : 'bg-yellow-400 text-slate-900'}`}
                        >
                            {selectedEvent.type === 'RAID' ? 'KJEMP MOT INNTRERNGERNE! ⚔️' : 'UTFORSK OMRÅDET! 🧭'}
                        </button>
                    </div>
                </div>
            )}

            {/* Action Popup */}
            {selectedPOI && (
                <div className="absolute inset-x-4 bottom-4 z-30 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl border-t-4 border-amber-600 p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <span className="text-2xl">{selectedPOI.icon}</span> {selectedPOI.label}
                            </h3>
                            <button onClick={() => setSelectedPOI(null)} className="text-slate-400 p-1">✕</button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {selectedPOI.actions
                                .filter(a => {
                                    if (a.id === 'TAX_PEASANTS' && player.role !== 'BARON') return false;
                                    if (a.id === 'TAX_ROYAL' && player.role !== 'KING') return false;
                                    if (a.id === 'DECREE' && player.role !== 'KING') return false;
                                    if (a.id === 'RAID' && player.role !== 'BARON') return false;
                                    if (selectedPOI.id === 'fields' && player.role !== 'PEASANT') return false;
                                    if (selectedPOI.id === 'forest' && player.role !== 'PEASANT') return false;
                                    return true;
                                })
                                .map(action => (
                                    <button
                                        key={action.id}
                                        onClick={() => handlePOIAction(selectedPOI.id, action.id)}
                                        className="flex justify-between items-center w-full bg-slate-50 hover:bg-amber-50 p-4 rounded-xl border border-slate-100 transition-colors text-left"
                                    >
                                        <span className="font-bold text-slate-700">{action.label}</span>
                                        <span className="text-[10px] font-mono text-slate-400">{action.cost}</span>
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
