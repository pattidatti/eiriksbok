import { useCallback } from 'react';
import { microSfx, type StepSoundEvent } from '../components/microgames/kit/sound';

export type { StepSoundEvent };

interface StepSoundsAPI {
    play: (event: StepSoundEvent) => void;
    setMuted: (muted: boolean) => void;
    isMuted: () => boolean;
}

// Tynn React-wrapper rundt den app-globale lyd-singletonen (kit/sound.ts).
// Beholdt for bakoverkompatibilitet: læringsstier og mikrospill som allerede
// kaller useStepSounds().play(...) fortsetter å virke uendret, men deler nå ÉN
// Tone-kjede med den default-wirede primitiv-lyden (felles mute + debounce).
export function useStepSounds(): StepSoundsAPI {
    const play = useCallback((event: StepSoundEvent) => microSfx.play(event), []);
    const setMuted = useCallback((m: boolean) => microSfx.setMuted(m), []);
    const isMuted = useCallback(() => microSfx.isMuted(), []);
    return { play, setMuted, isMuted };
}
