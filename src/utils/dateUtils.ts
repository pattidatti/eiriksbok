
// Helper to parse year strings like "1918–1939", "1885", "550 fvt", "-500-476"
export const parseYearRange = (yearStr: string): { start: number, end: number } => {
    if (!yearStr) return { start: 0, end: 0 };

    // Remove "ca." and spaces
    const cleanStr = yearStr.replace(/ca\.?/i, '').replace(/\s+/g, '');

    // Check for "fvt." (BC)
    const isBC = cleanStr.toLowerCase().includes('fvt');
    const multiplier = isBC ? -1 : 1;

    // Remove text suffix
    const numStr = cleanStr.replace(/fvt\.?|evt\.?/i, '');

    // Handle ranges "1400-1500"
    if (numStr.includes('–') || numStr.includes('-')) {
        const parts = numStr.split(/[–-]/);
        if (parts.length === 2) {
            let start = parseInt(parts[0]);
            let end = parseInt(parts[1]);

            if (isNaN(start)) start = 0;
            if (isNaN(end)) end = 0;

            // If BC, the larger number is actually smaller (older), but usually written "12000-4000 fvt"
            // So 12000 BC is start (-12000), 4000 BC is end (-4000)
            if (isBC) {
                return { start: start * multiplier, end: end * multiplier };
            }
            return { start, end };
        }
    }

    // Single year
    const year = parseInt(numStr);
    if (isNaN(year)) return { start: 0, end: 0 };
    return { start: year * multiplier, end: year * multiplier };
};
