import { useState } from 'react';

interface PhotoModeUIProps {
    onScreenshot: () => void;
    onExposureChange: (exposure: number) => void;
    onLutChange: (name: string | null) => void;
    onExit: () => void;
}

export function PhotoModeUI({ onScreenshot, onExposureChange, onLutChange, onExit }: PhotoModeUIProps) {
    const [exposure, setExposure] = useState(1.8);
    const [lut, setLut] = useState<string>('none');

    return (
        <div
            style={{
                position: 'absolute',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(10,10,14,0.85)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 6,
                padding: '14px 18px',
                display: 'flex',
                gap: 20,
                alignItems: 'center',
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: '#e6e6e8',
                backdropFilter: 'blur(8px)',
                zIndex: 25,
                pointerEvents: 'auto',
            }}
        >
            <div style={{ fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#d4a574' }}>
                Fotomodus
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ opacity: 0.7 }}>Eksponering: {exposure.toFixed(2)}</label>
                <input
                    type="range"
                    min={0.5}
                    max={3.5}
                    step={0.05}
                    value={exposure}
                    onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setExposure(v);
                        onExposureChange(v);
                    }}
                    style={{ width: 140 }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ opacity: 0.7 }}>LUT</label>
                <select
                    value={lut}
                    onChange={(e) => {
                        const v = e.target.value;
                        setLut(v);
                        onLutChange(v === 'none' ? null : v);
                    }}
                    style={{
                        background: 'rgba(255,255,255,0.08)',
                        color: '#e6e6e8',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 3,
                        padding: '3px 6px',
                        fontSize: 12,
                    }}
                >
                    <option value="none">Av</option>
                    <option value="neutral">Nøytral</option>
                </select>
            </div>

            <button
                onClick={onScreenshot}
                style={{
                    background: '#d4a574',
                    color: '#1a0f08',
                    border: 'none',
                    borderRadius: 3,
                    padding: '8px 16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 12,
                }}
            >
                Ta bilde
            </button>

            <button
                onClick={onExit}
                style={{
                    background: 'transparent',
                    color: '#b89968',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    padding: '8px 14px',
                    cursor: 'pointer',
                    fontSize: 12,
                }}
            >
                Lukk (P)
            </button>

            <div style={{ opacity: 0.5, fontSize: 11, marginLeft: 'auto' }}>
                WASD fly · Space opp · Ctrl/Q ned · Shift raskere
            </div>
        </div>
    );
}
