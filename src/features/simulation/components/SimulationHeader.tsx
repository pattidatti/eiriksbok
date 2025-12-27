import React from 'react';
import type { SimulationPlayer, SimulationRoom } from '../simulationTypes';

interface SimulationHeaderProps {
    room: SimulationRoom;
    player: SimulationPlayer;
    pin?: string;
}

export const SimulationHeader: React.FC<SimulationHeaderProps> = ({ room, player, pin }) => {
    return (
        <header className="h-16 border-b border-white/5 bg-slate-950/30 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
            <div className="flex items-center gap-6">
                <div className="px-3 py-1 bg-slate-800 rounded-lg border border-white/5 font-mono text-xs text-indigo-400">PIN: {pin}</div>

                {room.world.settlement?.activeProjectId && (
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Aktivt Prosjekt:</span>
                        <span className="text-sm font-bold text-white capitalize">{room.world.settlement.activeProjectId}</span>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${(room.world.settlement.buildings[room.world.settlement.activeProjectId]?.progress / room.world.settlement.buildings[room.world.settlement.activeProjectId]?.target) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* BARONY BADGE */}
                {player.regionId && player.regionId !== 'capital' && (
                    <div className="hidden md:flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
                        <span className="text-xl">🏰</span>
                        <div>
                            <div className="text-[10px] font-black uppercase text-indigo-400 leading-none mb-0.5">Tilhørighet</div>
                            <div className="text-xs font-bold text-white leading-none capitalize">{player.regionId.replace('region_', 'Baroni ')}</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-6">
                {/* Money Display */}
                <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-amber-500/20 shadow-lg">
                    <span className="text-xl">🪙</span>
                    <span className="text-lg font-black text-amber-400 tracking-tight">{Math.floor(player.resources.gold || 0)}</span>
                </div>

                <div className="w-px h-8 bg-white/10" />

                <button
                    onClick={() => window.location.href = '/'}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                    <span className="text-xl">✕</span>
                </button>
            </div>
        </header>
    );
};
