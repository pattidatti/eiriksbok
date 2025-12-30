import React, { useState, useEffect, useRef } from 'react';
import type { SimulationPlayer, SimulationRoom, EquipmentItem } from './simulationTypes';
import { ITEM_TEMPLATES } from './constants';
import { animationManager } from './SimulationAnimations';

interface MinigameProps {
    type: 'WORK' | 'CHOP' | 'CRAFT' | 'MILL' | 'DEFEND' | 'EXPLORE' | 'MINE' | 'QUARRY' | 'PATROL' | 'FORAGE' | 'REFINE' | 'SMELT' | 'BAKE' | 'WEAVE' | 'MIX' | 'PLANT' | 'HARVEST';


    onComplete: (score: number) => void;
    onCancel: () => void;

    // Context
    playerUpgrades?: string[];
    equipment?: EquipmentItem[];
    skills?: any; // Record<SkillType, SkillData>

    // Optional presets
    selectedMethod?: string; // e.g., 'scythe' vs 'sickle'

    // Environmental
    currentSeason?: string;
    currentWeather?: string;
}

export const MINIGAME_VARIANTS: Record<string, { id: string, label: string, icon: string, desc: string }[]> = {
    WORK: [
        { id: 'sickle', label: 'Sigd', icon: '🌾', desc: 'Presisjons-høsting for høy kvalitet.' },
        { id: 'sweep', label: 'Ljå', icon: '🎋', desc: 'Rask innhøsting av store områder.' },
    ],
    CHOP: [
        { id: 'axe', label: 'Øks', icon: '🪓', desc: 'Fell trær med rå makt.' },
        { id: 'saw', label: 'Sag', icon: '🪚', desc: 'Presis kapping for planker.' },
    ],
    FORAGE: [
        { id: 'gather', label: 'Sanking', icon: '🍄', desc: 'Let etter mat og urter i skogen.' },
        { id: 'traps', label: 'Snarefangst', icon: '🕸️', desc: 'Sett feller for småvilt.' },
    ],
    MINE: [
        { id: 'pickaxe', label: 'Hakke', icon: '⛏️', desc: 'Hugg ut malm fra fjellet.' },
    ],
    QUARRY: [
        { id: 'chisel', label: 'Meisel', icon: '🔨', desc: 'Hugg ut steinblokker.' },
    ],
    CRAFT: [
        { id: 'hammer', label: 'Smiing', icon: '⚒️', desc: 'Form metallet på ambolten.' },
    ],
    MILL: [
        { id: 'grind', label: 'Kverning', icon: '⚙️', desc: 'Mal korn til mel.' },
    ],
    BAKE: [
        { id: 'oven', label: 'Steking', icon: '🔥', desc: 'Stek brød i ovnen.' },
    ],
    WEAVE: [
        { id: 'loom', label: 'Veving', icon: '🧶', desc: 'Vev tråd til stoffer.' },
    ],
    MIX: [
        { id: 'brew', label: 'Brygging', icon: '⚗️', desc: 'Bland urter til medisiner.' },
    ],
    SMELT: [
        { id: 'furnace', label: 'Smelting', icon: '🌋', desc: 'Smelt malm til barrer.' },
    ],
    PLANT: [
        { id: 'manual', label: 'Håndsåing', icon: '🌱', desc: 'Så frø for hånd.' },
    ]
};

const MinigameToolBadge: React.FC<{ item: EquipmentItem }> = ({ item }) => {
    const durabilityPct = (item.durability / item.maxDurability) * 100;
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="bg-slate-900/90 border border-white/10 rounded-full px-6 py-3 flex items-center gap-4 backdrop-blur-md shadow-2xl">
                <div className="text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{item.icon}</div>
                <div className="flex flex-col gap-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <div className={`w-2 h-2 rounded-full ${durabilityPct > 20 ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                        <span>Slitasje</span>
                        <span>{Math.round(durabilityPct)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getBestToolForAction = (type: string, equipment: (EquipmentItem | undefined | null)[]) => {
    if (!equipment) return undefined;
    return equipment.find(item => {
        if (!item) return false;
        const tid = Object.keys(ITEM_TEMPLATES).find(k => item.id === k || item.id.startsWith(k + '_'));
        const template = tid ? ITEM_TEMPLATES[tid] : null;
        return (template as any)?.relevantActions?.includes(type);
    });
};

/* --- PLANTING GAME --- */
const PlantingGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    const [seeds, setSeeds] = useState<{ x: number, y: number, id: number }[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const quota = 20;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isFinished) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newSeed = { x, y, id: Date.now() };

        animationManager.spawnParticles(x, y, 'bg-emerald-400');

        setSeeds(prev => {
            const next = [...prev, newSeed];
            if (next.length >= quota) {
                setIsFinished(true);
                setTimeout(() => onComplete(1.0), 1500);
            }
            return next;
        });
    };

    return (
        <div
            onClick={handleClick}
            className="w-full h-[600px] relative overflow-hidden cursor-crosshair group active:scale-[0.99] transition-transform select-none"
            style={{
                backgroundImage: 'url("/images/minigames/agriculture_bg.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />

            {/* Instructions */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none z-20 text-center">
                {!isFinished ? (
                    <>
                        <h2 className="text-3xl font-black text-white drop-shadow-md mb-2">Så dine frø</h2>
                        <div className="bg-black/40 px-4 py-1 rounded-full text-emerald-400 font-bold uppercase tracking-widest text-sm inline-block">
                            {seeds.length} / {quota}
                        </div>
                    </>
                ) : (
                    <div className="animate-in zoom-in duration-300">
                        <h2 className="text-5xl font-black text-emerald-400 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] uppercase tracking-tighter animate-bounce">
                            Mestrerlig Sådd! 🌱
                        </h2>
                    </div>
                )}
            </div>

            {/* Seeds */}
            {seeds.map((s) => (
                <div
                    key={s.id}
                    className="absolute w-4 h-4 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-in zoom-in duration-300"
                    style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-white/50" />
                </div>
            ))}

            {/* Cursor Hint */}
            <div className="absolute inset-0 pointer-events-none z-10 hidden group-hover:block">
                <div className="absolute w-8 h-8 border-2 border-white/50 rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>
        </div>
    );
};

/* --- HARVESTING MINIGAME (Rhythm Timing) --- */
const HarvestingGame: React.FC<{
    onComplete: (score: number) => void,
    equipment?: EquipmentItem[],
    isMining?: boolean,
    isQuarrying?: boolean,
    isForaging?: boolean,
    speedMultiplier?: number,
    possibleYield?: number,
    resourceName?: string
}> = ({ onComplete, equipment = [], isMining, isQuarrying, isForaging, speedMultiplier = 1.0, possibleYield = 10, resourceName = 'Ressurs' }) => {
    const [pointerPos, setPointerPos] = useState(0);
    const [strikes, setStrikes] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [shake, setShake] = useState(false);
    const dirRef = useRef(1);

    // Drifting Target Logic
    const [targetPos, setTargetPos] = useState(50);
    const targetDirRef = useRef(1);

    useEffect(() => {
        if (strikes.length >= 5 || isFinished) return;
        const interval = setInterval(() => {
            // Move pointer
            setPointerPos(prev => {
                let speed = 2 / speedMultiplier;
                let next = prev + (speed * dirRef.current);
                if (next > 100) { dirRef.current = -1; return 100; }
                if (next < 0) { dirRef.current = 1; return 0; }
                return next;
            });

            // Move Target (Drift)
            setTargetPos(prev => {
                const driftSpeed = 0.3; // Slower drift
                let next = prev + (driftSpeed * targetDirRef.current);

                // Randomly change direction sometimes to make it unpredictable
                if (Math.random() < 0.02) targetDirRef.current *= -1;

                if (next > 80) { targetDirRef.current = -1; return 80; }
                if (next < 20) { targetDirRef.current = 1; return 20; }
                return next;
            });

        }, 16);
        return () => clearInterval(interval);
    }, [strikes.length, isFinished]);

    const handleStrike = () => {
        if (strikes.length >= 5 || isFinished) return;

        // Calculate distance from dynamic target position instead of static 50
        const distance = Math.abs(pointerPos - targetPos);

        let score = distance < 5 ? 1.0 : distance < 15 ? 0.7 : distance < 25 ? 0.4 : 0.1;

        // Calculate yield for this hit
        const actionType = isMining ? 'MINE' : isQuarrying ? 'QUARRY' : isForaging ? 'FORAGE' : 'WORK';
        const bestTool = getBestToolForAction(actionType, equipment);
        const toolYieldBonus = bestTool?.stats?.yieldBonus || 0;

        const baseHitYield = Math.ceil((possibleYield / 5) * (0.5 + score));
        const toolHitBonus = Math.ceil((toolYieldBonus / 5) * (0.5 + score));

        if (distance < 5) {
            setShake(true);
            setTimeout(() => setShake(false), 200);
            animationManager.spawnParticles(50, 40, 'bg-amber-400');
            animationManager.spawnFloatingText(`PERFEKT! + ${baseHitYield} ${toolHitBonus > 0 ? `(+${toolHitBonus})` : ''} `, 50, 40, 'text-amber-400');
        } else {
            animationManager.spawnFloatingText(`${distance < 15 ? 'Bra!' : 'Ok...'} +${baseHitYield} ${toolHitBonus > 0 ? `(+${toolHitBonus})` : ''} `, 50, 40, 'text-slate-200');
        }

        const newStrikes = [...strikes, score];
        setStrikes(newStrikes);
        if (newStrikes.length === 5) {
            setIsFinished(true);
            setTimeout(() => onComplete(newStrikes.reduce((a, b) => a + b, 0) / 5), 2000);
        }
    };

    const bg = isMining || isQuarrying ? 'url("/images/minigames/mining_bg.png")' : isForaging ? 'url("/images/minigames/foraging_bg.png")' : 'url("/images/minigames/agriculture_bg.png")';

    return (
        <div className={`p-8 text-center min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden ${shake ? 'animate-shake' : ''} `} style={{ backgroundImage: bg, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/70 z-0" />
            <div className="relative z-10 w-full flex flex-col items-center">
                <h2 className="text-4xl font-black text-white mb-8 drop-shadow-lg tracking-tighter uppercase">{isMining ? 'Gruvedrift' : isQuarrying ? 'Steinhugger' : isForaging ? 'Sanking' : 'Kornhøsting'}</h2>
                {!isFinished ? (
                    <>
                        <div className="mb-4 text-xs font-black text-amber-500 uppercase tracking-widest">{resourceName}</div>
                        <div className="w-full h-8 bg-white/5 rounded-full mb-12 relative border border-white/10 overflow-hidden shadow-inner">
                            {/* Drifting Target Zone Visual */}
                            <div
                                className="absolute inset-y-0 bg-amber-500/30 border-x border-amber-500/50 transition-all duration-75 linear"
                                style={{
                                    left: `${targetPos - 8}%`, // Visual width approx 16%
                                    right: `${100 - (targetPos + 8)}%`
                                }}
                            />
                            {/* Center Marker of Target */}
                            <div
                                className="absolute inset-y-0 w-0.5 bg-amber-400/80 z-0"
                                style={{ left: `${targetPos}%` }}
                            />

                            {/* Player Cursor */}
                            <div className="absolute inset-y-0 w-1 bg-white shadow-[0_0_20px_white] z-10" style={{ left: `${pointerPos}% ` }} />
                        </div>
                        <button onClick={handleStrike} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-7 rounded-[2rem] font-black text-2xl shadow-2xl active:scale-95 transition-all uppercase tracking-widest border-b-4 border-amber-700">KLIKK NÅ! ⚡</button>
                    </>
                ) : (
                    <div className="py-12 animate-bounce text-5xl font-black text-amber-500 uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">FERDIG! ✨</div>
                )}
            </div>
        </div>
    );
};

/* --- TRAPPING GAME --- */
const TrappingGame: React.FC<{ onComplete: (score: number) => void, speedMultiplier?: number }> = ({ onComplete, speedMultiplier = 1.0 }) => {
    const [pos, setPos] = useState(0);
    const [captured, setCaptured] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [targetPos, setTargetPos] = useState(50);
    const [dir, setDir] = useState(1);

    useEffect(() => {
        if (isFinished) return;
        const interval = setInterval(() => {
            setPos(p => {
                let speed = 3 / speedMultiplier; // Slower is easier
                let next = p + (speed * dir);
                if (next > 100) { setDir(-1); return 100; }
                if (next < 0) { setDir(1); return 0; }
                return next;
            });
        }, 16);
        return () => clearInterval(interval);
    }, [dir, isFinished]);

    const handleCatch = () => {
        const dist = Math.abs(pos - targetPos);
        if (dist < 10) {
            setCaptured(c => {
                if (c + 1 >= 3) { setIsFinished(true); setTimeout(() => onComplete(1.0), 2000); }
                return c + 1;
            });
            setTargetPos(20 + Math.random() * 60);
        }
    };

    return (
        <div className="p-12 text-center min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden" style={{ backgroundImage: 'url("/images/minigames/foraging_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/70 z-0" />
            <h2 className="relative z-10 text-4xl font-black text-white mb-12 tracking-tighter uppercase italic">Snarefiske 🎣</h2>

            <div className="relative z-10 w-full max-w-sm h-12 bg-white/5 rounded-full border border-white/10 mb-12 shadow-inner">
                <div className="absolute inset-y-0 w-20 bg-amber-500/40 border-x-2 border-amber-500/50 rounded-lg blur-[2px]" style={{ left: `${targetPos}% `, transform: 'translateX(-50%)' }} />
                <div className="absolute inset-y-0 w-2 bg-white shadow-[0_0_15px_white]" style={{ left: `${pos}% ` }} />
            </div>

            <div className="relative z-10 flex gap-4 mb-12">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all ${captured > i ? 'bg-amber-500 border-amber-300 scale-110' : 'bg-white/5 border-white/10 opacity-30 shadow-inner'} `}>
                        🐟
                    </div>
                ))}
            </div>

            <button onClick={handleCatch} className="relative z-10 w-full max-w-md bg-sky-500 hover:bg-sky-400 text-white py-7 rounded-[2rem] font-black text-2xl shadow-2xl active:scale-95 transition-all uppercase tracking-widest border-b-4 border-sky-700">HAL INN! ⚓</button>
        </div>
    );
};

/* --- SCYTHE SWEEP VARIANT --- */
const ScytheSweepGame: React.FC<{
    onComplete: (score: number) => void,
    equipment?: EquipmentItem[],
    speedMultiplier?: number,
    possibleYield?: number,
    resourceName?: string
}> = ({ onComplete, equipment = [], speedMultiplier = 1.0, possibleYield = 10, resourceName = 'Korn' }) => {
    const [progress, setProgress] = useState(0);
    const [swings, setSwings] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const handleMove = () => {
        if (isFinished) return;
        setProgress(p => {
            const next = p + (2 * speedMultiplier); // Faster progress per pixel moved
            if (next >= 100) {
                const bestTool = getBestToolForAction('WORK', equipment);
                const toolYieldBonus = bestTool?.stats?.yieldBonus || 0;

                const baseHitYield = Math.ceil((possibleYield / 5) * 1.25);
                const toolHitBonus = Math.ceil((toolYieldBonus / 5) * 1.25);

                animationManager.spawnFloatingText(`+ ${baseHitYield} ${resourceName} ${toolHitBonus > 0 ? `(+${toolHitBonus})` : ''} `, 50, 40, 'text-amber-400');

                setSwings(s => {
                    if (s + 1 >= 5) { setIsFinished(true); setTimeout(() => onComplete(1.0), 2000); }
                    return s + 1;
                });
                return 0;
            }
            return next;
        });
    };

    return (
        <div onMouseMove={handleMove} className="p-8 text-center min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden" style={{ backgroundImage: 'url("/images/minigames/agriculture_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/50 z-0" />
            <div className="relative z-10 w-full flex flex-col items-center">
                <h2 className="text-3xl font-black text-white mb-4">Scythe Sweep</h2>
                <div className="w-full h-4 bg-white/10 rounded-full mb-8 border border-white/20 overflow-hidden">
                    <div className="h-full bg-amber-400 transition-all duration-75" style={{ width: `${progress}% ` }} />
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {[...Array(5)].map((_, i) => <div key={i} className={`w-8 h-8 rounded-lg border-2 ${swings > i ? 'bg-amber-500 border-amber-300' : 'border-white/20'} `} />)}
                </div>
            </div>
        </div>
    );
};

/* --- WOODCUTTING GAME --- */
const WoodcuttingGame: React.FC<{
    onComplete: (score: number) => void,
    equipment?: EquipmentItem[],
    speedMultiplier?: number,
    possibleYield?: number,
    resourceName?: string
}> = ({ onComplete, equipment = [], speedMultiplier: _speedMultiplier = 1.0, possibleYield = 5, resourceName = 'Ved' }) => {
    const [target, setTarget] = useState({ x: 50, y: 50 });
    const [hits, setHits] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const spawn = () => setTarget({ x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 });

    const handleHit = () => {
        const bestTool = getBestToolForAction('CHOP', equipment);
        const toolYieldBonus = bestTool?.stats?.yieldBonus || 0;

        const baseHitYield = Math.ceil((possibleYield / 10) * 1.5);
        const toolHitBonus = Math.ceil((toolYieldBonus / 10) * 1.5);

        animationManager.spawnFloatingText(`+ ${baseHitYield} ${resourceName} ${toolHitBonus > 0 ? `(+${toolHitBonus})` : ''} `, 50, 40, 'text-amber-400');
        animationManager.spawnParticles(50, 40, 'bg-amber-400');

        setHits(h => {
            if (h + 1 >= 10) { setIsFinished(true); setTimeout(() => onComplete(1.0), 2000); }
            return h + 1;
        });
        spawn();
    };

    return (
        <div className="p-8 text-center min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden" style={{ backgroundImage: 'url("/images/minigames/forestry_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/60 z-0" />

            <div className="relative z-10 w-full mb-8">
                <h2 className="text-4xl font-black text-white drop-shadow-lg tracking-tighter uppercase">Tømmerhogging</h2>
                <div className="text-amber-400 font-bold uppercase tracking-widest text-xs mt-2 px-4 py-1 bg-black/40 rounded-full inline-block">Hugg på merkene! ({hits}/10)</div>
            </div>

            <div className="relative z-10 w-full h-96 bg-white/5 rounded-[3rem] border border-white/10 shadow-inner overflow-hidden">
                {!isFinished ? (
                    <button
                        onClick={handleHit}
                        className="absolute w-20 h-20 bg-rose-500 rounded-full border-4 border-white shadow-[0_0_30px_rose] animate-pulse transition-all active:scale-90"
                        style={{ left: `${target.x}% `, top: `${target.y}% `, transform: 'translate(-50%, -50%)' }}
                    >
                        🪓
                    </button>
                ) : (
                    <div className="flex items-center justify-center h-full animate-bounce text-5xl font-black text-amber-500 uppercase tracking-tighter">VEDHOGST FERDIG! 🪵</div>
                )}
            </div>
        </div>
    );
};

/* --- SAWING VARIANT --- */
const SawingGame: React.FC<{ onComplete: (score: number) => void, speedMultiplier?: number }> = ({ onComplete, speedMultiplier = 1.0 }) => {
    const [pos, setPos] = useState(50);
    const [isFinished, setIsFinished] = useState(false);
    return <div onClick={() => { setIsFinished(true); onComplete(1.0); }} className="p-12 text-center text-white">Sawing Placeholder</div>;
};

/* --- CRAFTING GAME (Hammering) --- */
const CraftingGame: React.FC<{ onComplete: (score: number) => void, speedMultiplier?: number }> = ({ onComplete, speedMultiplier = 1.0 }) => {
    const [targetPos, setTargetPos] = useState(50);
    const [cursorPos, setCursorPos] = useState(50);
    const [hits, setHits] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const targetDir = useRef(1);

    useEffect(() => {
        if (isFinished) return;
        const interval = setInterval(() => {
            setTargetPos(p => {
                let next = p + (0.8 * targetDir.current * speedMultiplier);
                if (next > 90) { targetDir.current = -1; return 90; }
                if (next < 10) { targetDir.current = 1; return 10; }
                return next;
            });
        }, 16);
        return () => clearInterval(interval);
    }, [isFinished, speedMultiplier]);

    const handleHit = () => {
        const dist = Math.abs(cursorPos - targetPos);
        if (dist < 15) {
            setHits(h => {
                if (h + 1 >= 5) { setIsFinished(true); setTimeout(() => onComplete(1.0), 1500); }
                return h + 1;
            });
            animationManager.spawnParticles(50, 50, 'bg-amber-400');
            animationManager.spawnFloatingText("KLANG!", 50, 40, 'text-amber-500');
        }
    };

    return (
        <div onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setCursorPos(((e.clientX - rect.left) / rect.width) * 100);
        }} onClick={handleHit} className="p-12 min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden cursor-pointer" style={{ backgroundImage: 'url("/images/minigames/smithing_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/60 z-0" />
            <h2 className="relative z-10 text-4xl font-black text-white mb-8">SMIMESTER</h2>

            {!isFinished ? (
                <div className="relative z-10 w-full max-w-lg h-16 bg-white/10 rounded-full border-2 border-white/20 overflow-hidden">
                    <div className="absolute inset-y-0 w-20 bg-amber-500/50 blur-md transition-all duration-75" style={{ left: `${targetPos}%`, transform: 'translateX(-50%)' }} />
                    <div className="absolute inset-y-0 w-2 bg-white" style={{ left: `${cursorPos}%` }} />
                </div>
            ) : (
                <div className="text-5xl font-black text-amber-500 animate-bounce relative z-10">FERDIG! ⚔️</div>
            )}
        </div>
    );
};

/* --- MILLING GAME --- */
const MillingGame: React.FC<{ onComplete: (score: number) => void, speedMultiplier?: number }> = ({ onComplete, speedMultiplier = 1.0 }) => {
    return <div onClick={() => onComplete(1.0)} className="text-white p-10 cursor-pointer">Kverning Placeholder (Klikk)</div>;
};

/* --- SMELTING GAME --- */
const SmeltingGame: React.FC<{ onComplete: (score: number) => void, speedMultiplier?: number }> = ({ onComplete, speedMultiplier = 1.0 }) => {
    return <div onClick={() => onComplete(1.0)} className="text-white p-10 cursor-pointer">Smelting Placeholder (Klikk)</div>;
};

/* --- BAKING GAME (Heat Management) --- */
const BakingGame: React.FC<{ onComplete: (score: number) => void, speedMultiplier?: number }> = ({ onComplete, speedMultiplier = 1.0 }) => {
    const [progress, setProgress] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [batch, setBatch] = useState(0);

    // Dynamic Sweet Spot
    const [targetCenter, setTargetCenter] = useState(80); // Center of the sweet spot
    const targetDir = useRef(-1);

    useEffect(() => {
        if (isFinished || feedback) return;

        // Progress fill
        const fillInterval = setInterval(() => {
            setProgress(p => {
                const next = p + (1.0 * speedMultiplier); // Slightly slower base fill to compensate for moving target difficulty
                if (next >= 100) {
                    setFeedback('BRENT! 🔥');
                    setTimeout(() => { setFeedback(null); setProgress(0); }, 1000);
                    return 0;
                }
                return next;
            });
        }, 50);

        // Move Sweet Spot (Wandering Heat Zone)
        const moveInterval = setInterval(() => {
            setTargetCenter(prev => {
                const speed = 0.8; // Movement speed of the zone
                let next = prev + (speed * targetDir.current);

                // Keep zone within reasonable bounds so it's obtainable (e.g., 40% to 90%)
                if (next > 90) {
                    targetDir.current = -1;
                    return 90;
                }
                if (next < 40) {
                    targetDir.current = 1;
                    return 40;
                }
                return next;
            });
        }, 50);

        return () => {
            clearInterval(fillInterval);
            clearInterval(moveInterval);
        };
    }, [isFinished, feedback, speedMultiplier]);

    const pullOut = () => {
        if (isFinished || feedback) return;

        // Calculate dynamic bounds based on targetCenter
        // Sweet spot width is approx 20% ( +/- 10%)
        const zoneStart = targetCenter - 10;
        const zoneEnd = targetCenter + 10;

        if (progress > zoneStart && progress < zoneEnd) {
            setFeedback('PERFEKT GYLLEN! ✨');
            setBatch(b => {
                const next = b + 1;
                if (next >= 3) {
                    setIsFinished(true);
                    setTimeout(() => onComplete(1.0), 1000);
                }
                return next;
            });
        } else if (progress < zoneStart) {
            setFeedback('RÅ... 🥖');
        } else {
            setFeedback('LITT BRENT... 🥯');
        }
        setTimeout(() => { setFeedback(null); setProgress(0); }, 1000);
    };

    return (
        <div className="p-12 text-center min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden"
            style={{ backgroundImage: 'url("/images/minigames/bakery_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/70 z-0" />
            <h2 className="relative z-10 text-4xl font-black text-white mb-8 tracking-tighter uppercase italic">Bakeri: Steking 🍞</h2>

            <div className="relative z-10 w-64 h-64 bg-slate-900 border-8 border-amber-900 rounded-3xl flex items-center justify-center overflow-hidden mb-12 shadow-2xl">
                <div className="absolute inset-0 bg-orange-500/10 animate-pulse" />
                <div className="text-8xl transition-all duration-300 transform"
                    style={{
                        filter: `grayscale(${100 - progress}%) sepia(${progress}%)`,
                        transform: `scale(${0.8 + (progress / 500)})`
                    }}>
                    🥖
                </div>
                {feedback && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-2xl p-4 animate-in zoom-in">
                        {feedback}
                    </div>
                )}
            </div>

            {/* Dynamic Progress Bar */}
            <div className="relative z-10 w-full max-w-sm h-8 bg-white/10 rounded-full mb-12 border border-white/10 overflow-hidden">
                {/* Moving Sweet Spot Visual */}
                <div
                    className="absolute inset-y-0 bg-emerald-500/30 border-x border-emerald-500/50 transition-all duration-75 ease-linear"
                    style={{
                        left: `${targetCenter - 10}%`,
                        right: `${100 - (targetCenter + 10)}%`
                    }}
                />

                {/* Progress Fill */}
                <div className="h-full bg-orange-500 transition-all duration-75 relative z-10 opacity-80" style={{ width: `${progress}% ` }} />

                {/* Target Marker Icon (optional helpful visual) */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-white/50 z-20"
                    style={{ left: `${targetCenter}%` }}
                />
            </div>

            <div className="relative z-10 flex gap-4 mb-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 transition-all ${batch > i ? 'bg-amber-500 border-amber-300 scale-110 shadow-lg' : 'bg-white/5 border-white/10 opacity-30'} `}>
                        🥖
                    </div>
                ))}
            </div>

            <button onClick={pullOut} className="relative z-10 w-full max-w-sm bg-amber-600 hover:bg-amber-500 text-white py-6 rounded-2xl font-black text-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest border-b-8 border-amber-800">
                TA UT NÅ! 🧤
            </button>
        </div>
    );
};

/* --- WEAVING GAME (Shuttle Rhythm) --- */
const WeavingGame: React.FC<{ onComplete: (score: number) => void, speedMultiplier?: number }> = ({ onComplete, speedMultiplier = 1.0 }) => {
    const [lastSide, setLastSide] = useState<'left' | 'right'>('right');
    const [progress, setProgress] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleKey = (side: 'left' | 'right') => {
        if (isFinished) return;
        if (side !== lastSide) {
            setLastSide(side);
            setProgress(p => {
                const next = p + (5 * speedMultiplier);
                if (next >= 100) {
                    setIsFinished(true);
                    setTimeout(() => onComplete(1.0), 1000);
                    return 100;
                }
                return next;
            });
            setFeedback(side === 'left' ? '⬅️' : '➡️');
            setTimeout(() => setFeedback(null), 200);
        }
    };

    useEffect(() => {
        const handleDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') handleKey('left');
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') handleKey('right');
        };
        window.addEventListener('keydown', handleDown);
        return () => window.removeEventListener('keydown', handleDown);
    }, [lastSide, isFinished]);

    return (
        <div className="p-12 text-center min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden"
            style={{ backgroundImage: 'url("/images/minigames/weavery_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/70 z-0" />
            <h2 className="relative z-10 text-4xl font-black text-white mb-8 tracking-tighter uppercase italic">Veveri: Vevstol 🧶</h2>

            <div className="relative z-10 w-full max-w-lg aspect-video bg-slate-900/50 border-4 border-white/10 rounded-3xl p-8 mb-12 flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-center mb-8 relative h-32">
                    <div className={`text-6xl transition-all duration-300 ${lastSide === 'left' ? 'translate-x-0' : 'translate-x-64 opacity-20'} `}>🧵</div>
                    <div className="absolute inset-x-0 h-1 bg-white/20 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className={`text-6xl transition-all duration-300 ${lastSide === 'right' ? 'translate-x-0' : '-translate-x-64 opacity-20'} `}>🧵</div>
                </div>

                <div className="text-sm font-black text-indigo-300 uppercase tracking-[0.3em] h-8">
                    {feedback || 'Veksle mellom Venstre / Høyre'}
                </div>
            </div>

            <div className="relative z-10 flex gap-4 mb-8">
                <button onClick={() => handleKey('left')} className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl border-4 transition-all ${lastSide === 'right' ? 'bg-indigo-600 border-indigo-400 scale-110 shadow-lg' : 'bg-white/5 border-white/10 opacity-30 shadow-inner'} `}>
                    ⬅️
                </button>
                <button onClick={() => handleKey('right')} className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl border-4 transition-all ${lastSide === 'left' ? 'bg-indigo-600 border-indigo-400 scale-110 shadow-lg' : 'bg-white/5 border-white/10 opacity-30 shadow-inner'} `}>
                    ➡️
                </button>
            </div>

            <div className="relative z-10 w-full max-w-sm h-4 bg-white/10 rounded-full border border-white/10 overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}% ` }} />
            </div>
        </div>
    );
};

/* --- APOTHECARY GAME (Mixing Sequence) --- */
const ApothecaryGame: React.FC<{ onComplete: (score: number) => void, speedMultiplier?: number }> = ({ onComplete, speedMultiplier: _speedMultiplier = 1.0 }) => {
    const [sequence, setSequence] = useState<string[]>([]);
    const [_playerSeq, setPlayerSeq] = useState<string[]>([]);
    const [step, setStep] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const ingredients = [
        { id: 'red', icon: '🔴', label: 'Rødurt' },
        { id: 'blue', icon: '🔵', label: 'Blåbær' },
        { id: 'green', icon: '🟢', label: 'Grønnmose' },
        { id: 'yellow', icon: '🟡', label: 'Gulrot' }
    ];

    useEffect(() => {
        const newSeq = [];
        for (let i = 0; i < 5; i++) {
            newSeq.push(ingredients[Math.floor(Math.random() * ingredients.length)].id);
        }
        setSequence(newSeq);
    }, []);

    const handleMix = (id: string) => {
        if (isFinished || feedback) return;

        if (id === sequence[step]) {
            const nextStep = step + 1;
            setPlayerSeq(p => [...p, id]);
            setStep(nextStep);
            setFeedback('RIKTIG! ✨');
            setTimeout(() => setFeedback(null), 500);

            if (nextStep >= sequence.length) {
                setIsFinished(true);
                setTimeout(() => onComplete(1.0), 1000);
            }
        } else {
            setFeedback('FEIL... 💥');
            setStep(0);
            setPlayerSeq([]);
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    return (
        <div className="p-12 text-center min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden"
            style={{ backgroundImage: 'url("/images/minigames/apothecary_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/70 z-0" />
            <h2 className="relative z-10 text-4xl font-black text-white mb-8 tracking-tighter uppercase italic">Apoteker: Brygging 🌿</h2>

            <div className="relative z-10 mb-12 flex gap-4 h-24 items-center">
                {sequence.map((id, i) => (
                    <div key={i} className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all border-2 border-white/10 ${step > i ? 'opacity-10 scale-90' : 'bg-black/40 scale-100'} `}>
                        {ingredients.find(ing => ing.id === id)?.icon}
                    </div>
                ))}
            </div>

            {feedback && (
                <div className={`relative z-10 text-3xl font-black mb-8 animate-in zoom-in ${feedback.includes('FEIL') ? 'text-rose-500' : 'text-emerald-400'} `}>
                    {feedback}
                </div>
            )}

            <div className="relative z-10 grid grid-cols-2 gap-6 w-full max-w-sm">
                {ingredients.map(ing => (
                    <button
                        key={ing.id}
                        onClick={() => handleMix(ing.id)}
                        className="p-6 bg-slate-900 border-2 border-white/10 rounded-3xl flex flex-col items-center gap-2 hover:bg-slate-800 hover:border-indigo-500/50 transition-all active:scale-95 shadow-xl group"
                    >
                        <span className="text-4xl group-hover:scale-110 transition-transform">{ing.icon}</span>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{ing.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const CombatGame: React.FC<{ onComplete: (score: number) => void, isKnight?: boolean }> = ({ onComplete }) => {
    return <div onClick={() => onComplete(0.5)} className="p-12 text-center font-black text-2xl text-red-600 cursor-pointer">Combat Game placeholder (Click)</div>;
};

const QuestGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    return <div onClick={() => onComplete(0.5)} className="p-12 text-center font-black text-2xl text-indigo-600 cursor-pointer">Quest Game placeholder (Click)</div>;
};

const PatrolMinigameRouter: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    return <div onClick={() => onComplete(0.5)} className="p-12 text-center font-black text-2xl cursor-pointer">Patrol Router placeholder (Click)</div>;
};

export const MinigameOverlay: React.FC<MinigameProps> = ({ type, onComplete, onCancel, playerUpgrades, equipment = [], skills, selectedMethod, currentSeason = 'Spring', currentWeather = 'Clear' }) => {
    const [method, setMethod] = useState<string | null>(selectedMethod || null);

    const currentMethods = MINIGAME_VARIANTS[type] || [];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent scrolling keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) {
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKeyDown, { capture: false });
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (selectedMethod) {
            setMethod(selectedMethod);
        } else if (currentMethods.length === 1 && !method) {
            setMethod(currentMethods[0].id);
        }
    }, [type, selectedMethod]);

    const getSelectionBackground = () => {
        switch (type) {
            case 'WORK': return '/images/minigames/agriculture_bg.png';
            case 'PLANT': return '/images/minigames/agriculture_bg.png';
            case 'CHOP': return '/images/minigames/forestry_bg.png';
            case 'MINE':
            case 'QUARRY': return '/images/minigames/mining_bg.png';
            case 'CRAFT': return '/images/minigames/smithing_bg.png';
            case 'FORAGE': return '/images/minigames/foraging_bg.png';
            default: return '/images/minigames/quest_bg.png';
        }
    };

    // Calculate speed bonus from relevant equipment
    const actionEquipment = equipment.filter(_item => true);
    // Simplified check: if it's a tool/weapon relevant to the action, use its stats
    // For now use raw stats from whatever is passed
    const speedMultiplier = actionEquipment.reduce((acc, item) => acc * (item?.stats?.speedBonus || 1.0), 1.0);

    const possibleYield = useMemo(() => {
        let base = 10;
        let skillType: SkillType = 'FARMING';
        let isRefining = false;

        if (type === 'CHOP') { base = 5; skillType = 'WOODCUTTING'; }
        if (type === 'MINE') { base = 5; skillType = 'MINING'; }
        if (type === 'QUARRY') { base = 8; skillType = 'MINING'; }
        if (type === 'FORAGE') { base = 1; skillType = 'FARMING'; }
        if (type === 'PLANT') { base = 0; skillType = 'FARMING'; } // PLANT yields no immediate item
        if (type === 'REFINE' || type === 'BAKE' || type === 'SMELT' || type === 'MILL' || type === 'WEAVE') {
            base = 1; // Generic base, though specific recipes vary, this shows the modifier effect
            skillType = 'CRAFTING';
            isRefining = true;
        }

        const seasonData = SEASONS[currentSeason as keyof typeof SEASONS] as any;
        const weatherData = WEATHER[currentWeather as keyof typeof WEATHER] as any;

        return calculateYield(
            { skills, equipment: equipment as any },
            base,
            skillType,
            {
                season: seasonData?.yieldMod,
                weather: weatherData?.yieldMod,
                isRefining
            }
        );
    }, [type, skills, equipment, currentSeason, currentWeather]);

    const resourceNameMap: Record<string, string> = {
        WORK: 'Korn', CHOP: 'Ved', MINE: 'Malm', QUARRY: 'Stein', FORAGE: 'Brød', REFINE: 'Produkt', PLANT: 'Frø satt', HARVEST: 'Avling'
    };


    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-[3rem] shadow-[0_50px_120px_rgba(0,0,0,0.9)] w-full max-w-5xl overflow-hidden relative border-2 border-white/10">
                <button onClick={onCancel} className="absolute top-6 right-6 text-white/50 hover:text-white z-20 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all">✕</button>

                {!method ? (
                    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500 overflow-hidden">
                        {/* Background with overlay */}
                        <div className="absolute inset-0 z-0">
                            <img src={getSelectionBackground()} className="w-full h-full object-cover grayscale-[0.5] opacity-30" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                        </div>

                        <div className="relative z-10 w-full max-w-2xl">
                            <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-4">Velg utførelse</h2>
                            <h3 className="text-5xl font-black text-white mb-6 tracking-tighter uppercase">{type}</h3>

                            {/* COMPACT TOOL & COST AREA */}
                            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                                {(() => {
                                    const bestTool = getBestToolForAction(type, equipment);
                                    if (bestTool) {
                                        const durabilityPct = (bestTool.durability / bestTool.maxDurability) * 100;
                                        return (
                                            <div className="flex items-center gap-4 bg-slate-800/80 border-2 border-indigo-500/30 px-6 py-4 rounded-3xl backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] group hover:border-indigo-400 transition-all animate-shimmer tool-glow">
                                                <div className="text-4xl group-hover:scale-110 group-hover:rotate-3 transition-transform drop-shadow-[0_0_10px_rgba(79,70,229,0.5)]">{bestTool.icon}</div>
                                                <div className="text-left">
                                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">{bestTool.name}</div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-24 h-2 bg-black/60 rounded-full overflow-hidden p-[1px] border border-white/10 shadow-inner">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${durabilityPct > 50 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : durabilityPct > 20 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'} `}
                                                                style={{ width: `${durabilityPct}% ` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-500 uppercase">{Math.round(durabilityPct)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="bg-slate-800/40 border border-white/5 px-6 py-3 rounded-2xl backdrop-blur-md text-[11px] font-bold text-slate-400 italic">
                                            Ingen verktøy utrustet
                                        </div>
                                    );
                                })()}

                                {(() => {
                                    const costLabel = getActionCostString(type, currentSeason, currentWeather);
                                    if (costLabel) {
                                        return (
                                            <div className="flex items-center gap-3 px-6 py-3 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-md">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kostnad</span>
                                                <span className="text-lg font-black text-amber-400 font-mono tracking-tight">{costLabel}</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>

                            <div className="grid grid-cols-1 gap-4 w-full">
                                {currentMethods.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMethod(m.id)}
                                        className="group flex items-center gap-6 p-6 bg-white/5 hover:bg-white/10 rounded-[2rem] text-left transition-all active:scale-[0.98] border border-white/5 hover:border-amber-500/50 shadow-xl"
                                    >
                                        <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center text-5xl group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                                            {m.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-black text-2xl text-white group-hover:text-amber-400 transition-colors">{m.label}</div>
                                            <div className="text-sm text-slate-400 font-medium">{m.desc}</div>
                                        </div>
                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:translate-x-2 transition-transform opacity-30 group-hover:opacity-100">
                                            <span className="text-white text-xl">→</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* PROGRESSION FOOTER */}
                            {(() => {
                                const bestTool = getBestToolForAction(type, equipment);
                                const currentId = bestTool ? (Object.keys(ITEM_TEMPLATES).find(k => bestTool.id === k || bestTool.id.startsWith(k + '_'))) : (type === 'CHOP' ? 'rusty_axe' : null);
                                const nextId = (ITEM_TEMPLATES[currentId as any] as any)?.nextTierId;
                                const nextTemplate = nextId ? ITEM_TEMPLATES[nextId] : null;

                                if (nextTemplate) {
                                    return (
                                        <div className="mt-12 pt-8 border-t border-white/5 w-full flex flex-col gap-4">
                                            <div className="flex items-center justify-between max-w-xl mx-auto w-full px-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Mesterlig Progresjon</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Oppgradering i Smia</span>
                                                </div>
                                            </div>

                                            <div className="bg-slate-950/60 border border-white/10 rounded-[2.5rem] p-6 flex items-center justify-between group max-w-xl mx-auto w-full relative overflow-hidden backdrop-blur-sm shadow-2xl">
                                                {/* Ambient Shimmer */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                                {/* Current Tool Preview */}
                                                <div className="flex flex-col items-center gap-2 z-10 opacity-40">
                                                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-3xl border border-white/10">
                                                        {bestTool?.icon || '❓'}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nå</span>
                                                </div>

                                                {/* Animated Transition Path */}
                                                <div className="flex flex-col items-center gap-2 flex-1">
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500/20 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                                                        ))}
                                                        <ArrowRight className="w-6 h-6 text-indigo-500/40 mx-4 group-hover:translate-x-2 transition-transform" />
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500/20 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                                                        ))}
                                                    </div>
                                                    {nextTemplate.stats?.yieldBonus && (
                                                        <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                                                            <span className="text-[10px] font-black text-emerald-400 uppercase">+{nextTemplate.stats.yieldBonus} Utbytte</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Recommended Tool Preview */}
                                                <div className="flex flex-col items-center gap-2 z-10 animate-shimmer">
                                                    <div className="relative">
                                                        <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center text-5xl border-2 border-indigo-500/40 shadow-[0_0_30px_rgba(79,70,229,0.3)] group-hover:scale-110 transition-transform duration-500 upgrade-glow">
                                                            {nextTemplate.icon}
                                                        </div>
                                                        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-500 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                                                    </div>
                                                    <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">{nextTemplate.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    </div>
                ) : (
                    (() => {
                        switch (type) {
                            case 'WORK':
                                if (method === 'sweep') return <ScytheSweepGame onComplete={onComplete} equipment={equipment} speedMultiplier={speedMultiplier} possibleYield={possibleYield} resourceName={resourceNameMap[type]} />;
                                return <HarvestingGame onComplete={onComplete} equipment={equipment} speedMultiplier={speedMultiplier} possibleYield={possibleYield} resourceName={resourceNameMap[type]} />;
                            case 'HARVEST': // New case sharing Harvest logic
                                return <HarvestingGame onComplete={onComplete} equipment={equipment} speedMultiplier={speedMultiplier} possibleYield={possibleYield} resourceName={resourceNameMap.HARVEST} />;
                            case 'MINE':
                                return <HarvestingGame onComplete={onComplete} equipment={equipment} isMining speedMultiplier={speedMultiplier} possibleYield={possibleYield} resourceName={resourceNameMap[type]} />;
                            case 'QUARRY':
                                return <HarvestingGame onComplete={onComplete} equipment={equipment} isQuarrying speedMultiplier={speedMultiplier} possibleYield={possibleYield} resourceName={resourceNameMap[type]} />;
                            case 'FORAGE':
                                if (method === 'traps') return <TrappingGame onComplete={onComplete} speedMultiplier={speedMultiplier} />;
                                return <HarvestingGame onComplete={onComplete} equipment={equipment} isForaging speedMultiplier={speedMultiplier} possibleYield={possibleYield} resourceName={resourceNameMap[type]} />;
                            case 'CHOP':
                                if (method === 'saw') return <SawingGame onComplete={onComplete} speedMultiplier={speedMultiplier} />;
                                return <WoodcuttingGame onComplete={onComplete} equipment={equipment} speedMultiplier={speedMultiplier} possibleYield={possibleYield} resourceName={resourceNameMap[type]} />;
                            case 'CRAFT':
                            case 'REFINE':
                                return <CraftingGame onComplete={onComplete} speedMultiplier={speedMultiplier} />;
                            case 'MILL':
                                return <MillingGame onComplete={onComplete} speedMultiplier={speedMultiplier} />;
                            case 'DEFEND':
                                return <CombatGame onComplete={onComplete} isKnight={playerUpgrades?.includes('warhorse')} />;
                            case 'PATROL':
                                return <PatrolMinigameRouter onComplete={onComplete} />;
                            case 'EXPLORE':
                                return <QuestGame onComplete={onComplete} />;
                            case 'SMELT':
                                return <SmeltingGame onComplete={onComplete} speedMultiplier={speedMultiplier} />;
                            case 'BAKE':
                                return <BakingGame onComplete={onComplete} speedMultiplier={speedMultiplier} />;
                            case 'WEAVE':
                                return <WeavingGame onComplete={onComplete} speedMultiplier={speedMultiplier} />;
                            case 'MIX':
                                return <ApothecaryGame onComplete={onComplete} speedMultiplier={speedMultiplier} />;
                            case 'PLANT': // New Case for Planting
                                return <PlantingGame onComplete={onComplete} />;
                            default:
                                return <div className="text-white">Ukjent minispill-type: {type}</div>;
                        }
                    })()
                )}

            </div>
            {/* --- SHARED TOOL HUD --- */}
            {equipment && getBestToolForAction(type, equipment) && (
                <MinigameToolBadge item={getBestToolForAction(type, equipment)!} />
            )}
            <MinigameStyles />
        </div>
    );
};

const MinigameStyles: React.FC = () => {
    return (
        <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes strike {
                0% { transform: scale(1); opacity: 0.5; }
                50% { transform: scale(1.5); opacity: 1; }
                100% { transform: scale(1); opacity: 0.5; }
            }
            .animate-strike {
                animation: strike 0.3s ease-out;
            }
            @keyframes fly-item {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                20% { opacity: 1; scale: 1.2; }
                100% { transform: translate(-50%, -150px) scale(0.5); opacity: 0; }
            }
            .animate-fly-item {
                animation: fly-item 1s ease-out forwards;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            .animate-shake {
                animation: shake 0.1s ease-in-out infinite;
            }
            @keyframes success-pop {
                0% { transform: scale(0.8); opacity: 0; }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); opacity: 1; }
            }
            .animate-success-pop {
                animation: success-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
        `}} />
    );
};
