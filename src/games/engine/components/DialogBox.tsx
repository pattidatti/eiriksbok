import { useEffect, useRef, useState, useMemo } from 'react';
import { ChoiceButton } from './ChoiceButton';
import type { DialogChoiceUI, Emotion } from '../types';

interface DialogState {
    visible: boolean;
    speaker: string;
    text: string;
    choices: DialogChoiceUI[];
    emotion?: Emotion;
    portrait?: string;
}

interface DialogBoxProps {
    dialog: DialogState;
    onChoice: (index: number) => void;
    // Valgfri lyd-bro fra GameCanvas (engine.audio.playOneShot). Brukes til
    // åpne-lyd og typewriter-tikk; mangler den, er dialogen lydløs.
    playSound?: (url: string, opts?: { volume?: number }) => void;
}

const BASE_MS_PER_CHAR = 22;

// Varm pergament-palett (Portrett lower-third).
const WARM_PANEL = 'rgba(20,12,6,0.94)';
const WARM_BORDER = '#8b6f47';
const WARM_TEXT = '#f4e4c1';
const WARM_ACCENT = '#d4a574';

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

    // Emotion gir ramme/aksent-tint; uten emotion brukes den varme standardpaletten.
    const frameColor = dialog.emotion ? EMOTION_BORDERS[dialog.emotion] : WARM_BORDER;
    const accentColor = dialog.emotion ? EMOTION_BORDERS[dialog.emotion] : WARM_ACCENT;
    const portrait = dialog.portrait ?? '🙂';
    // Mens teksten skrives "snakker" portrettet (lett bob). Stopper når replikken er ferdig.
    const speaking = !isComplete && !reduced;

    const handleClick = () => {
        if (!isComplete) {
            skipRef.current = true;
            setRevealedByKey({ key: textKey, n: dialog.text.length });
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                position: 'absolute',
                bottom: 34,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(1040px, 94vw)',
                zIndex: 10,
                cursor: isComplete ? 'default' : 'pointer',
                fontFamily: "Georgia, 'Times New Roman', serif",
            }}
        >
            <style>{`
                @keyframes choiceIn {
                    0%   { opacity: 0; transform: translateY(8px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes dialogCaretBlink {
                    0%, 49%   { opacity: 0.7; }
                    50%, 100% { opacity: 0; }
                }
                @keyframes dialogLowerThirdIn {
                    0%   { opacity: 0; transform: translateY(22px) scale(0.98); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes dialogPortraitBob {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-5px); }
                }
            `}</style>

            <div
                style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'stretch',
                    animation: reduced ? undefined : 'dialogLowerThirdIn 240ms cubic-bezier(0.2,0.8,0.2,1) both',
                }}
            >
                {/* Portrett-rute */}
                <div
                    style={{
                        flex: 'none',
                        width: 168,
                        display: 'grid',
                        placeItems: 'center',
                        background: WARM_PANEL,
                        border: `3px solid ${frameColor}`,
                        borderRadius: 18,
                        boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 34px -6px ${frameColor}`,
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <span
                        style={{
                            fontSize: 92,
                            lineHeight: 1,
                            filter: `drop-shadow(0 6px 10px rgba(0,0,0,0.45))`,
                            animation: speaking ? 'dialogPortraitBob 0.6s ease-in-out infinite' : undefined,
                        }}
                    >
                        {portrait}
                    </span>
                </div>

                {/* Tekst-panel */}
                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        background: WARM_PANEL,
                        border: `3px solid ${frameColor}`,
                        borderRadius: 18,
                        padding: '22px 30px',
                        boxShadow: '0 10px 50px rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(8px)',
                        color: WARM_TEXT,
                    }}
                >
                    <div
                        style={{
                            fontSize: 22,
                            color: accentColor,
                            marginBottom: 10,
                            letterSpacing: 1.5,
                            fontVariant: 'small-caps',
                            fontWeight: 700,
                        }}
                    >
                        {dialog.speaker}
                    </div>

                    <p
                        style={{
                            fontSize: 29,
                            lineHeight: 1.5,
                            marginBottom: 18,
                            minHeight: 88,
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {dialog.choices.map((choice, i) => (
                                <ChoiceButton
                                    key={i}
                                    index={i}
                                    text={choice.text}
                                    icon={choice.icon}
                                    consequenceHint={choice.consequenceHint}
                                    onClick={() => onChoice(i)}
                                    animate={!reduced}
                                    accentColor={accentColor}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
