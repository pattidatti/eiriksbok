import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';
import { useLayout } from '../../context/LayoutContext';

import { db } from '../../lib/firebase';
import type { SimulationPlayer as SimulationPlayerType, SimulationRoom } from './types';
import { UPGRADES_LIST, SEASONS, LEVEL_XP, ROLE_TITLES, RESOURCE_DETAILS, ROLE_DEFINITIONS } from './constants';

import { performAction } from './actions';
import { WorldMap } from './WorldMap';
import { MinigameOverlay } from './SimulationMinigames';


export const SimulationPlayer: React.FC = () => {
    const { pin } = useParams();
    const [searchParams] = useSearchParams();
    const impersonateId = searchParams.get('impersonate');
    const [player, setPlayer] = useState<SimulationPlayerType | null>(null);
    const [room, setRoom] = useState<SimulationRoom | null>(null);

    // Helper to get friendly region name
    const getRegionName = (rId: string) => {
        if (!rId || rId === 'unassigned') return 'Ingen Region';
        if (rId === 'capital') return 'Kongeriket (Hovedstaden)';
        if (rId === 'test_region') return 'Test Baroniet';

        if (room?.players && rId.startsWith('region_')) {
            // Priority 1: Find Baron with matching regionId (Robust)
            const baronOwner = Object.values(room.players).find(p => p.role === 'BARON' && p.regionId === rId);
            if (baronOwner) return `${baronOwner.name}s Baroni`;

            // Priority 2: Try ID extraction (Legacy support)
            const baronId = rId.replace('region_', '');
            const baronById = room.players[baronId];
            if (baronById) return `${baronById.name}s Baroni`;
        }
        return rId;
    };
    const [activeTab, setActiveTab] = useState<'MAP' | 'VILLAGE' | 'INVENTORY' | 'MARKET' | 'UPGRADES' | 'SKILLS' | 'DIPLOMACY' | 'HIERARCHY' | 'PROFILE'>('MAP');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeMinigame, setActiveMinigame] = useState<'WORK' | 'CHOP' | 'CRAFT' | 'MILL' | 'DEFEND' | 'EXPLORE' | 'MINE' | 'QUARRY' | 'PATROL' | null>(null);
    const [levelUpData, setLevelUpData] = useState<{ level: number, title: string } | null>(null);
    const { setFullWidth } = useLayout();

    // Handle Layout
    useEffect(() => {
        setFullWidth(true);
        return () => setFullWidth(false);
    }, [setFullWidth]);


    useEffect(() => {
        const playerId = impersonateId || localStorage.getItem('sim_player_id');
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
    }, [pin, impersonateId]);

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

    // --- RESOURCE ANIMATION SYSTEM ---
    const [floatingItems, setFloatingItems] = useState<{ id: string, label: string, icon: string, amount: number }[]>([]);
    const prevResourcesRef = React.useRef<Record<string, number> | null>(null);
    const initialLoadRef = React.useRef(true);

    useEffect(() => {
        if (!player || !player.resources) return;

        if (initialLoadRef.current) {
            prevResourcesRef.current = { ...player.resources };
            initialLoadRef.current = false;
            return;
        }

        const prev = prevResourcesRef.current || {};
        const current = player.resources;
        const newItems: { id: string, label: string, icon: string, amount: number }[] = [];

        Object.keys(current).forEach((key) => {
            // Only care about increases
            const diff = (current[key as keyof typeof current] || 0) - (prev[key as keyof typeof prev] || 0);
            if (diff > 0 && key !== 'manpower') { // Ignore manpower usually not floating
                const details = (RESOURCE_DETAILS as any)[key] || { label: key, icon: '📦' };
                newItems.push({
                    id: Math.random().toString(36).substr(2, 9),
                    label: details.label,
                    icon: details.icon,
                    amount: diff
                });
            }
        });

        if (newItems.length > 0) {
            setFloatingItems(prevItems => [...prevItems, ...newItems]);
            // Auto remove after animation
            setTimeout(() => {
                setFloatingItems(prevItems => prevItems.slice(newItems.length));
            }, 2000);
        }

        prevResourcesRef.current = { ...player.resources };
    }, [player?.resources]);

    // --- LEVEL UP SYSTEM ---
    const prevXpRef = React.useRef<number | null>(null);
    useEffect(() => {
        if (!player) return;
        const currentXp = player.stats.xp || 0;

        if (prevXpRef.current === null) {
            prevXpRef.current = currentXp;
            return;
        }

        const getLevel = (xp: number) => {
            const index = LEVEL_XP.findIndex(req => xp < req);
            return index === -1 ? LEVEL_XP.length : index;
        };

        const oldLevel = getLevel(prevXpRef.current);
        const newLevel = getLevel(currentXp);

        if (newLevel > oldLevel) {
            const titles = ROLE_TITLES[player.role as keyof typeof ROLE_TITLES] || [];
            const newTitle = titles[newLevel - 1] || titles[titles.length - 1] || player.role;
            setLevelUpData({ level: newLevel, title: newTitle });
        }

        prevXpRef.current = currentXp;
    }, [player?.stats.xp, player?.role]); // Deep check usually needed but player object changes ref every update
    // -------------------------------

    const handleAction = async (action: any) => {
        if (!pin || !player || actionLoading) return;

        const actionType = typeof action === 'string' ? action : action.type;

        // Trigger Minigame for work/chop/mill/craft/defend/explore/mine/quarry/patrol/forage if not already in one
        const minigameTypes = ['WORK', 'CHOP', 'MILL', 'CRAFT', 'DEFEND', 'EXPLORE', 'MINE', 'QUARRY', 'PATROL', 'FORAGE'];
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
        <div className="relative min-h-screen bg-slate-900 text-white overflow-hidden flex flex-col">
            {impersonateId && (
                <div className="fixed top-0 inset-x-0 z-[2000] bg-rose-600 text-white px-4 py-1.5 flex items-center justify-between font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl border-b border-white/20">
                    <div className="flex items-center gap-4">
                        <span className="animate-pulse flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full" />
                            ADMIN KONTROLL AKTIV
                        </span>
                        <span className="opacity-40">|</span>
                        <span>Styrer: <span className="text-rose-200">{player.name}</span> ({player.role})</span>
                    </div>
                    <button
                        onClick={() => window.close()}
                        className="bg-black/20 hover:bg-black/40 px-3 py-1 rounded-full transition-all hover:scale-105 active:scale-95 border border-white/10"
                    >
                        Avslutt & Lukk ✕
                    </button>
                </div>
            )}

            {room.status === 'LOBBY' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" >
                    <div className="animate-bounce text-6xl mb-8">⏳</div>
                    <h1 className="text-4xl font-black mb-4 tracking-tighter">Venter på Kongen...</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                        Du er registrert som <strong className="text-white text-base block mt-2">{player.name}</strong>
                    </p>
                </div>
            ) : (
                <div className={`flex-1 flex flex-col relative ${impersonateId ? 'pt-8' : ''}`}>
                    <div className="fixed inset-0 top-16 bg-slate-950 text-slate-200 flex overflow-hidden font-sans selection:bg-indigo-500/30">
                        {/* Background Atmosphere */}
                        <div className="fixed inset-0 pointer-events-none opacity-20">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />
                        </div>

                        {/* Minigame Overlay */}
                        {
                            activeMinigame && (
                                <MinigameOverlay
                                    type={activeMinigame}
                                    playerUpgrades={player.upgrades}
                                    onComplete={(score) => handleAction({ type: activeMinigame, performance: score })}
                                    onCancel={() => setActiveMinigame(null)}
                                />
                            )
                        }

                        {/* FLOATING RESOURCES ANIMATION LAYER */}
                        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                            {floatingItems.map((item, i) => (
                                <div
                                    key={item.id}
                                    className="absolute left-1/2 top-1/2 flex items-center gap-2 px-4 py-2 bg-slate-900/90 border border-amber-500/30 rounded-full shadow-2xl animate-fly-resource"
                                    style={{
                                        animationDelay: `${i * 100}ms`,
                                        animationFillMode: 'forwards'
                                    }}
                                >
                                    <span className="text-3xl filter drop-shadow-md">{item.icon}</span>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-amber-400 font-black text-lg">+{item.amount}</span>
                                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">{item.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <style>{`
                @keyframes fly-resource {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    10% { opacity: 1; transform: translate(-50%, -150%) scale(1.2); }
                    80% { opacity: 1; transform: translate(-40vw, 0) scale(0.8); }
                    100% { opacity: 0; transform: translate(-45vw, 10vh) scale(0); }
                }
                .animate-fly-resource {
                    animation: fly-resource 1.5s cubic-bezier(0.22, 1, 0.36, 1);
                }
            `}</style>

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
                                    { id: 'PROFILE', label: 'Profil', icon: '👤' },
                                    { id: 'VILLAGE', label: 'Byggeprosjekter', icon: '🏗️' },
                                    { id: 'SKILLS', label: 'Ferdigheter', icon: '📜' },
                                    { id: 'DIPLOMACY', label: 'Diplomati', icon: '🕊️' },
                                    { id: 'HIERARCHY', label: 'Struktur', icon: '🏛️' },
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
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                    {/* BARONY BADGE */}
                                    {player.regionId && player.regionId !== 'capital' && (
                                        <div className="hidden md:flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
                                            <span className="text-xl">🏰</span>
                                            <div>
                                                <div className="text-[8px] font-black uppercase text-indigo-400 tracking-widest leading-none mb-0.5">Baroni</div>
                                                <div className="text-sm font-black text-white leading-none">
                                                    {room.regions?.[player.regionId]?.name || player.regionId}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* KINGDOM BADGE */}
                                    <div className="hidden md:flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
                                        <span className="text-xl">👑</span>
                                        <div>
                                            <div className="text-[8px] font-black uppercase text-amber-500 tracking-widest leading-none mb-0.5">Kongerike</div>
                                            <div className="text-sm font-black text-white leading-none">
                                                {room.players?.[Object.keys(room.players).find(id => room.players[id].role === 'KING') || '']?.name
                                                    ? `Kong ${room.players[Object.keys(room.players).find(id => room.players[id].role === 'KING') || ''].name}s Rike`
                                                    : 'Kongeriket'}
                                            </div>
                                        </div>
                                    </div>
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
                                        {activeTab === 'MARKET' ? (
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-end border-b-2 border-white/5 pb-4">
                                                    <h2 className="text-4xl font-black text-white tracking-tighter">Markedshandel</h2>
                                                    <div className="text-amber-500 font-black text-2xl">💰 {(player.resources.gold || 0).toFixed(2)}g</div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {Object.entries((room.markets?.[player.regionId || 'capital'] || room.market) || {}).map(([resId, item]: [string, any]) => {
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

                                                {/* MERCHANT: FOREIGN MARKETS */}
                                                {player.role === 'MERCHANT' && (
                                                    <div className="mt-12 space-y-6">
                                                        <h3 className="text-2xl font-black text-white flex items-center gap-2">
                                                            <span>🚢</span> Handelsruter (Andre Baronier)
                                                            <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-1 rounded-full uppercase ml-auto">Sanntids prising</span>
                                                        </h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                            {Object.values(room.regions || {})
                                                                .concat([{ id: 'capital', name: 'Kongeriket (Hovedstaden)' } as any])
                                                                .filter((r: any) => r.id !== player.regionId && r.id !== undefined)
                                                                .map((region: any) => {
                                                                    const targetMarket = room.markets?.[region.id];
                                                                    if (!targetMarket) return null;

                                                                    return (
                                                                        <div key={region.id} className="bg-indigo-900/10 border border-indigo-500/10 p-6 rounded-[2rem]">
                                                                            <div className="text-xl font-black text-white mb-4 border-b border-white/5 pb-2 truncate" title={region.name}>{region.name}</div>
                                                                            <div className="space-y-4">
                                                                                {['grain', 'wood', 'iron'].map(res => {
                                                                                    const item = (targetMarket as any)[res];
                                                                                    if (!item) return null;
                                                                                    const foreignPrice = item.price;
                                                                                    const label = (RESOURCE_DETAILS as any)[res]?.label || res;
                                                                                    const icon = (RESOURCE_DETAILS as any)[res]?.icon || '📦';

                                                                                    return (
                                                                                        <div key={res} className="flex justify-between items-center bg-slate-900/50 p-2 rounded-xl">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span>{icon}</span>
                                                                                                <div className="text-xs font-bold text-slate-400">{label}</div>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="text-amber-500 font-black">{foreignPrice.toFixed(0)}g</span>
                                                                                                <div className="flex flex-col gap-1">
                                                                                                    <button
                                                                                                        onClick={() => handleAction({ type: 'TRADE_ROUTE', targetRegionId: region.id, resource: res, action: 'IMPORT' })}
                                                                                                        disabled={!!actionLoading}
                                                                                                        className="px-2 py-0.5 bg-emerald-600/20 text-emerald-400 text-[10px] font-black rounded hover:bg-emerald-600 hover:text-white transition-colors"
                                                                                                    >
                                                                                                        IMP
                                                                                                    </button>
                                                                                                    <button
                                                                                                        onClick={() => handleAction({ type: 'TRADE_ROUTE', targetRegionId: region.id, resource: res, action: 'EXPORT' })}
                                                                                                        disabled={!!actionLoading}
                                                                                                        className="px-2 py-0.5 bg-rose-600/20 text-rose-400 text-[10px] font-black rounded hover:bg-rose-600 hover:text-white transition-colors"
                                                                                                    >
                                                                                                        EKSP
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                        </div>
                                                    </div>
                                                )}
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
                                            </div>
                                        ) : activeTab === 'VILLAGE' ? (
                                            <div className="w-full h-full min-h-[500px] flex flex-col gap-6">
                                                <div className="flex justify-between items-center bg-slate-900/60 p-6 rounded-[2rem] border border-white/10">
                                                    <div>
                                                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">🏗️ Byggeprosjekter</h2>
                                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Landsbyens ekspansjon & vedlikehold</p>
                                                    </div>
                                                </div>
                                                <div className="flex-1 relative rounded-[3rem] overflow-hidden border-2 border-white/5 shadow-2xl">
                                                    <WorldMap
                                                        player={player}
                                                        room={room}
                                                        onAction={handleAction}
                                                        onOpenMarket={() => setActiveTab('MARKET')}
                                                        initialViewMode="village_construction"
                                                    />
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
                                                            if (((player.resources as any)[res] || 0) < (amt as number)) canAfford = false;
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
                                                                    className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${isOwned ? 'bg-emerald-600/10 text-emerald-500 cursor-default' : canAfford ? 'bg-indigo-600 text-white shadow-xl hover:bg-indigo-500' : 'bg-slate-700 text-slate-500 opacity-50'}`}
                                                                >
                                                                    {isOwned ? '✅ AKTIV' : canAfford ? 'KJØP OPPGRADERING' : 'MANGLER RESSURSER'}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : activeTab === 'SKILLS' ? (
                                            <div className="space-y-8 pb-20">
                                                <h2 className="text-4xl font-black text-white tracking-tighter border-b-2 border-white/5 pb-4">Mine Ferdigheter</h2>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {/* XP and Titles Summary */}
                                                    <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/10">
                                                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                                                            <span className="text-2xl">📜</span> Rang & Erfaring
                                                        </h3>
                                                        <div className="space-y-6">
                                                            <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Gjeldende Tittel</div>
                                                                <div className="text-3xl font-black text-white">{roleTitle}</div>
                                                            </div>
                                                            <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Erfaring</div>
                                                                <div className="text-3xl font-black text-indigo-400">{player.stats.xp} XP</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Passive Bonuses Overview */}
                                                    <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/10">
                                                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                                                            <span className="text-2xl">✨</span> Passive Bonuser
                                                        </h3>
                                                        <div className="space-y-4">
                                                            {(player.upgrades || []).map(id => {
                                                                const upg = (UPGRADES_LIST as any)[player.role]?.find((u: any) => u.id === id);
                                                                if (!upg) return null;
                                                                return (
                                                                    <div key={id} className="flex items-center gap-4 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                                                                        <span className="text-2xl">⚡</span>
                                                                        <div>
                                                                            <div className="font-bold text-emerald-400 text-sm">{upg.name}</div>
                                                                            <div className="text-[10px] text-slate-400 font-medium italic">{upg.benefit}</div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            {(!player.upgrades || player.upgrades.length === 0) && (
                                                                <div className="text-center text-slate-500 italic py-8">Lås opp oppgraderinger for å se bonuser her...</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : activeTab === 'DIPLOMACY' ? (
                                            <div className="space-y-6 h-full flex flex-col">
                                                <h2 className="text-4xl font-black text-white tracking-tighter border-b-2 border-white/5 pb-4 flex items-center justify-between">
                                                    Diplomati
                                                    <span className="text-xs font-black uppercase text-indigo-500 tracking-widest bg-indigo-500/10 px-4 py-1 rounded-full">Kryptert Kanal</span>
                                                </h2>

                                                <div className="flex-1 min-h-[400px] flex flex-col gap-4 p-6 bg-black/20 rounded-3xl border border-white/5 overflow-y-auto custom-scrollbar">
                                                    {room.diplomacy ? Object.values(room.diplomacy)
                                                        .filter((m: any) => m.receiverId === 'ALL_RULERS' || m.receiverId === player.id || m.senderId === player.id)
                                                        .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
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
                                                <div className="flex justify-end px-8">
                                                    {player.role !== 'PEASANT' && (
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm('Er du sikker? Du vil miste din rang og bli en simpel bonde.')) {
                                                                    handleAction({ type: 'RETIRE' });
                                                                }
                                                            }}
                                                            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors border border-slate-700 hover:border-rose-500 px-4 py-2 rounded-lg"
                                                        >
                                                            Frasi Tittel (Bli Bonde)
                                                        </button>
                                                    )}
                                                </div>
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
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 h-12 w-1 bg-gradient-to-b from-amber-600 to-slate-700 opacity-50"></div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* 2. THE NOBILITY & SUBJECTS */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative pt-8">
                                                    <div className="absolute top-0 left-10 right-10 h-1 bg-slate-700 opacity-30 rounded-full"></div>
                                                    {Object.values(room.players || {}).filter(p => p.role === 'BARON').map(baron => (
                                                        <div key={baron.id} className="flex flex-col gap-4 relative">
                                                            <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 h-8 w-1 bg-slate-700 opacity-30"></div>
                                                            <div className="bg-slate-800/80 p-6 rounded-3xl border border-white/5 shadow-xl relative z-10">
                                                                <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-4">
                                                                    <div className="text-4xl">🏰</div>
                                                                    <div>
                                                                        <h4 className="text-lg font-black text-white">{baron.name}</h4>
                                                                        <div className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{getRegionName(baron.regionId)}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Underståtte</div>
                                                                    {Object.values(room.players || {}).filter(p => (p.role === 'PEASANT' || p.role === 'SOLDIER') && p.regionId === baron.regionId).map(subject => (
                                                                        <div key={subject.id} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                                                                            <div className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-lg text-lg shadow-inner">
                                                                                {subject.role === 'SOLDIER' ? '⚔️' : '🌾'}
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <div className="text-sm font-bold text-slate-200">{subject.name}</div>
                                                                                <div className="text-[10px] uppercase text-slate-500 font-bold">{subject.role === 'SOLDIER' ? 'Soldat' : 'Bonde'}</div>
                                                                            </div>
                                                                            <div className={`w-2 h-2 rounded-full ${subject.lastActive > Date.now() - 60000 ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-slate-600'}`}></div>
                                                                        </div>
                                                                    ))}
                                                                    {Object.values(room.players || {}).filter(p => (p.role === 'PEASANT' || p.role === 'SOLDIER') && p.regionId === baron.regionId).length === 0 && (
                                                                        <div className="text-xs text-slate-600 italic text-center py-4">Ingen undersåtter ennå...</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
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
                                                                        <div className="flex-1">
                                                                            <div className="text-sm font-bold text-slate-300">{free.name}</div>
                                                                            <div className="text-[10px] uppercase text-slate-500 font-bold">{free.role}</div>
                                                                        </div>
                                                                        <div className={`w-2 h-2 rounded-full ${free.lastActive > Date.now() - 60000 ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : activeTab === 'PROFILE' ? (
                                            <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/60 p-8 rounded-[3rem] border border-white/10 relative overflow-hidden shadow-2xl">
                                                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                                                        <div className="w-32 h-32 bg-slate-800 rounded-3xl flex items-center justify-center text-6xl border-4 border-amber-500/30">
                                                            {player.role === 'KING' ? '👑' : player.role === 'BARON' ? '🏰' : player.role === 'SOLDIER' ? '⚔️' : '🌾'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                                                <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{player.name}</h2>
                                                                <span className="bg-amber-500 text-slate-950 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">{player.role}</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-4 text-slate-400 font-bold text-sm">
                                                                <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">Nivå {player.stats.level}</span>
                                                                <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">{player.stats.xp} Totalt XP</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-8 pt-8 border-t border-white/5">
                                                        <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                            <div className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${(player.stats.xp % 100)}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/10">
                                                        <h3 className="text-xl font-black text-white mb-8 tracking-widest uppercase flex items-center gap-3">🛡️ Utstyr</h3>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {['HEAD', 'BODY', 'WEAPON', 'TOOL'].map(slot => (
                                                                <div key={slot} className="p-4 rounded-3xl border-2 border-white/5 bg-black/20 flex flex-col items-center justify-center min-h-[140px]">
                                                                    <span className="text-3xl opacity-20 grayscale">📦</span>
                                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{slot}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/10">
                                                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">📜 Krønike</h3>
                                                        <div className="space-y-4">
                                                            {(player.history || []).map((entry, idx) => (
                                                                <div key={idx} className="border-l-2 border-indigo-500/20 pl-4 py-1 text-xs text-slate-300 italic">"{entry}"</div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
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
                        </main>

                        {/* RIGHT PANEL: INFO & FEED */}
                        <aside className="w-80 border-l border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col z-20" >
                            <div className="p-6 border-b border-white/5">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-6 flex items-center justify-between">
                                    Sekkens Innhold
                                    <span className="text-[8px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-300">{(Object.keys(player.resources || {}).filter(k => (player.resources as any)[k] > 0).length)} Typer</span>
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(player.resources || {}).map(([resId, amount]) => {
                                        if (resId === 'gold') return null;
                                        const details = (RESOURCE_DETAILS as any)[resId] || { label: resId, icon: '📦' };
                                        if ((amount as number) <= 0) return null;
                                        return (
                                            <div key={resId} className="flex flex-col items-center justify-center bg-black/40 p-5 rounded-2xl border border-white/5 group relative hover:bg-slate-800 transition-all shadow-inner">
                                                <span className="text-4xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md mb-2">{details.icon}</span>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-3xl font-black text-white leading-none">{amount as number}</span>
                                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">{details.label}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Total Beholdning</span>
                                    <div className="text-amber-500 font-black text-2xl drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">{(player.resources.gold || 0).toFixed(2)}g</div>
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
                                            <p className="text-[11px] font-medium leading-relaxed text-slate-300 antialiased line-clamp-3 overflow-hidden leading-tight font-serif opacity-90">{msg}</p>
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
                                        <span className="text-white font-bold">{getRegionName(player.regionId)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-black text-slate-500 uppercase tracking-widest leading-none">Legitimitet</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" style={{ width: `${player.status.legitimacy || 100}% ` }}></div>
                                            </div>
                                            <span className="text-white font-bold">{player.status.legitimacy || 100}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>

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
                </div >
            )}

            {
                levelUpData && (
                    <LevelUpOverlay
                        level={levelUpData.level}
                        title={levelUpData.title}
                        onClose={() => setLevelUpData(null)}
                    />
                )
            }
        </div >
    );
};

const LevelUpOverlay: React.FC<{ level: number, title: string, onClose: () => void }> = ({ level, title, onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-1 rounded-[2.5rem] shadow-[0_0_50px_rgba(245,158,11,0.5)] animate-in zoom-in duration-500">
                <div className="bg-white rounded-[2.2rem] p-10 text-center relative overflow-hidden max-w-sm">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200" />

                    <div className="relative z-10">
                        <div className="text-7xl mb-6 animate-bounce">🎊</div>
                        <h2 className="text-sm font-black text-amber-600 uppercase tracking-[0.3em] mb-2">Nivå Oppnådd!</h2>
                        <h3 className="text-6xl font-black text-slate-800 mb-4">Nivå {level}</h3>

                        <div className="h-0.5 w-16 bg-slate-200 mx-auto mb-6" />

                        <p className="text-slate-500 font-medium mb-1">Ny Tittel:</p>
                        <p className="text-3xl font-black text-indigo-600 mb-8">{title}</p>

                        <button
                            onClick={onClose}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95"
                        >
                            FORTSETT REISEN
                        </button>
                    </div>

                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-amber-500 rounded-full animate-ping"
                                style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${2 + Math.random() * 2}s`
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes ping-slow {
                        0% { transform: scale(1); opacity: 0.8; }
                        100% { transform: scale(3); opacity: 0; }
                    }
                `}} />
        </div>
    );
};
