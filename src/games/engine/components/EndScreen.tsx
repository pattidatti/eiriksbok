interface EndScreenProps {
    text: string;
    onRestart: () => void;
}

export function EndScreen({ text, onRestart }: EndScreenProps) {
    return (
        <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-10 text-center"
            style={{
                background: 'radial-gradient(ellipse at center, #3a2615 0%, #0a0604 100%)',
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: '#f4e4c1',
            }}
        >
            <h1
                style={{
                    fontSize: 'clamp(32px, 5vw, 48px)',
                    color: '#d4a574',
                    fontVariant: 'small-caps',
                    letterSpacing: '3px',
                    fontWeight: 'normal',
                }}
            >
                Gratulerer!
            </h1>

            <p
                style={{
                    fontSize: '17px',
                    lineHeight: 1.7,
                    maxWidth: '580px',
                    fontStyle: 'italic',
                    color: '#b89968',
                }}
                dangerouslySetInnerHTML={{ __html: text.replace(/\n\n/g, '<br/><br/>') }}
            />

            <button
                onClick={onRestart}
                style={{
                    background: '#5c4228',
                    color: '#f4e4c1',
                    border: '2px solid #d4a574',
                    padding: '12px 32px',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#d4a574';
                    (e.currentTarget as HTMLButtonElement).style.color = '#1a0f08';
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#5c4228';
                    (e.currentTarget as HTMLButtonElement).style.color = '#f4e4c1';
                }}
            >
                Spill igjen
            </button>
        </div>
    );
}
