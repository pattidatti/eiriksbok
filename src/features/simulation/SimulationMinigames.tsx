import React, { useState, useEffect, useRef } from 'react';

interface MinigameProps {
    type: 'WORK' | 'CHOP' | 'CRAFT' | 'MILL' | 'DEFEND' | 'EXPLORE' | 'MINE' | 'QUARRY' | 'PATROL';
    onComplete: (score: number) => void;
    onCancel: () => void;
    playerUpgrades?: string[];
}

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

export const MinigameOverlay: React.FC<MinigameProps> = ({ type, onComplete, onCancel, playerUpgrades }) => {
    const [method, setMethod] = useState<string | null>(null);

    const methods: Record<string, { id: string, label: string, icon: string, desc: string }[]> = {
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
        EXPLORE: [{ id: 'quest', label: 'Oppdrag', icon: '🧭', desc: 'Utforsk det ukjente.' }]
    };

    const currentMethods = methods[type] || [];

    useEffect(() => {
        if (currentMethods.length === 1) setMethod(currentMethods[0].id);
    }, [type]);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-lg flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden relative border-4 border-indigo-500/10">
                <button onClick={onCancel} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 z-10 p-2 bg-slate-100 rounded-full transition-colors">✕</button>

                {!method ? (
                    <div className="p-10 text-center animate-in fade-in zoom-in duration-300">
                        <h2 className="text-sm font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Velg Metode</h2>
                        <h3 className="text-4xl font-black text-slate-800 mb-2">{type}</h3>
                        <div className="grid grid-cols-1 gap-4 mt-8">
                            {currentMethods.map(m => (
                                <button key={m.id} onClick={() => setMethod(m.id)} className="group flex items-center gap-6 p-6 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-[1.8rem] text-left transition-all active:scale-95 border-2 border-slate-100">
                                    <span className="text-5xl group-hover:scale-110 transition-transform">{m.icon}</span>
                                    <div>
                                        <div className="font-black text-xl group-hover:text-amber-400">{m.label}</div>
                                        <div className="text-sm opacity-60 font-medium">{m.desc}</div>
                                    </div>
                                    <span className="ml-auto group-hover:translate-x-2 transition-transform">&rarr;</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {type === 'WORK' || type === 'MINE' || type === 'QUARRY' ? (
                            method === 'sweep' ? <ScytheSweepGame onComplete={onComplete} /> : <HarvestingGame onComplete={onComplete} isMining={type === 'MINE'} isQuarrying={type === 'QUARRY'} />
                        ) : type === 'CHOP' ? (
                            method === 'saw' ? <SawingGame onComplete={onComplete} /> : <WoodcuttingGame onComplete={onComplete} />
                        ) : type === 'CRAFT' ? (
                            <CraftingGame onComplete={onComplete} />
                        ) : type === 'MILL' ? (
                            <MillingGame onComplete={onComplete} />
                        ) : type === 'DEFEND' ? (
                            <CombatGame onComplete={onComplete} isKnight={playerUpgrades?.includes('warhorse')} />
                        ) : type === 'PATROL' ? (
                            <PatrolMinigameRouter onComplete={onComplete} />
                        ) : (
                            <QuestGame onComplete={onComplete} />
                        )}
                    </>
                )}
                <MinigameStyles />
            </div>
        </div>
    );
};

/* --- HARVESTING MINIGAME (Rhythm Timing) --- */
const HarvestingGame: React.FC<{ onComplete: (score: number) => void, isMining?: boolean, isQuarrying?: boolean }> = ({ onComplete, isMining, isQuarrying }) => {
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
                let next = prev + (2 * dirRef.current);
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
        let msg = distance < 5 ? "PERFEKT! ✨" : distance < 15 ? "Bra! 👍" : "Ok... 🤷";
        if (distance < 5) { setShake(true); setTimeout(() => setShake(false), 200); }
        setFloatingTexts(p => [...p, { id: Date.now(), text: msg }]);
        const newStrikes = [...strikes, score];
        setStrikes(newStrikes);
        if (newStrikes.length === 5) {
            setIsFinished(true);
            setTimeout(() => onComplete(newStrikes.reduce((a, b) => a + b, 0) / 5), 2000);
        }
    };

    const bg = isMining || isQuarrying ? 'url("/images/minigames/mining_bg.png")' : 'url("/images/minigames/agriculture_bg.png")';

    return (
        <div className={`p-8 text-center min-h-[450px] relative flex flex-col items-center justify-center overflow-hidden ${shake ? 'animate-shake' : ''}`} style={{ backgroundImage: bg, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black/50 z-0" />
            <div className="relative z-10 w-full flex flex-col items-center">
                <h2 className="text-3xl font-black text-white mb-8 drop-shadow-lg">{isMining ? 'Gruvedrift' : isQuarrying ? 'Steinhugger' : 'Kornhøsting'}</h2>
                {floatingTexts.map(ft => <FloatingText key={ft.id} text={ft.text} onComplete={() => setFloatingTexts(p => p.filter(i => i.id !== ft.id))} />)}
                {!isFinished ? (
                    <>
                        <div className="w-full h-12 bg-white/10 rounded-full mb-8 relative border-2 border-white/20 overflow-hidden">
                            <div className="absolute inset-y-0 left-[40%] right-[40%] bg-emerald-400/20 border-x border-emerald-400/50" />
                            <div className="absolute inset-y-0 w-1 bg-white shadow-[0_0_15px_white]" style={{ left: `${pointerPos}%` }} />
                        </div>
                        <button onClick={handleStrike} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 rounded-2xl font-black text-2xl shadow-xl active:scale-95 transition-all">HØST! 🛠️</button>
                    </>
                ) : (
                    <div className="py-12 animate-bounce text-4xl font-black text-amber-500">FERDIG! 🌾✨</div>
                )}
            </div>
        </div>
    );
};

/* --- SCYTHE SWEEP VARIANT --- */
const ScytheSweepGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [swings, setSwings] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [floatingTexts, setFloatingTexts] = useState<{ id: number, text: string }[]>([]);

    const handleMove = () => {
        if (isFinished) return;
        setProgress(p => {
            const next = p + 2;
            if (next >= 100) {
                setSwings(s => {
                    if (s + 1 >= 5) { setIsFinished(true); setTimeout(() => onComplete(1.0), 2000); }
                    return s + 1;
                });
                setFloatingTexts(prev => [...prev, { id: Date.now(), text: "SVING! 🗡️" }]);
                return 0;
            }
            return next;
        });
    };

    return (
        <div onMouseMove={handleMove} className="p-8 text-center min-h-[450px] relative flex flex-col items-center justify-center overflow-hidden" style={{ backgroundImage: 'url("/images/minigames/agriculture_bg.png")', backgroundSize: 'cover' }}>
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
const WoodcuttingGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    const [target, setTarget] = useState({ x: 50, y: 50 });
    const [hits, setHits] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const spawn = () => setTarget({ x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 });

    const handleHit = () => {
        setHits(h => {
            if (h + 1 >= 10) { setIsFinished(true); setTimeout(() => onComplete(1.0), 2000); }
            return h + 1;
        });
        spawn();
    };

    return (
        <div className="p-8 text-center min-h-[450px] relative flex flex-col items-center justify-center overflow-hidden" style={{ backgroundImage: 'url("/images/minigames/forestry_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/50 z-0" />
            <div className="relative z-10 w-full h-64 bg-white/5 rounded-3xl border border-white/10">
                {!isFinished ? (
                    <button onClick={handleHit} className="absolute w-16 h-16 bg-red-500 rounded-full border-4 border-white shadow-xl animate-pulse" style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}>HOGG!</button>
                ) : <div className="flex items-center justify-center h-full text-4xl font-black text-indigo-400">HOGGET! 🪵</div>}
            </div>
            <div className="mt-4 text-white font-black uppercase tracking-widest">Treff: {hits} / 10</div>
        </div>
    );
};

/* --- SAWING VARIANT --- */
const SawingGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
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
            setStrokes(s => {
                if (s + 1 >= 10) { setIsFinished(true); setTimeout(() => onComplete(1.0), 2000); }
                return s + 1;
            });
            lastPos.current = x;
        }
    };

    return (
        <div onMouseMove={handleMove} className="p-8 text-center min-h-[450px] relative flex flex-col items-center justify-center overflow-hidden" style={{ backgroundImage: 'url("/images/minigames/forestry_bg.png")', backgroundSize: 'cover' }}>
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
const CraftingGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    const [nodes, setNodes] = useState<{ id: number, pos: number }[]>([]);
    const [hits, setHits] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (isFinished) return;
        const spawn = setInterval(() => {
            if (hits < 10) setNodes(n => [...n, { id: Date.now(), pos: 0 }]);
        }, 1500);
        const move = setInterval(() => {
            setNodes(n => n.map(node => ({ ...node, pos: node.pos + 2 })).filter(node => node.pos < 110));
        }, 32);
        return () => { clearInterval(spawn); clearInterval(move); };
    }, [hits, isFinished]);

    const handleHit = () => {
        const idx = nodes.findIndex(n => n.pos > 80 && n.pos < 100);
        if (idx !== -1) {
            setHits(h => {
                if (h + 1 >= 10) { setIsFinished(true); setTimeout(() => onComplete(1.0), 2000); }
                return h + 1;
            });
            setNodes(n => n.filter((_, i) => i !== idx));
        }
    };

    return (
        <div className="p-8 text-center min-h-[450px] relative flex flex-col items-center justify-center overflow-hidden" style={{ backgroundImage: 'url("/images/minigames/smithing_bg.png")', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-black/50 z-0" />
            <div className="relative z-10 w-full h-32 bg-white/10 rounded-3xl mb-8 border border-white/20 overflow-hidden flex items-center">
                <div className="absolute right-[5%] w-16 h-24 bg-red-500/20 border-2 border-red-500 rounded-xl" />
                {nodes.map(n => <div key={n.id} className="absolute w-8 h-8 bg-orange-500 rounded-full border-2 border-white shadow-[0_0_15px_orange]" style={{ left: `${n.pos}%` }} />)}
            </div>
            <button onClick={handleHit} className="relative z-10 w-full bg-slate-800 text-white py-6 rounded-2xl font-black text-2xl">SLÅ! ⚒️</button>
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
