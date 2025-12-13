import { useQuery } from '@tanstack/react-query';
import { fetchManifest } from '../utils/contentLoader';
import type { Manifest } from '../types';

export const useManifest = () => {
    return useQuery<Manifest>({
        queryKey: ['manifest'],
        queryFn: async () => {
            const data = await fetchManifest();
            if (!data) throw new Error('Failed to load manifest');
            return data;
        },
        staleTime: 0, // Always fetch fresh data on mount
        gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    });
};
