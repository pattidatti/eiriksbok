import React from 'react';
import type { SimulationPlayer, SimulationRoom } from '../simulationTypes';
import { ROLE_TITLES, LEVEL_XP, SEASONS } from '../constants';
import { useSimulation } from '../SimulationContext';
import { Badge } from '../ui/Badge';
import { GameCard } from '../ui/GameCard';
import { Map, User, Scroll, MessageSquare, LayoutGrid, Hammer, Sun, Package } from 'lucide-react';

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
        <aside className="w-80 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col z-20 shadow-2xl">
            <div className="p-6 border-b border-white/5 space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl shadow-lg ring-1 ring-white/10 shrink-0 overflow-hidden">
                        {player.avatar ? (
                            <img src={player.avatar} alt={player.role} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        ) : RoleIcon}
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-white leading-tight">{player.name}</h1>
                        <div className="flex flex-col gap-1 mt-1">
                            <Badge variant="role" className="text-sm px-3 py-1 w-fit">{roleTitle}</Badge>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-tighter truncate max-w-[160px]">📍 {getRegionName(player.regionId)}</span>
                        </div>
                    </div>
                </div>

                {/* Vitals */}
                <GameCard className="!p-4 !bg-black/20 space-y-4">
                    {/* Stamina */}
                    <div>
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1.5 text-slate-400">
                            <span>⚡ Stamina</span>
                            <span className="text-white">{Math.round(staminaWidth)}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] ${staminaWidth > 50 ? 'bg-amber-400' : staminaWidth > 20 ? 'bg-amber-600' : 'bg-red-500 animate-pulse'}`}
                                style={{ width: `${staminaWidth}%` }}
                            />
                        </div>
                    </div>

                    {/* Health */}
                    <div>
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1.5 text-slate-400">
                            <span>❤️ Helse</span>
                            <span className="text-white">{healthWidth}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-rose-500 to-rose-700 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(225,29,72,0.5)]"
                                style={{ width: `${healthWidth}%` }}
                            />
                        </div>
                    </div>

                    {/* XP */}
                    <div>
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1.5 text-slate-400">
                            <span>Nivå {currentLvl}</span>
                            <span className="text-indigo-400">{Math.floor(xpPercent)}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 transition-all duration-1000"
                                style={{ width: `${xpPercent}%` }}
                            />
                        </div>
                    </div>
                </GameCard>
            </div >

            {/* Navigation */}
            < nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar" >
                {/* Group 1: World */}
                < div className="space-y-1" >
                    <div className="px-4 text-[10px] font-black uppercase text-slate-600 tracking-widest mb-2">Verden</div>
                    {
                        [
                            { id: 'MAP', label: 'Verdenskart', icon: Map },
                            { id: 'ACTIVITY', label: 'Live Hendelser', icon: MessageSquare },
                        ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wide
                                    ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-x-1'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:translate-x-1'
                                        }
                                `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })
                    }
                </div >

                {/* Group 2: Personal */}
                < div className="space-y-1" >
                    <div className="px-4 text-[10px] font-black uppercase text-slate-600 tracking-widest mb-2">Deg selv</div>
                    {
                        [
                            { id: 'PROFILE', label: 'Profil', icon: User },
                            { id: 'INVENTORY', label: 'Eiendeler', icon: Package },
                            { id: 'SKILLS', label: 'Ferdigheter', icon: Scroll },
                        ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wide
                                    ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-x-1'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:translate-x-1'
                                        }
                                `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })
                    }
                </div >

                {/* Group 3: Society & Politics */}
                < div className="space-y-1" >
                    <div className="px-4 text-[10px] font-black uppercase text-slate-600 tracking-widest mb-2">Samfunn</div>
                    {
                        [
                            { id: 'DIPLOMACY', label: 'Diplomati', icon: MessageSquare },
                            { id: 'HIERARCHY', label: 'Samfunnsstruktur', icon: LayoutGrid },
                        ].map((tab) => {
                            if (tab.id === 'DIPLOMACY' && player.role === 'PEASANT') return null;
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wide
                                    ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-x-1'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:translate-x-1'
                                        }
                                `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })
                    }
                </div >

                {/* Group 4: Misc */}
                < div className="space-y-1" >
                    <div className="px-4 text-[10px] font-black uppercase text-slate-600 tracking-widest mb-2">Annet</div>
                    {
                        [
                            { id: 'UPGRADES', label: 'Oppgraderinger', icon: Hammer },
                        ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-wide
                                    ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-x-1'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:translate-x-1'
                                        }
                                `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })
                    }
                </div >
            </nav >

            {/* Footer */}
            < div className="p-6 bg-black/20 border-t border-white/5" >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-tighter">
                    <span>År {room.world.year}</span>
                    <span className="text-amber-500">{(SEASONS as any)[room.world.season]?.label}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>{room.world.weather}</span>
                </div>
            </div >
        </aside >
    );
};
