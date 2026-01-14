import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp } from 'lucide-react';

export const SpecializationSlider: React.FC = () => {
    const [workers, setWorkers] = useState(1);

    // Adam Smith's Pin Factory simplified logic
    // 1 worker = 1 pin (generalized task switching cost)
    // 10 workers = 48,000 pins (4800 per person) due to specialization

    const calculateProduction = (numWorkers: number) => {
        if (numWorkers === 1) return 1;
        // Exponential growth curve to simulate specialization benefits
        // Base productivity per worker increases with N
        const productivityPerWorker = 1 + Math.pow(numWorkers, 2.5);
        return Math.floor(productivityPerWorker * numWorkers);
    };

    const production = calculateProduction(workers);
    const productionPerPerson = Math.floor(production / workers);

    return (
        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                Produktivitets-kalkulator
            </h3>

            <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                    <label className="text-sm font-bold text-slate-700">Antall arbeidere</label>
                    <span className="text-2xl font-bold text-indigo-600">{workers}</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={workers}
                    onChange={(e) => setWorkers(parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
                    <span>1 (Generalist)</span>
                    <span>10 (Spesialister)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visual Representation */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap content-start gap-1 h-[140px] overflow-hidden">
                    {Array.from({ length: workers }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 border border-indigo-200"
                            title={workers > 1 ? "Spesialist" : "Generalist"}
                        >
                            <Users className="w-4 h-4" />
                        </motion.div>
                    ))}
                    {workers > 1 && (
                        <div className="w-full text-xs text-center text-slate-400 mt-2 italic">
                            Hver arbeider gjør nå én spesifikk oppgave.
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-4">
                    <div>
                        <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Total produksjon</div>
                        <div className="text-3xl font-black text-emerald-800 font-mono">
                            {production.toLocaleString()} <span className="text-sm font-normal text-emerald-600">knappenåler/dag</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-emerald-100">
                        <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Per person</div>
                        <div className="text-xl font-bold text-emerald-700">
                            {productionPerPerson.toLocaleString()}
                            <span className="text-xs ml-1 font-normal opacity-70">
                                ({productionPerPerson}x mer enn alene!)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-lg border border-slate-100">
                {workers === 1 ? (
                    <p>
                        Når én person må gjøre <strong>alt</strong> (hente metall, rette tråden, slipe spissen), går mye tid bort til å bytte verktøy og oppgaver.
                    </p>
                ) : (
                    <p>
                        Ved å dele opp jobben (spesialisering), slipper arbeiderne å bytte verktøy. De blir også ekstremt raske på sin lille del av oppgaven.
                        Dette er hemmeligheten bak den industrielle revolusjon og moderne velstand.
                    </p>
                )}
            </div>
        </div>
    );
};
