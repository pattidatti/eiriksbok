import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    X,
    User,
    CheckCircle2,
    Star,
    AlertCircle,
} from 'lucide-react';
import { useDetectiveState } from './useDetectiveState';
import { SourceViewer } from './SourceViewer';
import { ConclusionScreen } from './ConclusionScreen';
import { BriefingScreen } from './BriefingScreen';
import type { DetectiveCase, DetectiveSuspect, DetectiveClue } from './types';
import { useNavigate } from 'react-router-dom';

interface DetectiveEngineProps {
    data: DetectiveCase;
}

/** Compact progress pill shown in the header */
function ProgressPill({
    currentStep,
    totalSteps,
    evidenceCount,
    totalEvidence,
    isOpen,
    onToggle,
}: {
    currentStep: number;
    totalSteps: number;
    evidenceCount: number;
    totalEvidence: number;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 transition-colors"
        >
            <div className="flex items-center gap-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            scale: i === currentStep ? [1, 1.4, 1] : 1,
                        }}
                        transition={{ duration: 0.4, type: 'spring', stiffness: 400 }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                            i < currentStep
                                ? 'bg-emerald-500'
                                : i === currentStep
                                  ? 'bg-indigo-500'
                                  : 'bg-slate-600'
                        }`}
                    />
                ))}
            </div>

            <motion.span
                key={evidenceCount}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="text-xs font-bold text-slate-400"
            >
                <span
                    className={
                        evidenceCount >= totalEvidence ? 'text-emerald-400' : 'text-indigo-400'
                    }
                >
                    {evidenceCount}
                </span>
                /{totalEvidence} bevis
            </motion.span>

            <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
        </button>
    );
}

/** Overlay drawer showing suspects and collected evidence */
function InvestigationDrawer({
    suspects,
    clueDetails,
    onClose,
}: {
    suspects: DetectiveSuspect[];
    clueDetails: DetectiveClue[];
    onClose: () => void;
}) {
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 z-20"
                onClick={onClose}
            />

            <motion.div
                ref={drawerRef}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute top-0 left-0 right-0 z-30 bg-slate-900 border-b border-slate-700 shadow-2xl max-h-[50vh] overflow-y-auto rounded-b-2xl"
            >
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Saksmappe
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {suspects.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                                Teorier
                            </h4>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {suspects.map((suspect) => (
                                    <div
                                        key={suspect.id}
                                        className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-white/5"
                                    >
                                        <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-slate-400 text-xs">
                                            {suspect.icon || <User className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-200 whitespace-nowrap">
                                                {suspect.name}
                                            </p>
                                            <p className="text-[10px] text-slate-500 whitespace-nowrap max-w-[180px] truncate">
                                                {suspect.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Bevis funnet
                        </h4>
                        {clueDetails.length === 0 ? (
                            <p className="text-xs text-slate-600 italic py-2">
                                Ingen bevis samlet inn enda. Klikk på markerte fraser i
                                kildeteksten.
                            </p>
                        ) : (
                            <div className="space-y-1.5">
                                {clueDetails.map((clue) => (
                                    <motion.div
                                        key={clue.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-start gap-2 p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/15"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-emerald-200">
                                                "{clue.text}"
                                            </p>
                                            <p className="text-[11px] text-slate-400 leading-snug">
                                                {clue.insight}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
}

/** Star rating visual (1-3 stars) */
function StarRating({ found, total }: { found: number; total: number }) {
    const pct = total > 0 ? found / total : 0;
    const stars = pct >= 1 ? 3 : pct > 0.5 ? 2 : 1;

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 400 }}
                >
                    <Star
                        className={`w-6 h-6 ${
                            i <= stars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-700 fill-slate-800'
                        }`}
                    />
                </motion.div>
            ))}
        </div>
    );
}

export const DetectiveEngine: React.FC<DetectiveEngineProps> = ({ data }) => {
    const state = useDetectiveState(data);
    const navigate = useNavigate();
    const {
        currentStep,
        currentStepIndex,
        totalSteps,
        nextStep,
        prevStep,
        isFirstStep,
        isLastStep,
        isConclusionVisible,
        setIsConclusionVisible,
        isBriefingVisible,
        setIsBriefingVisible,
    } = state;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeSourceIndex, setActiveSourceIndex] = useState(0);
    // Reset active source when step changes
    const stepId = currentStep?.id;
    const [prevStepId, setPrevStepId] = useState(stepId);
    if (stepId !== prevStepId) {
        setPrevStepId(stepId);
        setActiveSourceIndex(0);
    }

    if (isBriefingVisible && data.briefing) {
        return (
            <BriefingScreen
                briefing={data.briefing}
                onStart={() => setIsBriefingVisible(false)}
            />
        );
    }

    if (state.isCompleted) {
        const found = state.collectedClues.size;
        const total = data.status.totalEvidence;
        const missed = total - found;

        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0a0c10] text-center min-h-[400px]">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-4"
                >
                    <Search className="w-8 h-8" />
                </motion.div>

                <h2 className="text-2xl font-display font-bold text-white mb-2">
                    Oppdrag fullført!
                </h2>

                <StarRating found={found} total={total} />

                <p className="text-sm text-slate-400 mt-3 mb-6 max-w-md">
                    Du fant{' '}
                    <span className="text-indigo-400 font-bold">
                        {found} av {total}
                    </span>{' '}
                    bevis.
                </p>

                {state.collectedClueDetails.length > 0 && (
                    <div className="w-full max-w-md mb-4">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-left">
                            Dine funn
                        </h3>
                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto custom-scrollbar">
                            {state.collectedClueDetails.map((clue, i) => (
                                <motion.div
                                    key={clue.id}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="flex items-start gap-2 p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/15 text-left"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-emerald-200">
                                            "{clue.text}"
                                        </p>
                                        <p className="text-[11px] text-slate-400 leading-snug">
                                            {clue.insight}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {missed > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex items-center gap-2 text-xs text-amber-400/80 mb-6"
                    >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Du gikk glipp av {missed} bevis - spill igjen for å finne alle!
                    </motion.div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/oving/detektiv')}
                        className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
                    >
                        Tilbake til oversikten
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                        Spill igjen
                    </button>
                </div>
            </div>
        );
    }

    if (isConclusionVisible) {
        return (
            <ConclusionScreen
                conclusionData={data.conclusion_engine}
                onRestart={() => setIsConclusionVisible(false)}
                onSubmit={() => state.setIsCompleted(true)}
                evidenceCount={state.collectedClues.size}
            />
        );
    }

    const multiSource = currentStep.sources.length > 1;
    const activeSource = currentStep.sources[activeSourceIndex] || currentStep.sources[0];

    return (
        <div className="relative bg-[#0a0c10] text-slate-200 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col flex-1 min-h-0">
            {/* Header */}
            <header className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between flex-shrink-0">
                <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400">
                        Steg {currentStepIndex + 1} av {totalSteps}
                    </span>
                    <h2 className="text-base font-bold text-white font-display truncate">
                        {currentStep.title}
                    </h2>
                </div>

                <ProgressPill
                    currentStep={currentStepIndex}
                    totalSteps={totalSteps}
                    evidenceCount={state.collectedClues.size}
                    totalEvidence={data.status.totalEvidence}
                    isOpen={drawerOpen}
                    onToggle={() => setDrawerOpen((prev) => !prev)}
                />
            </header>

            {/* Multi-source tabs */}
            {multiSource && (
                <div className="flex border-b border-slate-800 bg-slate-900/30 flex-shrink-0">
                    {currentStep.sources.map((src, i) => (
                        <button
                            key={src.id}
                            onClick={() => setActiveSourceIndex(i)}
                            className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors truncate ${
                                i === activeSourceIndex
                                    ? 'text-white border-b-2 border-indigo-500 bg-indigo-500/5'
                                    : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            Kilde {i + 1}: {src.title}
                        </button>
                    ))}
                </div>
            )}

            {/* Content area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar relative">
                {/* Investigation drawer overlay */}
                <AnimatePresence>
                    {drawerOpen && (
                        <InvestigationDrawer
                            suspects={data.suspects}
                            clueDetails={state.collectedClueDetails}
                            onClose={() => setDrawerOpen(false)}
                        />
                    )}
                </AnimatePresence>

                <div className="max-w-3xl mx-auto">
                    {currentStep.content && (
                        <p className="text-sm text-slate-400 mb-4 italic">
                            {currentStep.content}
                        </p>
                    )}

                    <SourceViewer
                        source={activeSource}
                        onClueFound={state.collectClue}
                        foundClues={state.collectedClues}
                    />
                </div>
            </div>

            {/* Navigation footer */}
            <footer className="px-4 py-3 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between flex-shrink-0">
                <button
                    onClick={prevStep}
                    disabled={isFirstStep}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                        isFirstStep
                            ? 'text-slate-600 cursor-not-allowed'
                            : 'text-slate-300 hover:bg-white/5'
                    }`}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Forrige
                </button>

                <button
                    onClick={nextStep}
                    className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
                >
                    {isLastStep ? 'Gå til konklusjon' : 'Neste'}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </footer>
        </div>
    );
};
