import React, { useState, useEffect, useRef } from 'react';
import { BotInstance } from './BotInstance';
import { BotEvolution } from './botEvolution';
import type { SimulationRoom } from '../../simulationTypes';
import { Brain, TrendingUp, AlertTriangle, Play, Pause, Activity } from 'lucide-react';

interface AITrainingLabProps {
    roomData: SimulationRoom;
    pin: string;
}

export const AITrainingLab: React.FC<AITrainingLabProps> = ({ roomData, pin }) => {
    const [bots, setBots] = useState<BotInstance[]>([]);
    const [generation, setGeneration] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [fitnessHistory, setFitnessHistory] = useState<number[]>([]);
    const [decisionStats, setDecisionStats] = useState<Record<string, number>>({});
    const [lastError, setLastError] = useState<any>(null);

    const timerRef = useRef<number | null>(null);

    const startTraining = () => {
        if (!roomData.players) return;

        // Pick all players or some specific bots? 
        // For now, let's assume we spawn a bot if none exist, or convert existing players?
        // Actually, let's just listen to roomData.players and if they are marked as 'BOT', we run them.
        // But the user wants us to implement the system, so let's allow spawning bots.

        setIsRunning(true);
    };

    const stopTraining = () => {
        setIsRunning(false);
        if (timerRef.current) cancelIdleCallback(timerRef.current);
    };

    useEffect(() => {
        if (isRunning) {
            const runTick = () => {
                // Find bot players in roomData
                const botPlayers = Object.values(roomData.players || {}).filter(p => p.name.includes('BOT'));

                botPlayers.forEach(async (p) => {
                    // Find or create bot instance
                    let instance = bots.find(b => b.player.id === p.id);
                    if (!instance) {
                        const genome = BotEvolution.getNextGenerationGenome();
                        instance = new BotInstance(p, genome);
                        setBots(prev => [...prev, instance!]);
                        setGeneration(genome.generation);
                    } else {
                        instance.player = p; // Update with latest room state
                    }

                    await instance.tick(roomData, pin);

                    // Update stats
                    if (instance.history.length > 0) {
                        const lastAction = instance.history[instance.history.length - 1].action.type || 'IDLE';
                        setDecisionStats(prev => ({ ...prev, [lastAction]: (prev[lastAction] || 0) + 1 }));
                    }

                    if (instance.status === 'STUCK' || instance.status === 'DEAD') {
                        setLastError((window as any).lastAILog);
                    }

                    if (instance.status === 'SUCCESS' || instance.status === 'DEAD' || instance.status === 'STUCK') {
                        // Evolution step
                        const fitness = instance.getFitness();
                        instance.genome.fitness = fitness;
                        BotEvolution.saveTopGenomes([instance.genome]);
                        setFitnessHistory(prev => [...prev.slice(-19), fitness]);
                    }
                });

                timerRef.current = requestIdleCallback(() => runTick(), { timeout: 500 });
            };

            runTick();
        }
        return () => {
            if (timerRef.current) cancelIdleCallback(timerRef.current);
        };
    }, [isRunning, roomData, pin]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-white/10">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Brain className="text-indigo-400" /> AI Training Lab
                    </h2>
                    <p className="text-slate-400 text-sm">Genetisk Algoritme-optimalisering av spillbalanse</p>
                </div>
                <div className="flex gap-3">
                    {!isRunning ? (
                        <button onClick={startTraining} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all">
                            <Play size={18} /> Start Trening
                        </button>
                    ) : (
                        <button onClick={stopTraining} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all">
                            <Pause size={18} /> Stopp Trening
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-black mb-2">
                        <Activity size={14} /> Generasjon
                    </div>
                    <div className="text-4xl font-black">{generation}</div>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-black mb-2">
                            <TrendingUp size={14} /> Fitness Trend
                        </div>
                        <div className="text-4xl font-black mb-4">
                            {fitnessHistory.length > 0 ? (fitnessHistory.reduce((a, b) => a + b, 0) / fitnessHistory.length).toFixed(1) : '0.0'}
                        </div>
                    </div>
                    {/* Sparkline Graph */}
                    <div className="h-12 flex items-end gap-1 px-1">
                        {fitnessHistory.map((f, i) => {
                            const max = Math.max(...fitnessHistory, 1);
                            const height = (f / max) * 100;
                            return (
                                <div
                                    key={i}
                                    className="flex-1 bg-indigo-500/50 rounded-t-sm transition-all duration-500 hover:bg-indigo-400"
                                    style={{ height: `${height}%` }}
                                    title={`Fitness: ${f.toFixed(1)}`}
                                />
                            );
                        })}
                        {fitnessHistory.length === 0 && <div className="w-full h-[1px] bg-white/10" />}
                    </div>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 text-amber-500">
                    <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-black mb-2">
                        <AlertTriangle size={14} /> Bottlenecks
                    </div>
                    <div className="text-4xl font-black text-amber-500">
                        {bots.filter(b => b.status === 'STUCK').length}
                    </div>
                </div>
            </div>

            {/* Decision Heatmap */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Decision Heatmap</h3>
                <div className="flex flex-wrap gap-4">
                    {Object.entries(decisionStats).sort((a, b) => b[1] - a[1]).map(([action, count]) => (
                        <div key={action} className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col items-center min-w-[80px]">
                            <span className="text-xs text-slate-500 uppercase">{action}</span>
                            <span className="text-lg font-bold">{count}</span>
                        </div>
                    ))}
                    {Object.keys(decisionStats).length === 0 && <p className="text-slate-600 italic">Ingen data ennå...</p>}
                </div>
            </div>

            {/* Error Log */}
            {lastError && (
                <div className="bg-red-950/30 border border-red-500/30 p-6 rounded-2xl">
                    <h3 className="text-red-400 font-bold flex items-center gap-2 mb-4">
                        <AlertTriangle size={18} /> Game Balance Issue Detected
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-black/40 p-4 rounded-lg">
                            <p className="text-slate-400 text-xs uppercase mb-2">Grunn</p>
                            <p className="font-mono">{lastError.reason}</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-lg">
                            <p className="text-slate-400 text-xs uppercase mb-2">Siste Handling</p>
                            <p className="font-mono">{lastError.history[lastError.history.length - 1]?.action.type || 'None'}</p>
                        </div>
                    </div>
                    <pre className="mt-4 p-4 bg-black/40 rounded-lg overflow-x-auto text-[10px] text-slate-300 custom-scrollbar">
                        {JSON.stringify(lastError, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};
