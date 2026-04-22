interface IntroOverlayProps {
    title?: string;
    subtitle?: string;
    skippable: boolean;
    onSkip: () => void;
}

// Vises mens intro spilles (parallelt med fade-from-black). Skip-knapp kobles til engine.skipIntro.
export function IntroOverlay({ title, subtitle, skippable, onSkip }: IntroOverlayProps) {
    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 95,
                color: '#f4e4c1',
                fontFamily: "Georgia, 'Times New Roman', serif",
                textShadow: '0 4px 20px rgba(0,0,0,0.95)',
            }}
        >
            {title && (
                <h1
                    style={{
                        fontSize: 'clamp(28px, 5vw, 56px)',
                        letterSpacing: 6,
                        textTransform: 'uppercase',
                        marginBottom: 12,
                        animation: 'introFade 1.2s ease-out',
                        color: '#e8d4a8',
                    }}
                >
                    {title}
                </h1>
            )}
            {subtitle && (
                <p
                    style={{
                        fontSize: 'clamp(14px, 1.6vw, 20px)',
                        letterSpacing: 3,
                        opacity: 0.85,
                        fontStyle: 'italic',
                        animation: 'introFade 1.4s ease-out',
                    }}
                >
                    {subtitle}
                </p>
            )}
            {skippable && (
                <button
                    type="button"
                    onClick={onSkip}
                    aria-label="Hopp over intro"
                    className="intro-skip-btn"
                    style={{
                        position: 'absolute',
                        bottom: 28,
                        right: 28,
                        background: 'rgba(20,12,6,0.85)',
                        border: '1px solid #5c4228',
                        color: '#d4a574',
                        padding: '8px 16px',
                        borderRadius: 4,
                        fontSize: 13,
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        pointerEvents: 'auto',
                        backdropFilter: 'blur(6px)',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#5c4228';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(20,12,6,0.85)';
                        e.currentTarget.style.color = '#d4a574';
                    }}
                >
                    Hopp over ⏭
                </button>
            )}
            <style>{`
                @keyframes introFade {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .intro-skip-btn:focus-visible {
                    outline: 2px solid #d4a574;
                    outline-offset: 3px;
                    background: #5c4228 !important;
                    color: #fff !important;
                }
            `}</style>
        </div>
    );
}
