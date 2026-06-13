import { useEffect, useRef, useState, useMemo } from 'react';
import { GamePanel } from './GamePanel';
import { ChoiceButton } from './ChoiceButton';
import type { DialogChoiceUI, Emotion } from '../types';

interface DialogState {
    visible: boolean;
    speaker: string;
    text: string;
    choices: DialogChoiceUI[];
    emotion?: Emotion;
}

interface DialogBoxProps {
    dialog: DialogState;
    onChoice: (index: number) => void;
    // Valgfri lyd-bro fra GameCanvas (engine.audio.playOneShot). Brukes til
    // åpne-lyd og typewriter-tikk; mangler den, er dialogen lydløs.
    playSound?: (url: string, opts?: { volume?: number }) => void;
}

const BASE_MS_PER_CHAR = 22;

const EMOTION_BORDERS: Record<Emotion, string> = {
    glad: '#d4a574',
    worried: '#7a92ad',
    surprised: '#a8d4e0',
    triumphant: '#f0c060',
};

// Tegnsettings-bevisst tempo: lengre opphold etter setningstegn gir teksten "pust".
function charDelay(prevChar: string | undefined): number {
    if (!prevChar) return BASE_MS_PER_CHAR;
    if (prevChar === '.' || prevChar === '!' || prevChar === '?' || prevChar === ':') return 260;
    if (prevChar === ',' || prevChar === ';') return 140;
    if (prevChar === ' ') return 12;
    return BASE_MS_PER_CHAR;
}

// Respekter OS-innstillingen "redusér bevegelse": dropp animasjon + typewriter.
function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(
        () =>
            typeof window !== 'undefined' &&
            !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    );
    useEffect(() => {
        if (!window.matchMedia) return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const onChange = () => setReduced(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);
    return reduced;
}

export function DialogBox({ dialog, onChoice, playSound }: DialogBoxProps) {
    const reduced = useReducedMotion();
    // textKey endres kun når visibility eller text endres - bruk det som key/dependency for typewriter
    const textKey = useMemo(() => `${dialog.visible ? 1 : 0}:${dialog.text}`, [dialog.visible, dialog.text]);
    const [revealedByKey, setRevealedByKey] = useState<{ key: string; n: number }>({ key: textKey, n: 0 });
    const revealed = revealedByKey.key === textKey ? revealedByKey.n : 0;
    const skipRef = useRef(false);

    // Stabil referanse til lyd-callback for bruk i typewriter-løkka uten å re-binde effekten.
    const playSoundRef = useRef(playSound);
    useEffect(() => {
        playSoundRef.current = playSound;
    }, [playSound]);

    // Åpne-lyd: kun ved samtale-start. DialogBox monteres på nytt per ny samtale,
    // men beholdes gjennom node-kjeden, så en mount-effekt fyrer nøyaktig én gang.
    useEffect(() => {
        playSoundRef.current?.('proc:dialog-open', { volume: 0.3 });
    }, []);

    useEffect(() => {
        // Reset skip når text endres
        skipRef.current = false;
    }, [textKey]);

    const displayLen = reduced ? dialog.text.length : revealed;
    const isComplete = displayLen >= dialog.text.length;

    useEffect(() => {
        if (reduced) return; // ingen typewriter ved redusert bevegelse
        if (!dialog.visible) return;
        if (revealed >= dialog.text.length) return;
        const delay = skipRef.current ? 0 : charDelay(dialog.text[revealed - 1]);
        const id = setTimeout(() => {
            const next = skipRef.current ? dialog.text.length : Math.min(dialog.text.length, revealed + 1);
            setRevealedByKey({ key: textKey, n: next });
            // Svak typewriter-tikk, throttlet (~hvert 3. tegn) og aldri på mellomrom.
            if (!skipRef.current && next % 3 === 0 && dialog.text[next - 1] !== ' ') {
                playSoundRef.current?.('proc:type-tick', { volume: 0.12 });
            }
        }, delay);
        return () => clearTimeout(id);
    }, [revealed, dialog.text, dialog.visible, textKey, reduced]);

    useEffect(() => {
        if (!dialog.visible) return;
        const handler = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                skipRef.current = true;
                setRevealedByKey({ key: textKey, n: dialog.text.length });
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [dialog.visible, dialog.text, textKey]);

    if (!dialog.visible) return null;

    const borderColor = dialog.emotion ? EMOTION_BORDERS[dialog.emotion] : undefined;

    const handleClick = () => {
        if (!isComplete) {
            skipRef.current = true;
            setRevealedByKey({ key: textKey, n: dialog.text.length });
        }
    };

    return (
        <div onClick={handleClick} style={{ cursor: isComplete ? 'default' : 'pointer' }}>
            <style>{`
                @keyframes choiceIn {
                    0%   { opacity: 0; transform: translateY(6px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes dialogCaretBlink {
                    0%, 49%   { opacity: 0.7; }
                    50%, 100% { opacity: 0; }
                }
            `}</style>
            <GamePanel borderColor={borderColor} animateIn={!reduced}>
                <div
                    style={{
                        fontSize: 17,
                        color: borderColor ?? '#d4a574',
                        marginBottom: 10,
                        letterSpacing: 1,
                        fontVariant: 'small-caps',
                    }}
                >
                    {dialog.speaker}
                </div>

                <p
                    style={{
                        fontSize: 15,
                        lineHeight: 1.6,
                        marginBottom: 14,
                        minHeight: 50,
                    }}
                >
                    {dialog.text.slice(0, displayLen)}
                    {!isComplete && (
                        <span
                            style={{
                                marginLeft: 2,
                                animation: reduced ? undefined : 'dialogCaretBlink 1s step-end infinite',
                                opacity: 0.7,
                            }}
                        >
                            ▌
                        </span>
                    )}
                </p>

                {isComplete && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {dialog.choices.map((choice, i) => (
                            <ChoiceButton
                                key={i}
                                index={i}
                                text={choice.text}
                                icon={choice.icon}
                                consequenceHint={choice.consequenceHint}
                                onClick={() => onChoice(i)}
                                animate={!reduced}
                            />
                        ))}
                    </div>
                )}
            </GamePanel>
        </div>
    );
}
