import { useEffect, useRef, useState, useCallback } from 'react';
import { useLayout } from '../../../context/LayoutContext';
import { GameEngine } from '../GameEngine';
import type { GameConfig, GameUIState } from '../types';
import { TitleScreen } from './TitleScreen';
import { EndScreen } from './EndScreen';
import { GameHUD } from './GameHUD';
import { DialogBox } from './DialogBox';
import { PuzzleUI } from './PuzzleUI';

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
    ended: false,
    endText: '',
};

export function GameCanvas({ config }: GameCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<GameEngine | null>(null);
    const [uiState, setUIState] = useState<GameUIState>(defaultUIState);
    const [flash, setFlash] = useState(false);
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
        });

        engineRef.current = engine;
        engine.start();

        return () => {
            engine.dispose();
            engineRef.current = null;
        };
    }, [config]);

    // Flash effect
    const triggerFlash = useCallback(() => {
        setFlash(true);
        setTimeout(() => setFlash(false), 200);
    }, []);

    const handleStart = useCallback(() => {
        engineRef.current?.startGame();
        setUIState((prev) => ({ ...prev, started: true }));
    }, []);

    const handleDialogChoice = useCallback((index: number) => {
        engineRef.current?.handleDialogChoice(index);
    }, []);

    const handlePuzzleAnswer = useCallback(
        (index: number) => {
            engineRef.current?.handlePuzzleAnswer(index);
            triggerFlash();
        },
        [triggerFlash]
    );

    const handleRestart = useCallback(() => {
        window.location.reload();
    }, []);

    return (
        <div
            className="relative w-full overflow-hidden bg-stone-900"
            style={{ height: 'calc(100dvh - 4rem)' }}
        >
            {/* Three.js canvas container */}
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
                    showFlash={flash}
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

            {/* End screen */}
            {uiState.ended && (
                <EndScreen text={uiState.endText} onRestart={handleRestart} />
            )}
        </div>
    );
}
