interface GamePanelProps {
    children: React.ReactNode;
}

export function GamePanel({ children }: GamePanelProps) {
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
            {children}
        </div>
    );
}
