import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    FileText,
    Library,
    Play,
    RotateCcw,
    Sparkles,
    Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LearningPathV2Data, StepV2 } from '../../types';
import { useLearningPathProfile } from '../../stores/useLearningPathProfile';
import type { StepResponse } from '../../stores/useLearningPathProfile';
import { useGlossary } from '../../context/GlossaryContext';
import { ReadArticleStep } from './learning-path-v2/ReadArticleStep';
import { MiniQuizStep } from './learning-path-v2/MiniQuizStep';
import { ReflectionStep } from './learning-path-v2/ReflectionStep';
import { InteractiveStep } from './learning-path-v2/InteractiveStep';
import { ScenarioStep } from './learning-path-v2/ScenarioStep';
import { SynthesisStep } from './learning-path-v2/SynthesisStep';
import { ConceptDrillStep } from './learning-path-v2/ConceptDrillStep';
import { StepperTopBar } from './learning-path-v2/StepperTopBar';
import { OpenTasksPanel } from './learning-path-v2/OpenTasksPanel';

interface LearningPathV2Props {
    data: LearningPathV2Data;
}

type Tab = 'activity' | 'tasks' | 'concepts';

const STEP_KIND_LABELS: Record<StepV2['kind'], { label: string; cls: string }> = {
    'read-article': { label: 'Les artikkel', cls: 'bg-indigo-100 text-indigo-700' },
    interactive: { label: 'Interaktiv', cls: 'bg-amber-100 text-amber-700' },
    scenario: { label: 'Tidsreise', cls: 'bg-purple-100 text-purple-700' },
    detective: { label: 'Detektiv', cls: 'bg-slate-200 text-slate-700' },
    reflection: { label: 'Refleksjon', cls: 'bg-blue-100 text-blue-700' },
    'concept-drill': { label: 'Begreper', cls: 'bg-teal-100 text-teal-700' },
    'mini-quiz': { label: 'Quiz', cls: 'bg-rose-100 text-rose-700' },
    multiplayer: { label: 'Klasserom', cls: 'bg-pink-100 text-pink-700' },
    synthesis: { label: 'Syntese', cls: 'bg-orange-100 text-orange-700' },
};

const StepKindBadge: React.FC<{ kind: StepV2['kind'] }> = ({ kind }) => {
    const entry = STEP_KIND_LABELS[kind];
    return (
        <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${entry.cls}`}
        >
            {entry.label}
        </span>
    );
};

export const LearningPathV2: React.FC<LearningPathV2Props> = ({ data }) => {
    const profile = useLearningPathProfile();
    const pathState = profile.getPath(data.id);

    const hasStarted = !!pathState?.currentStepId || (pathState?.completedStepIds.length ?? 0) > 0;

    const [activeStepId, setActiveStepId] = useState<string>(
        pathState?.currentStepId ?? data.steps[0]?.id ?? ''
    );
    const [tab, setTab] = useState<Tab>('activity');
    const [showFinished, setShowFinished] = useState<boolean>(!!pathState?.finishedAt);

    const activeStep = useMemo(
        () => data.steps.find((s) => s.id === activeStepId) ?? data.steps[0],
        [data.steps, activeStepId]
    );

    const activeIndex = data.steps.findIndex((s) => s.id === activeStep?.id);
    const completedCount = pathState?.completedStepIds.length ?? 0;
    const totalSteps = data.steps.length;
    const progressPct = totalSteps === 0 ? 0 : (completedCount / totalSteps) * 100;

    const goToStep = (stepId: string) => {
        setActiveStepId(stepId);
        profile.setCurrentStep(data.id, stepId);
        setTab('activity');
    };

    const handleStart = () => {
        if (!pathState && data.steps.length > 0) {
            profile.startPath(data.id, data.steps[0].id);
        }
        setActiveStepId(data.steps[0].id);
        setTab('activity');
    };

    const handleStepComplete = (
        step: StepV2,
        response: Omit<StepResponse, 'completedAt'>
    ) => {
        profile.completeStep(data.id, step.id, response, step.conceptsIntroduced ?? []);
    };

    const handleAdvance = () => {
        if (!activeStep) return;
        const currentState = profile.getPath(data.id);
        const response = currentState?.responses[activeStep.id];
        const score = response?.score;

        if (score !== undefined && activeStep.branches) {
            if (score >= 0.9 && activeStep.branches.onMastery) {
                goToStep(activeStep.branches.onMastery);
                return;
            }
            if (score < 0.6 && activeStep.branches.onStruggle) {
                goToStep(activeStep.branches.onStruggle);
                return;
            }
        }

        if (activeIndex >= 0 && activeIndex < data.steps.length - 1) {
            goToStep(data.steps[activeIndex + 1].id);
        } else {
            profile.finishPath(data.id);
            setShowFinished(true);
        }
    };

    const handlePrev = () => {
        if (activeIndex > 0) goToStep(data.steps[activeIndex - 1].id);
    };

    const handleReset = () => {
        if (!confirm('Vil du nullstille fremdriften i denne stien?')) return;
        profile.resetPath(data.id);
        setActiveStepId(data.steps[0].id);
        setShowFinished(false);
        setTab('activity');
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Ignorer hvis bruker skriver i et input/textarea
            const target = e.target as HTMLElement | null;
            if (
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable)
            ) {
                return;
            }
            if (!hasStarted) return;
            if (e.key === 'ArrowLeft') handlePrev();
            else if (e.key === 'ArrowRight') {
                if (activeIndex < data.steps.length - 1) goToStep(data.steps[activeIndex + 1].id);
            } else if (e.key === '1') setTab('activity');
            else if (e.key === '2') setTab('tasks');
            else if (e.key === '3') setTab('concepts');
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeIndex, hasStarted, data.steps]);

    if (data.steps.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-6">
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-6 text-rose-900">
                    Denne læringsstien har ingen steg ennå.
                </div>
            </div>
        );
    }

    // Onboarding - sti aldri påbegynt
    if (!hasStarted) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4 md:px-6">
                <WelcomeView data={data} onStart={handleStart} />
            </div>
        );
    }

    if (!activeStep) return null;

    return (
        <div className="max-w-5xl mx-auto py-6 px-3 md:px-6">
            {/* Kompakt header */}
            <header className="mb-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                        <h1 className="text-xl md:text-2xl font-display font-bold text-slate-900 leading-tight">
                            {data.title}
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                            {completedCount} av {totalSteps} steg fullført
                        </p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex-shrink-0"
                        title="Nullstill all fremdrift"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Nullstill</span>
                    </button>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </header>

            {/* Stepper */}
            <StepperTopBar
                steps={data.steps}
                activeStepId={activeStep.id}
                completedStepIds={pathState?.completedStepIds ?? []}
                onSelectStep={goToStep}
            />

            {/* Aktivt steg */}
            <main className="mt-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                    >
                        <StepView
                            step={activeStep}
                            pathId={data.id}
                            stepNumber={activeIndex + 1}
                            totalSteps={totalSteps}
                            tab={tab}
                            onTabChange={setTab}
                            isAlreadyCompleted={
                                pathState?.completedStepIds.includes(activeStep.id) ?? false
                            }
                            previousResponse={pathState?.responses[activeStep.id]}
                            onComplete={(r) => handleStepComplete(activeStep, r)}
                            onAdvance={handleAdvance}
                            onPrev={handlePrev}
                            isFirst={activeIndex === 0}
                            isLast={activeIndex === totalSteps - 1}
                        />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Finished overlay */}
            <AnimatePresence>
                {showFinished && (
                    <FinishedOverlay
                        data={data}
                        onClose={() => setShowFinished(false)}
                        onReset={handleReset}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Welcome view ─────────────────────────────────────────────────────────

const WelcomeView: React.FC<{
    data: LearningPathV2Data;
    onStart: () => void;
}> = ({ data, onStart }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
        >
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6">
                <Play className="w-8 h-8 text-white ml-1" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                {data.title}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-6">
                {data.description}
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-500 mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full">
                    <BookOpen className="w-3.5 h-3.5" />
                    {data.steps.length} steg
                </span>
                {data.estimatedMinutes && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full">
                        <Sparkles className="w-3.5 h-3.5" />
                        ca. {data.estimatedMinutes} min
                    </span>
                )}
            </div>
            <button
                onClick={onStart}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition transform hover:-translate-y-0.5"
            >
                Start stien
                <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs text-slate-400 mt-6">
                Tips: Bruk <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[10px] font-mono">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[10px] font-mono">→</kbd> for å bla mellom steg når du er i gang.
            </p>
        </motion.div>
    );
};

// ─── Step view (med tabs) ────────────────────────────────────────────────

interface StepViewProps {
    step: StepV2;
    pathId: string;
    stepNumber: number;
    totalSteps: number;
    tab: Tab;
    onTabChange: (t: Tab) => void;
    isAlreadyCompleted: boolean;
    previousResponse?: StepResponse;
    onComplete: (response: Omit<StepResponse, 'completedAt'>) => void;
    onAdvance: () => void;
    onPrev: () => void;
    isFirst: boolean;
    isLast: boolean;
}

const StepView: React.FC<StepViewProps> = ({
    step,
    pathId,
    stepNumber,
    totalSteps,
    tab,
    onTabChange,
    isAlreadyCompleted,
    previousResponse,
    onComplete,
    onAdvance,
    onPrev,
    isFirst,
    isLast,
}) => {
    // StepView remountes pr. steg-id (key i parent), så initial state stemmer alltid.
    const [justCompleted, setJustCompleted] = useState(isAlreadyCompleted);

    const handleComplete = (response: Omit<StepResponse, 'completedAt'>) => {
        onComplete(response);
        setJustCompleted(true);
    };

    const hasOpenTasks = !!step.openTasks && step.openTasks.length > 0;
    const hasConcepts = !!step.conceptsIntroduced && step.conceptsIntroduced.length > 0;

    const renderActivity = () => {
        const props = {
            step,
            pathId,
            onComplete: handleComplete,
            previousResponse,
            isAlreadyCompleted: isAlreadyCompleted || justCompleted,
        };
        switch (step.kind) {
            case 'read-article':
                return <ReadArticleStep {...props} />;
            case 'mini-quiz':
                return <MiniQuizStep {...props} />;
            case 'reflection':
                return <ReflectionStep {...props} />;
            case 'interactive':
                return <InteractiveStep {...props} />;
            case 'scenario':
                return <ScenarioStep {...props} />;
            case 'synthesis':
                return <SynthesisStep {...props} />;
            case 'concept-drill':
                return <ConceptDrillStep {...props} />;
            case 'detective':
            case 'multiplayer':
                return (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 text-amber-900">
                        <p className="font-semibold">
                            Denne stegtypen ({step.kind}) er planlagt for Fase 3.
                        </p>
                        <p className="text-sm mt-2">
                            Du kan markere steget som ferdig manuelt for å gå videre.
                        </p>
                        <button
                            onClick={() => handleComplete({ completed: true })}
                            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold"
                        >
                            Marker som ferdig
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            {/* Step header */}
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Steg {stepNumber} av {totalSteps}
                        </span>
                        <StepKindBadge kind={step.kind} />
                        {(isAlreadyCompleted || justCompleted) && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                Fullført
                            </span>
                        )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight">
                        {step.title}
                    </h2>
                </div>
            </div>

            {/* Intro */}
            {step.intro && (
                <p className="text-slate-700 leading-relaxed text-base md:text-lg mb-5">
                    {step.intro}
                </p>
            )}

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-5 flex items-center gap-1 overflow-x-auto">
                <TabButton
                    icon={<Play className="w-4 h-4" />}
                    label="Aktivitet"
                    isActive={tab === 'activity'}
                    onClick={() => onTabChange('activity')}
                />
                {hasOpenTasks && (
                    <TabButton
                        icon={<FileText className="w-4 h-4" />}
                        label="Oppgaver"
                        count={step.openTasks!.length}
                        isActive={tab === 'tasks'}
                        onClick={() => onTabChange('tasks')}
                    />
                )}
                {hasConcepts && (
                    <TabButton
                        icon={<Library className="w-4 h-4" />}
                        label="Begreper"
                        count={step.conceptsIntroduced!.length}
                        isActive={tab === 'concepts'}
                        onClick={() => onTabChange('concepts')}
                    />
                )}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={tab + '-' + step.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                >
                    {tab === 'activity' && renderActivity()}
                    {tab === 'tasks' && hasOpenTasks && (
                        <OpenTasksPanel tasks={step.openTasks!} stepNumber={stepNumber} />
                    )}
                    {tab === 'concepts' && hasConcepts && (
                        <ConceptsPanel concepts={step.conceptsIntroduced!} />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Footer navigation */}
            <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                    onClick={onPrev}
                    disabled={isFirst}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Forrige
                </button>

                {(isAlreadyCompleted || justCompleted) ? (
                    <button
                        onClick={onAdvance}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl transition"
                    >
                        {isLast ? 'Fullfør stien' : 'Neste steg'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <span className="text-xs text-slate-400 italic px-2">
                        Fullfør aktiviteten for å gå videre
                    </span>
                )}
            </div>
        </div>
    );
};

const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    count?: number;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, count, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition border-b-2 -mb-px whitespace-nowrap ${
            isActive
                ? 'text-indigo-700 border-indigo-600'
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'
        }`}
    >
        {icon}
        {label}
        {count !== undefined && (
            <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                }`}
            >
                {count}
            </span>
        )}
    </button>
);

// ─── Concepts panel ──────────────────────────────────────────────────────

const ConceptsPanel: React.FC<{ concepts: string[] }> = ({ concepts }) => {
    const { getEntry } = useGlossary();

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Library className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 leading-tight">
                        Begreper du møter i dette steget
                    </h3>
                    <p className="text-xs text-slate-500">
                        Disse begrepene blir lagt til samlingen din når du fullfører steget.
                    </p>
                </div>
            </div>
            <ul className="space-y-3">
                {concepts.map((term) => {
                    const entry = getEntry(term);
                    return (
                        <li
                            key={term}
                            className="border-l-2 border-teal-200 pl-4 py-1"
                        >
                            <p className="font-bold text-slate-900 text-sm md:text-base">{term}</p>
                            {entry?.definition ? (
                                <p className="text-sm text-slate-600 leading-relaxed mt-0.5">
                                    {entry.definition}
                                </p>
                            ) : (
                                <p className="text-xs text-slate-400 italic mt-0.5">
                                    Definisjon ikke i ordlisten ennå.
                                </p>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

// ─── Finished overlay ────────────────────────────────────────────────────

const FinishedOverlay: React.FC<{
    data: LearningPathV2Data;
    onClose: () => void;
    onReset: () => void;
}> = ({ data, onClose, onReset }) => {
    const masteryScore = useLearningPathProfile((s) => s.getMasteryScore(data.id));
    const pathState = useLearningPathProfile((s) => s.paths[data.id]);
    const reflections = pathState
        ? Object.entries(pathState.responses)
              .filter(([, r]) => r.text)
              .map(([stepId, r]) => ({
                  stepId,
                  title: data.steps.find((s) => s.id === stepId)?.title ?? stepId,
                  text: r.text!,
              }))
        : [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 md:p-10 text-center border-b border-indigo-100">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-5">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-3">
                        Du har fullført stien!
                    </h2>
                    <p className="text-slate-700 text-base md:text-lg max-w-xl mx-auto">
                        {data.synthesis?.intro ??
                            'Du har gått hele veien fra introduksjon til syntese.'}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold text-slate-700">
                            Mestringspoeng: {Math.round(masteryScore * 100)}%
                        </span>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {pathState && pathState.conceptsEncountered.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-widest">
                                Begreper du nå behersker
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {pathState.conceptsEncountered.map((c) => (
                                    <span
                                        key={c}
                                        className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-100"
                                    >
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {reflections.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-widest">
                                Dine refleksjoner
                            </h3>
                            <div className="space-y-3">
                                {reflections.map((r) => (
                                    <div
                                        key={r.stepId}
                                        className="border-l-4 border-blue-300 pl-4 py-1"
                                    >
                                        <p className="text-xs font-bold uppercase tracking-widest text-blue-700 mb-1">
                                            {r.title}
                                        </p>
                                        <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                                            {r.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-slate-100">
                        <button
                            onClick={onClose}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Tilbake til stien
                        </button>

                        {data.targetTopicId && (
                            <Link
                                to={`/oving/quiz?topic=${data.targetTopicId}${data.targetSubjectId ? `&subject=${data.targetSubjectId}` : ''}`}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition"
                            >
                                Test kunnskapen i quiz
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}

                        <button
                            onClick={onReset}
                            className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-500 hover:text-rose-600 transition"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Start på nytt
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
