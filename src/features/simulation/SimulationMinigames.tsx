import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getActionCostString } from './utils/actionUtils';
import { SEASONS, WEATHER } from './constants';
import type { EquipmentItem } from './simulationTypes';

interface MinigameProps {
    type: 'WORK' | 'CHOP' | 'CRAFT' | 'MILL' | 'DEFEND' | 'EXPLORE' | 'MINE' | 'QUARRY' | 'PATROL' | 'FORAGE' | 'REFINE';


    onComplete: (score: number) => void;
    onCancel: () => void;
    playerUpgrades?: string[];
    equipment?: EquipmentItem[];
    skills?: Record<string, { level: number }>;
    selectedMethod?: string; // New prop to skip selection
    currentSeason?: keyof typeof SEASONS;
    currentWeather?: keyof typeof WEATHER;
}

export const MINIGAME_VARIANTS: Record<string, { id: string, label: string, icon: string, desc: string }[]> = {
    WORK: [
        { id: 'rhythm', label: 'Rytme', icon: '🌾', desc: 'Trykk i takt med svingene.' },
        { id: 'sweep', label: 'Feiing', icon: '🧹', desc: 'Følg sirkelen med musa.' }
    ],
    MINE: [
        { id: 'rhythm', label: 'Rytme', icon: '⛏️', desc: 'Sikt deg inn på de rike årene.' }
    ],
    QUARRY: [
        { id: 'rhythm', label: 'Rytme', icon: '🪨', desc: 'Presisjonshugging.' }
    ],
    CHOP: [
        { id: 'target', label: 'Presisjon (Klassisk)', icon: '🎯', desc: 'Klikk på hoggepunktene.' },
        { id: 'saw', label: 'Saging', icon: '🪚', desc: 'Dra saga frem og tilbake.' }
    ],
    CRAFT: [
        { id: 'rhythm', label: 'Smiing', icon: '⚒️', desc: 'Slå mens jernet er varmt.' }
    ],
    MILL: [{ id: 'balance', label: 'Balanse', icon: '🎡', desc: 'Hold kverna i gang.' }],
    DEFEND: [{ id: 'combat', label: 'Kamp', icon: '⚔️', desc: 'Forsvar baroniet.' }],

    PATROL: [{ id: 'patrol', label: 'Patrulje', icon: '🛡️', desc: 'Vokt grensene.' }],
    EXPLORE: [{ id: 'quest', label: 'Oppdrag', icon: '🧭', desc: 'Utforsk det ukjente.' }],
    FORAGE: [
        { id: 'berries', label: 'Bærplukking', icon: '🍓', desc: 'Sank bær og sopp.' },
        { id: 'traps', label: 'Snarefiske', icon: '🎣', desc: 'Sjekk fellene dine.' }
    ],
    REFINE: [{ id: 'rhythm', label: 'Foredling', icon: '⚗️', desc: 'Smi eller bearbeid råvarene.' }]
};


/* --- VISUAL FEEDBACK HELPERS --- */
const FloatingText: React.FC<{ text: string, color?: string, x?: number, y?: number, onComplete: () => void }> = ({ text, color = 'text-amber-500', x = 50, y = 50, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 1000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <>
            <div className={`absolute pointer-events-none z-[110] animate-float-up font-black text-4xl drop-shadow-2xl ${color}`} style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                {text}
            </div>
            <ParticleEffect x={x} y={y} color={color.includes('amber') ? 'bg-amber-400' : 'bg-white'} />
        </>
    );
};

const ParticleEffect: React.FC<{ x: number, y: number, color?: string }> = ({ x, y, color = 'bg-amber-400' }) => {
    const particles = [...Array(8)];
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[105]">
            {particles.map((_, i) => (
                <div
                    key={i}
                    className={`absolute w-2 h-2 rounded-sm ${color} animate-particle`}
                    style={{
                        top: `${y}%`,
                        left: `${x}%`,
                        '--dx': `${(Math.random() - 0.5) * 200}px`,
                        '--dy': `${(Math.random() - 0.5) * 200}px`,
                        '--rot': `${Math.random() * 360}deg`
                    } as any}
                />
            ))}
        </div>
    );
};
/* ------------------------------- */

export const MinigameOverlay: React.FC<MinigameProps> = ({ type, onComplete, onCancel, playerUpgrades, equipment = [], skills, selectedMethod, currentSeason = 'Spring', currentWeather = 'Clear' }) => {
    const [method, setMethod] = useState<string | null>(selectedMethod || null);

    const currentMethods = MINIGAME_VARIANTS[type] || [];

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
            case 'CHOP': return '/images/minigames/forestry_bg.png';
            case 'MINE':
            case 'QUARRY': return '/images/minigames/mining_bg.png';
            case 'CRAFT': return '/images/minigames/smithing_bg.png';
            case 'FORAGE': return '/images/minigames/foraging_bg.png';
            default: return '/images/minigames/quest_bg.png';
        }
    };

    // Calculate speed bonus from relevant equipment
    const actionEquipment = equipment.filter(item => {
        // Simplified check: if it's a tool/weapon relevant to the action, use its stats
        // For now use raw stats from whatever is passed
        return true;
    });
    const speedMultiplier = actionEquipment.reduce((acc, item) => acc * (item.stats?.speedBonus || 1.0), 1.0);

    // Calculate Yield Estimate (Match actions.ts calculateYield)
    const possibleYield = useMemo(() => {
        const balance = (window as any).GAME_BALANCE || { YIELD: { WORK_GRAIN: 10, CHOP_WOOD: 5, MINE_ORE: 5, QUARRY_STONE: 8, FORAGE_BREAD: 1 } };
        let base = 10;
        let skillType = 'FARMING';
        if (type === 'CHOP') { base = 5; skillType = 'WOODCUTTING'; }
        if (type === 'MINE') { base = 5; skillType = 'MINING'; }
        if (type === 'QUARRY') { base = 8; skillType = 'MINING'; }
        if (type === 'FORAGE') { base = 1; skillType = 'FARMING'; }

        const skillLevel = skills?.[skillType]?.level || 0;
        let total = base * (1 + (skillLevel * 0.1));

        let equipBonus = 0;
        equipment.forEach(item => {
            if (item.stats?.yieldBonus) equipBonus += item.stats.yieldBonus;
        });


        total += equipBonus;

        const seasonData = SEASONS[currentSeason as keyof typeof SEASONS] as any;
        const weatherData = WEATHER[currentWeather as keyof typeof WEATHER] as any;
        total *= (seasonData?.yieldMod || 1) * (weatherData?.yieldMod || 1);

        return total;
    }, [type, skills, equipment, currentSeason, currentWeather]);

    const resourceNameMap: Record<string, string> = {
        WORK: 'Korn', CHOP: 'Ved', MINE: 'Malm', QUARRY: 'Stein', FORAGE: 'Brød', REFINE: 'Produkt'
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

                        <div className="relative z-10 w-full">
                            <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-4">Velg utførelse</h2>
                            <h3 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">{type}</h3>

                            {/* COST DISPLAY */}
                            {(() => {
                                const costLabel = getActionCostString(type, currentSeason, currentWeather);
                                if (costLabel) {
                                    return (
                                        <div className="mb-10 inline-flex items-center gap-2 px-6 py-3 bg-black/40 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mr-2">Kostnad</span>
                                            <span className="text-base font-black text-amber-400 font-mono tracking-tight">{costLabel}</span>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {/* EQUIPMENT DISPLAY */}
                            {actionEquipment.length > 0 && (
                                <div className="mb-10 flex flex-wrap justify-center gap-4">
                                    {actionEquipment.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 px-5 py-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl backdrop-blur-md shadow-lg animate-in slide-in-from-bottom-2">
                                            <span className="text-2xl">{item.icon}</span>
                                            <div className="flex flex-col items-start">
                                                <span className="text-xs font-black text-indigo-300 uppercase tracking-widest leading-none mb-1">{item.name}</span>
                                                <div className="flex gap-2">
                                                    {(item.stats?.yieldBonus || 0) > 0 && <span className="text-[10px] font-bold text-emerald-400">+{item.stats?.yieldBonus} Utbytte</span>}
                                                    {(item.stats?.speedBonus || 0) > 1 && <span className="text-[10px] font-bold text-blue-400">+{Math.round(((item.stats?.speedBonus || 1) - 1) * 100)}% Fart</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

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
                        </div>
                    </div>
                ) : (
                    (() => {
                        switch (type) {
                            case 'WORK':
                                if (method === 'sweep') return <ScytheSweepGame onComplete={onComplete} speedMultiplier={speedMultiplier} possibleYield={possibleYield} resourceName={resourceNameMap[type]} />;
                                return <HarvestingGame onComplete={onComplete} speedMultiplier={speedMultiplier} possibleYield={possibleYield} resourceName={resourceNameMap[type]} />;
                            case 'MINE':
                                return <HarvestingGame onComplete={onComplete} isMining speedMultiplier={speedMultiplier} possibleYield={possibleYield} resourceName={resourceNameMap[type]} />;
                            case 'QUARRY':
                                return <HarvestingGame onComplete={onComplete} isQuarrying speedMultiplier={speedMultiplier} possibleYield={possibleYield} resourceName={resourceNameMap[type]} />;
                            case 'FORAGE':
                                if (method === 'traps') return <TrappingGame onComplete={onComplete} speedMultiplier={speedMultiplier} />;
                                return <HarvestingGame onComplete={onComplete} isForaging speedMultiplier={speedMultiplier} possibleYield={possibleYield} resourceName={resourceNameMap[type]} />;
                            case 'CHOP':
                                if (method === 'saw') return <SawingGame onComplete={onComplete} speedMultiplier={speedMultiplier} />;
                                return <WoodcuttingGame onComplete={onComplete} speedMultiplier={speedMultiplier} possibleYield={possibleYield} resourceName={resourceNameMap[type]} />;
                            case 'CRAFT':
                            case 'REFINE':
                                return <CraftingGame onComplete={onComplete} speedMultiplier={speedMultiplier} />;
                            case 'MILL':
                                return <MillingGame onComplete={onComplete} />;
                            case 'DEFEND':
                                return <CombatGame onComplete={onComplete} isKnight={playerUpgrades?.includes('warhorse')} />;
                            case 'PATROL':
                                return <PatrolMinigameRouter onComplete={onComplete} />;
                            case 'EXPLORE':
                                return <QuestGame onComplete={onComplete} />;
                            default:
                                return <div className="text-white">Ukjent minispill-type: {type}</div>;
                        }
                    })()
                )}

                <MinigameStyles />
            </div>
        </div >
    );
};

/* --- HARVESTING MINIGAME (Rhythm Timing) --- */
const HarvestingGame: React.FC<{
    onComplete: (score: number) => void,
    isMining?: boolean,
    isQuarrying?: boolean,
    isForaging?: boolean,
    speedMultiplier?: number,
    possibleYield?: number,
    resourceName?: string
}> = ({ onComplete, isMining, isQuarrying, isForaging, speedMultiplier = 1.0, possibleYield = 10, resourceName = 'Ressurs' }) => {
    const [pointerPos, setPointerPos] = useState(0);
    const [strikes, setStrikes] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [shake, setShake] = useState(false);
    const [floatingTexts, setFloatingTexts] = useState<{ id: number, text: string, color?: string }[]>([]);
    const dirRef = useRef(1);

    useEffect(() => {
        if (strikes.length >= 5 || isFinished) return;
        const interval = setInterval(() => {
            setPointerPos(prev => {
                // Base speed is 2. Multiplier < 1 means SLOWER (easier), > 1 means FASTER (harder but faster completion? No, this is skill check)
                // Actually, "Speed Bonus" usually means "Work Faster", implying easier/faster resource gain.
                // For a rhythm game, "Faster" cursor might be harder.
                // Let's interpret "Speed Bonus" as "Wider Success Zone" OR "Slower Cursor".
                // Let's go with Slower Cursor for precision tools.
                let speed = 2 / speedMultiplier;
                let next = prev + (speed * dirRef.current);
                if (next > 100) { dirRef.current = -1; return 100; }
                if (next < 0) { dirRef.current = 1; return 0; }
                return next;
            });
        }, 16);
        return () => clearInterval(interval);
    }, [strikes.length, isFinished]);

    const handleStrike = () => {
        if (strikes.length >= 5 || isFinished) return;
        const distance = Math.abs(pointerPos - 50);
        let score = distance < 5 ? 1.0 : distance < 15 ? 0.7 : distance < 25 ? 0.4 : 0.1;

        // Calculate yield for this hit (Simplified: (possible / 5) * (0.5 base + score * 1.0 perf weight))
        // Match actions.ts logic: total = Math.ceil(total * (0.5 + score))
        const hitYield = Math.ceil((possibleYield / 5) * (0.5 + score));

        let msg = distance < 5 ? `PERFEKT! +${hitYield}` : distance < 15 ? `Bra! +${hitYield}` : `Ok... +${hitYield}`;
        if (distance < 5) { setShake(true); setTimeout(() => setShake(false), 200); }
        setFloatingTexts(p => [...p, { id: Date.now(), text: msg, color: distance < 5 ? 'text-amber-400' : 'text-slate-200' }]);
        const newStrikes = [...strikes, score];
        setStrikes(newStrikes);
        if (newStrikes.length === 5) {
            setIsFinished(true);
            setTimeout(() => onComplete(newStrikes.reduce((a, b) => a + b, 0) / 5), 2000);
        }
    };

    const bg = isMining || isQuarrying ? 'url("/images/minigames/mining_bg.png")' : isForaging ? 'url("/images/minigames/foraging_bg.png")' : 'url("/images/minigames/agriculture_bg.png")';

    return (
        <div className={`p-8 text-center min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden ${shake ? 'animate-shake' : ''}`} style={{ backgroundImage: bg, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/70 z-0" />
            <div className="relative z-10 w-full flex flex-col items-center">
                <h2 className="text-4xl font-black text-white mb-8 drop-shadow-lg tracking-tighter uppercase">{isMining ? 'Gruvedrift' : isQuarrying ? 'Steinhugger' : isForaging ? 'Sanking' : 'Kornhøsting'}</h2>
                {floatingTexts.map(ft => <FloatingText key={ft.id} text={ft.text} onComplete={() => setFloatingTexts(p => p.filter(i => i.id !== ft.id))} />)}
                {!isFinished ? (
                    <>
                        <div className="w-full h-8 bg-white/5 rounded-full mb-12 relative border border-white/10 overflow-hidden shadow-inner">
                            <div className="absolute inset-y-0 left-[42%] right-[42%] bg-amber-500/30 border-x border-amber-500/50" />
                            <div className="absolute inset-y-0 w-1 bg-white shadow-[0_0_20px_white]" style={{ left: `${pointerPos}%` }} />
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
                <div className="absolute inset-y-0 w-20 bg-amber-500/40 border-x-2 border-amber-500/50 rounded-lg blur-[2px]" style={{ left: `${targetPos}%`, transform: 'translateX(-50%)' }} />
                <div className="absolute inset-y-0 w-2 bg-white shadow-[0_0_15px_white]" style={{ left: `${pos}%` }} />
            </div>

            <div className="relative z-10 flex gap-4 mb-12">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all ${captured > i ? 'bg-amber-500 border-amber-300 scale-110' : 'bg-white/5 border-white/10 opacity-30 shadow-inner'}`}>
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
    speedMultiplier?: number,
    possibleYield?: number,
    resourceName?: string
}> = ({ onComplete, speedMultiplier = 1.0, possibleYield = 10, resourceName = 'Korn' }) => {
    const [progress, setProgress] = useState(0);
    const [swings, setSwings] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [floatingTexts, setFloatingTexts] = useState<{ id: number, text: string }[]>([]);

    const handleMove = () => {
        if (isFinished) return;
        setProgress(p => {
            const next = p + (2 * speedMultiplier); // Faster progress per pixel moved
            if (next >= 100) {
                const hitYield = Math.ceil((possibleYield / 5) * 1.25); // 5 swings, slightly higher per hit for this mode
                setFloatingTexts(prev => [...prev, { id: Date.now(), text: `+${hitYield} ${resourceName}` }]);

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
                {floatingTexts.map(ft => <FloatingText key={ft.id} text={ft.text} onComplete={() => setFloatingTexts(p => p.filter(i => i.id !== ft.id))} />)}
                <div className="w-full h-4 bg-white/10 rounded-full mb-8 border border-white/20 overflow-hidden">
                    <div className="h-full bg-amber-400 transition-all duration-75" style={{ width: `${progress}%` }} />
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {[...Array(5)].map((_, i) => <div key={i} className={`w-8 h-8 rounded-lg border-2 ${swings > i ? 'bg-amber-500 border-amber-300' : 'border-white/20'}`} />)}
                </div>
            </div>
        </div>
    );
};

/* --- WOODCUTTING CLASSIC --- */
const WoodcuttingGame: React.FC<{
    onComplete: (score: number) => void,
    speedMultiplier?: number,
    possibleYield?: number,
    resourceName?: string
}> = ({ onComplete, speedMultiplier = 1.0, possibleYield = 5, resourceName = 'Ved' }) => {
    const [target, setTarget] = useState({ x: 50, y: 50 });
    const [hits, setHits] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [floatingTexts, setFloatingTexts] = useState<{ id: number, text: string }[]>([]);

    const spawn = () => setTarget({ x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 });

    const handleHit = () => {
        const hitYield = Math.ceil((possibleYield / 10) * 1.5); // 10 hits, each fixed performance for now
        setFloatingTexts(prev => [...prev, { id: Date.now(), text: `+${hitYield} ${resourceName}` }]);

        setHits(h => {
            if (h + 1 >= 10) { setIsFinished(true); setTimeout(() => onComplete(1.0), 2000); }
            return h + 1;
        });
        spawn();
    };

    return (
        <div className="p-8 text-center min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden" style={{ backgroundImage: 'url("/images/minigames/forestry_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/60 z-0" />

            {floatingTexts.map(ft => <FloatingText key={ft.id} text={ft.text} onComplete={() => setFloatingTexts(p => p.filter(i => i.id !== ft.id))} />)}

            <div className="relative z-10 w-full mb-8">
                <h2 className="text-4xl font-black text-white drop-shadow-lg tracking-tighter uppercase">Tømmerhogging</h2>
                <div className="text-amber-400 font-bold uppercase tracking-widest text-xs mt-2 px-4 py-1 bg-black/40 rounded-full inline-block">Hugg på merkene! ({hits}/10)</div>
            </div>

            <div className="relative z-10 w-full h-96 bg-white/5 rounded-[3rem] border border-white/10 shadow-inner overflow-hidden">
                {!isFinished ? (
                    <button
                        onClick={handleHit}
                        className="absolute w-20 h-20 bg-rose-500 rounded-full border-4 border-white shadow-[0_0_30px_rose] animate-pulse transition-all active:scale-90"
                        style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
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
    const [strokes, setStrokes] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const lastPos = useRef(50);

    const handleMove = (e: React.MouseEvent) => {
        if (isFinished) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        setPos(x);
        if ((lastPos.current < 30 && x > 70) || (lastPos.current > 70 && x < 30)) {
            // Speed Bonus makes you complete strokes faster/easier? Or requires FEWER strokes?
            // Let's say fewer strokes needed if multiplier is high? Or just consistent behavior.
            // Let's stick to standard behavior for Sawing, maybe bonus score?
            setStrokes(s => {
                let increment = 1;
                // Chance for double stroke count with high speed
                if (Math.random() < (speedMultiplier - 1.0)) increment = 2;

                let newS = s + increment;
                if (newS >= 10) { setIsFinished(true); setTimeout(() => onComplete(1.0), 2000); }
                return newS;
            });
            lastPos.current = x;
        }
    };

    return (
        <div onMouseMove={handleMove} className="p-8 text-center min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden" style={{ backgroundImage: 'url("/images/minigames/forestry_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/60 z-0" />
            <h2 className="relative z-10 text-3xl font-black text-white mb-8">Saging 🪚</h2>
            <div className="relative z-10 w-full h-24 bg-white/10 rounded-full border-2 border-white/20 flex items-center px-4">
                <div className="absolute inset-y-0 w-32 bg-slate-400 rounded-lg shadow-2xl transition-all duration-75" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
                    <div className="w-full h-full border-y-4 border-slate-600 flex items-center justify-center text-2xl font-black">🪚</div>
                </div>
            </div>
            <div className="mt-8 text-white text-xl font-bold">Tak: {strokes} / 10</div>
        </div>
    );
};

/* --- CRAFTING GAME --- */
const CraftingGame: React.FC<{ onComplete: (score: number) => void, speedMultiplier?: number }> = ({ onComplete, speedMultiplier = 1.0 }) => {
    const [nodes, setNodes] = useState<{ id: number, pos: number }[]>([]);
    const [hits, setHits] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState<{ text: string, color: string } | null>(null);

    useEffect(() => {
        if (isFinished) return;
        const spawn = setInterval(() => {
            setNodes(n => {
                if (n.length > 5) return n; // Max 5 nodes on screen
                return [...n, { id: Date.now(), pos: 0 }];
            });
        }, 1500 / speedMultiplier);

        const move = setInterval(() => {
            setNodes(n => n.map(node => ({ ...node, pos: node.pos + (2 * speedMultiplier) })).filter(node => node.pos < 110));
        }, 32);

        const handleKeys = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                handleHit();
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => {
            clearInterval(spawn);
            clearInterval(move);
            window.removeEventListener('keydown', handleKeys);
        };
    }, [isFinished, speedMultiplier]);

    const handleHit = () => {
        if (isFinished) return;
        setNodes(currentNodes => {
            const idx = currentNodes.findIndex(n => n.pos > 75 && n.pos < 98); // Slightly more generous window
            if (idx !== -1) {
                setHits(h => {
                    const next = h + 1;
                    if (next >= 10) {
                        setIsFinished(true);
                        setFeedback({ text: 'FERDIG! ⚒️', color: 'text-emerald-400' });
                        setTimeout(() => onComplete(1.0), 1000);
                    } else {
                        setFeedback({ text: 'TREFF! ✨', color: 'text-amber-400' });
                        setTimeout(() => setFeedback(null), 500);
                    }
                    return next;
                });
                return currentNodes.filter((_, i) => i !== idx);
            } else {
                setFeedback({ text: 'BOM! ✕', color: 'text-rose-500' });
                setTimeout(() => setFeedback(null), 500);
                return currentNodes;
            }
        });
    };

    return (
        <div className="p-8 text-center min-h-[600px] relative flex flex-col items-center justify-center overflow-hidden" style={{ backgroundImage: 'url("/images/minigames/smithing_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/60 z-0" />

            <div className="relative z-10 mb-12 flex flex-col items-center">
                <div className={`text-5xl font-black mb-4 h-16 transition-all duration-300 ${feedback ? 'scale-125 opacity-100' : 'scale-90 opacity-0'} ${feedback?.color}`}>
                    {feedback?.text}
                </div>
                <div className="text-white/60 font-bold uppercase tracking-widest text-sm mb-2">Fremgang</div>
                <div className="text-4xl font-black text-white">{hits} <span className="text-white/30 text-2xl">/ 10</span></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl h-32 bg-white/5 backdrop-blur-md rounded-[2rem] border-2 border-white/10 overflow-hidden flex items-center mb-12 px-2 shadow-2xl">
                {/* Hit Zone */}
                <div className="absolute right-[5%] w-24 h-24 bg-amber-500/20 border-4 border-amber-500/50 rounded-2xl animate-pulse flex items-center justify-center">
                    <div className="w-16 h-16 bg-amber-500/40 rounded-xl blur-lg" />
                </div>

                {/* Nodes */}
                {nodes.map(n => (
                    <div
                        key={n.id}
                        className="absolute w-12 h-12 bg-white rounded-full border-4 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)] flex items-center justify-center text-xl"
                        style={{ left: `${n.pos}%`, transform: 'translateX(-50%)', transition: 'left 32ms linear' }}
                    >
                        🔥
                    </div>
                ))}
            </div>

            <button
                onClick={handleHit}
                className="relative z-10 w-full max-w-sm bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white py-8 rounded-3xl font-black text-3xl shadow-[0_20px_50px_rgba(79,70,229,0.4)] transition-all border-b-8 border-indigo-800"
            >
                SLÅ! ⚒️
                <div className="text-[10px] opacity-50 mt-2 font-bold uppercase tracking-widest">Klikk eller bruk Mellomrom</div>
            </button>
        </div>
    );
};


/* --- PLACEHOLDERS --- */
const MillingGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    return <div onClick={() => onComplete(0.5)} className="p-12 text-center font-black text-2xl cursor-pointer">Milling Game placeholder (Click to finish)</div>;
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

const MinigameStyles = () => (
    <style>{`
        @keyframes float-up {
            0% { transform: translate(-50%, 0); opacity: 0; }
            30% { opacity: 1; }
            100% { transform: translate(-50%, -100px); opacity: 0; }
        }
        @keyframes particle {
            0% { transform: translate(0, 0) rotate(0); opacity: 1; }
            100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes shake {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(-5px, 5px); }
            50% { transform: translate(5px, -5px); }
            75% { transform: translate(-5px, -5px); }
        }
        .animate-float-up { animation: float-up 1s ease-out forwards; }
        .animate-particle { animation: particle 0.8s ease-out forwards; }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
    `}</style>
);
