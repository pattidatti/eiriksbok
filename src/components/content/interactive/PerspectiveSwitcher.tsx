import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Camera, ArrowRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface PerspectiveSwitcherProps {
    title?: string;
    scene: {
        description: string;
        perspectives: {
            id: string;
            name: string;
            icon: string;
            text: string;
            proximity: number;
        }[];
    };
    quiz: {
        excerpts: {
            text: string;
            correctPerspectiveId: string;
        }[];
    };
}

const useTypewriter = (text: string, active: boolean, speed = 12) => {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    useEffect(() => {
        if (!active) { setDisplayed(''); setDone(false); return; }
        setDisplayed(''); setDone(false);
        let i = 0;
        const id = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) { clearInterval(id); setDone(true); }
        }, speed);
        return () => clearInterval(id);
    }, [text, active, speed]);
    return { displayed, done };
};

export const PerspectiveSwitcher = ({
    title = 'Hvem eier historien?',
    scene,
    quiz,
}: PerspectiveSwitcherProps) => {
    const [phase, setPhase] = useState<'explore' | 'quiz'>('explore');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [viewed, setViewed] = useState<Set<string>>(new Set());
    const [qIndex, setQIndex] = useState(0);
    const [picked, setPicked] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [quizDone, setQuizDone] = useState(false);

    const active = scene.perspectives.find((p) => p.id === activeId);
    const { displayed, done: typeDone } = useTypewriter(active?.text ?? '', activeId !== null);
    const allViewed = scene.perspectives.every((p) => viewed.has(p.id));
    const excerpt = quiz.excerpts[qIndex];
    const isCorrect = picked === excerpt?.correctPerspectiveId;

    const selectPerspective = useCallback((id: string) => {
        setActiveId(id);
        setViewed((prev) => new Set(prev).add(id));
    }, []);

    const handleQuizPick = useCallback((id: string) => {
        if (picked) return;
        setPicked(id);
        if (id === excerpt.correctPerspectiveId) setScore((s) => s + 1);
    }, [picked, excerpt]);

    const advanceQuiz = useCallback(() => {
        if (qIndex + 1 >= quiz.excerpts.length) {
            setQuizDone(true);
            if (score + (isCorrect ? 1 : 0) === quiz.excerpts.length)
                confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
        } else { setQIndex((i) => i + 1); setPicked(null); }
    }, [qIndex, quiz.excerpts.length, score, isCorrect]);

    const resetAll = useCallback(() => {
        setPhase('explore'); setActiveId(null); setViewed(new Set());
        setQIndex(0); setPicked(null); setScore(0); setQuizDone(false);
    }, []);

    const correctName = scene.perspectives.find((p) => p.id === excerpt?.correctPerspectiveId)?.name;

    return (
        <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 my-10 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-violet-100 rounded-lg text-violet-700"><Camera size={24} /></div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">{title}</h3>
            </div>

            <AnimatePresence mode="wait">
                {phase === 'explore' ? (
                    <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -40 }}>
                        <p className="text-slate-600 leading-relaxed mb-6">{scene.description}</p>

                        <div className="flex flex-wrap gap-3 mb-6">
                            {scene.perspectives.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => selectPerspective(p.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                        activeId === p.id
                                            ? 'bg-violet-600 text-white shadow-md ring-4 ring-violet-200'
                                            : viewed.has(p.id)
                                              ? 'bg-violet-100 text-violet-700 border border-violet-300'
                                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    <span className="text-lg">{p.icon}</span>
                                    {p.name}
                                    {viewed.has(p.id) && activeId !== p.id && <CheckCircle size={14} className="text-violet-500" />}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {active && (
                                <motion.div key={activeId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                                    className="bg-white rounded-xl border border-slate-100 p-6 shadow-inner mb-6">
                                    <p className="text-slate-800 leading-relaxed whitespace-pre-line min-h-[80px]">
                                        {displayed}
                                        {!typeDone && <span className="inline-block w-0.5 h-5 bg-violet-500 ml-0.5 animate-pulse align-text-bottom" />}
                                    </p>
                                    <div className="mt-6 pt-4 border-t border-slate-100">
                                        <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
                                            <span>Distansert</span><span>Intim</span>
                                        </div>
                                        <div className="relative h-3 bg-gradient-to-r from-blue-200 via-purple-200 to-rose-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-violet-500 rounded-full shadow-md"
                                                initial={false}
                                                animate={{ left: `calc(${active.proximity}% - 10px)` }}
                                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {allViewed && (
                            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                onClick={() => { setPhase('quiz'); setActiveId(null); }}
                                className="flex items-center gap-2 mx-auto px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors shadow-md">
                                Gå til blindtest <ArrowRight size={18} />
                            </motion.button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="quiz" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                        {!quizDone ? (
                            <>
                                <p className="text-sm font-semibold text-slate-400 mb-1">
                                    Spørsmål {qIndex + 1} av {quiz.excerpts.length}
                                </p>
                                <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-inner mb-5">
                                    <p className="text-slate-800 italic leading-relaxed">&laquo;{excerpt.text}&raquo;</p>
                                </div>
                                <p className="text-slate-600 text-sm mb-3 font-medium">Hvilket perspektiv er dette skrevet i?</p>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {scene.perspectives.map((p) => {
                                        const chosen = picked === p.id;
                                        const right = picked && p.id === excerpt.correctPerspectiveId;
                                        const wrong = chosen && !isCorrect;
                                        return (
                                            <motion.button key={p.id} onClick={() => handleQuizPick(p.id)}
                                                animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                                                transition={{ duration: 0.4 }}
                                                disabled={!!picked}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                                    right ? 'bg-green-500 text-white ring-4 ring-green-200'
                                                        : wrong ? 'bg-red-500 text-white ring-4 ring-red-200'
                                                        : picked ? 'bg-slate-100 text-slate-400 cursor-default'
                                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-violet-50 hover:border-violet-300'
                                                }`}>
                                                <span className="text-lg">{p.icon}</span>{p.name}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                                <AnimatePresence>
                                    {picked && (
                                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium mb-4 ${
                                                isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                            {isCorrect
                                                ? <><CheckCircle size={18} /> Riktig!</>
                                                : <><XCircle size={18} /> Feil — riktig svar er {correctName}.</>}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {picked && (
                                    <button onClick={advanceQuiz}
                                        className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors">
                                        {qIndex + 1 < quiz.excerpts.length ? 'Neste' : 'Se resultat'} <ArrowRight size={16} />
                                    </button>
                                )}
                            </>
                        ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                                <p className="text-4xl font-bold text-slate-800 mb-2">{score}/{quiz.excerpts.length}</p>
                                <p className="text-slate-500 mb-6">
                                    {score === quiz.excerpts.length ? 'Perfekt! Du mestrer perspektivene.'
                                        : score >= quiz.excerpts.length / 2 ? 'Bra jobbet! Øv litt mer for å mestre alle.'
                                        : 'Prøv igjen — les tekstene nøye.'}
                                </p>
                                <button onClick={resetAll}
                                    className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                                    <RotateCcw size={16} /> Start på nytt
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
