import { useState, useEffect } from 'react';
import type { GlobalTimelineEvent } from '../types';
import { timelineData } from '../data/timelineData';
import { parseYearRange } from '../utils/dateUtils';

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
                    fetchedEvents = await response.json();
                }

                // 2. Convert manual timelineData to GlobalTimelineEvent format
                const manualEvents: GlobalTimelineEvent[] = timelineData.map(event => {
                    const { start, end } = parseYearRange(event.year);
                    return {
                        id: event.id.toString(),
                        title: event.title,
                        description: event.description,
                        startDate: start,
                        endDate: end === 0 ? null : end,
                        displayDate: event.year,
                        type: 'event', // Manual events are usually historical events
                        subjectId: event.category === 'Norge' ? 'historie' : 'verden', // Rough mapping
                        link: event.url || `/tidslinje/event/${event.id}`, // Prioritize explicit URL (local or external)
                        tags: event.tags
                    };
                });

                // 3. Merge and Deduplicate
                // We prioritize fetched (CMS) events if IDs collide, but manual events likely have different IDs
                const allEvents = [...fetchedEvents, ...manualEvents];

                // Deduplicate by ID
                const uniqueEvents = Array.from(new Map(allEvents.map(item => [item.id, item])).values());

                // 4. Sort
                uniqueEvents.sort((a, b) => b.startDate - a.startDate);

                setEvents(uniqueEvents);
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
