import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';
import { useLayout } from '../../context/LayoutContext';

import { db } from '../../lib/firebase';
import type { SimulationPlayer as SimulationPlayerType, SimulationRoom } from './types';
import { UPGRADES_LIST, SEASONS, LEVEL_XP, ROLE_TITLES, VILLAGE_BUILDINGS, REFINERY_RECIPES, RESOURCE_DETAILS, ROLE_DEFINITIONS } from './constants';

import { performAction } from './actions';
import { WorldMap } from './WorldMap';
import { MinigameOverlay } from './SimulationMinigames';


export const SimulationPlayer: React.FC = () => {
    const { pin } = useParams();
    const [player, setPlayer] = useState<SimulationPlayerType | null>(null);
    const [room, setRoom] = useState<SimulationRoom | null>(null);
    const [activeTab, setActiveTab] = useState<'MAP' | 'VILLAGE' | 'INVENTORY' | 'MARKET' | 'UPGRADES' | 'DIPLOMACY' | 'HIERARCHY'>('MAP');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeMinigame, setActiveMinigame] = useState<'WORK' | 'CHOP' | 'CRAFT' | 'MILL' | 'DEFEND' | 'EXPLORE' | 'MINE' | 'QUARRY' | null>(null);
    const { setFullWidth } = useLayout();

    // Handle Layout
    useEffect(() => {
        setFullWidth(true);
        return () => setFullWidth(false);
    }, [setFullWidth]);


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

    useEffect(() => {
        if (player) {
            const roleLabel = (ROLE_DEFINITIONS as any)[player.role]?.label || player.role;
            document.title = `${player.name} (${roleLabel}) | Eiriksbok`;
        } else {
            document.title = 'Rikesimulator | Eiriksbok';
        }
        return () => {
            document.title = 'Eiriksbok';
        };
    }, [player]);

    const handleAction = async (action: any) => {
        if (!pin || !player || actionLoading) return;

        const actionType = typeof action === 'string' ? action : action.type;

        // Trigger Minigame for work/chop/mill/craft/defend/explore/mine/quarry if not already in one
        const minigameTypes = ['WORK', 'CHOP', 'MILL', 'CRAFT', 'DEFEND', 'EXPLORE', 'MINE', 'QUARRY'];
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
    const healthWidth = player.status.hp || 0;
    const currentXp = player.stats.xp || 0;
    const currentLvl = player.stats.level || 1;
    const targetXp = LEVEL_XP[currentLvl] || 1000;
    const xpPercent = Math.min(100, (currentXp / targetXp) * 100);

    const roleTitle = (ROLE_TITLES as any)[player.role][Math.min(currentLvl, (ROLE_TITLES as any)[player.role].length) - 1];

    return (
        <div className="fixed inset-0 top-16 bg-slate-950 text-slate-200 flex overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />
            </div>

            {/* Minigame Overlay */}
            {activeMinigame && (
                <MinigameOverlay
                    type={activeMinigame}
                    playerUpgrades={player.upgrades}
                    onComplete={(score) => handleAction({ type: activeMinigame, performance: score })}
                    onCancel={() => setActiveMinigame(null)}
                />
            )}

            {/* LEFT PANEL: PLAYER CONSOLE */}
            <aside className="w-80 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col z-20 shadow-2xl">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg ring-2 ring-white/10 shrink-0 overflow-hidden">
                            {player.avatar ? (
                                <img src={player.avatar} alt={player.role} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            ) : RoleIcon}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter text-white">{player.name}</h1>
                            <p className="text-xs font-black uppercase text-indigo-400 tracking-widest">{roleTitle}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Stamina */}
                        <div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">
                                <span>⚡ Stamina</span>
                                <span className="text-white">{Math.round(staminaWidth)}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5">
                                <div
                                    className={`h-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] ${staminaWidth > 50 ? 'bg-amber-400' : staminaWidth > 20 ? 'bg-amber-600' : 'bg-red-500 animate-pulse'}`}
                                    style={{ width: `${staminaWidth}%` }}
                                />
                            </div>
                        </div>

                        {/* Health */}
                        <div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">
                                <span>❤️ Helse</span>
                                <span className="text-white">{healthWidth}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5">
                                <div
                                    className="h-full bg-gradient-to-r from-rose-500 to-rose-700 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(225,29,72,0.5)]"
                                    style={{ width: `${healthWidth}%` }}
                                />
                            </div>
                        </div>

                        {/* XP/Level */}
                        <div className="pt-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">
                                <span>Nivå {currentLvl}</span>
                                <span className="text-indigo-400">{Math.floor(xpPercent)}% Til Neste</span>
                            </div>
                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-1000"
                                    style={{ width: `${xpPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {[
                        { id: 'MAP', label: 'Verdenskart', icon: '🗺️' },
                        { id: 'VILLAGE', label: 'Landsbyen', icon: '🏠' },
                        { id: 'INVENTORY', label: 'Sekk & Utstyr', icon: '🎒' },
                        { id: 'MARKET', label: 'Markedet', icon: '⚖️' },
                        { id: 'DIPLOMACY', label: 'Diplomati', icon: '🕊️' },
                        { id: 'HIERARCHY', label: 'Samfunn', icon: '👑' },
                        { id: 'UPGRADES', label: 'Oppgraderinger', icon: '⚒️' },
                    ].map((tab) => {
                        if (tab.id === 'DIPLOMACY' && player.role === 'PEASANT') return null;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                            >
                                <span className="text-xl">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Quick Info Footer */}
                <div className="p-6 bg-black/20 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-tighter">
                        <span>År {room.world.year}</span>
                        <span className="text-amber-500">{(SEASONS as any)[room.world.season]?.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-black text-white">
                        <span>☀️ {room.world.weather}</span>
                    </div>
                </div>
            </aside>

            {/* CENTER PANEL: WORKSPACE */}
            <main className="flex-1 relative flex flex-col bg-slate-900 overflow-hidden">
                {/* Header Info Bar */}
                <header className="h-16 border-b border-white/5 bg-slate-950/30 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="px-3 py-1 bg-slate-800 rounded-lg border border-white/5 font-mono text-xs text-indigo-400">PIN: {pin}</div>
                        {room.world.settlement?.activeProjectId && (
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Aktivt Prosjekt:</span>
                                <span className="text-sm font-bold text-white capitalize">{room.world.settlement.activeProjectId}</span>
                                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500"
                                        style={{ width: `${(room.world.settlement.buildings[room.world.settlement.activeProjectId]?.progress / room.world.settlement.buildings[room.world.settlement.activeProjectId]?.target) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    {actionLoading && (
                        <div className="flex items-center gap-2 text-indigo-400 font-black text-xs animate-pulse uppercase tracking-widest">
                            <span>Utfører handling</span>
                            <span className="inline-block w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                        </div>
                    )}
                </header>

                {/* Main Content Area */}
                <div className={`flex-1 relative p-8 ${activeTab === 'MAP' ? 'overflow-hidden flex items-center justify-center' : 'overflow-y-auto overflow-x-hidden custom-scrollbar'}`}>
                    {activeTab === 'MAP' ? (
                        <WorldMap player={player} room={room} onAction={handleAction} onOpenMarket={() => setActiveTab('MARKET')} />
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            {/* Generic Tab Container Design */}
                            {activeTab === 'MARKET' ? (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end border-b-2 border-white/5 pb-4">
                                        <h2 className="text-4xl font-black text-white tracking-tighter">Markedshandel</h2>
                                        <div className="text-amber-500 font-black text-2xl">💰 {player.resources.gold || 0}g</div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(room.market || {}).map(([resId, item]: [string, any]) => {
                                            const details = (RESOURCE_DETAILS as any)[resId] || { label: resId, icon: '📦' };
                                            const price = item.price || 0;
                                            const stock = item.stock || 0;
                                            return (
                                                <div key={resId} className="bg-slate-800/50 border border-white/10 p-5 rounded-3xl flex items-center justify-between group hover:border-indigo-500 transition-all">
                                                    <div className="flex items-center gap-5">
                                                        <span className="text-4xl filter drop-shadow-md transition-transform group-hover:rotate-12">{details.icon}</span>
                                                        <div>
                                                            <div className="font-black text-xl text-white capitalize">{details.label}</div>
                                                            <div className="text-sm text-slate-500 font-bold uppercase tracking-tight">Pris: <span className="text-amber-500 font-black">{price.toFixed(1)}g</span> | Lager: <span className="text-white">{stock}</span></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 text-center">
                                                        <button
                                                            onClick={() => handleAction({ type: 'BUY', resource: resId })}
                                                            disabled={(player.resources.gold || 0) < price || stock <= 0 || !!actionLoading}
                                                            className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-4 py-2 rounded-xl font-black text-sm transition-all disabled:opacity-10 shrink-0"
                                                        >
                                                            KJØP
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction({ type: 'SELL', resource: resId })}
                                                            disabled={((player.resources as any)[resId] || 0) < 1 || !!actionLoading}
                                                            className="bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white px-4 py-2 rounded-xl font-black text-sm transition-all disabled:opacity-10 shrink-0"
                                                        >
                                                            SELG
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : activeTab === 'INVENTORY' ? (
                                <div className="space-y-6">
                                    <h2 className="text-4xl font-black text-white tracking-tighter border-b-2 border-white/5 pb-4">Min Oppakning</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {Object.entries(player.resources || {}).map(([resId, amount]) => {
                                            if (resId === 'gold') return null;
                                            const details = (RESOURCE_DETAILS as any)[resId] || { label: resId, icon: '📦' };
                                            return (
                                                <div key={resId} className="bg-slate-800/50 border border-white/5 p-6 rounded-3xl flex flex-col items-center text-center group hover:bg-slate-800 transition-all">
                                                    <span className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">{details.icon}</span>
                                                    <div className="text-3xl font-black text-white">{amount as number}</div>
                                                    <div className="text-xs font-black uppercase text-slate-500 tracking-widest mt-1">{details.label}</div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Equipment Status */}
                                    {player.equipment && (
                                        <div className="mt-12 space-y-6">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Utstyr & Tilstand</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {Object.entries(player.equipment).map(([key, item]) => (
                                                    <div key={key} className="bg-indigo-900/10 border border-indigo-500/10 p-6 rounded-[2rem]">
                                                        <div className="text-[10px] font-black uppercase text-indigo-500/60 mb-2 leading-none">{{ tools: 'Verktøy', weapon: 'Sverd', armor: 'Rustning' }[key] || key}</div>
                                                        <div className="flex justify-between items-end mb-4">
                                                            <div className="text-2xl font-black text-white">{(item as any).name || 'Håndverk'}</div>
                                                            <div className="text-base font-black text-white opacity-40">{(item as any).durability}%</div>
                                                        </div>
                                                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-500 ${(item as any).durability > 50 ? 'bg-emerald-500' : (item as any).durability > 20 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`}
                                                                style={{ width: `${(item as any).durability}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : activeTab === 'VILLAGE' ? (
                                <div className="space-y-6">
                                    <h2 className="text-4xl font-black text-white tracking-tighter border-b-2 border-white/5 pb-4">Bosetningen</h2>

                                    {/* Settlement Progress Banner */}
                                    {(room.world.settlement?.activeProjectId) ? (
                                        <div className="bg-emerald-900/10 p-8 rounded-[2rem] border-2 border-emerald-900/20 mb-8 relative overflow-hidden group">
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div>
                                                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Aktivt Prosjekt</div>
                                                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{room.world.settlement.activeProjectId}</h3>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAction({ type: 'CONSTRUCT' })}
                                                        disabled={!!actionLoading}
                                                        className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all outline-none ring-2 ring-emerald-400/20"
                                                    >
                                                        Bidra (-15⚡)
                                                    </button>
                                                </div>
                                                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                    <div
                                                        className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                                        style={{ width: `${(room.world.settlement.buildings[room.world.settlement.activeProjectId].progress / room.world.settlement.buildings[room.world.settlement.activeProjectId].target) * 100}%` }}
                                                    />
                                                </div>
                                                <p className="mt-3 text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">
                                                    Status: {room.world.settlement?.buildings[room.world.settlement?.activeProjectId ?? '']?.progress} / {room.world.settlement?.buildings[room.world.settlement?.activeProjectId ?? '']?.target}
                                                </p>
                                            </div>
                                            <div className="absolute top-[-20%] right-[-10%] text-[12rem] text-emerald-500 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">🏗️</div>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-800/30 p-8 rounded-[2rem] text-center border-2 border-dashed border-white/5 mb-8">
                                            <p className="text-slate-500 font-bold">Ingen aktive byggeprosjekter.</p>
                                            <p className="text-[10px] uppercase text-slate-600 font-black mt-2 tracking-widest">Kongen må stake ut kursen</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {room.world.settlement && Object.values(room.world.settlement.buildings).map((building: any) => {
                                            const meta = (VILLAGE_BUILDINGS as any)[building.id];
                                            return (
                                                <div key={building.id} className="bg-slate-800/50 border border-white/10 p-6 rounded-3xl">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="text-xl font-black text-white">{meta?.name}</h4>
                                                        <span className="bg-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-white shadow-lg shadow-indigo-600/30">Nivå {building.level}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mb-6 leading-relaxed italic opacity-70">{meta?.description}</p>

                                                    {building.level > 0 && (
                                                        <div className="grid grid-cols-1 gap-2 pt-4 border-t border-white/5">
                                                            {Object.entries(REFINERY_RECIPES)
                                                                .filter(([, r]: [string, any]) => r.buildingId === building.id)
                                                                .map(([recipeId, recipe]: [string, any]) => {
                                                                    const details = (RESOURCE_DETAILS as any)[recipeId] || { label: recipeId };
                                                                    const canAfford = Object.entries(recipe.input).every(([res, amt]) => (player.resources as any)[res] >= (amt as number));
                                                                    return (
                                                                        <button
                                                                            key={recipeId}
                                                                            onClick={() => handleAction({ type: 'REFINE', recipeId })}
                                                                            disabled={!canAfford || !!actionLoading}
                                                                            className={`flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-all ${canAfford ? 'bg-slate-900 border-indigo-500/30 hover:border-indigo-500' : 'opacity-40 grayscale pointer-events-none border-transparent bg-black/20'}`}
                                                                        >
                                                                            <div className="text-left">
                                                                                <div className="text-xs font-black text-indigo-300 uppercase italic">START &rarr; {details.label}</div>
                                                                                <div className="text-[10px] text-slate-500">
                                                                                    Krever: {Object.entries(recipe.input).map(([r, a]) => {
                                                                                        const d = (RESOURCE_DETAILS as any)[r] || { label: r };
                                                                                        return `${a} ${d.label}`;
                                                                                    }).join(', ')}
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : activeTab === 'UPGRADES' ? (
                                <div className="space-y-6">
                                    <h2 className="text-4xl font-black text-white tracking-tighter border-b-2 border-white/5 pb-4">Oppgraderinger</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(UPGRADES_LIST as any)[player.role]?.map((upg: any) => {
                                            const isOwned = player.upgrades?.includes(upg.id);
                                            let canAfford = true;
                                            Object.entries(upg.cost || {}).forEach(([res, amt]) => {
                                                if ((player.resources as any)[res] < (amt as number)) canAfford = false;
                                            });
                                            return (
                                                <div key={upg.id} className={`p-6 rounded-3xl border-2 transition-all ${isOwned ? 'bg-indigo-900/20 border-indigo-500 shadow-lg shadow-indigo-500/10' : 'bg-slate-800/40 border-white/5'}`}>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="text-2xl font-black text-white">{upg.name}</h3>
                                                        <div className="flex flex-col items-end gap-1.5">
                                                            {Object.entries(upg.cost || {}).map(([res, amt]) => {
                                                                const det = (RESOURCE_DETAILS as any)[res] || { label: res };
                                                                return (
                                                                    <span key={res} className="text-xs font-black px-3 py-1 bg-black/40 rounded-full text-indigo-400 font-mono uppercase tracking-widest border border-indigo-500/20">{amt} {det.label}</span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-300 mb-8 leading-relaxed italic opacity-90">{upg.description}</p>
                                                    <button
                                                        onClick={() => handleAction({ type: 'UPGRADE', upgradeId: upg.id })}
                                                        disabled={isOwned || !canAfford || !!actionLoading}
                                                        className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${isOwned ? 'bg-emerald-600/10 text-emerald-500 cursor-default p-4' : canAfford ? 'bg-indigo-600 text-white shadow-xl hover:bg-indigo-50 shadow-indigo-600/20' : 'bg-slate-700 text-slate-500 opacity-50'}`}
                                                    >
                                                        {isOwned ? '✅ AKTIV' : canAfford ? 'KJØP OPPGRADERING' : 'MANGLER RESSURSER'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {/* If no role upgrades yet */}
                                        {(!(UPGRADES_LIST as any)[player.role]) && (
                                            <div className="col-span-full py-12 text-center text-slate-500 italic font-bold">Ferdigheter planlegges for din rolle...</div>
                                        )}
                                    </div>
                                </div>
                            ) : activeTab === 'DIPLOMACY' ? (
                                <div className="space-y-6 h-full flex flex-col">
                                    <h2 className="text-4xl font-black text-white tracking-tighter border-b-2 border-white/5 pb-4 flex items-center justify-between">
                                        Diplomati
                                        <span className="text-xs font-black uppercase text-indigo-500 tracking-widest bg-indigo-500/10 px-4 py-1 rounded-full uppercase">Kryptert Kanal</span>
                                    </h2>

                                    <div className="flex-1 min-h-[400px] flex flex-col gap-4 p-6 bg-black/20 rounded-3xl border border-white/5 overflow-y-auto custom-scrollbar">
                                        {room.diplomacy ? Object.values(room.diplomacy)
                                            .filter((m: any) => m.receiverId === 'ALL_RULERS' || m.receiverId === player.id || m.senderId === player.id)
                                            .sort((a: any, b: any) => a.timestamp - b.timestamp)
                                            .map((m: any) => (
                                                <div key={m.id} className={`p-4 rounded-2xl max-w-[80%] ${m.senderId === player.id ? 'bg-indigo-600 text-white self-end rounded-br-none shadow-lg shadow-indigo-600/20' : 'bg-slate-800/80 text-slate-200 self-start rounded-bl-none border border-white/5'}`}>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-[10px] font-black uppercase opacity-60 italic">{m.senderName}</span>
                                                        <span className="text-[8px] opacity-40">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <p className="text-sm font-medium">{m.content}</p>
                                                </div>
                                            )) : <div className="m-auto text-slate-500 text-sm font-black italic">Ingen meldinger...</div>
                                        }
                                    </div>

                                    <div className="flex gap-3 bg-slate-800/50 p-2 rounded-2xl border border-white/5 shrink-0">
                                        <input
                                            type="text"
                                            id="diplomacyInputWidescreen"
                                            placeholder="Send beskjed til riket..."
                                            className="flex-1 bg-transparent px-4 py-3 outline-none text-white font-bold"
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
                                                const input = document.getElementById('diplomacyInputWidescreen') as HTMLInputElement;
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
                                            className="bg-indigo-600 text-white px-8 rounded-xl font-black text-sm hover:bg-indigo-500 transition-all active:scale-95"
                                        >
                                            SEND
                                        </button>
                                    </div>
                                </div>
                            ) : activeTab === 'HIERARCHY' ? (
                                <div className="space-y-12 pb-20">
                                    <h2 className="text-4xl font-black text-white tracking-tighter border-b-2 border-white/5 pb-4">Samfunnsstruktur</h2>

                                    {/* 1. THE KING */}
                                    <div className="flex justify-center">
                                        {Object.values(room.players || {}).filter(p => p.role === 'KING').map(king => (
                                            <div key={king.id} className="relative group">
                                                <div className="bg-gradient-to-br from-amber-600 to-yellow-600 p-1 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.4)]">
                                                    <div className="bg-slate-900/90 p-8 rounded-[1.3rem] flex flex-col items-center min-w-[300px] border border-white/10">
                                                        <div className="text-6xl mb-4 drop-shadow-xl">👑</div>
                                                        <h3 className="text-2xl font-black text-white mb-1">{king.name}</h3>
                                                        <div className="text-xs font-black uppercase text-amber-500 tracking-widest mb-4">Hans Majestet Kongen</div>
                                                        <div className="w-full flex justify-between items-center text-xs font-bold text-slate-400 bg-black/20 px-4 py-2 rounded-xl">
                                                            <span>Legitimitet</span>
                                                            <span className="text-white">{king.status.legitimacy}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Connector to next layer */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 h-12 w-1 bg-gradient-to-b from-amber-600 to-slate-700 opacity-50"></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 2. THE NOBILITY (BARONS) & THEIR SUBJECTS */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative pt-8">
                                        {/* Connector horizontal line */}
                                        <div className="absolute top-0 left-10 right-10 h-1 bg-slate-700 opacity-30 rounded-full"></div>

                                        {Object.values(room.players || {}).filter(p => p.role === 'BARON').map(baron => (
                                            <div key={baron.id} className="flex flex-col gap-4 relative">
                                                {/* Vertical connector from horizontal line */}
                                                <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 h-8 w-1 bg-slate-700 opacity-30"></div>

                                                {/* Baron Card */}
                                                <div className="bg-slate-800/80 p-6 rounded-3xl border border-white/5 shadow-xl relative z-10">
                                                    <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-4">
                                                        <div className="text-4xl">🏰</div>
                                                        <div>
                                                            <h4 className="text-lg font-black text-white">{baron.name}</h4>
                                                            <div className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Baron av {baron.regionId}</div>
                                                        </div>
                                                    </div>

                                                    {/* Subjects List */}
                                                    <div className="space-y-3">
                                                        <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Underståtte</div>
                                                        {Object.values(room.players || {}).filter(p => (p.role === 'PEASANT' || p.role === 'SOLDIER') && p.regionId === baron.regionId).map(subject => (
                                                            <div key={subject.id} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                                                                <div className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-lg text-lg shadow-inner">
                                                                    {subject.role === 'SOLDIER' ? '⚔️' : '🌾'}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-slate-200">{subject.name}</div>
                                                                    <div className="text-[10px] uppercase text-slate-500 font-bold">{subject.role === 'SOLDIER' ? 'Soldat' : 'Bonde'}</div>
                                                                </div>
                                                                <div className={`ml-auto w-2 h-2 rounded-full ${subject.lastActive > Date.now() - 60000 ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-slate-600'}`} title={subject.lastActive > Date.now() - 60000 ? 'Online' : 'Offline'} />
                                                            </div>
                                                        ))}
                                                        {Object.values(room.players || {}).filter(p => (p.role === 'PEASANT' || p.role === 'SOLDIER') && p.regionId === baron.regionId).length === 0 && (
                                                            <div className="text-xs text-slate-600 italic text-center py-4">Ingen undersåtter ennå...</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Unassigned / Freemen / Merchants (grouped separately) */}
                                        <div className="flex flex-col gap-4 relative">
                                            <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 h-8 w-1 bg-slate-700 opacity-30"></div>
                                            <div className="bg-slate-800/40 p-6 rounded-3xl border-2 border-dashed border-white/5 relative z-10">
                                                <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-4 opacity-70">
                                                    <div className="text-4xl">⚖️</div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-white">Frie Menn</h4>
                                                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Markedet & Byen</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    {Object.values(room.players || {}).filter(p => !['KING', 'BARON'].includes(p.role) && !p.regionId.startsWith('region_')).map(free => (
                                                        <div key={free.id} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5 opacity-80">
                                                            <div className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-lg">
                                                                {free.role === 'MERCHANT' ? '💰' : '👤'}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-300">{free.name}</div>
                                                                <div className="text-[10px] uppercase text-slate-500 font-bold">{free.role}</div>
                                                            </div>
                                                            <div className={`ml-auto w-2 h-2 rounded-full ${free.lastActive > Date.now() - 60000 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                                        </div>
                                                    ))}
                                                    {Object.values(room.players || {}).filter(p => !['KING', 'BARON'].includes(p.role) && !p.regionId.startsWith('region_')).length === 0 && (
                                                        <div className="text-xs text-slate-600 italic text-center py-4">Ingen frie menn...</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>


                {/* The Ting Voting Overlay (Integrated as Portal-like centered UI) */}
                {room.activeVote && !room.activeVote.votes?.[player.id] && (
                    <div className="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                        <div className="bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-t-8 border-t-amber-600 text-center scale-in-center overflow-hidden relative">
                            <div className="absolute top-[-20%] right-[-10%] text-[15rem] opacity-[0.03] pointer-events-none">⚖️</div>
                            <span className="text-6xl block mb-6 drop-shadow-lg">⚖️</span>
                            <h2 className="text-4xl font-black text-white tracking-tighter mb-4">TINGET ER SATT</h2>
                            <p className="text-slate-400 mb-10 leading-relaxed font-bold">Riket skal nå stemme over en foreslått lovendring.</p>

                            <div className="bg-amber-900/10 border-2 border-amber-900/20 rounded-3xl p-8 mb-10 text-left relative overflow-hidden">
                                <div className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em] mb-2 font-mono">LOVFORSLAG</div>
                                <h3 className="text-2xl font-black text-amber-500 mb-4 uppercase tracking-tighter">{room.activeVote.title}</h3>
                                <p className="text-lg text-slate-200 font-medium italic border-l-4 border-amber-600/50 pl-4 py-1 leading-relaxed">
                                    "{room.activeVote.lawId === 'tax_cut' ? 'Skattene halveres for å sikre folkets velvære.' :
                                        room.activeVote.lawId === 'peace' ? 'All krigføring og plyndring forbys umiddelbart.' :
                                            room.activeVote.lawId === 'salt_tax' ? 'Prisen på varer øker for å fylle kongens kister.' :
                                                'Verneplikt innføres for å styrke rikets forsvar.'}"
                                </p>
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
            </main>

            {/* RIGHT PANEL: INFO & FEED */}
            <aside className="w-80 border-l border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col z-20">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-6 flex items-center justify-between">
                        Sekkens Innhold
                        <span className="text-[8px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-300">{(Object.keys(player.resources || {}).filter(k => (player.resources as any)[k] > 0).length)} Typer</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.entries(player.resources || {}).map(([resId, amount]) => {
                            if (resId === 'gold') return null;
                            const details = (RESOURCE_DETAILS as any)[resId] || { label: resId, icon: '📦' };
                            if ((amount as number) <= 0) return null;
                            return (
                                <div key={resId} className="flex flex-col items-center bg-black/20 p-2 rounded-xl border border-white/5 group relative cursor-help hover:bg-slate-800 transition-all">
                                    <span className="text-2xl group-hover:scale-125 transition-transform duration-300 drop-shadow-md">{details.icon}</span>
                                    <span className="text-[10px] font-black text-white mt-1">{amount as number}</span>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900/90 text-[10px] font-black text-indigo-400 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap pointer-events-none uppercase tracking-widest z-50 backdrop-blur-sm">
                                        {details.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Beholdning</span>
                        <div className="text-amber-500 font-black text-xl drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">{player.resources.gold || 0}g</div>
                    </div>
                </div>

                {/* Live Activity Feed */}
                <div className="flex-1 overflow-hidden flex flex-col p-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-rose-500 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
                        Live Hendelser
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {room.messages?.slice().reverse().map((msg: any, idx: number) => (
                            <div key={idx} className="bg-white/5 border-l-2 border-indigo-500 p-3 rounded-r-lg animate-in slide-in-from-right-4 duration-300">
                                <p className="text-[11px] font-medium leading-relaxed text-slate-300 antialiased line-clamp-3 overflow-hidden leading-tight font-serif italic opacity-90">{msg}</p>
                            </div>
                        ))}
                        {(!room.messages || room.messages.length === 0) && <div className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest py-12">Riket er stille...</div>}
                    </div>
                </div>

                {/* Bottom Stats/Info */}
                <div className="p-6 bg-indigo-900/10 border-t border-white/5">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-black text-slate-500 uppercase tracking-widest leading-none">Region</span>
                            <span className="text-white font-bold">{player.regionId}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-black text-slate-500 uppercase tracking-widest leading-none">Legitimitet</span>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" style={{ width: `${player.status.legitimacy || 100}%` }} />
                                </div>
                                <span className="text-white font-bold">{player.status.legitimacy || 100}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Global Styles for custom scrollbar */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}} />
        </div>
    );
};
