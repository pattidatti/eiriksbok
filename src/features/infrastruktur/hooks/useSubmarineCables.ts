import { useQuery } from '@tanstack/react-query';
import type { SubmarineCable } from '../types';
import { fallbackCables } from '../data/submarineCables';

interface ApiCablePoint {
    coordinates: { latitude: number; longitude: number };
}

interface ApiCable {
    id: string;
    name: string;
    color?: string;
    owners?: string[];
    cable_points?: ApiCablePoint[];
}

const CABLE_API = 'https://www.submarinecablemap.com/api/v3/cable/all.json';

async function fetchCables(): Promise<SubmarineCable[]> {
    const res = await fetch(CABLE_API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiCable[] = await res.json();

    return data
        .filter((c) => c.cable_points && c.cable_points.length >= 2)
        .map((c) => ({
            id: c.id,
            name: c.name,
            color: c.color,
            owners: c.owners,
            coordinates: (c.cable_points ?? []).map(
                (p) => [p.coordinates.longitude, p.coordinates.latitude] as [number, number]
            ),
        }));
}

export function useSubmarineCables() {
    return useQuery<SubmarineCable[]>({
        queryKey: ['submarine-cables'],
        queryFn: fetchCables,
        staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
        retry: 1,
        placeholderData: fallbackCables,
    });
}
