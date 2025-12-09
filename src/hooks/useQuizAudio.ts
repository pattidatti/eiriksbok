import { useCallback, useRef, useEffect } from 'react';

type SoundType = 'join' | 'click' | 'reveal' | 'correct' | 'wrong' | 'timer_warn' | 'timer_end' | 'win';

export const useQuizAudio = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
        }
    }, []);

    const playSound = useCallback((type: SoundType) => {
        const ctx = audioContextRef.current;
        if (!ctx) return;

        // Resume if suspended (browser policy)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (type) {
            case 'join':
                // Cheerful generic "bloop"
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'click':
                // Short click
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(800, now);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;

            case 'reveal':
                // Suspenseful "Whoosh" + Impact
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(50, now + 0.3);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;

            case 'correct':
                // Happy major arpeggio
                const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C E G C
                frequencies.forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.type = 'sine';
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0.1, now + i * 0.05);
                    g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.3);
                    o.start(now + i * 0.05);
                    o.stop(now + i * 0.05 + 0.3);
                });
                break;

            case 'wrong':
                // Sad "womp womp"
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.2);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.linearRampToValueAtTime(0.01, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);

                // Second womp
                const osc2 = ctx.createOscillator();
                const g2 = ctx.createGain();
                osc2.connect(g2);
                g2.connect(ctx.destination);
                osc2.type = 'sawtooth';
                osc2.frequency.setValueAtTime(100, now + 0.25);
                osc2.frequency.linearRampToValueAtTime(50, now + 0.6);
                g2.gain.setValueAtTime(0.2, now + 0.25);
                g2.gain.linearRampToValueAtTime(0.01, now + 0.6);
                osc2.start(now + 0.25);
                osc2.stop(now + 0.6);

                break;

            case 'timer_warn':
                // High ticking
                osc.type = 'square';
                osc.frequency.setValueAtTime(880, now);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'timer_end':
                // Buzzer
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.5);
                gainNode.gain.setValueAtTime(0.5, now);
                gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;

            case 'win':
                // Victory Fanfare equivalent (simple chords)
                // C Major Chord
                [523.25, 659.25, 783.99].forEach(f => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.type = 'square';
                    o.frequency.value = f;
                    g.gain.setValueAtTime(0.1, now);
                    g.gain.linearRampToValueAtTime(0.01, now + 1.5);
                    o.start(now);
                    o.stop(now + 1.5);
                });
                break;
        }
    }, []);

    return { playSound };
};
