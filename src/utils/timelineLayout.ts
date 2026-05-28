import { ERAS, type Era } from '../data/timelineEras';

// Hver epoke får en fast pikselbredde slik at moderne tid får sammenlignbar
// visuell plass som forhistorie. Dette er bevisst lineært innen hver epoke,
// med "komprimerings-soner" mellom epoker — ikke logaritmisk (forvirrer 14-åringer).
const ERA_WIDTHS: Record<string, number> = {
    forhistorie: 2200,
    oldtid: 1600,
    antikken: 2000,
    middelalder: 2200,
    'tidlig-moderne': 1600,
    opplysning: 2200,
    '1900-tallet': 2600,
    'var-tid': 1600,
};

export interface EraBound {
    era: Era;
    xStart: number;
    xEnd: number;
}

export const ERA_BOUNDS: EraBound[] = (() => {
    let x = 0;
    return ERAS.map((era) => {
        const width = ERA_WIDTHS[era.id] ?? 1500;
        const bound: EraBound = { era, xStart: x, xEnd: x + width };
        x += width;
        return bound;
    });
})();

export const TOTAL_WIDTH = ERA_BOUNDS[ERA_BOUNDS.length - 1].xEnd;

// Lineær mapping innen den epoken året tilhører. Bruker getEraForYear-aktig logikk
// inline siden vi allerede har ERA_BOUNDS sortert.
export function yearToX(year: number): number {
    for (const bound of ERA_BOUNDS) {
        if (year >= bound.era.startYear && year <= bound.era.endYear) {
            const eraSpan = bound.era.endYear - bound.era.startYear || 1;
            const eraWidth = bound.xEnd - bound.xStart;
            const ratio = (year - bound.era.startYear) / eraSpan;
            return bound.xStart + ratio * eraWidth;
        }
    }
    // Utenfor — klamp til endene
    if (year < ERA_BOUNDS[0].era.startYear) return 0;
    return TOTAL_WIDTH;
}

export function xToYear(x: number): number {
    for (const bound of ERA_BOUNDS) {
        if (x >= bound.xStart && x <= bound.xEnd) {
            const eraSpan = bound.era.endYear - bound.era.startYear || 1;
            const eraWidth = bound.xEnd - bound.xStart;
            const ratio = (x - bound.xStart) / eraWidth;
            return Math.round(bound.era.startYear + ratio * eraSpan);
        }
    }
    if (x < 0) return ERA_BOUNDS[0].era.startYear;
    return ERA_BOUNDS[ERA_BOUNDS.length - 1].era.endYear;
}

// Genererer årstall-landemerker per epoke. Tetthet tilpasses epokens span:
// forhistorie får én per 25 000 år, vår tid én per 5 år.
export interface YearLandmark {
    year: number;
    x: number;
    isMajor: boolean; // For større tekst/vekt
}

const TICK_INTERVALS: Record<string, { major: number; minor: number }> = {
    forhistorie: { major: 50000, minor: 25000 },
    oldtid: { major: 1000, minor: 500 },
    antikken: { major: 500, minor: 100 },
    middelalder: { major: 250, minor: 100 },
    'tidlig-moderne': { major: 100, minor: 50 },
    opplysning: { major: 50, minor: 25 },
    '1900-tallet': { major: 25, minor: 10 },
    'var-tid': { major: 10, minor: 5 },
};

export function getYearLandmarks(): YearLandmark[] {
    const marks: YearLandmark[] = [];
    for (const bound of ERA_BOUNDS) {
        const intervals = TICK_INTERVALS[bound.era.id] ?? { major: 100, minor: 50 };
        const start =
            Math.ceil(bound.era.startYear / intervals.minor) * intervals.minor;
        for (let y = start; y <= bound.era.endYear; y += intervals.minor) {
            marks.push({
                year: y,
                x: yearToX(y),
                isMajor: y % intervals.major === 0,
            });
        }
    }
    return marks;
}

export function formatYear(year: number): string {
    if (year < 0) {
        const abs = Math.abs(year);
        if (abs >= 10000) return `${(abs / 1000).toFixed(0)}k fvt`;
        return `${abs} fvt`;
    }
    if (year === 0) return '0';
    return String(year);
}
