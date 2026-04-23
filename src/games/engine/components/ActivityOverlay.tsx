import type { ActivityUIState } from '../types';

interface Props {
    activity: ActivityUIState;
}

export function ActivityOverlay({ activity }: Props) {
    const { label, prompt, variant, progress, beatActive, holdFill } = activity;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.55)',
                zIndex: 50,
                pointerEvents: 'none',
                userSelect: 'none',
            }}
        >
            <div
                style={{
                    background: 'rgba(15,15,20,0.92)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    padding: '28px 40px',
                    width: 340,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 18,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                }}
            >
                {/* Tittel */}
                <div style={{ color: '#e8d5a0', fontSize: 18, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>
                    {label}
                </div>

                {/* Variant-spesifikt element */}
                {variant === 'rhythm' && (
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: beatActive ? '#f5c842' : 'rgba(255,255,255,0.08)',
                            border: `3px solid ${beatActive ? '#f5c842' : 'rgba(255,255,255,0.2)'}`,
                            transition: beatActive ? 'background 0.05s, border-color 0.05s' : 'background 0.18s, border-color 0.18s',
                            boxShadow: beatActive ? '0 0 24px rgba(245,200,66,0.6)' : 'none',
                        }}
                    />
                )}

                {variant === 'hold' && (
                    <div style={{ width: '100%', height: 20, background: 'rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div
                            style={{
                                height: '100%',
                                width: `${holdFill * 100}%`,
                                background: holdFill > 0.85 ? '#4ade80' : '#60a5fa',
                                borderRadius: 10,
                                transition: 'width 0.05s, background 0.2s',
                            }}
                        />
                    </div>
                )}

                {/* Framdriftsbar (total aktivitet) */}
                <div style={{ width: '100%' }}>
                    <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                width: `${progress * 100}%`,
                                background: 'rgba(255,255,255,0.5)',
                                borderRadius: 4,
                                transition: 'width 0.15s linear',
                            }}
                        />
                    </div>
                </div>

                {/* Instruksjon */}
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                    {prompt}
                </div>
            </div>
        </div>
    );
}
