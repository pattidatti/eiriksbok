import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import type { StepV2 } from '../../../types';

interface StepperTopBarProps {
    steps: StepV2[];
    activeStepId: string;
    completedStepIds: string[];
    onSelectStep: (stepId: string) => void;
}

interface PhaseGroup {
    phase: string;
    steps: { step: StepV2; globalIndex: number }[];
}

const groupByPhase = (steps: StepV2[]): PhaseGroup[] => {
    const groups: PhaseGroup[] = [];
    steps.forEach((step, globalIndex) => {
        const phaseLabel = step.phase ?? 'Steg';
        const last = groups[groups.length - 1];
        if (last && last.phase === phaseLabel) {
            last.steps.push({ step, globalIndex });
        } else {
            groups.push({ phase: phaseLabel, steps: [{ step, globalIndex }] });
        }
    });
    return groups;
};

// Trekk ut "Akt N: ..." -> "Akt N" hvis mulig.
const shortPhaseLabel = (phase: string): string => {
    const match = phase.match(/^(Akt\s*\d+)/i);
    if (match) return match[1];
    return phase;
};

const longPhaseLabel = (phase: string): string => {
    const match = phase.match(/^Akt\s*\d+:\s*(.+)$/i);
    return match ? match[1] : phase;
};

export const StepperTopBar: React.FC<StepperTopBarProps> = ({
    steps,
    activeStepId,
    completedStepIds,
    onSelectStep,
}) => {
    const groups = groupByPhase(steps);
    const [hoveredStepId, setHoveredStepId] = useState<string | null>(null);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 px-3 md:px-4 py-3 shadow-sm">
            <div className="flex items-stretch gap-3 md:gap-4 w-full">
                {groups.map((group, gIdx) => {
                    const completedInPhase = group.steps.filter((s) =>
                        completedStepIds.includes(s.step.id)
                    ).length;
                    const phaseHasActive = group.steps.some((s) => s.step.id === activeStepId);

                    return (
                        <div
                            key={group.phase + gIdx}
                            className="flex-1 min-w-0 flex flex-col"
                        >
                            <div className="flex items-baseline justify-between gap-2 mb-1.5 px-0.5">
                                <span
                                    className={`text-[10px] font-bold uppercase tracking-widest truncate ${
                                        phaseHasActive ? 'text-indigo-600' : 'text-slate-400'
                                    }`}
                                    title={longPhaseLabel(group.phase)}
                                >
                                    {shortPhaseLabel(group.phase)}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                                    {completedInPhase}/{group.steps.length}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 md:gap-1.5">
                                {group.steps.map(({ step, globalIndex }) => {
                                    const isCompleted = completedStepIds.includes(step.id);
                                    const isCurrent = step.id === activeStepId;
                                    return (
                                        <StepDot
                                            key={step.id}
                                            index={globalIndex + 1}
                                            title={step.title}
                                            isCompleted={isCompleted}
                                            isCurrent={isCurrent}
                                            isHovered={hoveredStepId === step.id}
                                            onClick={() => onSelectStep(step.id)}
                                            onHoverStart={() => setHoveredStepId(step.id)}
                                            onHoverEnd={() =>
                                                setHoveredStepId((prev) =>
                                                    prev === step.id ? null : prev
                                                )
                                            }
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tooltip — viser hover/aktiv-stegs tittel under stepperen */}
            <AnimatePresence mode="wait">
                {(hoveredStepId || activeStepId) && (
                    <ActiveStepLabel
                        key={hoveredStepId ?? activeStepId}
                        title={
                            steps.find((s) => s.id === (hoveredStepId ?? activeStepId))?.title ?? ''
                        }
                        index={
                            steps.findIndex((s) => s.id === (hoveredStepId ?? activeStepId)) + 1
                        }
                        total={steps.length}
                        isHover={!!hoveredStepId && hoveredStepId !== activeStepId}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

interface StepDotProps {
    index: number;
    title: string;
    isCompleted: boolean;
    isCurrent: boolean;
    isHovered: boolean;
    onClick: () => void;
    onHoverStart: () => void;
    onHoverEnd: () => void;
}

const StepDot: React.FC<StepDotProps> = ({
    index,
    title,
    isCompleted,
    isCurrent,
    isHovered,
    onClick,
    onHoverStart,
    onHoverEnd,
}) => {
    const baseHeight = 'h-2.5';
    const cls = isCurrent
        ? 'bg-indigo-600 ring-2 ring-indigo-200'
        : isCompleted
          ? 'bg-emerald-500 hover:bg-emerald-600'
          : 'bg-slate-200 hover:bg-slate-300';

    return (
        <motion.button
            type="button"
            onClick={onClick}
            onHoverStart={onHoverStart}
            onHoverEnd={onHoverEnd}
            onFocus={onHoverStart}
            onBlur={onHoverEnd}
            title={`Steg ${index}: ${title}`}
            aria-label={`Steg ${index}: ${title}`}
            whileTap={{ scaleY: 0.7 }}
            className={`relative flex-1 ${baseHeight} rounded-full transition-colors ${cls}`}
        >
            {isCurrent && (
                <span
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 h-3 -mt-px rounded-full bg-indigo-600 ring-2 ring-indigo-200 animate-pulse"
                    style={{ top: '-1px' }}
                    aria-hidden
                />
            )}
            {isCompleted && !isCurrent && isHovered && (
                <Check className="absolute inset-0 m-auto w-2.5 h-2.5 text-white" aria-hidden />
            )}
        </motion.button>
    );
};

const ActiveStepLabel: React.FC<{
    title: string;
    index: number;
    total: number;
    isHover: boolean;
}> = ({ title, index, total, isHover }) => (
    <motion.div
        initial={{ opacity: 0, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-xs"
    >
        <span className="font-mono text-slate-400 flex-shrink-0">
            {index}/{total}
        </span>
        <span
            className={`truncate ${
                isHover ? 'text-slate-500 italic' : 'text-slate-700 font-semibold'
            }`}
        >
            {title}
        </span>
    </motion.div>
);
