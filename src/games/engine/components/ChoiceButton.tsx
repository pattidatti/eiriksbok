import { useState } from 'react';

interface ChoiceButtonProps {
    index: number;
    text: string;
    icon?: string;
    consequenceHint?: string;
    onClick: () => void;
    // Når true: kort forskjøvet inn-animasjon (keyframe `choiceIn` defineres i DialogBox).
    animate?: boolean;
    // Emotion-/varm aksentfarge for tall-badge og hover-kant.
    accentColor?: string;
}

export function ChoiceButton({ index, text, icon, consequenceHint, onClick, animate, accentColor }: ChoiceButtonProps) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);
    const accent = accentColor ?? '#d4a574';

    // Hover gir slide til høyre; trykk gir lett "inn-trykk" (scale) for taktil følelse.
    const translateX = hovered ? 5 : 0;
    const scale = pressed ? 0.98 : 1;

    const keyBadge: React.CSSProperties = {
        display: 'inline-grid',
        placeItems: 'center',
        background: 'rgba(0,0,0,0.45)',
        border: `1px solid ${accent}`,
        borderRadius: 6,
        fontFamily: 'monospace',
        fontSize: 16,
        fontWeight: 700,
        width: 30,
        height: 30,
        flex: 'none',
        color: accent,
    };

    const buttonStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        background: hovered ? '#5c4228' : 'transparent',
        border: `1px solid ${hovered ? accent : '#5c4228'}`,
        color: hovered ? '#fff' : '#f4e4c1',
        padding: '12px 16px',
        textAlign: 'left' as const,
        fontFamily: 'inherit',
        fontSize: 21,
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s, color 0.2s, transform 0.08s',
        borderRadius: 10,
        transform: `translateX(${translateX}px) scale(${scale})`,
        animation: animate ? 'choiceIn 200ms ease-out both' : undefined,
        animationDelay: animate ? `${index * 55}ms` : undefined,
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={onClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => {
                    setHovered(false);
                    setPressed(false);
                }}
                onMouseDown={() => setPressed(true)}
                onMouseUp={() => setPressed(false)}
                style={buttonStyle}
            >
                <span style={keyBadge}>{index + 1}</span>
                {icon && <span style={{ fontSize: 20, flex: 'none' }}>{icon}</span>}
                <span>{text}</span>
            </button>
            {hovered && consequenceHint && (
                <div
                    style={{
                        marginTop: 4,
                        marginLeft: 42,
                        fontSize: 15,
                        color: '#a8946d',
                        fontStyle: 'italic',
                        letterSpacing: 0.3,
                    }}
                >
                    → {consequenceHint}
                </div>
            )}
        </div>
    );
}
