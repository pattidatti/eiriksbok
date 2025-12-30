import React from 'react';
import { Settings, User as UserIcon } from 'lucide-react';
import { useSimulation } from '../SimulationContext';
import type { SimulationPlayer, SimulationRoom } from '../simulationTypes';
import { Badge } from '../ui/Badge';
import { ResourceIcon } from '../ui/ResourceIcon';
import { GameButton } from '../ui/GameButton';
import { VILLAGE_BUILDINGS } from '../constants';

interface SimulationHeaderProps {
    room: SimulationRoom;
    player: SimulationPlayer;
    pin?: string;
}

export const SimulationHeader: React.FC<SimulationHeaderProps> = ({ room, player, pin }) => {
    const { setActiveTab } = useSimulation();

    return (
        <header className="h-16 border-b border-white/5 bg-slate-950/30 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
            <div className="flex items-center gap-6">
                <Badge variant="outline" className="font-mono">PIN: {pin}</Badge>

                {room.world.settlement?.activeProjectId && (
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Aktivt Prosjekt:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white capitalize">{room.world.settlement.activeProjectId}</span>
                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500"
                                    style={{
                                        width: (() => {
                                            const bId = room.world.settlement?.activeProjectId;
                                            if (!bId) return '0%';
                                            const building = room.world.settlement?.buildings[bId];
                                            if (!building) return '0%';
                                            const def = VILLAGE_BUILDINGS[bId];
                                            const nextLevelReqs = def?.levels[building.level + 1]?.requirements;
                                            if (!nextLevelReqs) return '100%';

                                            const reqEntries = Object.entries(nextLevelReqs);
                                            if (reqEntries.length === 0) return '100%';

                                            let totalTarget = 0;
                                            let totalCurrent = 0;
                                            reqEntries.forEach(([_, target]) => { totalTarget += (target as number); });
                                            Object.entries(building.progress || {}).forEach(([_, current]) => { totalCurrent += (current as number); });

                                            return `${Math.min(100, (totalCurrent / totalTarget) * 100)}%`;
                                        })()
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BARONY BADGE */}
                {player.regionId && player.regionId !== 'capital' && (
                    <Badge variant="role" className="hidden md:flex gap-2 py-1 px-3">
                        <span>🏰</span>
                        <span className="capitalize">{player.regionId.replace('region_', 'Baroni ')}</span>
                    </Badge>
                )}
            </div>

            <div className="flex items-center gap-6">
                {/* Money & Resources Display */}
                <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-1.5 rounded-full border border-amber-500/20 shadow-lg">
                    <ResourceIcon resource="gold" amount={player.resources.gold} size="md" />
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <ResourceIcon resource="bread" amount={player.resources.bread || 0} size="md" />
                </div>

                <div className="w-px h-8 bg-white/10" />

                <div className="flex items-center gap-2">
                    <GameButton
                        variant="ghost"
                        size="sm"
                        className="!p-2 rounded-full"
                        onClick={() => window.open('/sim/profile', '_blank')}
                        title="Min Profil"
                    >
                        <UserIcon className="w-6 h-6" />
                    </GameButton>

                    <GameButton
                        variant="ghost"
                        size="sm"
                        className="!p-2 rounded-full"
                        onClick={() => setActiveTab('SETTINGS')}
                        title="Innstillinger"
                    >
                        <Settings className="w-6 h-6" />
                    </GameButton>
                </div>
            </div>
        </header>
    );
};
