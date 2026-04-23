import { useState } from 'react';
import {
    useGameSettings,
    updateGraphicsSettings,
    type ShadowQuality,
    type QualityTierSetting,
} from '../settings/gameSettings';

interface SettingsMenuProps {
    onResume: () => void;
    // Fase 5.2: save/load-callbacks. Knappene vises kun når callback er satt.
    onSave?: () => void;
    onLoad?: () => void;
    onClearSave?: () => void;
    // Leses én gang når menyen åpnes + bumpes lokalt etter save/slett.
    getHasSave?: () => boolean;
}

type View = 'main' | 'graphics';

const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'rgba(10,6,3,0.78)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
    pointerEvents: 'auto',
    fontFamily: "Georgia, 'Times New Roman', serif",
    color: '#e8d4a8',
};

const panelStyle: React.CSSProperties = {
    minWidth: 420,
    maxWidth: 560,
    padding: '36px 44px',
    background: 'rgba(24,16,10,0.85)',
    border: '1px solid rgba(184,153,104,0.35)',
    boxShadow: '0 18px 60px rgba(0,0,0,0.5)',
};

const titleStyle: React.CSSProperties = {
    fontSize: 22,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: '#d4a574',
    marginBottom: 28,
    textAlign: 'center',
};

const buttonStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '12px 18px',
    marginBottom: 10,
    background: 'transparent',
    border: '1px solid rgba(184,153,104,0.4)',
    color: '#e8d4a8',
    fontFamily: 'inherit',
    fontSize: 15,
    letterSpacing: 2,
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background 0.15s, border-color 0.15s',
};

const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 16,
};

const labelStyle: React.CSSProperties = {
    fontSize: 14,
    letterSpacing: 1,
    color: '#b89968',
    flex: 1,
};

const selectStyle: React.CSSProperties = {
    background: 'rgba(40,28,18,0.9)',
    border: '1px solid rgba(184,153,104,0.4)',
    color: '#e8d4a8',
    padding: '6px 10px',
    fontFamily: 'inherit',
    fontSize: 14,
    cursor: 'pointer',
    minWidth: 120,
};

export function SettingsMenu({ onResume, onSave, onLoad, onClearSave, getHasSave }: SettingsMenuProps) {
    const [view, setView] = useState<View>('main');
    const [flash, setFlash] = useState<string | null>(null);
    // Les hasSave én gang når menyen monteres; local state lar Last inn/Slett
    // reagere umiddelbart etter save/slett uten å re-query storage.
    const [hasSave, setHasSave] = useState<boolean>(() => getHasSave?.() ?? false);
    const settings = useGameSettings();
    const g = settings.graphics;

    const showFlash = (msg: string) => {
        setFlash(msg);
        setTimeout(() => setFlash((cur) => (cur === msg ? null : cur)), 1500);
    };

    return (
        <div style={overlayStyle} role="dialog" aria-label="Spillmeny">
            <div style={panelStyle}>
                {view === 'main' && (
                    <>
                        <p style={titleStyle}>Pauset</p>
                        <button
                            type="button"
                            style={buttonStyle}
                            onClick={onResume}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(184,153,104,0.12)';
                                e.currentTarget.style.borderColor = 'rgba(184,153,104,0.7)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'rgba(184,153,104,0.4)';
                            }}
                        >
                            Fortsett
                        </button>
                        <button
                            type="button"
                            style={buttonStyle}
                            onClick={() => setView('graphics')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(184,153,104,0.12)';
                                e.currentTarget.style.borderColor = 'rgba(184,153,104,0.7)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'rgba(184,153,104,0.4)';
                            }}
                        >
                            Innstillinger
                        </button>
                        {onSave && (
                            <button
                                type="button"
                                style={buttonStyle}
                                onClick={() => {
                                    onSave();
                                    setHasSave(true);
                                    showFlash('Lagret');
                                }}
                            >
                                Lagre
                            </button>
                        )}
                        {onLoad && hasSave && (
                            <button
                                type="button"
                                style={buttonStyle}
                                onClick={() => {
                                    onLoad();
                                    showFlash('Lastet inn');
                                }}
                            >
                                Last inn
                            </button>
                        )}
                        {onClearSave && hasSave && (
                            <button
                                type="button"
                                style={{ ...buttonStyle, borderColor: 'rgba(180,80,60,0.4)', color: '#d8a898' }}
                                onClick={() => {
                                    if (confirm('Slette lagret spill? Dette kan ikke angres.')) {
                                        onClearSave();
                                        setHasSave(false);
                                        showFlash('Lagring slettet');
                                    }
                                }}
                            >
                                Slett lagring
                            </button>
                        )}
                        {flash && (
                            <p style={{ textAlign: 'center', fontSize: 13, color: '#b89968', marginTop: 10 }}>
                                {flash}
                            </p>
                        )}
                    </>
                )}

                {view === 'graphics' && (
                    <>
                        <p style={titleStyle}>Grafikk</p>

                        <div style={rowStyle}>
                            <label htmlFor="settings-postprocessing" style={labelStyle}>
                                Etterbehandling
                            </label>
                            <input
                                id="settings-postprocessing"
                                type="checkbox"
                                checked={g.postProcessing}
                                onChange={(e) =>
                                    updateGraphicsSettings({ postProcessing: e.target.checked })
                                }
                                style={{ width: 18, height: 18, cursor: 'pointer' }}
                            />
                        </div>

                        <div style={rowStyle}>
                            <label htmlFor="settings-quality" style={labelStyle}>
                                Grafikkvalitet
                            </label>
                            <select
                                id="settings-quality"
                                value={g.qualityTier}
                                onChange={(e) =>
                                    updateGraphicsSettings({
                                        qualityTier: e.target.value as QualityTierSetting,
                                    })
                                }
                                style={selectStyle}
                            >
                                <option value="auto">Automatisk</option>
                                <option value="low">Lav</option>
                                <option value="medium">Medium</option>
                                <option value="high">Høy</option>
                            </select>
                        </div>
                        {g.qualityTier !== 'auto' && (
                            <p style={{ fontSize: 11, color: 'rgba(212,165,116,0.6)', margin: '-8px 0 12px', textAlign: 'right' }}>
                                Gjelder ved neste oppstart av spillet
                            </p>
                        )}

                        <div style={rowStyle}>
                            <label htmlFor="settings-shadow" style={labelStyle}>
                                Skyggekvalitet
                            </label>
                            <select
                                id="settings-shadow"
                                value={g.shadowQuality}
                                onChange={(e) =>
                                    updateGraphicsSettings({
                                        shadowQuality: e.target.value as ShadowQuality,
                                    })
                                }
                                style={selectStyle}
                            >
                                <option value="off">Av</option>
                                <option value="low">Lav</option>
                                <option value="high">Høy</option>
                            </select>
                        </div>

                        <div style={rowStyle}>
                            <label htmlFor="settings-renderscale" style={labelStyle}>
                                Render-skala · {g.renderScale.toFixed(2)}x
                            </label>
                            <input
                                id="settings-renderscale"
                                type="range"
                                min={0.5}
                                max={1.0}
                                step={0.05}
                                value={g.renderScale}
                                onChange={(e) =>
                                    updateGraphicsSettings({
                                        renderScale: Number(e.target.value),
                                    })
                                }
                                style={{ flex: '0 0 160px', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={rowStyle}>
                            <label htmlFor="settings-fov" style={labelStyle}>
                                Synsvinkel (FOV) · {g.fov}°
                            </label>
                            <input
                                id="settings-fov"
                                type="range"
                                min={60}
                                max={100}
                                step={1}
                                value={g.fov}
                                onChange={(e) =>
                                    updateGraphicsSettings({ fov: Number(e.target.value) })
                                }
                                style={{ flex: '0 0 160px', cursor: 'pointer' }}
                            />
                        </div>

                        <button
                            type="button"
                            style={{ ...buttonStyle, marginTop: 22 }}
                            onClick={() => setView('main')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(184,153,104,0.12)';
                                e.currentTarget.style.borderColor = 'rgba(184,153,104,0.7)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'rgba(184,153,104,0.4)';
                            }}
                        >
                            Tilbake
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
