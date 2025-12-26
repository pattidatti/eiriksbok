import React, { useState, useEffect } from 'react';

interface MinigameProps {
    type: 'WORK' | 'CHOP' | 'CRAFT' | 'MILL' | 'DEFEND' | 'EXPLORE';
    onComplete: (score: number) => void;
    onCancel: () => void;
    playerUpgrades?: string[];
}




export const MinigameOverlay: React.FC<MinigameProps> = ({ type, onComplete, onCancel, playerUpgrades }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
                >
                    ✕
                </button>

                {type === 'WORK' ? (
                    <HarvestingGame onComplete={onComplete} />
                ) : type === 'CHOP' ? (
                    <WoodcuttingGame onComplete={onComplete} />
                ) : type === 'CRAFT' ? (
                    <CraftingGame onComplete={onComplete} />
                ) : type === 'MILL' ? (
                    <MillingGame onComplete={onComplete} />
                ) : type === 'DEFEND' ? (
                    <CombatGame onComplete={onComplete} isKnight={playerUpgrades?.includes('warhorse')} />
                ) : (
                    <QuestGame onComplete={onComplete} />
                )}



            </div>
        </div>
    );
};

/* --- HARVESTING MINIGAME (Rhythm Timing) --- */
const HarvestingGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [pointerPos, setPointerPos] = useState(0);
    const [direction, setDirection] = useState(1);
    const [strikes, setStrikes] = useState<number[]>([]);
    const [message, setMessage] = useState('Trykk når streken er i det grønne feltet!');
    const [isFinished, setIsFinished] = useState(false);

    // Animation loop for the pointer
    useEffect(() => {
        if (strikes.length >= 5 || isFinished) return;

        const interval = setInterval(() => {
            setPointerPos(prev => {
                let next = prev + (2 * direction);
                if (next > 100) { setDirection(-1); return 100; }
                if (next < 0) { setDirection(1); return 0; }
                return next;
            });
        }, 16);
        return () => clearInterval(interval);
    }, [direction, strikes.length, isFinished]);

    const handleStrike = () => {
        if (strikes.length >= 5 || isFinished) return;

        // Green zone is between 40 and 60
        const distance = Math.abs(pointerPos - 50);
        let score = 0;
        if (distance < 5) { score = 1.0; setMessage("PERFEKT! ✨"); }
        else if (distance < 15) { score = 0.7; setMessage("Bra! 👍"); }
        else if (distance < 25) { score = 0.4; setMessage("Ok... 🤷"); }
        else { score = 0.1; setMessage("BOM! 🛑"); }

        const newStrikes = [...strikes, score];
        setStrikes(newStrikes);
        setProgress((newStrikes.length / 5) * 100);

        if (newStrikes.length === 5) {
            setIsFinished(true);
            const avg = newStrikes.reduce((a, b) => a + b, 0) / 5;
            setTimeout(() => onComplete(avg), 2000);
        }
    };

    return (
        <div className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-3xl font-black text-slate-800 mb-2 border-b-4 border-amber-200 inline-block px-4">Kornhøsting 🌾</h2>

            {isFinished ? (
                <div className="py-12 animate-in zoom-in duration-300">
                    <div className="text-6xl mb-4">🌾✨</div>
                    <h3 className="text-4xl font-black text-amber-600 mb-2">HØSTET!</h3>
                    <p className="text-slate-500 font-bold text-xl">Du fikk fylt låven!</p>
                    <div className="mt-4 text-sm text-slate-400 uppercase tracking-widest font-black">Lagrer resultat...</div>
                </div>
            ) : (
                <>
                    <p className="text-slate-500 text-lg mb-8">{message}</p>

                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-slate-100 rounded-full mb-4 overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>

                    {/* The Scythe Track */}
                    <div className="relative w-full h-12 bg-slate-100 rounded-full border-2 border-slate-200 mb-8 overflow-hidden">
                        {/* Green Zone */}
                        <div className="absolute inset-y-0 left-[40%] right-[40%] bg-emerald-400/30 border-x-2 border-emerald-500/50" />
                        {/* Pointer */}
                        <div
                            className="absolute inset-y-0 w-1 bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-transform duration-75"
                            style={{ left: `${pointerPos}%` }}
                        />
                    </div>

                    <button
                        onClick={handleStrike}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 rounded-2xl font-black text-2xl shadow-lg active:scale-95 transition-all"
                    >
                        HØST! 🛠️
                    </button>

                    <div className="mt-6 flex justify-center gap-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-4 h-4 rounded-full border-2 ${strikes[i] !== undefined ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/* --- WOODCUTTING MINIGAME (Target Clicking) --- */
const WoodcuttingGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    const [targets, setTargets] = useState<{ id: number, x: number, y: number }[]>([]);
    const [timeLeft, setTimeLeft] = useState(10);
    const [hits, setHits] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        let timer: any;
        if (gameStarted && timeLeft > 0 && !isFinished) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameStarted && !isFinished) {
            handleGameOver();
        }
        return () => clearInterval(timer);
    }, [gameStarted, timeLeft, isFinished]);

    const startGame = () => {
        setGameStarted(true);
        spawnTarget();
    };

    const spawnTarget = () => {
        const newTarget = {
            id: Date.now(),
            x: 10 + Math.random() * 80,
            y: 10 + Math.random() * 80
        };
        setTargets([newTarget]);
    };

    const handleHit = (_id: number) => {
        if (isFinished) return;
        setHits(h => h + 1);
        setTargets([]);
        spawnTarget();
    };

    const handleGameOver = () => {
        setIsFinished(true);
        setTargets([]);
        // Score is based on hits. 15 hits = 100%
        const score = Math.min(1.0, hits / 15);
        setTimeout(() => onComplete(score), 2000);
    };

    return (
        <div className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-3xl font-black text-slate-800 mb-2 border-b-4 border-amber-800 inline-block px-4">Vedhogging 🪵</h2>

            {!gameStarted ? (
                <div className="py-12">
                    <p className="text-slate-500 mb-8 italic text-lg">Klikk på de røde sirklene for å hogge veden så raskt du kan!</p>
                    <button
                        onClick={startGame}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-2xl shadow-xl animate-bounce"
                    >
                        START HOGGING! 🪓
                    </button>
                </div>
            ) : isFinished ? (
                <div className="py-12 animate-in zoom-in duration-300">
                    <div className="text-6xl mb-4">🪓✨</div>
                    <h3 className="text-4xl font-black text-indigo-600 mb-2">FERDIG!</h3>
                    <p className="text-slate-500 font-bold text-xl">Du hogg {hits} biter ved!</p>
                    <div className="mt-4 text-sm text-slate-400 uppercase tracking-widest font-black">Lagrer resultat...</div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between w-full mb-4 font-mono font-black text-xl">
                        <div className="text-red-500">⏳ {timeLeft}s</div>
                        <div className="text-indigo-600">🪓 {hits}</div>
                    </div>

                    <div className="relative w-full aspect-square bg-amber-50 rounded-2xl border-4 border-amber-900/10 overflow-hidden cursor-crosshair">
                        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                            <div className="w-2/3 h-full bg-amber-900 rounded-lg transform rotate-3 shadow-2xl" />
                        </div>

                        {targets.map(t => (
                            <button
                                key={t.id}
                                onClick={() => handleHit(t.id)}
                                className="absolute w-14 h-14 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)] border-4 border-white transition-transform active:scale-95 z-20 flex items-center justify-center text-white text-sm font-black"
                                style={{ top: `${t.y}%`, left: `${t.x}%` }}
                            >
                                HIT
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/* --- SMITHING MINIGAME (Rhythm Nodes) --- */
const CraftingGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    const [nodes, setNodes] = useState<{ id: number, pos: number, type: 'HIT' }[]>([]);
    const [score, setScore] = useState(0);
    const [hits, setHits] = useState(0);
    const [totalPossible, setTotalPossible] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (!gameStarted || isFinished) return;

        // Spawn nodes
        const spawnInterval = setInterval(() => {
            if (totalPossible >= 10) return;
            setNodes(prev => [...prev, { id: Date.now(), pos: 0, type: 'HIT' }]);
            setTotalPossible(t => t + 1);
        }, 1500);

        // Move nodes
        const moveInterval = setInterval(() => {
            setNodes(prev => {
                const updated = prev.map(n => ({ ...n, pos: n.pos + 2 }));
                return updated.filter(n => n.pos <= 100);
            });
        }, 32);

        if (totalPossible >= 10 && nodes.length === 0) {
            handleGameOver();
        }

        return () => {
            clearInterval(spawnInterval);
            clearInterval(moveInterval);
        };
    }, [gameStarted, totalPossible, nodes.length, isFinished]);

    const handleHit = () => {
        if (isFinished) return;
        const hitIdx = nodes.findIndex(n => n.pos > 80 && n.pos < 100);
        if (hitIdx !== -1) {
            const distance = Math.abs(nodes[hitIdx].pos - 90);
            let increment = 0;
            if (distance < 3) increment = 1.0;
            else if (distance < 7) increment = 0.5;
            else increment = 0.2;

            setScore(s => s + increment);
            setHits(h => h + 1);
            setNodes(prev => prev.filter((_, i) => i !== hitIdx));
        }
    };

    const handleGameOver = () => {
        setIsFinished(true);
        setNodes([]);
        const finalScore = Math.min(1.0, score / 8);
        setTimeout(() => onComplete(finalScore), 2000);
    };

    return (
        <div className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-3xl font-black text-slate-800 mb-2 border-b-4 border-slate-400 inline-block px-4">Smiing ⚒️</h2>

            {!gameStarted ? (
                <div className="py-12">
                    <p className="text-slate-500 mb-8 italic text-lg">Slå på ambolten akkurat når bladet er rødglødende!</p>
                    <button onClick={() => setGameStarted(true)} className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-2xl">START SMING! ⚒️</button>
                </div>
            ) : isFinished ? (
                <div className="py-12 animate-in zoom-in duration-300">
                    <div className="text-6xl mb-4">⚔️⚒️</div>
                    <h3 className="text-4xl font-black text-slate-800 mb-2">SMIING FERDIG!</h3>
                    <p className="text-slate-500 font-bold text-xl">Våpenet er herdet!</p>
                </div>
            ) : (
                <div className="w-full">
                    <div className="relative h-64 bg-slate-100 rounded-3xl mb-8 border-4 border-slate-200 overflow-hidden">
                        <div className="absolute top-0 bottom-0 right-[5%] w-[10%] bg-red-500/20 border-x-2 border-red-500/50 flex items-center justify-center">
                            <div className="text-2xl">⚒️</div>
                        </div>
                        {nodes.map(n => (
                            <div
                                key={n.id}
                                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-500 rounded-full shadow-[0_0_15px_#f97316] border-2 border-white"
                                style={{ left: `${n.pos}%` }}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleHit}
                        className="w-full bg-slate-800 text-white py-6 rounded-2xl font-black text-2xl active:scale-95 transition-all shadow-xl"
                    >
                        SLÅ TIL! 🔨
                    </button>
                    <div className="mt-4 text-sm font-black uppercase text-slate-400">Treff: {hits} / 10</div>
                </div>
            )}
        </div>
    );
};

/* --- MILLING MINIGAME (Balance Bar) --- */
const MillingGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    const [pointer, setPointer] = useState(50);
    const [velocity, setVelocity] = useState(0.5);
    const [totalScore, setTotalScore] = useState(0);
    const [duration, setDuration] = useState(10);
    const [gameStarted, setGameStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (!gameStarted || isFinished) return;

        const interval = setInterval(() => {
            setPointer(p => {
                const next = p + velocity;
                if (next < 0 || next > 100) return next < 0 ? 0 : 100;
                return next;
            });
            setVelocity(v => v + (Math.random() - 0.5) * 0.2);
            setPointer(p => {
                if (p > 40 && p < 60) {
                    setTotalScore(s => s + 1);
                } else if (p < 20 || p > 80) {
                    setTotalScore(s => s - 0.5);
                }
                return p;
            });
        }, 50);

        const timer = setInterval(() => {
            setDuration(d => {
                if (d <= 1) {
                    clearInterval(interval);
                    clearInterval(timer);
                    setIsFinished(true);
                    return 0;
                }
                return d - 1;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timer);
        };
    }, [gameStarted, velocity, isFinished]);

    useEffect(() => {
        if (isFinished) {
            const finalScore = Math.min(1.0, Math.max(0, totalScore / 120));
            setTimeout(() => onComplete(finalScore), 2000);
        }
    }, [isFinished]);

    return (
        <div className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-3xl font-black text-slate-800 mb-2 border-b-4 border-indigo-200 inline-block px-4">Kverning 🎡</h2>

            {!gameStarted ? (
                <div className="py-12">
                    <p className="text-slate-500 mb-8 italic text-lg">Hold kverna gående jevnt! Trykk på knappene for å holde markøren i midten.</p>
                    <button onClick={() => setGameStarted(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-2xl">START KVERNING! 🎡</button>
                </div>
            ) : isFinished ? (
                <div className="py-12 animate-in zoom-in duration-300">
                    <div className="text-6xl mb-4">🥖🎡</div>
                    <h3 className="text-4xl font-black text-indigo-600 mb-2">FERDIG MALT!</h3>
                    <p className="text-slate-500 font-bold text-xl">Melet er silkemykt.</p>
                </div>
            ) : (
                <div className="w-full">
                    <div className="flex justify-between mb-4 font-black font-mono text-xl">
                        <div className="text-indigo-600">🎡 TURBO: {(velocity * 10).toFixed(1)}</div>
                        <div className="text-red-500">⏳ {duration}s</div>
                    </div>
                    <div className="relative h-16 bg-slate-100 rounded-full mb-8 border-4 border-slate-200 overflow-hidden">
                        <div className="absolute inset-y-0 left-[40%] right-[40%] bg-emerald-400/30 border-x-2 border-emerald-500/50" />
                        <div
                            className="absolute inset-y-0 w-2 bg-indigo-600 transition-all duration-75 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                            style={{ left: `${pointer}%` }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onMouseDown={() => setVelocity(v => v - 1.5)}
                            className="bg-slate-800 text-white py-6 rounded-2xl font-black text-2xl active:bg-indigo-600 transition-colors shadow-lg"
                        >
                            &larr; VENSTRE
                        </button>
                        <button
                            onMouseDown={() => setVelocity(v => v + 1.5)}
                            className="bg-slate-800 text-white py-6 rounded-2xl font-black text-2xl active:bg-indigo-600 transition-colors shadow-lg"
                        >
                            HØYRE &rarr;
                        </button>
                    </div>
                    <p className="mt-6 text-xs text-slate-400 font-black uppercase tracking-widest">Hold markøren i det grønne feltet!</p>
                </div>
            )}
        </div>
    );
};

/* --- COMBAT MINIGAME (Reflex Parry) --- */
const CombatGame: React.FC<{ onComplete: (score: number) => void, isKnight?: boolean }> = ({ onComplete, isKnight }) => {

    const [targets, setTargets] = useState<{ id: number, x: number, y: number, size: number }[]>([]);
    const [hits, setHits] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [gameStarted, setGameStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (!gameStarted || isFinished) return;

        const spawn = () => {
            const id = Date.now();
            const size = isKnight ? 1.5 : 1;
            setTargets(prev => [...prev, { id, x: 20 + Math.random() * 60, y: 20 + Math.random() * 60, size }]);
            setTimeout(() => {
                setTargets(prev => prev.filter(t => t.id !== id));
            }, isKnight ? 1200 : 800); // Easier for Knights

        };

        const interval = setInterval(spawn, 600);
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(interval);
                    clearInterval(timer);
                    setIsFinished(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => { clearInterval(interval); clearInterval(timer); };
    }, [gameStarted, isFinished]);

    useEffect(() => {
        if (isFinished) {
            const finalScore = Math.min(1.0, hits / 12);
            setTimeout(() => onComplete(finalScore), 2000);
        }
    }, [isFinished]);

    return (
        <div className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center bg-red-50">
            <h2 className="text-3xl font-black text-red-800 mb-2 border-b-4 border-red-200 inline-block px-4">KAMP! ⚔️</h2>
            {!gameStarted ? (
                <div className="py-12">
                    <p className="text-red-900/60 mb-8 italic text-lg">Blokker angrepene ved å trykke på de røde merkene før de forsvinner!</p>
                    <button onClick={() => setGameStarted(true)} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-2xl shadow-xl">FORSVAR DEG! ⚔️</button>
                </div>
            ) : isFinished ? (
                <div className="py-12 animate-in zoom-in duration-300">
                    <div className="text-6xl mb-4">🛡️💥</div>
                    <h3 className="text-4xl font-black text-red-600 mb-2">STRID FERDIG!</h3>
                    <p className="text-red-900/60 font-bold text-xl">Du holdt stand.</p>
                </div>
            ) : (
                <div className="w-full relative aspect-square bg-white rounded-3xl border-4 border-red-100 overflow-hidden">
                    <div className="absolute top-4 left-4 font-black font-mono text-xl text-red-600">⏳ {timeLeft}s</div>
                    <div className="absolute top-4 right-4 font-black font-mono text-xl text-red-600">🛡️ {hits}</div>
                    {targets.map(t => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setHits(h => h + 1);
                                setTargets(prev => prev.filter(tar => tar.id !== t.id));
                            }}
                            className="absolute bg-red-600 rounded-full border-4 border-white animate-ping"
                            style={{
                                top: `${t.y}%`,
                                left: `${t.x}%`,
                                width: '60px',
                                height: '60px',
                                marginLeft: '-30px',
                                marginTop: '-30px'
                            }}
                        />
                    ))}
                    <div className="absolute inset-0 border-[20px] border-red-500/5 pointer-events-none" />
                </div>
            )}
        </div>
    );
};

/* --- QUEST MINIGAME (Search for Clues) --- */
const QuestGame: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
    const [sparkles, setSparkles] = useState<{ id: number, x: number, y: number }[]>([]);
    const [found, setFound] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (sparkles.length < 5 && Math.random() > 0.5) {
                setSparkles(prev => [...prev, { id: Date.now(), x: 10 + Math.random() * 80, y: 10 + Math.random() * 80 }]);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [sparkles.length]);

    const handleFound = (id: number) => {
        setFound(f => {
            const next = f + 1;
            if (next >= 5) setIsFinished(true);
            return next;
        });
        setSparkles(prev => prev.filter(s => s.id !== id));
    };

    useEffect(() => {
        if (isFinished) {
            setTimeout(() => onComplete(1.0), 2000);
        }
    }, [isFinished]);

    return (
        <div className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center bg-indigo-50">
            <h2 className="text-3xl font-black text-indigo-800 mb-2 border-b-4 border-indigo-200 inline-block px-4">UTFORSKING 🧭</h2>
            {isFinished ? (
                <div className="py-12 animate-in zoom-in duration-300">
                    <div className="text-6xl mb-4">💎✨</div>
                    <h3 className="text-4xl font-black text-indigo-600 mb-2">FUNNET!</h3>
                    <p className="text-indigo-900/60 font-bold text-xl">Du fant det du lette etter.</p>
                </div>
            ) : (
                <div className="w-full">
                    <p className="text-indigo-900/60 mb-8 italic text-lg">Finn 5 skjulte spor i området!</p>
                    <div className="relative aspect-video bg-indigo-900/10 rounded-3xl overflow-hidden cursor-crosshair border-4 border-indigo-200">
                        {sparkles.map(s => (
                            <button
                                key={s.id}
                                onClick={() => handleFound(s.id)}
                                className="absolute text-4xl animate-pulse"
                                style={{ top: `${s.y}%`, left: `${s.x}%` }}
                            >
                                ✨
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 text-sm font-black text-indigo-400 uppercase">Spor funnet: {found} / 5</div>
                </div>
            )}
        </div>
    );
};
