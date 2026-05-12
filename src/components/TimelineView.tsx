import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ERAS, getEraForYear, formatEraRange, type Era } from '../data/timelineEras';
import { getSubjectColor } from '../utils/subjectColors';
import { ConnectionLines } from './timeline/ConnectionLines';
import type { GlobalTimelineEvent } from '../types';
import type { SortOrder } from './timeline/TimelineFilters';

interface TimelineViewProps {
    events: GlobalTimelineEvent[];
    sort: SortOrder;
    onEventClick: (event: GlobalTimelineEvent) => void;
    onActiveEraChange?: (eraId: string) => void;
    scrollToEraId?: string | null;
    scrollToEventId?: string | null;
    showConnections?: boolean;
    selectedEventId?: string | null;
    className?: string;
}

interface EraGroup {
    era: Era;
    events: GlobalTimelineEvent[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({
    events,
    sort,
    onEventClick,
    onActiveEraChange,
    scrollToEraId,
    scrollToEventId,
    showConnections = false,
    selectedEventId = null,
    className = '',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const eraRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const eventRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    const groups: EraGroup[] = useMemo(() => {
        const buckets = new Map<string, GlobalTimelineEvent[]>();
        for (const event of events) {
            const era = getEraForYear(event.startDate);
            const list = buckets.get(era.id) ?? [];
            list.push(event);
            buckets.set(era.id, list);
        }
        const ordered = sort === 'asc' ? ERAS : [...ERAS].reverse();
        return ordered
            .map((era) => ({ era, events: buckets.get(era.id) ?? [] }))
            .filter((g) => g.events.length > 0);
    }, [events, sort]);

    // Scroll to era when scrollToEraId changes
    useEffect(() => {
        if (!scrollToEraId) return;
        const el = eraRefs.current.get(scrollToEraId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [scrollToEraId]);

    // Scroll to event when scrollToEventId changes
    useEffect(() => {
        if (!scrollToEventId) return;
        const el = eventRefs.current.get(scrollToEventId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [scrollToEventId]);

    // Observe era headers to update active era
    useEffect(() => {
        if (!onActiveEraChange) return;
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) {
                    const eraId = visible[0].target.getAttribute('data-era-id');
                    if (eraId) onActiveEraChange(eraId);
                }
            },
            { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
        );
        eraRefs.current.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [onActiveEraChange, groups]);

    const setEraRef = useCallback((eraId: string, el: HTMLDivElement | null) => {
        if (el) eraRefs.current.set(eraId, el);
        else eraRefs.current.delete(eraId);
    }, []);

    const setEventRef = useCallback((eventId: string, el: HTMLDivElement | null) => {
        if (el) eventRefs.current.set(eventId, el);
        else eventRefs.current.delete(eventId);
    }, []);

    const getEventEl = useCallback(
        (eventId: string) => eventRefs.current.get(eventId) ?? null,
        []
    );

    if (events.length === 0) return null;

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative max-w-6xl mx-auto w-full px-4">
                {/* Center axis */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2 md:transform pointer-events-none" />

                {groups.map((group, gIdx) => (
                    <section
                        key={group.era.id}
                        aria-labelledby={`era-${group.era.id}-heading`}
                    >
                        <div
                            ref={(el) => setEraRef(group.era.id, el)}
                            data-era-id={group.era.id}
                            className="sticky top-2 z-20 -mx-4 px-4 py-2 mb-4"
                            style={{ marginTop: gIdx === 0 ? 0 : '2rem' }}
                        >
                            <div
                                className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border-2 shadow-md backdrop-blur ${group.era.bgClass} ${group.era.borderClass}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${group.era.dotClass}`} />
                                <h2
                                    id={`era-${group.era.id}-heading`}
                                    className={`text-base font-bold ${group.era.textClass}`}
                                >
                                    {group.era.label}
                                </h2>
                                <span className="text-xs text-slate-500 hidden sm:inline">
                                    {formatEraRange(group.era)}
                                </span>
                                <span
                                    className={`text-xs font-semibold ${group.era.textClass} bg-white/60 rounded-full px-2 py-0.5`}
                                >
                                    {group.events.length}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {group.events.map((event, index) => (
                                <TimelineEventRow
                                    key={`${event.id}-${index}`}
                                    event={event}
                                    index={index}
                                    isSelected={selectedEventId === event.id}
                                    onClick={() => onEventClick(event)}
                                    setRef={setEventRef}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <ConnectionLines
                events={events}
                containerRef={containerRef}
                getEventEl={getEventEl}
                enabled={showConnections}
                yearWindow={15}
            />
        </div>
    );
};

interface TimelineEventRowProps {
    event: GlobalTimelineEvent;
    index: number;
    isSelected: boolean;
    onClick: () => void;
    setRef: (id: string, el: HTMLDivElement | null) => void;
}

const TimelineEventRow: React.FC<TimelineEventRowProps> = ({
    event,
    index,
    isSelected,
    onClick,
    setRef,
}) => {
    const isLeft = index % 2 === 0;
    const color = getSubjectColor(event.subjectId);

    return (
        <motion.div
            ref={(el) => setRef(event.id, el)}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: (index % 5) * 0.05 }}
            className={`relative flex items-center md:justify-between ${
                isLeft ? 'md:flex-row-reverse' : ''
            }`}
        >
            <div className="hidden md:block w-5/12" />

            {/* Center marker */}
            <div className="absolute left-4 md:left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                <div
                    className={`w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all duration-200 ${color.dot} ${
                        isSelected ? 'w-4 h-4 ring-2 ring-indigo-200' : ''
                    }`}
                />
                <div
                    className={`mt-1 bg-white px-2 py-0.5 rounded-md border shadow-sm text-xs font-bold whitespace-nowrap transition-colors duration-200 ${
                        isSelected
                            ? 'border-indigo-300 text-indigo-700'
                            : 'border-slate-100 text-slate-500'
                    }`}
                >
                    {event.displayDate}
                </div>
            </div>

            {/* Content card */}
            <div
                className={`w-full md:w-5/12 pl-12 md:pl-0 ${
                    isLeft ? 'md:pr-16 md:text-right' : 'md:pl-16'
                }`}
            >
                <button
                    type="button"
                    onClick={onClick}
                    className="block w-full text-left group relative"
                    aria-pressed={isSelected}
                >
                    {/* Connector */}
                    <div
                        className={`hidden md:block absolute top-1/2 -translate-y-1/2 h-px w-16 transition-colors ${
                            isSelected ? 'bg-indigo-300' : 'bg-slate-200'
                        } ${isLeft ? '-right-16' : '-left-16'}`}
                    />
                    <div
                        className={`md:hidden absolute left-4 top-1/2 -translate-y-1/2 w-8 h-px transition-colors ${
                            isSelected ? 'bg-indigo-300' : 'bg-slate-200'
                        }`}
                    />

                    <div
                        className={`p-4 rounded-xl border shadow-sm transition-all duration-200 bg-white ${
                            isSelected
                                ? 'border-indigo-300 shadow-md ring-1 ring-indigo-100'
                                : 'border-slate-100 group-hover:border-indigo-200 group-hover:shadow-md'
                        }`}
                    >
                        <div className={`flex flex-col ${isLeft ? 'md:items-end' : ''}`}>
                            <h3
                                className={`text-base font-bold mb-1 transition-colors ${
                                    isSelected ? 'text-indigo-700' : 'text-slate-800 group-hover:text-indigo-700'
                                }`}
                            >
                                {event.title}
                            </h3>

                            {event.description && (
                                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-2">
                                    {event.description}
                                </p>
                            )}

                            <div
                                className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${color.text} ${
                                    isLeft ? 'md:flex-row-reverse' : ''
                                }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                                {color.label}
                            </div>
                        </div>
                    </div>
                </button>
            </div>
        </motion.div>
    );
};
