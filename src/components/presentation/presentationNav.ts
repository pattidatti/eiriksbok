import type { Slide } from '../../types';

/**
 * Shared slide-navigation logic for the presentation system.
 *
 * Both the teacher Controller and the standalone Projector use these helpers so
 * the two views advance identically: staggered point reveals on text slides,
 * single-step jumps everywhere else, and clamped bounds at the ends.
 */

export interface PresentationNavState {
    currentSlideIndex: number;
    currentRevealIndex: number;
    isBlackout: boolean;
}

/**
 * Points on task-pause / interactive / title / quote / summary slides are shown
 * all at once. Only content/discussion/comparison slides reveal point-by-point,
 * so only those advance via reveal index instead of slide-by-slide.
 */
export const slideUsesReveal = (slide: Slide | undefined): slide is Slide =>
    !!slide &&
    (slide.layout === 'content' || slide.layout === 'discussion' || slide.layout === 'comparison') &&
    Array.isArray(slide.points) &&
    slide.points.length > 0;

/** Compute the state patch for advancing one step forward. */
export const computeNext = (prev: PresentationNavState, slides: Slide[]): Partial<PresentationNavState> => {
    const slide = slides[prev.currentSlideIndex];
    if (slideUsesReveal(slide) && prev.currentRevealIndex < slide.points!.length - 1) {
        return { currentRevealIndex: prev.currentRevealIndex + 1 };
    }
    if (prev.currentSlideIndex < slides.length - 1) {
        return { currentSlideIndex: prev.currentSlideIndex + 1, currentRevealIndex: -1 };
    }
    return {};
};

/** Compute the state patch for stepping one step backward. */
export const computePrev = (prev: PresentationNavState, slides: Slide[]): Partial<PresentationNavState> => {
    const slide = slides[prev.currentSlideIndex];
    if (slideUsesReveal(slide) && prev.currentRevealIndex >= 0) {
        return { currentRevealIndex: prev.currentRevealIndex - 1 };
    }
    if (prev.currentSlideIndex > 0) {
        const previousSlide = slides[prev.currentSlideIndex - 1];
        const lastReveal = slideUsesReveal(previousSlide) ? previousSlide.points!.length - 1 : -1;
        return { currentSlideIndex: prev.currentSlideIndex - 1, currentRevealIndex: lastReveal };
    }
    return {};
};
