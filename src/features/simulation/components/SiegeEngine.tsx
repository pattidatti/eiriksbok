import React, { useState } from 'react';
import type { SimulationPlayer, ActiveSiege } from '../simulationTypes';
import { GameButton } from '../ui/GameButton';
import { Shield, Sword, Heart, Scroll, Flame, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SiegeEngineProps {
    player: SimulationPlayer;
    siege: ActiveSiege;
    onAction: (action: any) => void;
}

export const SiegeEngine: React.FC<SiegeEngineProps> = ({ player, siege, onAction }) => {
    const isParticipant = (siege.attackers || {})[player.id] || (siege.defenders || {})[player.id];
    const isAttacker = !!(siege.attackers || {})[player.id];
    // Cast to any to access dynamic props not yet in strict Interface
    const s = siege as any;
    const gateHp = typeof s.gateHp === 'number' ? s.gateHp : 5000;
    const maxGateHp = s.maxGateHp || 5000;

    // State management
    const [clicks, setClicks] = useState<{ id: number, x: number, y: number }[]>([]);

    // Heartbeat for Usurper to drive the Siege Loop
    React.useEffect(() => {
        if (player.id === siege.throne?.usurperId && (siege.phase === 'THRONE_ROOM' || (siege.phase as any) === 'THRONE')) {
            const interval = setInterval(() => {
                const now = Date.now();
                const lastTick = siege.throne?.lastTick || 0;
                // Only dispatch if actual backend time needs update (>1s) to avoid spamming
                if (now - lastTick >= 1000) {
                    onAction({ type: 'SIEGE_ACTION', subType: 'TICK' });
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [siege.phase, siege.throne?.usurperId, siege.throne?.lastTick, player.id, onAction]);

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

    // Dynamic Background based on Phase
    const getBackground = () => {
        switch (siege.phase) {
            case 'BREACH': return "url('/siege/castle_gate.png')";
            case 'COURTYARD': return "url('/siege/courtyard.png')";
            case 'THRONE_ROOM':
            case 'THRONE' as any: return "url('/siege/throne_room.png')";
            default: return 'none';
        }
    };

    const isPlundered = siege.throne?.plundered;

    return (
        <div
            className="relative w-full min-h-[850px] mt-12 rounded-3xl overflow-hidden border-2 border-amber-900/50 shadow-2xl flex flex-col bg-cover bg-center transition-all duration-1000 group"
            style={{ backgroundImage: getBackground() }}
        >
            {/* Dark Gradient Overlay for Scene Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 z-0"></div>

            {/* MAIN CONTENT WRAPPER */}
            <div className="relative z-10 flex flex-col h-full justify-between p-8">

                {/* HEADER SECTION (HUD) */}
                <div className="flex justify-between items-start mb-8">
                    <div className="bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-xl flex flex-col gap-1">
                        <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">
                            {siege.phase === 'BREACH' ? 'Fase 1: Porten' :
                                siege.phase === 'COURTYARD' ? 'Fase 2: Borggården' :
                                    siege.phase === 'THRONE_ROOM' ? 'Fase 3: Tronsalen' : `DEBUG: ${siege.phase} `}
                        </span>
                        {/* REPLACED ICONS WITH CLEAR TEXT */}
                        <div className="flex items-center gap-4 text-white text-xs font-bold mt-1">
                            <div className="flex items-center gap-1 text-red-400">
                                <span>⚔️ ANGRIPERE:</span>
                                <span>{Object.keys(siege.attackers || {}).length}</span>
                            </div>
                            <div className="w-px h-4 bg-white/20"></div>
                            <div className="flex items-center gap-1 text-blue-400">
                                <span>🛡️ FORSVARERE:</span>
                                <span>{Object.keys(siege.defenders || {}).length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access / Close / Info could go here */}
                </div>

                {/* GAMEPLAY AREA (Spans most of the height) */}
                <div className="flex-1 flex flex-col justify-center">

                    {/* PHASE 1: THE GATE */}
                    {siege.phase === 'BREACH' && (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            {/* ... Gate Logic (Simplified for brevity, assuming existing logic fits in this container) ... */}
                            {/* Re-implementing specific Phase 1 visual logic here to fit new structure if needed, or keeping standard divs */}
                            <div className="relative w-full max-w-lg mx-auto h-96 cursor-alias group-hover:scale-105 transition-transform duration-500" onClick={handleAttack}>
                                {/* Gate Visual Re-used/Inline */}
                                <div className="absolute -top-12 left-0 right-0 h-4 bg-black/80 rounded-full border border-white/20 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-red-600 to-orange-500" style={{ width: `${(gateHp / maxGateHp) * 100}% ` }} />
                                </div>
                                <div className="absolute -top-16 w-full text-center font-black text-white drop-shadow-md text-2xl">{gateHp} HP</div>

                                {/* Gate Art */}
                                <div className="w-full h-full bg-stone-900 border-8 border-stone-800 rounded-t-full relative shadow-2xl flex items-center justify-center overflow-hidden">
                                    {/* Bars */}
                                    <div className="absolute inset-0 flex justify-evenly">
                                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-4 h-full bg-stone-800 shadow-inner"></div>)}
                                    </div>
                                    <Sword className="w-32 h-32 text-white/20 animate-pulse" />
                                </div>

                                {/* Click FX */}
                                <AnimatePresence>
                                    {clicks.map(click => (
                                        <motion.div key={click.id} initial={{ opacity: 1, scale: 0.5, y: 0 }} animate={{ opacity: 0, scale: 1.5, y: -50 }} exit={{ opacity: 0 }} className="absolute pointer-events-none text-6xl" style={{ left: click.x, top: click.y }}>💥</motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            <p className="text-white/70 text-center mt-8 text-lg font-bold animate-pulse">KNUS PORTEN!</p>
                        </div>
                    )}

                    {/* PHASE 2: COURTYARD */}
                    {siege.phase === 'COURTYARD' && (
                        <div className="w-full h-full bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden relative">
                            {/* Re-using existing lane logic but wrapped nicely */}
                            {/* BOSS */}
                            <div className="h-1/3 border-b border-white/10 relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-red-900/20"></div>
                                <div className="z-10 text-center">
                                    <h3 className="text-red-500 font-black text-xl uppercase mb-2">Garnisonssjefen</h3>
                                    <div className="w-96 h-6 bg-black rounded-full overflow-hidden border border-red-500/50 mx-auto">
                                        <div className="h-full bg-red-600" style={{ width: `${(s.bossHp / s.maxBossHp) * 100}% ` }} />
                                    </div>
                                    <div className="text-6xl mt-4 animate-bounce">👹</div>
                                </div>
                            </div>

                            {/* LANES */}
                            <div className="flex-1 flex">
                                {[0, 1, 2].map(lane => {
                                    const myParticipant = (siege.attackers || {})[player.id] || (siege.defenders || {})[player.id];
                                    const isMyLane = myParticipant?.lane === lane;
                                    const isTargeted = s.bossTargetLane === lane;
                                    const laneAttackers = Object.values(siege.attackers || {}).concat(Object.values(siege.defenders || {})).filter((p: any) => p.lane === lane);

                                    return (
                                        <div
                                            key={lane}
                                            onClick={() => onAction({ type: 'SIEGE_ACTION', subType: 'MOVE_LANE', payload: { lane } })}
                                            className={`flex - 1 border - r border - white / 10 relative cursor - pointer hover: bg - white / 5 transition - colors flex flex - col justify - end pb - 8 text - center
                                                ${isTargeted ? 'bg-red-900/30' : ''}
                                                ${isMyLane ? 'bg-indigo-900/30 ring-2 ring-indigo-500 inset-0' : ''}
                                            `}
                                        >
                                            <span className="text-white/20 font-black text-4xl uppercase mb-auto mt-8 block">{lane === 0 ? 'Venstre' : lane === 1 ? 'Senter' : 'Høyre'}</span>
                                            {isTargeted && <div className="text-red-500 font-black text-2xl animate-pulse absolute top-1/2 w-full text-center">FARE!</div>}

                                            {/* Players in Lane */}
                                            <div className="flex flex-wrap gap-2 justify-center mb-4 px-4 z-10">
                                                {laneAttackers.map((p: any) => (
                                                    <div
                                                        key={p.name}
                                                        className={`w - 8 h - 8 rounded - full border - 2 shadow - lg flex items - center justify - center text - xs transition - transform hover: scale - 110
                                                            ${p.name === player.name ? 'bg-indigo-500 border-white scale-110 z-20 ring-2 ring-indigo-400/50' : 'bg-slate-700 border-slate-500'}
                                                        `}
                                                        title={p.name}
                                                    >
                                                        {p.hp <= 0 ? '💀' : '👤'}
                                                    </div>
                                                ))}
                                            </div>

                                            {isMyLane && (
                                                <GameButton variant="primary" className="mx-auto" onClick={(e) => { e.stopPropagation(); onAction({ type: 'SIEGE_ACTION', subType: 'ATTACK_BOSS' }); }} icon={<Sword />}>ANGREP</GameButton>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* PHASE 3: THRONE ROOM */}
                    {(siege.phase === 'THRONE_ROOM' || (siege.phase as string) === 'THRONE') && (
                        <div className="flex flex-col gap-8">
                            {/* OCCUPATION HEADER */}
                            <div className="text-center mb-8">
                                <h2 className="text-5xl font-black text-amber-500 font-display drop-shadow-xl mb-2">TRONSALEN</h2>
                                <p className="text-slate-300 text-lg mb-6">{siege.throne?.usurperId ? <span className="text-amber-400 font-bold">{siege.throne.usurperName} styrer nå!</span> : "Tronen står tom..."}</p>

                                <div className="w-full max-w-2xl mx-auto h-16 bg-black/80 rounded-full border-4 border-amber-600/50 overflow-hidden relative shadow-2xl">
                                    <div className="h-full bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 transition-all duration-300" style={{ width: `${siege.throne?.occupation || 0}% ` }} />
                                    {/* TICK INDICATOR (Simple Pulse) */}
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 animate-pulse"></div>

                                    <div className="absolute inset-0 flex items-center justify-center font-black text-white text-xl tracking-widest drop-shadow-md">
                                        OKKUPASJON: {Math.floor(siege.throne?.occupation || 0)}%
                                    </div>
                                </div>
                                <p className="text-xs text-amber-500/50 mt-2 uppercase tracking-widest">Okkupasjon øker over tid så lenge tronen holdes</p>
                            </div>

                            {/* ACTION CARDS */}
                            <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
                                {isAttacker && !siege.throne?.usurperId && (
                                    <div
                                        className={`bg - black / 80 border - 4 rounded - 3xl p - 8 flex flex - col items - center text - center transition - all shadow - [0_0_30px_rgba(245, 158, 11, 0.2)]
                                            ${isPlundered ? 'border-slate-700 opacity-50 cursor-not-allowed' : 'border-amber-500 cursor-pointer hover:scale-105'}
                                        `}
                                        onClick={() => !isPlundered && onAction({ type: 'SIEGE_ACTION', subType: 'CLAIM_THRONE' })}
                                    >
                                        <div className="text-7xl mb-4">👑</div>
                                        <h3 className="text-3xl font-black text-white uppercase">Krev Tronen</h3>
                                        <p className="text-amber-500 font-bold mt-2">Kostnad: 1 Rustning / sek</p>
                                        <p className="text-slate-400 text-sm mt-4">
                                            {isPlundered ? "Skattekammeret er tomt. Ingen vits i å herske over ingenting." : "Start okkupasjonen. Rustning dreneres hvert sekund og når du tar skade."}
                                        </p>
                                    </div>
                                )}

                                {isAttacker && siege.throne?.usurperId === player.id && (
                                    <div className="bg-indigo-900/80 border-4 border-indigo-500 rounded-3xl p-8 flex flex-col items-center text-center animate-pulse shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                                        <div className="text-7xl mb-4">🛡️</div>
                                        <h3 className="text-3xl font-black text-white uppercase">Hold Posisjonen</h3>
                                        <div className="text-4xl font-black text-white my-2">{siege.throne?.usurperArmor || 0} <span className="text-sm font-bold text-indigo-300 align-middle">RUSTNING</span></div>
                                        <p className="text-indigo-300 font-bold mt-2">Du mister Rustning over tid!</p>
                                        <p className="text-indigo-200 text-sm mt-4">
                                            Okkupasjonen øker... Ikke gå tom for rustning!
                                        </p>
                                    </div>
                                )}

                                {isAttacker && siege.throne?.usurperId && siege.throne?.usurperId !== player.id && (
                                    <div
                                        className="bg-emerald-900/80 border-4 border-emerald-500 rounded-3xl p-8 flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => onAction({ type: 'SIEGE_ACTION', subType: 'DONATE_ARMOR' })}
                                    >
                                        <div className="text-7xl mb-4">🤝</div>
                                        <h3 className="text-3xl font-black text-white uppercase">Doner Rustning</h3>
                                        <p className="text-emerald-400 font-bold mt-2">Gi 1 Rustning til {siege.throne.usurperName}</p>
                                        <p className="text-slate-300 text-sm mt-4">Hjelp din allierte med å holde tronen lenger.</p>
                                    </div>
                                )}

                                {/* PLUNDER CARD - ALWAYS VISIBLE ALTERNATIVE IF NOT KING */}
                                {isAttacker && siege.throne?.usurperId !== player.id && (
                                    <div
                                        className={`bg - black / 80 border - 4 border - yellow - 600 rounded - 3xl p - 8 flex flex - col items - center text - center cursor - pointer hover: scale - 105 transition - transform
                                            ${isPlundered ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                        `}
                                        onClick={() => !isPlundered && onAction({ type: 'SIEGE_ACTION', subType: 'PLUNDER' })}
                                    >
                                        <div className="text-7xl mb-4">💰</div>
                                        <h3 className="text-3xl font-black text-white uppercase">Plyndre & Stikk</h3>
                                        <p className="text-yellow-500 font-bold mt-2">Gevinst: 500 Gull</p>
                                        <p className="text-slate-400 text-sm mt-4">
                                            {isPlundered ? "Allerede plyndret." : "Ta pengene og forlat beleiringen. Du gir opp retten til å kreve tronen."}
                                        </p>
                                    </div>
                                )}

                                {/* DEFENDER ACTION */}
                                {!isAttacker && (
                                    <div
                                        className="col-span-2 bg-red-900/80 border-4 border-red-600 rounded-3xl p-8 flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => onAction({ type: 'SIEGE_ACTION', subType: 'SUNDER_ARMOR' })}
                                    >
                                        <div className="text-7xl mb-4">⚔️</div>
                                        <h3 className="text-3xl font-black text-white uppercase">Knus Rustning</h3>
                                        <p className="text-red-300 font-bold mt-2">Angrip ursurpatoren direkte!</p>
                                        <p className="text-red-200 text-sm mt-4">Fjerner 1 Rustning fra den som sitter på tronen.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* BOTTOM: PERMANENT COMPACT WAR LOG */}
                <div className="mt-8 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                        <span className="text-amber-500 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                            <Scroll className="w-4 h-4" /> Krigsprotokollen
                        </span>
                        <div className="text-xs text-slate-400 italic">"Statistikken lyver aldri"</div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">

                        {/* DAMAGE */}
                        <div>
                            <div className="text-red-400 font-bold text-xs uppercase mb-1 flex items-center gap-1"><Sword className="w-3 h-3" /> Topp Skade</div>
                            {Object.values({ ...siege.attackers, ...siege.defenders }).sort((a, b) => (b.stats?.damageDealt || 0) - (a.stats?.damageDealt || 0)).slice(0, 3).map((p, i) => (
                                <div key={i} className="flex justify-between text-slate-300">
                                    <span>{i + 1}. {p.name}</span>
                                    <span className="font-mono text-white">{p.stats?.damageDealt || 0}</span>
                                </div>
                            ))}
                        </div>

                        {/* TANK */}
                        <div>
                            <div className="text-blue-400 font-bold text-xs uppercase mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Mest Juling</div>
                            {Object.values({ ...siege.attackers, ...siege.defenders }).sort((a, b) => (b.stats?.damageTaken || 0) - (a.stats?.damageTaken || 0)).slice(0, 3).map((p, i) => (
                                <div key={i} className="flex justify-between text-slate-300">
                                    <span>{i + 1}. {p.name}</span>
                                    <span className="font-mono text-white">{p.stats?.damageTaken || 0}</span>
                                </div>
                            ))}
                        </div>

                        {/* SUPPORT */}
                        <div>
                            <div className="text-emerald-400 font-bold text-xs uppercase mb-1 flex items-center gap-1"><Heart className="w-3 h-3" /> Bidragsytere</div>
                            {Object.values({ ...siege.attackers, ...siege.defenders }).sort((a, b) => (b.stats?.armorDonated || 0) - (a.stats?.armorDonated || 0)).slice(0, 3).map((p, i) => (
                                <div key={i} className="flex justify-between text-slate-300">
                                    <span>{i + 1}. {p.name}</span>
                                    <span className="font-mono text-white">{p.stats?.armorDonated || 0}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};
