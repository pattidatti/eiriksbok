import type { Lesson, LearningPathData, PresentationData, Slide, SlideRevealItem } from '../types';

/**
 * Automagically maps a Lesson or LearningPath to a professional presentation structure.
 * This is the core logic of the "Hybrid-model", favoring automation but allowing
 * for manual overrides if present in the data.
 */
export const mapContentToPresentation = (
    data: Lesson | LearningPathData,
    id: string
): PresentationData => {
    // 1. If we already have manual presentation data, use it (Level 2: Decoration)
    if (data.presentation) {
        return data.presentation;
    }

    const slides: Slide[] = [];
    const title = data.title;

    const lessonData = data as Lesson;
    const heroImage = lessonData.heroImage;
    const category = lessonData.category || 'Undervisning';

    // 2. Initial Title Slide
    slides.push({
        id: 'slide-intro',
        title: title,
        layout: 'title',
        summary: category,
        image: heroImage,
        teacherNotes: `Velkommen til denne økten om ${title}.`
    });

    // 3. Handle Learning Path Data (Steps)
    if ('steps' in data) {
        data.steps.forEach((step, index) => {
            const slideId = `slide-${step.id || index}`;

            // Logic: Each step becomes a slide. 
            // - Facts/Reflections -> Content slides
            // - Tasks -> Discussion slides
            // - Components -> Interactive slides

            const points: SlideRevealItem[] = [];

            // Heuristic for extraction: 
            // Split content by periods to get punchy summary points
            const sentences = step.content.split('.').filter(s => s.trim().length > 10);
            sentences.slice(0, 3).forEach((s, idx) => {
                points.push({
                    id: `${slideId}-p-${idx}`,
                    text: s.trim() + '.',
                    type: 'bullet'
                });
            });

            const slide: Slide = {
                id: slideId,
                title: step.title,
                layout: step.type === 'refleksjon' || step.tasks ? 'discussion' : 'content',
                summary: sentences[0],
                points: points,
                teacherNotes: step.content, // Full depth for the teacher
                talkingPoints: step.tasks,
                image: heroImage, // Fallback
                visualEffect: 'scale'
            };

            // If there's a component, prioritize interactive layout
            if (step.component) {
                slide.layout = 'interactive';
                slide.component = step.component;
            }

            slides.push(slide);
        });
    }

    if ('content' in data && data.content) {
        data.content.forEach((block, index) => {
            const blockTitle = (block as any).title || (block.type === 'header' ? block.content : null);
            if (blockTitle) {
                slides.push({
                    id: `block-${index}`,
                    title: blockTitle,
                    layout: 'content',
                    summary: block.type === 'text' ? block.content?.substring(0, 100) + '...' : undefined,
                    teacherNotes: block.type === 'text' ? block.content : undefined,
                    image: heroImage
                });
            }
        });
    }

    // 5. Final Summary Slide
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
