import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, BarChart2, Users, AlertTriangle, TrendingUp } from 'lucide-react';

export const DTMSimulator = () => {
    const [phase, setPhase] = useState(1);

    // Data model for the DTM
    const phases = [
        {
            id: 1,
            title: "Fase 1: Høy likevekt",
            desc: "Før-industriell. Både fødselsraten og dødsraten er svært høy. Befolkningen vokser lite.",
            birthRate: 38,
            deathRate: 37,
            population: 10,
            color: "bg-stone-500",
            icon: AlertTriangle,
            details: "Sykdom, sult og mangel på hygiene holder dødsraten høy."
        },
        {
            id: 2,
            title: "Fase 2: Tidlig vekst",
            desc: "Befolkningseksplosjon. Dødsraten faller kraftig, men fødselsraten er fortsatt høy.",
            birthRate: 38,
            deathRate: 20,
            population: 30,
            color: "bg-emerald-500",
            icon: TrendingUp,
            details: "Bedre hygiene, mat og medisiner redder liv. Tradisjoner holder barnetallene oppe."
        },
        {
            id: 3,
            title: "Fase 3: Sen vekst",
            desc: "Fødselsraten begynner å falle. Befolkningen vokser fortsatt, men saktere.",
            birthRate: 25,
            deathRate: 12,
            population: 65,
            color: "bg-blue-500",
            icon: Users,
            details: "Urbanisering, utdanning for kvinner og lavere barnedødelighet reduserer fødsler."
        },
        {
            id: 4,
            title: "Fase 4: Lav likevekt",
            desc: "Stabilisering. Både fødsels- og dødsrate er lave.",
            birthRate: 11,
            deathRate: 10,
            population: 85,
            color: "bg-indigo-500",
            icon: BarChart2,
            details: "Moderne samfunn. Høy levealder, familieplanlegging er normen."
        },
        {
            id: 5,
            title: "Fase 5: Nedgang",
            desc: "Dødsraten går forbi fødselsraten. Befolkningen begynner å synke.",
            birthRate: 9,
            deathRate: 11,
            population: 80,
            color: "bg-rose-500",
            icon: AlertTriangle,
            details: "Eldrebølge. Svært lave fødselstall gir nye utfordringer."
        }
    ];

    const currentPhase = phases[phase - 1];
    const PhaseIcon = currentPhase.icon;

    return (
        <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 font-sans">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        Den demografiske overgangen
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Utforsk hvordan befolkningen utvikler seg over tid.</p>
                </div>
                <div className="hidden md:block px-4 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
                    Interaktiv Modell
                </div>
            </div>

            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 md:gap-12">
                {/* Visual Graph Area */}
                <div className="relative h-64 md:h-80 bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-end justify-between overflow-hidden">
                    {/* Background Grid */}
                    <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 opacity-10 pointer-events-none">
                        {[...Array(25)].map((_, i) => <div key={i} className="border-r border-t border-slate-900" />)}
                    </div>

                    {/* Chart Visualization */}
                    <div className="relative w-full h-full flex items-end">
                        {/* Population Area (Simulated) */}
                        <div className="absolute bottom-0 left-0 w-full bg-indigo-100/50 transition-all duration-700 ease-in-out"
                            style={{
                                height: `${currentPhase.population}%`,
                                clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 0)'
                            }}
                        />

                        {/* Bars for Rates */}
                        <div className="w-full flex justify-around items-end h-full z-10 px-4 pb-2 gap-4">
                            <div className="relative flex-1 h-full flex items-end justify-center group">
                                <div className="w-full bg-emerald-500/20 absolute bottom-0 rounded-t-lg transition-all duration-500" style={{ height: `${currentPhase.birthRate * 2.5}%` }}></div>
                                <div className="z-10 bg-emerald-500 w-8 md:w-16 rounded-t-lg shadow-lg relative transition-all duration-500" style={{ height: `${currentPhase.birthRate * 2.5}%` }}>
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-emerald-700 px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap">
                                        Fødsler: {currentPhase.birthRate}‰
                                    </span>
                                </div>
                                <span className="absolute bottom-[-24px] text-xs font-bold text-slate-500 uppercase tracking-wide">Fødselsrate</span>
                            </div>

                            <div className="relative flex-1 h-full flex items-end justify-center group">
                                <div className="w-full bg-rose-500/20 absolute bottom-0 rounded-t-lg transition-all duration-500" style={{ height: `${currentPhase.deathRate * 2.5}%` }}></div>
                                <div className="z-10 bg-rose-500 w-8 md:w-16 rounded-t-lg shadow-lg relative transition-all duration-500" style={{ height: `${currentPhase.deathRate * 2.5}%` }}>
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-rose-700 px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap">
                                        Døde: {currentPhase.deathRate}‰
                                    </span>
                                </div>
                                <span className="absolute bottom-[-24px] text-xs font-bold text-slate-500 uppercase tracking-wide">Dødsrate</span>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Controls and Information */}
                <div>
                    <div className="mb-6">
                        <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={phase}
                            onChange={(e) => setPhase(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">
                            <span>Høy likevekt</span>
                            <span>Vekst</span>
                            <span>Stabilt</span>
                            <span>Nedgang</span>
                        </div>
                    </div>

                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentPhase.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-slate-50 border border-slate-200 rounded-xl p-5"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-lg ${currentPhase.color} text-white`}>
                                    <PhaseIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">{currentPhase.title}</h3>
                            </div>

                            <p className="text-slate-600 mb-4 leading-relaxed">
                                {currentPhase.desc}
                            </p>

                            <div className="flex items-start gap-2 text-sm text-indigo-700 bg-indigo-50 p-3 rounded-lg">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{currentPhase.details}</span>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
