import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TimelineView } from '../components/TimelineView';
import { useGlobalTimeline } from '../hooks/useGlobalTimeline';
import { EraRibbon } from '../components/timeline/EraRibbon';
import {
    TimelineFilters,
    type TimelineFiltersState,
} from '../components/timeline/TimelineFilters';
import { EmptyState } from '../components/timeline/EmptyState';
import { TimelinePeek } from '../components/timeline/TimelinePeek';
import { getEraForYear, type Era } from '../data/timelineEras';
import type { GlobalTimelineEvent } from '../types';

const DEFAULT_FILTERS: TimelineFiltersState = {
    query: '',
    subjects: [],
    tags: [],
    sort: 'asc',
    showConnections: false,
};

const DEFAULT_ERA_ID = 'var-tid';

const GlobalTimelinePage: React.FC = () => {
    const { events, loading, error } = useGlobalTimeline();
    const [filters, setFilters] = useState<TimelineFiltersState>(DEFAULT_FILTERS);
    const [activeEraId, setActiveEraId] = useState<string | null>(DEFAULT_ERA_ID);
    const [scrollToEraId, setScrollToEraId] = useState<string | null>(null);
    const [scrollToEventId, setScrollToEventId] = useState<string | null>(null);
    const [peekEvent, setPeekEvent] = useState<GlobalTimelineEvent | null>(null);
    const [hasInitialised, setHasInitialised] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const filteredEvents = useMemo(() => {
        const q = filters.query.trim().toLowerCase();
        return events.filter((e) => {
            if (filters.subjects.length > 0 && !filters.subjects.includes(e.subjectId)) {
                return false;
            }
            if (filters.tags.length > 0) {
                if (!e.tags || !filters.tags.every((t) => e.tags!.includes(t))) {
                    return false;
                }
            }
            if (q) {
                const inTitle = e.title?.toLowerCase().includes(q);
                const inDesc = e.description?.toLowerCase().includes(q);
                const inTags = e.tags?.some((t) => t.toLowerCase().includes(q));
                if (!inTitle && !inDesc && !inTags) return false;
            }
            return true;
        });
    }, [events, filters]);

    const sortedEvents = useMemo(() => {
        const copy = [...filteredEvents];
        copy.sort((a, b) =>
            filters.sort === 'asc' ? a.startDate - b.startDate : b.startDate - a.startDate
        );
        return copy;
    }, [filteredEvents, filters.sort]);

    // Initial scroll: respect ?event=, ?era=, otherwise default to vår tid.
    // One-shot init after async data load — eslint-disable for set-state-in-effect is intentional.
    useEffect(() => {
        if (hasInitialised || loading || events.length === 0) return;
        const eventParam = searchParams.get('event');
        const eraParam = searchParams.get('era');
        let nextPeek: GlobalTimelineEvent | null = null;
        let nextScrollEra: string | null = null;
        let nextScrollEvent: string | null = null;
        let nextActiveEra: string = DEFAULT_ERA_ID;
        if (eventParam) {
            const found = events.find((e) => e.id === eventParam);
            if (found) {
                nextPeek = found;
                nextScrollEvent = eventParam;
                nextActiveEra = getEraForYear(found.startDate).id;
            }
        } else if (eraParam) {
            nextScrollEra = eraParam;
            nextActiveEra = eraParam;
        } else {
            nextScrollEra = DEFAULT_ERA_ID;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPeekEvent(nextPeek);
        setScrollToEraId(nextScrollEra);
        setScrollToEventId(nextScrollEvent);
        setActiveEraId(nextActiveEra);
        setHasInitialised(true);
    }, [hasInitialised, loading, events, searchParams]);

    const handleEraClick = useCallback((era: Era) => {
        setActiveEraId(era.id);
        setScrollToEraId(era.id);
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.set('era', era.id);
                next.delete('event');
                return next;
            },
            { replace: true }
        );
    }, [setSearchParams]);

    const handleActiveEraChange = useCallback((eraId: string) => {
        setActiveEraId(eraId);
    }, []);

    const handleEventClick = useCallback((event: GlobalTimelineEvent) => {
        setPeekEvent(event);
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.set('event', event.id);
                return next;
            },
            { replace: true }
        );
    }, [setSearchParams]);

    const handlePeekClose = useCallback(() => {
        setPeekEvent(null);
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.delete('event');
                return next;
            },
            { replace: true }
        );
    }, [setSearchParams]);

    const handleResetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
    }, []);

    const handleTagFromPeek = useCallback((tag: string) => {
        setFilters((prev) =>
            prev.tags.includes(tag)
                ? prev
                : { ...prev, tags: [...prev.tags, tag] }
        );
        handlePeekClose();
    }, [handlePeekClose]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="animate-pulse text-slate-500">Laster tidslinje...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-red-600">Kunne ikke laste tidslinje.</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            <header className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                    Tidslinje
                </h1>
                <p className="text-base md:text-lg text-slate-600 max-w-2xl">
                    Utforsk historien på tvers av fag. Klikk på en epoke for å hoppe,
                    eller bruk søket og filtrene for å finne en spesifikk hendelse.
                </p>
            </header>

            <div className="sticky top-0 z-30 -mx-4 px-4 pt-2 pb-3 bg-gradient-to-b from-slate-50 via-slate-50/95 to-transparent space-y-3">
                <EraRibbon
                    events={events}
                    activeEraId={activeEraId}
                    onEraClick={handleEraClick}
                />
                <TimelineFilters
                    events={events}
                    state={filters}
                    onChange={setFilters}
                    onReset={handleResetFilters}
                    resultCount={filteredEvents.length}
                    totalCount={events.length}
                />
            </div>

            <div className="mt-6">
                {sortedEvents.length === 0 ? (
                    <EmptyState onReset={handleResetFilters} />
                ) : (
                    <TimelineView
                        events={sortedEvents}
                        sort={filters.sort}
                        onEventClick={handleEventClick}
                        onActiveEraChange={handleActiveEraChange}
                        scrollToEraId={scrollToEraId}
                        scrollToEventId={scrollToEventId}
                        showConnections={filters.showConnections}
                        selectedEventId={peekEvent?.id ?? null}
                    />
                )}
            </div>

            <TimelinePeek
                event={peekEvent}
                onClose={handlePeekClose}
                onTagClick={handleTagFromPeek}
            />
        </div>
    );
};

export default GlobalTimelinePage;
