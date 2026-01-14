import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Tractor, Calendar, Sun, Cloud } from 'lucide-react';

export const UrbanizationTimeline = () => {
    const [year, setYear] = useState<number>(1900);

    // Data points
    const timeline = [
        { y: 1800, urban: 3, label: "Tidlig industrialisering", buildings: 2, farms: 12 },
        { y: 1900, urban: 14, label: "Fabrikkene vokser", buildings: 5, farms: 9 },
        { y: 1950, urban: 30, label: "Etterkrigstidens boom", buildings: 8, farms: 6 },
        { y: 2000, urban: 47, label: "Millennium", buildings: 12, farms: 4 },
        { y: 2020, urban: 56, label: "Urban majoritet", buildings: 16, farms: 2 },
        { y: 2050, urban: 68, label: "Fremtiden", buildings: 22, farms: 1 }
    ];

    // Interpolate values for smoother transition
    const getInterpolatedData = (targetYear: number) => {
        // Find segments
        const sorted = [...timeline].sort((a, b) => a.y - b.y);
        const lower = sorted.reverse().find(p => p.y <= targetYear) || timeline[0];
        const upper = timeline.find(p => p.y >= targetYear) || timeline[timeline.length - 1];

        if (lower.y === upper.y) return lower;

        const range = upper.y - lower.y;
        const progress = (targetYear - lower.y) / range;

        return {
            y: targetYear,
            urban: Math.round(lower.urban + (upper.urban - lower.urban) * progress),
            label: progress > 0.5 ? upper.label : lower.label,
            buildings: Math.round(lower.buildings + (upper.buildings - lower.buildings) * progress),
            farms: Math.round(lower.farms + (upper.farms - lower.farms) * progress)
        };
    };

    const current = getInterpolatedData(year);

    return (
        <div className="w-full bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden font-sans border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                        Urbanisering: Flukten til byen
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Verdens befolkning som bor i byer</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-black text-indigo-600">{current.urban}%</div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Urban Andel</div>
                </div>
            </div>

            {/* Visualisation Stage */}
            <div className="relative h-72 bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-50 overflow-hidden">

                {/* Sun */}
                <motion.div
                    className="absolute top-6 right-8"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                >
                    <Sun className="w-16 h-16 text-yellow-400 fill-yellow-400 opacity-90" />
                </motion.div>

                {/* Cloud Decoration */}
                <div className="absolute top-10 left-10 opacity-60">
                    <Cloud className="w-12 h-12 text-white fill-white" />
                </div>
                <div className="absolute top-20 left-1/2 opacity-40">
                    <Cloud className="w-16 h-16 text-white fill-white" />
                </div>

                {/* Ground */}
                <div className="absolute bottom-0 w-full h-4 bg-emerald-100/50 z-20" />

                {/* Cityscape Container */}
                <div className="absolute bottom-0 left-0 w-full flex items-end justify-center px-4 md:px-12 gap-1 md:gap-2 h-full pb-2">
                    <AnimatePresence>
                        {[...Array(22)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{
                                    height: i < current.buildings ? `${20 + (i * 7) % 60}%` : 0,
                                    opacity: i < current.buildings ? 1 : 0
                                }}
                                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                                className={`w-full max-w-[3rem] rounded-t-md relative shadow-sm border-t border-x border-slate-300 bg-slate-100
                                    ${i < current.buildings ? 'block' : 'hidden'}
                                `}
                            >
                                {/* Windows pattern */}
                                <div className="absolute inset-2 grid grid-cols-2 gap-1 overflow-hidden content-start opacity-70">
                                    {[...Array(8)].map((_, w) => (
                                        <div key={w} className={`w-full aspect-square rounded-sm ${w % 2 === 0 ? 'bg-indigo-200' : 'bg-slate-200'}`} />
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Rural / Tractors */}
                <div className="absolute bottom-4 left-4 flex gap-2 transition-all duration-700 z-30">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={`tractor-${i}`}
                            animate={{
                                opacity: i * 4 < current.farms ? 1 : 0,
                                x: i * 4 < current.farms ? 0 : -20
                            }}
                            className="bg-white/80 p-2 rounded-full backdrop-blur-sm shadow-sm border border-emerald-100"
                        >
                            <Tractor className="w-6 h-6 text-emerald-600" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="p-8 bg-white">
                <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono font-medium">
                    <span>1800</span>
                    <span>2050</span>
                </div>
                <input
                    type="range"
                    min="1800"
                    max="2050"
                    step="1"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-8 border border-slate-200 hover:bg-slate-200 transition-colors"
                />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-3xl font-bold text-slate-800 tracking-tight">{current.y}</span>
                    </div>
                    <div className="px-5 py-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 font-medium shadow-sm">
                        {current.label}
                    </div>
                </div>
            </div>
        </div>
    );
};
