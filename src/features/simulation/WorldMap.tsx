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
        actions: [{ id: 'WORK', label: 'Høste Korn', cost: '-10⚡ -1🌾' }]
    },
    {
        id: 'forest', label: 'Skogen', icon: '🌲', top: '18%', left: '65%', roles: ['PEASANT'],
        actions: [{ id: 'CHOP', label: 'Hugge Ved', cost: '-15⚡ -1🌾' }]
    },
    {
        id: 'castle', label: 'Slottet', icon: '🏰', top: '48%', left: '72%', roles: ['BARON', 'KING'],
        actions: [
            { id: 'TAX_PEASANTS', label: 'Regjonal Skatt', cost: 'Baron Only' },
            { id: 'TAX_ROYAL', label: 'Kongelig Skatt', cost: 'King Only' },
            { id: 'DRAFT', label: 'Verve Soldater', cost: '-5g -10🌾' },
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
        id: 'village', label: 'Landsbyen', icon: '🏠', top: '45%', left: '40%', roles: ['PEASANT', 'BARON', 'KING'],
        actions: [{ id: 'REST', label: 'Hvile & Spise', cost: '-1🌾 +30⚡' }]
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

export const WorldMap: React.FC<WorldMapProps> = ({ player, onAction, onOpenMarket }) => {
    const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

    const handlePOIAction = (_poiId: string, actionId: string) => {
        if (actionId === 'MARKET_VIEW') {
            onOpenMarket();
        } else {
            onAction(actionId);
        }
        setSelectedPOI(null);
    };


    return (
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-900/20 bg-amber-50">
            {/* The Map Background */}
            <img
                src="/simulation_map.png"
                alt="Kingdom Map"
                className="w-full h-full object-cover opacity-90"
            />


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
