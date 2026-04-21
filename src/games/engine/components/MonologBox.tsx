import { useEffect, useRef, useState } from 'react';
import type { MonologUIState } from '../types';

interface MonologBoxProps {
    monolog: MonologUIState | null;
}

// Indre monolog. Ikke-blokkerende - spilleren kan bevege seg mens den vises.
// Plassert nederst i midten, italic, fade inn/ut per linje.
export function MonologBox({ monolog }: MonologBoxProps) {
    const [displayed, setDisplayed] = useState<{ text: string; key: string } | null>(null);
    const [visible, setVisible] = useState(false);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        // Rydd tidligere timere
        for (const t of timersRef.current) clearTimeout(t);
        timersRef.current = [];

        if (!monolog) {
            const t1 = setTimeout(() => setVisible(false), 0);
            const t2 = setTimeout(() => setDisplayed(null), 400);
            timersRef.current.push(t1, t2);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        }

        const text = monolog.lines[monolog.currentLine] ?? '';
        const key = `${monolog.id}:${monolog.currentLine}`;

        // Fade ut gammel linje, bytt tekst, fade inn ny
        const t1 = setTimeout(() => setVisible(false), 0);
        const t2 = setTimeout(() => {
            setDisplayed({ text, key });
            setVisible(true);
        }, 200);
        timersRef.current.push(t1, t2);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [monolog]);

    if (!displayed) return null;

    return (
        <div
            style={{
                position: 'fixed',
                left: '50%',
                bottom: 170,
                transform: 'translateX(-50%)',
                maxWidth: 720,
                width: 'calc(100% - 60px)',
                pointerEvents: 'none',
                textAlign: 'center',
                fontStyle: 'italic',
                color: '#f4e4c1',
                fontSize: 17,
                lineHeight: 1.5,
                letterSpacing: 0.2,
                textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.6)',
                opacity: visible ? 1 : 0,
                transition: 'opacity 350ms ease',
                zIndex: 40,
            }}
        >
            {displayed.text}
        </div>
    );
}
