import React from 'react';
import type { SimulationPlayer, SimulationRoom } from '../simulationTypes';
import { Badge } from '../ui/Badge';
import { ResourceIcon } from '../ui/ResourceIcon';
import { GameButton } from '../ui/GameButton';
import { X } from 'lucide-react';

interface SimulationHeaderProps {
    room: SimulationRoom;
    player: SimulationPlayer;
    pin?: string;
}

export const SimulationHeader: React.FC<SimulationHeaderProps> = ({ room, player, pin }) => {
    return (
        <header className="h-16 border-b border-white/5 bg-slate-950/30 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
            <div className="flex items-center gap-6">
                <Badge variant="outline" className="font-mono">PIN: {pin}</Badge>

                {room.world.settlement?.activeProjectId && (
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Aktivt Prosjekt:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white capitalize">{room.world.settlement.activeProjectId}</span>
                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500"
                                    style={{ width: `${(room.world.settlement.buildings[room.world.settlement.activeProjectId]?.progress / room.world.settlement.buildings[room.world.settlement.activeProjectId]?.target) * 100}%` }}
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
                {/* Money Display */}
                <div className="bg-slate-900/80 px-4 py-1.5 rounded-full border border-amber-500/20 shadow-lg">
                    <ResourceIcon resource="gold" amount={player.resources.gold} size="md" />
                </div>

                <div className="w-px h-8 bg-white/10" />

                <GameButton
                    variant="ghost"
                    size="sm"
                    className="!p-2 rounded-full"
                    onClick={() => window.location.href = '/'}
                >
                    <X className="w-6 h-6" />
                </GameButton>
            </div>
        </header>
    );
};
