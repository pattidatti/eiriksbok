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
            setActiveBlockIndex(-1);
            return;
        }

        // Cancel any current speaking
        synth.current.cancel();
        setActiveBlockIndex(index);

        // Create new utterance
        const text = blocksRef.current[index];
        const newUtterance = new SpeechSynthesisUtterance(text);

        // Try to find a Norwegian voice
        const voices = synth.current.getVoices();
        const norwegianVoice = voices.find(voice => voice.lang === 'nb-NO' || voice.lang === 'no-NO')
            || voices.find(voice => voice.lang.includes('no'));

        if (norwegianVoice) {
            newUtterance.voice = norwegianVoice;
        }

        // Event handlers
        newUtterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
        };

        newUtterance.onend = () => {
            // Automatically play next block
            if (index < blocksRef.current.length - 1) {
                speakBlock(index + 1);
            } else {
                setIsPlaying(false);
                setIsPaused(false);
                setActiveBlockIndex(-1);
            }
        };

        newUtterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsPlaying(false);
            // Do not set isPaused to false here, as it's an error, not a pause.
        };

        utterance.current = newUtterance;
        synth.current.speak(newUtterance);
    }, []);

    const speak = useCallback((textBlocks: string[]) => {
        blocksRef.current = textBlocks;
        speakBlock(0);
    }, [speakBlock]);

    const playBlock = useCallback((index: number) => {
        if (blocksRef.current.length > 0) {
            speakBlock(index);
        }
    }, [speakBlock]);

    const pause = useCallback(() => {
        if (synth.current && isPlaying && !isPaused) {
            synth.current.pause();
            setIsPaused(true);
        }
    }, [isPlaying, isPaused]);

    const resume = useCallback(() => {
        if (synth.current && isPlaying && isPaused) {
            synth.current.resume();
            setIsPaused(false);
        }
    }, [isPlaying, isPaused]);

    const cancel = useCallback(() => {
        if (synth.current) {
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
