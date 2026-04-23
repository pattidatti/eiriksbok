import { useEffect, useRef, useState, useCallback } from 'react';
import { useLayout } from '../../../context/LayoutContext';
import { GameEngine } from '../GameEngine';
import type { GameConfig, GameUIState } from '../types';
import { TitleScreen } from './TitleScreen';
import { EndScreen } from './EndScreen';
import { GameHUD } from './GameHUD';
import { DialogBox } from './DialogBox';
import { PuzzleUI } from './PuzzleUI';
import { MonologBox } from './MonologBox';
import { IntroOverlay } from './IntroRunner';
import { SettingsMenu } from './SettingsMenu';
import { DebugHud } from './DebugHud';
import type { DebugStats } from '../systems/DebugHudSystem';
import { PhotoModeUI } from './PhotoModeUI';

interface GameCanvasProps {
    config: GameConfig;
}

const defaultUIState: GameUIState = {
    started: false,
    questObjective: '',
    questParts: [],
    showInteractPrompt: false,
    dialog: null,
    puzzle: null,
    monolog: null,
    ended: false,
    endText: '',
};

export function GameCanvas({ config }: GameCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<GameEngine | null>(null);
    const [uiState, setUIState] = useState<GameUIState>(defaultUIState);
    const [toast, setToast] = useState('');
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [fadeState, setFadeState] = useState({ opacity: 0, durationMs: 400 });
    const [debugVisible, setDebugVisible] = useState(false);
    const [photoMode, setPhotoMode] = useState(false);
    const { setFullWidth } = useLayout();

    // F3 toggler Debug-HUD. P toggler fotomodus (Fase 3.3).
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code === 'F3') {
                e.preventDefault();
                setDebugVisible((v) => !v);
            } else if (e.code === 'KeyP' && !e.repeat) {
                const engine = engineRef.current;
                if (engine) {
                    const active = engine.togglePhotoMode();
                    setPhotoMode(active);
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const handlePhotoScreenshot = useCallback(() => {
        engineRef.current?.captureScreenshot();
    }, []);

    const handlePhotoExposure = useCallback((exposure: number) => {
        engineRef.current?.setPhotoExposure(exposure);
    }, []);

    const handlePhotoLut = useCallback((name: string | null) => {
        engineRef.current?.setPhotoLut(name);
    }, []);

    const handlePhotoExit = useCallback(() => {
        const engine = engineRef.current;
        if (engine) {
            engine.togglePhotoMode();
            setPhotoMode(false);
        }
    }, []);

    const getDebugStats = useCallback((): DebugStats => {
        const stats = engineRef.current?.getDebugStats();
        if (stats) return stats;
        return {
            fps: 0,
            frameMs: 0,
            drawCalls: 0,
            triangles: 0,
            geometries: 0,
            textures: 0,
            programs: 0,
            materials: 0,
            physicsBodies: 0,
            phase: '-',
            qualityTier: 'medium',
            flags: {},
        };
    }, []);

    // Expand layout
    useEffect(() => {
        setFullWidth(true);
        return () => setFullWidth(false);
    }, [setFullWidth]);

    // Initialize engine
    useEffect(() => {
        if (!containerRef.current) return;

        const engine = new GameEngine({
            container: containerRef.current,
            config,
            onUIUpdate: (state) => setUIState((prev) => ({ ...prev, ...state })),
            onStart: () => {},
            onEnd: (text) => {
                setUIState((prev) => ({ ...prev, ended: true, endText: text }));
            },
            onCollect: (name) => {
                setToast(name);
                if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                toastTimerRef.current = setTimeout(() => setToast(''), 2000);
            },
            onFade: (visible, durationMs) => {
                return new Promise<void>((resolve) => {
                    setFadeState({ opacity: visible ? 1 : 0, durationMs });
                    setTimeout(resolve, durationMs);
                });
            },
        });

        engineRef.current = engine;
        engine.start();

        return () => {
            engine.dispose();
            engineRef.current = null;
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, [config]);

    const handleStart = useCallback(() => {
        engineRef.current?.startGame();
        setUIState((prev) => ({ ...prev, started: true }));
    }, []);

    const handleDialogChoice = useCallback((index: number) => {
        engineRef.current?.handleDialogChoice(index);
    }, []);

    const handlePuzzleAnswer = useCallback((index: number) => {
        engineRef.current?.handlePuzzleAnswer(index);
    }, []);

    const handleRestart = useCallback(() => {
        window.location.reload();
    }, []);

    const handleSkipIntro = useCallback(() => {
        engineRef.current?.skipIntro();
    }, []);

    const handleResumeFromMenu = useCallback(() => {
        const canvas = containerRef.current?.querySelector('canvas');
        canvas?.requestPointerLock();
    }, []);

    return (
        <div
            className="relative w-full overflow-hidden bg-stone-900"
            style={{ height: 'calc(100dvh - 4rem)' }}
        >
            {/* Three.js canvas — cinematic effects handled by shader (all devices) */}
            <div ref={containerRef} className="absolute inset-0" />

            {/* Title screen */}
            {!uiState.started && !uiState.ended && (
                <TitleScreen config={config} onStart={handleStart} />
            )}

            {/* Game HUD */}
            {uiState.started && !uiState.ended && (
                <GameHUD
                    questObjective={uiState.questObjective}
                    questParts={uiState.questParts}
                    showInteractPrompt={uiState.showInteractPrompt}
                    showFlash={!!uiState.showFlash}
                    toast={toast}
                    debug={uiState.debug}
                    qualityTier={uiState.qualityTier}
                />
            )}

            {/* Intro overlay (Fase 5) */}
            {uiState.started && !uiState.ended && uiState.intro?.active && (
                <IntroOverlay
                    title={uiState.intro.title}
                    subtitle={uiState.intro.subtitle}
                    skippable={uiState.intro.skippable}
                    onSkip={handleSkipIntro}
                />
            )}

            {/* Settings menu (erstatter pause-overlay) */}
            {uiState.started && !uiState.ended && uiState.paused && (
                <SettingsMenu onResume={handleResumeFromMenu} />
            )}

            {/* Dialog box */}
            {uiState.started && !uiState.ended && uiState.dialog && (
                <DialogBox dialog={uiState.dialog} onChoice={handleDialogChoice} />
            )}

            {/* Puzzle UI */}
            {uiState.started && !uiState.ended && uiState.puzzle && (
                <PuzzleUI puzzle={uiState.puzzle} onAnswer={handlePuzzleAnswer} />
            )}

            {/* Indre monolog (ikke-blokkerende) */}
            {uiState.started && !uiState.ended && (
                <MonologBox monolog={uiState.monolog} />
            )}

            {/* Crosshair */}
            {uiState.started && !uiState.ended && !uiState.paused && !uiState.dialog && !uiState.puzzle && !uiState.intro?.active && (
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.9)',
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}
                />
            )}

            {/* Debug-HUD (F3) */}
            {debugVisible && <DebugHud getStats={getDebugStats} />}

            {/* Fotomodus-UI (P) */}
            {photoMode && (
                <PhotoModeUI
                    onScreenshot={handlePhotoScreenshot}
                    onExposureChange={handlePhotoExposure}
                    onLutChange={handlePhotoLut}
                    onExit={handlePhotoExit}
                />
            )}

            {/* End screen */}
            {uiState.ended && (
                <EndScreen text={uiState.endText} onRestart={handleRestart} />
            )}

            {/* Fade-overlay (CameraDirector) */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#000',
                    opacity: fadeState.opacity,
                    transition: `opacity ${fadeState.durationMs}ms ease-in-out`,
                    pointerEvents: fadeState.opacity > 0.5 ? 'auto' : 'none',
                    zIndex: 100,
                }}
            />
        </div>
    );
}
