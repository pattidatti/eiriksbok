import { Glider } from './components/Glider';
import { Tunnel } from './components/Tunnel';
import { GateManager } from './components/GateManager';
import { useGameStore } from './store';

export function Scene() {
    const { gameState } = useGameStore();

    return (
        <>
            <Tunnel />

            {/* Only show Glider and Gates when playing or maybe in menu as demo? */}
            <Glider />
            {gameState === 'playing' && <GateManager />}
        </>
    );
}
