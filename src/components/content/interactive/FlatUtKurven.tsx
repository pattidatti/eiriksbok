import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, School, Users, BedDouble, Hand, RotateCcw, CheckCircle2 } from 'lucide-react';

interface Measure {
    id: string;
    label: string;
    icon: typeof School;
}

const MEASURES: Measure[] = [
    { id: 'skole', label: 'Steng skolene', icon: School },
    { id: 'mote', label: 'Forby folkemøter', icon: Users },
    { id: 'isoler', label: 'Isoler de syke', icon: BedDouble },
    { id: 'vask', label: 'Vask hendene ofte', icon: Hand },
];

// Graf-geometri
const W = 320;
const H = 170;
const LEFT = 18;
const RIGHT = 304;
const BASE = 146; // x-akse (tid)
const CENTER = (LEFT + RIGHT) / 2;
const CAPACITY = 74; // høyde over baselinjen = sykehusets kapasitet
const STEPS = 44;

// Lager en klokkeformet smittekurve som svarer til antall tiltak.
// Flere tiltak: lavere topp, bredere kurve (smitten spres ut over tid).
function curvePath(measures: number): string {
    const amp = 116 - measures * 23; // topp i piksler
    const sigma = 26 + measures * 11; // bredde
    const pts: string[] = [];
    for (let i = 0; i <= STEPS; i++) {
        const x = LEFT + ((RIGHT - LEFT) * i) / STEPS;
        const y = BASE - amp * Math.exp(-((x - CENTER) ** 2) / (2 * sigma * sigma));
        pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
}

function curveArea(measures: number): string {
    return `${curvePath(measures)} L${RIGHT},${BASE} L${LEFT},${BASE} Z`;
}

interface FlatUtKurvenProps {
    title?: string;
}

export function FlatUtKurven({ title = 'Flat ut kurven' }: FlatUtKurvenProps) {
    const [active, setActive] = useState<Set<string>>(new Set());

    const toggle = (id: string) => {
        setActive((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const reset = () => setActive(new Set());

    const m = active.size;
    const amp = 116 - m * 23;
    const underCapacity = amp <= CAPACITY;
    const path = useMemo(() => curvePath(m), [m]);
    const area = useMemo(() => curveArea(m), [m]);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Skru på tiltak og se hva som skjer med smittetoppen.
                    </p>
                </div>
            </div>

            {/* Graf */}
            <div className="px-6 pt-5">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Smittekurve">
                    {/* kapasitetslinje */}
                    <line
                        x1={LEFT}
                        y1={BASE - CAPACITY}
                        x2={RIGHT}
                        y2={BASE - CAPACITY}
                        stroke="#f43f5e"
                        strokeWidth={1.5}
                        strokeDasharray="5 4"
                    />
                    <text x={RIGHT} y={BASE - CAPACITY - 6} textAnchor="end" className="fill-rose-500" fontSize="10" fontWeight="600">
                        Sykehusets kapasitet
                    </text>
                    {/* x-akse */}
                    <line x1={LEFT} y1={BASE} x2={RIGHT} y2={BASE} stroke="#cbd5e1" strokeWidth={1.5} />
                    <text x={LEFT} y={BASE + 14} className="fill-slate-400" fontSize="9">
                        Tid
                    </text>

                    {/* areal under kurven */}
                    <motion.path
                        animate={{ d: area }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        fill={underCapacity ? 'rgba(16,185,129,0.16)' : 'rgba(244,63,94,0.16)'}
                        stroke="none"
                    />
                    {/* selve kurven */}
                    <motion.path
                        animate={{ d: path }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        fill="none"
                        stroke={underCapacity ? '#10b981' : '#f43f5e'}
                        strokeWidth={3}
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* Tiltaksknapper */}
            <div className="px-6 pt-3 grid grid-cols-2 gap-2">
                {MEASURES.map((meas) => {
                    const Icon = meas.icon;
                    const on = active.has(meas.id);
                    return (
                        <motion.button
                            key={meas.id}
                            onClick={() => toggle(meas.id)}
                            whileTap={{ scale: 0.96 }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                                on
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            {meas.label}
                        </motion.button>
                    );
                })}
            </div>

            {/* Feedback-sone */}
            <div className="mx-6 my-4 px-4 py-3 rounded-lg text-sm min-h-[3.25rem] flex items-center border bg-slate-50 border-slate-200">
                <AnimatePresence mode="wait">
                    {m === 0 ? (
                        <motion.span
                            key="start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-slate-500"
                        >
                            Uten tiltak blir nesten alle syke samtidig. Toppen skyter langt over det
                            sykehusene klarer. Skru på tiltak.
                        </motion.span>
                    ) : underCapacity ? (
                        <motion.div
                            key="win"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-2 text-emerald-700"
                        >
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            <span>
                                Toppen er under kapasiteten! Like mange kan bli smittet til slutt,
                                men nå skjer det over lengre tid. Da rekker sykehusene å hjelpe alle.
                            </span>
                        </motion.div>
                    ) : (
                        <motion.span
                            key="more"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-rose-600"
                        >
                            Kurven synker, men toppen er fortsatt for høy. Legg til flere tiltak for å
                            få den under den røde streken.
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    {m} av {MEASURES.length} tiltak aktive
                </span>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" /> Tilbakestill
                </button>
            </div>
        </div>
    );
}
