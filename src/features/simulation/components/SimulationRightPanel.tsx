import React from 'react';
import type { SimulationPlayer, SimulationRoom } from '../simulationTypes';
import { RESOURCE_DETAILS } from '../constants';

interface SimulationRightPanelProps {
    player: SimulationPlayer;
    room: SimulationRoom;
}

export const SimulationRightPanel: React.FC<SimulationRightPanelProps> = ({ player, room }) => {
    // Helper to get friendly region name (duplicated from Viewport, could be a utility but okay for now)
    const getRegionName = (rId: string) => {
        if (!rId || rId === 'unassigned') return 'Ingen Region';
        if (rId === 'capital') return 'Kongeriket (Hovedstaden)';
        if (rId === 'test_region') return 'Test Baroniet';

        if (room?.players && rId.startsWith('region_')) {
            const baronOwner = Object.values(room.players).find(p => p.role === 'BARON' && p.regionId === rId);
            if (baronOwner) return `${baronOwner.name}s Baroni`;

            const baronId = rId.replace('region_', '');
            const baronById = room.players[baronId];
            if (baronById) return `${baronById.name}s Baroni`;
        }
        return rId;
    };

    return (
        <aside className="w-80 border-l border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col z-20">
            <div className="p-6 border-b border-white/5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-6 flex items-center justify-between">
                    Sekkens Innhold
                    <span className="text-[8px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-300">{(Object.keys(player.resources || {}).filter(k => (player.resources as any)[k] > 0).length)} Typer</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(player.resources || {}).map(([resId, amount]) => {
                        if (resId === 'gold') return null;
                        const details = (RESOURCE_DETAILS as any)[resId] || { label: resId, icon: '📦' };
                        if ((amount as number) <= 0) return null;
                        return (
                            <div key={resId} className="flex flex-col items-center justify-center bg-black/40 p-5 rounded-2xl border border-white/5 group relative hover:bg-slate-800 transition-all shadow-inner">
                                <span className="text-4xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md mb-2">{details.icon}</span>
                                <div className="flex flex-col items-center">
                                    <span className="text-3xl font-black text-white leading-none">{amount as number}</span>
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">{details.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Total Beholdning</span>
                    <div className="text-amber-500 font-black text-2xl drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">{(player.resources.gold || 0).toFixed(2)}g</div>
                </div>
            </div>

            {/* Live Activity Feed */}
            <div className="flex-1 overflow-hidden flex flex-col p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-rose-500 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
                    Live Hendelser
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {room.messages?.slice().reverse().map((msg: any, idx: number) => (
                        <div key={idx} className="bg-white/5 border-l-2 border-indigo-500 p-3 rounded-r-lg animate-in slide-in-from-right-4 duration-300">
                            <p className="text-[11px] font-medium leading-relaxed text-slate-300 antialiased line-clamp-3 overflow-hidden leading-tight font-serif opacity-90">{msg}</p>
                        </div>
                    ))}
                    {(!room.messages || room.messages.length === 0) && <div className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest py-12">Riket er stille...</div>}
                </div>
            </div>

            {/* Bottom Stats/Info */}
            <div className="p-6 bg-indigo-900/10 border-t border-white/5">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-slate-500 uppercase tracking-widest leading-none">Region</span>
                        <span className="text-white font-bold">{getRegionName(player.regionId)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-slate-500 uppercase tracking-widest leading-none">Legitimitet</span>
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" style={{ width: `${player.status.legitimacy || 100}% ` }}></div>
                            </div>
                            <span className="text-white font-bold">{player.status.legitimacy || 100}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 4px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 10px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: rgba(255, 255, 255, 0.2);
                        }
                    `}} />
        </aside>
    );
};
