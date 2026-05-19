import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, RotateCcw, Sparkles } from 'lucide-react';

interface Statue {
    id: string;
    name: string;
    year: string;
    fact: string;
    silhouette: string;
}

interface MichelangeloMarmorProps {
    title?: string;
    intro?: string;
    quote?: string;
    statues?: Statue[];
}

const COLS = 8;
const ROWS = 6;
const REVEAL_THRESHOLD = 28;

const DEFAULT_STATUES: Statue[] = [
    {
        id: 'david',
        name: 'David',
        year: '1501-1504',
        fact: 'Marmorblokken hadde ligget kassert i 25 år da Michelangelo fikk den. Han brukte tre år og hugde fram en 5,17 meter høy figur fra et stykke alle andre hadde gitt opp.',
        silhouette:
            'M 100 40 Q 95 30 100 22 Q 110 18 118 24 Q 122 32 118 42 L 116 52 Q 122 58 124 70 L 128 100 Q 130 115 122 125 L 118 145 Q 115 165 118 180 L 122 220 Q 124 240 120 260 L 118 280 L 110 280 L 108 250 L 102 250 L 100 280 L 90 280 L 92 250 L 92 220 Q 88 200 86 180 L 84 145 Q 80 120 78 100 Q 76 80 80 65 Q 84 55 90 50 Z',
    },
    {
        id: 'pieta',
        name: 'Pietà',
        year: '1498-1499',
        fact: 'Michelangelo var bare 24 år da han ferdigstilte denne. Det er det eneste verket han signerte — han ristet inn navnet sitt på Marias bryststropp da han hørte folk trodde noen andre hadde laget det.',
        silhouette:
            'M 70 250 Q 60 240 60 220 Q 60 195 75 180 L 90 150 Q 95 130 105 120 Q 115 110 130 110 Q 145 110 155 120 Q 165 130 168 145 L 172 175 Q 175 195 175 215 Q 175 240 165 255 L 155 270 Q 150 280 140 282 L 95 282 Q 80 282 70 270 Z M 105 95 Q 100 85 105 78 Q 115 73 122 80 Q 125 90 120 98 Q 110 102 105 95 Z',
    },
    {
        id: 'mose',
        name: 'Moses',
        year: '1513-1515',
        fact: 'Da Michelangelo var ferdig, sies det at han slo skulpturen på kneet med hammeren og ropte: «Hvorfor snakker du ikke?» Han hadde meislet ham så levende at han ventet svar.',
        silhouette:
            'M 100 30 Q 95 22 100 16 Q 110 12 118 18 Q 122 28 118 36 L 116 50 Q 124 50 130 56 L 145 60 Q 150 62 152 70 L 150 80 L 130 75 L 122 75 Q 124 90 130 100 L 142 120 Q 150 135 152 150 L 152 200 Q 152 230 145 255 L 140 275 L 80 275 L 75 255 Q 68 230 68 200 L 68 150 Q 70 135 78 120 L 90 100 Q 96 90 98 75 L 90 75 L 70 80 L 68 70 Q 70 62 75 60 L 90 56 Q 96 50 104 50 Z',
    },
];

type Phase = 'idle' | 'chipping' | 'revealed';

export function MichelangeloMarmor({
    title = 'Frigjør figuren fra marmoren',
    intro = 'Michelangelo sa at statuen allerede lå inne i steinen — han bare meislet bort det som ikke hørte til. Klikk på marmorflisene og slå dem bort, ett slag om gangen.',
    quote = '«Jeg så engelen i marmoren, og jeg meislet til jeg satte ham fri.»',
    statues = DEFAULT_STATUES,
}: MichelangeloMarmorProps) {
    const [statueIndex, setStatueIndex] = useState(0);
    const [removed, setRemoved] = useState<Set<number>>(new Set());
    const [phase, setPhase] = useState<Phase>('idle');

    const statue = statues[statueIndex];

    const tiles = useMemo(() => {
        const arr: { id: number; col: number; row: number }[] = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                arr.push({ id: r * COLS + c, col: c, row: r });
            }
        }
        return arr;
    }, []);

    const handleChip = (id: number) => {
        if (phase === 'revealed') return;
        setRemoved((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            if (next.size >= REVEAL_THRESHOLD) {
                setPhase('revealed');
            } else if (phase === 'idle') {
                setPhase('chipping');
            }
            return next;
        });
    };

    const handleReset = () => {
        setRemoved(new Set());
        setPhase('idle');
    };

    const handlePickStatue = (idx: number) => {
        setStatueIndex(idx);
        setRemoved(new Set());
        setPhase('idle');
    };

    const progress = Math.min(100, Math.round((removed.size / REVEAL_THRESHOLD) * 100));

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Hammer className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{intro}</p>
                </div>
            </div>

            <div className="px-6 pt-4 flex flex-wrap gap-2">
                {statues.map((s, i) => (
                    <button
                        key={s.id}
                        onClick={() => handlePickStatue(i)}
                        className={`text-sm rounded-full px-4 py-1.5 border transition-colors ${
                            i === statueIndex
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                    >
                        {s.name}{' '}
                        <span className={i === statueIndex ? 'text-indigo-100' : 'text-slate-400'}>
                            {s.year}
                        </span>
                    </button>
                ))}
            </div>

            <div className="p-6">
                <div
                    className="relative mx-auto rounded-lg overflow-hidden border border-slate-200 bg-gradient-to-b from-stone-100 to-stone-200"
                    style={{ maxWidth: '480px', aspectRatio: `${COLS} / ${ROWS}` }}
                >
                    <svg
                        viewBox="0 0 200 300"
                        preserveAspectRatio="xMidYMid meet"
                        className="absolute inset-0 w-full h-full"
                    >
                        <defs>
                            <radialGradient id="statueGlow" cx="50%" cy="40%" r="60%">
                                <stop offset="0%" stopColor="#fef3c7" />
                                <stop offset="60%" stopColor="#f5deb3" />
                                <stop offset="100%" stopColor="#d6c2a3" />
                            </radialGradient>
                        </defs>
                        <motion.path
                            key={statue.id}
                            d={statue.silhouette}
                            fill="url(#statueGlow)"
                            stroke="#a08862"
                            strokeWidth="1.2"
                            initial={{ opacity: 0.4 }}
                            animate={{ opacity: phase === 'revealed' ? 1 : 0.55 }}
                            transition={{ duration: 0.6 }}
                        />
                        {phase === 'revealed' && (
                            <motion.circle
                                cx="100"
                                cy="150"
                                r="120"
                                fill="none"
                                stroke="#fbbf24"
                                strokeWidth="2"
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: [0, 0.7, 0], scale: [0.6, 1.05, 1.2] }}
                                transition={{ duration: 1.4, ease: 'easeOut' }}
                            />
                        )}
                    </svg>

                    <div
                        className="absolute inset-0 grid"
                        style={{
                            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                        }}
                    >
                        {tiles.map((tile) => {
                            const isGone = removed.has(tile.id);
                            return (
                                <motion.button
                                    key={tile.id}
                                    onClick={() => handleChip(tile.id)}
                                    disabled={isGone || phase === 'revealed'}
                                    aria-label={`Slå bort marmorfliken på rad ${tile.row + 1}, kolonne ${tile.col + 1}`}
                                    className="relative border border-stone-300/60 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300 hover:from-stone-300 hover:via-stone-200 hover:to-stone-400 disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    initial={false}
                                    animate={
                                        isGone
                                            ? { opacity: 0, scale: 0.4, y: 22, rotate: (tile.col - 4) * 6 }
                                            : { opacity: 1, scale: 1, y: 0, rotate: 0 }
                                    }
                                    transition={{ duration: 0.35, ease: 'easeOut' }}
                                    style={{ pointerEvents: isGone ? 'none' : 'auto' }}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                        <span>
                            {removed.size} av {REVEAL_THRESHOLD} slag
                        </span>
                        <span className="text-slate-400">{statue.name}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                            className="h-full bg-indigo-500"
                            initial={false}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {phase === 'revealed' && (
                    <motion.div
                        key="revealed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800"
                    >
                        <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                            <div className="text-sm leading-relaxed">
                                <p className="italic">{quote}</p>
                                <p className="mt-2 text-amber-900">
                                    <span className="font-semibold">{statue.name}:</span> {statue.fact}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
                {phase === 'chipping' && (
                    <motion.div
                        key="chipping"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm"
                    >
                        Fortsett å slå. Figuren venter inne i steinen.
                    </motion.div>
                )}
                {phase === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-sm"
                    >
                        Klikk hvor som helst på marmoren for å begynne å meisle.
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
