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
    throwCharge?: number | null;
    launcherAmmo?: number | null;
}

export function GameHUD({ questObjective, questParts, showInteractPrompt: _si, showFlash, toast, debug, qualityTier, throwCharge, launcherAmmo }: GameHUDProps) {
    void _si;
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
                        color: '#90c090',
                        fontSize: 14,
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        textShadow:
                            '0 2px 10px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.7)',
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


            {/* Ladnings-meter (Fase 8: hold F = lad) */}
            {throwCharge != null && (
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: '22%',
                        transform: 'translateX(-50%)',
                        width: 140,
                        height: 10,
                        background: 'rgba(0,0,0,0.55)',
                        border: '1px solid rgba(255,210,122,0.5)',
                        borderRadius: 5,
                        overflow: 'hidden',
                        pointerEvents: 'none',
                        zIndex: 13,
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            width: `${Math.round(throwCharge * 100)}%`,
                            background: `linear-gradient(90deg, #ffd27a, ${throwCharge > 0.8 ? '#ff6a1a' : '#ffae42'})`,
                            transition: 'width 0.05s linear',
                        }}
                    />
                </div>
            )}

            {/* Ammunisjon (Fase 8: utrustet launcher) */}
            {launcherAmmo != null && (
                <div
                    style={{
                        position: 'absolute',
                        right: 20,
                        bottom: 120,
                        background: 'rgba(30,18,10,0.85)',
                        border: '1px solid #5c4228',
                        padding: '8px 14px',
                        borderRadius: 4,
                        color: '#f4e4c1',
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        fontSize: 15,
                        pointerEvents: 'none',
                        zIndex: 11,
                    }}
                >
                    <span style={{ color: '#d4a574', letterSpacing: 1 }}>Ammo</span>{' '}
                    <strong>{launcherAmmo}</strong>
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
