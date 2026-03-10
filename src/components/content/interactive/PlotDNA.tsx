import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RotateCcw, Dna, CheckCircle2 } from 'lucide-react';

interface PlotDNAProps {
    title?: string;
    plotTypes: {
        id: string;
        name: string;
        description: string;
        icon: string;
    }[];
    storyCards: {
        id: string;
        title: string;
        hint: string;
        correctPlotId: string;
        icon: string;
    }[];
}

export const PlotDNA = ({
    title = 'Historiens DNA',
    plotTypes,
    storyCards,
}: PlotDNAProps) => {
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [placed, setPlaced] = useState<Record<string, string>>({});
    const [shaking, setShaking] = useState<string | null>(null);
    const [flash, setFlash] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [complete, setComplete] = useState(false);

    const totalCards = storyCards.length;
    const placedCount = Object.keys(placed).length;
    const progress = totalCards > 0 ? placedCount / totalCards : 0;

    const unplacedCards = storyCards.filter((c) => !placed[c.id]);

    const cardsInPlot = useCallback(
        (plotId: string) => storyCards.filter((c) => placed[c.id] === plotId),
        [storyCards, placed]
    );

    const showFeedback = (msg: string) => {
        setFeedback(msg);
        setTimeout(() => setFeedback(null), 1500);
    };

    const handleCardClick = (cardId: string) => {
        if (complete) return;
        setSelectedCardId((prev) => (prev === cardId ? null : cardId));
    };

    const handlePlotClick = (plotId: string) => {
        if (complete || !selectedCardId) return;

        const card = storyCards.find((c) => c.id === selectedCardId);
        if (!card) return;

        if (card.correctPlotId === plotId) {
            const newPlaced = { ...placed, [card.id]: plotId };
            setPlaced(newPlaced);
            setFlash(plotId);
            setTimeout(() => setFlash(null), 700);
            setSelectedCardId(null);

            const newCount = Object.keys(newPlaced).length;
            if (newCount === totalCards) {
                setComplete(true);
                showFeedback('Alle historier er plassert!');
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            } else {
                showFeedback('Riktig!');
            }
        } else {
            setShaking(selectedCardId);
            showFeedback('Prøv igjen!');
            setTimeout(() => setShaking(null), 500);
            setSelectedCardId(null);
        }
    };

    const reset = () => {
        setPlaced({}); setSelectedCardId(null); setShaking(null);
        setFlash(null); setFeedback(null); setComplete(false);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Dna className="w-5 h-5 text-indigo-500" />
                    {title}
                </h3>
                <button
                    onClick={reset}
                    className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Nullstill
                </button>
            </div>

            {/* Progress bar */}
            <div className="mb-5">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>{placedCount} av {totalCards} plassert</span>
                    {complete && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Fullført
                        </span>
                    )}
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                </div>
            </div>

            {/* Feedback toast */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`text-center text-sm font-semibold mb-3 py-1.5 rounded-lg ${
                            feedback === 'Prøv igjen!' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                        }`}
                    >{feedback}</motion.div>
                )}
            </AnimatePresence>

            {/* Plot type drop zones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {plotTypes.map((plot) => {
                    const isFlashing = flash === plot.id;
                    const isTarget = selectedCardId !== null;
                    const matched = cardsInPlot(plot.id);

                    return (
                        <motion.button
                            key={plot.id}
                            onClick={() => handlePlotClick(plot.id)}
                            disabled={!isTarget}
                            className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                                isFlashing
                                    ? 'border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-200/50'
                                    : isTarget
                                        ? 'border-indigo-300 bg-indigo-50/50 cursor-pointer hover:border-indigo-400 hover:shadow-md'
                                        : 'border-slate-200 bg-slate-50'
                            }`}
                            animate={isFlashing ? { scale: [1, 1.03, 1] } : {}}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-xl" role="img">{plot.icon}</span>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-slate-800">{plot.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{plot.description}</p>
                                </div>
                            </div>
                            {matched.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {matched.map((c) => (
                                        <span
                                            key={c.id}
                                            className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium"
                                        >
                                            <span role="img">{c.icon}</span> {c.title}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Story cards pool */}
            {unplacedCards.length > 0 && (
                <>
                    <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">
                        Velg en historie, deretter en plottype
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {unplacedCards.map((card) => {
                            const isSelected = selectedCardId === card.id;
                            const isShaking = shaking === card.id;

                            return (
                                <motion.button
                                    key={card.id}
                                    onClick={() => handleCardClick(card.id)}
                                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                                        isSelected
                                            ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-200'
                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                    }`}
                                    animate={isShaking ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                                    transition={isShaking ? { duration: 0.4 } : {}}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg" role="img">{card.icon}</span>
                                        <span className="font-semibold text-sm text-slate-800 truncate">
                                            {card.title}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{card.hint}</p>
                                </motion.button>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Completion summary */}
            <AnimatePresence>
                {complete && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-emerald-50 rounded-xl border border-indigo-200"
                    >
                        <p className="font-bold text-slate-800 mb-2">Flott! Du har funnet DNA-et i alle historiene.</p>
                        <div className="space-y-1.5">
                            {plotTypes.map((plot) => (
                                <div key={plot.id} className="text-sm">
                                    <span className="font-semibold text-slate-700">{plot.icon} {plot.name}:</span>{' '}
                                    <span className="text-slate-600">{cardsInPlot(plot.id).map((c) => c.title).join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
