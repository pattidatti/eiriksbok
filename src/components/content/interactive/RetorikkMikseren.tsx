import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    Sparkles,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Repeat,
    GitCompare,
    HelpCircle,
    Layers3,
    Type,
    Megaphone,
} from 'lucide-react';

type IconKey = 'repeat' | 'compare' | 'question' | 'layers' | 'type' | 'megaphone';

interface Segment {
    text: string;
    highlight?: boolean;
}

interface Device {
    id: string;
    name: string;
    icon: IconKey;
    color: 'indigo' | 'rose' | 'emerald' | 'amber' | 'sky' | 'violet';
    segments: Segment[];
    effect: string;
}

interface Example {
    id: string;
    original: string;
    devices: Device[];
}

interface RetorikkMikserenProps {
    title?: string;
    examples: Example[];
}

const ICONS: Record<IconKey, typeof Repeat> = {
    repeat: Repeat,
    compare: GitCompare,
    question: HelpCircle,
    layers: Layers3,
    type: Type,
    megaphone: Megaphone,
};

const COLOR_MAP: Record<
    Device['color'],
    { chip: string; chipActive: string; ring: string; pill: string; bar: string }
> = {
    indigo: {
        chip: 'bg-white hover:bg-indigo-50 border-slate-200 text-slate-700',
        chipActive: 'bg-indigo-600 border-indigo-600 text-white shadow-md',
        ring: 'ring-indigo-200',
        pill: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        bar: 'bg-indigo-100 text-indigo-900',
    },
    rose: {
        chip: 'bg-white hover:bg-rose-50 border-slate-200 text-slate-700',
        chipActive: 'bg-rose-600 border-rose-600 text-white shadow-md',
        ring: 'ring-rose-200',
        pill: 'bg-rose-50 text-rose-700 border-rose-200',
        bar: 'bg-rose-100 text-rose-900',
    },
    emerald: {
        chip: 'bg-white hover:bg-emerald-50 border-slate-200 text-slate-700',
        chipActive: 'bg-emerald-600 border-emerald-600 text-white shadow-md',
        ring: 'ring-emerald-200',
        pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bar: 'bg-emerald-100 text-emerald-900',
    },
    amber: {
        chip: 'bg-white hover:bg-amber-50 border-slate-200 text-slate-700',
        chipActive: 'bg-amber-500 border-amber-500 text-white shadow-md',
        ring: 'ring-amber-200',
        pill: 'bg-amber-50 text-amber-700 border-amber-200',
        bar: 'bg-amber-100 text-amber-900',
    },
    sky: {
        chip: 'bg-white hover:bg-sky-50 border-slate-200 text-slate-700',
        chipActive: 'bg-sky-600 border-sky-600 text-white shadow-md',
        ring: 'ring-sky-200',
        pill: 'bg-sky-50 text-sky-700 border-sky-200',
        bar: 'bg-sky-100 text-sky-900',
    },
    violet: {
        chip: 'bg-white hover:bg-violet-50 border-slate-200 text-slate-700',
        chipActive: 'bg-violet-600 border-violet-600 text-white shadow-md',
        ring: 'ring-violet-200',
        pill: 'bg-violet-50 text-violet-700 border-violet-200',
        bar: 'bg-violet-100 text-violet-900',
    },
};

export const RetorikkMikseren = ({
    title = 'Retorikk-mikseren',
    examples,
}: RetorikkMikserenProps) => {
    const [idx, setIdx] = useState(0);
    const [activeMap, setActiveMap] = useState<Record<string, string | null>>({});
    const [exploredMap, setExploredMap] = useState<Record<string, Set<string>>>({});
    const [celebrated, setCelebrated] = useState<Set<string>>(new Set());

    const example = examples[idx];
    const activeId = activeMap[example.id] ?? null;
    const explored = exploredMap[example.id] ?? new Set<string>();
    const activeDevice = example.devices.find((d) => d.id === activeId) ?? null;
    const allExplored = explored.size === example.devices.length;

    const pick = (id: string) => {
        const next = activeId === id ? null : id;
        setActiveMap((prev) => ({ ...prev, [example.id]: next }));
        if (next) {
            setExploredMap((prev) => {
                const cur = new Set(prev[example.id] ?? []);
                cur.add(next);
                if (cur.size === example.devices.length && !celebrated.has(example.id)) {
                    setCelebrated((c) => new Set(c).add(example.id));
                    confetti({
                        particleCount: 90,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'],
                    });
                }
                return { ...prev, [example.id]: cur };
            });
        }
    };

    const reset = () => {
        setActiveMap((prev) => ({ ...prev, [example.id]: null }));
        setExploredMap((prev) => {
            const n = { ...prev };
            delete n[example.id];
            return n;
        });
    };

    const go = (delta: number) => {
        const n = (idx + delta + examples.length) % examples.length;
        setIdx(n);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg et retorisk grep og se hvordan setningen forvandles.
                    </p>
                </div>
                <div className="text-xs text-slate-400">
                    Eksempel {idx + 1} / {examples.length}
                </div>
            </div>

            <div className="px-6 pt-5 pb-3">
                <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                    Originalen
                </div>
                <div className="text-lg sm:text-xl leading-snug text-slate-700 italic">
                    &ldquo;{example.original}&rdquo;
                </div>
            </div>

            <div className="px-6 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {example.devices.map((d) => {
                        const Icon = ICONS[d.icon];
                        const active = activeId === d.id;
                        const c = COLOR_MAP[d.color];
                        return (
                            <button
                                key={d.id}
                                onClick={() => pick(d.id)}
                                className={`flex items-center gap-2 border rounded-full px-3 py-2 text-sm font-medium transition-all ${active ? c.chipActive : c.chip}`}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{d.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="px-6 pb-5">
                <AnimatePresence mode="wait">
                    {activeDevice ? (
                        <motion.div
                            key={`${example.id}-${activeDevice.id}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                            className={`rounded-lg border ${COLOR_MAP[activeDevice.color].pill} p-4`}
                        >
                            <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                                Med {activeDevice.name.toLowerCase()}
                            </div>
                            <p className="text-lg leading-snug text-slate-800">
                                {activeDevice.segments.map((seg, i) =>
                                    seg.highlight ? (
                                        <motion.span
                                            key={i}
                                            initial={{ backgroundColor: 'rgba(255,255,255,0)' }}
                                            animate={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
                                            transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                                            className={`px-1 rounded ${COLOR_MAP[activeDevice.color].bar} font-semibold`}
                                        >
                                            {seg.text}
                                        </motion.span>
                                    ) : (
                                        <span key={i}>{seg.text}</span>
                                    )
                                )}
                            </p>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="mt-3 pt-3 border-t border-white/60 text-sm text-slate-600"
                            >
                                <span className="font-semibold text-slate-700">Effekt: </span>
                                {activeDevice.effect}
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-400 text-center"
                        >
                            Klikk et grep over for å se setningen forvandles.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {allExplored && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        Du har prøvd alle grepene på denne setningen. Hvilket gjorde sterkest
                        inntrykk?
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => go(-1)}
                        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Forrige
                    </button>
                    <button
                        onClick={() => go(1)}
                        className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
                    >
                        Neste
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <button
                    onClick={reset}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
};
