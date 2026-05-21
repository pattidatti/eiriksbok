import type { PresentationData, TimelineConfig } from '../../types';

/**
 * Returns the timeline scale + milestones to use for the top strip.
 *
 * Priority:
 *   1. Explicit config.timeline on the presentation (the curated case).
 *   2. Auto-derive start/end from slides' year/yearRange. No milestones.
 *   3. null if no slide has any year information (timeline strip is hidden).
 *
 * IMPORTANT: There is no hard-coded fallback to any specific era. Every
 * presentation gets a scale matching its own historical period.
 */
export const resolveTimelineConfig = (data: PresentationData): TimelineConfig | null => {
    if (data.config?.timeline) {
        return data.config.timeline;
    }

    const years: number[] = [];
    for (const slide of data.slides) {
        if (slide.year !== undefined) years.push(slide.year);
        if (slide.yearRange) {
            years.push(slide.yearRange[0], slide.yearRange[1]);
        }
    }
    if (years.length === 0) return null;

    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const span = maxYear - minYear;

    // Add ~5% padding on each side so endpoints are not pinned to the edge.
    // For very short spans (under 5 years) we use a fixed 2-year padding.
    const padding = span < 5 ? 2 : Math.max(1, Math.round(span * 0.05));

    return {
        start: minYear - padding,
        end: maxYear + padding,
        milestones: [],
    };
};
