import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

// Signaturkomponent for artikkelen om Den åttedelte vei.
// Lyspære-øyeblikket: veien er ikke bare for munker i et kloster - den er en
// rekke vanlige valg du tar i hverdagen, og valgene spenner over alle tre
// treningene (visdom, etikk, fordypning). Eleven møter situasjoner hen kjenner
// igjen og finner hvilken del av veien som hjelper.

type Training = 'visdom' | 'etikk' | 'fordypning';

interface Part {
    id: string;
    name: string;
    training: Training;
}

const PARTS: Part[] = [
    { id: 'forstaelse', name: 'Rett forståelse', training: 'visdom' },
    { id: 'tanke', name: 'Rett tanke', training: 'visdom' },
    { id: 'tale', name: 'Rett tale', training: 'etikk' },
    { id: 'handling', name: 'Rett handling', training: 'etikk' },
    { id: 'levevei', name: 'Rett levevei', training: 'etikk' },
    { id: 'innsats', name: 'Rett innsats', training: 'fordypning' },
    { id: 'oppmerksomhet', name: 'Rett oppmerksomhet', training: 'fordypning' },
    { id: 'konsentrasjon', name: 'Rett konsentrasjon', training: 'fordypning' },
];

const TRAININGS: Record<
    Training,
    { label: string; chip: string; chipActive: string; dot: string }
> = {
    visdom: {
        label: 'Visdom',
        chip: 'border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100',
        chipActive: 'border-amber-400 bg-amber-100 text-amber-900',
        dot: 'bg-amber-400',
    },
    etikk: {
        label: 'Etikk',
        chip: 'border-blue-200 bg-blue-50/60 text-blue-800 hover:bg-blue-100',
        chipActive: 'border-blue-400 bg-blue-100 text-blue-900',
        dot: 'bg-blue-400',
    },
    fordypning: {
        label: 'Fordypning',
        chip: 'border-purple-200 bg-purple-50/60 text-purple-800 hover:bg-purple-100',
        chipActive: 'border-purple-400 bg-purple-100 text-purple-900',
        dot: 'bg-purple-400',
    },
};

interface Dilemma {
    id: string;
    situation: string;
    correctId: string;
    wise: string;
}

const DILEMMAS: Dilemma[] = [
    {
        id: 'rykte',
        situation:
            'En klassekamerat sprer et falskt rykte om bestevennen din. Du blir fristet til å spre et like ekkelt rykte tilbake.',
        correctId: 'tale',
        wise: 'Rett tale: si sant, og la heller være å spre noe som sårer. Et rykte til gjør ikke det første mindre. Ord skaper virkelighet - de kan bygge opp eller rive ned.',
    },
    {
        id: 'jobb',
        situation:
            'Du skal velge sommerjobb. Ett firma betaler best, men tjener pengene på å lure eldre folk til å kjøpe noe de slett ikke trenger.',
        correctId: 'levevei',
        wise: 'Rett levevei: også jobben din er en etisk handling. Tjen til livet på en måte som ikke skader andre - selv om en annen vei gir mer penger.',
    },
    {
        id: 'prove',
        situation:
            'Det er kvelden før en stor prøve. Du er så stresset at tankene kjører i ring, og du får ikke sove.',
        correctId: 'oppmerksomhet',
        wise: 'Rett oppmerksomhet: legg merke til pusten og kroppen akkurat nå, i stedet for å bli dratt med av tankene om i morgen. Å være til stede i øyeblikket roer sinnet.',
    },
    {
        id: 'slag',
        situation:
            'En annen elev terger og dytter deg helt til du kjenner lysten til å slå tilbake stige i kroppen.',
        correctId: 'handling',
        wise: 'Rett handling: du kan kjenne sinnet uten å la kroppen skade noen. Å ikke slå er ikke svakhet - det er at du, ikke sinnet, bestemmer hva du gjør.',
    },
    {
        id: 'gir-opp',
        situation:
            'Du skal lære noe vanskelig, men sier til deg selv at det ikke nytter likevel - og gir opp før du egentlig har prøvd.',
        correctId: 'innsats',
        wise: 'Rett innsats: sinnet endrer seg ikke av seg selv, det må trenes. Å holde ut og prøve igjen er selve arbeidet som fører framover på veien.',
    },
    {
        id: 'lidelse',
        situation:
            'Du tenker at skuffelse og sorg er noe som rammer andre - ikke deg. Du trenger ikke tenke på sånt.',
        correctId: 'forstaelse',
        wise: 'Rett forståelse: å se ærlig at alt liv har lidelse er ikke trist - det er starten. Du kan ikke finne veien ut før du forstår hvor du faktisk står.',
    },
];

interface AttedeltVeiDilemmaProps {
    title?: string;
}

export function AttedeltVeiDilemma({
    title = 'Veien i hverdagen',
}: AttedeltVeiDilemmaProps) {
    const [index, setIndex] = useState(0);
    const [picked, setPicked] = useState<string | null>(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [done, setDone] = useState(false);

    const dilemma = DILEMMAS[index];
    const answered = picked !== null;
    const isCorrect = picked === dilemma.correctId;
    const correctPart = PARTS.find((p) => p.id === dilemma.correctId)!;

    const pick = (id: string) => {
        if (answered) return;
        setPicked(id);
        if (id === dilemma.correctId) setCorrectCount((c) => c + 1);
    };

    const next = () => {
        if (index + 1 >= DILEMMAS.length) {
            setDone(true);
            return;
        }
        setIndex((i) => i + 1);
        setPicked(null);
    };

    const reset = () => {
        setIndex(0);
        setPicked(null);
        setCorrectCount(0);
        setDone(false);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Compass className="w-5 h-5 text-indigo-500" />
                    <div>
                        <h3 className="font-semibold text-slate-800 leading-tight">{title}</h3>
                        <p className="text-sm text-slate-500">
                            Hvilken del av veien hjelper deg her?
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                        {done ? DILEMMAS.length : index + 1} / {DILEMMAS.length}
                    </span>
                    <button
                        onClick={reset}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Start på nytt"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100">
                <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 via-blue-400 to-purple-400"
                    animate={{
                        width: `${((done ? DILEMMAS.length : index) / DILEMMAS.length) * 100}%`,
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                />
            </div>

            {done ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 text-center"
                >
                    <motion.div
                        className="text-4xl mb-3 select-none"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, ease: 'easeInOut' }}
                    >
                        ☸
                    </motion.div>
                    <p className="text-lg font-bold text-slate-800">
                        Du traff riktig på {correctCount} av {DILEMMAS.length}
                    </p>
                    <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                        Legg merke til at situasjonene rørte ved alle tre treningene: visdom,
                        etikk og fordypning. Det er nettopp poenget - veien er ikke åtte trinn du
                        tar etter hverandre, men noe du øver på samtidig, midt i hverdagen din.
                    </p>
                    <button
                        onClick={reset}
                        className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                    >
                        Prøv igjen
                    </button>
                </motion.div>
            ) : (
                <div className="p-5">
                    {/* Situasjon */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={dilemma.id}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.25 }}
                            className="rounded-lg bg-slate-50 border border-slate-200 p-4 mb-4"
                        >
                            <p className="text-slate-700 leading-relaxed">{dilemma.situation}</p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Valg - de åtte delene, fargelagt etter trening */}
                    <div className="flex flex-wrap gap-2">
                        {PARTS.map((part) => {
                            const t = TRAININGS[part.training];
                            const chosen = picked === part.id;
                            const showRight = answered && part.id === dilemma.correctId;
                            const showWrong = answered && chosen && !showRight;
                            return (
                                <motion.button
                                    key={part.id}
                                    onClick={() => pick(part.id)}
                                    disabled={answered}
                                    whileTap={!answered ? { scale: 0.96 } : undefined}
                                    animate={showWrong ? { x: [0, -5, 5, -3, 3, 0] } : {}}
                                    transition={{ duration: 0.35 }}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                                        showRight
                                            ? 'border-emerald-400 bg-emerald-100 text-emerald-800'
                                            : showWrong
                                              ? 'border-rose-300 bg-rose-50 text-rose-700'
                                              : chosen
                                                ? t.chipActive
                                                : t.chip
                                    } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                                    {part.name}
                                    {showRight && <CheckCircle2 size={14} />}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Feedback-sone */}
                    <div className="mt-4 min-h-[1.5rem]">
                        <AnimatePresence mode="wait">
                            {answered ? (
                                <motion.div
                                    key="feedback"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`rounded-lg border p-4 ${
                                        isCorrect
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : 'bg-blue-50 border-blue-200'
                                    }`}
                                >
                                    <p
                                        className={`text-sm font-bold mb-1 ${
                                            isCorrect ? 'text-emerald-700' : 'text-blue-700'
                                        }`}
                                    >
                                        {isCorrect
                                            ? 'Riktig!'
                                            : `Her passer ${correctPart.name.toLowerCase()} best.`}
                                    </p>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {dilemma.wise}
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.p
                                    key="hint"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-sm text-slate-400"
                                >
                                    Velg den delen av veien du tror passer best.
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Kontrollrad */}
                    <div className="mt-4 flex items-center justify-end">
                        <button
                            onClick={next}
                            disabled={!answered}
                            className={`inline-flex items-center gap-1.5 rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                                answered
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            {index + 1 >= DILEMMAS.length ? 'Se resultatet' : 'Neste situasjon'}
                            <ArrowRight size={15} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
