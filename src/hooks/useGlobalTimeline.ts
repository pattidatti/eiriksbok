import { useQuery } from '@tanstack/react-query';
import type { GlobalTimelineEvent } from '../types';

const fetchGlobalTimeline = async (): Promise<GlobalTimelineEvent[]> => {
    const response = await fetch('/content/global-timeline.json');
    if (!response.ok) throw new Error('Failed to load global timeline');

    const data = await response.json();
    let events: GlobalTimelineEvent[] = [];

    if (Array.isArray(data)) {
        events = data;
    } else if (data && typeof data === 'object' && Array.isArray(data.events)) {
        events = data.events;
    }

    return events.sort((a, b) => b.startDate - a.startDate);
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
