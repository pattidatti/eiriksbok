import React from 'react';
import type { SimulationPlayer, SimulationRoom } from '../simulationTypes';
import { ROLE_TITLES, LEVEL_XP, SEASONS } from '../constants';
import { useSimulation } from '../SimulationContext';

interface SimulationSidebarProps {
    player: SimulationPlayer;
    room: SimulationRoom;
}

export const SimulationSidebar: React.FC<SimulationSidebarProps> = ({ player, room }) => {
    const { activeTab, setActiveTab } = useSimulation();

    const RoleIcon = {
        KING: '👑',
        BARON: '🏰',
        PEASANT: '🌾',
        SOLDIER: '⚔️',
        MERCHANT: '💰'
    }[player.role] || '❓';

    const staminaWidth = player.status.stamina || 0;
    const healthWidth = player.status.hp || 0;
    const currentXp = player.stats.xp || 0;
    const currentLvl = player.stats.level || 1;
    const targetXp = LEVEL_XP[currentLvl] || 1000;
    const xpPercent = Math.min(100, (currentXp / targetXp) * 100);

    const roleTitle = (ROLE_TITLES as any)[player.role][Math.min(currentLvl, (ROLE_TITLES as any)[player.role].length) - 1];

    return (
        <aside className="w-80 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col z-20 shadow-2xl">
            <div className="p-8 border-b border-white/5">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg ring-2 ring-white/10 shrink-0 overflow-hidden">
                        {player.avatar ? (
                            <img src={player.avatar} alt={player.role} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        ) : RoleIcon}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-white">{player.name}</h1>
                        <p className="text-xs font-black uppercase text-indigo-400 tracking-widest">{roleTitle}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Stamina */}
                    <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">
                            <span>⚡ Stamina</span>
                            <span className="text-white">{Math.round(staminaWidth)}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <div
                                className={`h-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] ${staminaWidth > 50 ? 'bg-amber-400' : staminaWidth > 20 ? 'bg-amber-600' : 'bg-red-500 animate-pulse'}`}
                                style={{ width: `${staminaWidth}%` }}
                            />
                        </div>
                    </div>

                    {/* Health */}
                    <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">
                            <span>❤️ Helse</span>
                            <span className="text-white">{healthWidth}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <div
                                className="h-full bg-gradient-to-r from-rose-500 to-rose-700 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(225,29,72,0.5)]"
                                style={{ width: `${healthWidth}%` }}
                            />
                        </div>
                    </div>

                    {/* XP/Level */}
                    <div className="pt-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">
                            <span>Nivå {currentLvl}</span>
                            <span className="text-indigo-400">{Math.floor(xpPercent)}% Til Neste</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 transition-all duration-1000"
                                style={{ width: `${xpPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Left Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {[
                    { id: 'MAP', label: 'Verdenskart', icon: '🗺️' },
                    { id: 'PROFILE', label: 'Profil', icon: '👤' },
                    { id: 'VILLAGE', label: 'Byggeprosjekter', icon: '🏗️' },
                    { id: 'SKILLS', label: 'Ferdigheter', icon: '📜' },
                    { id: 'DIPLOMACY', label: 'Diplomati', icon: '🕊️' },
                    { id: 'HIERARCHY', label: 'Struktur', icon: '🏛️' },
                    { id: 'UPGRADES', label: 'Oppgraderinger', icon: '⚒️' },
                ].map((tab) => {
                    if (tab.id === 'DIPLOMACY' && player.role === 'PEASANT') return null;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Quick Info Footer */}
            <div className="p-6 bg-black/20 border-t border-white/5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-tighter">
                    <span>År {room.world.year}</span>
                    <span className="text-amber-500">{(SEASONS as any)[room.world.season]?.label}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-black text-white">
                    <span>☀️ {room.world.weather}</span>
                </div>
            </div>
        </aside>
    );
};
