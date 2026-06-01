import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, CheckCircle2, XCircle, AlertCircle, RotateCcw, Sparkles } from 'lucide-react';

type Verdict = 'invalid' | 'mitigating' | 'valid';

interface DefenseCase {
    id: string;
    accused: string;
    year: number;
    setting: string;
    quote: string;
    answer: Verdict;
    principle: string;
    explanation: string;
}

const CASES: DefenseCase[] = [
    {
        id: 'goering',
        accused: 'Hermann Göring',
        year: 1946,
        setting: 'Nürnberg, hovedtiltalt',
        quote: 'Jeg adlød Føreren. En soldat som nekter ordre er ingen soldat.',
        answer: 'invalid',
        principle: 'Prinsipp IV: Ordre fra overordnet fritar ikke for ansvar',
        explanation:
            'Etter Nürnberg er du selv ansvarlig for valgene dine, også når en sjef sier "gjør det". Hvis ordren bryter folkeretten, har du plikt til å nekte.',
    },
    {
        id: 'eichmann',
        accused: 'Adolf Eichmann',
        year: 1961,
        setting: 'Jerusalem-prosessen',
        quote: 'Jeg organiserte bare transportene. Jeg drepte aldri noen selv.',
        answer: 'invalid',
        principle: 'Prinsipp VI: Forbrytelser mot menneskeheten er straffbart',
        explanation:
            'Å planlegge, organisere eller hjelpe et folkemord er like alvorlig som å trekke avtrekkeren. Skrivebordsmorderen er fortsatt morder.',
    },
    {
        id: 'doenitz',
        accused: 'Karl Dönitz',
        year: 1946,
        setting: 'Nürnberg, marineadmiral',
        quote: 'Jeg er statsoverhode etter Hitlers død. En statsleder kan ikke stilles for retten.',
        answer: 'invalid',
        principle: 'Prinsipp III: Statsoverhode-stilling skjermer ikke',
        explanation:
            'Etter Nürnberg er ingen over loven — heller ikke en president, konge eller general. Tittelen din er ikke et skjold.',
    },
    {
        id: 'menig-soldat',
        accused: 'Menig SS-soldat',
        year: 1946,
        setting: 'Vaktstyrke ved Auschwitz',
        quote: 'Hadde jeg nektet å skyte, ville jeg selv blitt henrettet. Jeg hadde ikke noe valg.',
        answer: 'mitigating',
        principle: 'Prinsipp IV: Reell tvang kan være formildende',
        explanation:
            'Trussel om egen død kan gjøre straffen mildere, men ikke frikjenne. Domstolene har funnet at SS-soldater som nektet faktisk ble omplassert — sjelden henrettet. "Jeg måtte" er sjelden helt sant.',
    },
    {
        id: 'speer',
        accused: 'Albert Speer',
        year: 1946,
        setting: 'Nürnberg, rustningsminister',
        quote: 'Jeg var bare ingeniør og bygde fabrikker. Politikken var Hitlers ansvar.',
        answer: 'invalid',
        principle: 'Prinsipp VII: Medvirkning er straffbart',
        explanation:
            'Den som leverer skinnene til toget vet hvor toget går. Speer brukte slavearbeidere i fabrikkene sine — det gjorde ham medskyldig, uansett hvor "teknisk" jobben hans var.',
    },
    {
        id: 'nektet',
        accused: 'Wehrmacht-offiser Anton Schmid',
        year: 1942,
        setting: 'Vilnius, ghettoen',
        quote: 'Jeg gjemte 250 jøder og hjalp dem å rømme. Jeg nektet ordren om å delta i drapene.',
        answer: 'valid',
        principle: 'Plikten til å nekte ulovlige ordre',
        explanation:
            'Schmid ble henrettet av nazistene for "forræderi", men er i dag hedret som helt. Han viste det Nürnberg sa høyt: du har lov — og plikt — til å si nei.',
    },
];

type Phase = 'choose' | 'feedback' | 'done';

const VERDICT_META: Record<Verdict, { label: string; icon: typeof CheckCircle2; iconClass: string }> = {
    invalid: { label: 'Ugyldig forsvar', icon: XCircle, iconClass: 'text-rose-500' },
    mitigating: { label: 'Formildende', icon: AlertCircle, iconClass: 'text-amber-500' },
    valid: { label: 'Gyldig forsvar', icon: CheckCircle2, iconClass: 'text-emerald-500' },
};

interface NurembergDefenseProps {
    title?: string;
}

export function NurembergDefense({ title = 'Du er dommer i Nürnberg' }: NurembergDefenseProps) {
    const [phase, setPhase] = useState<Phase>('choose');
    const [index, setIndex] = useState(0);
    const [picked, setPicked] = useState<Verdict | null>(null);
    const [answers, setAnswers] = useState<Verdict[]>([]);

    const current = CASES[index];
    const correct = useMemo(
        () => answers.filter((a, i) => a === CASES[i].answer).length,
        [answers]
    );

    const handlePick = (v: Verdict) => {
        if (phase !== 'choose') return;
        setPicked(v);
        setPhase('feedback');
    };

    const handleNext = () => {
        const updated = [...answers, picked as Verdict];
        setAnswers(updated);
        if (index + 1 >= CASES.length) {
            setPhase('done');
        } else {
            setIndex(index + 1);
            setPicked(null);
            setPhase('choose');
        }
    };

    const handleReset = () => {
        setPhase('choose');
        setIndex(0);
        setPicked(null);
        setAnswers([]);
    };

    const wasCorrect = picked === current?.answer;

    return (
        <div className="my-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-indigo-600 p-2 text-white">
                        <Gavel className="h-5 w-5" />
                    </span>
                    <div>
                        <h3 className="font-semibold text-slate-800">{title}</h3>
                        <p className="text-sm text-slate-500">
                            Hør forsvaret. Avgjør om det holder etter Nürnberg-prinsippene.
                        </p>
                    </div>
                </div>
                <div className="text-xs font-medium text-slate-500">
                    Sak {Math.min(index + 1, CASES.length)} / {CASES.length}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {phase !== 'done' ? (
                    <motion.div
                        key={`case-${index}-${phase}`}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.25 }}
                        className="p-6"
                    >
                        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-2 flex items-baseline justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-800">
                                    {current.accused}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {current.setting} · {current.year}
                                </p>
                            </div>
                            <p className="text-base italic leading-relaxed text-slate-700">
                                «{current.quote}»
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {(['invalid', 'mitigating', 'valid'] as Verdict[]).map((v) => {
                                const meta = VERDICT_META[v];
                                const Icon = meta.icon;
                                const isPicked = picked === v;
                                const isCorrectChoice = v === current.answer;
                                const showResult = phase === 'feedback';
                                const ring = showResult
                                    ? isCorrectChoice
                                        ? 'ring-2 ring-emerald-400'
                                        : isPicked
                                          ? 'ring-2 ring-rose-400'
                                          : 'opacity-50'
                                    : 'hover:bg-slate-100';
                                return (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => handlePick(v)}
                                        disabled={phase === 'feedback'}
                                        className={`flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition ${ring}`}
                                    >
                                        <Icon
                                            className={`h-4 w-4 ${meta.iconClass}`}
                                            aria-hidden="true"
                                        />
                                        {meta.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4 min-h-[7rem]">
                            <AnimatePresence mode="wait">
                                {phase === 'feedback' ? (
                                    <motion.div
                                        key="feedback"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`rounded-lg border p-4 text-sm ${
                                            wasCorrect
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                                : 'border-amber-200 bg-amber-50 text-amber-800'
                                        }`}
                                    >
                                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide">
                                            {wasCorrect ? 'Riktig dom' : 'Tribunalet er uenig'}
                                        </p>
                                        <p className="mb-2 font-semibold text-slate-800">
                                            {current.principle}
                                        </p>
                                        <p className="leading-relaxed text-slate-700">
                                            {current.explanation}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="prompt"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-500"
                                    >
                                        Velg en dom. Du får begrunnelsen etterpå.
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={phase !== 'feedback'}
                                className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                {index + 1 >= CASES.length ? 'Se dommen' : 'Neste sak'}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-600"
                            >
                                <RotateCcw className="h-4 w-4" /> Start på nytt
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                        className="p-6"
                    >
                        <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6">
                            <div className="mb-3 flex items-center gap-2 text-indigo-600">
                                <Sparkles className="h-5 w-5" />
                                <span className="text-xs font-semibold uppercase tracking-widest">
                                    Tribunalet er hevet
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-slate-800">
                                {correct} / {CASES.length} riktige dommer
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-slate-700">
                                Det viktigste Nürnberg etterlot oss: <strong>«Jeg fulgte ordre»
                                er ingen unnskyldning.</strong> Du er selv ansvarlig for det du
                                gjør — uansett hva sjefen, generalen eller presidenten ber deg om.
                                Når du hører noen forsvare seg med «jeg hadde ikke noe valg», husk
                                tribunalet i 1945.
                            </p>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="mt-5 flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                            >
                                <RotateCcw className="h-4 w-4" /> Prøv igjen
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
