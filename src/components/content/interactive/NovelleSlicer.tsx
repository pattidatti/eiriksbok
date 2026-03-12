import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Scissors, RotateCcw, CheckCircle, AlertTriangle, TrendingUp, Undo2 } from 'lucide-react';

interface NovelleSlicerProps {
    title?: string;
    originalWordCount: number;
    targetWordCount: number;
    sections: {
        id: string;
        text: string;
        type: 'essential' | 'cuttable' | 'borderline';
        wordCount: number;
        label: string;
        tensionValue: number;
        feedback: string;
    }[];
}

export const NovelleSlicer = ({
    title = 'Novelleslakteren',
    originalWordCount,
    targetWordCount,
    sections,
}: NovelleSlicerProps) => {
    const [cutIds, setCutIds] = useState<Set<string>>(new Set());
    const [warningId, setWarningId] = useState<string | null>(null);
    const [warningMsg, setWarningMsg] = useState('');
    const [finished, setFinished] = useState(false);
    const [feedbackId, setFeedbackId] = useState<string | null>(null);
    const [restoredId, setRestoredId] = useState<string | null>(null);

    const currentWordCount = useMemo(() => {
        return originalWordCount - sections
            .filter((s) => cutIds.has(s.id))
            .reduce((sum, s) => sum + s.wordCount, 0);
    }, [cutIds, sections, originalWordCount]);

    const tensionPath = useMemo(() => {
        const pts = sections.filter((s) => !cutIds.has(s.id));
        if (pts.length < 2) return '';
        const maxX = pts.length - 1;
        return pts
            .map((s, i) => `${i === 0 ? 'M' : 'L'} ${(i / maxX) * 100} ${100 - s.tensionValue * 10}`)
            .join(' ');
    }, [cutIds, sections]);

    const handleToggle = useCallback((sectionId: string) => {
        if (finished) return;
        const section = sections.find((s) => s.id === sectionId);
        if (!section) return;

        if (cutIds.has(sectionId)) {
            // Restore the section
            setCutIds((prev) => {
                const next = new Set(prev);
                next.delete(sectionId);
                return next;
            });
            setRestoredId(sectionId);
            setTimeout(() => setRestoredId(null), 2500);
            return;
        }

        if (section.type === 'essential') {
            setWarningId(sectionId);
            setWarningMsg('Obs! Denne delen er viktig for historien!');
            setTimeout(() => { setWarningId(null); setWarningMsg(''); }, 2000);
            return;
        }
        setCutIds((prev) => new Set(prev).add(sectionId));
        setFeedbackId(sectionId);
        setTimeout(() => setFeedbackId(null), 2500);
    }, [finished, cutIds, sections]);

    const qualityScore = useMemo(() => {
        const cut = sections.filter((s) => cutIds.has(s.id));
        const cuttableHit = cut.filter((s) => s.type === 'cuttable').length;
        const totalCuttable = sections.filter((s) => s.type === 'cuttable').length;
        const base = totalCuttable > 0 ? (cuttableHit / totalCuttable) * 80 : 0;
        const bonus = cut.filter((s) => s.type === 'borderline').length * 5;
        const penalty = currentWordCount > targetWordCount
            ? Math.min(20, ((currentWordCount - targetWordCount) / targetWordCount) * 40)
            : 0;
        return Math.round(Math.min(100, base + bonus - penalty));
    }, [cutIds, sections, currentWordCount, targetWordCount]);

    const handleFinish = () => {
        setFinished(true);
        if (qualityScore >= 60) confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    };

    const handleReset = () => {
        setCutIds(new Set());
        setWarningId(null);
        setWarningMsg('');
        setFinished(false);
        setFeedbackId(null);
        setRestoredId(null);
    };

    const wordRatio = currentWordCount / originalWordCount;
    const barColor = currentWordCount <= targetWordCount
        ? 'bg-emerald-500'
        : currentWordCount <= targetWordCount * 1.15 ? 'bg-amber-400' : 'bg-red-400';

    return (
        <div className="my-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
                <Scissors className="w-6 h-6 text-rose-500" />
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            </div>

            {/* Word count bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span className="font-medium">{currentWordCount} / {originalWordCount} ord</span>
                    <span className="text-slate-400">Mål: {targetWordCount} ord</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${barColor}`}
                        animate={{ width: `${Math.max(wordRatio * 100, 5)}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                </div>
            </div>

            {/* Tension curve */}
            <div className="mb-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
                    <TrendingUp className="w-4 h-4" />
                    <span>Spenningskurve</span>
                </div>
                <svg viewBox="0 0 100 100" className="w-full h-20" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="tensionGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(244,63,94)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="rgb(244,63,94)" stopOpacity="0.02" />
                        </linearGradient>
                    </defs>
                    {tensionPath && (
                        <>
                            <path d={`${tensionPath} L 100 100 L 0 100 Z`} fill="url(#tensionGrad)" />
                            <motion.path
                                d={tensionPath} fill="none" stroke="rgb(244,63,94)"
                                strokeWidth="2" strokeLinecap="round"
                                initial={false} animate={{ d: tensionPath }}
                                transition={{ duration: 0.4 }}
                            />
                        </>
                    )}
                </svg>
            </div>

            {/* Warning message */}
            <AnimatePresence>
                {warningMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mb-3 flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {warningMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sections */}
            <div className="space-y-3 mb-6">
                {sections.map((section) => {
                    const isCut = cutIds.has(section.id);
                    const isWarning = warningId === section.id;
                    return (
                        <motion.div
                            key={section.id}
                            animate={isWarning ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                            transition={isWarning ? { duration: 0.5 } : {}}
                            className="relative"
                        >
                            <motion.button
                                onClick={() => handleToggle(section.id)}
                                disabled={finished} layout
                                className={`w-full text-left rounded-xl border p-4 transition-colors relative overflow-hidden group ${
                                    isCut
                                        ? 'bg-slate-100/50 border-slate-200 cursor-pointer hover:border-blue-300'
                                        : 'bg-white border-slate-200 hover:border-rose-300 hover:shadow-sm cursor-pointer'
                                }`}
                            >
                                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${
                                    isCut ? 'bg-slate-200 text-slate-400' : 'bg-violet-100 text-violet-700'
                                }`}>
                                    {section.label} · {section.wordCount} ord
                                </span>
                                <AnimatePresence mode="wait">
                                    {isCut ? (
                                        <motion.div
                                            initial={{ opacity: 1, height: 'auto' }}
                                            animate={{ opacity: 0.35, height: 24 }}
                                            transition={{ duration: 0.4 }}
                                            className="relative"
                                        >
                                            <p className="text-sm text-slate-400 line-through line-clamp-1">
                                                {section.text}
                                            </p>
                                            <motion.div
                                                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                                                className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-400 origin-left"
                                            />
                                            <Scissors className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                                            <motion.span
                                                initial={{ opacity: 0 }} animate={{ opacity: 0 }}
                                                whileHover={{ opacity: 1 }}
                                                className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded px-1.5 py-0.5 shadow-sm"
                                            >
                                                <Undo2 className="w-3 h-3" />
                                                Angre
                                            </motion.span>
                                        </motion.div>
                                    ) : (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="text-sm text-slate-700 leading-relaxed">
                                            {section.text}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                            <AnimatePresence>
                                {feedbackId === section.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="mt-1 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-1.5 border border-emerald-200"
                                    >
                                        {section.feedback}
                                    </motion.div>
                                )}
                                {restoredId === section.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="mt-1 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-1.5 border border-blue-200 flex items-center gap-1.5"
                                    >
                                        <Undo2 className="w-3 h-3" />
                                        Angret! Seksjonen er tilbake.
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Results panel */}
            <AnimatePresence>
                {finished && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="mb-5 p-5 bg-gradient-to-br from-violet-50 to-rose-50 rounded-xl border border-violet-200"
                    >
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-violet-600" />
                            Redigering fullført
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-slate-700">{originalWordCount}</div>
                                <div className="text-xs text-slate-500">Før</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-emerald-600">{currentWordCount}</div>
                                <div className="text-xs text-slate-500">Etter</div>
                            </div>
                            <div>
                                <div className={`text-2xl font-bold ${qualityScore >= 60 ? 'text-violet-600' : 'text-amber-500'}`}>
                                    {qualityScore}%
                                </div>
                                <div className="text-xs text-slate-500">Kvalitet</div>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-600 text-center">
                            {qualityScore >= 80
                                ? 'Strålende redigering! Du fjernet overflødig tekst uten å miste essensen.'
                                : qualityScore >= 60
                                  ? 'Godt jobbet! Teksten er strammere, men det finnes enda mer å kutte.'
                                  : 'Prøv igjen — du kan kutte mer uten å skade historien.'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex gap-3">
                {!finished && (
                    <button
                        onClick={handleFinish} disabled={cutIds.size === 0}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Ferdig redigering
                    </button>
                )}
                <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Nullstill
                </button>
            </div>
        </div>
    );
};
