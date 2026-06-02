import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart,
    Award,
    ThumbsUp,
    Trophy,
    Shirt,
    Compass,
    Sparkles,
    Users,
    Shield,
    Lightbulb,
    CloudRain,
    RotateCcw,
} from 'lucide-react';

// Signaturkomponent for km-11 "Hvem er du? - identitet og egne grenser".
// Lyspære: selvtillit hviler på prestasjon og svinger med dagsformen. Selvfølelse
// hviler på et indre fundament - egne verdier, mestring du selv ser, trygge
// relasjoner, å kjenne grensene dine - og det står selv på en dårlig dag.
// Eleven bygger et tårn av ytre søyler (likes, karakterer, ros) og en indre
// grunnmur, og trykker "En dårlig dag". Et tårn uten grunnmur rakner. Et tårn med
// solid grunnmur svaier, men blir stående.

interface Block {
    id: string;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
}

const OUTER: Block[] = [
    { id: 'likes', label: 'Likes og følgere', Icon: Heart },
    { id: 'karakter', label: 'Toppkarakterer', Icon: Award },
    { id: 'ros', label: 'Andres ros', Icon: ThumbsUp },
    { id: 'best', label: 'Å være best', Icon: Trophy },
    { id: 'klaer', label: 'Riktige klær', Icon: Shirt },
];

const INNER: Block[] = [
    { id: 'verdier', label: 'Egne verdier', Icon: Compass },
    { id: 'mestring', label: 'Mestring du selv ser', Icon: Sparkles },
    { id: 'venner', label: 'Trygge venner', Icon: Users },
    { id: 'grenser', label: 'Å kjenne grensene dine', Icon: Shield },
];

const INNER_IDS = new Set(INNER.map((b) => b.id));

export const Selvfolelsensfundament: React.FC = () => {
    // Ids lagt til tårnet, i rekkefølgen de ble lagt.
    const [added, setAdded] = useState<string[]>([]);
    const [badDay, setBadDay] = useState(false);

    const innerAdded = added.filter((id) => INNER_IDS.has(id));
    const outerAdded = added.filter((id) => !INNER_IDS.has(id));
    const innerCount = innerAdded.length;

    // Stødighet avhenger BARE av den indre grunnmuren - ikke av hvor høyt
    // tårnet er. Det er hele poenget.
    const stability = innerCount / INNER.length; // 0..1
    const stoodAfterBadDay = innerCount >= 1;

    const blockMap = useMemo(() => {
        const m: Record<string, Block> = {};
        [...OUTER, ...INNER].forEach((b) => (m[b.id] = b));
        return m;
    }, []);

    const toggle = (id: string) => {
        if (badDay) return;
        setAdded((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const reset = () => {
        setAdded([]);
        setBadDay(false);
    };

    // Hvilke ytre søyler vises fortsatt? Etter en dårlig dag forsvinner alle.
    const visibleOuter = badDay ? [] : outerAdded;

    const meterLabel =
        innerCount === 0
            ? 'Vakler'
            : innerCount <= 2
              ? 'Litt stødig'
              : 'Stødig';
    const meterColor =
        innerCount === 0 ? '#dc2626' : innerCount <= 2 ? '#d97706' : '#16a34a';

    // Figurens tilstand: før dårlig dag = rolig; etter = står eller faller.
    const figureState: 'calm' | 'stand' | 'fall' = !badDay
        ? 'calm'
        : stoodAfterBadDay
          ? 'stand'
          : 'fall';

    const resultMessage = !badDay
        ? null
        : !stoodAfterBadDay
          ? 'Tårnet raknet. Et selvbilde bygd bare på det andre synes, faller når én dårlig dag kommer.'
          : innerCount >= 3
            ? 'Du står støtt. Den indre grunnmuren bærer deg selv når rosen forsvinner.'
            : 'Du vakler litt, men blir stående. Den indre grunnmuren holder deg oppe.';

    return (
        <div className="my-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-800">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-display font-bold text-lg">
                        Hva hviler selvbildet ditt på?
                    </h3>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                    Bygg tårnet ditt av ytre søyler og en indre grunnmur. Trykk så «En dårlig dag»
                    og se hva som blir stående.
                </p>
            </div>

            <div className="p-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                {/* Venstre: scenen med tårnet */}
                <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-sky-50 to-slate-50 p-4 flex flex-col">
                    <div className="relative flex-1 flex flex-col justify-end items-center min-h-[300px]">
                        {/* Regn-ikon når den dårlige dagen treffer */}
                        <AnimatePresence>
                            {badDay && (
                                <motion.div
                                    key="rain"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-slate-500"
                                >
                                    <CloudRain className="w-5 h-5" />
                                    <span className="text-xs font-semibold">En dårlig dag</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Figuren på toppen */}
                        <Figure state={figureState} />

                        {/* Ytre søyler (stables oppå grunnmuren) */}
                        <div className="flex flex-col items-center gap-1.5">
                            <AnimatePresence>
                                {visibleOuter
                                    .slice()
                                    .reverse()
                                    .map((id) => {
                                        const b = blockMap[id];
                                        return (
                                            <motion.div
                                                key={id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.6, y: -12 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{
                                                    opacity: 0,
                                                    y: -40,
                                                    rotate: 18,
                                                    scale: 0.7,
                                                }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 220,
                                                    damping: 16,
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-300 to-amber-400 text-amber-950 text-xs font-bold shadow-sm border border-amber-300 w-[150px]"
                                            >
                                                <b.Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate">{b.label}</span>
                                            </motion.div>
                                        );
                                    })}
                            </AnimatePresence>
                        </div>

                        {/* Indre grunnmur (bred, solid, nederst) */}
                        <motion.div
                            className="flex flex-col items-center gap-1.5 mt-1.5"
                            animate={
                                figureState === 'stand'
                                    ? { rotate: [0, -2.5, 2.5, -1.5, 0] }
                                    : { rotate: 0 }
                            }
                            transition={{ duration: 0.7 }}
                        >
                            <AnimatePresence>
                                {innerAdded.map((id) => {
                                    const b = blockMap[id];
                                    return (
                                        <motion.div
                                            key={id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.7, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.7 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 240,
                                                damping: 20,
                                            }}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs font-bold shadow-md border border-indigo-400 w-[210px]"
                                        >
                                            <b.Icon className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{b.label}</span>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            {added.length === 0 && (
                                <div className="w-[210px] h-[46px] rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-[11px] text-slate-400">
                                    Klikk en kloss for å bygge
                                </div>
                            )}
                        </motion.div>

                        {/* Bakkelinje */}
                        <div className="w-full h-1 rounded-full bg-slate-300 mt-2" />
                    </div>
                </div>

                {/* Høyre: paletter + måler + handling */}
                <div className="flex flex-col gap-4">
                    <Palette
                        title="Ytre søyler"
                        hint="Det andre ser og roser"
                        blocks={OUTER}
                        added={added}
                        accent="amber"
                        disabled={badDay}
                        onToggle={toggle}
                    />
                    <Palette
                        title="Indre grunnmur"
                        hint="Det du har inni deg"
                        blocks={INNER}
                        added={added}
                        accent="indigo"
                        disabled={badDay}
                        onToggle={toggle}
                    />

                    {/* Stødighetsmåler */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-700">
                                Hvor stødig står du?
                            </span>
                            <span
                                className="text-xs font-bold"
                                style={{ color: meterColor }}
                            >
                                {meterLabel}
                            </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: meterColor }}
                                animate={{ width: `${Math.round(stability * 100)}%` }}
                                transition={{ type: 'spring', stiffness: 160, damping: 20 }}
                            />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5">
                            Bare den indre grunnmuren teller. De ytre søylene gjør tårnet høyere -
                            ikke stødigere.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setBadDay(true)}
                            disabled={added.length === 0 || badDay}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <CloudRain className="w-4 h-4" />
                            En dårlig dag
                        </button>
                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Bygg på nytt
                        </button>
                    </div>

                    {/* Resultat etter dårlig dag */}
                    <AnimatePresence>
                        {resultMessage && (
                            <motion.div
                                key={stoodAfterBadDay ? 'stood' : 'fell'}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                                    stoodAfterBadDay
                                        ? 'border-green-200 bg-green-50 text-green-800'
                                        : 'border-red-200 bg-red-50 text-red-800'
                                }`}
                            >
                                {resultMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bunnlinje: innsikten */}
            <div className="flex items-start gap-2 bg-indigo-50 border-t border-indigo-100 px-5 py-3 text-sm text-indigo-900">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-600" />
                <p>
                    Selvtillit hviler på prestasjon og svinger med dagsformen. Selvfølelse hviler på
                    et indre fundament - egne verdier, mestring du selv ser og trygge relasjoner. Du
                    kan glede deg over ytre ting, men grunnmuren må være indre, ellers rakner det når
                    en dårlig dag kommer.
                </p>
            </div>
        </div>
    );
};

// En enkel figur som står på toppen av tårnet. Endrer uttrykk og holdning
// etter om den står eller faller.
function Figure({ state }: { state: 'calm' | 'stand' | 'fall' }) {
    const smiling = state !== 'fall';
    return (
        <motion.div
            className="mb-1.5"
            animate={
                state === 'fall'
                    ? { rotate: 78, x: 54, y: 30, opacity: 0.45 }
                    : state === 'stand'
                      ? { rotate: [0, -6, 6, 0], y: 0, x: 0, opacity: 1 }
                      : { rotate: 0, y: 0, x: 0, opacity: 1 }
            }
            transition={
                state === 'fall'
                    ? { type: 'spring', stiffness: 90, damping: 9 }
                    : { duration: 0.7 }
            }
        >
            <svg width="46" height="58" viewBox="0 0 46 58" aria-hidden="true">
                {/* hode */}
                <circle cx="23" cy="14" r="11" fill="#fcd9b8" stroke="#e3a877" strokeWidth="1.5" />
                {/* øyne */}
                <circle cx="19" cy="13" r="1.6" fill="#3a2a1a" />
                <circle cx="27" cy="13" r="1.6" fill="#3a2a1a" />
                {/* munn */}
                {smiling ? (
                    <path
                        d="M18 18 Q23 22 28 18"
                        fill="none"
                        stroke="#3a2a1a"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                ) : (
                    <path
                        d="M18 20 Q23 16 28 20"
                        fill="none"
                        stroke="#3a2a1a"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                )}
                {/* kropp */}
                <rect x="15" y="26" width="16" height="24" rx="6" fill="#6366f1" />
            </svg>
        </motion.div>
    );
}

// En palett av klikkbare klosser.
function Palette({
    title,
    hint,
    blocks,
    added,
    accent,
    disabled,
    onToggle,
}: {
    title: string;
    hint: string;
    blocks: Block[];
    added: string[];
    accent: 'amber' | 'indigo';
    disabled: boolean;
    onToggle: (id: string) => void;
}) {
    return (
        <div>
            <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    {title}
                </span>
                <span className="text-[11px] text-slate-400">{hint}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {blocks.map((b) => {
                    const on = added.includes(b.id);
                    const base =
                        accent === 'amber'
                            ? on
                                ? 'bg-amber-400 text-amber-950 border-amber-400'
                                : 'bg-white text-amber-700 border-amber-200 hover:border-amber-400'
                            : on
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-indigo-700 border-indigo-200 hover:border-indigo-400';
                    return (
                        <button
                            key={b.id}
                            onClick={() => onToggle(b.id)}
                            disabled={disabled}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition disabled:opacity-50 disabled:cursor-not-allowed ${base}`}
                        >
                            <b.Icon className="w-3.5 h-3.5" />
                            {b.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
