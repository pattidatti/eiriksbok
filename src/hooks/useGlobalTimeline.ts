import { useQuery } from '@tanstack/react-query';
import type { GlobalTimelineEvent } from '../types';

const fetchGlobalTimeline = async (): Promise<GlobalTimelineEvent[]> => {
    const response = await fetch('/content/global-timeline.json');
    if (!response.ok) throw new Error('Failed to load global timeline');

    const data = await response.json();
    let raw: GlobalTimelineEvent[] = [];

    if (Array.isArray(data)) {
        raw = data;
    } else if (data && typeof data === 'object' && Array.isArray(data.events)) {
        raw = data.events;
    }

    const seen = new Map<string, GlobalTimelineEvent>();
    const skipped: string[] = [];
    for (const event of raw) {
        if (!event.subjectId || typeof event.startDate !== 'number') {
            skipped.push(event.id ?? event.title ?? '(uten id)');
            continue;
        }
        if (!seen.has(event.id)) {
            seen.set(event.id, event);
        }
    }

    if (skipped.length > 0 && typeof console !== 'undefined') {
        console.warn(
            `[timeline] Hoppet over ${skipped.length} ugyldige events (mangler subjectId eller startDate):`,
            skipped
        );
    }

    return Array.from(seen.values()).sort((a, b) => a.startDate - b.startDate);
};

export const useGlobalTimeline = () => {
    const { data, isLoading, error } = useQuery<GlobalTimelineEvent[]>({
        queryKey: ['global-timeline'],
        queryFn: fetchGlobalTimeline,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60 * 24,
    });

    return {
        events: data ?? [],
        loading: isLoading,
        error: error instanceof Error ? error : error ? new Error('Unknown error') : null,
    };
};
