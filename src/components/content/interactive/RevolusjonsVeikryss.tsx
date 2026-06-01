import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, RefreshCw } from 'lucide-react';

interface RevolusjonsVeikryssProps {
    title?: string;
}

interface Junction {
    id: string;
    question: string;
    context: string;
    historical: { label: string; outcome: string };
    alternative: { label: string; outcome: string };
}

const JUNCTIONS: Junction[] = [
    {
        id: 'kassett',
        question: 'Kassettbandene nar alle',
        context:
            'Khomeini sitter i eksil utenfor Paris. Han spiller inn taler pa kassettband. Banden smugles over grensen og kopieres fra moske til moske. Millioner horer stemmen hans.',
        historical: {
            label: 'Det faktiske: Banden spres vidt',
            outcome:
                'Uten TV eller internett ble kassettene revolusjonens motor. Folk som aldri hadde hørt Khomeinis navn kjente plutselig stemmen hans i sin egen kjeller. Massebevegelsen ble mulig.',
        },
        alternative: {
            label: 'Alternativet: SAVAK stopper spredningen',
            outcome:
                'Uten kassettene hadde revolusjonen holdt seg til akademikere og studenter i byene. En folkelig bevegelse pa tvers av klasser hadde ikke oppstatt. Sjahen hadde holdt seg.',
        },
    },
    {
        id: 'haer',
        question: 'Hæren velger folket',
        context:
            'Januar 1979. Demonstrasjonene er massive. Sjahen ber hæren skyte. Men soldater er ogsa sønner og brødre. Hærledelsen erklærer seg nøytral.',
        historical: {
            label: 'Det faktiske: Hæren er nøytral',
            outcome:
                'Da hæren trakk seg ut, hadde sjahen ingen makt igjen. Han forlot Iran 16. januar. Uten militær støtte var regimet ferdig pa timer.',
        },
        alternative: {
            label: 'Alternativet: Hæren holder fast',
            outcome:
                'Om hæren hadde fulgt ordrene, ville opprøret ha blitt slatt ned - slik det skjedde pa Tiananmen i Kina 10 ar senere. Revolusjoner stopper ved militær lojalitet.',
        },
    },
    {
        id: 'lederskap',
        question: 'Hvem fyller maktvakuumet?',
        context:
            'Sjahen er borte. Makten er ledig. Tre grupper vil lede: Khomeini og de religiøse, kommunister, og sekulære nasjonalister. Khomeini har folkelig støtte og klarhet.',
        historical: {
            label: 'Det faktiske: Khomeini tar makten',
            outcome:
                'Khomeini var forberedt, organisert og hadde et klart svar - islamsk styre. De andre var splittet. Han eliminerte rivaler raskt og innforte velayet-e faqih.',
        },
        alternative: {
            label: 'Alternativet: Sekulær koalisjonsregjering',
            outcome:
                'Mange av de som demonstrerte mot sjahen onsket demokrati, ikke teokrati. Om sekulære og kommunister hadde samlet seg pa forhanden, er Irans neste tiår uforutsigbart - men annerledes.',
        },
    },
];

export function RevolusjonsVeikryss({ title = 'Revolusjonen var ikke forutbestemt' }: RevolusjonsVeikryssProps) {
    const [step, setStep] = useState(0);
    const [choice, setChoice] = useState<'historical' | 'alternative' | null>(null);
    const [seen, setSeen] = useState<number[]>([]);

    const current = JUNCTIONS[step];
    const isComplete = seen.length === JUNCTIONS.length;

    const handleChoice = (c: 'historical' | 'alternative') => {
        setChoice(c);
    };

    const handleNext = () => {
        if (step < JUNCTIONS.length - 1) {
            setSeen((prev) => [...prev, step]);
            setStep((s) => s + 1);
            setChoice(null);
        } else {
            setSeen((prev) => [...prev, step]);
        }
    };

    const handleReset = () => {
        setStep(0);
        setChoice(null);
        setSeen([]);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden not-prose my-6">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <GitBranch className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tre veikryss - hvert kunne ha endret Irans skjebne</p>
                </div>
            </div>

            {/* Step indicator */}
            <div className="flex gap-1 px-5 pt-3">
                {JUNCTIONS.map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-indigo-400' : 'bg-slate-100'}`} />
                ))}
            </div>

            <div className="p-5">
                <AnimatePresence mode="wait">
                    {!isComplete && (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.22 }}
                        >
                            {/* Junction label */}
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                    Veikryss {step + 1}/{JUNCTIONS.length}
                                </span>
                                <span className="text-sm font-semibold text-slate-800">{current.question}</span>
                            </div>

                            {/* Context */}
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 mb-3 text-xs text-slate-600 leading-relaxed">
                                {current.context}
                            </div>

                            {/* Choice buttons */}
                            {!choice && (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleChoice('historical')}
                                        className="rounded-lg border-2 border-orange-200 bg-orange-50 px-3 py-2.5 text-left hover:border-orange-300 transition-colors"
                                    >
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-orange-600 mb-1">Historisk</div>
                                        <div className="text-xs text-orange-900">{current.historical.label}</div>
                                    </button>
                                    <button
                                        onClick={() => handleChoice('alternative')}
                                        className="rounded-lg border-2 border-blue-200 bg-blue-50 px-3 py-2.5 text-left hover:border-blue-300 transition-colors"
                                    >
                                        <div className="text-[10px] font-bold uppercase tracking-wide text-blue-600 mb-1">Alternativet</div>
                                        <div className="text-xs text-blue-900">{current.alternative.label}</div>
                                    </button>
                                </div>
                            )}

                            {/* Outcome */}
                            <AnimatePresence>
                                {choice && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`rounded-lg border px-3 py-2.5 ${
                                            choice === 'historical'
                                                ? 'border-orange-200 bg-orange-50'
                                                : 'border-blue-200 bg-blue-50'
                                        }`}
                                    >
                                        <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${choice === 'historical' ? 'text-orange-600' : 'text-blue-600'}`}>
                                            {choice === 'historical' ? 'Hva som skjedde' : 'Hva som kunne skjedd'}
                                        </div>
                                        <p className={`text-xs leading-relaxed ${choice === 'historical' ? 'text-orange-900' : 'text-blue-900'}`}>
                                            {current[choice].outcome}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {isComplete && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-lg border-2 border-emerald-300 bg-emerald-50 px-4 py-4 text-center"
                        >
                            <div className="text-emerald-700 font-bold text-sm mb-1.5">Revolusjoner er ikke naturlover</div>
                            <p className="text-xs text-emerald-800 leading-relaxed">
                                Pa hvert av disse tre veikryssene kunne utfallet ha blitt annerledes. Iran i dag er ikke et uunngaelig resultat av fortiden - det er summen av spesifikke valg tatt i kaotiske oyeblikk. Det gjelder alle revolusjoner.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="px-5 pb-5 flex items-center justify-between">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors"
                >
                    <RefreshCw className="w-3 h-3" />
                    Start pa nytt
                </button>
                {choice && !isComplete && (
                    <motion.button
                        onClick={handleNext}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 transition-colors"
                    >
                        Neste veikryss
                    </motion.button>
                )}
                {choice && step === JUNCTIONS.length - 1 && !isComplete && (
                    <motion.button
                        onClick={handleNext}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-2 transition-colors"
                    >
                        Se konklusjonen
                    </motion.button>
                )}
            </div>
        </div>
    );
}
