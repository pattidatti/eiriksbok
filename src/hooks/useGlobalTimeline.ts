import { useState, useEffect } from 'react';
import type { GlobalTimelineEvent } from '../types';



export const useGlobalTimeline = () => {
    const [events, setEvents] = useState<GlobalTimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                // 1. Fetch CMS/Global events
                const response = await fetch(`${window.location.origin}/content/global-timeline.json?t=${new Date().getTime()}`);
                let fetchedEvents: GlobalTimelineEvent[] = [];

                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        fetchedEvents = data;
                    } else if (data && typeof data === 'object' && Array.isArray(data.events)) {
                        fetchedEvents = data.events;
                    }
                }

                // Sort
                fetchedEvents.sort((a, b) => b.startDate - a.startDate);

                setEvents(fetchedEvents);


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
