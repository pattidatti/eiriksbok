export interface EraMilestone {
    year: number;
    label: string;
    kind: 'major' | 'minor';
}

export const ROMAN_ERA_START = -753;
export const ROMAN_ERA_END = 476;

export const ROMAN_MILESTONES: EraMilestone[] = [
    { year: -753, label: 'Roma grunnlegges', kind: 'major' },
    { year: -509, label: 'Republikken', kind: 'major' },
    { year: -27, label: 'Augustus', kind: 'major' },
    { year: 79, label: 'Pompeii', kind: 'minor' },
    { year: 117, label: 'Største utstrekning', kind: 'minor' },
    { year: 313, label: 'Milano-ediktet', kind: 'major' },
    { year: 476, label: 'Vestrikets fall', kind: 'major' },
];

export const formatYearLabel = (year: number): string => {
    if (year < 0) return `${Math.abs(year)} f.Kr`;
    return `${year} e.Kr`;
};

export const formatYearRangeLabel = (range: [number, number]): string => {
    return `${formatYearLabel(range[0])} - ${formatYearLabel(range[1])}`;
};
