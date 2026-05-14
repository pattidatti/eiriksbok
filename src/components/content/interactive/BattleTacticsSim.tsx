import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Anchor, Mountain, Sparkles, RotateCcw, Check, X } from 'lucide-react';

interface BattleChoice {
    id: string;
    label: string;
    explanation: string;
    correct: boolean;
}

interface Battle {
    id: string;
    name: string;
    year: string;
    icon: 'shield' | 'mountain' | 'anchor';
    setup: string;
    forces: string;
    question: string;
    choices: BattleChoice[];
    winningFactor: string;
}

interface BattleTacticsSimProps {
    title?: string;
    intro?: string;
    battles?: Battle[];
    synthesis?: string;
}

const DEFAULT_BATTLES: Battle[] = [
    {
        id: 'marathon',
        name: 'Marathon',
        year: '490 fvt',
        icon: 'shield',
        setup: 'Persiske styrker går i land på en smal slette nær Athen. Grekerne er færre, men har tunge skjold og lange spyd.',
        forces: 'Ca. 10 000 grekere mot 25 000 persere',
        question: 'Hva bør grekerne gjøre?',
        choices: [
            {
                id: 'a',
                label: 'Vent på persisk angrep og hold posisjonen',
                explanation: 'Å vente lar persisk kavaleri herje. Grekerne ville mistet initiativet.',
                correct: false,
            },
            {
                id: 'b',
                label: 'Angrip i tett falanks med flankene styrket',
                explanation: 'Riktig. Grekerne løp mot persiske buer, slo gjennom i en tett mur av skjold og spyd. Persisk overtall fikk aldri brette seg ut på den smale sletta.',
                correct: true,
            },
            {
                id: 'c',
                label: 'Trekk seg tilbake til Athen og forsvar byen',
                explanation: 'Da kunne perserne ha landsatt resten av styrken sin uten motstand.',
                correct: false,
            },
        ],
        winningFactor: 'Smal slette + tett falanks → persisk overtall får ikke plass.',
    },
    {
        id: 'thermopylae',
        name: 'Thermopylae',
        year: '480 fvt',
        icon: 'mountain',
        setup: 'En ny, langt større persisk hær marsjerer sørover. En spartansk styrke skal sinke dem ved et trangt fjellpass mellom fjell og hav.',
        forces: 'Ca. 7 000 grekere (inkludert 300 spartanere) mot over 100 000 persere',
        question: 'Hvor bør grekerne stille opp?',
        choices: [
            {
                id: 'a',
                label: 'På åpen mark utenfor passet',
                explanation: 'Da kunne perserne omringet dem på minutter med sitt enorme overtall.',
                correct: false,
            },
            {
                id: 'b',
                label: 'Spre seg utover hele området for å overraske',
                explanation: 'Spredte styrker hadde blitt slått ned én for én av kavaleri.',
                correct: false,
            },
            {
                id: 'c',
                label: 'Blokker det smaleste punktet i passet',
                explanation: 'Riktig. Ved Thermopylae var passet bare noen meter bredt. Persia kunne ikke sende inn mer enn noen få soldater om gangen, og spartansk trening avgjorde resten i to dager før forræderi åpnet en sti rundt.',
                correct: true,
            },
        ],
        winningFactor: 'Trangt pass nøytraliserer overtall — bare front-soldater kan kjempe.',
    },
    {
        id: 'salamis',
        name: 'Salamis',
        year: '480 fvt',
        icon: 'anchor',
        setup: 'Den persiske flåten er stor og bred. Den greske flåten er mindre, men består av raske triremer med ramme-baug.',
        forces: 'Ca. 370 greske skip mot 800 persiske',
        question: 'Hvor bør grekerne tvinge fram havslaget?',
        choices: [
            {
                id: 'a',
                label: 'Ute på åpent hav, der det er plass',
                explanation: 'På åpent hav får den større flåten brettet seg ut og omringe. Det var nettopp det grekerne ville unngå.',
                correct: false,
            },
            {
                id: 'b',
                label: 'I det trange sundet mellom Salamis og fastlandet',
                explanation: 'Riktig. I sundet kunne bare et fåtall persiske skip kjempe samtidig. Greske triremer rammet inn siden på rotete persiske rekker. Persisk overtall ble en hindring.',
                correct: true,
            },
            {
                id: 'c',
                label: 'Inn i havnen og kjempe ved kai',
                explanation: 'Da hadde grekerne sittet fast uten manøvrer. Persiske bueskyttere ville skutt dem fra land.',
                correct: false,
            },
        ],
        winningFactor: 'Trangt sund + rask trireme → den mindre flåten styrer slagrytmen.',
    },
];

type ChoiceState = { choiceId: string; correct: boolean } | null;

const ICONS = {
    shield: Shield,
    mountain: Mountain,
    anchor: Anchor,
};

export function BattleTacticsSim({
    title = 'Slag for slag: Hvorfor vant Hellas?',
    intro = 'Tre slag avgjorde Perserkrigene. For hvert slag: velg taktikken du tror grekerne brukte. Riktig svar låser opp neste slag.',
    battles = DEFAULT_BATTLES,
    synthesis = 'Hellas vant ikke fordi de var flere — de vant fordi de tvang Persia inn i terreng der overtall ikke kunne brettes ut. Trang slette, trangt pass, trangt sund. Smart bruk av terreng kan veie tyngre enn tall.',
}: BattleTacticsSimProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const [selections, setSelections] = useState<Record<string, ChoiceState>>({});
    const [done, setDone] = useState(false);

    const current = battles[stepIndex];
    const currentSelection = current ? selections[current.id] : null;
    const Icon = current ? ICONS[current.icon] : Shield;

    const handleSelect = (battleId: string, choice: BattleChoice) => {
        if (selections[battleId]?.correct) return;
        setSelections((prev) => ({
            ...prev,
            [battleId]: { choiceId: choice.id, correct: choice.correct },
        }));
    };

    const handleNext = () => {
        if (stepIndex < battles.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            setDone(true);
        }
    };

    const handleReset = () => {
        setStepIndex(0);
        setSelections({});
        setDone(false);
    };

    if (done) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <div>
                        <h3 className="font-semibold text-slate-800">Mønsteret er klart</h3>
                        <p className="text-sm text-slate-500">Det fellestrekket alle tre slagene deler.</p>
                    </div>
                </div>
                <div className="p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-emerald-800"
                    >
                        <p className="text-sm leading-relaxed">{synthesis}</p>
                    </motion.div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {battles.map((b) => {
                            const B = ICONS[b.icon];
                            return (
                                <motion.div
                                    key={b.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <B className="w-4 h-4 text-indigo-500" />
                                        <span className="font-semibold text-slate-800 text-sm">{b.name}</span>
                                        <span className="text-xs text-slate-500">{b.year}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-snug">{b.winningFactor}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
                <div className="px-6 pb-5 flex items-center justify-end">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> Start på nytt
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Shield className="w-5 h-5 text-indigo-500" />
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">{intro}</p>
                </div>
            </div>

            <div className="px-6 pt-4">
                <div className="flex items-center gap-2 mb-4">
                    {battles.map((b, i) => {
                        const completed = selections[b.id]?.correct;
                        const active = i === stepIndex;
                        return (
                            <div key={b.id} className="flex items-center gap-2">
                                <div
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                        completed
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : active
                                              ? 'bg-indigo-100 text-indigo-700'
                                              : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    {completed && <Check className="w-3 h-3" />}
                                    {b.name}
                                </div>
                                {i < battles.length - 1 && <div className="w-3 h-px bg-slate-200" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={current.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25 }}
                    className="px-6"
                >
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-semibold text-slate-800">
                                Slaget ved {current.name}
                            </h4>
                            <span className="text-xs text-slate-500">{current.year}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed mb-2">{current.setup}</p>
                        <p className="text-xs text-slate-500 italic">{current.forces}</p>
                    </div>

                    <p className="text-sm font-medium text-slate-700 mb-3">{current.question}</p>
                    <div className="space-y-2">
                        {current.choices.map((c) => {
                            const sel = currentSelection?.choiceId === c.id;
                            const showResult = sel && currentSelection;
                            const isCorrect = showResult && currentSelection.correct;
                            const isWrong = showResult && !currentSelection.correct;
                            const isLocked = currentSelection?.correct ?? false;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => handleSelect(current.id, c)}
                                    disabled={isLocked && !sel}
                                    className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                                        isCorrect
                                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                            : isWrong
                                              ? 'bg-rose-50 border-rose-300 text-rose-800'
                                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                    } ${isLocked && !sel ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-start gap-2">
                                        {isCorrect && <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                                        {isWrong && <X className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                                        <span>{c.label}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mx-6 mt-4 mb-2 min-h-[60px]">
                <AnimatePresence mode="wait">
                    {currentSelection && (
                        <motion.div
                            key={`${current.id}-${currentSelection.choiceId}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`rounded-lg border px-4 py-3 text-sm ${
                                currentSelection.correct
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : 'bg-rose-50 border-rose-200 text-rose-800'
                            }`}
                        >
                            {
                                current.choices.find((c) => c.id === currentSelection.choiceId)
                                    ?.explanation
                            }
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-6 pb-5 flex items-center justify-between">
                <button
                    onClick={handleNext}
                    disabled={!currentSelection?.correct}
                    className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                        currentSelection?.correct
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {stepIndex < battles.length - 1 ? 'Neste slag' : 'Se mønsteret'}
                </button>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" /> Tilbakestill
                </button>
            </div>
        </div>
    );
}
