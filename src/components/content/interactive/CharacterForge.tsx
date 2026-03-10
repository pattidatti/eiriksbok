import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Hammer, RotateCcw, Shield, ChevronRight, Sparkles } from 'lucide-react';

interface CharacterForgeProps {
    title?: string;
    steps: {
        id: string; name: string; icon: string; description: string;
        fieldLabel: string; fieldType: 'select' | 'text';
        options?: string[]; placeholder?: string;
    }[];
    strengthTests: {
        scenario: string; question: string; options: string[];
        bestIndex: number; feedback: string[];
    }[];
}

type Phase = 'forge' | 'test' | 'done';

export const CharacterForge = ({
    title = 'Karaktersmia', steps, strengthTests,
}: CharacterForgeProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [inputVal, setInputVal] = useState('');
    const [stamped, setStamped] = useState<Set<number>>(new Set());
    const [phase, setPhase] = useState<Phase>('forge');
    const [testIndex, setTestIndex] = useState(0);
    const [testAnswers, setTestAnswers] = useState<(number | null)[]>(strengthTests.map(() => null));
    const [showFeedback, setShowFeedback] = useState(false);

    const allDone = Object.keys(answers).length === steps.length;
    const step = steps[currentStep];
    const test = strengthTests[testIndex];
    const picked = testAnswers[testIndex];

    const submitStep = () => {
        const val = step.fieldType === 'select' ? inputVal : inputVal.trim();
        if (!val) return;
        setAnswers((p) => ({ ...p, [step.id]: val }));
        setStamped((p) => new Set(p).add(currentStep));
        setInputVal('');
        if (currentStep < steps.length - 1) setTimeout(() => setCurrentStep(currentStep + 1), 400);
        else setTimeout(() => setPhase('test'), 600);
    };

    const selectTestOption = (i: number) => {
        if (showFeedback) return;
        const a = [...testAnswers]; a[testIndex] = i;
        setTestAnswers(a); setShowFeedback(true);
    };

    const nextTest = () => {
        setShowFeedback(false);
        if (testIndex < strengthTests.length - 1) setTestIndex(testIndex + 1);
        else { setPhase('done'); confetti({ particleCount: 180, spread: 90, origin: { y: 0.55 } }); }
    };

    const reset = () => {
        setCurrentStep(0); setAnswers({}); setInputVal(''); setStamped(new Set());
        setPhase('forge'); setTestIndex(0); setTestAnswers(strengthTests.map(() => null));
        setShowFeedback(false);
    };

    const inputCls = 'w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500';

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden my-8"
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                    <Hammer className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-base text-white">{title}</h3>
                </div>
                <button onClick={reset} className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-700" title="Nullstill">
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Step badges */}
            <div className="px-4 pt-4 flex gap-2 flex-wrap">
                {steps.map((s, i) => {
                    const d = stamped.has(i);
                    const active = phase === 'forge' && i === currentStep;
                    return (
                        <motion.div key={s.id} animate={d ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.3 }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                d ? 'bg-amber-400/20 text-amber-300 border border-amber-500/40'
                                : active ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 ring-2 ring-indigo-500/30'
                                : 'bg-slate-700/40 text-slate-500 border border-slate-600/30'
                            }`}
                        >
                            <span role="img">{s.icon}</span> {s.name}
                            {d && <span className="text-amber-400 ml-0.5">&#10003;</span>}
                        </motion.div>
                    );
                })}
            </div>

            {/* Main content: form/test + ID card */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="min-h-[200px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {phase === 'forge' && !allDone && (
                            <motion.div key={`s-${currentStep}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">Steg {currentStep + 1} av {steps.length}</p>
                                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                        <span role="img">{step.icon}</span> {step.name}
                                    </h4>
                                    <p className="text-slate-300 text-sm mt-1">{step.description}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">{step.fieldLabel}</label>
                                    {step.fieldType === 'select' ? (
                                        <select value={inputVal} onChange={(e) => setInputVal(e.target.value)} className={inputCls}>
                                            <option value="">Velg ...</option>
                                            {step.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    ) : (
                                        <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && submitStep()}
                                            placeholder={step.placeholder || ''} className={`${inputCls} placeholder:text-slate-500`} />
                                    )}
                                </div>
                                <button onClick={submitStep} disabled={!inputVal.trim()}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-slate-900 font-bold text-sm rounded-lg hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-amber-500/20">
                                    <Hammer className="w-4 h-4" /> Smi <ChevronRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                        {phase === 'test' && (
                            <motion.div key={`t-${testIndex}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                    <h4 className="text-white font-bold text-sm uppercase tracking-wider">Styrketest {testIndex + 1} av {strengthTests.length}</h4>
                                </div>
                                <p className="text-slate-300 text-sm italic">{test.scenario}</p>
                                <p className="text-white font-semibold text-sm">{test.question}</p>
                                <div className="space-y-2">
                                    {test.options.map((opt, oi) => (
                                        <motion.button key={oi} onClick={() => selectTestOption(oi)}
                                            whileHover={!showFeedback ? { scale: 1.02 } : {}}
                                            className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                                                showFeedback && picked === oi && oi === test.bestIndex ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                                                : showFeedback && picked === oi ? 'border-slate-500 bg-slate-600/30 text-slate-300'
                                                : showFeedback ? 'border-slate-700 bg-slate-800/40 text-slate-500'
                                                : 'border-slate-600 bg-slate-700/40 text-slate-200 hover:border-indigo-400 hover:bg-indigo-500/10 cursor-pointer'
                                            }`}>{opt}</motion.button>
                                    ))}
                                </div>
                                <AnimatePresence>
                                    {showFeedback && picked !== null && (
                                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                            <p className={`text-sm px-3 py-2 rounded-lg ${picked === test.bestIndex ? 'bg-amber-500/15 text-amber-200' : 'bg-slate-700/50 text-slate-300'}`}>
                                                {test.feedback[picked]}
                                            </p>
                                            <button onClick={nextTest} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white font-semibold text-sm rounded-lg hover:bg-indigo-400 transition-all">
                                                {testIndex < strengthTests.length - 1 ? 'Neste test' : 'Se resultat'} <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {phase === 'done' && (
                            <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
                                <p className="text-2xl">&#9876;&#65039;</p>
                                <p className="text-amber-300 font-bold text-lg">Karakteren er ferdig smidd!</p>
                                <p className="text-slate-400 text-sm">Din figur har blitt testet i ild og kommet styrket ut.</p>
                                <button onClick={reset} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 text-white font-semibold text-sm rounded-lg hover:bg-slate-600 transition-all mt-2">
                                    <RotateCcw className="w-4 h-4" /> Smi en ny karakter
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ID Card */}
                <motion.div layout className="relative rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl shadow-xl p-5 overflow-hidden">
                    {phase === 'done' && (
                        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: -12 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                            className="absolute top-3 right-3 bg-amber-400 text-amber-900 font-black text-xs px-3 py-1.5 rounded-full shadow-lg border-2 border-amber-500">
                            FERDIG SMIDD
                        </motion.div>
                    )}
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-amber-500" />
                        <h4 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Karakter-ID</h4>
                    </div>
                    <div className="space-y-3">
                        {steps.map((s, i) => {
                            const val = answers[s.id];
                            return (
                                <motion.div key={s.id} layout initial={false} animate={{ opacity: val ? 1 : 0.6 }} className="flex items-start gap-2">
                                    <span className="text-lg shrink-0" role="img">{s.icon}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.name}</p>
                                        <AnimatePresence mode="wait">
                                            {val ? (
                                                <motion.p key="v" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-medium text-slate-800 mt-0.5">{val}</motion.p>
                                            ) : (
                                                <motion.p key="e" className="text-sm text-slate-400 italic mt-0.5">???</motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    {stamped.has(i) && (
                                        <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 14 }} className="text-amber-500">
                                            <Hammer className="w-4 h-4" />
                                        </motion.span>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};
