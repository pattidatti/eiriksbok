import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, CloudRain, Flame, HeartHandshake, AlertTriangle } from 'lucide-react';

interface Dilemma {
    id: number;
    text: string;
    optionA: {
        text: string;
        faithChange: number;
        stabilityChange: number;
        consequence: string;
    };
    optionB: {
        text: string;
        faithChange: number;
        stabilityChange: number;
        consequence: string;
    };
}

const dilemmas: Dilemma[] = [
    {
        id: 1,
        text: "En alvorlig tørke truer avlingene. Folket er redde. Hva er årsaken, og hva skal gjøres?",
        optionA: {
            text: "Erklær at det er Guds straff. Vi må be og ofre mer.",
            faithChange: 15,
            stabilityChange: -10,
            consequence: "Folket ber i frykt. Troen styrkes, men kornlagrene tømmes mens dere ber."
        },
        optionB: {
            text: "Bygg kanaler fra den hellige elven (selv om det er forbudt).",
            faithChange: -20,
            stabilityChange: 20,
            consequence: "Prestene raser over helligbrøde, men vannet redder avlingene."
        }
    },
    {
        id: 2,
        text: "En ny, karismatisk predikant samler store folkemengder med en litt annerledes lære.",
        optionA: {
            text: "Arrester ham for kjetteri. Det finnes bare én sannhet.",
            faithChange: 10,
            stabilityChange: 5,
            consequence: "Kjetteren er fengslet. Orden er gjenopprettet, men noen hvisker om tyranni."
        },
        optionB: {
            text: "Inviter ham til debatt. Kanskje Gud snakker gjennom ham?",
            faithChange: -15,
            stabilityChange: -10,
            consequence: "Debatten skaper forvirring. Folk begynner å tvile på Vokterrådets autoritet."
        }
    },
    {
        id: 3,
        text: "Pesten har kommet. Vitenskapsmenn fra utlandet tilbyr en medisin laget av 'urene' stoffer.",
        optionA: {
            text: "Avvis medisinen. Vi stoler på bønn og rituell renselse.",
            faithChange: 20,
            stabilityChange: -30,
            consequence: "Mange dør som martyrer. De overlevende er fanatiske i sin tro."
        },
        optionB: {
            text: "Godta medisinen for å redde liv. Livet er helligst.",
            faithChange: -25,
            stabilityChange: 25,
            consequence: "Pesten stoppes. Men folket spør: Hvorfor hjalp ikke bønnene våre?"
        }
    }
];

export const TheocraticCouncil: React.FC = () => {
    const [step, setStep] = useState(0);
    const [faith, setFaith] = useState(50);
    const [stability, setStability] = useState(50);
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleChoice = (option: 'A' | 'B') => {
        const current = dilemmas[step];
        const choice = option === 'A' ? current.optionA : current.optionB;

        setFaith(Math.min(100, Math.max(0, faith + choice.faithChange)));
        setStability(Math.min(100, Math.max(0, stability + choice.stabilityChange)));
        setFeedback(choice.consequence);
    };

    const nextStep = () => {
        setStep(step + 1);
        setFeedback(null);
    };

    if (step >= dilemmas.length) {
        return (
            <div className="bg-amber-50 p-8 md:p-12 rounded-3xl border-4 border-amber-200 my-10 shadow-2xl text-center">
                <h3 className="text-4xl font-black text-amber-900 mb-6">Guddommelig Dom</h3>
                <div className="flex justify-center gap-12 mb-8">
                    <div className="text-center">
                        <div className="text-sm font-bold uppercase tracking-widest text-amber-600 mb-2">Religiøs Renhet</div>
                        <div className="text-4xl font-black text-amber-800">{faith}%</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-bold uppercase tracking-widest text-amber-600 mb-2">Sosial Stabilitet</div>
                        <div className="text-4xl font-black text-amber-800">{stability}%</div>
                    </div>
                </div>
                <p className="text-amber-800 text-lg leading-relaxed mb-8 font-serif">
                    {faith > 80 && stability < 40
                        ? "Du har skapt et fanatisk samfunn som sulter mens de ber. Staten er ren, men svak."
                        : faith < 40 && stability > 70
                            ? "Du har reddet folket, men mistet Guds velsignelse. Samfunnet er trygt, men sekulært."
                            : "Du har balansert på knivseggen mellom tro og verden. Det er en vanskelig vei å gå."
                    }
                </p>
                <button
                    onClick={() => { setStep(0); setFaith(50); setStability(50); }}
                    className="px-8 py-3 bg-amber-800 text-amber-50 rounded-xl font-bold uppercase tracking-widest hover:bg-amber-900 transition-colors"
                >
                    Prøv på nytt
                </button>
            </div>
        );
    }

    return (
        <div className="bg-amber-50 p-6 md:p-10 rounded-3xl border-4 border-amber-100 my-10 shadow-xl relative overflow-hidden font-serif">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <Scroll size={200} className="text-amber-900" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-end mb-8 border-b-2 border-amber-200 pb-4">
                    <div>
                        <h3 className="text-3xl font-black text-amber-900 mb-2 flex items-center gap-3">
                            <Flame className="text-amber-600" /> Vokterrådet
                        </h3>
                        <p className="text-amber-700 italic">Hva er Guds vilje i denne saken?</p>
                    </div>
                    <div className="text-right flex gap-6 text-sm font-bold text-amber-800">
                        <div className="flex items-center gap-2" title="Religiøs Renhet">
                            <CloudRain size={18} /> {faith}%
                        </div>
                        <div className="flex items-center gap-2" title="Sosial Stabilitet">
                            <HeartHandshake size={18} /> {stability}%
                        </div>
                    </div>
                </div>

                <div className="mb-8 min-h-[100px]">
                    <h4 className="text-xl md:text-2xl font-bold text-amber-900 leading-snug">
                        "{dilemmas[step].text}"
                    </h4>
                </div>

                <AnimatePresence mode="wait">
                    {!feedback ? (
                        <motion.div
                            key="choices"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <button
                                onClick={() => handleChoice('A')}
                                className="p-6 bg-white border-2 border-amber-200 rounded-xl text-left hover:border-amber-600 hover:bg-amber-50 transition-all group"
                            >
                                <span className="block text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Den Rene Vei</span>
                                <p className="text-amber-900 font-medium group-hover:text-amber-950">{dilemmas[step].optionA.text}</p>
                            </button>
                            <button
                                onClick={() => handleChoice('B')}
                                className="p-6 bg-white border-2 border-amber-200 rounded-xl text-left hover:border-amber-600 hover:bg-amber-50 transition-all group"
                            >
                                <span className="block text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Den Pragmatiske Vei</span>
                                <p className="text-amber-900 font-medium group-hover:text-amber-950">{dilemmas[step].optionB.text}</p>
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-8 rounded-xl border-l-4 border-amber-500 shadow-lg"
                        >
                            <div className="flex gap-4 items-start">
                                <AlertTriangle className="text-amber-500 shrink-0 mt-1" />
                                <div>
                                    <h5 className="font-bold text-amber-900 uppercase tracking-widest mb-2 text-sm">Konsekvens</h5>
                                    <p className="text-lg text-amber-800 mb-6">{feedback}</p>
                                    <button
                                        onClick={nextStep}
                                        className="px-6 py-2 bg-amber-900 text-amber-50 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-amber-800"
                                    >
                                        Neste Sak
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
