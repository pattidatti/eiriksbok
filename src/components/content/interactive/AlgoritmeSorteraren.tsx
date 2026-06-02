import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, RotateCcw, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

interface NewsCard {
    id: number;
    category: string;
    emoji: string;
    headline: string;
    source: string;
    badgeColor: string;
    badgeBg: string;
}

const NEWS_CARDS: NewsCard[] = [
    {
        id: 1,
        category: 'Klima',
        emoji: '🌿',
        headline: 'Noreg kuttar utslepp med 12 prosent',
        source: 'NRK',
        badgeColor: 'text-emerald-700',
        badgeBg: 'bg-emerald-50 border-emerald-200',
    },
    {
        id: 2,
        category: 'Sport',
        emoji: '⚽',
        headline: 'Haaland scorar tre mål i toppmøtet',
        source: 'VG',
        badgeColor: 'text-blue-700',
        badgeBg: 'bg-blue-50 border-blue-200',
    },
    {
        id: 3,
        category: 'Politikk',
        emoji: '🏛️',
        headline: 'Ny statsbudsjettet skapar strid i Stortinget',
        source: 'Aftenposten',
        badgeColor: 'text-purple-700',
        badgeBg: 'bg-purple-50 border-purple-200',
    },
    {
        id: 4,
        category: 'Teknologi',
        emoji: '🤖',
        headline: 'AI tek over fleire jobbar enn venta',
        source: 'Teknisk Ukeblad',
        badgeColor: 'text-indigo-700',
        badgeBg: 'bg-indigo-50 border-indigo-200',
    },
    {
        id: 5,
        category: 'Vitskap',
        emoji: '🔬',
        headline: 'Ny kreftbehandling gir lovande resultat',
        source: 'Forskning.no',
        badgeColor: 'text-teal-700',
        badgeBg: 'bg-teal-50 border-teal-200',
    },
    {
        id: 6,
        category: 'Kultur',
        emoji: '🎬',
        headline: 'Norsk film vinn pris på internasjonal festival',
        source: 'Dagbladet',
        badgeColor: 'text-orange-700',
        badgeBg: 'bg-orange-50 border-orange-200',
    },
    {
        id: 7,
        category: 'Internasjonalt',
        emoji: '🌍',
        headline: 'Fredssamtalar i gang i Midtausten',
        source: 'Reuters',
        badgeColor: 'text-red-700',
        badgeBg: 'bg-red-50 border-red-200',
    },
    {
        id: 8,
        category: 'Lokalt',
        emoji: '🚲',
        headline: 'Ny sykkelveg opnar i Oslo sentrum',
        source: 'Lokalavis',
        badgeColor: 'text-yellow-700',
        badgeBg: 'bg-yellow-50 border-yellow-200',
    },
];

const MAX_LIKES = 3;

type Phase = 'exploring' | 'activating' | 'filtered' | 'revealed';

export function AlgoritmeSorteraren() {
    const [liked, setLiked] = useState<Set<number>>(new Set());
    const [phase, setPhase] = useState<Phase>('exploring');

    const handleLike = (id: number) => {
        if (phase !== 'exploring' || liked.size >= MAX_LIKES) return;
        const next = new Set(liked);
        next.add(id);
        setLiked(next);
        if (next.size === MAX_LIKES) {
            setPhase('activating');
            setTimeout(() => setPhase('filtered'), 1100);
        }
    };

    const handleReveal = () => {
        if (phase === 'filtered') setPhase('revealed');
    };

    const reset = () => {
        setLiked(new Set());
        setPhase('exploring');
    };

    const hiddenCount = NEWS_CARDS.length - liked.size;
    const visibleCount =
        phase === 'filtered' ? liked.size : NEWS_CARDS.length;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800">Algoritmen din</h3>
                        <p className="text-sm text-slate-500">
                            {phase === 'exploring'
                                ? `Klikk på ${MAX_LIKES - liked.size} nyhende du ville lest`
                                : phase === 'activating'
                                ? 'Algoritmen lærer av klikkane dine...'
                                : phase === 'filtered'
                                ? `${hiddenCount} historier er no skjulte for deg`
                                : 'Sjå heile nyheitsbildet'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={reset}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-xs transition-colors flex-shrink-0 mt-1"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Nullstill
                </button>
            </div>

            {/* Status banners */}
            <AnimatePresence mode="wait">
                {phase === 'activating' && (
                    <motion.div
                        key="activating"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mx-5 mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-3">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <Zap className="w-5 h-5 text-indigo-500" />
                            </motion.div>
                            <p className="text-sm font-semibold text-indigo-800">
                                Algoritmen analyserer klikkane dine og tilpassar feeden...
                            </p>
                        </div>
                    </motion.div>
                )}
                {phase === 'filtered' && (
                    <motion.div
                        key="filtered"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mx-5 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-amber-800">
                                        Tre vanlege klikk - {hiddenCount} historier blei usynlege
                                    </p>
                                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                        Du ser no {liked.size} av {NEWS_CARDS.length} nyhende. Algoritmen
                                        bestemte resten - utan at du spurde om det.
                                    </p>
                                    <button
                                        onClick={handleReveal}
                                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-full px-3 py-1.5 transition-colors border border-amber-300"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Sjå kva du ikkje ser
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                {phase === 'revealed' && (
                    <motion.div
                        key="revealed"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="overflow-hidden"
                    >
                        <div className="mx-5 mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-emerald-800">
                                    Blindsonene er synlege no
                                </p>
                                <p className="text-xs text-emerald-700 mt-0.5">
                                    {hiddenCount} nyhende var skjulte i feeden din. Grå kort = algoritmen
                                    gøymde det for deg.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* News cards grid */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AnimatePresence mode="popLayout">
                    {NEWS_CARDS.map((card) => {
                        const isLiked = liked.has(card.id);
                        const isHidden = phase === 'filtered' && !isLiked;
                        const isRevealed = phase === 'revealed' && !isLiked;

                        if (isHidden) return null;

                        return (
                            <motion.div
                                key={card.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                animate={{ opacity: isRevealed ? 0.55 : 1, scale: 1, y: 0 }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.88,
                                    y: -12,
                                    transition: { duration: 0.22 },
                                }}
                                className={`relative rounded-xl border p-3.5 transition-colors ${
                                    isLiked
                                        ? 'border-indigo-300 bg-indigo-50'
                                        : isRevealed
                                        ? 'border-slate-200 bg-slate-50'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                                {isRevealed && (
                                    <div className="absolute top-2.5 right-2.5">
                                        <span className="inline-flex items-center gap-1 text-xs bg-slate-200 text-slate-600 rounded-full px-2 py-0.5">
                                            <EyeOff className="w-2.5 h-2.5" />
                                            Var skjult
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-start gap-2.5">
                                    <span className="text-xl leading-none mt-0.5">{card.emoji}</span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                            <span
                                                className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${card.badgeBg} ${card.badgeColor}`}
                                            >
                                                {card.category}
                                            </span>
                                            <span className="text-xs text-slate-400">{card.source}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800 leading-snug">
                                            {card.headline}
                                        </p>
                                    </div>
                                </div>

                                {isLiked && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                                        className="mt-2.5 flex items-center gap-1.5 text-xs text-indigo-600 font-medium"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />I feeden din
                                    </motion.div>
                                )}

                                {!isLiked && !isRevealed && phase === 'exploring' && (
                                    <button
                                        onClick={() => handleLike(card.id)}
                                        className="mt-2.5 w-full text-xs font-medium text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg py-1.5 transition-colors"
                                    >
                                        Interessant
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="px-5 pb-5">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span>
                        {phase === 'filtered'
                            ? `${liked.size} av ${NEWS_CARDS.length} nyhende synlege`
                            : `${visibleCount} av ${NEWS_CARDS.length} nyhende`}
                    </span>
                    {phase !== 'exploring' && (
                        <span
                            className={
                                phase === 'filtered'
                                    ? 'text-amber-600 font-medium'
                                    : 'text-emerald-600 font-medium'
                            }
                        >
                            {phase === 'filtered'
                                ? `${hiddenCount} skjulte`
                                : 'Alle synlege'}
                        </span>
                    )}
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${
                            phase === 'filtered'
                                ? 'bg-amber-400'
                                : phase === 'revealed'
                                ? 'bg-emerald-500'
                                : 'bg-indigo-500'
                        }`}
                        animate={{ width: `${(visibleCount / NEWS_CARDS.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>
        </div>
    );
}
