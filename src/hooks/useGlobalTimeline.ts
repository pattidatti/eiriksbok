import { useState, useEffect } from 'react';
import type { GlobalTimelineEvent } from '../types';



let cachedEvents: GlobalTimelineEvent[] | null = null;
let isFetching = false;
const fetchPromises: Array<(events: GlobalTimelineEvent[]) => void> = [];

export const useGlobalTimeline = () => {
    const [events, setEvents] = useState<GlobalTimelineEvent[]>(cachedEvents || []);
    const [loading, setLoading] = useState(!cachedEvents);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (cachedEvents) {
            setLoading(false);
            return;
        }

        if (isFetching) {
            fetchPromises.push((data) => {
                setEvents(data);
                setLoading(false);
            });
            return;
        }

        const fetchTimeline = async () => {
            isFetching = true;
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

                cachedEvents = fetchedEvents;
                setEvents(fetchedEvents);

                // Resolve all waiting hooks
                while (fetchPromises.length > 0) {
                    const resolve = fetchPromises.shift();
                    if (resolve) resolve(fetchedEvents);
                }

            } catch (err) {
                console.error('Error loading global timeline:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
                isFetching = false;
            }
        };

        fetchTimeline();
    }, []);

    return { events, loading, error };
};
