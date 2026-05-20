import React from 'react';
import { motion } from 'framer-motion';
import {
    ROMAN_ERA_START,
    ROMAN_ERA_END,
    ROMAN_MILESTONES,
    type EraMilestone,
    formatYearLabel,
} from './romanTimelineMilestones';

interface SlideEraTimelineProps {
    year?: number;
    yearRange?: [number, number];
    start?: number;
    end?: number;
    milestones?: EraMilestone[];
    variant?: 'projector' | 'controller';
}

const positionFor = (value: number, start: number, end: number): number => {
    const span = end - start;
    if (span <= 0) return 0;
    const pct = ((value - start) / span) * 100;
    return Math.max(0, Math.min(100, pct));
};

export const SlideEraTimeline: React.FC<SlideEraTimelineProps> = ({
    year,
    yearRange,
    start = ROMAN_ERA_START,
    end = ROMAN_ERA_END,
    milestones = ROMAN_MILESTONES,
    variant = 'projector',
}) => {
    const hasAnchor = year !== undefined || yearRange !== undefined;
    if (!hasAnchor) return null;

    const isProjector = variant === 'projector';
    const trackBg = isProjector ? 'bg-white/10' : 'bg-white/15';
    const milestoneMajor = isProjector ? 'bg-indigo-300/80' : 'bg-indigo-300';
    const milestoneMinor = isProjector ? 'bg-white/40' : 'bg-white/50';
    const labelColor = isProjector ? 'text-white/70' : 'text-slate-200';
    const activeColor = isProjector ? 'bg-amber-300' : 'bg-amber-400';
    const activeRingColor = isProjector ? 'ring-amber-300/40' : 'ring-amber-400/30';

    const activeLabel =
        yearRange
            ? `${formatYearLabel(yearRange[0])} - ${formatYearLabel(yearRange[1])}`
            : year !== undefined
                ? formatYearLabel(year)
                : '';

    const rangeStart = yearRange ? positionFor(yearRange[0], start, end) : null;
    const rangeEnd = yearRange ? positionFor(yearRange[1], start, end) : null;
    const pointPos = year !== undefined ? positionFor(year, start, end) : null;

    return (
        <div className={`w-full ${isProjector ? 'py-4 px-12' : 'py-3 px-6'} select-none`}>
            <div className="relative">
                <div className={`relative h-1 rounded-full ${trackBg}`}>
                    {/* Range span */}
                    {rangeStart !== null && rangeEnd !== null && (
                        <motion.div
                            initial={false}
                            animate={{ left: `${rangeStart}%`, width: `${rangeEnd - rangeStart}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className={`absolute top-0 bottom-0 ${activeColor} rounded-full opacity-60`}
                        />
                    )}

                    {/* Milestone markers */}
                    {milestones.map((m) => {
                        const pos = positionFor(m.year, start, end);
                        const isMajor = m.kind === 'major';
                        const heightCls = isMajor ? '-top-1.5 h-4' : '-top-1 h-3';
                        const colorCls = isMajor ? milestoneMajor : milestoneMinor;
                        return (
                            <div
                                key={`${m.year}-${m.label}`}
                                className="absolute"
                                style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                            >
                                <div className={`w-0.5 ${heightCls} ${colorCls} rounded-full`} />
                            </div>
                        );
                    })}

                    {/* Active point */}
                    {pointPos !== null && (
                        <motion.div
                            initial={false}
                            animate={{ left: `${pointPos}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute -top-1.5"
                            style={{ transform: 'translateX(-50%)' }}
                        >
                            <div className={`w-4 h-4 rounded-full ${activeColor} ring-4 ${activeRingColor} shadow-lg`} />
                        </motion.div>
                    )}
                </div>

                {/* Milestone labels (under track) */}
                <div className="relative mt-3 h-4">
                    {milestones.map((m) => {
                        const pos = positionFor(m.year, start, end);
                        const isMajor = m.kind === 'major';
                        return (
                            <div
                                key={`label-${m.year}`}
                                className="absolute"
                                style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                            >
                                <span className={`text-[10px] font-bold tracking-wide whitespace-nowrap ${labelColor} ${isMajor ? '' : 'opacity-70'}`}>
                                    {formatYearLabel(m.year)}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Active year label (floating above track) */}
                {activeLabel && (
                    <motion.div
                        initial={false}
                        animate={{
                            left: yearRange
                                ? `${(rangeStart! + rangeEnd!) / 2}%`
                                : `${pointPos!}%`,
                        }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute -top-6"
                        style={{ transform: 'translateX(-50%)' }}
                    >
                        <span className={`text-xs font-bold ${isProjector ? 'text-amber-300' : 'text-amber-400'} bg-slate-900/60 px-2 py-0.5 rounded-full whitespace-nowrap`}>
                            {activeLabel}
                        </span>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
