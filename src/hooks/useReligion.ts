import { useQuery } from '@tanstack/react-query';
import { fetchReligion } from '../utils/contentLoader';
import type { Religion } from '../types';

export const useReligion = (id: string) => {
    return useQuery<Religion | null>({
        queryKey: ['religion', id],
        queryFn: () => fetchReligion(id),
        enabled: !!id,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    });
};
