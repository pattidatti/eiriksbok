import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    List,
    RotateCcw,
    Sparkles,
    Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LearningPathV2Data, StepV2 } from '../../types';
import { useLearningPathProfile } from '../../stores/useLearningPathProfile';
import type { StepResponse } from '../../stores/useLearningPathProfile';
import { ReadArticleStep } from './learning-path-v2/ReadArticleStep';
import { MiniQuizStep } from './learning-path-v2/MiniQuizStep';
import { ReflectionStep } from './learning-path-v2/ReflectionStep';
import { InteractiveStep } from './learning-path-v2/InteractiveStep';
import { ScenarioStep } from './learning-path-v2/ScenarioStep';
import { SynthesisStep } from './learning-path-v2/SynthesisStep';
import { ConceptDrillStep } from './learning-path-v2/ConceptDrillStep';

interface LearningPathV2Props {
    data: LearningPathV2Data;
}

type View = 'overview' | 'step' | 'finished';

export const LearningPathV2: React.FC<LearningPathV2Props> = ({ data }) => {
    const profile = useLearningPathProfile();
    const pathState = profile.getPath(data.id);

    const [view, setView] = useState<View>(() => {
        if (pathState?.finishedAt) return 'finished';
        if (pathState?.currentStepId) return 'step';
        return 'overview';
    });

    const [activeStepId, setActiveStepId] = useState<string>(
        pathState?.currentStepId ?? data.steps[0]?.id ?? ''
    );

    // Sørg for at sti er registrert i profilen.
    useEffect(() => {
        if (!pathState && data.steps.length > 0) {
            profile.startPath(data.id, data.steps[0].id);
        }
    }, [data.id, data.steps, pathState, profile]);

    const activeStep = useMemo(
        () => data.steps.find((s) => s.id === activeStepId) ?? data.steps[0],
        [data.steps, activeStepId]
    );

    const completedCount = pathState?.completedStepIds.length ?? 0;
    const totalSteps = data.steps.length;
    const progressPct = totalSteps === 0 ? 0 : (completedCount / totalSteps) * 100;
    const allCompleted = completedCount >= totalSteps && totalSteps > 0;

    const handleStartStep = (stepId: string) => {
        setActiveStepId(stepId);
        profile.setCurrentStep(data.id, stepId);
        setView('step');
    };

    const handleStepComplete = (
        step: StepV2,
        response: Omit<StepResponse, 'completedAt'>
    ) => {
        profile.completeStep(data.id, step.id, response, step.conceptsIntroduced ?? []);
    };

    const handleAdvanceFromStep = () => {
        if (!activeStep || !pathState) return;
        const idx = data.steps.findIndex((s) => s.id === activeStep.id);
        const response = pathState.responses[activeStep.id];
        const score = response?.score;

        // Adaptive branching
        if (score !== undefined && activeStep.branches) {
            if (score >= 0.9 && activeStep.branches.onMastery) {
                handleStartStep(activeStep.branches.onMastery);
                return;
            }
            if (score < 0.6 && activeStep.branches.onStruggle) {
                handleStartStep(activeStep.branches.onStruggle);
                return;
            }
        }

        if (idx >= 0 && idx < data.steps.length - 1) {
            handleStartStep(data.steps[idx + 1].id);
        } else {
            // Siste steg fullført
            profile.finishPath(data.id);
            setView('finished');
        }
    };

    const handleReset = () => {
        if (!confirm('Vil du nullstille fremdriften i denne stien?')) return;
        profile.resetPath(data.id);
        setActiveStepId(data.steps[0].id);
        setView('overview');
        profile.startPath(data.id, data.steps[0].id);
    };

    if (data.steps.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-6">
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-6 text-rose-900">
                    Denne læringsstien har ingen steg ennå.
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 md:px-6">
            {/* Header */}
            <header className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-3">
                        {data.title}
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">{data.description}</p>
                </motion.div>

                {/* Progress bar */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            Fremdrift
                        </span>
                        <span className="text-xs font-mono text-slate-600">
                            {completedCount} / {totalSteps} steg
                        </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Concepts encountered */}
                {pathState && pathState.conceptsEncountered.length > 0 && (
                    <div className="mt-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                            Begreper du har møtt
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {pathState.conceptsEncountered.map((c) => (
                                <span
                                    key={c}
                                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100"
                                >
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            <AnimatePresence mode="wait">
                {view === 'overview' && (
                    <motion.section
                        key="overview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Overview
                            data={data}
                            pathState={pathState}
                            onStartStep={handleStartStep}
                            onReset={handleReset}
                            allCompleted={allCompleted}
                            onShowSynthesis={() => setView('finished')}
                        />
                    </motion.section>
                )}

                {view === 'step' && activeStep && (
                    <motion.section
                        key={'step-' + activeStep.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <FocusStepView
                            step={activeStep}
                            pathId={data.id}
                            stepIndex={data.steps.findIndex((s) => s.id === activeStep.id)}
                            totalSteps={data.steps.length}
                            isAlreadyCompleted={
                                pathState?.completedStepIds.includes(activeStep.id) ?? false
                            }
                            previousResponse={pathState?.responses[activeStep.id]}
                            onComplete={(r) => handleStepComplete(activeStep, r)}
                            onAdvance={handleAdvanceFromStep}
                            onBackToOverview={() => setView('overview')}
                        />
                    </motion.section>
                )}

                {view === 'finished' && (
                    <motion.section
                        key="finished"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <FinishedView
                            data={data}
                            pathState={pathState}
                            onReset={handleReset}
                            onBackToOverview={() => setView('overview')}
                        />
                    </motion.section>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Overview / oversikt over alle steg ---

const Overview: React.FC<{
    data: LearningPathV2Data;
    pathState: ReturnType<typeof useLearningPathProfile.getState>['paths'][string] | undefined;
    onStartStep: (stepId: string) => void;
    onReset: () => void;
    allCompleted: boolean;
    onShowSynthesis: () => void;
}> = ({ data, pathState, onStartStep, onReset, allCompleted, onShowSynthesis }) => {
    const currentStepId = pathState?.currentStepId;
    return (
        <div>
            <div className="space-y-3">
                {data.steps.map((step, idx) => {
                    const isCompleted =
                        pathState?.completedStepIds.includes(step.id) ?? false;
                    const isCurrent = currentStepId === step.id && !isCompleted;
                    const prevStep = idx > 0 ? data.steps[idx - 1] : null;
                    const showPhase = step.phase && step.phase !== prevStep?.phase;

                    return (
                        <React.Fragment key={step.id}>
                            {showPhase && (
                                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 pt-4 pb-1">
                                    {step.phase}
                                </h2>
                            )}
                            <button
                                onClick={() => onStartStep(step.id)}
                                className={`w-full text-left rounded-2xl p-4 md:p-5 border-2 transition-all hover:shadow-md flex items-start gap-4 ${
                                    isCurrent
                                        ? 'bg-indigo-50 border-indigo-400 shadow-sm'
                                        : isCompleted
                                          ? 'bg-emerald-50/50 border-emerald-200'
                                          : 'bg-white border-slate-200 hover:border-indigo-200'
                                }`}
                            >
                                <div
                                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                                        isCompleted
                                            ? 'bg-emerald-500 text-white'
                                            : isCurrent
                                              ? 'bg-indigo-500 text-white'
                                              : 'bg-slate-100 text-slate-400'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        idx + 1
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <StepKindBadge kind={step.kind} />
                                        {isCurrent && (
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
                                                Du er her
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-900">{step.title}</h3>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-2" />
                            </button>
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 justify-between items-center">
                <button
                    onClick={onReset}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 transition"
                >
                    <RotateCcw className="w-4 h-4" />
                    Nullstill fremdrift
                </button>

                {allCompleted && (
                    <button
                        onClick={onShowSynthesis}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition"
                    >
                        <Trophy className="w-5 h-5" />
                        Vis avslutningen
                    </button>
                )}
            </div>
        </div>
    );
};

const StepKindBadge: React.FC<{ kind: StepV2['kind'] }> = ({ kind }) => {
    const map: Record<StepV2['kind'], { label: string; cls: string }> = {
        'read-article': { label: 'Les artikkel', cls: 'bg-indigo-100 text-indigo-700' },
        'interactive': { label: 'Interaktiv', cls: 'bg-amber-100 text-amber-700' },
        'scenario': { label: 'Tidsreise', cls: 'bg-purple-100 text-purple-700' },
        'detective': { label: 'Detektiv', cls: 'bg-slate-200 text-slate-700' },
        'reflection': { label: 'Refleksjon', cls: 'bg-blue-100 text-blue-700' },
        'concept-drill': { label: 'Begreper', cls: 'bg-teal-100 text-teal-700' },
        'mini-quiz': { label: 'Quiz', cls: 'bg-rose-100 text-rose-700' },
        'multiplayer': { label: 'Klasserom', cls: 'bg-pink-100 text-pink-700' },
        'synthesis': { label: 'Syntese', cls: 'bg-orange-100 text-orange-700' },
    };
    const entry = map[kind];
    return (
        <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${entry.cls}`}
        >
            {entry.label}
        </span>
    );
};

// --- Focus step view ---

const FocusStepView: React.FC<{
    step: StepV2;
    pathId: string;
    stepIndex: number;
    totalSteps: number;
    isAlreadyCompleted: boolean;
    previousResponse?: StepResponse;
    onComplete: (response: Omit<StepResponse, 'completedAt'>) => void;
    onAdvance: () => void;
    onBackToOverview: () => void;
}> = ({
    step,
    pathId,
    stepIndex,
    totalSteps,
    isAlreadyCompleted,
    previousResponse,
    onComplete,
    onAdvance,
    onBackToOverview,
}) => {
    // Etter completion vil isAlreadyCompleted forbli false fram til render kjøres på nytt
    // - vi sporer lokal completion-state for å vise "Gå videre"-knappen umiddelbart.
    const [justCompleted, setJustCompleted] = useState(isAlreadyCompleted);

    const handleComplete = (response: Omit<StepResponse, 'completedAt'>) => {
        onComplete(response);
        setJustCompleted(true);
    };

    const renderStep = () => {
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
            // Fase 3 - fallback for nå
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
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
                <button
                    onClick={onBackToOverview}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                    <List className="w-4 h-4" />
                    Tilbake til oversikt
                </button>
                <span className="text-xs font-mono text-slate-500">
                    Steg {stepIndex + 1} av {totalSteps}
                </span>
            </div>

            {/* Intro narrative */}
            {step.intro && (
                <div className="mb-6 prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed text-lg">{step.intro}</p>
                </div>
            )}

            {/* The active interactive content */}
            {renderStep()}

            {/* Advance footer */}
            {justCompleted && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex justify-end"
                >
                    <button
                        onClick={onAdvance}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition"
                    >
                        {stepIndex < totalSteps - 1 ? 'Neste steg' : 'Fullfør stien'}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            )}
        </div>
    );
};

// --- Finished view ---

const FinishedView: React.FC<{
    data: LearningPathV2Data;
    pathState: ReturnType<typeof useLearningPathProfile.getState>['paths'][string] | undefined;
    onReset: () => void;
    onBackToOverview: () => void;
}> = ({ data, pathState, onReset, onBackToOverview }) => {
    const masteryScore = useLearningPathProfile((s) => s.getMasteryScore(data.id));
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
        <div>
            <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 md:p-12 border-2 border-indigo-200 shadow-xl text-center mb-8"
            >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-5">
                    <Trophy className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-3">
                    Du har fullført stien!
                </h2>
                <p className="text-slate-700 text-lg max-w-xl mx-auto">
                    {data.synthesis?.intro ??
                        'Du har gått hele veien - fra introduksjon til syntese.'}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full shadow-sm">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-slate-700">
                        Mestringspoeng: {Math.round(masteryScore * 100)}%
                    </span>
                </div>
            </motion.div>

            {/* Concepts mastered */}
            {pathState && pathState.conceptsEncountered.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                    <h3 className="font-bold text-slate-900 mb-3">Begreper du nå behersker</h3>
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

            {/* Dine refleksjoner */}
            {reflections.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                    <h3 className="font-bold text-slate-900 mb-4">Dine refleksjoner</h3>
                    <div className="space-y-4">
                        {reflections.map((r) => (
                            <div key={r.stepId} className="border-l-4 border-blue-300 pl-4 py-1">
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

            {/* Next actions */}
            <div className="flex flex-wrap gap-3 justify-center mt-8">
                <button
                    onClick={onBackToOverview}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Tilbake til oversikt
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
    );
};
