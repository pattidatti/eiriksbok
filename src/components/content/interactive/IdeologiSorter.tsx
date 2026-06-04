import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, RefreshCw } from 'lucide-react';

// Signaturkomponent for "Mellomkrigstiden: En verden i endring".
// Lyspære: de tre store ideologiene (demokrati, fascisme, kommunisme) kjempet
// om Europas fremtid. Eleven sorterer ni historiske hendelser til riktig leir
// og kjenner dermed på kroppen hva som skiller dem.

type BucketId = 'demokrati' | 'fascisme' | 'kommunisme';

interface SortCard {
    id: string;
    text: string;
    shortText: string;
    correctBucket: BucketId;
}

const CARDS: SortCard[] = [
    {
        id: 'c1',
        text: 'Folkeforbundet opprettes for å forhindre ny krig (1920)',
        shortText: 'Folkeforbundet',
        correctBucket: 'demokrati',
    },
    {
        id: 'c2',
        text: 'Mussolini fører svartskjortene til Roma og griper makten (1922)',
        shortText: 'Mussolini griper makten',
        correctBucket: 'fascisme',
    },
    {
        id: 'c3',
        text: 'Stalin innfører femårsplaner og statlig kontroll over hele økonomien',
        shortText: 'Stalins femårsplaner',
        correctBucket: 'kommunisme',
    },
    {
        id: 'c4',
        text: 'Hitler utnevnes til rikskansler i Tyskland (30. januar 1933)',
        shortText: 'Hitler til makten',
        correctBucket: 'fascisme',
    },
    {
        id: 'c5',
        text: 'USA holder frie presidentvalg midt under den verste depresjonen (1932)',
        shortText: 'USA holder frie valg',
        correctBucket: 'demokrati',
    },
    {
        id: 'c6',
        text: 'Franco vinner borgerkrigen og innfører diktatur i Spania (1939)',
        shortText: 'Franco i Spania',
        correctBucket: 'fascisme',
    },
    {
        id: 'c7',
        text: 'Bolsjevikene tar makten i Russland gjennom revolusjon (1917)',
        shortText: 'Bolsjevikrevolusjonen',
        correctBucket: 'kommunisme',
    },
    {
        id: 'c8',
        text: 'Storbritannia holder frie valg og bevarer parlamentet gjennom hele perioden',
        shortText: 'Britisk demokrati holder',
        correctBucket: 'demokrati',
    },
    {
        id: 'c9',
        text: 'Sovjet tvangskollektiviserer bønder - millioner dør i hungersnøden (1932-33)',
        shortText: 'Tvangskollektivisering',
        correctBucket: 'kommunisme',
    },
];

const BUCKETS: {
    id: BucketId;
    label: string;
    emoji: string;
    description: string;
    activeBorder: string;
    activeBg: string;
    badgeBg: string;
    badgeText: string;
}[] = [
    {
        id: 'demokrati',
        label: 'Liberalt demokrati',
        emoji: '🗳️',
        description: 'Frie valg, rettigheter, parlament',
        activeBorder: 'border-blue-400',
        activeBg: 'bg-blue-50',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-800',
    },
    {
        id: 'fascisme',
        label: 'Fascisme',
        emoji: '⚡',
        description: 'Sterk leder, nasjonen over alt, vold som verktøy',
        activeBorder: 'border-rose-400',
        activeBg: 'bg-rose-50',
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-800',
    },
    {
        id: 'kommunisme',
        label: 'Kommunisme',
        emoji: '⚙️',
        description: 'Statlig eierskap, klassekamp, revolusjon',
        activeBorder: 'border-amber-400',
        activeBg: 'bg-amber-50',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800',
    },
];

export function IdeologiSorter() {
    const [selected, setSelected] = useState<string | null>(null);
    const [placed, setPlaced] = useState<Record<string, BucketId>>({});
    const [wrongBucket, setWrongBucket] = useState<BucketId | null>(null);
    const [done, setDone] = useState(false);

    const remaining = CARDS.filter((c) => !placed[c.id]);

    const handleCardClick = (id: string) => {
        if (placed[id] || done) return;
        setSelected((prev) => (prev === id ? null : id));
    };

    const handleBucketClick = (bucketId: BucketId) => {
        if (!selected || done) return;
        const card = CARDS.find((c) => c.id === selected)!;
        if (card.correctBucket === bucketId) {
            const newPlaced = { ...placed, [selected]: bucketId };
            setPlaced(newPlaced);
            setSelected(null);
            if (Object.keys(newPlaced).length === CARDS.length) {
                setDone(true);
            }
        } else {
            setWrongBucket(bucketId);
            setTimeout(() => setWrongBucket(null), 550);
        }
    };

    const reset = () => {
        setSelected(null);
        setPlaced({});
        setWrongBucket(null);
        setDone(false);
    };

    const isTarget = !!selected && !done;
    const progress = Object.keys(placed).length;

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-bold text-slate-800 text-base">
                        🌍 Tre ideologier kjempet om Europa
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {done
                            ? 'Du kjenner de tre store ideologiene!'
                            : selected
                            ? 'Trykk på riktig bøtte for å plassere kortet.'
                            : `Trykk på et kort, og plasser det i riktig ideologi. (${progress}/9)`}
                    </p>
                </div>
                <button
                    onClick={reset}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors shrink-0 ml-3"
                >
                    <RefreshCw className="w-3 h-3" />
                    Nullstill
                </button>
            </div>

            {/* Cards to sort */}
            {!done && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-50 rounded-lg min-h-[52px]">
                    {remaining.map((card) => (
                        <motion.button
                            key={card.id}
                            layout
                            onClick={() => handleCardClick(card.id)}
                            whileTap={{ scale: 0.96 }}
                            className={`text-left px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                selected === card.id
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                            }`}
                        >
                            {card.text}
                        </motion.button>
                    ))}
                    {remaining.length === 0 && !done && (
                        <span className="text-sm text-slate-400 italic">Alle kort er plassert.</span>
                    )}
                </div>
            )}

            {/* Buckets */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                {BUCKETS.map((bucket) => {
                    const placedHere = CARDS.filter((c) => placed[c.id] === bucket.id);
                    const isWrong = wrongBucket === bucket.id;

                    return (
                        <motion.div
                            key={bucket.id}
                            animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                            transition={{ duration: 0.4 }}
                        >
                            <button
                                onClick={() => handleBucketClick(bucket.id)}
                                disabled={!isTarget}
                                className={`w-full rounded-xl border-2 p-3 text-left min-h-[90px] transition-all ${
                                    isTarget
                                        ? `${bucket.activeBg} ${bucket.activeBorder} cursor-pointer hover:shadow-sm`
                                        : 'bg-slate-50 border-slate-200 cursor-default'
                                }`}
                            >
                                <div className="font-bold text-sm text-slate-800 mb-0.5">
                                    {bucket.emoji} {bucket.label}
                                </div>
                                <div className="text-xs text-slate-500 mb-2">{bucket.description}</div>
                                <div className="flex flex-col gap-1">
                                    {placedHere.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`text-xs rounded px-2 py-0.5 font-medium ${bucket.badgeBg} ${bucket.badgeText}`}
                                        >
                                            ✓ {item.shortText}
                                        </motion.div>
                                    ))}
                                </div>
                            </button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Done state */}
            <AnimatePresence>
                {done && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-50 border border-emerald-200 rounded-xl p-4"
                    >
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-emerald-800 text-sm">
                                    Riktig sortert alle ni!
                                </p>
                                <p className="text-sm text-emerald-700 mt-1">
                                    I mellomkrigstiden konkurrerte disse tre ideologiene om å forme Europas fremtid.
                                    I 1938 styrte fascisme og kommunisme de fleste land. Demokratiet var blitt unntaket.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
