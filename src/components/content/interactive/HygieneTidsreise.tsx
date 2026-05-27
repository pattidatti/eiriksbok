import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

interface EpochData {
    era: string;
    year: string;
    icon: string;
    tool: string;
    toolIcon: string;
    reaction: string;
    fact: string;
}

const DEFAULT_EPOCHS: EpochData[] = [
    {
        era: 'Romerriket',
        year: '100 e.Kr.',
        icon: '🏛️',
        tool: 'Tersorium',
        toolIcon: '🧽',
        reaction: '😬',
        fact: 'Romerne delte en svamp på stokk i offentlige latriner. Svampen ble skylt i saltvann eller eddik mellom brukerne - en "fellessponge" for alle besøkende.',
    },
    {
        era: 'Middelalderen',
        year: '1200-tallet',
        icon: '🏰',
        tool: 'Høy og mose',
        toolIcon: '🌿',
        reaction: '😅',
        fact: 'Vanlige folk brukte det som var tilgjengelig: høy, mose, blader eller lappestykker av stoff. Rike folk hadde råd til ull eller hamp - et klart tegn på velstand.',
    },
    {
        era: 'Kina',
        year: '600 e.Kr.',
        icon: '📜',
        tool: 'Papirark',
        toolIcon: '📄',
        reaction: '😮',
        fact: 'Kineserne brukte papir til hygiene allerede på 500-600-tallet - over 1000 år før Vesten oppdaget ideen! Keiser Hongwu bestilte 720 000 hygienepapirark per år til hoffet.',
    },
    {
        era: 'USA 1800-t.',
        year: '1820-1860',
        icon: '📖',
        tool: "Farmers Almanac",
        toolIcon: '📚',
        reaction: '😂',
        fact: "The Old Farmer's Almanac ble trykt med et hull i hjørnet - så den hengte på spikeren på utedoen og var klar til bruk etter lesing. Praktisk dobbeltbruk!",
    },
    {
        era: 'Norge i dag',
        year: '2024',
        icon: '🚽',
        tool: 'Dopapir på rull',
        toolIcon: '🧻',
        reaction: '😌',
        fact: 'Norge er blant verdens største dopapirforbrukere med rundt 164 ruller per person per år. Seth Wheelers patent fra 1891 viser at "over"-retningen er den originale.',
    },
];

type Phase = 'idle' | 'complete';

export function HygieneTidsreise({ epochs = DEFAULT_EPOCHS }: { epochs?: EpochData[] }) {
    const [revealed, setRevealed] = useState<Set<number>>(new Set());
    const [selected, setSelected] = useState<number | null>(null);
    const [phase, setPhase] = useState<Phase>('idle');

    const handleCardClick = (index: number) => {
        if (!revealed.has(index)) {
            const newRevealed = new Set(revealed);
            newRevealed.add(index);
            setRevealed(newRevealed);
            if (newRevealed.size === epochs.length) {
                setTimeout(() => setPhase('complete'), 600);
            }
        }
        setSelected(index);
    };

    const handleReset = () => {
        setRevealed(new Set());
        setSelected(null);
        setPhase('idle');
    };

    const currentEpoch = selected !== null ? epochs[selected] : null;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🧻</span>
                    <div>
                        <h3 className="font-semibold text-slate-800">Hva brukte de?</h3>
                        <p className="text-sm text-slate-500">Klikk på en epoke for å avsløre hemmeligheten!</p>
                    </div>
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-100"
                >
                    <RotateCcw size={12} />
                    Start på nytt
                </button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                    <motion.div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        animate={{ width: `${(revealed.size / epochs.length) * 100}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                    {revealed.size}/{epochs.length} avslørt
                </span>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-5 gap-2">
                {epochs.map((epoch, index) => (
                    <FlipCard
                        key={index}
                        epoch={epoch}
                        isFlipped={revealed.has(index)}
                        isSelected={selected === index}
                        onClick={() => handleCardClick(index)}
                    />
                ))}
            </div>

            {/* Detail panel */}
            <AnimatePresence mode="wait">
                {currentEpoch && (
                    <motion.div
                        key={selected}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3 items-start"
                    >
                        <span className="text-2xl flex-shrink-0">{currentEpoch.toolIcon}</span>
                        <div>
                            <p className="text-sm font-semibold text-indigo-800">
                                {currentEpoch.era} - {currentEpoch.tool} {currentEpoch.reaction}
                            </p>
                            <p className="text-sm text-indigo-700 mt-0.5 leading-relaxed">
                                {currentEpoch.fact}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Completion */}
            <AnimatePresence>
                {phase === 'complete' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center"
                    >
                        <div className="text-3xl mb-2">🎉</div>
                        <p className="font-semibold text-emerald-800">Du har reist gjennom dopapirhistorien!</p>
                        <p className="text-sm text-emerald-600 mt-1">
                            Samme grunnleggende behov - helt ulike løsninger gjennom 2000 år.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FlipCard({
    epoch,
    isFlipped,
    isSelected,
    onClick,
}: {
    epoch: EpochData;
    isFlipped: boolean;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <div
            className="cursor-pointer"
            style={{ perspective: '600px' }}
            onClick={onClick}
            role="button"
            aria-label={`${epoch.era}: ${isFlipped ? epoch.tool : 'Klikk for å avsløre'}`}
        >
            <motion.div
                className="relative w-full"
                style={{ transformStyle: 'preserve-3d', height: '110px' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 180, damping: 22 }}
            >
                {/* Front */}
                <div
                    className={`absolute inset-0 rounded-xl border-2 flex flex-col items-center justify-center p-2 text-center select-none transition-colors ${
                        isFlipped
                            ? 'border-slate-200 bg-slate-50'
                            : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <span className="text-2xl">{epoch.icon}</span>
                    <p className="text-xs font-medium text-slate-700 leading-tight mt-1">{epoch.era}</p>
                    <p className="text-xs text-slate-400">{epoch.year}</p>
                    <p className="text-xs text-indigo-400 mt-1 font-medium">Klikk!</p>
                </div>

                {/* Back */}
                <div
                    className={`absolute inset-0 rounded-xl border-2 flex flex-col items-center justify-center p-2 text-center select-none transition-colors ${
                        isSelected
                            ? 'border-indigo-400 bg-indigo-100'
                            : 'border-indigo-200 bg-indigo-50 hover:border-indigo-300'
                    }`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <span className="text-2xl">{epoch.toolIcon}</span>
                    <p className="text-xs font-semibold text-indigo-700 leading-tight mt-1">{epoch.tool}</p>
                    <span className="text-sm mt-0.5">{epoch.reaction}</span>
                </div>
            </motion.div>
        </div>
    );
}
