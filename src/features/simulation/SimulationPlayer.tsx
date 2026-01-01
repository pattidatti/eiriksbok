import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useSimulationData } from './hooks/useSimulationData';
import { useSimulationActions } from './hooks/useSimulationActions';
import { useSimulationAuth } from './SimulationAuthContext';
import { useSimulation } from './SimulationContext';

import { SimulationHeader } from './components/SimulationHeader';
import { SimulationViewport } from './components/SimulationViewport';
import { SimulationAnimationLayer } from './components/SimulationAnimationLayer';
import { MinigameOverlay } from './SimulationMinigames';
import { LevelUpOverlay } from './components/LevelUpOverlay';
import { SimulationOnboarding } from './components/SimulationOnboarding';
import { Trophy, User as UserIcon } from 'lucide-react';

export const SimulationPlayer: React.FC = () => {
    const { pin } = useParams();
    const [searchParams] = useSearchParams();
    const impersonateId = searchParams.get('impersonate');
    const navigate = useNavigate();

    const { user, account, loading: authLoading } = useSimulationAuth();
    const { activeMinigame, setActiveMinigame, activeMinigameAction, setActiveMinigameAction, activeMinigameMethod, setActiveMinigameMethod } = useSimulation();

    const {
        player, world, players, roomStatus, markets, messages, diplomacy, activeVote, loading: dataLoading, isRetired, hasAttemptedPlayerLoad, onCreatePlayer, isCreating
    } = useSimulationData(pin, impersonateId);

    const {
        handleAction, actionResult, setActionResult, actionLoading
    } = useSimulationActions(pin, player, world);

    const [levelUpData, setLevelUpData] = useState<{ level: number, title: string } | null>(null);

    // Lightweight room object for sub-components
    const room = useMemo(() => ({
        status: roomStatus,
        world,
        players,
        messages,
        markets,
        diplomacy,
        activeVote,
        pin: pin || ''
    }), [roomStatus, world, players, messages, markets, diplomacy, activeVote, pin]);

    if (authLoading || dataLoading || !hasAttemptedPlayerLoad) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-8 p-12">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-indigo-500/20 rounded-full" />
                    <div className="absolute inset-0 w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-2xl font-black italic text-white animate-pulse">Kaller på åndene...</h2>
            </div>
        );
    }

    if (isRetired) {
        return (
            <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 text-center">
                <div className="max-w-md bg-slate-900 border-2 border-indigo-500/30 rounded-[3rem] p-12 space-y-8 shadow-2xl">
                    <Trophy size={48} className="text-white mx-auto animate-bounce" />
                    <h2 className="text-4xl font-black italic text-white">ET LIV ER OVER</h2>
                    <button onClick={() => navigate('/sim')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase">Tilbake til Lobby</button>
                </div>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <SimulationOnboarding pin={pin || ''} account={account} onCreatePlayer={onCreatePlayer} isCreating={isCreating} />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-900 text-white overflow-hidden flex flex-col">
            <div className="flex-1 flex flex-col relative">
                <div className="fixed inset-0 top-0 bg-slate-950 text-slate-200 flex overflow-hidden">
                    {/* Background Atmosphere */}
                    <div className="fixed inset-0 pointer-events-none opacity-20">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
                    </div>

                    {activeMinigame && (
                        <MinigameOverlay
                            type={activeMinigame}
                            playerUpgrades={player.upgrades}
                            equipment={Object.values(player.equipment || {})}
                            skills={player.skills}
                            selectedMethod={activeMinigameMethod || undefined}
                            onComplete={(score) => handleAction({ ...(activeMinigameAction || {}), performance: score, method: activeMinigameMethod })}
                            onCancel={() => { setActiveMinigame(null); setActiveMinigameAction(null); setActiveMinigameMethod(null); }}
                            currentSeason={world?.season || 'Spring'}
                            currentWeather={world?.weather || 'Clear'}
                        />
                    )}

                    <SimulationAnimationLayer />

                    <div className="flex flex-col h-full w-full overflow-hidden">
                        <SimulationHeader room={room} player={player} pin={pin} onAction={handleAction} />
                        <main className="flex-1 relative overflow-hidden bg-slate-950/50">
                            <SimulationViewport
                                player={player}
                                room={room}
                                pin={pin}
                                onAction={handleAction}
                                actionResult={actionResult}
                                onClearActionResult={() => setActionResult(null)}
                            />
                        </main>
                    </div>
                </div>
            </div>

            {levelUpData && (
                <LevelUpOverlay level={levelUpData.level} title={levelUpData.title} onClose={() => setLevelUpData(null)} />
            )}
        </div>
    );
};
