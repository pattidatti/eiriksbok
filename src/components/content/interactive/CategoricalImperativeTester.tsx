import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, RotateCcw } from 'lucide-react';

type Maxim = {
    title: string;
    text: string;
    universalized: string;
    contradiction: string;
    conclusion: string;
    isMoral: boolean;
};

const maxims: Maxim[] = [
    {
        title: "Løgn",
        text: "Jeg vil lyve for å låne penger jeg vet jeg ikke kan betale tilbake.",
        universalized: "Alle skal lyve hver gang de trenger penger.",
        contradiction: "Hvis alle lyver, vil ingen tro på løfter. Da er det umulig å låne penger ved å love å betale tilbake. Handlingen undergraver seg selv.",
        conclusion: "Umoral. Du kan ikke ville dette som en allmenn lov.",
        isMoral: false
    },
    {
        title: "Hjelpsomhet",
        text: "Jeg vil hjelpe andre i nød når jeg har mulighet.",
        universalized: "Alle skal hjelpe andre i nød når de har mulighet.",
        contradiction: "Dette skaper et samfunn der alle får hjelp. Det er ingen logisk selvmotsigelse her (du vil også ønske hjelp selv).",
        conclusion: "Moral. Dette kan være en allmenn lov.",
        isMoral: true
    },
    {
        title: "Sniking",
        text: "Jeg vil snike på bussen for å spare penger.",
        universalized: "Alle skal snike på bussen.",
        contradiction: "Hvis alle sniker, går busselskapet konkurs og bussen slutter å gå. Da kan du ikke lenger snike på bussen.",
        conclusion: "Umoral. Handlingen din ødelegger forutsetningen for seg selv.",
        isMoral: false
    }
];

export const CategoricalImperativeTester: React.FC = () => {
    const [step, setStep] = useState(0); // 0: Select, 1: Maxims, 2: Universalize, 3: Contradiction, 4: Result
    const [selectedMaxim, setSelectedMaxim] = useState<Maxim | null>(null);

    const start = (maxim: Maxim) => {
        setSelectedMaxim(maxim);
        setStep(1);
    };

    const next = () => setStep(s => s + 1);
    const reset = () => {
        setStep(0);
        setSelectedMaxim(null);
    };

    return (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 my-8 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">

            {step === 0 && (
                <div className="w-full">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Test dine handlinger: Kants lakmustest</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {maxims.map((m, i) => (
                            <button
                                key={i}
                                onClick={() => start(m)}
                                className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left"
                            >
                                <h4 className="font-bold text-slate-700 mb-2">{m.title}</h4>
                                <p className="text-sm text-slate-500">{m.text}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step > 0 && selectedMaxim && (
                <div className="w-full max-w-lg">
                    <div className="flex justify-between items-center mb-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span className={step >= 1 ? "text-blue-600" : ""}>1. Maksime</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className={step >= 2 ? "text-blue-600" : ""}>2. Lov</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className={step >= 3 ? "text-blue-600" : ""}>3. Test</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className={step >= 4 ? "text-blue-600" : ""}>4. Dom</span>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h4 className="text-lg font-bold text-slate-800 mb-2">Trinn 1: Formuler regelen</h4>
                                <p className="text-xl italic font-serif text-slate-600 mb-6">"{selectedMaxim.text}"</p>
                                <button onClick={next} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition-colors">
                                    Gjør det til en allmenn lov {'->'}
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h4 className="text-lg font-bold text-slate-800 mb-2">Trinn 2: Universaliser</h4>
                                <p className="text-slate-500 mb-4">Tenk deg en verden der ALLE gjør dette, alltid.</p>
                                <p className="text-xl italic font-serif text-slate-600 mb-6">"{selectedMaxim.universalized}"</p>
                                <button onClick={next} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition-colors">
                                    Se etter selvmotsigelser {'->'}
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h4 className="text-lg font-bold text-slate-800 mb-2">Trinn 3: Logisk Sjekk</h4>
                                <p className="text-slate-600 mb-6">{selectedMaxim.contradiction}</p>
                                <button onClick={next} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition-colors">
                                    Fell dommen {'->'}
                                </button>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-6 rounded-xl border-2 ${selectedMaxim.isMoral ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                            >
                                <div className="flex justify-center mb-4">
                                    {selectedMaxim.isMoral ? (
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                            <Check className="w-8 h-8 text-green-600" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                            <X className="w-8 h-8 text-red-600" />
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-2xl font-bold text-slate-800 mb-2">{selectedMaxim.conclusion}</h4>
                                <p className="text-slate-600 mb-6">{selectedMaxim.isMoral ? "Handle i vei!" : "Stopp! Dette er din plikt å la være."}</p>
                                <button onClick={reset} className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 mx-auto font-medium">
                                    <RotateCcw className="w-4 h-4" /> Test en til
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};
