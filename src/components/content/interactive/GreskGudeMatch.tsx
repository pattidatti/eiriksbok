import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Check, X, Trophy } from 'lucide-react';

// Lyspære-øyeblikk: Etter denne interaksjonen skal eleven forstå at hver gresk
// gud sto for sin egen del av verden, og at grekerne brukte gudene til å
// forklare ting de ellers ikke kunne forklare.
//
// Eleven spiller en greker: for hver hendelse i naturen eller livet velger de
// hvilken gud som står bak. Riktig valg tenner guden i pantheonet øverst.

interface God {
    id: string;
    name: string;
    symbol: string;
    domain: string;
    color: string;
}

interface Round {
    id: string;
    scene: string;
    correctId: string;
    optionIds: string[];
    why: string;
}

interface GreskGudeMatchProps {
    title?: string;
    gods?: God[];
    rounds?: Round[];
}

const DEFAULT_GODS: God[] = [
    { id: 'zevs', name: 'Zevs', symbol: '⚡', domain: 'Himmel og torden', color: '#d97706' },
    { id: 'poseidon', name: 'Poseidon', symbol: '🌊', domain: 'Hav og jordskjelv', color: '#2563eb' },
    { id: 'hades', name: 'Hades', symbol: '💀', domain: 'Underverdenen og de døde', color: '#7c3aed' },
    { id: 'demeter', name: 'Demeter', symbol: '🌾', domain: 'Avling og årstider', color: '#16a34a' },
    { id: 'afrodite', name: 'Afrodite', symbol: '💗', domain: 'Kjærlighet og skjønnhet', color: '#db2777' },
    { id: 'athene', name: 'Athene', symbol: '🦉', domain: 'Visdom og klok krig', color: '#0d9488' },
    { id: 'ares', name: 'Ares', symbol: '⚔️', domain: 'Vill og blodig krig', color: '#b91c1c' },
    { id: 'apollon', name: 'Apollon', symbol: '☀️', domain: 'Sol, musikk og spådom', color: '#ea580c' },
];

const DEFAULT_ROUNDS: Round[] = [
    {
        id: 'r1',
        scene: 'Et lyn flerrer himmelen, og tordenen ruller over fjellet.',
        correctId: 'zevs',
        optionIds: ['zevs', 'poseidon', 'demeter'],
        why: 'Zevs var kongen blant gudene og kastet lynet sitt fra Olympen. Torden betydde at han var nær.',
    },
    {
        id: 'r2',
        scene: 'Bakken rister i et jordskjelv, og en storm pisker havet til skum.',
        correctId: 'poseidon',
        optionIds: ['afrodite', 'poseidon', 'hades'],
        why: 'Poseidon rådde over havet. Grekerne sa at han slo med treforken sin og fikk jorden til å skjelve.',
    },
    {
        id: 'r3',
        scene: 'Kornet modnes, og åkrene blir gylne i den varme sommeren.',
        correctId: 'demeter',
        optionIds: ['ares', 'demeter', 'apollon'],
        why: 'Demeter var gudinnen for avling og årstider. Når hun var glad, vokste kornet og bøndene fikk mat.',
    },
    {
        id: 'r4',
        scene: 'To unge mennesker møtes på torget og forelsker seg ved første blikk.',
        correctId: 'afrodite',
        optionIds: ['afrodite', 'athene', 'hades'],
        why: 'Afrodite var gudinnen for kjærlighet og skjønnhet. Grekerne mente hun tente forelskelse i hjertene.',
    },
    {
        id: 'r5',
        scene: 'Athen trenger en lur plan for å vinne en krig med list, ikke bare med makt.',
        correctId: 'athene',
        optionIds: ['ares', 'athene', 'poseidon'],
        why: 'Athene sto for visdom og klok krigføring. Byen Athen er oppkalt etter henne, og hun hjalp helter som tenkte smart.',
    },
];

type Phase = 'play' | 'done';

export function GreskGudeMatch({
    title = 'Hvem står bak?',
    gods = DEFAULT_GODS,
    rounds = DEFAULT_ROUNDS,
}: GreskGudeMatchProps) {
    const godById = (id: string) => gods.find((g) => g.id === id);

    const [index, setIndex] = useState(0);
    const [picked, setPicked] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [found, setFound] = useState<string[]>([]);
    const [phase, setPhase] = useState<Phase>('play');

    const round = rounds[index];
    const correct = godById(round.correctId)!;
    const wasCorrect = picked === round.correctId;
    const isLast = index === rounds.length - 1;

    const handlePick = (id: string) => {
        if (picked) return;
        setPicked(id);
        if (id === round.correctId) {
            setScore((s) => s + 1);
            setFound((f) => (f.includes(id) ? f : [...f, id]));
        }
    };

    const handleNext = () => {
        if (isLast) {
            setPhase('done');
            return;
        }
        setIndex((i) => i + 1);
        setPicked(null);
    };

    const handleReset = () => {
        setIndex(0);
        setPicked(null);
        setScore(0);
        setFound([]);
        setPhase('play');
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Du er en greker. Velg hvilken gud som står bak det som skjer.
                    </p>
                </div>
            </div>

            {/* Pantheon-rad: gudene du har funnet lyser opp */}
            <div className="px-6 pt-4 flex flex-wrap gap-2">
                {gods
                    .filter((g) => rounds.some((r) => r.correctId === g.id))
                    .map((g) => {
                        const on = found.includes(g.id);
                        return (
                            <motion.div
                                key={g.id}
                                animate={{ scale: on ? 1 : 0.95, opacity: on ? 1 : 0.45 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                                className="flex items-center gap-1.5 rounded-full border px-3 py-1"
                                style={{
                                    borderColor: on ? g.color : '#e2e8f0',
                                    backgroundColor: on ? `${g.color}14` : '#f8fafc',
                                }}
                            >
                                <span className="text-base leading-none">{g.symbol}</span>
                                <span
                                    className="text-xs font-semibold"
                                    style={{ color: on ? g.color : '#94a3b8' }}
                                >
                                    {g.name}
                                </span>
                            </motion.div>
                        );
                    })}
            </div>

            {phase === 'play' ? (
                <div className="p-6">
                    {/* Scenekort */}
                    <div className="text-xs font-medium text-slate-400 mb-2">
                        Hendelse {index + 1} av {rounds.length}
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-200 px-5 py-4 text-slate-800 text-[15px] leading-relaxed">
                        {round.scene}
                    </div>

                    {/* Valg */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {round.optionIds.map((id) => {
                            const g = godById(id)!;
                            const isPicked = picked === id;
                            const isCorrectChoice = id === round.correctId;
                            const showState = picked !== null;
                            let ring = 'border-slate-200 hover:border-indigo-300 hover:shadow-md';
                            if (showState && isCorrectChoice)
                                ring = 'border-emerald-300 bg-emerald-50';
                            else if (showState && isPicked && !isCorrectChoice)
                                ring = 'border-rose-300 bg-rose-50';
                            else if (showState) ring = 'border-slate-200 opacity-60';
                            return (
                                <button
                                    key={id}
                                    onClick={() => handlePick(id)}
                                    disabled={picked !== null}
                                    className={`relative rounded-xl border bg-white px-4 py-4 text-left transition-all ${ring}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl leading-none">{g.symbol}</span>
                                        <span className="font-semibold text-slate-800">
                                            {g.name}
                                        </span>
                                        {showState && isCorrectChoice && (
                                            <Check className="w-4 h-4 text-emerald-600 ml-auto" />
                                        )}
                                        {showState && isPicked && !isCorrectChoice && (
                                            <X className="w-4 h-4 text-rose-500 ml-auto" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{g.domain}</p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Feedback-sone */}
                    <AnimatePresence mode="wait">
                        {picked && (
                            <motion.div
                                key={`fb-${index}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`mt-4 px-4 py-3 rounded-lg text-sm border ${
                                    wasCorrect
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : 'bg-rose-50 border-rose-200 text-rose-800'
                                }`}
                            >
                                <span className="font-semibold">
                                    {wasCorrect ? 'Riktig! ' : `Det var ${correct.name}. `}
                                </span>
                                {round.why}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Kontrollrad */}
                    <div className="mt-5 flex items-center justify-between">
                        <button
                            onClick={handleNext}
                            disabled={!picked}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                        >
                            {isLast ? 'Se resultatet' : 'Neste hendelse'}
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" /> Start på nytt
                        </button>
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                    className="p-8 text-center"
                >
                    <motion.div
                        initial={{ rotate: -12, scale: 0.6 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4"
                    >
                        <Trophy className="w-8 h-8 text-amber-500" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-800">
                        Du tenker som en greker!
                    </h3>
                    <p className="text-slate-600 mt-2 max-w-md mx-auto">
                        Du traff {score} av {rounds.length}. Legg merke til mønsteret: hver gud eide
                        sin egen del av verden. Når noe skjedde, hadde grekerne alltid en gud som
                        forklarte hvorfor. Mytene var deres måte å forstå naturen og livet på.
                    </p>
                    <button
                        onClick={handleReset}
                        className="mt-6 inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-5 py-2 text-sm font-medium transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> Prøv igjen
                    </button>
                </motion.div>
            )}
        </div>
    );
}
