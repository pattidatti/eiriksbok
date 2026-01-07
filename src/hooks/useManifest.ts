import { useQuery } from '@tanstack/react-query';
import { fetchManifest } from '../utils/contentLoader';
import type { Manifest } from '../types';

export const useManifest = () => {
    return useQuery<Manifest>({
        queryKey: ['manifest'],
        queryFn: fetchManifest,
        staleTime: 1000 * 60 * 5, // 5 minutes - Validates frequently enough for daily updates
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    });
};
