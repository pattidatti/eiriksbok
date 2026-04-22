interface QuestPart {
    id: string;
    name: string;
    collected: boolean;
}

interface GameHUDProps {
    questObjective: string;
    questParts: QuestPart[];
    showInteractPrompt: boolean;
    showFlash: boolean;
    toast?: string;
    debug?: { phase: string; flags: Record<string, unknown> };
    qualityTier?: 'low' | 'medium' | 'high';
}

export function GameHUD({ questObjective, questParts, showInteractPrompt, showFlash, toast, debug, qualityTier }: GameHUDProps) {
    return (
        <>
            {/* Quest HUD */}
            <div
                style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    background: 'rgba(30,18,10,0.88)',
                    border: '2px solid #8b6f47',
                    padding: '14px 18px',
                    borderRadius: 4,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    maxWidth: 320,
                    backdropFilter: 'blur(4px)',
                    color: '#f4e4c1',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    pointerEvents: 'none',
                    zIndex: 10,
                }}
            >
                <h2
                    style={{
                        fontSize: 13,
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        color: '#d4a574',
                        marginBottom: 8,
                        fontWeight: 'normal',
                        borderBottom: '1px solid #5c4228',
                        paddingBottom: 6,
                    }}
                >
                    Oppdrag
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.5, fontStyle: 'italic' }}>
                    {questObjective}
                </p>

                {questParts.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {questParts.map((part) => (
                            <div
                                key={part.id}
                                style={{
                                    fontSize: 13,
                                    color: part.collected ? '#90c090' : '#b89968',
                                    textDecoration: part.collected ? 'line-through' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    transition: 'all 0.3s',
                                }}
                            >
                                {part.collected ? '✓' : '○'} {part.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Collectible pickup toast */}
            {toast && (
                <div
                    style={{
                        position: 'absolute',
                        top: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(20,12,6,0.92)',
                        border: '2px solid #90c090',
                        color: '#90c090',
                        padding: '8px 20px',
                        borderRadius: 4,
                        fontSize: 14,
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        animation: 'toastFadeIn 0.3s ease',
                        pointerEvents: 'none',
                        zIndex: 12,
                        whiteSpace: 'nowrap',
                    }}
                >
                    ✓ {toast} samlet
                </div>
            )}

            {/* Controls hint */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    background: 'rgba(30,18,10,0.85)',
                    border: '1px solid #5c4228',
                    padding: '10px 14px',
                    fontSize: 12,
                    color: '#b89968',
                    borderRadius: 4,
                    lineHeight: 1.7,
                    backdropFilter: 'blur(4px)',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    pointerEvents: 'none',
                    zIndex: 10,
                }}
            >
                <span style={{ color: '#d4a574' }}>WASD</span> bevege
                <br />
                <span style={{ color: '#d4a574' }}>Mus</span> se rundt
                <br />
                <span style={{ color: '#d4a574' }}>Mellomrom</span> hoppe / skippe
                <br />
                <span style={{ color: '#d4a574' }}>E</span> interagere
                <br />
                <span style={{ color: '#d4a574' }}>Esc</span> pause
            </div>

            {/* Debug overlay */}
            {debug && (
                <div
                    style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        background: 'rgba(0,0,0,0.8)',
                        border: '1px solid #00ff44',
                        padding: '8px 12px',
                        fontSize: 11,
                        color: '#00ff44',
                        borderRadius: 3,
                        fontFamily: 'monospace',
                        lineHeight: 1.6,
                        pointerEvents: 'none',
                        zIndex: 20,
                    }}
                >
                    <div>fase: {debug.phase}</div>
                    {qualityTier && <div>tier: {qualityTier}</div>}
                    {Object.entries(debug.flags).map(([k, v]) => (
                        <div key={k}>{k}: {String(v)}</div>
                    ))}
                </div>
            )}

            {/* Interact prompt */}
            {showInteractPrompt && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 90,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(30,18,10,0.9)',
                        border: '2px solid #d4a574',
                        padding: '10px 22px',
                        fontSize: 15,
                        color: '#f4e4c1',
                        borderRadius: 4,
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        pointerEvents: 'none',
                        animation: 'promptPulse 1.5s infinite',
                        zIndex: 10,
                    }}
                >
                    Trykk <strong style={{ color: '#d4a574' }}>E</strong> for å interagere
                </div>
            )}

            {/* Screen flash */}
            {showFlash && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255,220,150,0.25)',
                        pointerEvents: 'none',
                        zIndex: 15,
                    }}
                />
            )}

            <style>{`
                @keyframes promptPulse {
                    0%, 100% { box-shadow: 0 0 10px rgba(212,165,116,0.3); }
                    50% { box-shadow: 0 0 25px rgba(212,165,116,0.7); }
                }
                @keyframes toastFadeIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </>
    );
}
