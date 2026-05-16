import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Footprints, Wheat, Trophy, RotateCcw, Sparkles } from 'lucide-react';

type Winner = 'forager' | 'farmer' | 'tie';

interface Category {
    id: string;
    label: string;
    foragerScore: number;
    farmerScore: number;
    winner: Winner;
    foragerFact: string;
    farmerFact: string;
    insight: string;
}

const DEFAULT_CATEGORIES: Category[] = [
    {
        id: 'kosthold',
        label: 'Kosthold',
        foragerScore: 8,
        farmerScore: 3,
        winner: 'forager',
        foragerFact: 'Spiste over 100 ulike planter, bær, nøtter, fisk og vilt — variert og fullt av vitaminer.',
        farmerFact: 'Levde stort sett på hvete, ris eller mais. Ensformig kost ga jernmangel og dårligere tenner.',
        insight: 'Jegeren hadde en bedre meny enn de fleste 14-åringer i dag.',
    },
    {
        id: 'arbeidstid',
        label: 'Arbeidstid per dag',
        foragerScore: 8,
        farmerScore: 2,
        winner: 'forager',
        foragerFact: 'Brukte 3–5 timer på å skaffe mat. Resten av dagen var lek, prat og hvile.',
        farmerFact: 'Pløyde, sådde, luket og høstet fra soloppgang til solnedgang. Hvete krever konstant arbeid.',
        insight: 'Yuval Noah Harari kaller jordbruket "historiens største bløff" — vi jobbet mer, ikke mindre.',
    },
    {
        id: 'helse',
        label: 'Helse og sykdom',
        foragerScore: 7,
        farmerScore: 3,
        winner: 'forager',
        foragerFact: 'Få smittsomme sykdommer. Levde spredt og hadde lite kontakt med dyr som ga virus.',
        farmerFact: 'Trange landsbyer + husdyr ga oss kopper, meslinger, influensa og kolera.',
        insight: 'Nesten alle nye sykdommer hopper fra dyr til mennesker — pandemier ble mulig først da vi flyttet sammen.',
    },
    {
        id: 'levealder',
        label: 'Levealder',
        foragerScore: 6,
        farmerScore: 4,
        winner: 'forager',
        foragerFact: 'Voksne jegere som overlevde barndommen kunne bli 60–70 år.',
        farmerFact: 'Mange tidlige bønder døde tidlig av sykdom og slitte ledd, mange før de fylte 40.',
        insight: 'Bønder ble lavere, magrere og dårligere i ryggen enn jegerne. Skjelettene viser det tydelig.',
    },
    {
        id: 'spedbarn',
        label: 'Spedbarnsdød',
        foragerScore: 6,
        farmerScore: 3,
        winner: 'forager',
        foragerFact: 'Få barn per kvinne, men hvert barn fikk mye omsorg og bedre mat.',
        farmerFact: 'Mange barn — men også høy dødelighet. Smitte spredte seg lett i landsbyer.',
        insight: 'Bønder fikk flere barn, men mistet også flere.',
    },
    {
        id: 'mattilgang',
        label: 'Trygg mattilgang',
        foragerScore: 4,
        farmerScore: 7,
        winner: 'farmer',
        foragerFact: 'Hvis viltet forsvant eller bærene tørket ut, var det krise. Avhengig av naturen.',
        farmerFact: 'Lagret korn ga buffer mot dårlige år. Sult var fortsatt vanlig, men sjeldnere.',
        insight: 'Her vinner bonden — overskudd av mat ga trygghet og muligheten til å bli mange.',
    },
    {
        id: 'populasjon',
        label: 'Populasjonsvekst',
        foragerScore: 2,
        farmerScore: 10,
        winner: 'farmer',
        foragerFact: 'Klodens jegere var aldri flere enn 5–8 millioner totalt.',
        farmerFact: 'Etter 5000 år med jordbruk var vi 100 millioner. I dag: 8 milliarder.',
        insight: 'Jordbruket vant fordi flere bønder kan leve på samme jordlapp enn jegere. Antall slo livskvalitet.',
    },
];

interface FarmerVsForagerProps {
    title?: string;
    intro?: string;
    categories?: Category[];
}

export function FarmerVsForager({
    title = 'Jeger eller bonde — hvilket liv ville du valgt?',
    intro = 'Klikk hver kategori for å avsløre hvem som vant. Til slutt ser du hvorfor jordbruket likevel utkonkurrerte jegerlivet.',
    categories = DEFAULT_CATEGORIES,
}: FarmerVsForagerProps) {
    const [revealed, setRevealed] = useState<Record<string, boolean>>({});
    const [activeId, setActiveId] = useState<string | null>(null);

    const totalCount = categories.length;
    const revealedCount = Object.values(revealed).filter(Boolean).length;
    const isComplete = revealedCount === totalCount;
    const foragerWins = categories.filter(
        (c) => revealed[c.id] && c.winner === 'forager'
    ).length;
    const farmerWins = categories.filter(
        (c) => revealed[c.id] && c.winner === 'farmer'
    ).length;

    const handleReveal = (id: string) => {
        setRevealed((prev) => ({ ...prev, [id]: true }));
        setActiveId(id);
    };

    const handleReset = () => {
        setRevealed({});
        setActiveId(null);
    };

    const active = activeId ? categories.find((c) => c.id === activeId) : null;

    return (
        <div className="my-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <Scale className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-display font-bold text-lg text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{intro}</p>
                </div>
            </div>

            {/* Top: avatars + running score */}
            <div className="grid grid-cols-2 gap-3 px-6 pt-6 pb-2">
                <div
                    className={`rounded-xl border p-4 transition-colors ${
                        foragerWins > farmerWins
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200'
                    }`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <Footprints className="w-5 h-5 text-emerald-700" />
                        <span className="font-semibold text-slate-800">Jeger</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">Nomade · ca. 12 000 fvt</p>
                    <div className="text-2xl font-bold text-emerald-700">
                        {foragerWins}
                        <span className="text-sm font-normal text-slate-400"> / {totalCount}</span>
                    </div>
                </div>
                <div
                    className={`rounded-xl border p-4 transition-colors ${
                        farmerWins > foragerWins
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-slate-50 border-slate-200'
                    }`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <Wheat className="w-5 h-5 text-amber-700" />
                        <span className="font-semibold text-slate-800">Bonde</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">Bofast · ca. 8 000 fvt</p>
                    <div className="text-2xl font-bold text-amber-700">
                        {farmerWins}
                        <span className="text-sm font-normal text-slate-400"> / {totalCount}</span>
                    </div>
                </div>
            </div>

            {/* Category table */}
            <div className="px-6 py-4 space-y-2">
                {categories.map((cat) => {
                    const isRevealed = !!revealed[cat.id];
                    const isActive = activeId === cat.id;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleReveal(cat.id)}
                            className={`w-full text-left rounded-lg border px-4 py-3 transition-all ${
                                isRevealed
                                    ? cat.winner === 'forager'
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : cat.winner === 'farmer'
                                          ? 'bg-amber-50 border-amber-200'
                                          : 'bg-slate-50 border-slate-200'
                                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                            } ${isActive ? 'ring-2 ring-indigo-300' : ''}`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-medium text-slate-800 text-sm">
                                    {cat.label}
                                </span>
                                {isRevealed ? (
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                                            <ScoreBar value={cat.foragerScore} color="emerald" />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Wheat className="w-3.5 h-3.5 text-amber-600" />
                                            <ScoreBar value={cat.farmerScore} color="amber" />
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400">Klikk for å avsløre</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Feedback panel */}
            <AnimatePresence mode="wait">
                {active && (
                    <motion.div
                        key={active.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mx-6 mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4"
                    >
                        <p className="text-xs uppercase tracking-wider font-bold text-blue-700 mb-2">
                            {active.label}
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3 mb-3">
                            <div className="text-sm text-slate-700">
                                <div className="flex items-center gap-1.5 font-semibold text-emerald-700 mb-1">
                                    <Footprints className="w-3.5 h-3.5" /> Jeger
                                </div>
                                <p>{active.foragerFact}</p>
                            </div>
                            <div className="text-sm text-slate-700">
                                <div className="flex items-center gap-1.5 font-semibold text-amber-700 mb-1">
                                    <Wheat className="w-3.5 h-3.5" /> Bonde
                                </div>
                                <p>{active.farmerFact}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 pt-3 border-t border-blue-200 text-sm text-blue-900">
                            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                            <p className="italic">{active.insight}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Completion banner */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="mx-6 mb-5 rounded-xl bg-gradient-to-br from-amber-50 to-emerald-50 border border-amber-200 p-5"
                    >
                        <div className="flex items-start gap-3">
                            <Trophy className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-slate-900 mb-1">
                                    Bonden taper {farmerWins}–{foragerWins} på livskvalitet — men vinner historien.
                                </p>
                                <p className="text-sm text-slate-700">
                                    Hver enkelt bonde hadde et hardere liv enn jegeren. Men ti bønder
                                    lever der én jeger kan jakte. Antall slo livskvalitet — og slik
                                    overtok jordbruket verden uten at noen egentlig bestemte seg for det.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                    {revealedCount} av {totalCount} avslørt
                </div>
                <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}

function ScoreBar({ value, color }: { value: number; color: 'emerald' | 'amber' }) {
    const pct = Math.max(0, Math.min(100, value * 10));
    const trackBg = color === 'emerald' ? 'bg-emerald-100' : 'bg-amber-100';
    const fillBg = color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500';
    return (
        <div className={`w-16 h-2 rounded-full overflow-hidden ${trackBg}`}>
            <motion.div
                className={`h-full ${fillBg}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            />
        </div>
    );
}
