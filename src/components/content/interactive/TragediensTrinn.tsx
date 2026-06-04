import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, ArrowRight, RotateCcw, Sparkles, AlertTriangle } from 'lucide-react';

interface TragediensTrinnProps {
    title?: string;
}

// Lyspære: en gresk tragedie er som en maskin. Heltens egen stolthet (hybris)
// driver ham uunngåelig oppover mot toppen og så rett i fallet. Eleven følger
// helten gjennom de fem trinnene, må selv velge overmotet for å sette tragedien
// i gang, og kjenner dermed på kroppen at feilen er selve motoren i historien.

type Phase = 'walking' | 'choice' | 'humble' | 'done';

interface Stage {
    title: string;
    term: string;
    body: string;
    // Høyde på buen: 0 = bunn, 1 = topp (stolthetens høydepunkt).
    alt: number;
    leftPct: number;
}

const STAGES: Stage[] = [
    {
        title: 'Storhet',
        term: '',
        body: 'Vi møter helten på toppen av livet. Han er mektig, modig og hyllet av alle. Akkurat derfor har han så langt å falle.',
        alt: 0.45,
        leftPct: 8,
    },
    {
        title: 'Overmot',
        term: 'hybris',
        body: 'Helten blir for stolt. Han trosser en advarsel fra gudene og stoler bare på seg selv. Dette overmotet kalles hybris - og det er heltens skjebnesvangre feil (hamartia).',
        alt: 1.0,
        leftPct: 30,
    },
    {
        title: 'Vendepunktet',
        term: 'peripeti',
        body: 'Alt snur. Lykken blir plutselig til ulykke. Dette brå omslaget kalles peripeti. Nå går det bare én vei: nedover.',
        alt: 0.6,
        leftPct: 52,
    },
    {
        title: 'Erkjennelsen',
        term: 'anagnorisis',
        body: 'Helten forstår endelig sin egen feil. Denne erkjennelsen kalles anagnorisis. Men innsikten kommer for sent til å redde ham.',
        alt: 0.3,
        leftPct: 74,
    },
    {
        title: 'Fallet',
        term: 'katarsis',
        body: 'Helten går under. Vi som ser på, kjenner både redsel og medynk - og går renset ut av teateret. Denne følelsesmessige renselsen kalles katarsis.',
        alt: 0.06,
        leftPct: 92,
    },
];

const ARC_H = 170; // høyde på buefeltet i px

function topPx(alt: number) {
    return (1 - alt) * (ARC_H - 30) + 12;
}

export function TragediensTrinn({ title = 'Slik bygger en tragedie seg opp' }: TragediensTrinnProps) {
    const [stage, setStage] = useState(0);
    const [phase, setPhase] = useState<Phase>('walking');

    const current = STAGES[stage];

    const reset = () => {
        setStage(0);
        setPhase('walking');
    };

    const next = () => {
        // Ved hybris-trinnet må eleven selv velge overmotet for å gå videre.
        if (stage === 1 && phase === 'walking') {
            setPhase('choice');
            return;
        }
        if (stage >= STAGES.length - 1) {
            setPhase('done');
            return;
        }
        setStage((s) => s + 1);
    };

    const choosePride = () => {
        setPhase('walking');
        setStage(2);
    };

    const polyPoints = STAGES.map((s) => `${s.leftPct},${topPx(s.alt)}`).join(' ');

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Crown className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Følg helten gjennom de fem trinnene i en gresk tragedie.
                    </p>
                </div>
            </div>

            {/* Buefelt med helten */}
            <div className="px-6 pt-5">
                <div className="relative w-full" style={{ height: ARC_H }}>
                    {/* Selve buen */}
                    <svg
                        viewBox={`0 0 100 ${ARC_H}`}
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full"
                    >
                        <polyline
                            points={polyPoints}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth={2.5}
                            strokeLinejoin="round"
                        />
                    </svg>

                    {/* Trinn-noder */}
                    {STAGES.map((s, i) => {
                        const reached = i <= stage;
                        return (
                            <div
                                key={i}
                                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                                style={{ left: `${s.leftPct}%`, top: topPx(s.alt) }}
                            >
                                <motion.div
                                    animate={{
                                        scale: i === stage ? 1.15 : 1,
                                        backgroundColor: reached ? '#6366f1' : '#cbd5e1',
                                    }}
                                    className="w-3.5 h-3.5 rounded-full"
                                />
                                <span
                                    className={`mt-1 text-[10px] font-semibold whitespace-nowrap ${
                                        reached ? 'text-indigo-600' : 'text-slate-400'
                                    }`}
                                >
                                    {s.title}
                                </span>
                            </div>
                        );
                    })}

                    {/* Helten som beveger seg langs buen */}
                    <motion.div
                        className="absolute z-10 -translate-x-1/2 -translate-y-full"
                        initial={false}
                        animate={{ left: `${current.leftPct}%`, top: topPx(current.alt) - 8 }}
                        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                    >
                        <div className="relative flex flex-col items-center">
                            <AnimatePresence>
                                {phase === 'done' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.4 }}
                                        animate={{ opacity: 1, scale: 1.6 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.6 }}
                                        className="absolute inset-0 rounded-full bg-amber-300/50 blur-md"
                                    />
                                )}
                            </AnimatePresence>
                            <div
                                className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                                    stage >= 2 ? 'bg-rose-500' : 'bg-amber-500'
                                }`}
                            >
                                <Crown className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Forklaring / feedback-sone */}
            <div className="px-6 pt-2 pb-1 min-h-[112px]">
                <AnimatePresence mode="wait">
                    {phase === 'choice' ? (
                        <motion.div
                            key="choice"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-lg bg-indigo-50 border border-indigo-200 p-4"
                        >
                            <p className="text-sm font-semibold text-indigo-900 mb-3">
                                Helten får en advarsel fra gudene. Hva gjør han?
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={choosePride}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    Stoler på seg selv (overmot)
                                </button>
                                <button
                                    onClick={() => setPhase('humble')}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    Lytter til advarselen
                                </button>
                            </div>
                        </motion.div>
                    ) : phase === 'humble' ? (
                        <motion.div
                            key="humble"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-lg bg-blue-50 border border-blue-200 p-4"
                        >
                            <div className="flex items-start gap-2 mb-3">
                                <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    Da skjer det ingen ulykke - og da blir det heller ingen tragedie,
                                    bare en rolig historie. En helt uten feil faller aldri. Tragedien
                                    trenger heltens svakhet (hamartia) for å komme i gang.
                                </p>
                            </div>
                            <button
                                onClick={() => setPhase('choice')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                            >
                                Prøv igjen
                            </button>
                        </motion.div>
                    ) : phase === 'done' ? (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-lg bg-emerald-50 border border-emerald-200 p-4"
                        >
                            <div className="flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-emerald-800 leading-relaxed">
                                    Du har fulgt hele buen. En gresk tragedie er som en maskin:
                                    heltens egen stolthet driver ham oppover mot toppen og så rett i
                                    fallet. Vi som ser på, gråter med ham - og går renset hjem. Det
                                    er katarsis.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`stage-${stage}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-lg bg-slate-50 border border-slate-200 p-4"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-slate-800">
                                    {current.title}
                                </span>
                                {current.term && (
                                    <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2 py-0.5">
                                        {current.term}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{current.body}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 pt-2 flex items-center justify-between">
                {phase === 'walking' && (
                    <button
                        onClick={next}
                        className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                    >
                        {stage >= STAGES.length - 1 ? 'Fullfør tragedien' : 'Neste trinn'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
                {phase !== 'walking' && <span />}
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
