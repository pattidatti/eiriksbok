import { useState } from 'react';

interface ChoiceButtonProps {
    index: number;
    text: string;
    icon?: string;
    consequenceHint?: string;
    onClick: () => void;
}

const keyBadge: React.CSSProperties = {
    display: 'inline-block',
    background: 'rgba(0,0,0,0.45)',
    border: '1px solid #8b6f47',
    borderRadius: 3,
    fontFamily: 'monospace',
    fontSize: 12,
    padding: '1px 6px',
    marginRight: 10,
    color: '#d4a574',
    minWidth: 20,
    textAlign: 'center',
};

const iconStyle: React.CSSProperties = {
    display: 'inline-block',
    marginRight: 8,
    fontSize: 16,
};

export function ChoiceButton({ index, text, icon, consequenceHint, onClick }: ChoiceButtonProps) {
    const [hovered, setHovered] = useState(false);

    const buttonStyle: React.CSSProperties = {
        display: 'block',
        width: '100%',
        background: hovered ? '#5c4228' : 'transparent',
        border: `1px solid ${hovered ? '#d4a574' : '#5c4228'}`,
        color: hovered ? '#fff' : '#f4e4c1',
        padding: '10px 14px',
        textAlign: 'left' as const,
        fontFamily: 'inherit',
        fontSize: 14,
        cursor: 'pointer',
        transition: 'all 0.2s',
        borderRadius: 3,
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={onClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={buttonStyle}
            >
                <span style={keyBadge}>{index + 1}</span>
                {icon && <span style={iconStyle}>{icon}</span>}
                {text}
            </button>
            {hovered && consequenceHint && (
                <div
                    style={{
                        marginTop: 4,
                        marginLeft: 36,
                        fontSize: 12,
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
