import type { Lesson, LearningPathData, PresentationData, Slide, SlideRevealItem } from '../types';

/**
 * Automagically maps a Lesson or LearningPath to a professional presentation structure.
 * This is the core logic of the "Hybrid-model", favoring automation but allowing
 * for manual overrides if present in the data.
 */
export const mapContentToPresentation = (
    data: Lesson | LearningPathData | any,
    id: string
): PresentationData => {
    // 1. Deep Discovery Utility
    const deepFind = (obj: any, key: string): any => {
        if (!obj || typeof obj !== 'object') return null;

        // If the key exists directly on this level and is what we expect
        if (obj[key] && typeof obj[key] === 'object') {
            // For presentation, we want to ensure it actually has slides
            if (key === 'presentation' && Array.isArray(obj[key].slides)) return obj[key];
            if (key !== 'presentation') return obj[key];
        }

        for (const k in obj) {
            if (obj[k] && typeof obj[k] === 'object' && k !== 'presentation') {
                const found = deepFind(obj[k], key);
                if (found) return found;
            }
        }
        return null;
    };

    // 2. Discover Data
    // Priority: root -> learningPathData -> deep search
    const curatedPresentation = (data.presentation && Array.isArray(data.presentation.slides))
        ? data.presentation
        : (data.learningPathData?.presentation && Array.isArray(data.learningPathData.presentation.slides))
            ? data.learningPathData.presentation
            : deepFind(data, 'presentation');

    const steps = data.steps || data.learningPathData?.steps || deepFind(data, 'steps') || [];
    const contentBlocks = data.content || data.learningPathData?.content || deepFind(data, 'content') || [];

    console.log(`[PresentationMapper] Discovery for ID: ${id}`, {
        hasCurated: !!curatedPresentation,
        curatedSlides: curatedPresentation?.slides?.length || 0,
        hasSteps: steps.length > 0,
        hasBlocks: contentBlocks.length > 0
    });

    // Prioritize curated presentation
    if (curatedPresentation) {
        return curatedPresentation;
    }

    // 3. Fallback: Hybrid Generation
    const slides: Slide[] = [];
    const title = data.title || curatedPresentation?.title || (data as any).learningPathData?.title || 'Uten Tittel';
    const heroImage = (data as Lesson).heroImage || (data as any).learningPathData?.heroImage || '/og-image.png';
    const category = (data as Lesson).category || 'Undervisning';

    // A. Intro Slide
    slides.push({
        id: 'slide-intro',
        title: title,
        layout: 'title',
        summary: category,
        image: heroImage,
        teacherNotes: `Velkommen til denne økten om ${title}.`
    });

    // B. Map Steps (Learning Paths)
    if (steps.length > 0) {
        steps.forEach((step: any, index: number) => {
            const slideId = `slide-${step.id || index}`;
            const points: SlideRevealItem[] = [];

            if (step.content) {
                const sentences = step.content.split('.').filter((s: string) => s.trim().length > 10);
                sentences.slice(0, 3).forEach((s: string, idx: number) => {
                    points.push({
                        id: `${slideId}-p-${idx}`,
                        text: s.trim() + '.',
                        type: 'bullet'
                    });
                });
            }

            // Convert tasks (string | LearningPathTask) to plain strings for talkingPoints
            const talkingPoints: string[] | undefined = step.tasks
                ? step.tasks.map((t: any) => (typeof t === 'string' ? t : t.text))
                : undefined;

            slides.push({
                id: slideId,
                title: step.title || `Del ${index + 1}`,
                layout: step.type === 'refleksjon' || step.tasks ? 'discussion' : 'content',
                summary: step.content ? step.content.substring(0, 150) + '...' : undefined,
                points: points,
                teacherNotes: step.content,
                talkingPoints,
                image: heroImage,
                component: step.component,
                visualEffect: 'scale',
                linksToStepId: step.id,
                phase: step.phase
            });
        });
    }
    // C. Map Content Blocks (Standard Articles)
    else if (contentBlocks.length > 0) {
        contentBlocks.forEach((block: any, index: number) => {
            if (block.type === 'text' || block.type === 'header') {
                const blockTitle = block.title || (block.type === 'header' ? block.content : undefined);
                if (blockTitle || block.content) {
                    slides.push({
                        id: `block-${index}`,
                        title: blockTitle || title,
                        layout: 'content',
                        summary: block.content?.substring(0, 150),
                        teacherNotes: block.content,
                        image: heroImage
                    });
                }
            } else if (block.type === 'component') {
                slides.push({
                    id: `comp-${index}`,
                    title: block.name,
                    layout: 'interactive',
                    component: { name: block.name, props: block.props },
                    image: heroImage
                });
            }
        });
    } else {
        // D. Debugging Slide: If NO content was found
        slides.push({
            id: 'slide-debug',
            title: 'Innholdet lastes ikke korrekt',
            layout: 'content',
            summary: `Kunne ikke finne 'steps' eller 'content' i data-objektet for ID: ${id}`,
            teacherNotes: `Data Keys: ${Object.keys(data).join(', ')} | Subject: ${(data as any).subjectId}`,
            points: [
                { id: 'd1', text: 'Sjekk om JSON-filen har riktig struktur.', type: 'bullet' },
                { id: 'd2', text: 'Prøv å laste siden på nytt (Hard Refresh).', type: 'bullet' }
            ]
        });
    }

    // E. Outro Slide
    slides.push({
        id: 'slide-outro',
        title: 'Oppsummering',
        layout: 'summary',
        points: [
            { id: 'summary-1', text: 'Reflekter over hovedpoengene', type: 'summary' },
            { id: 'summary-2', text: 'Sjekk læringsstien for fordypning', type: 'summary' }
        ],
        teacherNotes: 'Takk for i dag! Bruk de siste minuttene til spørsmål.'
    });

    return {
        id: `pres-${id}`,
        title: title,
        slides: slides,
        config: {
            autoGenerateFromContent: true,
            theme: 'dark'
        }
    };
};


