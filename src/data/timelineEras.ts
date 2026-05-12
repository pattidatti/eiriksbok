export interface Era {
    id: string;
    label: string;
    shortLabel: string;
    startYear: number;
    endYear: number;
    color: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    dotClass: string;
}

export const ERAS: Era[] = [
    {
        id: 'forhistorie',
        label: 'Forhistorie',
        shortLabel: 'Forhistorie',
        startYear: -200000,
        endYear: -3001,
        color: '#a16207',
        bgClass: 'bg-stone-100',
        borderClass: 'border-stone-300',
        textClass: 'text-stone-700',
        dotClass: 'bg-stone-500',
    },
    {
        id: 'oldtid',
        label: 'Oldtidens kulturer',
        shortLabel: 'Oldtid',
        startYear: -3000,
        endYear: -501,
        color: '#b45309',
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-300',
        textClass: 'text-amber-800',
        dotClass: 'bg-amber-600',
    },
    {
        id: 'antikken',
        label: 'Antikken',
        shortLabel: 'Antikken',
        startYear: -500,
        endYear: 499,
        color: '#d97706',
        bgClass: 'bg-amber-100',
        borderClass: 'border-amber-400',
        textClass: 'text-amber-900',
        dotClass: 'bg-amber-500',
    },
    {
        id: 'middelalder',
        label: 'Middelalderen',
        shortLabel: 'Middelalder',
        startYear: 500,
        endYear: 1499,
        color: '#059669',
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-300',
        textClass: 'text-emerald-800',
        dotClass: 'bg-emerald-600',
    },
    {
        id: 'tidlig-moderne',
        label: 'Tidlig moderne tid',
        shortLabel: 'Tidlig moderne',
        startYear: 1500,
        endYear: 1749,
        color: '#0891b2',
        bgClass: 'bg-cyan-50',
        borderClass: 'border-cyan-300',
        textClass: 'text-cyan-800',
        dotClass: 'bg-cyan-600',
    },
    {
        id: 'opplysning',
        label: 'Opplysning og revolusjon',
        shortLabel: 'Opplysning',
        startYear: 1750,
        endYear: 1899,
        color: '#4f46e5',
        bgClass: 'bg-indigo-50',
        borderClass: 'border-indigo-300',
        textClass: 'text-indigo-800',
        dotClass: 'bg-indigo-600',
    },
    {
        id: '1900-tallet',
        label: '1900-tallet',
        shortLabel: '1900-tallet',
        startYear: 1900,
        endYear: 1999,
        color: '#7c3aed',
        bgClass: 'bg-violet-50',
        borderClass: 'border-violet-300',
        textClass: 'text-violet-800',
        dotClass: 'bg-violet-600',
    },
    {
        id: 'var-tid',
        label: 'Vår tid',
        shortLabel: 'Vår tid',
        startYear: 2000,
        endYear: 2100,
        color: '#db2777',
        bgClass: 'bg-pink-50',
        borderClass: 'border-pink-300',
        textClass: 'text-pink-800',
        dotClass: 'bg-pink-600',
    },
];

export function getEraForYear(year: number): Era {
    for (const era of ERAS) {
        if (year >= era.startYear && year <= era.endYear) return era;
    }
    return year < ERAS[0].startYear ? ERAS[0] : ERAS[ERAS.length - 1];
}

export function formatEraRange(era: Era): string {
    const fmt = (y: number) => {
        if (y < 0) return `${Math.abs(y).toLocaleString('no-NB')} fvt`;
        return y.toLocaleString('no-NB');
    };
    return `${fmt(era.startYear)} - ${fmt(era.endYear)}`;
}
