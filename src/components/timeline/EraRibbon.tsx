import React, { useMemo } from 'react';
import { ERAS, formatEraRange, type Era } from '../../data/timelineEras';
import type { GlobalTimelineEvent } from '../../types';

interface EraRibbonProps {
    events: GlobalTimelineEvent[];
    activeEraId: string | null;
    onEraClick: (era: Era) => void;
    className?: string;
}

interface EraStat {
    era: Era;
    count: number;
}

export const EraRibbon: React.FC<EraRibbonProps> = ({
    events,
    activeEraId,
    onEraClick,
    className = '',
}) => {
    const stats: EraStat[] = useMemo(() => {
        return ERAS.map((era) => ({
            era,
            count: events.filter(
                (e) => e.startDate >= era.startYear && e.startDate <= era.endYear
            ).length,
        }));
    }, [events]);

    const maxCount = useMemo(
        () => stats.reduce((m, s) => Math.max(m, s.count), 0),
        [stats]
    );

    return (
        <div
            className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-3 sm:p-4 ${className}`}
            role="navigation"
            aria-label="Epoker"
        >
            <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Epoker
                </h2>
                <span className="text-xs text-slate-400 hidden sm:inline">
                    Klikk for å hoppe til epoken
                </span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
                {stats.map(({ era, count }) => {
                    const isActive = era.id === activeEraId;
                    const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0;

                    return (
                        <button
                            key={era.id}
                            type="button"
                            onClick={() => onEraClick(era)}
                            className={`group relative flex-shrink-0 snap-start flex flex-col items-stretch w-28 sm:w-32 md:w-36 rounded-xl border-2 transition-all duration-200 text-left overflow-hidden ${
                                isActive
                                    ? `${era.borderClass} ${era.bgClass} shadow-md`
                                    : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'
                            }`}
                            aria-current={isActive ? 'true' : undefined}
                        >
                            <div className="flex items-end h-10 px-2 pt-2 gap-px">
                                <div
                                    className={`flex-1 rounded-t transition-all duration-300 ${era.dotClass} ${
                                        isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'
                                    }`}
                                    style={{ height: `${Math.max(heightPct, 6)}%` }}
                                    aria-hidden="true"
                                />
                            </div>
                            <div className="px-2 pb-2 pt-1">
                                <div
                                    className={`text-xs font-bold leading-tight ${
                                        isActive ? era.textClass : 'text-slate-700'
                                    }`}
                                >
                                    {era.shortLabel}
                                </div>
                                <div className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
                                    {formatEraRange(era)}
                                </div>
                                <div
                                    className={`text-[10px] font-semibold mt-1 ${
                                        isActive ? era.textClass : 'text-slate-500'
                                    }`}
                                >
                                    {count} hendelser
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
