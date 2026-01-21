
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Fan, ArrowUp } from 'lucide-react';
import { Slider } from '../../ui/Slider';

const GasAttackSim: React.FC = () => {
    const [windDirection, setWindDirection] = useState(0); // 0 = Due North (Towards Enemy)
    const [intensity, setIntensity] = useState(50);
    const [isActive, setIsActive] = useState(false);
    const [outcome, setOutcome] = useState<'neutral' | 'success' | 'fail'>('neutral');

    // Wind Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            // Random jitter: -20 to +20 degrees usually, but with chance of full 180 flip
            const jitter = (Math.random() - 0.5) * 40;
            const suddenShift = Math.random() > 0.9 ? 180 : 0; // 10% chance of catastrophe if active

            setWindDirection(prev => {
                let next = prev + jitter + suddenShift;
                // Normalize to -180 to 180
                if (next > 180) next -= 360;
                if (next < -180) next += 360;
                return next * 0.9; // Gently pull back to 0 (North/Enemy) over time to make it playable
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleRelease = () => {
        setIsActive(true);
        setTimeout(() => {
            // Determine fate
            if (windDirection > 90 || windDirection < -90) {
                setOutcome('fail');
            } else {
                setOutcome('success');
            }
            setIsActive(false);
        }, 4000);
    };

    const reset = () => {
        setOutcome('neutral');
        setWindDirection(0);
    };

    return (
        <div className="w-full my-12 font-sans select-none">
            <div className="bg-slate-200 dark:bg-slate-800 p-6 rounded-xl shadow-inner border-4 border-slate-300 dark:border-slate-700 relative overflow-hidden">

                {/* Header: Instrument Panel */}
                <div className="flex justify-between items-center mb-8 border-b-2 border-slate-400 pb-2">
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                        <Wind className="w-6 h-6" />
                        <span className="font-bold uppercase tracking-widest text-lg">Væroffiserens Panel</span>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left: Wind Gauge */}
                    <div className="relative h-64 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-400 flex items-center justify-center overflow-hidden">
                        {/* Compass Rose */}
                        <div className="absolute text-slate-300 font-bold text-xs top-2">FIENDE (NORD)</div>
                        <div className="absolute text-slate-300 font-bold text-xs bottom-2">OSS (SØR)</div>
                        <div className="w-48 h-48 border-2 border-slate-200 rounded-full absolute" />

                        {/* Wind Arrow */}
                        <motion.div
                            animate={{ rotate: windDirection }}
                            transition={{ type: "spring", stiffness: 50 }}
                            className="bg-slate-800 dark:bg-slate-200 w-2 h-24 rounded-full origin-bottom relative z-10"
                            style={{ bottom: '50%', transformOrigin: 'bottom center' }}
                        >
                            <ArrowUp className="absolute -top-4 -left-2 w-6 h-6 text-slate-800 dark:text-slate-200" />
                        </motion.div>

                        {/* Center Pin */}
                        <div className="w-4 h-4 bg-red-500 rounded-full absolute z-20 shadow-sm" />

                        {/* Gas Cloud Visualization */}
                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                                    animate={{
                                        opacity: 0.8,
                                        scale: 3,
                                        y: windDirection > 90 || windDirection < -90 ? 100 : -100 // Visual drift based on wind (roughly)
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 3 }}
                                    className="absolute inset-0 bg-green-500/30 blur-xl rounded-full pointer-events-none"
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right: Controls */}
                    <div className="flex flex-col justify-center space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 font-bold text-sm uppercase">
                                <Fan className="w-4 h-4" />
                                <span>Ventilåpning (%)</span>
                            </label>
                            <Slider
                                value={intensity}
                                onChange={(e) => setIntensity(Number(e.target.value))}
                                color="green"
                                disabled={isActive || outcome !== 'neutral'}
                            />
                        </div>

                        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded text-xs text-slate-500 font-mono">
                            STATUS: {isActive ? "VENTILER ÅPNE..." : "AVVENTER ORDRE"}
                            <br />
                            VINDRETNING: {Math.round(windDirection)}° avvik
                        </div>

                        {outcome === 'neutral' ? (
                            <button
                                onClick={handleRelease}
                                disabled={isActive}
                                className={`w-full py-4 text-xl font-black uppercase tracking-widest rounded shadow-lg transition-all
                                    ${isActive
                                        ? 'bg-slate-400 cursor-wait'
                                        : 'bg-green-700 hover:bg-green-600 text-white shadow-green-900/50 hover:-translate-y-1'
                                    }`}
                            >
                                {isActive ? 'FRIGJØR GASS...' : 'ÅPNE VENTILER'}
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`p-4 rounded-lg border-2 text-center text-white font-bold uppercase tracking-wide
                                        ${outcome === 'success' ? 'bg-green-600 border-green-400' : 'bg-red-600 border-red-400 animate-pulse'}`}
                                >
                                    {outcome === 'success' ? 'Vellykket angrep. Fienden flykter.' : 'KRITISK FEIL! Vinden snudde! Gass mot egne linjer!'}
                                </motion.div>
                                <button onClick={reset} className="w-full py-2 bg-slate-500 text-white rounded font-bold hover:bg-slate-400">
                                    Nullstill Simulator
                                </button>
                            </div>
                        )}

                    </div>
                </div>

                <div className="mt-6 text-center text-slate-500 text-xs italic">
                    ADVARSEL: Vinden kan snu på sekunder. Suksess er aldri garantert.
                </div>
            </div>
        </div>
    );
};

export default GasAttackSim;
