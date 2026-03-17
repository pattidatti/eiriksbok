import { useState, useCallback, useRef, useEffect } from 'react';
import type { TTSReturn } from './useTextToSpeech';

const API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY as string | undefined;
const TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';

const RATE_STORAGE_KEY = 'tts-rate';

// Google Cloud TTS voice config for Norwegian Bokmål
// Prefer WaveNet > Neural2 > Standard
const VOICE_CONFIG = {
    languageCode: 'nb-NO',
    name: 'nb-NO-Wavenet-A', // Female WaveNet voice
};

interface AudioCache {
    [key: string]: string; // text hash → object URL
}

function loadRate(): number {
    try {
        const stored = localStorage.getItem(RATE_STORAGE_KEY);
        if (stored) {
            const val = parseFloat(stored);
            if (val >= 0.5 && val <= 2.0) return val;
        }
    } catch {
        // localStorage unavailable
    }
    return 1.0;
}

function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return String(hash);
}

async function synthesize(text: string): Promise<string> {
    const response = await fetch(`${TTS_ENDPOINT}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            input: { text },
            voice: VOICE_CONFIG,
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: loadRate(),
                pitch: 0,
            },
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Google Cloud TTS error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const audioContent: string = data.audioContent; // base64

    // Convert base64 to Blob URL
    const byteChars = atob(audioContent);
    const byteArray = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
        byteArray[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: 'audio/mp3' });
    return URL.createObjectURL(blob);
}

export const useCloudTTS = (): TTSReturn & { isAvailable: boolean } => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [activeBlockIndex, setActiveBlockIndex] = useState(-1);
    const [rate, setRateState] = useState(loadRate);
    const [isAvailable, setIsAvailable] = useState(!!API_KEY);

    const blocksRef = useRef<string[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const cacheRef = useRef<AudioCache>({});
    const isPausedRef = useRef(false);
    const playBlockAudioRef = useRef<(index: number) => void>(() => {});

    const setRate = useCallback((newRate: number) => {
        const clamped = Math.max(0.5, Math.min(2.0, newRate));
        setRateState(clamped);
        try {
            localStorage.setItem(RATE_STORAGE_KEY, String(clamped));
        } catch {
            // ignore
        }
        // Clear cache since rate changed (audio is baked in at synthesis time)
        Object.values(cacheRef.current).forEach((url) => URL.revokeObjectURL(url));
        cacheRef.current = {};
    }, []);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    }, []);

    const playBlockAudio = useCallback(
        async (index: number) => {
            if (index >= blocksRef.current.length || index < 0) {
                setIsPlaying(false);
                setIsPaused(false);
                isPausedRef.current = false;
                setActiveBlockIndex(-1);
                return;
            }

            stopAudio();
            setActiveBlockIndex(index);
            setIsPlaying(true);
            setIsPaused(false);
            isPausedRef.current = false;

            const text = blocksRef.current[index];
            const hash = simpleHash(text);

            try {
                // Use cached URL or synthesize new
                let audioUrl = cacheRef.current[hash];
                if (!audioUrl) {
                    audioUrl = await synthesize(text);
                    cacheRef.current[hash] = audioUrl;
                }

                if (isPausedRef.current) return; // User paused while we were fetching

                const audio = new Audio(audioUrl);
                audioRef.current = audio;

                audio.addEventListener('ended', () => {
                    if (isPausedRef.current) return;
                    if (index < blocksRef.current.length - 1) {
                        playBlockAudioRef.current(index + 1);
                    } else {
                        setIsPlaying(false);
                        setIsPaused(false);
                        isPausedRef.current = false;
                        setActiveBlockIndex(-1);
                    }
                }, { once: true });

                audio.addEventListener('error', () => {
                    console.error('Cloud TTS audio playback error');
                    setIsPlaying(false);
                    setIsPaused(false);
                    isPausedRef.current = false;
                    setActiveBlockIndex(-1);
                }, { once: true });

                await audio.play();
            } catch (err) {
                console.warn('[Cloud TTS] Feil - faller tilbake til browser TTS:', err);
                setIsAvailable(false);
                setIsPlaying(false);
                setIsPaused(false);
                isPausedRef.current = false;
                setActiveBlockIndex(-1);
            }
        },
        [stopAudio]
    );

    // Keep ref in sync for use in event listeners (avoids stale closure)
    useEffect(() => {
        playBlockAudioRef.current = playBlockAudio;
    }, [playBlockAudio]);

    const speak = useCallback(
        (textBlocks: string[], startIndex = 0) => {
            blocksRef.current = textBlocks;
            setIsPlaying(true);
            setIsPaused(false);
            isPausedRef.current = false;
            playBlockAudio(startIndex);
        },
        [playBlockAudio]
    );

    const playBlock = useCallback(
        (index: number) => {
            if (blocksRef.current.length > 0) {
                playBlockAudio(index);
            }
        },
        [playBlockAudio]
    );

    const pause = useCallback(() => {
        if (isPlaying && !isPaused) {
            isPausedRef.current = true;
            setIsPaused(true);
            if (audioRef.current) {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, isPaused]);

    const resume = useCallback(() => {
        if (isPlaying && isPaused) {
            isPausedRef.current = false;
            setIsPaused(false);
            if (audioRef.current) {
                audioRef.current.play();
            } else if (activeBlockIndex !== -1) {
                playBlockAudioRef.current(activeBlockIndex);
            }
        }
    }, [isPlaying, isPaused, activeBlockIndex]);

    const cancel = useCallback(() => {
        isPausedRef.current = false;
        stopAudio();
        setIsPlaying(false);
        setIsPaused(false);
        setActiveBlockIndex(-1);
    }, [stopAudio]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAudio();
            // Revoke cached object URLs
            Object.values(cacheRef.current).forEach((url) => URL.revokeObjectURL(url));
            cacheRef.current = {};
        };
    }, [stopAudio]);

    return {
        speak,
        pause,
        resume,
        cancel,
        playBlock,
        isPlaying,
        isPaused,
        hasVoice: isAvailable,
        activeBlockIndex,
        rate,
        setRate,
        isAvailable,
    };
};
