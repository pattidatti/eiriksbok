import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, RotateCcw, ChevronRight } from 'lucide-react';

interface ArgumentBroenProps {
    title?: string;
}

interface Round {
    topic: string;
    claim: string;
    beleggOptions: { text: string; correct: boolean; feedback: string }[];
    forklaringOptions: { text: string; correct: boolean; feedback: string }[];
}

const ROUNDS: Round[] = [
    {
        topic: 'Reklameforbud for usunn mat',
        claim: 'Norge bør innføre reklameforbud for usunn mat rettet mot barn.',
        beleggOptions: [
            {
                text: 'Folkehelseinstituttet viser at barn som ser mye matvarereklame, spiser mer sukker og fett.',
                correct: true,
                feedback: 'Godt! Dette er et faktabasert belegg fra en troverdig kilde.',
            },
            {
                text: 'Mange foreldre synes det er irriterende at barna maser om godteri etter TV-reklame.',
                correct: false,
                feedback: 'Dette er synsing - ikke et faktabasert belegg med kilde.',
            },
            {
                text: 'Reklame er dyrt å lage og krever store budsjetter fra næringslivet.',
                correct: false,
                feedback: 'Dette handler om reklamebransjen - ikke om effekten på barn.',
            },
        ],
        forklaringOptions: [
            {
                text: 'Siden barn ikke har utviklet evnen til å motstå profesjonell markedsføring, bør vi beskytte dem med et forbud.',
                correct: true,
                feedback: 'Riktig! Denne forklaringen kobler belegget (effekt på barn) til påstanden (forbud).',
            },
            {
                text: 'I tillegg finnes det mange andre helseproblemer blant barn i Norge.',
                correct: false,
                feedback: 'Dette endrer tema - det kobler ikke belegget til påstanden.',
            },
            {
                text: 'Det er selvsagt klart at reklame er skadelig for barn i alle situasjoner.',
                correct: false,
                feedback: 'Dette gjentar bare en sterkere versjon av påstanden - det er ikke en forklaring.',
            },
        ],
    },
    {
        topic: 'Klimakvotehandel',
        claim: 'Klimakvotehandel er ikke nok til å stoppe global oppvarming.',
        beleggOptions: [
            {
                text: 'FNs klimapanel slår fast at verden er på vei mot 2,7 graders oppvarming selv med dagens kvotesystemer.',
                correct: true,
                feedback: 'Godt! FNs klimapanel er en svært troverdig kilde med målbare tall.',
            },
            {
                text: 'Mange politikere snakker mye om klima, men gjør lite i praksis.',
                correct: false,
                feedback: 'Dette er synsing uten konkrete tall eller pålitelig kilde.',
            },
            {
                text: 'Kvotehandel ble innført på 2000-tallet som en markedsbasert løsning.',
                correct: false,
                feedback: 'Dette forklarer hva kvotehandel er - ikke om det virker nok.',
            },
        ],
        forklaringOptions: [
            {
                text: 'Når vi ser at eksisterende kvotesystemer ikke holder, betyr det at vi trenger strengere tiltak for å nå klimamålene.',
                correct: true,
                feedback: 'Riktig! Forklaringen kobler belegget (ikke nok effekt) til påstanden (kvotehandel ikke nok).',
            },
            {
                text: 'Dessuten er det mange land som ikke deltar i kvotehandel.',
                correct: false,
                feedback: 'Dette er et nytt argument - det kobler ikke belegget til påstanden.',
            },
            {
                text: 'Klimakrisen er åpenbart et av de største problemene i vår tid.',
                correct: false,
                feedback: 'Dette er en generell påstand - det bringer ikke belegget og konklusjonen sammen.',
            },
        ],
    },
    {
        topic: 'Skjermtid for ungdom',
        claim: 'Ungdom bør begrense skjermtid til maks to timer per dag utenom skole.',
        beleggOptions: [
            {
                text: 'En meta-analyse av 23 studier viser at ungdom med mer enn tre timers daglig skjermbruk har dobbelt så høy risiko for depresjonssymptomer.',
                correct: true,
                feedback: 'Godt! Meta-analyser (studier av studier) er blant de sterkeste beleggene.',
            },
            {
                text: 'De fleste ungdommer bruker mer tid på skjerm enn de burde.',
                correct: false,
                feedback: 'Dette er synsing uten kilde - hvem sier hva som er «for mye»?',
            },
            {
                text: 'Mobiltelefoner og nettbrett er blitt mye billigere de siste ti årene.',
                correct: false,
                feedback: 'Dette handler om pris - ikke om effekten av skjermbruk på helse.',
            },
        ],
        forklaringOptions: [
            {
                text: 'Siden forskning viser en klar sammenheng mellom høy skjermtid og psykisk helse, gir det mening å sette en grense som holder ungdom under risikosonen.',
                correct: true,
                feedback: 'Riktig! Forklaringen binder forskningsresultatet til anbefalingen om to-timersgrensen.',
            },
            {
                text: 'I tillegg er det viktig at ungdom sover nok og er fysisk aktive.',
                correct: false,
                feedback: 'Dette er nye argumenter - de kobler ikke belegget til akkurat denne påstanden.',
            },
            {
                text: 'Det er klart at ungdom ikke vet hva som er best for dem selv.',
                correct: false,
                feedback: 'Dette er en ny påstand - det forklarer ikke hvorfor belegget støtter den opprinnelige påstanden.',
            },
        ],
    },
];

type Phase = 'belegg' | 'forklaring' | 'done';

export function ArgumentBroen({ title = 'Bygg argumentet' }: ArgumentBroenProps) {
    const [roundIndex, setRoundIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>('belegg');
    const [selectedBelegg, setSelectedBelegg] = useState<number | null>(null);
    const [selectedForklaring, setSelectedForklaring] = useState<number | null>(null);
    const [beleggFeedback, setBeleggFeedback] = useState('');
    const [forklaringFeedback, setForklaringFeedback] = useState('');
    const [beleggCorrect, setBeleggCorrect] = useState(false);
    const [forklaringCorrect, setForklaringCorrect] = useState(false);
    const [figureWalking, setFigureWalking] = useState(false);
    const [allDone, setAllDone] = useState(false);
    const [wrongShake, setWrongShake] = useState<number | null>(null);

    const round = ROUNDS[roundIndex];

    const resetRound = () => {
        setPhase('belegg');
        setSelectedBelegg(null);
        setSelectedForklaring(null);
        setBeleggFeedback('');
        setForklaringFeedback('');
        setBeleggCorrect(false);
        setForklaringCorrect(false);
        setFigureWalking(false);
        setWrongShake(null);
    };

    const reset = () => {
        setRoundIndex(0);
        setAllDone(false);
        resetRound();
    };

    const handleBeleggClick = (idx: number) => {
        if (selectedBelegg !== null) return;
        const opt = round.beleggOptions[idx];
        setSelectedBelegg(idx);
        setBeleggFeedback(opt.feedback);
        setBeleggCorrect(opt.correct);
        if (!opt.correct) {
            setWrongShake(idx);
            setTimeout(() => {
                setWrongShake(null);
                setSelectedBelegg(null);
                setBeleggFeedback('');
            }, 1400);
        }
    };

    const handleForklaringClick = (idx: number) => {
        if (selectedForklaring !== null) return;
        const opt = round.forklaringOptions[idx];
        setSelectedForklaring(idx);
        setForklaringFeedback(opt.feedback);
        setForklaringCorrect(opt.correct);
        if (!opt.correct) {
            setWrongShake(100 + idx);
            setTimeout(() => {
                setWrongShake(null);
                setSelectedForklaring(null);
                setForklaringFeedback('');
            }, 1400);
        } else {
            setFigureWalking(true);
            setTimeout(() => {
                if (roundIndex < ROUNDS.length - 1) {
                    setRoundIndex((r) => r + 1);
                    resetRound();
                } else {
                    setAllDone(true);
                }
            }, 2200);
        }
    };

    const bridgeWidth = beleggCorrect && forklaringCorrect ? 100 : beleggCorrect ? 50 : 0;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800">{title}</h3>
                        <p className="text-sm text-slate-500">Velg riktig belegg, deretter forklaring</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {ROUNDS.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full transition-colors ${i < roundIndex ? 'bg-emerald-400' : i === roundIndex && !allDone ? 'bg-indigo-500' : allDone && i === ROUNDS.length - 1 ? 'bg-emerald-400' : 'bg-slate-200'}`}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {allDone ? (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                            className="text-5xl mb-4"
                        >
                            🌉
                        </motion.div>
                        <h4 className="text-xl font-bold text-slate-800 mb-3">
                            Du bygde tre fullstendige argumenter!
                        </h4>
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 text-left max-w-md mx-auto">
                            <p className="text-sm font-semibold text-indigo-700 mb-1">Lyspæren:</p>
                            <p className="text-sm text-indigo-800">
                                Forklaringen er broen mellom belegget og påstanden. Uten den henger ikke argumentet
                                sammen - det er bare to isolerte utsagn på hver sin side av kløften.
                            </p>
                        </div>
                        <button
                            onClick={reset}
                            className="flex items-center gap-2 mx-auto text-slate-500 hover:text-slate-700 text-sm transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Prøv igjen
                        </button>
                    </motion.div>
                ) : (
                    <motion.div key={roundIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Topic + Claim */}
                        <div className="px-6 pt-5 pb-3">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                                Tema: {round.topic}
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                                <div className="text-xs font-semibold text-indigo-500 mb-1">Påstand</div>
                                <p className="text-sm text-slate-800 font-medium">{round.claim}</p>
                            </div>
                        </div>

                        {/* Bridge visual */}
                        <div className="px-6 py-2">
                            <div className="relative flex items-end justify-between h-20">
                                {/* Belegg platform */}
                                <div className="flex flex-col items-center gap-1 w-24">
                                    <div
                                        className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${beleggCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                                    >
                                        Belegg
                                    </div>
                                    <div
                                        className={`w-full h-3 rounded-t-sm transition-colors ${beleggCorrect ? 'bg-emerald-400' : 'bg-slate-300'}`}
                                    />
                                </div>

                                {/* Bridge span */}
                                <div className="flex-1 relative mx-1 flex items-end">
                                    {/* Chasm */}
                                    <div className="w-full h-1 bg-slate-100 rounded" />
                                    {/* Bridge fill */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-indigo-400 rounded"
                                        style={{ originX: 0 }}
                                        animate={{ scaleX: bridgeWidth / 100 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                    />
                                    {/* Walking figure */}
                                    <AnimatePresence>
                                        {figureWalking && (
                                            <motion.div
                                                initial={{ left: '0%' }}
                                                animate={{ left: '100%' }}
                                                transition={{ duration: 1.8, ease: 'easeInOut' }}
                                                className="absolute -top-5 text-base"
                                                style={{ position: 'absolute' }}
                                            >
                                                🚶
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Påstand platform */}
                                <div className="flex flex-col items-center gap-1 w-24">
                                    <div
                                        className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${forklaringCorrect ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}
                                    >
                                        Påstand
                                    </div>
                                    <div
                                        className={`w-full h-3 rounded-t-sm transition-colors ${forklaringCorrect ? 'bg-indigo-400' : 'bg-slate-300'}`}
                                    />
                                </div>
                            </div>
                            <div className="text-center text-xs text-slate-400 mt-1">
                                {beleggCorrect && !forklaringCorrect
                                    ? 'Nå mangler du forklaringen - broen er halvferdig'
                                    : !beleggCorrect
                                      ? 'Velg belegget som bygger den venstre siden'
                                      : ''}
                            </div>
                        </div>

                        {/* Belegg selection */}
                        <div className="px-6 pb-3">
                            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                                {phase === 'belegg' ? '1. Velg belegg (kilden)' : 'Belegg valgt'}
                            </div>
                            <div className="grid gap-2">
                                {round.beleggOptions.map((opt, i) => {
                                    const isSelected = selectedBelegg === i;
                                    const isWrong = wrongShake === i;
                                    const isLocked = selectedBelegg !== null && !isSelected;

                                    return (
                                        <motion.button
                                            key={i}
                                            animate={
                                                isWrong
                                                    ? { x: [0, -6, 6, -6, 6, 0] }
                                                    : isSelected && beleggCorrect
                                                      ? { scale: [1, 1.02, 1] }
                                                      : {}
                                            }
                                            transition={{ duration: 0.4 }}
                                            onClick={() => handleBeleggClick(i)}
                                            disabled={isLocked || (beleggCorrect && phase !== 'belegg')}
                                            className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                                                isSelected && beleggCorrect
                                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                                    : isWrong
                                                      ? 'border-rose-300 bg-rose-50 text-rose-700'
                                                      : isLocked
                                                        ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                                                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer'
                                            }`}
                                        >
                                            {opt.text}
                                        </motion.button>
                                    );
                                })}
                            </div>
                            <AnimatePresence>
                                {beleggFeedback && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`text-xs mt-2 px-3 py-2 rounded-lg ${beleggCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
                                    >
                                        {beleggFeedback}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Forklaring selection */}
                        <AnimatePresence>
                            {beleggCorrect && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="px-6 pb-5"
                                >
                                    <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                                        2. Velg forklaringen (broen)
                                    </div>
                                    <div className="grid gap-2">
                                        {round.forklaringOptions.map((opt, i) => {
                                            const isSelected = selectedForklaring === i;
                                            const isWrong = wrongShake === 100 + i;
                                            const isLocked =
                                                selectedForklaring !== null && !isSelected && forklaringCorrect;

                                            return (
                                                <motion.button
                                                    key={i}
                                                    animate={
                                                        isWrong
                                                            ? { x: [0, -6, 6, -6, 6, 0] }
                                                            : isSelected && forklaringCorrect
                                                              ? { scale: [1, 1.02, 1] }
                                                              : {}
                                                    }
                                                    transition={{ duration: 0.4 }}
                                                    onClick={() => handleForklaringClick(i)}
                                                    disabled={isLocked}
                                                    className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                                                        isSelected && forklaringCorrect
                                                            ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                                                            : isWrong
                                                              ? 'border-rose-300 bg-rose-50 text-rose-700'
                                                              : isLocked
                                                                ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                                                                : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer'
                                                    }`}
                                                >
                                                    {opt.text}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                    <AnimatePresence>
                                        {forklaringFeedback && (
                                            <motion.p
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className={`text-xs mt-2 px-3 py-2 rounded-lg ${forklaringCorrect ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'}`}
                                            >
                                                {forklaringFeedback}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer nav */}
                        <div className="px-6 pb-5 flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                                Runde {roundIndex + 1} av {ROUNDS.length}
                            </span>
                            {beleggCorrect && forklaringCorrect && !figureWalking && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-1 text-xs text-emerald-600 font-medium"
                                >
                                    Fullt argument! <ChevronRight className="w-3 h-3" />
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
