import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Users, User, AlertCircle } from 'lucide-react';

export const ConformityExperiment: React.FC = () => {
    const [step, setStep] = useState(0); // 0: Start, 1: Presentation, 2: Others' answers, 3: Your choice, 4: Result
    const [userChoice, setUserChoice] = useState<number | null>(null);

    const targetLineHeight = 120;
    const options = [80, 120, 160];
    const othersAnswers = [2, 2, 2, 2]; // All "others" choose option 2 (wrong)

    const reset = () => {
        setStep(0);
        setUserChoice(null);
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 my-10 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Konformitetstesten</h3>
                    <p className="text-sm text-slate-500">En digital versjon av Asch-eksperimentet</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8 flex items-center justify-around h-60">
                <div className="flex flex-col items-center gap-4">
                    <div className="text-xs font-bold text-slate-400">REFERANSE</div>
                    <div className="w-3 bg-slate-800 rounded-full" style={{ height: targetLineHeight }}></div>
                </div>

                <div className="w-px h-full bg-slate-100"></div>

                <div className="flex gap-12 items-end">
                    {options.map((option, i) => (
                        <div key={i} className="flex flex-col items-center gap-4">
                            <div className="text-xs font-bold text-slate-400">{i + 1}</div>
                            <motion.div
                                className={`w-3 rounded-full transition-colors ${userChoice === i ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                style={{ height: option }}
                                animate={step >= 2 && othersAnswers[0] === i ? { opacity: [1, 0.5, 1] } : {}}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="min-h-[120px] flex flex-col items-center justify-center text-center">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <p className="text-slate-600 mb-6">Oppgaven er enkel: Hvilken av de tre linjene til høyre er like lang som referanselinjen til venstre?</p>
                            <button
                                onClick={() => setStep(1)}
                                className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-md"
                            >
                                Start eksperimentet
                            </button>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <p className="text-slate-600 mb-6">Du er i en gruppe med 4 andre. De skal svare først.</p>
                            <button
                                onClick={() => setStep(2)}
                                className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-900 transition-all"
                            >
                                Hør hva de andre sier
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                            <div className="flex gap-2 mb-4">
                                {[1, 2, 3, 4].map(p => (
                                    <div key={p} className="flex flex-col items-center gap-1">
                                        <User className="w-6 h-6 text-slate-400" />
                                        <span className="text-[10px] font-bold bg-slate-200 px-2 py-0.5 rounded-full">Svar: 3</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-slate-700 font-bold mb-4">Alle de andre valgte linje 3.</p>
                            <button
                                onClick={() => setStep(3)}
                                className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all"
                            >
                                Gi ditt svar
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <p className="text-slate-800 font-bold mb-6 italic">Hvilken linje er korrekt?</p>
                            <div className="flex gap-4">
                                {options.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setUserChoice(i);
                                            setStep(4);
                                        }}
                                        className="w-20 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold hover:border-indigo-400 transition-all"
                                    >
                                        Linje {i + 1}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
                            <div className={`p-6 rounded-xl border-2 mb-6 ${userChoice === 1 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                <div className="flex justify-center mb-4">
                                    {userChoice === 1 ? (
                                        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold">
                                            <Check />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center text-red-700 font-bold">
                                            <X />
                                        </div>
                                    )}
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg mb-2">
                                    {userChoice === 1 ? "Du stolte på egne øyne!" : "Du fulgte flokken!"}
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {userChoice === 1
                                        ? "Selv om alle de andre valgte linje 3 (som er åpenbart feil), valgte du korrekt. Likevel viser studier at mange føler et sterkt ubehag ved å stå alene."
                                        : "Linje 2 er korrekt, men siden alle de andre valgte linje 3, følte du kanskje et press for å passe inn? Dette er kjernen i konformitet."}
                                </p>
                            </div>
                            <button onClick={reset} className="text-indigo-600 font-bold hover:underline">Prøv igjen</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-400 flex items-start gap-2 italic">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                I originaleksperimentet til Solomon Asch valgte 75% av deltakerne å følge flokken minst én gang, selv om de visste svaret var feil.
            </div>
        </div>
    );
};
