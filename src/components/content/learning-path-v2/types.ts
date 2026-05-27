import type { StepV2 } from '../../../types';
import type { StepResponse } from '../../../stores/useLearningPathProfile';

export interface StepRendererProps {
    step: StepV2;
    pathId: string;
    // Kalles av step-rendereren når completion-criteria er oppfylt.
    // Stien går videre når dette kjøres.
    onComplete: (response: Omit<StepResponse, 'completedAt'>) => void;
    // Forrige svar (hvis eleven har gjort steget tidligere) - kan brukes til å
    // forhåndsutfylle, eller for å gå rett til "fullført"-tilstand.
    previousResponse?: StepResponse;
    isAlreadyCompleted: boolean;
}
