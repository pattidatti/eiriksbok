import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, RefreshCw } from 'lucide-react';

interface ProxyKrigWebbenProps {
    title?: string;
}

interface Conflict {
    id: string;
    label: string;
    position: { top: string; left: string };
    saudi: { side: string; support: string } | null;
    iran: { side: string; support: string } | null;
    outcome: string;
}

const CONFLICTS: Conflict[] = [
    {
        id: 'jemen',
        label: 'Jemen',
        position: { top: '72%', left: '20%' },
        saudi: { side: 'Jemens regjering', support: 'Leder militærkoalisjon, bomber Houthi-omrader' },
        iran: { side: 'Houthi-opprørerne', support: 'Vapen, rakketter, militær radvgiving' },
        outcome: 'Verdens verste humanitære krise. Millioner sulter. Begge parter nekter a gi seg.',
    },
    {
        id: 'syria',
        label: 'Syria',
        position: { top: '25%', left: '32%' },
        saudi: { side: 'Opprørsgrupper', support: 'Finansiering og vapen til sunni-opprørere' },
        iran: { side: 'Assad-regimet', support: 'Iranske soldater, Hizbollah-styrker, penger' },
        outcome: 'Assad vant med iransk og russisk hjelp. 300 000 drept, 13 millioner pa flukt.',
    },
    {
        id: 'libanon',
        label: 'Libanon',
        position: { top: '22%', left: '62%' },
        saudi: null,
        iran: { side: 'Hizbollah', support: 'Militær trening, raketter, finansiering siden 1982' },
        outcome: 'Hizbollah er i dag sterkere enn den libanesiske hæren. Iran har effektivt en proxy pa Israels grense.',
    },
    {
        id: 'irak',
        label: 'Irak',
        position: { top: '35%', left: '65%' },
        saudi: { side: 'Sunni-grupper', support: 'Finansiering og diplomatisk støtte' },
        iran: { side: 'Shia-militser', support: 'Trening, vapen og direkte kommando via Revolusjonsgarden' },
        outcome: 'Irak er formelt alliert med USA, men Iran har stor innflytelse over de mest bevæpnede gruppene i landet.',
    },
];

export function ProxyKrigWebben({ title = 'Saudi-Arabia og Iran: skyggekonfliktene' }: ProxyKrigWebbenProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [seen, setSeen] = useState<Set<string>>(new Set());

    const conflict = CONFLICTS.find((c) => c.id === selected) ?? null;
    const isComplete = seen.size >= 3;

    const handleSelect = (id: string) => {
        setSelected(id === selected ? null : id);
        setSeen((prev) => new Set([...prev, id]));
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden not-prose my-6">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <Network className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Klikk pa en konflikt for a se hvem som støtter hvem</p>
                </div>
            </div>

            <div className="p-4">
                {/* Network visualization */}
                <div className="relative h-52 rounded-lg border border-slate-100 bg-slate-50 mb-3">
                    {/* Saudi Arabia node */}
                    <div className="absolute top-[35%] left-[3%] flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-green-600 border-2 border-green-700 flex items-center justify-center shadow-sm">
                            <span className="text-white text-[9px] font-bold text-center leading-tight">Saudi-Arabia</span>
                        </div>
                        <span className="text-[8px] text-slate-400 mt-1">Sunni</span>
                    </div>

                    {/* Iran node */}
                    <div className="absolute top-[35%] right-[3%] flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-rose-600 border-2 border-rose-700 flex items-center justify-center shadow-sm">
                            <span className="text-white text-[9px] font-bold text-center leading-tight">Iran</span>
                        </div>
                        <span className="text-[8px] text-slate-400 mt-1">Shia</span>
                    </div>

                    {/* Conflict nodes */}
                    {CONFLICTS.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => handleSelect(c.id)}
                            style={{ top: c.position.top, left: c.position.left }}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                                selected === c.id
                                    ? 'z-10'
                                    : 'hover:scale-105'
                            }`}
                        >
                            <motion.div
                                animate={selected === c.id ? { scale: 1.1 } : { scale: 1 }}
                                className={`rounded-lg border-2 px-2.5 py-1.5 text-[10px] font-bold shadow-sm ${
                                    selected === c.id
                                        ? 'bg-indigo-600 border-indigo-700 text-white'
                                        : seen.has(c.id)
                                          ? 'bg-slate-100 border-slate-300 text-slate-600'
                                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                                }`}
                            >
                                {c.label}
                            </motion.div>
                        </button>
                    ))}

                    {/* Connection lines - simplified SVG */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                        {CONFLICTS.map((c) => {
                            const isSelected = selected === c.id;
                            return (
                                <g key={c.id}>
                                    {c.saudi && (
                                        <line
                                            x1="10%"
                                            y1="42%"
                                            x2={c.position.left}
                                            y2={c.position.top}
                                            stroke={isSelected ? '#16a34a' : '#dcfce7'}
                                            strokeWidth={isSelected ? 2 : 1}
                                            strokeDasharray={isSelected ? '0' : '4,4'}
                                        />
                                    )}
                                    {c.iran && (
                                        <line
                                            x1="90%"
                                            y1="42%"
                                            x2={c.position.left}
                                            y2={c.position.top}
                                            stroke={isSelected ? '#dc2626' : '#fee2e2'}
                                            strokeWidth={isSelected ? 2 : 1}
                                            strokeDasharray={isSelected ? '0' : '4,4'}
                                        />
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Detail panel */}
                <AnimatePresence mode="wait">
                    {conflict ? (
                        <motion.div
                            key={conflict.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2"
                        >
                            <div className="text-sm font-semibold text-slate-800">{conflict.label}</div>
                            <div className="grid grid-cols-2 gap-2">
                                {conflict.saudi ? (
                                    <div className="rounded-lg border border-green-200 bg-green-50 px-2.5 py-2">
                                        <div className="text-[9px] font-bold uppercase tracking-wide text-green-700 mb-1">Saudi-Arabia støtter</div>
                                        <div className="text-xs font-semibold text-green-900 mb-0.5">{conflict.saudi.side}</div>
                                        <div className="text-[10px] text-green-800 leading-relaxed">{conflict.saudi.support}</div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 flex items-center justify-center">
                                        <span className="text-[10px] text-slate-400 italic">Saudi-Arabia ikke aktiv</span>
                                    </div>
                                )}
                                {conflict.iran ? (
                                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2">
                                        <div className="text-[9px] font-bold uppercase tracking-wide text-rose-700 mb-1">Iran støtter</div>
                                        <div className="text-xs font-semibold text-rose-900 mb-0.5">{conflict.iran.side}</div>
                                        <div className="text-[10px] text-rose-800 leading-relaxed">{conflict.iran.support}</div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 flex items-center justify-center">
                                        <span className="text-[10px] text-slate-400 italic">Iran ikke aktiv</span>
                                    </div>
                                )}
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                                <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500 mb-1">Resultat for landet</div>
                                <p className="text-[10px] text-slate-700 leading-relaxed">{conflict.outcome}</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center text-xs text-slate-400 py-2"
                        >
                            Klikk pa en konflikt i kartet
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Completion */}
                <AnimatePresence>
                    {isComplete && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5"
                        >
                            <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                                Mønsteret er klart: Saudi-Arabia og Iran kjemper aldri direkte mot hverandre. De kjemper gjennom andre. Og det er folket i Jemen, Syria, Libanon og Irak som betaler prisen.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">{seen.size} av {CONFLICTS.length} konflikter utforsket</span>
                <button
                    onClick={() => { setSelected(null); setSeen(new Set()); }}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors"
                >
                    <RefreshCw className="w-3 h-3" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
