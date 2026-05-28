import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, List } from 'lucide-react';
import { TimelineView } from '../components/TimelineView';
import { useGlobalTimeline } from '../hooks/useGlobalTimeline';
import { EraRibbon } from '../components/timeline/EraRibbon';
import {
    TimelineFilters,
    type TimelineFiltersState,
} from '../components/timeline/TimelineFilters';
import { EmptyState } from '../components/timeline/EmptyState';
import { TimelinePeek } from '../components/timeline/TimelinePeek';
import { HorizontalTimelineMode } from '../components/timeline/horizontal/HorizontalTimelineMode';
import { getEraForYear, type Era } from '../data/timelineEras';
import type { GlobalTimelineEvent } from '../types';

type TimelineMode = 'klassisk' | 'magisk';

const DEFAULT_FILTERS: TimelineFiltersState = {
    query: '',
    subjects: [],
    tags: [],
    sort: 'desc',
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
    const mode: TimelineMode = searchParams.get('mode') === 'magisk' ? 'magisk' : 'klassisk';

    const handleModeChange = useCallback(
        (next: TimelineMode) => {
            setSearchParams(
                (prev) => {
                    const params = new URLSearchParams(prev);
                    if (next === 'magisk') params.set('mode', 'magisk');
                    else params.delete('mode');
                    return params;
                },
                { replace: true }
            );
            // Scroll til toppen ved bytte slik at magisk-modus starter ved forhistorie
            if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
        },
        [setSearchParams]
    );

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

    if (mode === 'magisk') {
        return (
            <div className="relative">
                <ModeToggle mode={mode} onChange={handleModeChange} variant="overlay" />
                <HorizontalTimelineMode
                    events={sortedEvents}
                    onEventClick={handleEventClick}
                    selectedEventId={peekEvent?.id ?? null}
                />
                <TimelinePeek
                    event={peekEvent}
                    onClose={handlePeekClose}
                    onTagClick={handleTagFromPeek}
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                        Tidslinje
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 max-w-2xl">
                        Utforsk historien på tvers av fag. Klikk på en epoke for å hoppe,
                        eller bruk søket og filtrene for å finne en spesifikk hendelse.
                    </p>
                </div>
                <ModeToggle mode={mode} onChange={handleModeChange} variant="inline" />
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

interface ModeToggleProps {
    mode: TimelineMode;
    onChange: (next: TimelineMode) => void;
    variant: 'inline' | 'overlay';
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange, variant }) => {
    const baseBtn =
        'flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors rounded-lg';
    const wrapperClass =
        variant === 'overlay'
            ? 'fixed top-20 right-6 z-40 flex gap-1 rounded-xl bg-slate-900/80 p-1 backdrop-blur ring-1 ring-white/10'
            : 'flex gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200';
    const activeClass =
        variant === 'overlay'
            ? 'bg-white text-slate-900'
            : 'bg-white text-slate-900 shadow-sm';
    const inactiveClass =
        variant === 'overlay'
            ? 'text-white/80 hover:text-white'
            : 'text-slate-600 hover:text-slate-900';

    return (
        <div className={wrapperClass} role="tablist" aria-label="Tidslinje-modus">
            <button
                type="button"
                role="tab"
                aria-selected={mode === 'klassisk'}
                onClick={() => onChange('klassisk')}
                className={`${baseBtn} ${mode === 'klassisk' ? activeClass : inactiveClass}`}
            >
                <List size={16} />
                Klassisk
            </button>
            <button
                type="button"
                role="tab"
                aria-selected={mode === 'magisk'}
                onClick={() => onChange('magisk')}
                className={`${baseBtn} ${mode === 'magisk' ? activeClass : inactiveClass}`}
            >
                <Sparkles size={16} />
                Magisk
            </button>
        </div>
    );
};

export default GlobalTimelinePage;
