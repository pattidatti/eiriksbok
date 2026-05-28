import { useEffect, useState } from 'react';
import { getEraForYear } from '../data/timelineEras';
import type { GlobalTimelineEvent } from '../types';

// Manifestet over event→bilde-koblinger genereres av scripts/generate-timeline-images.mjs.
// Vi laster det én gang på modulnivå (samme livssyklus som useGlobalTimeline) og deler
// promise mellom alle kall slik at vi unngår duplikate requests.
let cache: Record<string, string> | null = null;
let inflight: Promise<Record<string, string>> | null = null;

function loadImageMap(): Promise<Record<string, string>> {
    if (cache) return Promise.resolve(cache);
    if (inflight) return inflight;
    inflight = fetch('/content/global-timeline-images.json')
        .then((r) => (r.ok ? r.json() : {}))
        .then((data) => {
            cache = data && typeof data === 'object' ? (data as Record<string, string>) : {};
            return cache;
        })
        .catch(() => {
            cache = {};
            return cache;
        });
    return inflight;
}

export interface TimelineImageResult {
    src: string | null;
    eraId: string;
    eraColor: string;
}

// Returnerer bilde-src for et event, eller null hvis ingen finnes. Anroperen
// bruker eraColor til å vise en epoke-fargestripe i stedet, slik at kort uten
// bilde fortsatt ser intensjonelle ut (ikke tomme bokser).
export function useTimelineImage(event: GlobalTimelineEvent | null): TimelineImageResult {
    const [map, setMap] = useState<Record<string, string> | null>(cache);

    useEffect(() => {
        if (map !== null) return;
        let cancelled = false;
        loadImageMap().then((data) => {
            if (!cancelled) setMap(data);
        });
        return () => {
            cancelled = true;
        };
    }, [map]);

    if (!event) {
        return { src: null, eraId: 'var-tid', eraColor: '#db2777' };
    }

    const era = getEraForYear(event.startDate);
    const src = map ? (map[event.id] ?? null) : null;
    return { src, eraId: era.id, eraColor: era.color };
}
