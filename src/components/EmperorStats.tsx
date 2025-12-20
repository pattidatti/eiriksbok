import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Skull,
    Clock,
    TrendingUp,
    User,
    ShieldAlert,
    Zap,
    Activity,
    Timer
} from 'lucide-react';

interface EmperorRecord {
    name: string;
    reignYears: number;
    causeOfDeath: string;
    dynasty: string;
}

const EMPEROR_DATA: EmperorRecord[] = [
    { "name": "Augustus", "reignYears": 40.59, "causeOfDeath": "Natural", "dynasty": "Julio-Claudian dynasty" },
    { "name": "Tiberius", "reignYears": 22.49, "causeOfDeath": "Natural", "dynasty": "Julio-Claudian dynasty" },
    { "name": "Caligula", "reignYears": 3.85, "causeOfDeath": "Assassinated", "dynasty": "Julio-Claudian dynasty" },
    { "name": "Claudius", "reignYears": 13.72, "causeOfDeath": "Assassinated", "dynasty": "Julio-Claudian dynasty" },
    { "name": "Nero", "reignYears": 13.66, "causeOfDeath": "Suicide", "dynasty": "Julio-Claudian dynasty" },
    { "name": "Galba", "reignYears": 0.60, "causeOfDeath": "Assassinated", "dynasty": "Year of the Four Emperors" },
    { "name": "Otho", "reignYears": 0.25, "causeOfDeath": "Suicide", "dynasty": "Year of the Four Emperors" },
    { "name": "Vitellius", "reignYears": 0.67, "causeOfDeath": "Assassinated", "dynasty": "Year of the Four Emperors" },
    { "name": "Vespasian", "reignYears": 9.98, "causeOfDeath": "Natural", "dynasty": "Flavian dynasty" },
    { "name": "Titus", "reignYears": 2.22, "causeOfDeath": "Natural", "dynasty": "Flavian dynasty" },
    { "name": "Domitian", "reignYears": 15.01, "causeOfDeath": "Assassinated", "dynasty": "Flavian dynasty" },
    { "name": "Nerva", "reignYears": 1.36, "causeOfDeath": "Natural", "dynasty": "Nerva–Antonine dynasty" },
    { "name": "Trajan", "reignYears": 19.53, "causeOfDeath": "Natural", "dynasty": "Nerva–Antonine dynasty" },
    { "name": "Hadrian", "reignYears": 20.91, "causeOfDeath": "Natural", "dynasty": "Nerva–Antonine dynasty" },
    { "name": "Antoninus Pius", "reignYears": 22.65, "causeOfDeath": "Natural", "dynasty": "Nerva–Antonine dynasty" },
    { "name": "Marcus Aurelius", "reignYears": 19.03, "causeOfDeath": "Natural", "dynasty": "Nerva–Antonine dynasty" },
    { "name": "Lucius Verus", "reignYears": 8.12, "causeOfDeath": "Natural", "dynasty": "Nerva–Antonine dynasty" },
    { "name": "Commodus", "reignYears": 12.79, "causeOfDeath": "Assassinated", "dynasty": "Nerva–Antonine dynasty" },
    { "name": "Pertinax", "reignYears": 0.24, "causeOfDeath": "Assassinated", "dynasty": "Year of the Five Emperors" },
    { "name": "Didius Julianus", "reignYears": 0.18, "causeOfDeath": "Executed", "dynasty": "Year of the Five Emperors" },
    { "name": "Septimius Severus", "reignYears": 17.82, "causeOfDeath": "Natural", "dynasty": "Severan dynasty" },
    { "name": "Caracalla", "reignYears": 6.18, "causeOfDeath": "Assassinated", "dynasty": "Severan dynasty" },
    { "name": "Geta", "reignYears": 2.25, "causeOfDeath": "Assassinated", "dynasty": "Severan dynasty" },
    { "name": "Macrinus", "reignYears": 1.18, "causeOfDeath": "Executed", "dynasty": "Severan dynasty" },
    { "name": "Elagabalus", "reignYears": 3.75, "causeOfDeath": "Assassinated", "dynasty": "Severan dynasty" },
    { "name": "Alexander Severus", "reignYears": 13.04, "causeOfDeath": "Assassinated", "dynasty": "Severan dynasty" },
    { "name": "Maximinus I Thrax", "reignYears": 3.25, "causeOfDeath": "Assassinated", "dynasty": "Crisis of the Third Century" },
    { "name": "Gordian I", "reignYears": 0.06, "causeOfDeath": "Suicide", "dynasty": "Crisis of the Third Century" },
    { "name": "Gordian II", "reignYears": 0.06, "causeOfDeath": "In Battle", "dynasty": "Crisis of the Third Century" },
    { "name": "Pupienus", "reignYears": 0.27, "causeOfDeath": "Assassinated", "dynasty": "Crisis of the Third Century" },
    { "name": "Balbinus", "reignYears": 0.27, "causeOfDeath": "Assassinated", "dynasty": "Crisis of the Third Century" },
    { "name": "Gordian III", "reignYears": 5.82, "causeOfDeath": "Unknown", "dynasty": "Crisis of the Third Century" },
    { "name": "Philip the Arab", "reignYears": 5.50, "causeOfDeath": "In Battle", "dynasty": "Crisis of the Third Century" },
    { "name": "Decius", "reignYears": 1.83, "causeOfDeath": "In Battle", "dynasty": "Crisis of the Third Century" },
    { "name": "Herennius Etruscus", "reignYears": 0.05, "causeOfDeath": "In Battle", "dynasty": "Crisis of the Third Century" },
    { "name": "Trebonianus Gallus", "reignYears": 2.16, "causeOfDeath": "Assassinated", "dynasty": "Crisis of the Third Century" },
    { "name": "Aemilian", "reignYears": 0.24, "causeOfDeath": "Assassinated", "dynasty": "Crisis of the Third Century" },
    { "name": "Valerian", "reignYears": 7.12, "causeOfDeath": "Executed", "dynasty": "Crisis of the Third Century" },
    { "name": "Gallienus", "reignYears": 15.00, "causeOfDeath": "Assassinated", "dynasty": "Crisis of the Third Century" },
    { "name": "Claudius Gothicus", "reignYears": 1.63, "causeOfDeath": "Natural", "dynasty": "Crisis of the Third Century" },
    { "name": "Quintillus", "reignYears": 0.21, "causeOfDeath": "Suicide", "dynasty": "Crisis of the Third Century" },
    { "name": "Aurelian", "reignYears": 4.90, "causeOfDeath": "Assassinated", "dynasty": "Crisis of the Third Century" },
    { "name": "Tacitus", "reignYears": 0.72, "causeOfDeath": "Natural", "dynasty": "Crisis of the Third Century" },
    { "name": "Florianus", "reignYears": 0.24, "causeOfDeath": "Assassinated", "dynasty": "Crisis of the Third Century" },
    { "name": "Probus", "reignYears": 6.18, "causeOfDeath": "Assassinated", "dynasty": "Crisis of the Third Century" },
    { "name": "Carus", "reignYears": 0.83, "causeOfDeath": "Natural", "dynasty": "Crisis of the Third Century" },
    { "name": "Carinus", "reignYears": 2.12, "causeOfDeath": "Assassinated", "dynasty": "Crisis of the Third Century" },
    { "name": "Numerian", "reignYears": 1.18, "causeOfDeath": "Unknown", "dynasty": "Crisis of the Third Century" },
    { "name": "Diocletian", "reignYears": 20.45, "causeOfDeath": "Natural", "dynasty": "Tetrarchy" },
    { "name": "Maximian", "reignYears": 19.12, "causeOfDeath": "Suicide", "dynasty": "Tetrarchy" },
    { "name": "Galerius", "reignYears": 19.12, "causeOfDeath": "Natural", "dynasty": "Tetrarchy" },
    { "name": "Constantius I", "reignYears": 13.12, "causeOfDeath": "Natural", "dynasty": "Tetrarchy" },
    { "name": "Constantine I", "reignYears": 30.82, "causeOfDeath": "Natural", "dynasty": "Constantinian dynasty" },
    { "name": "Maxentius", "reignYears": 6.00, "causeOfDeath": "In Battle", "dynasty": "Civil Wars" },
    { "name": "Licinius I", "reignYears": 16.50, "causeOfDeath": "Executed", "dynasty": "Civil Wars" },
    { "name": "Maximinus II", "reignYears": 8.12, "causeOfDeath": "Natural", "dynasty": "Tetrarchy" },
    { "name": "Constantine II", "reignYears": 2.59, "causeOfDeath": "In Battle", "dynasty": "Constantinian dynasty" },
    { "name": "Constans I", "reignYears": 12.83, "causeOfDeath": "Assassinated", "dynasty": "Constantinian dynasty" },
    { "name": "Constantius II", "reignYears": 24.50, "causeOfDeath": "Natural", "dynasty": "Constantinian dynasty" },
    { "name": "Julian", "reignYears": 1.63, "causeOfDeath": "In Battle", "dynasty": "Constantinian dynasty" },
    { "name": "Jovian", "reignYears": 0.67, "causeOfDeath": "Unknown", "dynasty": "Non-dynastic" },
    { "name": "Valentinian I", "reignYears": 11.75, "causeOfDeath": "Natural", "dynasty": "Valentinianic dynasty" },
    { "name": "Valens", "reignYears": 14.37, "causeOfDeath": "In Battle", "dynasty": "Valentinianic dynasty" },
    { "name": "Gratian", "reignYears": 16.27, "causeOfDeath": "Assassinated", "dynasty": "Valentinianic dynasty" },
    { "name": "Valentinian II", "reignYears": 16.50, "causeOfDeath": "Suicide", "dynasty": "Valentinianic dynasty" },
    { "name": "Theodosius I", "reignYears": 16.00, "causeOfDeath": "Natural", "dynasty": "Theodosian dynasty" },
    { "name": "Arcadius", "reignYears": 25.43, "causeOfDeath": "Natural", "dynasty": "Theodosian dynasty" },
    { "name": "Honorius", "reignYears": 28.58, "causeOfDeath": "Natural", "dynasty": "Theodosian dynasty" },
    { "name": "Theodosius II", "reignYears": 42.24, "causeOfDeath": "Natural", "dynasty": "Theodosian dynasty" },
    { "name": "Constantius III", "reignYears": 0.58, "causeOfDeath": "Natural", "dynasty": "Theodosian dynasty" },
    { "name": "Johannes", "reignYears": 1.50, "causeOfDeath": "Executed", "dynasty": "Usurper" },
    { "name": "Valentinian III", "reignYears": 29.39, "causeOfDeath": "Assassinated", "dynasty": "Theodosian dynasty" },
    { "name": "Marcian", "reignYears": 6.43, "causeOfDeath": "Natural", "dynasty": "Theodosian dynasty" },
    { "name": "Petronius Maximus", "reignYears": 0.21, "causeOfDeath": "Assassinated", "dynasty": "Last Western Emperors" },
    { "name": "Avitus", "reignYears": 1.25, "causeOfDeath": "Executed", "dynasty": "Last Western Emperors" },
    { "name": "Majorian", "reignYears": 4.30, "causeOfDeath": "Executed", "dynasty": "Last Western Emperors" },
    { "name": "Libius Severus", "reignYears": 3.75, "causeOfDeath": "Natural", "dynasty": "Last Western Emperors" },
    { "name": "Anthemius", "reignYears": 5.25, "causeOfDeath": "Executed", "dynasty": "Last Western Emperors" },
    { "name": "Olybrius", "reignYears": 0.58, "causeOfDeath": "Natural", "dynasty": "Last Western Emperors" },
    { "name": "Glycerius", "reignYears": 1.25, "causeOfDeath": "Unknown", "dynasty": "Last Western Emperors" },
    { "name": "Julius Nepos", "reignYears": 5.92, "causeOfDeath": "Assassinated", "dynasty": "Last Western Emperors" },
    { "name": "Romulus Augustulus", "reignYears": 0.84, "causeOfDeath": "Unknown", "dynasty": "Last Western Emperors" }
];

const CAUSE_STYLES: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
    "Natural": { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100", icon: <Activity className="w-5 h-5 text-emerald-500" /> },
    "Assassinated": { color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-100", icon: <ShieldAlert className="w-5 h-5 text-rose-500" /> },
    "Executed": { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100", icon: <Zap className="w-5 h-5 text-purple-500" /> },
    "Suicide": { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100", icon: <Skull className="w-5 h-5 text-amber-500" /> },
    "In Battle": { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100", icon: <User className="w-5 h-5 text-blue-500" /> },
    "Unknown": { color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100", icon: <Timer className="w-5 h-5 text-slate-400" /> }
};

export const EmperorStats: React.FC = () => {
    const [selectedCause, setSelectedCause] = useState<string | null>(null);

    const stats = useMemo(() => {
        const counts: Record<string, number> = {};
        let totalYears = 0;
        let longest = EMPEROR_DATA[0];
        let shortest = EMPEROR_DATA[0];

        EMPEROR_DATA.forEach(emp => {
            counts[emp.causeOfDeath] = (counts[emp.causeOfDeath] || 0) + 1;
            totalYears += emp.reignYears;
            if (emp.reignYears > longest.reignYears) longest = emp;
            if (emp.reignYears > 0 && emp.reignYears < shortest.reignYears) shortest = emp;
        });

        return {
            counts,
            avgReign: totalYears / EMPEROR_DATA.length,
            longest,
            shortest,
            total: EMPEROR_DATA.length
        };
    }, []);

    const sortedCauses = Object.entries(stats.counts).sort((a, b) => b[1] - a[1]);

    return (
        <div className="my-16 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">
                        <TrendingUp className="w-3 h-3" />
                        Historisk Analyse
                    </div>
                    <h2 className="text-4xl font-display font-black text-slate-800 tracking-tight">
                        Keisernes <span className="text-indigo-600">Skjebne</span>
                    </h2>
                    <p className="text-slate-500 mt-2 max-w-xl text-lg flex items-center gap-2">
                        En statistisk gjennomgang av {stats.total} herskere over 500 år.
                    </p>
                </div>

                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="px-6 py-3 rounded-xl bg-white shadow-sm border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-black uppercase mb-1">Snitt regjeringstid</div>
                        <div className="text-2xl font-mono font-black text-slate-800">{stats.avgReign.toFixed(1)} <span className="text-sm font-bold text-slate-400 font-sans">år</span></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
                {/* Cause of Death List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Dødsårsaker
                        </h3>
                        <span className="text-[10px] text-slate-400 italic">Klikk for å se navn</span>
                    </div>

                    <div className="space-y-3">
                        {sortedCauses.map(([cause, count]) => {
                            const isSelected = selectedCause === cause;
                            const style = CAUSE_STYLES[cause];
                            const percentage = (count / stats.total) * 100;

                            return (
                                <div key={cause} className="group">
                                    <motion.button
                                        whileHover={{ x: 4 }}
                                        onClick={() => setSelectedCause(isSelected ? null : cause)}
                                        className={`w-full text-left p-5 rounded-3xl transition-all border flex flex-col gap-4 ${isSelected ? 'bg-white shadow-xl shadow-indigo-100/50 border-indigo-200 ring-4 ring-indigo-50' : 'bg-white border-slate-100 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-2xl ${style.bg} ${style.color}`}>
                                                    {style.icon}
                                                </div>
                                                <div>
                                                    <p className={`font-black text-sm uppercase tracking-tight ${isSelected ? 'text-indigo-600' : 'text-slate-700'}`}>
                                                        {cause === 'Natural' ? 'Naturlige årsaker' :
                                                            cause === 'Assassinated' ? 'Snikmord' :
                                                                cause === 'Executed' ? 'Henrettet' :
                                                                    cause === 'Suicide' ? 'Selvmord' :
                                                                        cause === 'In Battle' ? 'Falt i kamp' : 'Ukjent'}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${percentage}%` }}
                                                                transition={{ duration: 1, delay: 0.2 }}
                                                                className={`h-full ${style.bg.replace('bg-', 'bg-').replace('50', '500')}`}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{percentage.toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                                <span className="text-xl font-mono font-black text-slate-800">{count}</span>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="pt-4 border-t border-slate-100"
                                                >
                                                    <div className="flex flex-wrap gap-2">
                                                        {EMPEROR_DATA.filter(e => e.causeOfDeath === cause).map(e => (
                                                            <span key={e.name} className="px-3 py-1.5 bg-slate-50 rounded-xl text-[11px] font-bold text-slate-600 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-colors">
                                                                {e.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                        <Clock className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10" />

                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-10 text-indigo-100 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Tids-ekstremer
                        </h3>

                        <div className="space-y-10 relative z-10">
                            <div className="group">
                                <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mb-1 group-hover:text-white transition-colors">Lengst regjeringstid</div>
                                <div className="text-2xl font-display font-black leading-tight border-l-2 border-indigo-400 pl-4 py-1">
                                    {stats.longest.name}
                                </div>
                                <div className="text-4xl font-mono font-black mt-2 text-white">
                                    {stats.longest.reignYears} <span className="text-lg font-normal text-indigo-200 font-sans tracking-tight">år</span>
                                </div>
                            </div>

                            <div className="group border-t border-indigo-500/30 pt-8">
                                <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mb-1 group-hover:text-white transition-colors">Kortest regjeringstid</div>
                                <div className="text-2xl font-display font-black leading-tight border-l-2 border-rose-400 pl-4 py-1">
                                    {stats.shortest.name}
                                </div>
                                <div className="text-4xl font-mono font-black mt-2 text-rose-100">
                                    ~18 <span className="text-lg font-normal text-indigo-200 font-sans tracking-tight">dager</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h3 className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            Risiko-fakta
                        </h3>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                                "Det var statistisk sett farligere å være keiser enn å være en legionær i frontlinjen."
                            </p>
                            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                <div className="text-[10px] text-rose-400 font-black uppercase mb-1">Snikmord-rate</div>
                                <div className="text-3xl font-mono font-black text-rose-600">
                                    {((stats.counts['Assassinated'] / stats.total) * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
