import { useState, useEffect } from 'react';
import type { GlobalTimelineEvent } from '../types';

export const useGlobalTimeline = () => {
    const [events, setEvents] = useState<GlobalTimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const response = await fetch(`/content/global-timeline.json?t=${new Date().getTime()}`);
                if (!response.ok) {
                    throw new Error('Failed to load timeline data');
                }
                const data = await response.json();
                setEvents(data);
            } catch (err) {
                console.error('Error loading global timeline:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        };

        fetchTimeline();
    }, []);

    return { events, loading, error };
};
