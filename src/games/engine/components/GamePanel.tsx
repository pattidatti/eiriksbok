interface GamePanelProps {
    children: React.ReactNode;
    borderColor?: string;
    // Opt-in: spiller en kort glir/fade-inn-animasjon når panelet monteres.
    // Default av, så andre GamePanel-brukere er upåvirket.
    animateIn?: boolean;
}

export function GamePanel({ children, borderColor, animateIn }: GamePanelProps) {
    return (
        <div
            style={{
                position: 'absolute',
                bottom: 30,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(720px, 90vw)',
                background: 'rgba(20,12,6,0.95)',
                border: `3px solid ${borderColor ?? '#8b6f47'}`,
                borderRadius: 6,
                padding: '22px 28px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.8), 0 0 60px rgba(139,111,71,0.15)',
                backdropFilter: 'blur(8px)',
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: '#f4e4c1',
                zIndex: 10,
                animation: animateIn
                    ? 'dialogPanelIn 220ms cubic-bezier(0.2,0.8,0.2,1) forwards'
                    : undefined,
            }}
        >
            {animateIn && (
                <style>{`
                    @keyframes dialogPanelIn {
                        0%   { opacity: 0; transform: translateX(-50%) translateY(16px) scale(0.98); }
                        100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
                    }
                `}</style>
            )}
            {children}
        </div>
    );
}
