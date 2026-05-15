import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Brain, MessageCircle, Hand, RotateCcw, Sparkles } from 'lucide-react';

type Dimension = 'tanker' | 'ord' | 'gjerninger';

interface Choice {
    id: string;
    label: string;
    weight: -1 | 0 | 1;
}

interface Scenario {
    title: string;
    setting: string;
    choices: Record<Dimension, Choice[]>;
}

interface ThoughtsWordsDeedsProps {
    scenario?: Scenario;
}

const DEFAULT_SCENARIO: Scenario = {
    title: 'En klassekamerat blir gjort narr av',
    setting: 'I friminuttet ser du at en gjeng ler av en klassekamerat som har klart noe pinlig. Hen står alene og ser bort.',
    choices: {
        tanker: [
            { id: 'tanker-mork', label: 'Bra det ikke er meg.', weight: -1 },
            { id: 'tanker-noytral', label: 'Hen burde bare le med.', weight: 0 },
            { id: 'tanker-lys', label: 'Det må kjennes vondt akkurat nå.', weight: 1 },
        ],
        ord: [
            { id: 'ord-mork', label: 'Henger på og ler med de andre.', weight: -1 },
            { id: 'ord-noytral', label: 'Sier ingenting.', weight: 0 },
            { id: 'ord-lys', label: 'Sier til gjengen at det holder.', weight: 1 },
        ],
        gjerninger: [
            { id: 'gjern-mork', label: 'Filmer og deler på Snap.', weight: -1 },
            { id: 'gjern-noytral', label: 'Går videre uten å bry meg.', weight: 0 },
            { id: 'gjern-lys', label: 'Går bort og spør om hen vil henge med meg.', weight: 1 },
        ],
    },
};

const DIMENSION_META: Record<Dimension, { label: string; icon: typeof Brain; avestan: string }> = {
    tanker: { label: 'Tanker', icon: Brain, avestan: 'humata' },
    ord: { label: 'Ord', icon: MessageCircle, avestan: 'hukhta' },
    gjerninger: { label: 'Gjerninger', icon: Hand, avestan: 'hvarshta' },
};

const ORDER: Dimension[] = ['tanker', 'ord', 'gjerninger'];

export function ThoughtsWordsDeeds({ scenario = DEFAULT_SCENARIO }: ThoughtsWordsDeedsProps) {
    const [picked, setPicked] = useState<Partial<Record<Dimension, Choice>>>({});

    const total = useMemo(
        () => ORDER.reduce((sum, dim) => sum + (picked[dim]?.weight ?? 0), 0),
        [picked]
    );

    const allPicked = ORDER.every((d) => picked[d] !== undefined);
    const tilt = total * 8;

    const verdict = useMemo(() => {
        if (!allPicked) return null;
        if (total === 3)
            return {
                tone: 'lys',
                title: 'En god vei',
                text: 'Tanker, ord og gjerninger peker samme retning. Zarathustra ville sagt at du går mot Ahura Mazda — den vise herren.',
            };
        if (total === -3)
            return {
                tone: 'mork',
                title: 'En mørk vei',
                text: 'Tanker, ord og gjerninger drar nedover sammen. I zoroastrisk lære er dette Angra Mainyus side — den onde åndens grep.',
            };
        if (total > 0)
            return {
                tone: 'delt',
                title: 'Mest god, men ikke helt',
                text: 'Du peker mer mot lyset enn mørket — men minst én av tankene, ordene eller gjerningene drar motsatt vei. Zarathustra ville utfordret deg: kan du få alle tre til å samsvare?',
            };
        if (total < 0)
            return {
                tone: 'delt',
                title: 'Mest mørk, men splittet',
                text: 'Du heller mer mot mørket. Men kanskje én av tankene, ordene eller gjerningene prøver å trekke deg tilbake mot lyset. Hva ville skjedd om alle tre pekte dit?',
            };
        return {
            tone: 'delt',
            title: 'Splittet',
            text: 'Tanker, ord og gjerninger trekker hver sin vei. Zarathustra ville si: en god person må få alle tre til å peke samme retning.',
        };
    }, [allPicked, total]);

    const reset = () => setPicked({});

    const pick = (dim: Dimension, choice: Choice) => {
        setPicked((prev) => ({ ...prev, [dim]: choice }));
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-white">
                <Flame className="w-5 h-5 text-amber-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">Humata, hukhta, hvarshta</h3>
                    <p className="text-sm text-slate-500">
                        Velg én tanke, ett ord og én gjerning — se hvor vekta tipper.
                    </p>
                </div>
            </div>

            <div className="px-6 py-4 bg-amber-50/40 border-b border-amber-100">
                <p className="text-xs uppercase tracking-wide text-amber-700 font-medium mb-1">
                    Scenarie
                </p>
                <p className="font-medium text-slate-800">{scenario.title}</p>
                <p className="text-sm text-slate-600 mt-1">{scenario.setting}</p>
            </div>

            <div className="p-6 space-y-5">
                {ORDER.map((dim) => {
                    const meta = DIMENSION_META[dim];
                    const Icon = meta.icon;
                    const current = picked[dim];
                    return (
                        <div key={dim}>
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className="w-4 h-4 text-indigo-500" />
                                <span className="font-medium text-slate-700">{meta.label}</span>
                                <span className="text-xs text-slate-400 italic">
                                    ({meta.avestan})
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {scenario.choices[dim].map((choice) => {
                                    const isPicked = current?.id === choice.id;
                                    const base =
                                        'text-left text-sm rounded-lg px-3 py-2 border transition-colors';
                                    let cls = `${base} bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700`;
                                    if (isPicked && choice.weight === 1)
                                        cls = `${base} bg-emerald-50 border-emerald-300 text-emerald-800`;
                                    else if (isPicked && choice.weight === -1)
                                        cls = `${base} bg-rose-50 border-rose-300 text-rose-800`;
                                    else if (isPicked)
                                        cls = `${base} bg-slate-100 border-slate-300 text-slate-800`;
                                    return (
                                        <button
                                            key={choice.id}
                                            onClick={() => pick(dim, choice)}
                                            className={cls}
                                        >
                                            {choice.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="px-6 pb-2">
                <div className="relative h-24 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium text-rose-500">
                        Angra Mainyu
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-emerald-600">
                        Ahura Mazda
                    </div>
                    <motion.div
                        className="w-48 h-2 bg-gradient-to-r from-rose-300 via-slate-300 to-emerald-400 rounded-full origin-center"
                        animate={{ rotate: tilt }}
                        transition={{ type: 'spring', stiffness: 80, damping: 12 }}
                    />
                    <motion.div
                        className="absolute w-3 h-10 bg-slate-700 rounded-full top-1/2 -translate-y-1/2"
                        animate={{ x: 0 }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {verdict && (
                    <motion.div
                        key={verdict.title}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`mx-6 mb-4 px-4 py-3 rounded-lg text-sm border ${
                            verdict.tone === 'lys'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : verdict.tone === 'mork'
                                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                                  : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                    >
                        <div className="flex items-center gap-2 font-semibold mb-1">
                            <Sparkles className="w-4 h-4" />
                            {verdict.title}
                        </div>
                        <p>{verdict.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                    {allPicked
                        ? `Vektsum: ${total > 0 ? '+' : ''}${total}`
                        : `${Object.keys(picked).length} av 3 valg gjort`}
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
}
