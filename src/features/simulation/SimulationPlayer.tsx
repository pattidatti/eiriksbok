import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';

import { db } from '../../lib/firebase';
import type { SimulationPlayer as SimulationPlayerType, SimulationRoom } from './types';
import { ROLE_DEFINITIONS, UPGRADES_LIST, SEASONS, LEVEL_XP, ROLE_TITLES } from './constants';

import { performAction } from './actions';
import { WorldMap } from './WorldMap';
import { MinigameOverlay } from './SimulationMinigames';


export const SimulationPlayer: React.FC = () => {
    const { pin } = useParams();
    const [player, setPlayer] = useState<SimulationPlayerType | null>(null);
    const [room, setRoom] = useState<SimulationRoom | null>(null);
    const [activeTab, setActiveTab] = useState<'MAP' | 'MARKET' | 'UPGRADES' | 'DIPLOMACY'>('MAP');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeMinigame, setActiveMinigame] = useState<'WORK' | 'CHOP' | 'CRAFT' | 'MILL' | 'DEFEND' | 'EXPLORE' | 'MINE' | null>(null);


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

        const actionType = typeof action === 'string' ? action : action.type;

        // Trigger Minigame for work/chop/mill/craft/defend/explore/mine if not already in one
        const minigameTypes = ['WORK', 'CHOP', 'MILL', 'CRAFT', 'DEFEND', 'EXPLORE', 'MINE'];
        if (minigameTypes.includes(actionType) && !activeMinigame && (!action.performance)) {
            setActiveMinigame(actionType as any);
            return;
        }

        setActionLoading(actionType);
        const result = await performAction(pin, player.id, action);
        if (!result.success) {
            // Error handled by actions.ts messages mostly, but can alert if needed
        }
        setActionLoading(null);
        setActiveMinigame(null);
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
            {/* Minigame Overlay */}
            {activeMinigame && (
                <MinigameOverlay
                    type={activeMinigame === 'MINE' ? 'WORK' : activeMinigame} // Re-use WORK minigame for MINE for now
                    playerUpgrades={player.upgrades}
                    onComplete={(score) => handleAction({ type: activeMinigame, performance: score })}
                    onCancel={() => setActiveMinigame(null)}
                />
            )}

            {/* Header */}
            <div className="bg-indigo-900 text-white p-6 rounded-b-[2rem] shadow-xl border-b-4 border-indigo-700">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl border-2 border-white/10 shadow-inner overflow-hidden">
                            {player.avatar ? (
                                <img src={player.avatar} alt={player.role} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            ) : RoleIcon}
                        </div>
                        <div>
                            <div className="text-2xl font-black tracking-tighter">{player.name}</div>
                            <div className="text-xs font-black uppercase tracking-widest opacity-60 text-indigo-300">
                                {ROLE_TITLES[player.role]} • NIVÅ {player.stats.level}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-amber-400 drop-shadow-md">{player.resources.gold}💰</div>
                        <div className="text-[10px] font-black uppercase opacity-60">Kongerikets Mynt</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/10 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
                        <div className="text-4xl text-amber-300">
                            {{ Spring: '🌱', Summer: '☀️', Autumn: '🍂', Winter: '❄️' }[room.world?.season || 'Spring']}
                        </div>
                        <div>
                            <div className="text-xs uppercase font-black opacity-50">Årstid</div>
                            <div className="font-bold text-sm">{(SEASONS as any)[room.world?.season || 'Spring']?.label}</div>
                        </div>
                    </div>

                    {/* XP Progress */}
                    <div className="flex flex-col justify-center">
                        <div className="flex justify-between text-xs font-black uppercase opacity-50 mb-1">
                            <span>Erfaring (XP)</span>
                            <span>{player.stats.xp} / {LEVEL_XP[player.stats.level || 1] || 'MAX'}</span>
                        </div>
                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-400 transition-all duration-1000"
                                style={{ width: `${Math.min(100, (player.stats.xp / (LEVEL_XP[player.stats.level || 1] || 1)) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Ruler Stats (Legitimacy / Authority) */}
                {(player.role === 'KING' || player.role === 'BARON') && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-white/10 p-2 rounded-lg border border-white/5">
                            <div className="text-xs uppercase font-black opacity-50 text-indigo-300">Legitimitet</div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-400" style={{ width: `${player.status.legitimacy || 100}%` }} />
                                </div>
                                <span className="text-xs font-mono">{player.status.legitimacy || 100}%</span>
                            </div>
                        </div>
                        <div className="bg-white/10 p-2 rounded-lg border border-white/5">
                            <div className="text-xs uppercase font-black opacity-50 text-indigo-300">Autoritet</div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-400" style={{ width: `${player.status.authority || 50}%` }} />
                                </div>
                                <span className="text-xs font-mono">{player.status.authority || 50}%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stamina Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-tighter text-indigo-400">
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

                {/* Equipment Durability */}
                {player.equipment && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {Object.entries(player.equipment).map(([key, item]) => (
                            <div key={key} className="bg-black/20 p-1.5 rounded-lg border border-white/5">
                                <div className="flex justify-between text-[10px] font-black uppercase opacity-60 mb-0.5">
                                    <span>{{ tools: 'Verktøy', weapon: 'Sverd', armor: 'Rustning' }[key] || key}</span>
                                    <span>{item.durability}%</span>
                                </div>
                                <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${item.durability > 50 ? 'bg-indigo-400' : item.durability > 20 ? 'bg-amber-400' : 'bg-red-500'}`}
                                        style={{ width: `${item.durability}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="p-4 space-y-4">
                {/* Tabs */}
                <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 overflow-x-auto no-scrollbar gap-1">
                    {['MAP', 'MARKET', 'UPGRADES', 'DIPLOMACY'].map((tab) => {
                        if (tab === 'DIPLOMACY' && player.role === 'PEASANT') return null;
                        const labels: Record<string, string> = { MAP: 'Verden 🗺️', MARKET: 'Marked ⚖️', UPGRADES: 'Bygg ⚒️', DIPLOMACY: 'Pakter 🕊️' };
                        const label = labels[tab] || tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 min-w-[100px] py-4 rounded-xl font-bold transition-all text-sm whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {activeTab === 'MAP' ? (
                    <div className="space-y-4">
                        {/* Resource Summary */}
                        <div className="grid grid-cols-4 gap-2">
                            {Object.entries(player.resources).map(([res, amount]) => {
                                if (res === 'gold' || res === 'manpower') return null;
                                const icons: any = { grain: '🌾', flour: '🥖', wood: '🪵', iron: '⛏️', swords: '⚔️', armor: '🛡️', tools: '🔨', favor: '⛪' };
                                const names: any = { grain: 'Korn', flour: 'Mel', wood: 'Ved', iron: 'Jern', swords: 'Sverd', armor: 'Rustning', tools: 'Verktøy', favor: 'Bønn' };
                                const Icon = icons[res] || '📦';

                                return (
                                    <div key={res} className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 text-center">
                                        <div className="text-[10px] uppercase text-slate-400 font-black mb-0.5">{names[res] || res}</div>
                                        <div className="font-black text-base text-slate-800">{Icon} {amount}</div>
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
                            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full shadow-2xl z-50 animate-bounce text-base font-bold">
                                Utfører handling... ⏳
                            </div>
                        )}
                    </div>
                ) : activeTab === 'MARKET' ? (
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-3xl shadow-md border-b-4 border-amber-100">
                            <h2 className="text-3xl font-black text-slate-800 mb-2 text-center">Markedsplassen ⚖️</h2>
                            <p className="text-slate-500 text-center text-sm mb-6 font-bold uppercase tracking-widest">Fysisk Lagerbeholdning</p>

                            <div className="space-y-4">
                                {Object.entries(room.market).map(([key, item]: [string, any]) => {
                                    const icons: any = { grain: '🌾', flour: '🥖', wood: '🪵', iron: '⛏️', swords: '⚔️', armor: '🛡️', tools: '🔨' };
                                    const names: any = { grain: 'Korn', flour: 'Mel', wood: 'Ved', iron: 'Jern', swords: 'Sverd', armor: 'Rustning', tools: 'Verktøy' };
                                    const amountToTrade = key === 'wood' ? 5 : 1;

                                    return (
                                        <div key={key} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="font-black text-xl flex items-center gap-2">{names[key]} {icons[key]}</div>
                                                    <div className={`text-xs font-black uppercase ${item.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        På Lager: {item.stock} stk
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-black text-indigo-600">{item.price.toFixed(1)} <span className="text-sm font-mono tracking-tight text-slate-400">💰</span></div>
                                                    <div className="text-[10px] text-slate-400 font-black">PRIS PER ENHET</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => handleAction(`BUY_${key.toUpperCase()}`)}
                                                    disabled={!!actionLoading || player.resources.gold < item.price * amountToTrade || item.stock < amountToTrade}
                                                    className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-base font-black shadow-md disabled:opacity-30 transition-colors"
                                                >
                                                    KJØP {amountToTrade}
                                                </button>
                                                <button
                                                    onClick={() => handleAction(`SELL_${key.toUpperCase()}`)}
                                                    disabled={!!actionLoading || (player.resources[key as keyof typeof player.resources] || 0) < amountToTrade}
                                                    className="bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl text-base font-black shadow-md disabled:opacity-30 transition-colors"
                                                >
                                                    SELG {amountToTrade}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'UPGRADES' ? (
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-3xl shadow-md border-b-4 border-emerald-100">
                            <h2 className="text-3xl font-black text-slate-800 mb-6 text-center">Oppgraderinger 🏗️</h2>
                            <div className="space-y-3">
                                {(UPGRADES_LIST as any)[player.role]?.map((upg: any) => {
                                    const isOwned = player.upgrades?.includes(upg.id);
                                    let canAfford = true;
                                    Object.entries(upg.cost || {}).forEach(([res, amt]) => {
                                        if ((player.resources as any)[res] < (amt as number)) canAfford = false;
                                    });

                                    return (
                                        <div key={upg.id} className={`p-4 rounded-2xl border-2 transition-all ${isOwned ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-xl font-bold text-slate-800">{upg.name} {isOwned && '✅'}</h3>
                                                <div className="flex gap-2">
                                                    {Object.entries(upg.cost || {}).map(([res, amt]) => (
                                                        <span key={res} className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 font-mono font-bold">{amt} {res}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-4">{upg.description}</p>
                                            {!isOwned && (
                                                <button
                                                    onClick={() => handleAction({ type: 'UPGRADE', upgradeId: upg.id })}
                                                    disabled={!!actionLoading || !canAfford}
                                                    className={`w-full py-3 rounded-xl text-lg font-black uppercase tracking-widest transition-all ${canAfford ? 'bg-emerald-600 text-white shadow-lg active:scale-95' : 'bg-slate-200 text-slate-400'}`}
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
                ) : activeTab === 'DIPLOMACY' ? (
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-3xl shadow-md border-b-4 border-indigo-100">
                            <h2 className="text-3xl font-black text-slate-800 mb-6 text-center">Diplomati & Pakter 🕊️</h2>
                            <p className="text-base text-slate-500 mb-8 italic">Send hemmelige meldinger til andre herrer. Kun synlig for mottakeren.</p>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6 p-4 bg-slate-50 rounded-2xl border flex flex-col">
                                {room.diplomacy ? Object.values(room.diplomacy)
                                    .filter((m: any) => m.receiverId === 'ALL_RULERS' || m.receiverId === player.id || m.senderId === player.id)
                                    .sort((a: any, b: any) => a.timestamp - b.timestamp)
                                    .map((m: any) => (
                                        <div key={m.id} className={`p-3 rounded-xl border-2 mb-2 ${m.senderId === player.id ? 'bg-indigo-50 border-indigo-100 self-end ml-8' : 'bg-white border-slate-100 self-start mr-8'}`}>
                                            <div className="flex justify-between items-center mb-1 gap-4">
                                                <span className="text-xs font-black uppercase text-indigo-500">{m.senderName}</span>
                                                <span className="text-xs text-slate-400">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-base text-slate-700">{m.content}</p>
                                        </div>
                                    )) : <p className="text-center text-slate-400 text-xs py-8">Ingen meldinger ennå...</p>
                                }
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="diplomacyInput"
                                    placeholder="Skriv melding..."
                                    className="flex-1 bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-base"
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                                            const content = (e.target as HTMLInputElement).value;
                                            (e.target as HTMLInputElement).value = '';
                                            const msgId = `msg_${Date.now()}`;
                                            await update(ref(db, `simulation_rooms/${pin}/diplomacy/${msgId}`), {
                                                id: msgId,
                                                senderId: player.id,
                                                senderName: player.name,
                                                receiverId: 'ALL_RULERS',
                                                content,
                                                timestamp: Date.now()
                                            });
                                        }
                                    }}
                                />
                                <button
                                    onClick={async () => {
                                        const input = document.getElementById('diplomacyInput') as HTMLInputElement;
                                        if (input && input.value) {
                                            const content = input.value;
                                            input.value = '';
                                            const msgId = `msg_${Date.now()}`;
                                            await update(ref(db, `simulation_rooms/${pin}/diplomacy/${msgId}`), {
                                                id: msgId,
                                                senderId: player.id,
                                                senderName: player.name,
                                                receiverId: 'ALL_RULERS',
                                                content,
                                                timestamp: Date.now()
                                            });
                                        }
                                    }}
                                    className="bg-indigo-600 text-white px-6 rounded-xl font-bold text-base"
                                >
                                    SEND
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}


                {/* World Feed */}
                <div className="bg-slate-900 text-indigo-300 p-5 rounded-3xl shadow-inner max-h-56 overflow-y-auto font-mono text-xs border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-indigo-500 font-black uppercase tracking-widest">Global Logg</h3>
                        <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="space-y-1.5" id="simulation-feed">
                        {room.messages?.slice().reverse().map((msg: any, idx: number) => (
                            <div key={idx} className="opacity-80 border-l-2 border-indigo-800 pl-3 py-1 bg-white/5 rounded-r-md leading-relaxed">{msg}</div>
                        ))}
                        {(!room.messages || room.messages.length === 0) && <div className="text-slate-600 italic py-8 text-center">Riket er foreløvig stille...</div>}
                    </div>
                </div>
            </div>

            {/* Voting Overlay (The Ting) */}
            {room.activeVote && !room.activeVote.votes?.[player.id] && (
                <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border-t-8 border-amber-600 animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <span className="text-4xl mb-4 block">⚖️</span>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">TINGET ER SATT</h2>
                            <p className="text-base text-slate-500">Hele riket skal nå stemme over en foreslått lovendring.</p>
                        </div>

                        <div className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-100 mb-8">
                            <h3 className="text-2xl font-black text-amber-900 mb-2 uppercase tracking-wide">{room.activeVote.title}</h3>
                            <p className="text-lg text-amber-800 font-medium leading-relaxed italic">
                                "{room.activeVote.lawId === 'tax_cut' ? 'Skattene halveres for å sikre folkets velvære.' :
                                    room.activeVote.lawId === 'peace' ? 'All krigføring og plyndring forbys umiddelbart.' :
                                        room.activeVote.lawId === 'salt_tax' ? 'Prisen på varer øker for å fylle kongens kister.' :
                                            'Verneplikt innføres for å styrke rikets forsvar.'}"
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => update(ref(db, `simulation_rooms/${pin}/activeVote/votes`), { [player.id]: 'YES' })}
                                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all text-lg"
                            >
                                ✅ VEDTA LOVEN
                            </button>
                            <button
                                onClick={() => update(ref(db, `simulation_rooms/${pin}/activeVote/votes`), { [player.id]: 'NO' })}
                                className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all text-lg"
                            >
                                ❌ FORKAST LOVEN
                            </button>
                            <button
                                onClick={() => update(ref(db, `simulation_rooms/${pin}/activeVote/votes`), { [player.id]: 'ABSTAIN' })}
                                className="w-full bg-slate-200 text-slate-500 py-4 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all text-sm"
                            >
                                Avstå fra stemme
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
