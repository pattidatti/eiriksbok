```
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

    // Sort by ready time
    trackedProcesses.sort((a, b) => a.readyAt - b.readyAt);

    // Only show the soonest / most relevant info to avoid clutter
    // Or simpler: Show a summary like "2 Crops Growing" and the next ready timer
    const nextReady = trackedProcesses[0];
    const timeLeft = Math.max(0, nextReady.readyAt - currentTime);
    const isReady = timeLeft <= 0;

    const formatTime = (ms: number) => {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${ mins }m ${ secs } s`;
    };

    return (
        <div className="absolute top-24 right-4 z-[40] pointer-events-none">
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl pointer-events-auto flex items-center gap-4 transition-all hover:bg-slate-900/95">
                <div className={`w - 10 h - 10 rounded - lg flex items - center justify - center border ${ isReady ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse' : 'bg-slate-800 border-white/10 text-slate-400' } `}>
                    {isReady ? <Check size={20} /> : <Clock size={20} />}
                </div>

                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {isReady ? 'Innhøsting Klar!' : 'Neste Avling'}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`text - sm font - black ${ isReady ? 'text-emerald-400' : 'text-white' } `}>
                            {isReady ? 'Høst nå' : formatTime(timeLeft)}
                        </span>
                        {!isReady && (
                            <span className="text-xs text-slate-500 font-bold">({trackedProcesses.length} totalt)</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
