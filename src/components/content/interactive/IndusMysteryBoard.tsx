import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Wrench, HelpCircle, Search, CheckCircle2, RotateCcw } from 'lucide-react';

type CategoryId = 'peaceful' | 'tech' | 'mystery';

interface Clue {
    id: string;
    text: string;
    category: CategoryId;
    explanation: string;
}

interface Category {
    id: CategoryId;
    label: string;
    short: string;
    icon: typeof Shield;
    ringColor: string;
    bgColor: string;
    textColor: string;
}

const CLUES: Clue[] = [
    {
        id: 'c1',
        text: 'I 1500 utgravde byer er det ikke funnet et eneste palass eller en kongegrav.',
        category: 'peaceful',
        explanation:
            'I Egypt og Mesopotamia var palasser og kongegraver vanlige. At Indusdalen mangler dem, tyder på et samfunn der makten var mer fordelt — kanskje uten konger i det hele tatt.',
    },
    {
        id: 'c2',
        text: 'Hvert eneste hus i Mohenjo-daro hadde innlagt avløp og egen brønn.',
        category: 'tech',
        explanation:
            'Selv enkle hus hadde dette. Først på 1800-tallet fikk europeiske byer like gode avløp. Det er en oppfinnelse som var 4000 år forut for sin tid.',
    },
    {
        id: 'c3',
        text: 'Skriften har omtrent 400 tegn, men ingen har klart å lese dem.',
        category: 'mystery',
        explanation:
            'Vi har over 4000 innskrifter, men de fleste er bare 4–5 tegn lange. Det er for kort til å knekke koden. Indus-skriften er en av historiens største uløste gåter.',
    },
    {
        id: 'c4',
        text: 'I hele området, fra Afghanistan til India, brukte folk nøyaktig samme vekter og mål.',
        category: 'tech',
        explanation:
            'Standardiserte vekter krever felles regler over enorme avstander. Slik kontroll viser at handel og organisering var svært avansert.',
    },
    {
        id: 'c5',
        text: 'Rundt 1900 fvt. ble byene gradvis tømt. Vi vet ikke hvorfor.',
        category: 'mystery',
        explanation:
            'Det er flere teorier: klimaendring, elver som skiftet løp, eller indre uro. Ingen av dem kan bevises. Hva som egentlig hendte, er fortsatt et åpent spørsmål.',
    },
    {
        id: 'c6',
        text: 'Det er funnet svært få våpen, og ingen tegn på store slag eller bymurer brent ned.',
        category: 'peaceful',
        explanation:
            'I de fleste gamle sivilisasjoner er våpen og krigsskader vanlige funn. At de mangler her, peker mot at indusfolket sjelden gikk til krig.',
    },
];

const CATEGORIES: Category[] = [
    {
        id: 'peaceful',
        label: 'Tegn på fredelig samfunn',
        short: 'Fredelig',
        icon: Shield,
        ringColor: 'ring-emerald-300',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-800',
    },
    {
        id: 'tech',
        label: 'Tegn på avansert teknologi',
        short: 'Teknologi',
        icon: Wrench,
        ringColor: 'ring-sky-300',
        bgColor: 'bg-sky-50',
        textColor: 'text-sky-800',
    },
    {
        id: 'mystery',
        label: 'Et åpent mysterium',
        short: 'Mysterium',
        icon: HelpCircle,
        ringColor: 'ring-violet-300',
        bgColor: 'bg-violet-50',
        textColor: 'text-violet-800',
    },
];

interface Feedback {
    clueId: string;
    correct: boolean;
    explanation: string;
}

export function IndusMysteryBoard({ title = 'Arkeologens mysterietavle' }: { title?: string }) {
    const [selectedClue, setSelectedClue] = useState<string | null>(null);
    const [placed, setPlaced] = useState<Record<string, CategoryId>>({});
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    function trySort(catId: CategoryId) {
        if (!selectedClue) return;
        const clue = CLUES.find((c) => c.id === selectedClue);
        if (!clue) return;
        const correct = clue.category === catId;
        setFeedback({ clueId: clue.id, correct, explanation: clue.explanation });
        if (correct) {
            setPlaced((p) => ({ ...p, [clue.id]: catId }));
            setSelectedClue(null);
        }
    }

    function reset() {
        setPlaced({});
        setSelectedClue(null);
        setFeedback(null);
    }

    const remaining = CLUES.filter((c) => !placed[c.id]);
    const allDone = remaining.length === 0;

    return (
        <div className="my-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Search className="w-5 h-5 text-violet-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg et spor, og plasser det i kategorien som passer best.
                    </p>
                </div>
            </div>

            <div className="px-6 pt-5">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                    Spor fra utgravingene ({CLUES.length - remaining.length}/{CLUES.length} sortert)
                </p>
                {!allDone ? (
                    <div className="grid sm:grid-cols-2 gap-2">
                        {remaining.map((clue) => {
                            const active = selectedClue === clue.id;
                            return (
                                <motion.button
                                    key={clue.id}
                                    layout
                                    onClick={() => setSelectedClue(active ? null : clue.id)}
                                    className={`text-left rounded-xl border p-3 transition-all ${
                                        active
                                            ? 'border-violet-500 bg-violet-50 shadow-md ring-2 ring-violet-200'
                                            : 'border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-white hover:shadow-sm'
                                    }`}
                                >
                                    <span className="text-sm text-slate-800 leading-snug">
                                        {clue.text}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl bg-gradient-to-br from-violet-50 to-amber-50 border border-violet-200 p-4 flex items-start gap-3"
                    >
                        <CheckCircle2 className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-slate-800 mb-1">
                                Alle spor er plassert.
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                Du har bygget et arkeologisk bilde av Indusdalen: et fredelig,
                                teknologisk avansert samfunn — som likevel forsvant uten at vi vet
                                hvorfor, og hvis skrift vi ennå ikke kan lese. Slik jobber
                                arkeologer i virkeligheten. De samler spor, lager teorier, og lever
                                med at fasiten ikke alltid finnes.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="px-6 pt-5 pb-5">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                    Plasser i en kategori
                </p>
                <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const sortedHere = CLUES.filter(
                            (c) => placed[c.id] === cat.id
                        );
                        const disabled = !selectedClue || allDone;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => trySort(cat.id)}
                                disabled={disabled}
                                className={`rounded-xl border p-3 transition-all min-h-[110px] flex flex-col ${
                                    disabled
                                        ? 'border-slate-200 bg-slate-50 opacity-60'
                                        : `border-slate-300 ${cat.bgColor} hover:shadow-md hover:-translate-y-0.5`
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className={`w-4 h-4 ${cat.textColor}`} />
                                    <span
                                        className={`text-xs font-bold uppercase tracking-wide ${cat.textColor}`}
                                    >
                                        {cat.short}
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-600 leading-tight mb-2">
                                    {cat.label}
                                </span>
                                <div className="mt-auto flex flex-wrap gap-1">
                                    {sortedHere.map((c) => (
                                        <motion.span
                                            key={c.id}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 18,
                                            }}
                                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold bg-white ring-2 ${cat.ringColor} ${cat.textColor}`}
                                        >
                                            {c.id.replace('c', '')}
                                        </motion.span>
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence>
                {feedback && (
                    <motion.div
                        key={feedback.clueId + (feedback.correct ? '-ok' : '-no')}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`mx-6 mb-5 px-4 py-3 rounded-lg border text-sm ${
                            feedback.correct
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-amber-50 border-amber-200 text-amber-900'
                        }`}
                    >
                        <span className="font-semibold">
                            {feedback.correct ? 'Riktig plassert.' : 'Prøv en annen kategori.'}
                        </span>{' '}
                        {feedback.explanation}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Start på nytt
                </button>
            </div>
        </div>
    );
}
