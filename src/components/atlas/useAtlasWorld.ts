import { useQuery } from '@tanstack/react-query';
import * as topojson from 'topojson-client';

// Verdensgeometrien lastes LOKALT (public/data/world/) — aldri fra CDN. På Chromebook
// i klasserom med ustabilt nett ville en CDN-henting gitt blank skjerm.
const WORLD_URL = '/data/world/countries-110m.json';

async function fetchWorld() {
    const res = await fetch(WORLD_URL);
    if (!res.ok) throw new Error('Kunne ikke laste verdenskart-geometri');
    const world = await res.json();
    const countries = topojson.feature(world, world.objects.countries);
    return (countries as unknown as { features: GeoFeature[] }).features;
}

export interface GeoFeature {
    id?: string | number;
    properties: { name?: string };
    type: string;
    geometry: unknown;
}

export function useAtlasWorld() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['atlas-world'],
        queryFn: fetchWorld,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60 * 24,
    });
    return { geographies: data ?? [], loading: isLoading, error };
}
