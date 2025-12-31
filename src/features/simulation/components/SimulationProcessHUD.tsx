import React, { useState, useEffect } from 'react';
import type { SimulationPlayer } from '../simulationTypes';
import { Clock, Check } from 'lucide-react';

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
    if (activeProcesses.length === 0) return null;

    // Filter relevant processes (e.g. Crops)
    const trackedProcesses = activeProcesses.filter(p => p.type === 'CROP');

    if (trackedProcesses.length === 0) return null;

    // Sort by ready time (soonest first)
    trackedProcesses.sort((a, b) => a.readyAt - b.readyAt);

    const currentTimeCtx = currentTime; // rename to avoid conflict if needed, or just use state

    const formatTime = (ms: number) => {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="absolute top-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none items-end">
            {trackedProcesses.map(process => {
                const timeLeft = Math.max(0, process.readyAt - currentTimeCtx);
                const isReady = timeLeft <= 0;

                return (
                    <div
                        key={process.id}
                        className="bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl pointer-events-auto flex items-center gap-4 transition-all hover:bg-slate-900/95 animate-in slide-in-from-right-4 duration-300"
                    >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isReady ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse' : 'bg-slate-800 border-white/10 text-slate-400'}`}>
                            {isReady ? <Check size={20} /> : <Clock size={20} />}
                        </div>

                        <div className="flex flex-col min-w-[120px]">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {isReady ? 'Innhøsting Klar!' : 'Avling Gror'}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-black ${isReady ? 'text-emerald-400' : 'text-white'}`}>
                                    {isReady ? 'Høst nå' : formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
