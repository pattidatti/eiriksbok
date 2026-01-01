import React from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../../../lib/firebase';
import type { SimulationPlayer, SimulationRoom } from '../simulationTypes';
import { useSimulation } from '../SimulationContext';
import { WorldMap } from '../WorldMap';
import { SimulationMarket } from './SimulationMarket';
import { SimulationVault } from './SimulationVault';
import { SimulationSkills } from './SimulationSkills';
import { SimulationProduction } from './SimulationProduction';
import { SimulationActivity } from './SimulationActivity';
import { SimulationDiplomacy } from './SimulationDiplomacy';
import { SimulationHierarchy } from './SimulationHierarchy';
import { SimulationProfile } from './SimulationProfile';
import { SimulationSettings } from './SimulationSettings';




interface SimulationViewportProps {
    player: SimulationPlayer;
    room: SimulationRoom;
    pin?: string;
    onAction: (action: any) => void;
    actionResult: any | null;
    onClearActionResult: () => void;
}

import { ActionResultOverlay } from './ActionResultOverlay';

export const SimulationViewport: React.FC<SimulationViewportProps> = ({ player, room, pin, onAction, actionResult, onClearActionResult }) => {
    const { activeTab, setActiveTab } = useSimulation();

    // Main Content Switcher


    // Main Content Switcher
    return (
        <div className="flex-1 relative flex flex-col overflow-hidden w-full h-full">
            {/* HUD Moved to WorldMap for better layout context */}
            <div className={`flex-1 relative w-full h-full ${['MAP', 'PRODUCTION', 'MARKET', 'INVENTORY', 'SKILLS', 'DIPLOMACY', 'HIERARCHY', 'PROFILE'].includes(activeTab) ? 'p-4 md:p-6 overflow-hidden flex items-center justify-center' : 'p-4 md:p-8 overflow-y-auto overflow-x-hidden custom-scrollbar'}`}>
                {/* Always render WorldMap when in these tabs to keep it as background */}
                {/* LAYER 0: Background World Map (Always rendered in simulation modes) */}
                {['MAP', 'PRODUCTION', 'MARKET', 'INVENTORY', 'SKILLS', 'DIPLOMACY', 'HIERARCHY', 'PROFILE'].includes(activeTab) && (
                    <div className="absolute inset-0 z-0">
                        <WorldMap
                            player={player}
                            room={room}
                            world={room.world}
                            worldEvents={room.worldEvents}
                            players={room.players}
                            onAction={onAction}
                            onOpenMarket={() => setActiveTab('MARKET')}
                        />
                    </div>
                )}

                {/* LAYER 1: UI Overlays (Absolute positioning on top of Map) */}
                <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">

                    {activeTab === 'PRODUCTION' && (
                        <div className="pointer-events-auto w-full h-full md:max-w-4xl md:h-auto md:max-h-[85vh] overflow-hidden">
                            <SimulationProduction player={player} room={room} onAction={onAction} />
                        </div>
                    )}

                    {activeTab === 'MARKET' && (
                        <div className="pointer-events-auto w-full h-full md:max-w-5xl md:h-[90vh] overflow-hidden">
                            <SimulationMarket
                                player={player}
                                market={room.markets?.[player.regionId || 'capital'] || room.market}
                                regions={room.regions}
                                allMarkets={room.markets}
                                onAction={onAction}
                            />
                        </div>
                    )}

                    {activeTab === 'INVENTORY' && (
                        <div className="pointer-events-auto w-full h-full md:max-w-3xl md:h-[80vh] overflow-hidden">
                            <SimulationVault player={player} onAction={onAction} />
                        </div>
                    )}

                    {activeTab === 'SKILLS' && (
                        <div className="pointer-events-auto w-full h-full md:max-w-4xl md:h-auto overflow-hidden">
                            <SimulationSkills player={player} />
                        </div>
                    )}

                    {activeTab === 'DIPLOMACY' && (
                        <div className="pointer-events-auto w-full h-full md:max-w-6xl md:h-[90vh] overflow-hidden">
                            <SimulationDiplomacy player={player} diplomacy={room.diplomacy} pin={pin || ''} />
                        </div>
                    )}

                    {activeTab === 'HIERARCHY' && (
                        <div className="pointer-events-auto w-full h-full md:max-w-5xl md:h-[85vh] overflow-hidden">
                            <SimulationHierarchy
                                players={room.players}
                                currentPlayer={player}
                                regions={room.regions}
                                onAction={onAction}
                            />
                        </div>
                    )}

                    {activeTab === 'PROFILE' && (
                        <div className="pointer-events-auto w-full h-full md:max-w-2xl md:h-[85vh] overflow-hidden">
                            <SimulationProfile
                                player={player}
                                regions={room.regions || {}}
                                allPlayers={room.players || {}}
                            />
                        </div>
                    )}
                </div>


                {/* Other Tabs (Fullscreen/Full Viewport - No Map Background) */}
                {activeTab !== 'MAP' && !['PRODUCTION', 'MARKET', 'INVENTORY', 'SKILLS', 'DIPLOMACY', 'HIERARCHY', 'PROFILE'].includes(activeTab) && (
                    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in slide-in-from-bottom-4 duration-500 relative z-20">
                        {activeTab === 'SETTINGS' ? (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-8 animate-in fade-in duration-300">
                                <SimulationSettings onClose={() => setActiveTab('MAP')} />
                            </div>
                        ) : activeTab === 'ACTIVITY' ? (
                            <SimulationActivity messages={room.messages} />
                        ) : null}

                    </div>
                )}
            </div>

            {/* Ting Voting Notification (Optimized: Non-intrusive bottom-right toast) */}
            {
                room.activeVote && !room.activeVote.votes?.[player.id] && (
                    <div className="absolute bottom-6 right-6 z-[50] w-96 animate-in slide-in-from-right duration-500">
                        <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-indigo-500/50 p-6 shadow-2xl shadow-indigo-500/10">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-white font-bold text-lg leading-tight mb-1">Tinget er satt</h3>
                                    <p className="text-indigo-300 text-xs font-medium uppercase tracking-wider">Avgi din stemme</p>
                                </div>
                                <div className="bg-indigo-500/20 p-2 rounded-lg">
                                    <span className="text-2xl">📜</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-white font-medium mb-2">{room.activeVote.title}</h4>
                                <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">{room.activeVote.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => update(ref(db, `simulation_rooms/${pin}/activeVote/votes`), { [player.id]: 'YES' })}
                                    className="bg-emerald-600/80 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>✅</span> VEDTA
                                </button>
                                <button
                                    onClick={() => update(ref(db, `simulation_rooms/${pin}/activeVote/votes`), { [player.id]: 'NO' })}
                                    className="bg-rose-600/80 hover:bg-rose-500 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>❌</span> AVSLÅ
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <ActionResultOverlay
                result={actionResult}
                onClear={onClearActionResult}
            />
        </div >
    );
};


