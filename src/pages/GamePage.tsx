import { useParams, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { GameCanvas } from '../games/engine/components/GameCanvas';
import { skjoldborgConfig } from '../games/skjoldborg/SkjoldborgConfig';
import { wattLabConfig } from '../games/watt-lab/WattLabConfig';
import { lindisfarneConfig } from '../games/lindisfarne-793/LindisfarneConfig';
import { fordFactoryConfig } from '../games/ford-factory/FordFactoryConfig';
import { demoWorldConfig } from '../games/demo-world/DemoWorldConfig';
import { blueprintQuestConfig } from '../games/blueprint-quest/BlueprintQuestConfig';
import type { GameConfig } from '../games/engine/types';

// Registry: map game IDs to their configs
const GAME_REGISTRY: Record<string, GameConfig> = {
    skjoldborg: skjoldborgConfig,
    'watt-lab': wattLabConfig,
    'lindisfarne-793': lindisfarneConfig,
    'ford-factory': fordFactoryConfig,
    'demo-world': demoWorldConfig,
    'sokrates-fengsel': blueprintQuestConfig,
};

function GameLoader({ gameId }: { gameId: string }) {
    const config = GAME_REGISTRY[gameId];
    if (!config) return <Navigate to="/oving/spill" replace />;
    return <GameCanvas config={config} />;
}

export function GamePage() {
    const { gameId } = useParams<{ gameId: string }>();
    if (!gameId) return <Navigate to="/oving/spill" replace />;

    return (
        <Suspense
            fallback={
                <div
                    className="flex items-center justify-center"
                    style={{
                        height: 'calc(100dvh - 4rem)',
                        background: '#0a0604',
                        color: '#d4a574',
                        fontFamily: "Georgia, serif",
                        fontSize: 18,
                        letterSpacing: 2,
                    }}
                >
                    Laster spill...
                </div>
            }
        >
            <GameLoader gameId={gameId} />
        </Suspense>
    );
}
