import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Tractor, Calendar } from 'lucide-react';

export const UrbanizationTimeline = () => {
    const [year, setYear] = useState<number>(1900);

    // Data points
    const timeline = [
        { y: 1800, urban: 3, label: "Tidlig industrialisering", buildings: 1, farms: 10 },
        { y: 1900, urban: 14, label: "Fabrikkene vokser", buildings: 4, farms: 8 },
        { y: 1950, urban: 30, label: "Etterkrigstidens boom", buildings: 8, farms: 6 },
        { y: 2000, urban: 47, label: "Millennium", buildings: 12, farms: 4 },
        { y: 2020, urban: 56, label: "Urban majoritet", buildings: 15, farms: 2 },
        { y: 2050, urban: 68, label: "Fremtiden", buildings: 20, farms: 1 }
    ];

    // Get interpolated values (simple snapping for now for robustness)
    const current = timeline.reduce((prev, curr) =>
        (Math.abs(curr.y - year) < Math.abs(prev.y - year) ? curr : prev)
    );

    return (
        <div className="w-full bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden font-sans border border-slate-700">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-cyan-400" />
                        Urbanisering: Flukten til byen
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Verdens befolkning som bor i byer</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-black text-cyan-400">{current.urban}%</div>
                    <div className="text-xs uppercase tracking-wider text-slate-500">Urban Andel</div>
                </div>
            </div>

            <div className="relative h-64 bg-gradient-to-b from-sky-900 via-slate-800 to-slate-900 overflow-hidden">
                {/* Sun/Moon */}
                <div className="absolute top-8 right-12 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full blur-sm opacity-80" />

                {/* Cityscape (Back Layer) */}
                <div className="absolute bottom-0 left-0 w-full flex items-end justify-center px-8 gap-1 transition-all duration-1000">
                    {[...Array(current.buildings)].map((_, i) => (
                        <motion.div
                            key={`b-${i}`}
                            layoutId={`b-${i}`}
                            className="bg-cyan-900/40 w-8 md:w-16 rounded-t-sm backdrop-blur-sm border-t border-cyan-500/30"
                            style={{ height: `${20 + (i * 5) % 80}%` }}
                        />
                    ))}
                </div>

                {/* Cityscape (Front Layer) */}
                <div className="absolute bottom-0 left-0 w-full flex items-end justify-center px-4 gap-2 transition-all duration-1000">
                    {[...Array(Math.floor(current.buildings * 0.7))].map((_, i) => (
                        <motion.div
                            key={`bf-${i}`}
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            className="bg-slate-950 w-6 md:w-12 rounded-t-sm border-t border-cyan-600/30 shadow-lg relative"
                            style={{ height: `${30 + (i * 7) % 60}%` }}
                        >
                            {/* Windows */}
                            <div className="absolute inset-2 grid grid-cols-2 gap-1 overflow-hidden">
                                {[...Array(6)].map((_, w) => <div key={w} className={`w-full h-1 bg-yellow-100/20 rounded-full ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-20'}`} />)}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Rural (Fading out) */}
                <div className="absolute bottom-4 left-4 flex gap-4 transition-all duration-1000" style={{ opacity: current.farms / 10 }}>
                    <Tractor className="w-8 h-8 text-emerald-600" />
                    <Tractor className="w-8 h-8 text-emerald-700" />
                </div>
            </div>

            <div className="p-8 bg-slate-900">
                <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono">
                    <span>1800</span>
                    <span>2050</span>
                </div>
                <input
                    type="range"
                    min="1800"
                    max="2050"
                    step="5"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 mb-6"
                />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <span className="text-2xl font-bold text-white">{current.y}</span>
                    </div>
                    <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-cyan-300 font-medium">
                        {current.label}
                    </div>
                </div>
            </div>
        </div>
    );
};
