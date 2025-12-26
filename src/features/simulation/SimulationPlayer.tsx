import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../../lib/firebase';
import type { SimulationPlayer, SimulationRoom } from './types';
import { ROLE_DEFINITIONS, UPGRADES_LIST } from './constants';
import { performAction } from './actions';
import { WorldMap } from './WorldMap';

export const SimulationPlayer: React.FC = () => {
    const { pin } = useParams();
    const [player, setPlayer] = useState<SimulationPlayer | null>(null);
    const [room, setRoom] = useState<SimulationRoom | null>(null);
    const [activeTab, setActiveTab] = useState<'MAP' | 'MARKET' | 'UPGRADES'>('MAP');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        const playerId = sessionStorage.getItem('sim_player_id');
        if (!playerId || !pin) return;

        const playerRef = ref(db, `simulation_rooms/${pin}/players/${playerId}`);
        const roomRef = ref(db, `simulation_rooms/${pin}`);

        const unsubPlayer = onValue(playerRef, (snap) => {
            const data = snap.val();
            if (data) setPlayer(data);
        });

        const unsubRoom = onValue(roomRef, (snap) => {
            const data = snap.val();
            if (data) setRoom(data);
        });

        return () => {
            unsubPlayer();
            unsubRoom();
        };
    }, [pin]);

    const handleAction = async (action: any) => {
        if (!pin || !player || actionLoading) return;

        setActionLoading(typeof action === 'string' ? action : action.type);
        const result = await performAction(pin, player.id, action);
        if (!result.success) alert("Handling mislyktes");
        setActionLoading(null);
    };

    if (!player || !room) return <div className="p-8 text-center text-white">Laster data...</div>;

    if (room.status === 'LOBBY') {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8" >
                <div className="animate-pulse text-6xl mb-8">⏳</div>
                <h1 className="text-3xl font-bold mb-4">Venter på Kongen...</h1>
                <p className="text-slate-400">Du er registrert som <strong className="text-white">{player.name}</strong></p>
            </div >
        );
    }

    const RoleIcon = {
        KING: '👑',
        BARON: '🏰',
        PEASANT: '🌾',
        SOLDIER: '⚔️',
        MERCHANT: '💰'
    }[player.role] || '❓';

    const staminaWidth = player.status.stamina || 0;

    return (
        <div className="min-h-screen bg-slate-100 pb-24">
            {/* Header */}
            <div className="bg-indigo-900 text-white p-4 shadow-lg sticky top-0 z-50">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">{RoleIcon}</div>
                        <div>
                            <div className="font-bold text-lg leading-none">{player.name}</div>
                            <div className="text-indigo-300 text-[10px] font-mono uppercase tracking-widest">{ROLE_DEFINITIONS[player.role]?.label}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-mono text-xl font-black text-yellow-400">{player.resources.gold} 💰</div>
                    </div>
                </div>
                {/* Stamina Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-indigo-400">
                        <span>Energi / Utholdenhet</span>
                        <span>{Math.round(staminaWidth)}%</span>
                    </div>
                    <div className="h-2 bg-indigo-950 rounded-full overflow-hidden border border-indigo-800">
                        <div
                            className={`h-full transition-all duration-500 ${staminaWidth > 50 ? 'bg-green-500' : staminaWidth > 20 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}
                            style={{ width: `${staminaWidth}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-4 space-y-4">
                {/* Tabs */}
                <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200">
                    <button
                        onClick={() => setActiveTab('MAP')}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'MAP' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
                    >
                        Verden 🗺️
                    </button>
                    <button
                        onClick={() => setActiveTab('MARKET')}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'MARKET' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
                    >
                        Marked ⚖️
                    </button>
                    <button
                        onClick={() => setActiveTab('UPGRADES')}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'UPGRADES' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
                    >
                        Bygg 🏗️
                    </button>
                </div>

                {activeTab === 'MAP' ? (
                    <div className="space-y-4">
                        {/* Resource Summary */}
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(player.resources).map(([res, amount]) => {
                                if (res === 'gold') return null;
                                return (
                                    <div key={res} className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 text-center">
                                        <div className="text-[10px] uppercase text-slate-400 font-black mb-1">{res}</div>
                                        <div className="font-black text-lg text-slate-800">{amount}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* The Map Component */}
                        <WorldMap
                            player={player}
                            room={room}
                            onAction={handleAction}
                            onOpenMarket={() => setActiveTab('MARKET')}
                        />

                        {actionLoading && (
                            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full shadow-2xl z-50 animate-bounce text-sm font-bold">
                                Utfører handling... ⏳
                            </div>
                        )}
                    </div>
                ) : activeTab === 'MARKET' ? (
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-3xl shadow-md border-b-4 border-amber-100">
                            <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">Markedsplassen ⚖️</h2>

                            {/* Grain Card */}
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-4">
                                <div className="flex justify-between items-center mb-5">
                                    <div className="font-black text-lg flex items-center gap-2">Korn 🌾</div>
                                    <div className="text-3xl font-black text-indigo-600">{room.market.grain.price.toFixed(1)} <span className="text-sm font-mono tracking-tight text-slate-400">💰</span></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleAction('BUY_GRAIN')}
                                        disabled={!!actionLoading || player.resources.gold < room.market.grain.price}
                                        className="bg-green-600 text-white py-4 rounded-xl font-black shadow-lg disabled:opacity-40"
                                    >
                                        KJØP 1
                                    </button>
                                    <button
                                        onClick={() => handleAction('SELL_GRAIN')}
                                        disabled={!!actionLoading || (player.resources.grain || 0) < 1}
                                        className="bg-amber-600 text-white py-4 rounded-xl font-black shadow-lg disabled:opacity-40"
                                    >
                                        SELG 1
                                    </button>
                                </div>
                            </div>

                            {/* Wood Card */}
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                <div className="flex justify-between items-center mb-5">
                                    <div className="font-black text-lg flex items-center gap-2">Treverk 🪵</div>
                                    <div className="text-3xl font-black text-indigo-600">{room.market.wood.price.toFixed(1)} <span className="text-sm font-mono tracking-tight text-slate-400">💰</span></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleAction('BUY_WOOD')}
                                        disabled={!!actionLoading || player.resources.gold < room.market.wood.price}
                                        className="bg-green-600 text-white py-4 rounded-xl font-black shadow-lg disabled:opacity-40"
                                    >
                                        KJØP 5
                                    </button>
                                    <button
                                        onClick={() => handleAction('SELL_WOOD')}
                                        disabled={!!actionLoading || (player.resources.wood || 0) < 5}
                                        className="bg-amber-600 text-white py-4 rounded-xl font-black shadow-lg disabled:opacity-40"
                                    >
                                        SELG 5
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-3xl shadow-md border-b-4 border-emerald-100">
                            <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">Oppgraderinger 🏗️</h2>
                            <div className="space-y-3">
                                {UPGRADES_LIST[player.role]?.map(upg => {
                                    const isOwned = player.upgrades?.includes(upg.id);
                                    let canAfford = true;
                                    Object.entries(upg.cost || {}).forEach(([res, amt]) => {
                                        if ((player.resources as any)[res] < (amt as number)) canAfford = false;
                                    });

                                    return (
                                        <div key={upg.id} className={`p-4 rounded-2xl border-2 transition-all ${isOwned ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-slate-800">{upg.name} {isOwned && '✅'}</h3>
                                                <div className="flex gap-2">
                                                    {Object.entries(upg.cost || {}).map(([res, amt]) => (
                                                        <span key={res} className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 font-mono font-bold">{amt} {res}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-4">{upg.description}</p>
                                            {!isOwned && (
                                                <button
                                                    onClick={() => handleAction({ type: 'UPGRADE', upgradeId: upg.id })}
                                                    disabled={!!actionLoading || !canAfford}
                                                    className={`w-full py-3 rounded-xl font-black uppercase tracking-widest transition-all ${canAfford ? 'bg-emerald-600 text-white shadow-lg active:scale-95' : 'bg-slate-200 text-slate-400'}`}
                                                >
                                                    Utfør Oppgradering
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* World Feed */}
                <div className="bg-slate-900 text-indigo-300 p-5 rounded-3xl shadow-inner max-h-56 overflow-y-auto font-mono text-[10px] border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-indigo-500 font-black uppercase tracking-widest">Global Logg</h3>
                        <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="space-y-1.5">
                        {room.messages?.slice().reverse().map((msg: any, idx: number) => (
                            <div key={idx} className="opacity-80 border-l-2 border-indigo-800 pl-3 py-1 bg-white/5 rounded-r-md">{msg}</div>
                        ))}
                        {(!room.messages || room.messages.length === 0) && <div className="text-slate-600 italic py-8 text-center">Riket er foreløpig stille...</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
