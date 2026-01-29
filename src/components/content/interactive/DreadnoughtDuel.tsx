import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tone from 'tone';
import { Ship, Anchor, Zap, Skull, Coins } from 'lucide-react';

export const DreadnoughtDuel: React.FC = () => {
    const [germanyShips, setGermanyShips] = useState(1);
    const [ukShips, setUkShips] = useState(2);
    const [tension, setTension] = useState(10);
    const [cost, setCost] = useState(10); // Millions
    const [gameOver, setGameOver] = useState<'none' | 'war' | 'bankrupt'>('none');

    // Audio synthesis refs
    const synthRef = useRef<Tone.PolySynth | null>(null);
    const noiseRef = useRef<Tone.NoiseSynth | null>(null);

    useEffect(() => {
        // Initialize Audio
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
        noiseRef.current = new Tone.NoiseSynth({
            noise: { type: 'brown' },
            envelope: { attack: 0.1, decay: 0.2, sustain: 0, release: 0.2 }
        }).toDestination();

        return () => {
            synthRef.current?.dispose();
            noiseRef.current?.dispose();
        };
    }, []);

    const playSound = (type: 'build_de' | 'build_uk' | 'warning' | 'krig') => {
        if (Tone.context.state !== 'running') return; // Don't crash if context not started

        switch (type) {
            case 'build_de':
                // Metallic Clank
                synthRef.current?.triggerAttackRelease(["C2", "E2"], "8n");
                break;
            case 'build_uk':
                // Low ominous brass-like
                synthRef.current?.triggerAttackRelease(["A1", "C2", "E2"], "4n");
                break;
            case 'warning':
                synthRef.current?.triggerAttackRelease(["F#5"], "16n");
                break;
            case 'krig':
                noiseRef.current?.triggerAttackRelease("1n");
                break;
        }
    };

    const handleBuild = async () => {
        if (gameOver !== 'none') return;

        // Start Tone context on first interaction if needed
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }

        // 1. Germany Builds
        playSound('build_de');
        setGermanyShips(prev => prev + 1);
        setTension(prev => Math.min(prev + 10, 100)); // +10 Tension
        setCost(prev => Math.floor(prev * 1.5)); // Exponential cost

        // Check for Game Over conditions immediately
        if (cost > 500) {
            setGameOver('bankrupt');
            return;
        }
        if (tension >= 90) { // If currently 90 and we add 10 -> Boom
            setGameOver('war');
            playSound('krig');
            return;
        }

        // 2. Britain Reacts (The Security Dilemma)
        setTimeout(() => {
            if (gameOver !== 'none') return;
            playSound('build_uk');
            setUkShips(prev => prev + 2);
            setTension(prev => Math.min(prev + 15, 100)); // UK response adds more tension

            if (tension + 15 >= 100) {
                setGameOver('war');
                playSound('krig');
            }
        }, 600);
    };

    return (
        <div className="w-full max-w-5xl mx-auto my-12 bg-slate-50 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-900 font-mono text-slate-900 relative select-none">
            {/* Background Grid - Blueprint Style */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#1e293b 0.5px, transparent 0.5px), linear-gradient(90deg, #1e293b 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}>
            </div>

            {/* Header / Meters */}
            <div className="relative z-10 bg-white border-b-4 border-slate-900 p-6 flex justify-between items-start shadow-sm">
                <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Anchor className="text-blue-600" size={28} /> Naval Arms Race
                    </h3>
                    <p className="text-sm font-bold text-slate-500">Dreadnought produksjon: 1906-1914</p>
                </div>

                <div className="flex gap-12 text-right">
                    <div>
                        <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Diplomatisk Spenning</div>
                        <div className={`text-3xl font-black ${tension > 80 ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>
                            {Math.min(tension, 100)}%
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">Statsbudsjett (Underskudd)</div>
                        <div className={`text-3xl font-black ${cost > 400 ? 'text-red-600' : 'text-emerald-700'}`}>
                            {cost}M Reichsmark
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Game Area (Split View) */}
            <div className="relative z-10 grid grid-rows-2 h-[500px]">

                {/* Germany (Top) */}
                <div className="bg-slate-200/50 border-b-4 border-dashed border-slate-400 p-6 relative overflow-hidden flex flex-col justify-end">
                    <div className="absolute top-4 left-4 text-5xl font-black text-slate-900/10 uppercase tracking-tighter">Deutsches Reich</div>

                    <div className="flex flex-wrap gap-3 content-end mb-4 pr-32">
                        <AnimatePresence>
                            {Array.from({ length: germanyShips }).map((_, i) => (
                                <motion.div
                                    key={`de-${i}`}
                                    initial={{ opacity: 0, y: 50, scale: 0.5 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: "spring", bounce: 0.4 }}
                                    className="bg-slate-700 w-20 h-10 rounded relative border-2 border-slate-900 shadow-xl"
                                >
                                    <div className="absolute -top-3 left-3 w-3 h-5 bg-slate-600 border-x-2 border-t-2 border-slate-900" /> {/* Smokestack */}
                                    <div className="absolute -top-4 left-8 w-8 h-2 bg-slate-800 rounded-full border-2 border-slate-900" /> {/* Gun */}
                                    <div className="absolute bottom-1 right-2 text-[8px] text-white font-bold opacity-50">K{i + 1}</div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    <Ship className="absolute bottom-6 right-6 text-slate-900 w-16 h-16 opacity-10" />
                </div>

                {/* UK (Bottom) */}
                <div className="bg-blue-50/50 p-6 relative overflow-hidden flex flex-col justify-start">
                    <div className="absolute bottom-4 right-4 text-5xl font-black text-blue-900/10 uppercase tracking-tighter text-right">Great Britain</div>

                    <div className="flex flex-wrap gap-3 mb-4 pl-32">
                        <AnimatePresence>
                            {Array.from({ length: ukShips }).map((_, i) => (
                                <motion.div
                                    key={`uk-${i}`}
                                    initial={{ opacity: 0, y: -50, scale: 0.5 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: "spring", bounce: 0.4 }}
                                    className="bg-blue-800 w-24 h-12 rounded relative border-2 border-blue-950 shadow-xl"
                                >
                                    <div className="absolute -top-4 left-4 w-3 h-8 bg-blue-700 border-x-2 border-t-2 border-blue-950" /> {/* Tall Smokestack */}
                                    <div className="absolute -top-4 left-12 w-3 h-8 bg-blue-700 border-x-2 border-t-2 border-blue-950" />
                                    <div className="absolute top-2 left-0 w-full h-[2px] bg-white/20" />
                                    <div className="absolute bottom-1 left-2 text-[8px] text-white font-bold opacity-50">HMS-{i + 1}</div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    <Anchor className="absolute top-6 left-6 text-blue-900 w-16 h-16 opacity-10" />
                </div>

                {/* Control Panel (Center Overlay) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">

                    {gameOver === 'none' ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBuild}
                            className="group relative bg-red-600 hover:bg-red-500 text-white w-40 h-40 rounded-full border-8 border-white shadow-[0_10px_30px_rgba(220,38,38,0.4)] flex flex-col items-center justify-center z-20 transition-colors"
                        >
                            <div className="absolute inset-0 rounded-full border-4 border-red-800 opacity-20 pointer-events-none" />
                            <Zap size={40} className="fill-white" strokeWidth={3} />
                            <span className="text-sm font-black uppercase mt-1 tracking-wider">BYGG</span>
                            <span className="text-xs font-bold opacity-90 group-hover:opacity-100">(-1år)</span>
                        </motion.button>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white text-slate-900 p-8 rounded-xl border-4 border-red-600 shadow-2xl text-center z-50 max-w-md"
                        >
                            <div className="flex justify-center mb-4">
                                {gameOver === 'war' ? <Skull size={64} className="text-red-600" /> : <Coins size={64} className="text-orange-500" />}
                            </div>
                            <h2 className="text-4xl font-black mb-4 uppercase tracking-tight text-red-600">
                                {gameOver === 'war' ? 'Verdenskrig!' : 'Statskonkurs!'}
                            </h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
                                {gameOver === 'war'
                                    ? 'Du presset våpenkappløpet for langt. Storbritannia tolket flåten din som en krigserklæring.'
                                    : 'Kostnadene ved opprustning har ruinert økonomien din. Du tapte kappløpet.'}
                            </p>
                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 text-left mb-6">
                                <p className="text-sm text-blue-900 font-bold mb-1">Historisk Lærdom:</p>
                                <p className="text-xs text-blue-800 leading-relaxed">
                                    Våpenkappløp skaper et "Sikkerhetsdilemma" – dine forsøk på å bli tryggere gjør naboen reddere, til ingen er trygge.
                                </p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors uppercase tracking-wider text-sm"
                            >
                                Prøv igjen
                            </button>
                        </motion.div>
                    )}

                </div>
            </div>

            {/* Legend / Info */}
            <div className="p-4 bg-white border-t-4 border-slate-900 flex justify-between text-xs font-bold uppercase text-slate-500 tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-700 rounded-sm" />
                    Din Flåte: {germanyShips} Skip
                </div>
                <div className="flex items-center gap-2">
                    British Royal Navy: {ukShips} Skip
                    <div className="w-3 h-3 bg-blue-800 rounded-sm" />
                </div>
            </div>
        </div>
    );
};
