
import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Skull, Ruler, Scroll, Users, TriangleAlert } from 'lucide-react';
import { Slider } from '../../ui/Slider';

const AttritionWarfare: React.FC = () => {
    const [troops, setTroops] = useState(10000);
    const [isAttacking, setIsAttacking] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [totalCasualties, setTotalCasualties] = useState(0);
    const [totalGain, setTotalGain] = useState(0);
    const [turnCount, setTurnCount] = useState(0);
    const [showDebrief, setShowDebrief] = useState(false);

    const controls = useAnimation();
    const paperRef = useRef<HTMLDivElement>(null);

    const grimMessages = [
        "07:00: Fløyta går. Soldatene klatrer over toppen.",
        "07:05: Kraftig mitraljøseild fra sektor 4.",
        "07:15: Første bølge låst nede i Ingenmannsland.",
        "07:30: Artilleriet har ikke ødelagt piggtråden.",
        "08:00: Mistet kontakten med fremre enheter.",
        "08:45: Retrett beordret. Bårebærere sendt ut.",
        "09:00: Offensiven stanset.",
    ];

    const handleAttack = async () => {
        if (isAttacking) return;
        setIsAttacking(true);
        setLogs([]);

        // Initial shake
        controls.start({
            x: [0, -5, 5, -5, 5, 0],
            transition: { duration: 0.5 }
        });

        // Log sequence
        for (let i = 0; i < grimMessages.length; i++) {
            await new Promise(r => setTimeout(r, 800));
            setLogs(prev => [...prev, grimMessages[i]]);

            // Random shakes during report
            if (Math.random() > 0.7) {
                controls.start({ x: [0, -2, 2, 0], transition: { duration: 0.2 } });
            }
        }

        // Calculate Result (Rigged)
        const casualtyRate = 0.4 + (Math.random() * 0.4); // 40-80% casualties
        const livesLost = Math.floor(troops * casualtyRate);
        const groundGained = Math.floor(troops * (Math.random() * 0.005)); // 10k troops -> max 50m

        setTotalCasualties(prev => prev + livesLost);
        setTotalGain(prev => prev + groundGained);

        // Final heavy shake
        controls.start({
            x: [0, -10, 10, -10, 10, 0],
            backgroundColor: ["#fefce8", "#fee2e2", "#fefce8"],
            transition: { duration: 0.5 }
        });

        setLogs(prev => [...prev, `RESULTAT: ${livesLost.toLocaleString()} tap. ${groundGained} meter vunnet.`]);

        setIsAttacking(false);
        setTurnCount(prev => prev + 1);
    };

    useEffect(() => {
        if (turnCount >= 3) {
            setTimeout(() => setShowDebrief(true), 1500);
        }
    }, [turnCount]);

    return (
        <div className="w-full my-12 font-mono relative">
            <div className="bg-[#2a231e] p-6 rounded-xl shadow-2xl border border-stone-800 relative overflow-hidden">
                {/* Vignette */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-10" />

                <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left: The Report */}
                    <motion.div
                        ref={paperRef}
                        animate={controls}
                        className="bg-[#fefce8] text-stone-900 p-6 rounded-sm shadow-md min-h-[300px] flex flex-col font-mono text-sm leading-relaxed"
                        style={{ boxShadow: '1px 1px 15px rgba(0,0,0,0.2)' }}
                    >
                        <div className="border-b-2 border-stone-800 mb-4 pb-2 flex justify-between items-center opacity-70">
                            <span className="uppercase tracking-widest font-bold">Feltrapport 1916</span>
                            <Scroll className="w-5 h-5" />
                        </div>
                        <div className="flex-grow space-y-2 overflow-y-auto max-h-[250px]">
                            {logs.length === 0 && <span className="text-stone-400 italic">Mottar telemetri... Klar for angrep.</span>}
                            {logs.map((log, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={i === logs.length - 1 ? "font-bold text-red-900" : ""}
                                >
                                    {log}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: The Controls */}
                    <div className="flex flex-col justify-between space-y-6 text-stone-200">
                        {/* Stats Board */}
                        <div className="bg-black/30 p-4 rounded-lg border border-stone-700 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2 text-red-400">
                                    <Skull className="w-5 h-5" />
                                    <span className="uppercase text-xs tracking-wider">Totale Tap</span>
                                </div>
                                <span className="text-2xl font-bold font-mono text-red-500 tabular-nums">
                                    {totalCasualties.toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full h-px bg-stone-700/50" />
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2 text-green-400">
                                    <Ruler className="w-5 h-5" />
                                    <span className="uppercase text-xs tracking-wider">Terreng Vunnet</span>
                                </div>
                                <span className="text-2xl font-bold font-mono text-green-500 tabular-nums">
                                    {totalGain} m
                                </span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-4">
                            <label className="flex justify-between text-sm uppercase tracking-wide text-stone-400">
                                <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Innsats</span>
                                <span className="text-white">{troops.toLocaleString()} soldater</span>
                            </label>

                            <Slider
                                min={1000}
                                max={50000}
                                step={1000}
                                value={troops}
                                onChange={(e) => setTroops(Number(e.target.value))}
                                disabled={isAttacking}
                                color="red"
                            />

                            <button
                                onClick={handleAttack}
                                disabled={isAttacking}
                                className={`w-full py-4 text-lg font-bold tracking-widest uppercase rounded shadow-lg transition-all transform active:scale-95
                                    ${isAttacking
                                        ? 'bg-stone-700 text-stone-500 cursor-not-allowed'
                                        : 'bg-red-700 hover:bg-red-600 text-white shadow-red-900/50'
                                    }`}
                            >
                                {isAttacking ? '... ANGREP PÅGÅR ...' : 'IVERKSETT ANGREP'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Debrief Modal */}
            <AnimatePresence>
                {showDebrief && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-white text-stone-900 p-8 rounded-lg shadow-2xl max-w-md relative z-50 text-center border-4 border-red-900"
                        >
                            <TriangleAlert className="w-12 h-12 text-red-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-2 font-serif uppercase tracking-widest text-red-900">
                                Det Nytteløse Slaget
                            </h3>
                            <div className="w-16 h-1 bg-red-900 mx-auto mb-6" />

                            <p className="mb-6 text-lg leading-relaxed font-serif">
                                Du har ofret <span className="font-bold text-red-700">{totalCasualties.toLocaleString()}</span> mennesker for totalt <span className="font-bold text-green-700">{totalGain}</span> meter.
                            </p>

                            <p className="text-sm text-stone-600 mb-8 italic">
                                "Dette var virkeligheten i 1916. Ingen taktiske ferdigheter kunne overvinne maskingevær og piggtråd. Generalenes planer kollapset i møte med den industrielle krigføringens brutalitet."
                            </p>

                            <button
                                onClick={() => {
                                    setShowDebrief(false);
                                    setTurnCount(0);
                                    setTotalCasualties(0);
                                    setTotalGain(0);
                                    setLogs([]);
                                }}
                                className="bg-stone-900 text-white px-8 py-3 rounded hover:bg-stone-800 transition-colors uppercase tracking-widest font-bold text-sm"
                            >
                                Forstått
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AttritionWarfare;
