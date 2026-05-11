import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    X,
    RefreshCw,
    ArrowRight,
    ListChecks,
    Sparkles,
    Compass,
    ChevronDown,
    AlertTriangle,
    Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';

type CommandKey =
    | 'gjor_rede'
    | 'forklar'
    | 'analyser'
    | 'drofte'
    | 'reflekter'
    | 'sammenlign'
    | 'eksempler'
    | 'vurder';

interface CommandStyle {
    label: string;
    definition: string;
    example: string;
    bg: string;
    border: string;
    text: string;
    chipBg: string;
}

const COMMAND_STYLES: Record<CommandKey, CommandStyle> = {
    gjor_rede: {
        label: 'Gjør rede for',
        definition:
            'Beskriv tydelig hva noe er, så leseren forstår det. Du skal forklare innholdet, ikke mene noe om det selv.',
        example: 'F.eks. «Gjør rede for hva en metafor er» - du forklarer hva en metafor er og gir et eksempel.',
        bg: 'bg-emerald-100',
        border: 'border-emerald-300',
        text: 'text-emerald-800',
        chipBg: 'bg-emerald-500',
    },
    forklar: {
        label: 'Forklar',
        definition: 'Gjør tydelig hva noe betyr eller hvorfor det skjer. Vis sammenhengene bak.',
        example: 'F.eks. «Forklar hvorfor synsvinkelen er viktig» - du viser hva synsvinkelen gjør med leseopplevelsen.',
        bg: 'bg-teal-100',
        border: 'border-teal-300',
        text: 'text-teal-800',
        chipBg: 'bg-teal-500',
    },
    analyser: {
        label: 'Analyser',
        definition:
            'Bryt teksten ned i deler. Se på hvordan virkemidlene fungerer og hva de gjør med teksten - ikke bare hva som skjer.',
        example: 'F.eks. «Analyser bildespråket» - du peker på konkrete bilder og forklarer hvilken effekt de har.',
        bg: 'bg-violet-100',
        border: 'border-violet-300',
        text: 'text-violet-800',
        chipBg: 'bg-violet-500',
    },
    drofte: {
        label: 'Drøft',
        definition:
            'Vei argumenter for og mot. Vis at saken har flere sider, og konkluder med et standpunkt du kan begrunne.',
        example: 'F.eks. «Drøft påstanden» - finn 2-3 argumenter for, 2-3 mot, og ta et tydelig standpunkt til slutt.',
        bg: 'bg-orange-100',
        border: 'border-orange-300',
        text: 'text-orange-800',
        chipBg: 'bg-orange-500',
    },
    reflekter: {
        label: 'Reflekter',
        definition:
            'Tenk gjennom temaet i ro. Du kan koble til egne erfaringer og verdier, og det er greit å være i tvil.',
        example:
            'F.eks. «Reflekter over hva som er rettferdig» - du tenker høyt på papiret og kan stille spørsmål før du svarer.',
        bg: 'bg-sky-100',
        border: 'border-sky-300',
        text: 'text-sky-800',
        chipBg: 'bg-sky-500',
    },
    sammenlign: {
        label: 'Sammenlign',
        definition:
            'Vis både likheter og forskjeller mellom to eller flere ting. Skriv om dem parallelt, ikke ett om gangen.',
        example: 'F.eks. «Sammenlign de to diktene» - pek på hva de har felles og hvor de skiller seg.',
        bg: 'bg-indigo-100',
        border: 'border-indigo-300',
        text: 'text-indigo-800',
        chipBg: 'bg-indigo-500',
    },
    eksempler: {
        label: 'Bruk eksempler',
        definition:
            'Hent konkrete eksempler fra en navngitt tekst, et vedlegg eller en kilde. Generelle påstander teller ikke.',
        example: 'F.eks. «Bruk eksempler fra vedlegg 1» - du siterer eller henviser konkret til vedlegg 1.',
        bg: 'bg-amber-100',
        border: 'border-amber-300',
        text: 'text-amber-800',
        chipBg: 'bg-amber-500',
    },
    vurder: {
        label: 'Vurder',
        definition: 'Bedøm verdi eller kvalitet. Si hva du mener, men begrunn med kriterier - ikke bare smak.',
        example: 'F.eks. «Vurder argumentet» - du sier om det er sterkt eller svakt, og forklarer hvorfor.',
        bg: 'bg-rose-100',
        border: 'border-rose-300',
        text: 'text-rose-800',
        chipBg: 'bg-rose-500',
    },
};

interface TolkePart {
    id: string;
    phrase: string;
    commandWord: CommandKey;
    focus: string;
    checklist: string[];
    sampleOpening?: string;
    commonMistake?: string;
}

interface TolkeOppgave {
    id: string;
    label: string;
    source?: string;
    taskText: string;
    parts: TolkePart[];
}

interface OppgaveTolkerProps {
    title?: string;
    tasks: TolkeOppgave[];
}

type Phase = 'count' | 'classify' | 'reveal';

export const OppgaveTolker: React.FC<OppgaveTolkerProps> = ({ title = 'Tolke oppgaven', tasks }) => {
    const [taskIndex, setTaskIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>('count');
    const [countGuess, setCountGuess] = useState<number | null>(null);
    const [countAttempts, setCountAttempts] = useState(0);
    const [shake, setShake] = useState(false);
    const [classifications, setClassifications] = useState<Record<string, CommandKey>>({});
    const [classifyChecked, setClassifyChecked] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [compassOpen, setCompassOpen] = useState(false);

    const task = tasks[taskIndex];
    const correctCount = task?.parts.length ?? 0;

    const segments = useMemo(() => {
        if (!task) return [] as Array<{ text: string; part?: TolkePart; partIndex?: number }>;
        const positions = task.parts
            .map((part, idx) => ({ part, idx, start: task.taskText.indexOf(part.phrase) }))
            .filter((p) => p.start >= 0)
            .sort((a, b) => a.start - b.start);

        const result: Array<{ text: string; part?: TolkePart; partIndex?: number }> = [];
        let cursor = 0;
        positions.forEach(({ part, idx, start }) => {
            if (start > cursor) {
                result.push({ text: task.taskText.slice(cursor, start) });
            }
            result.push({ text: part.phrase, part, partIndex: idx });
            cursor = start + part.phrase.length;
        });
        if (cursor < task.taskText.length) {
            result.push({ text: task.taskText.slice(cursor) });
        }
        return result;
    }, [task]);

    if (!task) return null;

    const resetForTask = () => {
        setPhase('count');
        setCountGuess(null);
        setCountAttempts(0);
        setClassifications({});
        setClassifyChecked(false);
    };

    const goToNextTask = () => {
        if (taskIndex >= tasks.length - 1) {
            setCompleted(true);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            return;
        }
        setTaskIndex(taskIndex + 1);
        resetForTask();
    };

    const restart = () => {
        setTaskIndex(0);
        resetForTask();
        setCompleted(false);
    };

    const handleCountGuess = (n: number) => {
        if (countGuess === correctCount) return;
        setCountGuess(n);
        if (n !== correctCount) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setCountAttempts((prev) => prev + 1);
        }
    };

    const handleClassify = (partId: string, cmd: CommandKey) => {
        if (classifyChecked) return;
        setClassifications((prev) => ({ ...prev, [partId]: cmd }));
    };

    const checkClassifications = () => {
        setClassifyChecked(true);
        const allCorrect = task.parts.every((p) => classifications[p.id] === p.commandWord);
        if (allCorrect) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    };

    const allClassified = task.parts.every((p) => classifications[p.id]);
    const countButtons = Array.from(new Set([1, 2, 3, 4, correctCount])).sort((a, b) => a - b);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden my-8 max-w-4xl mx-auto"
        >
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <ListChecks className="w-6 h-6 text-amber-300" />
                        <h3 className="font-bold text-lg">{title}</h3>
                    </div>
                    <button
                        onClick={() => setCompassOpen((v) => !v)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                        aria-expanded={compassOpen}
                    >
                        <Compass className="w-4 h-4" />
                        Hva betyr kommandoordene?
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${compassOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    {tasks.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all ${
                                completed || i < taskIndex
                                    ? 'bg-emerald-400 w-8'
                                    : i === taskIndex
                                      ? 'bg-amber-300 w-12'
                                      : 'bg-slate-600 w-6'
                            }`}
                        />
                    ))}
                    <span className="text-xs text-slate-300 ml-2">
                        {completed ? 'Ferdig!' : `Oppgave ${taskIndex + 1} av ${tasks.length}`}
                    </span>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {compassOpen && (
                    <motion.div
                        key="compass"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-b border-slate-200 bg-slate-50"
                    >
                        <div className="p-5">
                            <p className="text-sm text-slate-600 mb-4">
                                Kommandoordene styrer <em>hva</em> du skal gjøre i svaret. Det er den viktigste forskjellen
                                mellom å svare på oppgaven og å bomme på den.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {(Object.keys(COMMAND_STYLES) as CommandKey[]).map((key) => {
                                    const style = COMMAND_STYLES[key];
                                    return (
                                        <div
                                            key={key}
                                            className={`rounded-lg border ${style.border} ${style.bg} p-3`}
                                        >
                                            <div
                                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white ${style.chipBg} mb-2`}
                                            >
                                                {style.label}
                                            </div>
                                            <p className={`text-sm ${style.text} mb-1`}>{style.definition}</p>
                                            <p className="text-xs text-slate-600 italic">{style.example}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {completed ? (
                <div className="p-8 text-center">
                    <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h4 className="text-xl font-bold text-slate-800 mb-2">Du har tolket alle oppgavene</h4>
                    <p className="text-slate-600 mb-6 max-w-lg mx-auto">
                        Husk dette på eksamensdagen: les hver oppgave to ganger og strek under kommandoordene <em>før</em> du
                        begynner å skrive. Da svarer du på alt.
                    </p>
                    <button
                        onClick={restart}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Start på nytt
                    </button>
                </div>
            ) : (
                <>
                    <div className="p-6 border-b border-slate-100">
                        <div className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">
                            {task.label}
                            {task.source && ` · ${task.source}`}
                        </div>
                        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-5 shadow-inner">
                            <div className="text-xs text-amber-700 font-bold mb-2 uppercase tracking-wide">Oppgave</div>
                            <p className="text-slate-800 leading-relaxed font-serif text-lg">
                                {phase === 'count'
                                    ? task.taskText
                                    : segments.map((seg, i) => {
                                          if (!seg.part) return <span key={i}>{seg.text}</span>;
                                          const userCmd = classifications[seg.part.id];
                                          const showCmd = classifyChecked || phase === 'reveal' ? seg.part.commandWord : userCmd;
                                          const style = showCmd ? COMMAND_STYLES[showCmd] : null;
                                          if (!style) {
                                              return (
                                                  <span
                                                      key={i}
                                                      className="px-1 py-0.5 rounded font-semibold bg-slate-100 text-slate-700 border-b-2 border-slate-300"
                                                  >
                                                      <sup className="text-xs mr-1 opacity-70">
                                                          {(seg.partIndex ?? 0) + 1}
                                                      </sup>
                                                      {seg.text}
                                                  </span>
                                              );
                                          }
                                          return (
                                              <span
                                                  key={i}
                                                  className={`px-1 py-0.5 rounded font-semibold ${style.bg} ${style.text} border-b-2 ${style.border}`}
                                              >
                                                  <sup className="text-xs mr-1 opacity-70">
                                                      {(seg.partIndex ?? 0) + 1}
                                                  </sup>
                                                  {seg.text}
                                              </span>
                                          );
                                      })}
                            </p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {phase === 'count' && (
                            <motion.div
                                key="count"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-6"
                            >
                                <div className="mb-4">
                                    <h4 className="font-bold text-slate-800 mb-1">Steg 1: Tell deloppgavene</h4>
                                    <p className="text-slate-600 text-sm">
                                        Les oppgaven nøye. Hvor mange forskjellige ting blir du bedt om å gjøre?
                                    </p>
                                </div>
                                <motion.div
                                    animate={shake ? { x: [-10, 10, -8, 8, 0] } : {}}
                                    transition={{ duration: 0.4 }}
                                    className="flex flex-wrap gap-3"
                                >
                                    {countButtons.map((n) => {
                                        const isPicked = countGuess === n;
                                        const isCorrect = n === correctCount;
                                        const showAsWrong = isPicked && !isCorrect;
                                        const showAsRight =
                                            (isPicked && isCorrect) ||
                                            (countAttempts >= 2 && isCorrect && countGuess !== null);
                                        return (
                                            <motion.button
                                                key={n}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleCountGuess(n)}
                                                disabled={countGuess === correctCount}
                                                className={`w-16 h-16 rounded-xl text-2xl font-bold border-2 transition-all ${
                                                    showAsRight
                                                        ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
                                                        : showAsWrong
                                                          ? 'bg-rose-100 border-rose-300 text-rose-600'
                                                          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-500 hover:shadow-md'
                                                }`}
                                            >
                                                {n}
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>
                                {countGuess !== null && countGuess !== correctCount && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900"
                                    >
                                        {countAttempts >= 2 ? (
                                            <>
                                                Riktig antall er <strong>{correctCount}</strong>. Se etter små bindeord som «og»,
                                                «samt» eller «i tillegg» - hvert ledd er en egen jobb.
                                            </>
                                        ) : (
                                            <>
                                                Ikke helt. Se etter små bindeord som «og», «samt», «i tillegg» - hvert ledd er en
                                                egen jobb. Prøv igjen.
                                            </>
                                        )}
                                    </motion.div>
                                )}
                                {countGuess === correctCount && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg"
                                    >
                                        <div className="text-sm text-emerald-900 flex items-center gap-2">
                                            <Check className="w-5 h-5 text-emerald-600" />
                                            Riktig - {correctCount} deloppgave{correctCount > 1 ? 'r' : ''}. La oss tolke hver av
                                            dem.
                                        </div>
                                        <button
                                            onClick={() => setPhase('classify')}
                                            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 inline-flex items-center gap-2 shrink-0 self-start sm:self-auto"
                                        >
                                            Fortsett <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {phase === 'classify' && (
                            <motion.div
                                key="classify"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-6"
                            >
                                <div className="mb-4">
                                    <h4 className="font-bold text-slate-800 mb-1">Steg 2: Velg riktig kommandoord</h4>
                                    <p className="text-slate-600 text-sm">
                                        Hvilket kommandoord styrer hva du skal gjøre i hver deloppgave?
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {task.parts.map((part, idx) => {
                                        const userCmd = classifications[part.id];
                                        const isCorrect = userCmd === part.commandWord;
                                        return (
                                            <div key={part.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <span className="shrink-0 w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center">
                                                        {idx + 1}
                                                    </span>
                                                    <p className="italic text-slate-700">«{part.phrase}»</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(Object.keys(COMMAND_STYLES) as CommandKey[]).map((key) => {
                                                        const style = COMMAND_STYLES[key];
                                                        const isPicked = userCmd === key;
                                                        const isAnswer = part.commandWord === key;
                                                        let cls =
                                                            'px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ';
                                                        if (classifyChecked) {
                                                            if (isAnswer) {
                                                                cls += `${style.bg} ${style.text} border-emerald-400 ring-2 ring-emerald-300`;
                                                            } else if (isPicked) {
                                                                cls +=
                                                                    'bg-rose-100 text-rose-700 border-rose-300 line-through opacity-70';
                                                            } else {
                                                                cls += 'bg-white text-slate-400 border-slate-200 opacity-60';
                                                            }
                                                        } else {
                                                            cls += isPicked
                                                                ? `${style.bg} ${style.text} ${style.border} ring-2 ring-offset-1 ring-slate-400`
                                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400';
                                                        }
                                                        return (
                                                            <motion.button
                                                                key={key}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleClassify(part.id, key)}
                                                                disabled={classifyChecked}
                                                                className={cls}
                                                            >
                                                                {style.label}
                                                            </motion.button>
                                                        );
                                                    })}
                                                </div>
                                                {!classifyChecked && userCmd && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className={`mt-3 rounded-lg p-3 text-sm border ${COMMAND_STYLES[userCmd].border} ${COMMAND_STYLES[userCmd].bg} ${COMMAND_STYLES[userCmd].text}`}
                                                    >
                                                        <strong>«{COMMAND_STYLES[userCmd].label}» betyr:</strong>{' '}
                                                        {COMMAND_STYLES[userCmd].definition}
                                                    </motion.div>
                                                )}
                                                {classifyChecked && (
                                                    <div className="mt-3 space-y-2">
                                                        <div
                                                            className={`text-sm flex items-center gap-2 ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}
                                                        >
                                                            {isCorrect ? (
                                                                <Check className="w-4 h-4" />
                                                            ) : (
                                                                <X className="w-4 h-4" />
                                                            )}
                                                            {isCorrect ? (
                                                                'Riktig!'
                                                            ) : (
                                                                <>
                                                                    Riktig svar er{' '}
                                                                    <strong>
                                                                        {COMMAND_STYLES[part.commandWord].label}
                                                                    </strong>
                                                                    .
                                                                </>
                                                            )}
                                                        </div>
                                                        <div
                                                            className={`rounded-lg p-3 text-sm border ${COMMAND_STYLES[part.commandWord].border} ${COMMAND_STYLES[part.commandWord].bg} ${COMMAND_STYLES[part.commandWord].text}`}
                                                        >
                                                            <strong>
                                                                «{COMMAND_STYLES[part.commandWord].label}» betyr:
                                                            </strong>{' '}
                                                            {COMMAND_STYLES[part.commandWord].definition}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-end mt-5">
                                    {!classifyChecked ? (
                                        <button
                                            onClick={checkClassifications}
                                            disabled={!allClassified}
                                            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                        >
                                            <Check className="w-4 h-4" /> Sjekk svar
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setPhase('reveal')}
                                            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 inline-flex items-center gap-2"
                                        >
                                            Se sjekklisten <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {phase === 'reveal' && (
                            <motion.div
                                key="reveal"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-6"
                            >
                                <div className="mb-4">
                                    <h4 className="font-bold text-slate-800 mb-1">Steg 3: Hva sensor leter etter</h4>
                                    <p className="text-slate-600 text-sm">
                                        For hver deloppgave: dette er hva sensor venter å se i besvarelsen din.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {task.parts.map((part, idx) => {
                                        const style = COMMAND_STYLES[part.commandWord];
                                        return (
                                            <div
                                                key={part.id}
                                                className={`p-5 rounded-xl bg-white shadow-sm border border-slate-200 border-l-4 ${style.border}`}
                                            >
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <span className="text-sm font-bold text-slate-500">
                                                        Deloppgave {idx + 1}
                                                    </span>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${style.chipBg}`}
                                                    >
                                                        {style.label}
                                                    </span>
                                                </div>
                                                <p className="italic text-slate-600 text-sm mb-3">«{part.phrase}»</p>
                                                <div
                                                    className={`rounded-lg p-3 mb-3 text-sm border ${style.border} ${style.bg}`}
                                                >
                                                    <div className={`font-bold mb-1 ${style.text}`}>
                                                        Hva «{style.label}» betyr:
                                                    </div>
                                                    <p className={`${style.text}`}>{style.definition}</p>
                                                </div>
                                                <div className="bg-slate-50 rounded-lg p-3 mb-3 text-sm">
                                                    <span className="font-bold text-slate-700">Fokus:</span>{' '}
                                                    <span className="text-slate-700">{part.focus}</span>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="text-sm font-bold text-slate-700 mb-2">
                                                        Sensor venter at du:
                                                    </div>
                                                    <ul className="space-y-1.5">
                                                        {part.checklist.map((item, i) => (
                                                            <li
                                                                key={i}
                                                                className="flex items-start gap-2 text-sm text-slate-700"
                                                            >
                                                                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                {part.sampleOpening && (
                                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3 text-sm">
                                                        <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                                                            <Lightbulb className="w-4 h-4" />
                                                            Slik kan du begynne svaret:
                                                        </div>
                                                        <p className="italic text-emerald-900 font-serif">
                                                            «{part.sampleOpening}»
                                                        </p>
                                                    </div>
                                                )}
                                                {part.commonMistake && (
                                                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm">
                                                        <div className="font-bold text-rose-800 mb-1 flex items-center gap-1.5">
                                                            <AlertTriangle className="w-4 h-4" />
                                                            Vanlig fallgruve:
                                                        </div>
                                                        <p className="text-rose-900">{part.commonMistake}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-end mt-5">
                                    <button
                                        onClick={goToNextTask}
                                        className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 inline-flex items-center gap-2"
                                    >
                                        {taskIndex >= tasks.length - 1 ? 'Fullfør' : 'Neste oppgave'}{' '}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </motion.div>
    );
};
