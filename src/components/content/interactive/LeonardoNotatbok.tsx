import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Heart,
    Plane,
    Swords,
    Palette,
    Droplets,
    RotateCcw,
    Lightbulb,
} from 'lucide-react';

interface Sketch {
    id: string;
    name: string;
    description: string;
    answer: 'anatomi' | 'flymaskin' | 'krigsmaskin' | 'kunst' | 'hydraulikk';
    explanation: string;
}

interface LeonardoNotatbokProps {
    title?: string;
    intro?: string;
    sketches?: Sketch[];
}

const DEFAULT_SKETCHES: Sketch[] = [
    {
        id: 'hjertet',
        name: 'Hjertet med klaffer',
        description:
            'En detaljert tegning av menneskehjertet med blodårer og hjerteklaffer. Leonardo dissekerte over 30 lik for å forstå hvordan vi er bygd.',
        answer: 'anatomi',
        explanation:
            'Leonardo studerte anatomi for å male mennesker riktig. Han forsto hvordan hjertet pumper blod, 150 år før William Harvey beskrev det i en bok.',
    },
    {
        id: 'ornitopter',
        name: 'Mannen med vinger',
        description:
            'En maskin med store fuglevinger som flagrer ved hjelp av pedaler og tau. Leonardo drømte om at mennesker skulle fly.',
        answer: 'flymaskin',
        explanation:
            'Leonardo fylte sider med flygemaskiner etter å ha studert fugler. Mange virket ikke, men ideen om en luftskrue (helikopter) ble realisert 400 år senere.',
    },
    {
        id: 'kanon',
        name: 'Mangeløpet kanon',
        description:
            'En roterende kanon med flere løp som kunne skyte mens andre avkjølte seg. Leonardo arbeidet som militæringeniør for hertugen av Milano.',
        answer: 'krigsmaskin',
        explanation:
            'Renessansens kunstnere måtte tjene penger. Leonardo skrev til hertugen at han kunne lage våpen — og fikk jobben. Det var sjeldent kunst og krig ble laget av samme hånd.',
    },
    {
        id: 'mona-lisa',
        name: 'Smilende kvinne',
        description:
            'Portrettet av en kvinne med et gåtefullt smil. Leonardo brukte en teknikk kalt sfumato — myke overganger uten skarpe linjer.',
        answer: 'kunst',
        explanation:
            'Mona Lisa er kanskje verdens mest berømte maleri. Leonardo brukte sin kunnskap om anatomi og lys for å fange et levende uttrykk i ansiktet.',
    },
    {
        id: 'sluse',
        name: 'Vannsluse for kanaler',
        description:
            'En sluseport som hever og senker vannet i kanaler, så båter kan kjøre over bakker. Leonardo planla å snu elven Arno.',
        answer: 'hydraulikk',
        explanation:
            'Leonardo studerte hvordan vann beveger seg. Han designet kanalsystemer for Milano som ble brukt i 400 år. Mange av prinsippene er fortsatt i bruk.',
    },
];

const CATEGORIES = {
    anatomi: {
        label: 'Anatomi',
        sublabel: 'Kroppen innenfra',
        icon: Heart,
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-700',
        ring: 'ring-rose-400',
    },
    flymaskin: {
        label: 'Flymaskin',
        sublabel: 'Drømmen om å fly',
        icon: Plane,
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        text: 'text-sky-700',
        ring: 'ring-sky-400',
    },
    krigsmaskin: {
        label: 'Krigsmaskin',
        sublabel: 'Ingeniør for hæren',
        icon: Swords,
        bg: 'bg-slate-100',
        border: 'border-slate-300',
        text: 'text-slate-700',
        ring: 'ring-slate-400',
    },
    kunst: {
        label: 'Kunst',
        sublabel: 'Maleri og portrett',
        icon: Palette,
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        ring: 'ring-amber-400',
    },
    hydraulikk: {
        label: 'Hydraulikk',
        sublabel: 'Vann og kanaler',
        icon: Droplets,
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        text: 'text-teal-700',
        ring: 'ring-teal-400',
    },
} as const;

type CategoryKey = keyof typeof CATEGORIES;
type Phase = 'idle' | 'wrong' | 'correct' | 'complete';

export function LeonardoNotatbok({
    title = 'Leonardos notatbok',
    intro = 'Hver side viser en av Leonardos skisser. Hvilket fagområde hører den til?',
    sketches = DEFAULT_SKETCHES,
}: LeonardoNotatbokProps) {
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState<Phase>('idle');
    const [score, setScore] = useState(0);
    const [lastChoice, setLastChoice] = useState<CategoryKey | null>(null);

    const current = sketches[idx];
    const isComplete = phase === 'complete';

    const handleChoice = (choice: CategoryKey) => {
        if (phase === 'wrong' || phase === 'correct' || isComplete) return;
        setLastChoice(choice);
        if (choice === current.answer) {
            setScore((s) => s + 1);
            setPhase('correct');
        } else {
            setPhase('wrong');
        }
    };

    const handleNext = () => {
        if (idx + 1 >= sketches.length) {
            setPhase('complete');
        } else {
            setIdx((i) => i + 1);
            setPhase('idle');
            setLastChoice(null);
        }
    };

    const handleReset = () => {
        setIdx(0);
        setPhase('idle');
        setScore(0);
        setLastChoice(null);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-white">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{intro}</p>
                </div>
                <div className="ml-auto text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                    {isComplete ? `${score}/${sketches.length}` : `Side ${idx + 1}/${sketches.length}`}
                </div>
            </div>

            <div className="p-6">
                {!isComplete ? (
                    <>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current.id}
                                initial={{ opacity: 0, rotate: -1, y: 12 }}
                                animate={{
                                    opacity: 1,
                                    rotate: 0,
                                    y: 0,
                                    x: phase === 'wrong' ? [0, -8, 8, -6, 6, 0] : 0,
                                }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.35 }}
                                className="bg-amber-50/60 border border-amber-200 rounded-xl px-5 py-6 mb-5 relative"
                                style={{
                                    backgroundImage:
                                        'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(180, 130, 50, 0.08) 28px, rgba(180, 130, 50, 0.08) 29px)',
                                }}
                            >
                                <div className="text-xs uppercase tracking-wider text-amber-700 font-medium mb-2">
                                    Skisse fra notatboken
                                </div>
                                <h4 className="text-lg font-semibold text-slate-800 mb-2">
                                    {current.name}
                                </h4>
                                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                                    {current.description}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                            {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
                                const c = CATEGORIES[key];
                                const Icon = c.icon;
                                const wasChosen = lastChoice === key;
                                const isAnswer = current.answer === key;
                                const showCorrect = phase === 'correct' && wasChosen;
                                const showWrong = phase === 'wrong' && wasChosen;
                                const revealAnswer = phase === 'wrong' && isAnswer;
                                const disabled = phase === 'correct' || phase === 'wrong';

                                return (
                                    <motion.button
                                        key={key}
                                        onClick={() => handleChoice(key)}
                                        disabled={disabled}
                                        whileHover={disabled ? {} : { y: -3 }}
                                        whileTap={disabled ? {} : { scale: 0.97 }}
                                        animate={
                                            showCorrect
                                                ? { scale: [1, 1.08, 1] }
                                                : revealAnswer
                                                  ? { scale: [1, 1.04, 1] }
                                                  : {}
                                        }
                                        transition={{ duration: 0.45 }}
                                        className={`relative flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl border-2 transition-colors text-center ${
                                            showCorrect || revealAnswer
                                                ? `${c.bg} ${c.border} ring-2 ${c.ring} shadow-md`
                                                : showWrong
                                                  ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-300'
                                                  : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-md'
                                        } ${disabled && !wasChosen && !isAnswer ? 'opacity-50' : ''}`}
                                    >
                                        <Icon className={`w-6 h-6 ${c.text}`} />
                                        <div>
                                            <div className={`font-semibold text-xs ${c.text}`}>
                                                {c.label}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                {c.sublabel}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-6"
                    >
                        <motion.div
                            animate={{
                                rotate: [0, -10, 10, -6, 6, 0],
                                scale: [1, 1.15, 1],
                            }}
                            transition={{ duration: 1.2 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 via-rose-100 to-sky-100 mb-4"
                        >
                            <Lightbulb className="w-8 h-8 text-amber-600" />
                        </motion.div>
                        <h4 className="text-xl font-semibold text-slate-800 mb-2">
                            Du har sett Leonardo som han så seg selv.
                        </h4>
                        <p className="text-slate-600 mb-3">
                            Du fikk {score} av {sketches.length} riktig.
                        </p>
                        <p className="text-sm text-slate-600 italic max-w-lg mx-auto leading-relaxed">
                            Leonardo skilte ikke mellom fagene. For ham var anatomi, kunst,
                            ingeniørkunst og hydraulikk én eneste verden å forstå. Det er kjernen i
                            renessansens menneskesyn: ett menneske kan lære alt — hvis det tør å
                            se nøye etter.
                        </p>
                    </motion.div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {(phase === 'correct' || phase === 'wrong') && (
                    <motion.div
                        key={`fb-${idx}-${phase}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`mx-6 mb-4 px-4 py-3 rounded-lg border text-sm ${
                            phase === 'correct'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                    >
                        <strong className="block mb-1">
                            {phase === 'correct'
                                ? 'Riktig!'
                                : `Riktig svar: ${CATEGORIES[current.answer].label}`}
                        </strong>
                        <span>{current.explanation}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                {!isComplete && (phase === 'correct' || phase === 'wrong') ? (
                    <button
                        onClick={handleNext}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                    >
                        {idx + 1 >= sketches.length ? 'Se hele bildet' : 'Bla videre'}
                    </button>
                ) : (
                    <span className="text-xs text-slate-400">
                        {isComplete ? 'Du er ferdig.' : 'Velg fagområdet som passer.'}
                    </span>
                )}
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors flex items-center gap-1"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
