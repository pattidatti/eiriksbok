import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTextToSpeechReturn {
    speak: (textBlocks: string[]) => void;
    pause: () => void;
    resume: () => void;
    cancel: () => void;
    playBlock: (index: number) => void;
    isPlaying: boolean;
    isPaused: boolean;
    hasVoice: boolean;
    activeBlockIndex: number;
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [hasVoice, setHasVoice] = useState(false);
    const [activeBlockIndex, setActiveBlockIndex] = useState(-1);
    const synth = useRef<SpeechSynthesis | null>(null);
    const utterance = useRef<SpeechSynthesisUtterance | null>(null);
    const isPausedRef = useRef(false);
    const blocksRef = useRef<string[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            synth.current = window.speechSynthesis;

            // Check if voices are already loaded
            const checkVoices = () => {
                const voices = synth.current?.getVoices() || [];
                if (voices.length > 0) {
                    setHasVoice(true);
                }
            };

            checkVoices();

            // Some browsers load voices asynchronously
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = checkVoices;
            }
        }
    }, []);

    const speakBlock = useCallback((index: number) => {
        if (!synth.current || index >= blocksRef.current.length || index < 0) {
            setIsPlaying(false);
            setIsPaused(false);
            isPausedRef.current = false;
            setActiveBlockIndex(-1);
            return;
        }

        // Cancel any current speaking
        synth.current.cancel();
        setActiveBlockIndex(index);
        setIsPlaying(true);
        setIsPaused(false);
        isPausedRef.current = false;

        // Create new utterance
        const text = blocksRef.current[index];
        const newUtterance = new SpeechSynthesisUtterance(text);

        // Try to find a Norwegian voice with priority:
        // 1. Google/Neural cloud voices (localService: false)
        // 2. Any Google/Neural voice
        // 3. Any Norwegian voice
        const voices = synth.current.getVoices();
        const nbVoices = voices.filter(voice => voice.lang === 'nb-NO' || voice.lang === 'no-NO' || voice.lang.includes('no'));

        const bestVoice = nbVoices.find(voice =>
            (voice.name.toLowerCase().includes('google') || voice.name.toLowerCase().includes('neural')) &&
            voice.localService === false
        ) || nbVoices.find(voice =>
            voice.name.toLowerCase().includes('google') || voice.name.toLowerCase().includes('neural')
        ) || nbVoices[0];

        if (bestVoice) {
            newUtterance.voice = bestVoice;
        }

        // Event handlers
        newUtterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
            isPausedRef.current = false;
        };

        newUtterance.onend = () => {
            // Only proceed if not paused
            if (isPausedRef.current) return;

            // Automatically play next block
            if (index < blocksRef.current.length - 1) {
                speakBlock(index + 1);
            } else {
                setIsPlaying(false);
                setIsPaused(false);
                isPausedRef.current = false;
                setActiveBlockIndex(-1);
            }
        };

        newUtterance.onerror = (event) => {
            // "interrupted" is common when we call cancel() ourselves
            if ((event as any).error === 'interrupted') return;

            console.error('Speech synthesis error:', event);
            setIsPlaying(false);
            setIsPaused(false);
            isPausedRef.current = false;
        };

        utterance.current = newUtterance;
        synth.current.speak(newUtterance);
    }, []);

    const speak = useCallback((textBlocks: string[]) => {
        blocksRef.current = textBlocks;
        setIsPlaying(true);
        setIsPaused(false);
        isPausedRef.current = false;
        speakBlock(0);
    }, [speakBlock]);

    const playBlock = useCallback((index: number) => {
        if (blocksRef.current.length > 0) {
            speakBlock(index);
        }
    }, [speakBlock]);

    const pause = useCallback(() => {
        // Native pause/resume is very unreliable for cloud voices on Chrome/Chromebooks.
        // We use a "Safe Pause" by canceling and tracking the index.
        if (synth.current && isPlaying && !isPaused) {
            isPausedRef.current = true;
            setIsPaused(true);
            synth.current.cancel(); // Immediate stop
        }
    }, [isPlaying, isPaused]);

    const resume = useCallback(() => {
        if (synth.current && isPlaying && isPaused) {
            isPausedRef.current = false;
            setIsPaused(false);
            // Restart from the current block
            if (activeBlockIndex !== -1) {
                speakBlock(activeBlockIndex);
            }
        }
    }, [isPlaying, isPaused, activeBlockIndex, speakBlock]);

    const cancel = useCallback(() => {
        if (synth.current) {
            isPausedRef.current = false;
            synth.current.cancel();
            setIsPlaying(false);
            setIsPaused(false);
            setActiveBlockIndex(-1);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (synth.current) {
                synth.current.cancel();
            }
        };
    }, []);

    return {
        speak,
        pause,
        resume,
        cancel,
        playBlock,
        isPlaying,
        isPaused,
        hasVoice,
        activeBlockIndex
    };
};
