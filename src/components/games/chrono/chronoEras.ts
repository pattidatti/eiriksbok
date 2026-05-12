export type EraKey = 'amber' | 'emerald' | 'rose' | 'indigo';

export interface EraInfo {
    key: EraKey;
    name: string;
    range: string;
    cssVar: string;
}

export const ERA_DEFS: Record<EraKey, EraInfo> = {
    amber: { key: 'amber', name: 'Antikken', range: 'før 500', cssVar: '#f59e0b' },
    emerald: { key: 'emerald', name: 'Middelalderen', range: '500-1500', cssVar: '#10b981' },
    rose: { key: 'rose', name: 'Tidlig moderne', range: '1500-1900', cssVar: '#f43f5e' },
    indigo: { key: 'indigo', name: 'Moderne tid', range: 'etter 1900', cssVar: '#4f46e5' },
};

export function eraForYear(year: number): EraKey {
    if (year < 500) return 'amber';
    if (year < 1500) return 'emerald';
    if (year < 1900) return 'rose';
    return 'indigo';
}

export const ALL_ERAS: EraInfo[] = [ERA_DEFS.amber, ERA_DEFS.emerald, ERA_DEFS.rose, ERA_DEFS.indigo];
