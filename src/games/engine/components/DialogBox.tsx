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
}

const TYPEWRITER_MS_PER_CHAR = 22;

const EMOTION_BORDERS: Record<Emotion, string> = {
    glad: '#d4a574',
    worried: '#7a92ad',
    surprised: '#a8d4e0',
    triumphant: '#f0c060',
};

export function DialogBox({ dialog, onChoice }: DialogBoxProps) {
    // textKey endres kun når visibility eller text endres - bruk det som key/dependency for typewriter
    const textKey = useMemo(() => `${dialog.visible ? 1 : 0}:${dialog.text}`, [dialog.visible, dialog.text]);
    const [revealedByKey, setRevealedByKey] = useState<{ key: string; n: number }>({ key: textKey, n: 0 });
    const revealed = revealedByKey.key === textKey ? revealedByKey.n : 0;
    const skipRef = useRef(false);

    useEffect(() => {
        // Reset skip når text endres
        skipRef.current = false;
    }, [textKey]);

    useEffect(() => {
        if (!dialog.visible) return;
        if (revealed >= dialog.text.length) return;
        const id = setTimeout(
            () => setRevealedByKey({
                key: textKey,
                n: skipRef.current ? dialog.text.length : Math.min(dialog.text.length, revealed + 1),
            }),
            TYPEWRITER_MS_PER_CHAR,
        );
        return () => clearTimeout(id);
    }, [revealed, dialog.text, dialog.visible, textKey]);

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

    const isComplete = revealed >= dialog.text.length;
    const borderColor = dialog.emotion ? EMOTION_BORDERS[dialog.emotion] : undefined;

    const handleClick = () => {
        if (!isComplete) {
            skipRef.current = true;
            setRevealedByKey({ key: textKey, n: dialog.text.length });
        }
    };

    return (
        <div onClick={handleClick} style={{ cursor: isComplete ? 'default' : 'pointer' }}>
            <GamePanel borderColor={borderColor}>
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
                    {dialog.text.slice(0, revealed)}
                    {!isComplete && (
                        <span style={{ opacity: 0.6, marginLeft: 2 }}>▌</span>
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
                            />
                        ))}
                    </div>
                )}
            </GamePanel>
        </div>
    );
}
