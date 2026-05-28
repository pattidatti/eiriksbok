import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Swords, Shield, RotateCcw, ChevronRight, Trophy } from 'lucide-react';

interface Dilemma {
    situation: string;
    context: string;
    choices: {
        label: string;
        tensionDelta: number;
        independenceDelta: number;
        feedback: string;
    }[];
}

const DILEMMAS: Dilemma[] = [
    {
        situation: 'Folkeavstemning',
        context:
            'Sverige nekter å godta Stortingets vedtak fra 7. juni uten bevis for at folket faktisk vil ha selvstendighet. De krever folkeavstemning.',
        choices: [
            {
                label: 'Godta folkeavstemning',
                tensionDelta: -15,
                independenceDelta: 10,
                feedback:
                    'Riktig valg! Folkeavstemningen 13. august ga et overveldende resultat: 368 208 stemte ja, bare 184 stemte nei. Det ga Norge sterk legitimitet internasjonalt.',
            },
            {
                label: 'Nekte — Stortingets vedtak er nok',
                tensionDelta: 25,
                independenceDelta: 5,
                feedback:
                    'Norge hadde rett til å bestemme selv, men uten folkeavstemning ville stormaktene tvilt på om nordmennene virkelig ville dette. I virkeligheten godtok Norge avstemningen.',
            },
        ],
    },
    {
        situation: 'Grensefestningene',
        context:
            'Sverige krever at Norge river festningene langs grensen. Svenskene ser dem som en trussel. Nordmennene mener festningene er nødvendig forsvar.',
        choices: [
            {
                label: 'Godta å rive festningene',
                tensionDelta: -20,
                independenceDelta: -5,
                feedback:
                    'Det var smertefullt, men dette var nøkkelen til avtalen. Norge godtok å rive festningene, og Sverige godtok å anerkjenne norsk selvstendighet.',
            },
            {
                label: 'Nekte blankt',
                tensionDelta: 30,
                independenceDelta: 10,
                feedback:
                    'Å nekte økte faren for krig drastisk. Begge land hadde allerede mobilisert soldater langs grensen. I virkeligheten aksepterte Norge å rive dem.',
            },
            {
                label: 'Foreslå at begge land ruster ned ved grensen',
                tensionDelta: -5,
                independenceDelta: 5,
                feedback:
                    'Et klokt diplomatisk trekk. I praksis endte det med at Norge rev festningene, mens Sverige også aksepterte en nøytral sone. Kompromiss reddet freden.',
            },
        ],
    },
    {
        situation: 'Nøytral sone',
        context:
            'Sverige foreslår en demilitarisert sone på begge sider av grensen. Ingen soldater eller festninger i dette området.',
        choices: [
            {
                label: 'Godta den nøytrale sonen',
                tensionDelta: -15,
                independenceDelta: 0,
                feedback:
                    'Denne sonen ga begge land trygghet. Den viste at Norge ikke planla å angripe Sverige, og omvendt. Avtalen ble et symbol på fredelig sameksistens.',
            },
            {
                label: 'Avslå — Norge må kunne forsvare hele sitt territorium',
                tensionDelta: 20,
                independenceDelta: 5,
                feedback:
                    'Forståelig bekymring, men å avslå risikerte å torpedere hele avtalen. I virkeligheten godtok Norge den nøytrale sonen som en del av Karlstad-avtalen.',
            },
        ],
    },
    {
        situation: 'Kongehuset',
        context:
            'Kong Oscar II har abdisert som norsk konge. Sverige tilbyr en Bernadotte-prins til den norske tronen. Alternativet er å velge en helt ny kongefamilie.',
        choices: [
            {
                label: 'Avslå høflig og la folket velge',
                tensionDelta: 5,
                independenceDelta: 15,
                feedback:
                    'Norge takket nei til en svensk prins. I stedet holdt de folkeavstemning og valgte den danske prinsen Carl, som tok navnet Haakon VII. Et selvstendig valg for en selvstendig nasjon.',
            },
            {
                label: 'Godta en Bernadotte-prins',
                tensionDelta: -10,
                independenceDelta: -10,
                feedback:
                    'Det ville glattet forholdet til Sverige, men mange nordmenn ville følt at selvstendigheten var halvhjertet. I virkeligheten valgte Norge sin egen konge.',
            },
        ],
    },
];

type Phase = 'idle' | 'active' | 'feedback' | 'complete';

export function KarlstadForhandling() {
    const [phase, setPhase] = useState<Phase>('idle');
    const [step, setStep] = useState(0);
    const [tension, setTension] = useState(50);
    const [independence, setIndependence] = useState(30);
    const [chosenFeedback, setChosenFeedback] = useState('');
    const [history, setHistory] = useState<string[]>([]);

    const handleStart = () => {
        setPhase('active');
    };

    const handleChoice = (choice: Dilemma['choices'][0]) => {
        setTension((t) => Math.max(0, Math.min(100, t + choice.tensionDelta)));
        setIndependence((i) => Math.max(0, Math.min(100, i + choice.independenceDelta)));
        setChosenFeedback(choice.feedback);
        setHistory((h) => [...h, choice.label]);
        setPhase('feedback');
    };

    const handleNext = () => {
        if (step + 1 >= DILEMMAS.length) {
            setPhase('complete');
        } else {
            setStep((s) => s + 1);
            setPhase('active');
            setChosenFeedback('');
        }
    };

    const handleReset = () => {
        setPhase('idle');
        setStep(0);
        setTension(50);
        setIndependence(30);
        setChosenFeedback('');
        setHistory([]);
    };

    const warOutcome = tension >= 70;
    const fullIndependence = independence >= 40;

    const dilemma = DILEMMAS[step];

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Scale className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">
                        Karlstad-forhandlingene 1905
                    </h3>
                    <p className="text-sm text-slate-500">
                        Kan du forhandle Norge til frihet uten krig?
                    </p>
                </div>
            </div>

            <div className="p-6">
                {phase !== 'idle' && (
                    <div className="flex gap-4 mb-5">
                        <MeterBar
                            label="Spenning"
                            value={tension}
                            color={tension > 60 ? 'rose' : tension > 35 ? 'amber' : 'emerald'}
                            icon={<Swords className="w-4 h-4" />}
                        />
                        <MeterBar
                            label="Selvstendighet"
                            value={independence}
                            color={
                                independence > 50
                                    ? 'emerald'
                                    : independence > 25
                                      ? 'amber'
                                      : 'rose'
                            }
                            icon={<Shield className="w-4 h-4" />}
                        />
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {phase === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-4"
                        >
                            <p className="text-slate-600 mb-4">
                                September 1905. Norge og Sverige møtes i Karlstad for å forhandle
                                om unionsoppløsningen. Du er del av den norske delegasjonen. Kan
                                du sikre Norges frihet uten at det bryter ut krig?
                            </p>
                            <button
                                onClick={handleStart}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                            >
                                Start forhandlingene
                            </button>
                        </motion.div>
                    )}

                    {phase === 'active' && dilemma && (
                        <motion.div
                            key={`dilemma-${step}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="mb-1 text-xs text-slate-400 font-medium uppercase tracking-wide">
                                Runde {step + 1} av {DILEMMAS.length}
                            </div>
                            <h4 className="font-semibold text-slate-800 mb-2">
                                {dilemma.situation}
                            </h4>
                            <p className="text-slate-600 text-sm mb-4">{dilemma.context}</p>
                            <div className="flex flex-col gap-2">
                                {dilemma.choices.map((choice, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleChoice(choice)}
                                        className="text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-slate-700"
                                    >
                                        {choice.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {phase === 'feedback' && (
                        <motion.div
                            key={`feedback-${step}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm mb-4">
                                {chosenFeedback}
                            </div>
                            <button
                                onClick={handleNext}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {step + 1 >= DILEMMAS.length ? 'Se resultat' : 'Neste runde'}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {phase === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div
                                className={`px-5 py-4 rounded-lg border text-sm mb-4 ${
                                    !warOutcome && fullIndependence
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : warOutcome
                                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                                          : 'bg-amber-50 border-amber-200 text-amber-700'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Trophy className="w-5 h-5" />
                                    <span className="font-semibold">
                                        {!warOutcome && fullIndependence
                                            ? 'Frihet uten krig!'
                                            : warOutcome
                                              ? 'Forhandlingene brøt sammen'
                                              : 'Halvhjertet frihet'}
                                    </span>
                                </div>
                                <p>
                                    {!warOutcome && fullIndependence
                                        ? 'Du klarte det! Akkurat som den virkelige norske delegasjonen fant du en vei til selvstendighet gjennom kompromiss og klokskap. Norge ble fritt 26. oktober 1905.'
                                        : warOutcome
                                          ? 'Spenningen ble for høy. I virkeligheten var begge land mobilisert langs grensen, men diplomatene klarte å finne kompromisser som hindret krig.'
                                          : 'Norge fikk en slags frihet, men ga for mye fra seg. I virkeligheten var de norske forhandlerne tøffe nok til å sikre reell selvstendighet, samtidig som de var kloke nok til å inngå kompromisser.'}
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">
                                Dine valg: {history.join(' → ')}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {phase === 'complete' && (
                <div className="px-6 pb-5 flex items-center justify-end">
                    <button
                        onClick={handleReset}
                        className="text-slate-400 hover:text-slate-600 text-sm transition-colors flex items-center gap-1"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Prøv igjen
                    </button>
                </div>
            )}
        </div>
    );
}

function MeterBar({
    label,
    value,
    color,
    icon,
}: {
    label: string;
    value: number;
    color: 'rose' | 'amber' | 'emerald';
    icon: React.ReactNode;
}) {
    const bgMap = { rose: 'bg-rose-500', amber: 'bg-amber-500', emerald: 'bg-emerald-500' };
    const trackMap = { rose: 'bg-rose-100', amber: 'bg-amber-100', emerald: 'bg-emerald-100' };
    const textMap = { rose: 'text-rose-600', amber: 'text-amber-600', emerald: 'text-emerald-600' };

    return (
        <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
                <span className={textMap[color]}>{icon}</span>
                <span className="text-xs font-medium text-slate-600">{label}</span>
                <span className={`text-xs font-bold ml-auto ${textMap[color]}`}>{value}%</span>
            </div>
            <div className={`h-2 rounded-full ${trackMap[color]} overflow-hidden`}>
                <motion.div
                    className={`h-full rounded-full ${bgMap[color]}`}
                    initial={false}
                    animate={{ width: `${value}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            </div>
        </div>
    );
}
