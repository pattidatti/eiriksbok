import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';

import { useLayout } from '../../context/LayoutContext';

import { simulationDb as db } from './simulationFirebase';
import type { SimulationPlayer as SimulationPlayerType, SimulationRoom, ActionResult } from './simulationTypes';
import { LEVEL_XP, ROLE_TITLES, RESOURCE_DETAILS, ROLE_DEFINITIONS } from './constants';

import { performAction } from './actions';
import { MinigameOverlay } from './SimulationMinigames';
import { SimulationProvider, useSimulation } from './SimulationContext';
import { checkActionRequirements } from './utils/actionUtils';

import { ActionResultOverlay } from './components/ActionResultOverlay';

// Components
import { SimulationHeader } from './components/SimulationHeader';
import { SimulationSidebar } from './components/SimulationSidebar';
import { SimulationViewport } from './components/SimulationViewport';

export const SimulationPlayer: React.FC = () => {
    return (
        <SimulationProvider>
            <SimulationGame />
        </SimulationProvider>
    );
};

const SimulationGame: React.FC = () => {
    const { pin } = useParams();
    const [searchParams] = useSearchParams();
    const impersonateId = searchParams.get('impersonate');
    const {
        activeMinigame, setActiveMinigame,
        activeMinigameMethod, setActiveMinigameMethod,
        activeMinigameAction, setActiveMinigameAction,
        actionLoading, setActionLoading

    } = useSimulation();

    // Data State
    const [player, setPlayer] = useState<SimulationPlayerType | null>(null);
    const [room, setRoom] = useState<SimulationRoom | null>(null);
    const [levelUpData, setLevelUpData] = useState<{ level: number, title: string } | null>(null);
    const [actionResult, setActionResult] = useState<ActionResult | null>(null);

    // Layout Context
    const { setFullWidth } = useLayout();
    useEffect(() => {
        setFullWidth(true);
        return () => setFullWidth(false);
    }, [setFullWidth]);

    // Data Fetching
    useEffect(() => {
        const playerId = impersonateId || localStorage.getItem('sim_player_id');
        if (!playerId || !pin) return;

        const playerRef = ref(db, `simulation_rooms/${pin}/players/${playerId}`);
        const roomRef = ref(db, `simulation_rooms/${pin}`);

        const unsubPlayer = onValue(playerRef, (snap) => {
            const data = snap.val();
            if (data) setPlayer({ ...data, id: playerId });
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

    // Title Update
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
    const prevResourcesRef = useRef<Record<string, number> | null>(null);
    const initialLoadRef = useRef(true);

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
            const diff = (current[key as keyof typeof current] || 0) - (prev[key as keyof typeof prev] || 0);
            if (diff > 0 && key !== 'manpower') {
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
            setTimeout(() => {
                setFloatingItems(prevItems => prevItems.slice(newItems.length));
            }, 2000);
        }

        prevResourcesRef.current = { ...player.resources };
    }, [player?.resources]);

    // --- LEVEL UP SYSTEM ---
    const prevXpRef = useRef<number | null>(null);
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
    }, [player?.stats.xp, player?.role]);

    // --- LEVEL SYNC (RETROACTIVE) ---
    useEffect(() => {
        if (!player || !pin || !player.id) return;

        const getLevel = (xp: number) => {
            const index = LEVEL_XP.findIndex(req => xp < req);
            return index === -1 ? LEVEL_XP.length : index;
        };

        const correctLevel = getLevel(player.stats.xp || 0);
        if ((player.stats.level || 1) !== correctLevel) {
            const statsRef = ref(db, `simulation_rooms/${pin}/players/${player.id}/stats`);
            update(statsRef, { level: correctLevel });
        }
    }, [player?.stats.xp, pin, player?.id, player?.stats?.level]);



    // --- ACTION HANDLER ---
    const handleAction = async (action: any) => {
        if (!pin || !player || actionLoading) return;

        const actionType = typeof action === 'string' ? action : action.type;
        const actionMethod = typeof action === 'object' ? action.method : null;

        const minigameTypes = ['WORK', 'CHOP', 'CRAFT', 'MILL', 'DEFEND', 'EXPLORE', 'MINE', 'QUARRY', 'PATROL', 'FORAGE', 'REFINE', 'SMELT', 'BAKE', 'WEAVE', 'MIX'];

        if (minigameTypes.includes(actionType) && !activeMinigame && (!action.performance)) {
            // PRE-CHECK REQUIREMENTS
            const currentSeason = (room?.world?.season || 'Spring') as any;
            const currentWeather = (room?.world?.weather || 'Clear') as any;

            // We must temporarily map "REFINE" to the specific cost ID if needed, 
            // but checkActionRequirements handles the 'action.id' vs 'action.type' 
            // The tooltip uses action.id. Here we use action object which should contain the ID.

            const check = checkActionRequirements(player, action, currentSeason, currentWeather);
            if (!check.success) {
                alert(`Du har ikke råd til dette: ${check.reason}`);
                setActionResult({
                    success: false,
                    timestamp: Date.now(),
                    message: `Kan ikke utføre: ${check.reason}`,
                    yields: [],
                    xp: [],
                    durability: []
                });
                return;
            }

            let actualType = actionType;

            // Map refined actions to thematic games
            if (actionType === 'REFINE') {
                if (action.recipeId === 'flour') actualType = 'MILL';
                if (action.recipeId === 'iron_ingot') actualType = 'SMELT';
                if (action.recipeId === 'bread' || action.recipeId === 'pie' || action.recipeId === 'mead') actualType = 'BAKE';
                if (action.recipeId === 'cloth') actualType = 'WEAVE';
            }
            if (actionType === 'CRAFT' && (action.id === 'CRAFT_MEDICINE' || action.id === 'CRAFT_POISON')) {
                actualType = 'MIX';
            }

            setActiveMinigame(actualType as any);
            if (actionMethod) setActiveMinigameMethod(actionMethod);
            setActiveMinigameAction(action);
            return;
        }


        setActionLoading(actionType);
        const result = await performAction(pin, player.id, action);

        if (result.data) {
            setActionResult(result.data);
        } else if (!result.success) {
            // Fallback error if no data
            setActionResult({
                success: false,
                timestamp: Date.now(),
                message: "Handlingen feilet (ukjent feil)",
                yields: [],
                xp: [],
                durability: []
            });
        }

        setActionLoading(null);
        setActiveMinigame(null);
        setActiveMinigameAction(null);
        setActiveMinigameMethod(null);

    };

    if (!player || !room) return <div className="p-8 text-center text-white">Laster data...</div>;


    // --- RENDER ---
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
                                    equipment={Object.values(player.equipment || {})}
                                    skills={player.skills}
                                    selectedMethod={activeMinigameMethod || undefined}
                                    onComplete={(score) => handleAction({ ...(activeMinigameAction || {}), type: activeMinigame, performance: score, method: activeMinigameMethod })}
                                    onCancel={() => { setActiveMinigame(null); setActiveMinigameAction(null); setActiveMinigameMethod(null); }}

                                    currentSeason={(room.world?.season || 'Spring') as any}
                                    currentWeather={(room.world?.weather || 'Clear') as any}
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

                        <div className="flex flex-col h-full w-full">
                            {/* TOP HEADER */}
                            <SimulationHeader room={room} player={player} pin={pin} />

                            {/* MAIN ROW */}
                            <div className="flex flex-1 overflow-hidden">
                                <SimulationSidebar player={player} room={room} />
                                <SimulationViewport player={player} room={room} pin={pin} onAction={handleAction} />
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {levelUpData && (
                <LevelUpOverlay
                    level={levelUpData.level}
                    title={levelUpData.title}
                    onClose={() => setLevelUpData(null)}
                />
            )}

            <ActionResultOverlay
                result={actionResult}
                onClear={() => setActionResult(null)}
            />
        </div>
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
