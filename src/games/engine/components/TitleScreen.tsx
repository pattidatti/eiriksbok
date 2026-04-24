import type { GameConfig } from '../types';

interface TitleScreenProps {
    config: GameConfig;
    onStart: () => void;
}

export function TitleScreen({ config, onStart }: TitleScreenProps) {
    return (
        <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-7"
            style={{
                background: 'radial-gradient(ellipse at center, #3a2615 0%, #0a0604 100%)',
                fontFamily: "Georgia, 'Times New Roman', serif",
            }}
        >
            <div className="text-center">
                <h1
                    className="font-normal text-center"
                    style={{
                        fontSize: 'clamp(28px, 5vw, 52px)',
                        color: '#d4a574',
                        letterSpacing: '4px',
                        textShadow: '0 0 30px rgba(212,165,116,0.4), 3px 3px 0 #1a0f08',
                        fontVariant: 'small-caps',
                        animation: 'titleGlow 3s ease-in-out infinite',
                    }}
                >
                    {config.title}
                </h1>
                <p
                    className="mt-2 block"
                    style={{
                        fontSize: '16px',
                        color: '#8b6f47',
                        letterSpacing: '6px',
                        textTransform: 'uppercase',
                    }}
                >
                    {config.subtitle}
                </p>
            </div>

            <button
                onClick={onStart}
                style={{
                    background: '#5c4228',
                    color: '#f4e4c1',
                    border: '2px solid #d4a574',
                    padding: '14px 40px',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
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
                Begynn Eventyret
            </button>

            <p
                style={{
                    color: '#8b6f47',
                    fontSize: '13px',
                    maxWidth: '480px',
                    textAlign: 'center',
                    lineHeight: 1.6,
                }}
            >
                {config.description}
            </p>

            {config.learningGoals && config.learningGoals.length > 0 && (
                <div
                    style={{
                        maxWidth: '480px',
                        padding: '14px 22px',
                        border: '1px solid rgba(212,165,116,0.25)',
                        borderRadius: 8,
                        background: 'rgba(26,15,8,0.35)',
                    }}
                >
                    <div
                        style={{
                            color: '#d4a574',
                            fontSize: '11px',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            textAlign: 'center',
                            marginBottom: 8,
                        }}
                    >
                        Hva lærer du?
                    </div>
                    <ul
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            color: '#c9b38a',
                            fontSize: '13px',
                            lineHeight: 1.6,
                        }}
                    >
                        {config.learningGoals.map((goal, i) => (
                            <li key={i} style={{ paddingLeft: 14, position: 'relative' }}>
                                <span
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        color: '#8b6f47',
                                    }}
                                >
                                    ·
                                </span>
                                {goal}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <style>{`
                @keyframes titleGlow {
                    0%, 100% { text-shadow: 0 0 30px rgba(212,165,116,0.3), 3px 3px 0 #1a0f08; }
                    50% { text-shadow: 0 0 50px rgba(212,165,116,0.6), 3px 3px 0 #1a0f08, 0 0 80px rgba(255,100,30,0.15); }
                }
            `}</style>
        </div>
    );
}
