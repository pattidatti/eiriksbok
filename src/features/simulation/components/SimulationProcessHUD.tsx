import React, { useState, useEffect } from 'react';
import type { SimulationPlayer } from '../simulationTypes';
import { Clock, Check } from 'lucide-react';
import { RESOURCE_DETAILS } from '../data/items';

interface SimulationProcessHUDProps {
    player: SimulationPlayer;
}

export const SimulationProcessHUD: React.FC<SimulationProcessHUDProps> = ({ player }) => {
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const activeProcesses = player.activeProcesses || [];

    // Define time context first
    const currentTimeCtx = currentTime;

    // Filter relevant processes (Crops, Coop, Mill, etc)
    const trackedProcesses = activeProcesses.filter(p => p.type === 'CROP' || p.type === 'COOP' || p.type === 'MILL');

    // Filter active buffs
    const activeBuffs = (player.activeBuffs || []).filter(b => b.expiresAt > currentTimeCtx);

    if (trackedProcesses.length === 0 && activeBuffs.length === 0) return null;

    // Sort by ready time (soonest first)
    trackedProcesses.sort((a, b) => a.readyAt - b.readyAt);

    const formatTime = (ms: number) => {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="absolute top-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none items-end">
            {/* BUFFS */}
            {activeBuffs.map(buff => {
                const timeLeft = Math.max(0, buff.expiresAt - currentTimeCtx);
                return (
                    <div
                        key={buff.id}
                        className="group bg-indigo-900/90 backdrop-blur-md border border-indigo-500/30 rounded-xl p-3 shadow-xl pointer-events-auto flex items-center gap-4 transition-all hover:bg-indigo-900/100 hover:scale-105 animate-in slide-in-from-right-4 duration-300 relative"
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center border bg-indigo-500/20 border-indigo-500 text-indigo-300">
                            <span className="text-xl">⚡</span>
                        </div>
                        <div className="flex flex-col min-w-[120px]">
                            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                                {buff.label}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-white">
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        {/* Tooltip on Hover */}
                        {buff.description && (
                            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-48 bg-slate-900/95 border border-indigo-500/30 p-3 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none translate-x-2 group-hover:translate-x-0">
                                <p className="text-[10px] text-indigo-100 leading-tight">
                                    {buff.description}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* PROCESSES */}
            {trackedProcesses.map(process => {
                const timeLeft = Math.max(0, process.readyAt - currentTimeCtx);
                const isReady = timeLeft <= 0;

                // Content based on type
                let label = 'Avling Gror';
                let icon: React.ReactNode = <Clock size={20} />;
                let readyLabel = 'Innhøsting Klar!';

                // Lookup resource details if available
                const resourceInfo = RESOURCE_DETAILS[process.itemId];

                if (process.type === 'COOP') {
                    label = 'Høner Spiser';
                    icon = <span className="text-xl">🐔</span>;
                    readyLabel = 'Egg klare!';
                } else if (process.type === 'MILL') {
                    label = 'Kverner korn';
                    icon = <span className="text-xl">⚙️</span>;
                    readyLabel = 'Mel klart!';
                } else {
                    // CROP / Resource
                    if (resourceInfo) {
                        icon = <span className="text-xl">{resourceInfo.icon}</span>;
                        label = `${resourceInfo.label} gror`;
                        readyLabel = `${resourceInfo.label} klar!`;
                    } else {
                        // Fallback generic
                        icon = isReady ? <Check size={20} /> : <Clock size={20} />;
                    }
                }

                return (
                    <div
                        key={process.id}
                        className="bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl pointer-events-auto flex items-center gap-4 transition-all hover:bg-slate-900/95 animate-in slide-in-from-right-4 duration-300"
                    >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isReady ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse' : 'bg-slate-800 border-white/10 text-slate-400'}`}>
                            {icon}
                        </div>

                        <div className="flex flex-col min-w-[120px]">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {isReady ? readyLabel : label}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-black ${isReady ? 'text-emerald-400' : 'text-white'}`}>
                                    {isReady ? 'Hent nå' : formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
