import { useCloudTTS } from './useCloudTTS';
import { useTextToSpeech } from './useTextToSpeech';
import type { TTSReturn } from './useTextToSpeech';

/**
 * Unified TTS hook.
 * Uses Google Cloud TTS when VITE_GOOGLE_TTS_API_KEY is set,
 * otherwise falls back to the browser Web Speech API.
 */
export const useTTS = (): TTSReturn => {
    const cloud = useCloudTTS();
    const browser = useTextToSpeech();

    if (cloud.isAvailable) {
        return cloud;
    }

    return browser;
};
