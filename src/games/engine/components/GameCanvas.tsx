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
    const { setFullWidth } = useLayout();

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
                />
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

            {/* End screen */}
            {uiState.ended && (
                <EndScreen text={uiState.endText} onRestart={handleRestart} />
            )}
        </div>
    );
}
