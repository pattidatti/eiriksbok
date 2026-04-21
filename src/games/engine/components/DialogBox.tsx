interface DialogState {
    visible: boolean;
    speaker: string;
    text: string;
    choices: string[];
}

interface DialogBoxProps {
    dialog: DialogState;
    onChoice: (index: number) => void;
}

export function DialogBox({ dialog, onChoice }: DialogBoxProps) {
    if (!dialog.visible) return null;

    return (
        <div
            style={{
                position: 'absolute',
                bottom: 30,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(720px, 90vw)',
                background: 'rgba(20,12,6,0.95)',
                border: '3px solid #8b6f47',
                borderRadius: 6,
                padding: '22px 28px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.8), 0 0 60px rgba(139,111,71,0.15)',
                backdropFilter: 'blur(8px)',
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: '#f4e4c1',
                zIndex: 10,
            }}
        >
            <div
                style={{
                    fontSize: 17,
                    color: '#d4a574',
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
                {dialog.text}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {dialog.choices.map((choice, i) => (
                    <button
                        key={i}
                        onClick={() => onChoice(i)}
                        style={{
                            display: 'block',
                            width: '100%',
                            background: 'transparent',
                            border: '1px solid #5c4228',
                            color: '#f4e4c1',
                            padding: '10px 14px',
                            textAlign: 'left',
                            fontFamily: 'inherit',
                            fontSize: 14,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderRadius: 3,
                        }}
                        onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.background = '#5c4228';
                            el.style.borderColor = '#d4a574';
                            el.style.color = '#fff';
                            el.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.background = 'transparent';
                            el.style.borderColor = '#5c4228';
                            el.style.color = '#f4e4c1';
                            el.style.transform = 'translateX(0)';
                        }}
                    >
                        <span style={{ color: '#d4a574', fontWeight: 'bold', marginRight: 8 }}>
                            [{i + 1}]
                        </span>
                        {choice}
                    </button>
                ))}
            </div>
        </div>
    );
}
