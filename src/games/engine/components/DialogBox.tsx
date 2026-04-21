import { GamePanel } from './GamePanel';

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

export function DialogBox({ dialog, onChoice }: DialogBoxProps) {
    if (!dialog.visible) return null;

    return (
        <GamePanel>
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
                        <span style={keyBadge}>{i + 1}</span>
                        {choice}
                    </button>
                ))}
            </div>
        </GamePanel>
    );
}
