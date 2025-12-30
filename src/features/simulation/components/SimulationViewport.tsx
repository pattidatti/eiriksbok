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
        <main className="flex-1 relative flex flex-col bg-slate-900 overflow-hidden">
            <div className={`flex-1 relative ${activeTab === 'MAP' || activeTab === 'PRODUCTION' || activeTab === 'MARKET' ? 'p-6 overflow-hidden flex items-center justify-center' : 'p-8 overflow-y-auto overflow-x-hidden custom-scrollbar'}`}>
                {/* Always render WorldMap when in MAP, PRODUCTION or MARKET to keep it as background */}
                {(activeTab === 'MAP' || activeTab === 'PRODUCTION' || activeTab === 'MARKET') && (
                    <WorldMap
                        player={player}
                        room={room}
                        world={room.world}
                        worldEvents={room.worldEvents}
                        players={room.players}
                        onAction={onAction}
                        onOpenMarket={() => setActiveTab('MARKET')}
                    />
                )}

                {/* Overlays */}
                {activeTab === 'PRODUCTION' && (
                    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-950/60 backdrop-blur-md p-8 animate-in fade-in duration-500 flex items-center justify-center">
                        <SimulationProduction player={player} room={room} onAction={onAction} />
                    </div>
                )}

                {activeTab === 'MARKET' && (
                    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-950/60 backdrop-blur-md p-8 animate-in fade-in duration-500 flex items-center justify-center">
                        <SimulationMarket
                            player={player}
                            market={room.markets?.[player.regionId || 'capital'] || room.market}
                            regions={room.regions}
                            allMarkets={room.markets}
                            onAction={onAction}
                        />
                    </div>
                )}

                {/* Other Tabs (Fullscreen/Full Viewport) */}
                {activeTab !== 'MAP' && activeTab !== 'PRODUCTION' && activeTab !== 'MARKET' && (
                    <div className={`${activeTab === 'INVENTORY' ? 'max-w-6xl' : 'max-w-4xl'} mx-auto w-full space-y-8 animate-in slide-in-from-bottom-4 duration-500`}>
                        {activeTab === 'INVENTORY' ? (
                            <SimulationVault player={player} onAction={onAction} />
                        ) : activeTab === 'ACTIVITY' ? (
                            <SimulationActivity messages={room.messages} />
                        ) : activeTab === 'SKILLS' ? (
                            <SimulationSkills player={player} />
                        ) : activeTab === 'DIPLOMACY' ? (
                            <SimulationDiplomacy
                                player={player}
                                diplomacy={room.diplomacy}
                                pin={pin || ''}
                            />
                        ) : activeTab === 'HIERARCHY' ? (
                            <SimulationHierarchy
                                players={room.players}
                                currentPlayer={player}
                                regions={room.regions}
                                onAction={onAction}
                            />
                        ) : activeTab === 'PROFILE' ? (
                            <SimulationProfile
                                player={player}
                                regions={room.regions || {}}
                                allPlayers={room.players || {}}
                            />
                        ) : activeTab === 'SETTINGS' ? (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-8 animate-in fade-in duration-300">
                                <SimulationSettings onClose={() => setActiveTab('MAP')} />
                            </div>
                        ) : null}

                    </div>
                )}
            </div>

            {/* Ting Voting Overlay */}
            {room.activeVote && !room.activeVote.votes?.[player.id] && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="max-w-xl w-full bg-slate-900 rounded-[3rem] border-2 border-indigo-500/30 p-12 shadow-[0_0_100px_rgba(79,70,229,0.3)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                        <div className="mb-10 text-center">
                            <div className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Tinget er satt</div>
                            <h2 className="text-4xl font-black text-white tracking-tighter mb-4">{room.activeVote.title}</h2>
                            <p className="text-slate-400 font-medium leading-relaxed">{room.activeVote.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => update(ref(db, `simulation_rooms/${pin}/activeVote/votes`), { [player.id]: 'YES' })}
                                className="bg-emerald-600 text-white h-24 rounded-2xl font-black text-xl hover:bg-emerald-500 transition-all shadow-lg active:scale-95 outline-none ring-offset-2 ring-offset-slate-900 focus:ring-2 ring-emerald-400"
                            >
                                ✅ VEDTA
                            </button>
                            <button
                                onClick={() => update(ref(db, `simulation_rooms/${pin}/activeVote/votes`), { [player.id]: 'NO' })}
                                className="bg-rose-600 text-white h-24 rounded-2xl font-black text-xl hover:bg-rose-500 transition-all shadow-lg active:scale-95 outline-none ring-offset-2 ring-offset-slate-900 focus:ring-2 ring-rose-400"
                            >
                                ❌ AVSLÅ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ActionResultOverlay
                result={actionResult}
                onClear={onClearActionResult}
            />
        </main>
    );
};


