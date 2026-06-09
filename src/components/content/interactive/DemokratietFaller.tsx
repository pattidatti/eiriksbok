import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, AlertCircle } from 'lucide-react';

type PillarStatus = 'fri' | 'truet' | 'kontrollert' | 'avskaffet';

interface Pillar {
    id: string;
    label: string;
    icon: string;
}

interface Stage {
    year: number;
    title: string;
    description: string;
    changes: Partial<Record<string, PillarStatus>>;
}

const PILLARS: Pillar[] = [
    { id: 'presse', label: 'Fri presse', icon: '📰' },
    { id: 'fagforeninger', label: 'Frie fagforeninger', icon: '✊' },
    { id: 'opposisjon', label: 'Opposisjonspartier', icon: '🗳️' },
    { id: 'parlamentet', label: 'Parlamentet', icon: '🏛️' },
    { id: 'valg', label: 'Valgets frihet', icon: '☑️' },
    { id: 'rettsvesen', label: 'Uavhengig rettsvesen', icon: '⚖️' },
];

const STAGES: Stage[] = [
    {
        year: 1919,
        title: 'Italia etter krigen',
        description:
            'Italia er et skjort demokrati. Parlamentet fungerer, men svake regjeringer skifter raskt. Pressen er fri. Fagforeninger organiserer arbeidere. Mussolinis fascister er fremdeles en liten gruppe.',
        changes: {},
    },
    {
        year: 1920,
        title: 'Svartskjortene angriper',
        description:
            'Mussolinis svartskjorter - squadristi - angriper sosialistiske aviser og fagforeningshus. Politiet ser en annen vei. Pressen og fagforeningene er truet, men ikke knust ennå.',
        changes: {
            presse: 'truet',
            fagforeninger: 'truet',
        },
    },
    {
        year: 1922,
        title: 'Marsjen mot Roma',
        description:
            'Mussolini truer med statskupp. Kongen nekter å bruke hæren og utnevner Mussolini til statsminister. Han kontrollerer nå regjeringen, men beholder et skinn av demokrati - foreløpig.',
        changes: {
            presse: 'kontrollert',
            fagforeninger: 'kontrollert',
            valg: 'truet',
            parlamentet: 'truet',
        },
    },
    {
        year: 1924,
        title: 'Matteotti-affæren',
        description:
            'Sosialistlederen Matteotti avslørte valgfusk og ble drept av fascister. Opposisjonen forlot parlamentet i protest. Mussolini overlevde krisen og brukte den til å styrke grepet.',
        changes: {
            valg: 'kontrollert',
            opposisjon: 'truet',
        },
    },
    {
        year: 1926,
        title: 'Diktaturet er et faktum',
        description:
            'Mussolini innfører diktaturet fullt ut. Alle opposisjonspartier er forbudt. Pressen sensurert. Fagforeninger oppløst. Det hemmelige politiet OVRA arresterer motstandere. Domstolene er kontrollert. Demokratiet er borte.',
        changes: {
            presse: 'avskaffet',
            fagforeninger: 'avskaffet',
            opposisjon: 'avskaffet',
            parlamentet: 'avskaffet',
            valg: 'avskaffet',
            rettsvesen: 'avskaffet',
        },
    },
];

const STATUS_CONFIG: Record<
    PillarStatus,
    { bg: string; border: string; textColor: string; badge: string; badgeText: string; label: string }
> = {
    fri: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
        textColor: 'text-emerald-800',
        badge: 'bg-emerald-100 text-emerald-800',
        badgeText: 'Fri',
        label: 'Fri',
    },
    truet: {
        bg: 'bg-amber-50',
        border: 'border-amber-400',
        textColor: 'text-amber-900',
        badge: 'bg-amber-100 text-amber-900',
        badgeText: 'Truet',
        label: 'Truet',
    },
    kontrollert: {
        bg: 'bg-orange-50',
        border: 'border-orange-500',
        textColor: 'text-orange-900',
        badge: 'bg-orange-100 text-orange-900',
        badgeText: 'Kontrollert',
        label: 'Kontrollert',
    },
    avskaffet: {
        bg: 'bg-red-50',
        border: 'border-red-400',
        textColor: 'text-red-900',
        badge: 'bg-red-100 text-red-900',
        badgeText: 'Avskaffet',
        label: 'Avskaffet',
    },
};

function buildStatusMap(upToIndex: number): Record<string, PillarStatus> {
    const map: Record<string, PillarStatus> = {};
    PILLARS.forEach((p) => {
        map[p.id] = 'fri';
    });
    for (let i = 0; i <= upToIndex; i++) {
        Object.entries(STAGES[i].changes).forEach(([id, status]) => {
            map[id] = status as PillarStatus;
        });
    }
    return map;
}

export interface DemokratietFallerProps {
    title?: string;
}

export function DemokratietFaller({ title = 'Demokratiet faller' }: DemokratietFallerProps) {
    const [stageIndex, setStageIndex] = useState(0);
    const stage = STAGES[stageIndex];
    const statusMap = buildStatusMap(stageIndex);
    const isLast = stageIndex === STAGES.length - 1;

    const freeCount = Object.values(statusMap).filter((s) => s === 'fri').length;
    const underAttackCount = Object.values(statusMap).filter(
        (s) => s === 'truet' || s === 'kontrollert'
    ).length;
    const abolishedCount = Object.values(statusMap).filter((s) => s === 'avskaffet').length;

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden my-8">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-stone-800 text-white rounded-xl flex items-center justify-center text-lg">
                        🏛️
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 leading-tight">{title}</h3>
                        <p className="text-xs text-slate-500">
                            Slik fjernet Mussolini Italias demokratiske pilarer - steg for steg
                        </p>
                    </div>
                </div>
                {stageIndex > 0 && (
                    <button
                        onClick={() => setStageIndex(0)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Start på nytt
                    </button>
                )}
            </div>

            <div className="p-5">
                {/* Tidslinje-indikator */}
                <div className="flex items-center gap-1 mb-6">
                    {STAGES.map((s, i) => (
                        <div key={s.year} className="flex items-center flex-1">
                            <button
                                onClick={() => setStageIndex(i)}
                                className={`flex flex-col items-center gap-0.5 flex-1 transition-all ${
                                    i === stageIndex ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                                }`}
                                aria-label={`Gå til ${s.year}`}
                            >
                                <div
                                    className={`w-3 h-3 rounded-full border-2 transition-all ${
                                        i < stageIndex
                                            ? 'bg-red-500 border-red-600'
                                            : i === stageIndex
                                              ? 'bg-slate-800 border-slate-900 scale-125'
                                              : 'bg-slate-200 border-slate-300'
                                    }`}
                                />
                                <span className="text-[10px] font-semibold text-slate-600">
                                    {s.year}
                                </span>
                            </button>
                            {i < STAGES.length - 1 && (
                                <div
                                    className={`h-0.5 flex-1 rounded transition-colors ${
                                        i < stageIndex ? 'bg-red-300' : 'bg-slate-200'
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Gjeldende steg - tekst */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={stageIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22 }}
                        className="mb-5"
                    >
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="inline-block px-2.5 py-0.5 bg-slate-800 text-white text-xs font-bold rounded-full">
                                {stage.year}
                            </span>
                            <h4 className="font-bold text-slate-800">{stage.title}</h4>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {stage.description}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Pilarer-grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                    {PILLARS.map((pillar) => {
                        const status = statusMap[pillar.id];
                        const cfg = STATUS_CONFIG[status];
                        const fallen = status === 'avskaffet';
                        return (
                            <motion.div
                                key={pillar.id}
                                layout
                                animate={{
                                    opacity: fallen ? 0.6 : 1,
                                    scale: fallen ? 0.97 : 1,
                                    rotate: fallen ? -1 : 0,
                                }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                className={`relative rounded-xl border-2 p-3 text-center ${cfg.bg} ${cfg.border}`}
                            >
                                <div className="text-2xl mb-1.5">
                                    {fallen ? '💀' : pillar.icon}
                                </div>
                                <p className={`text-xs font-bold leading-tight ${cfg.textColor}`}>
                                    {pillar.label}
                                </p>
                                <div
                                    className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.badge}`}
                                >
                                    {cfg.badgeText}
                                </div>
                                {fallen && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-xl bg-red-900/5"
                                    >
                                        <span className="text-red-700 text-[10px] font-black uppercase tracking-widest rotate-[-12deg] opacity-50">
                                            Borte
                                        </span>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Status-oppsummering */}
                <div className="flex items-center gap-4 mb-5 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex-1 text-center">
                        <div className="text-xl font-black text-emerald-700">{freeCount}</div>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            Frie
                        </div>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="flex-1 text-center">
                        <div className="text-xl font-black text-amber-600">{underAttackCount}</div>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            Under press
                        </div>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="flex-1 text-center">
                        <div className="text-xl font-black text-red-700">{abolishedCount}</div>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            Avskaffet
                        </div>
                    </div>
                </div>

                {/* Avslutningsmelding */}
                <AnimatePresence>
                    {isLast && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-red-800 mb-0.5">
                                    Demokratiet er avviklet
                                </p>
                                <p className="text-xs text-red-700 leading-relaxed">
                                    På bare 7 år - fra 1919 til 1926 - demonterte Mussolini alle seks
                                    demokratiske pilarer. Ikke med ett slag, men steg for steg. Slik
                                    dør et demokrati - ikke alltid med kanoner, men med lover, trusler
                                    og taushet.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigasjonsknapper */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setStageIndex((i) => i - 1)}
                        disabled={stageIndex === 0}
                        className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        Forrige
                    </button>
                    <div className="flex-1 text-center text-xs text-slate-400">
                        {stageIndex + 1} av {STAGES.length}
                    </div>
                    <button
                        onClick={() => setStageIndex((i) => i + 1)}
                        disabled={isLast}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        Neste
                    </button>
                </div>
            </div>
        </div>
    );
}
