import React from 'react';
import type { SimulationPlayer } from '../simulationTypes';

interface SimulationHierarchyProps {
    players: Record<string, SimulationPlayer>;
    currentPlayer: SimulationPlayer;
    regions: Record<string, any>;
    onAction: (action: any) => void;
}

export const SimulationHierarchy: React.FC<SimulationHierarchyProps> = React.memo(({ players, currentPlayer, regions, onAction }) => {
    const getRegionName = (rId: string) => {
        if (!rId || rId === 'unassigned') return 'Ingen Region';
        if (rId === 'capital') return 'Kongeriket (Hovedstaden)';
        if (rId === 'test_region') return 'Test Baroniet';

        if (players && rId.startsWith('region_')) {
            const baronOwner = Object.values(players).find(p => p.role === 'BARON' && p.regionId === rId);
            if (baronOwner) return `${baronOwner.name}s Baroni`;

            const baronId = rId.replace('region_', '');
            const baronById = players[baronId];
            if (baronById) return `${baronById.name}s Baroni`;
        }
        return regions?.[rId]?.name || rId;
    };

    return (
        <div className="space-y-12 pb-20">
            <h2 className="text-4xl font-black text-white tracking-tighter border-b-2 border-white/5 pb-4">Samfunnsstruktur</h2>

            {/* RETIRE BUTTON */}
            <div className="flex justify-end px-8">
                {currentPlayer.role !== 'PEASANT' && (
                    <button
                        onClick={() => {
                            if (window.confirm('Er du sikker? Du vil miste din rang og bli en simpel bonde.')) {
                                onAction({ type: 'RETIRE' });
                            }
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors border border-slate-700 hover:border-rose-500 px-4 py-2 rounded-lg"
                    >
                        Frasi Tittel (Bli Bonde)
                    </button>
                )}
            </div>

            {/* 1. THE KING */}
            <div className="flex justify-center">
                {Object.values(players || {}).filter(p => p.role === 'KING').map(king => (
                    <div key={king.id} className="relative group">
                        <div className="bg-gradient-to-br from-amber-600 to-yellow-600 p-1 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.4)]">
                            <div className="bg-slate-900/90 p-8 rounded-[1.3rem] flex flex-col items-center min-w-[300px] border border-white/10">
                                <div className="text-6xl mb-4 drop-shadow-xl">👑</div>
                                <h3 className="text-2xl font-black text-white mb-1">{king.name}</h3>
                                <div className="text-xs font-black uppercase text-amber-500 tracking-widest mb-4">Hans Majestet Kongen</div>
                                <div className="w-full flex justify-between items-center text-xs font-bold text-slate-400 bg-black/20 px-4 py-2 rounded-xl">
                                    <span>Legitimitet</span>
                                    <span className="text-white">{(king.status as any).legitimacy || 100}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 h-12 w-1 bg-gradient-to-b from-amber-600 to-slate-700 opacity-50"></div>
                    </div>
                ))}
            </div>

            {/* 2. THE NOBILITY & SUBJECTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative pt-8">
                <div className="absolute top-0 left-10 right-10 h-1 bg-slate-700 opacity-30 rounded-full"></div>
                {Object.values(players || {}).filter(p => p.role === 'BARON').map(baron => (
                    <div key={baron.id} className="flex flex-col gap-4 relative">
                        <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 h-8 w-1 bg-slate-700 opacity-30"></div>
                        <div className="bg-slate-800/80 p-6 rounded-3xl border border-white/5 shadow-xl relative z-10">
                            <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-4">
                                <div className="text-4xl">🏰</div>
                                <div>
                                    <h4 className="text-lg font-black text-white">{baron.name}</h4>
                                    <div className="text-[10px] font-black uppercase text-indigo-400 tracking-widest uppercase">{getRegionName(baron.regionId)}</div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 border-b border-white/5 pb-1">Underståtte</div>
                                {Object.values(players || {}).filter(p => (p.role === 'PEASANT' || p.role === 'SOLDIER') && p.regionId === baron.regionId).map(subject => (
                                    <div key={subject.id} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                                        <div className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-lg text-lg shadow-inner">
                                            {subject.role === 'SOLDIER' ? '⚔️' : '🌾'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-slate-200">{subject.name}</div>
                                            <div className="text-[10px] uppercase text-slate-500 font-bold">{subject.role === 'SOLDIER' ? 'Soldat' : 'Bonde'}</div>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${subject.lastActive > Date.now() - 60000 ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-slate-600'}`}></div>
                                    </div>
                                ))}
                                {Object.values(players || {}).filter(p => (p.role === 'PEASANT' || p.role === 'SOLDIER') && p.regionId === baron.regionId).length === 0 && (
                                    <div className="text-xs text-slate-600 italic text-center py-4">Ingen undersåtter ennå...</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Free Men / Unassigned */}
                <div className="flex flex-col gap-4 relative">
                    <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 h-8 w-1 bg-slate-700 opacity-30"></div>
                    <div className="bg-slate-800/40 p-6 rounded-3xl border-2 border-dashed border-white/5 relative z-10">
                        <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-4 opacity-70">
                            <div className="text-4xl">⚖️</div>
                            <div>
                                <h4 className="text-lg font-black text-white">Frie Menn</h4>
                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Markedet & Byen</div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {Object.values(players || {}).filter(p => !['KING', 'BARON'].includes(p.role) && (!p.regionId || p.regionId === 'capital' || p.regionId === 'unassigned')).map(free => (
                                <div key={free.id} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5 opacity-80">
                                    <div className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-lg">
                                        {free.role === 'MERCHANT' ? '💰' : free.role === 'SOLDIER' ? '⚔️' : '👤'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-slate-300">{free.name}</div>
                                        <div className="text-[10px] uppercase text-slate-500 font-bold">{free.role}</div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${free.lastActive > Date.now() - 60000 ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

SimulationHierarchy.displayName = 'SimulationHierarchy';
