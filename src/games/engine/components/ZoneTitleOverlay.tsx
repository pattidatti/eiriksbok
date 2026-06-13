// Fase 8: sonetittel-overlay. Stor serif-tittel med vid tracking som fader inn,
// holdes, og fader ut over `durationMs`. Motoren rydder state samtidig, så
// CSS-animasjonen og unmount er synket. Rendres der intro-overlayet bor (GameCanvas).
//
// Komponenten remountes hver gang `key` endrer seg (settes av forelderen) slik at
// fade-animasjonen restarter selv om teksten er den samme.

interface ZoneTitleOverlayProps {
    title: string;
    subtitle?: string;
    durationMs: number;
}

export function ZoneTitleOverlay({ title, subtitle, durationMs }: ZoneTitleOverlayProps) {
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
                zIndex: 14,
                animation: `zoneTitleFade ${durationMs}ms ease-in-out forwards`,
            }}
        >
            <style>{`
                @keyframes zoneTitleFade {
                    0%   { opacity: 0; transform: translateY(10px); }
                    14%  { opacity: 1; transform: translateY(0); }
                    78%  { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-6px); }
                }
            `}</style>
            <div
                style={{
                    fontFamily: "'Outfit', Georgia, serif",
                    fontSize: 'clamp(2.2rem, 6vw, 4.6rem)',
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    color: '#f6efe2',
                    textAlign: 'center',
                    textShadow: '0 2px 18px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.6)',
                    textTransform: 'uppercase',
                    lineHeight: 1.1,
                    padding: '0 1.5rem',
                }}
            >
                {title}
            </div>
            {subtitle && (
                <div
                    style={{
                        marginTop: '0.6rem',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 'clamp(0.85rem, 1.8vw, 1.25rem)',
                        letterSpacing: '0.32em',
                        color: 'rgba(246, 239, 226, 0.82)',
                        textTransform: 'uppercase',
                        textShadow: '0 1px 10px rgba(0,0,0,0.9)',
                        textAlign: 'center',
                    }}
                >
                    {subtitle}
                </div>
            )}
        </div>
    );
}
