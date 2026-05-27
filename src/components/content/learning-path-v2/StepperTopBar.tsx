import React from 'react';
import { motion } from 'framer-motion';
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

// Konsis fasevisning: trekk ut "Akt N: ..." -> "Akt N" hvis mulig, ellers behold.
const shortPhaseLabel = (phase: string): string => {
    const match = phase.match(/^(Akt\s*\d+)/i);
    if (match) return match[1];
    if (phase.length > 14) return phase.slice(0, 14) + '…';
    return phase;
};

export const StepperTopBar: React.FC<StepperTopBarProps> = ({
    steps,
    activeStepId,
    completedStepIds,
    onSelectStep,
}) => {
    const groups = groupByPhase(steps);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 px-3 md:px-5 py-3 md:py-4 shadow-sm overflow-x-auto">
            <div className="flex items-stretch gap-2 md:gap-3 min-w-max">
                {groups.map((group, gIdx) => (
                    <React.Fragment key={group.phase + gIdx}>
                        {gIdx > 0 && (
                            <div className="w-px self-stretch bg-slate-200 mx-1 md:mx-2" aria-hidden />
                        )}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 pl-1">
                                {shortPhaseLabel(group.phase)}
                            </span>
                            <div className="flex items-center gap-1.5 md:gap-2">
                                {group.steps.map(({ step, globalIndex }, localIdx) => {
                                    const isCompleted = completedStepIds.includes(step.id);
                                    const isCurrent = step.id === activeStepId;
                                    const isLastInGroup = localIdx === group.steps.length - 1;
                                    return (
                                        <React.Fragment key={step.id}>
                                            <StepNode
                                                index={globalIndex + 1}
                                                title={step.title}
                                                isCompleted={isCompleted}
                                                isCurrent={isCurrent}
                                                onClick={() => onSelectStep(step.id)}
                                            />
                                            {!isLastInGroup && (
                                                <div
                                                    className={`h-0.5 w-3 md:w-5 rounded transition-colors ${
                                                        isCompleted ? 'bg-emerald-300' : 'bg-slate-200'
                                                    }`}
                                                    aria-hidden
                                                />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

interface StepNodeProps {
    index: number;
    title: string;
    isCompleted: boolean;
    isCurrent: boolean;
    onClick: () => void;
}

const StepNode: React.FC<StepNodeProps> = ({ index, title, isCompleted, isCurrent, onClick }) => {
    let cls =
        'relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl font-bold text-sm transition-all border-2 ';
    if (isCurrent) {
        cls += 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 scale-110';
    } else if (isCompleted) {
        cls += 'bg-emerald-500 text-white border-emerald-500 hover:scale-105';
    } else {
        cls += 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:scale-105';
    }

    return (
        <motion.button
            type="button"
            onClick={onClick}
            className={cls}
            title={`Steg ${index}: ${title}`}
            whileTap={{ scale: 0.95 }}
        >
            {isCompleted && !isCurrent ? <Check className="w-4 h-4" /> : index}
            {isCurrent && (
                <span
                    className="absolute inset-0 rounded-xl ring-2 ring-indigo-300 animate-pulse pointer-events-none"
                    aria-hidden
                />
            )}
        </motion.button>
    );
};
