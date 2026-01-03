import React, { useState } from 'react';
import type { SimulationPlayer, ActiveSiege } from '../simulationTypes';
import { GameButton } from '../ui/GameButton';
import { Flame, Shield, Sword, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SiegeEngineProps {
    player: SimulationPlayer;
    siege: ActiveSiege;
    onAction: (action: any) => void;
}

export const SiegeEngine: React.FC<SiegeEngineProps> = ({ player, siege, onAction }) => {
    const isParticipant = siege.attackers[player.id] || siege.defenders[player.id];
    // const isAttacker = !!siege.attackers[player.id];

    // Cast to any to access dynamic props not yet in strict Interface
    const s = siege as any;
    const gateHp = s.gateHp || 5000;
    const maxGateHp = s.maxGateHp || 5000;

    const [clicks, setClicks] = useState<{ id: number, x: number, y: number }[]>([]);

    const handleAttack = (e: React.MouseEvent) => {
        if (!isParticipant) return;

        // Visual Feedback
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setClicks(prev => [...prev, { id, x, y }]);

        // Cleanup visual
        setTimeout(() => setClicks(prev => prev.filter(c => c.id !== id)), 1000);

        // Actual Action
        onAction({ type: 'SIEGE_ACTION', subType: 'ATTACK_GATE' });
    };

    if (!isParticipant) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-black/80 rounded-2xl border border-red-500/30 backdrop-blur-sm">
                <div className="relative">
                    <Flame className="w-16 h-16 text-orange-500 animate-pulse absolute -top-2 -left-2 opacity-50" />
                    <Skull className="w-12 h-12 text-red-500 relative z-10" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest mb-2 font-display">Beleiring Pågår!</h2>
                    <p className="text-slate-300">Regionen er under angrep. Vil du kjempe?</p>
                </div>
                <div className="flex gap-4">
                    <GameButton
                        variant="primary"
                        className="bg-red-900 border-red-500 hover:bg-red-800"
                        onClick={() => onAction({ type: 'JOIN_SIEGE' })}
                        icon={<Sword />}
                    >
                        Bli med i angrepet
                    </GameButton>
                    <GameButton
                        variant="wood"
                        onClick={() => onAction({ type: 'JOIN_SIEGE' })} // Backend logic handles if they are defender based on Role/Ownership
                        icon={<Shield />}
                    >
                        Forsvar murene
                    </GameButton>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[600px] bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">

            {/* HUD */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
                <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                    <span className="text-red-500 font-bold uppercase tracking-wider text-xs">Fase 1: Porten</span>
                </div>
                <div className="flex gap-2">
                    <div className="text-white font-mono text-sm bg-black/50 px-3 py-1 rounded-lg">
                        {Object.keys(siege.attackers).length} Angripere
                    </div>
                    <div className="text-white font-mono text-sm bg-black/50 px-3 py-1 rounded-lg">
                        {Object.keys(siege.defenders).length} Forsvarere
                    </div>
                </div>
            </div>

            {/* PHASE 1: THE GATE */}
            {siege.phase === 'BREACH' && (
                <div className="relative w-full h-full flex flex-col items-center justify-end pb-20 bg-[url('https://images.unsplash.com/photo-1626080301072-5b967e88d752?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>

                    {/* GATE VISUAL */}
                    <div className="relative z-10 w-64 h-80 cursor-alias" onClick={handleAttack}>
                        {/* Gate HP Bar */}
                        <div className="absolute -top-12 left-0 right-0 h-4 bg-black/80 rounded-full border border-white/20 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-300"
                                style={{ width: `${(gateHp / maxGateHp) * 100}%` }}
                            />
                        </div>
                        <div className="absolute -top-16 w-full text-center font-black text-white drop-shadow-md">
                            {gateHp} / {maxGateHp} HP
                        </div>

                        {/* The Gate Itself (CSS Art roughly) */}
                        <div className="w-full h-full bg-amber-950 border-4 border-stone-800 rounded-t-full relative shadow-2xl transform active:scale-95 transition-transform">
                            {/* Iron Bars */}
                            <div className="absolute inset-x-0 top-10 bottom-0 flex justify-between px-8">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-2 h-full bg-stone-700 shadow-lg"></div>
                                ))}
                            </div>
                            {/* Damage Cracks Overlay */}
                            <div
                                className="absolute inset-0 bg-black/0 pointer-events-none mix-blend-multiply"
                                style={{ opacity: 1 - (gateHp / maxGateHp) }}
                            >
                                <svg className="w-full h-full opacity-60" viewBox="0 0 100 100">
                                    <path d="M20,20 L40,50 L30,80 M70,10 L50,40 L60,90" stroke="black" strokeWidth="2" fill="none" />
                                </svg>
                            </div>
                        </div>

                        {/* Click Effects */}
                        <AnimatePresence>
                            {clicks.map(click => (
                                <motion.div
                                    key={click.id}
                                    initial={{ opacity: 1, scale: 0.5, y: 0 }}
                                    animate={{ opacity: 0, scale: 1.5, y: -50 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute pointer-events-none text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]"
                                    style={{ left: click.x, top: click.y }}
                                >
                                    💥
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="relative z-10 mt-8">
                        <p className="text-white/50 text-sm animate-pulse">Trykk på porten for å angripe!</p>
                    </div>

                </div>
            )}

            {/* PHASE 2: COURTYARD */}
            {siege.phase === 'COURTYARD' && (
                <div className="relative w-full h-full flex flex-col bg-stone-950 border-t-4 border-black font-sans">

                    {/* BOSS AREA */}
                    <div className="h-1/3 bg-stone-900 flex items-center justify-center relative border-b-4 border-black shadow-xl z-10">
                        {/* Boss HP */}
                        <div className="absolute top-6 left-1/4 right-1/4 h-8 bg-black rounded-full border-2 border-red-900/50 overflow-hidden shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                            <div
                                className="h-full bg-gradient-to-r from-red-600 to-red-800 transition-all duration-300"
                                style={{ width: `${(s.bossHp / s.maxBossHp) * 100}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white drop-shadow-md tracking-wider">
                                GARNISONSSJEFEN: {Math.max(0, s.bossHp)} / {s.maxBossHp}
                            </span>
                        </div>

                        {/* Boss Visual */}
                        <div className="relative z-10 text-center mt-12">
                            <div className="text-7xl animate-bounce drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">👹</div>
                        </div>

                        {/* Boss Telegraph Attack Indicators (Top of Lanes) */}
                        {s.bossTargetLane !== undefined && (
                            <div className="absolute bottom-0 w-full flex h-6">
                                {[0, 1, 2].map(lane => (
                                    <div key={lane} className={`flex-1 transition-all duration-300 ${s.bossTargetLane === lane ? 'bg-red-500/50 shadow-[0_0_20px_#ef4444] animate-pulse' : 'bg-transparent'}`}>
                                        {s.bossTargetLane === lane && (
                                            <div className="w-full text-center text-[10px] font-black uppercase text-red-200 animate-bounce">Angriper her!</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* LANES */}
                    <div className="flex-1 flex relative bg-stone-900/50">
                        {[0, 1, 2].map(lane => {
                            const myParticipant = (siege.attackers[player.id] || siege.defenders[player.id]) as any;
                            const isMyLane = myParticipant?.lane === lane;
                            const isTargeted = s.bossTargetLane === lane;
                            const laneAttackers = Object.values(siege.attackers).concat(Object.values(siege.defenders)).filter((p: any) => p.lane === lane);

                            return (
                                <div
                                    key={lane}
                                    onClick={() => onAction({ type: 'SIEGE_ACTION', subType: 'MOVE_LANE', payload: { lane } })}
                                    className={`flex-1 border-r border-white/5 relative transition-all duration-300 cursor-pointer flex flex-col items-center justify-end pb-8 group
                                        ${isTargeted ? 'bg-red-900/20 shadow-[inset_0_0_50px_rgba(220,38,38,0.2)]' : ''}
                                        ${isMyLane ? 'bg-indigo-900/10' : 'hover:bg-white/5'}
                                    `}
                                >
                                    {/* Lane Label */}
                                    <div className="absolute top-4 text-xs font-black uppercase text-white/10 group-hover:text-white/30 transition-colors">
                                        {lane === 0 ? 'Venstre Flanke' : lane === 1 ? 'Senter' : 'Høyre Flanke'}
                                    </div>

                                    {/* Hazard Warning Overlay */}
                                    {isTargeted && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                                            <div className="text-red-500/20 text-[150px] font-black animate-ping select-none">!</div>
                                            <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-red-900/30 to-transparent"></div>
                                        </div>
                                    )}

                                    {/* Players in Lane */}
                                    <div className="flex flex-wrap gap-2 justify-center mb-20 px-4 z-10">
                                        {laneAttackers.map((p: any) => (
                                            <div
                                                key={p.name}
                                                className={`
                                                    w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center text-xs transition-transform hover:scale-110
                                                    ${p.name === player.name ? 'bg-indigo-500 border-white scale-110 z-20 ring-2 ring-indigo-400/50' : 'bg-slate-700 border-slate-500'}
                                                `}
                                                title={p.name}
                                            >
                                                {p.hp <= 0 ? '💀' : '👤'}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Controls (Only in my lane) */}
                                    {isMyLane && (
                                        <div className="absolute bottom-6 z-20 w-full px-8">
                                            <GameButton
                                                variant="primary"
                                                className="w-full animate-pulse shadow-[0_0_15px_rgba(79,70,229,0.5)] border-indigo-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAction({ type: 'SIEGE_ACTION', subType: 'ATTACK_BOSS' });
                                                }}
                                            >
                                                <div className="flex flex-col items-center leading-none py-1">
                                                    <span className="text-lg">⚔️</span>
                                                    <span className="text-[10px] uppercase font-bold">Angrip</span>
                                                </div>
                                            </GameButton>
                                            <div className="text-center mt-2 text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Din Posisjon</div>
                                        </div>
                                    )}

                                    {!isMyLane && (
                                        <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white/50 uppercase font-bold border border-white/20 px-3 py-1 rounded-full">
                                            Trykk for å flytte hit
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                </div>
            )}

        </div>
    );
};
